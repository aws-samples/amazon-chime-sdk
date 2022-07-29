/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/* eslint-disable no-use-before-define */
/* eslint-disable import/no-unresolved */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import {
  PopOverItem,
  PopOverSeparator,
  PopOverSubMenu,
  IconButton,
  Dots,
  useNotificationDispatch,
  useMeetingManager,
  ChannelList,
  ChannelItem,
} from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';
import { useHistory } from 'react-router-dom';
import {
  Persistence,
  MessageType,
  associateChannelFlow,
  createMemberArn,
  createChannelMembership,
  createChannel,
  updateChannel,
  listChannelMessages,
  sendChannelMessage,
  listChannels,
  listChannelMembershipsForAppInstanceUser,
  deleteChannel,
  describeChannel,
  listChannelMemberships,
  deleteChannelMembership,
  listChannelModerators,
  listChannelBans,
  createChannelBan,
  deleteChannelBan,
  createMeeting,
  createAttendee,
  endMeeting,
  createGetAttendeeCallback,
  describeChannelFlow,
  disassociateChannelFlow,
} from '../../api/ChimeAPI';
import appConfig from '../../Config';

import { useUserPermission } from '../../providers/UserPermissionProvider';
import mergeArrayOfObjects from '../../utilities/mergeArrays';
import {
  useChatChannelState,
  useChatMessagingState,
} from '../../providers/ChatMessagesProvider';
import { useAppState } from '../../providers/AppStateProvider';
import { useAuthContext } from '../../providers/AuthProvider';
import ModalManager from './ModalManager';
import routes from '../../constants/routes';

import {
  PresenceAutoStatus,
  PresenceMode,
  PresenceStatusPrefix,
  PUBLISH_INTERVAL,
  toPresenceMap,
  toPresenceMessage,
} from "../../utilities/presence";

import './ChannelsWrapper.css';

const ChannelsWrapper = () => {
  const history = useHistory();
  const meetingManager = useMeetingManager();
  const dispatch = useNotificationDispatch();
  const [modal, setModal] = useState('');
  const [selectedMember, setSelectedMember] = useState({}); // TODO change to an empty array when using batch api
  const [activeChannelModerators, setActiveChannelModerators] = useState([]);
  const [banList, setBanList] = useState([]);
  const { userId } = useAuthContext().member;
  const { member, isAuthenticated } = useAuthContext();
  const userPermission = useUserPermission();
  const isAuthenticatedRef = useRef(isAuthenticated);
  const messagingUserArn = `${appConfig.appInstanceArn}/user/${userId}`;
  const {
    activeChannelRef,
    channelList,
    channelListRef,
    setChannelList,
    setActiveChannel,
    activeChannel,
    activeChannelMemberships,
    setActiveChannelMemberships,
    setChannelMessageToken,
    unreadChannels,
    setUnreadChannels,
    hasMembership,
    meetingInfo,
    setMeetingInfo,
    activeChannelFlow,
    setActiveChannelFlow,
  } = useChatChannelState();
  const { setMessages } = useChatMessagingState();
  const { setAppMeetingInfo } = useAppState();

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  });

  // get all channels
  useEffect(() => {
    if (!userId) return;
    const fetchChannels = async () => {
      const userChannelMemberships = await listChannelMembershipsForAppInstanceUser(
        userId
      );
      const userChannelList = userChannelMemberships.map(
        (channelMembership) => channelMembership.ChannelSummary
      );
      const publicChannels = await listChannels(
        appConfig.appInstanceArn,
        userId
      );

      setChannelList(
        mergeArrayOfObjects(userChannelList, publicChannels, 'ChannelArn')
      );
      await publishStatusToAllChannels();
    };
    fetchChannels();
  }, [userId]);

  // get channel memberships
  useEffect(() => {
    if (activeChannel.ChannelArn) {
      activeChannelRef.current = activeChannel;
      fetchMemberships();
      publishStatusToAllChannels();
    }
  }, [activeChannel.ChannelArn]);

  // track channel presence
  useEffect(() => {
    if (channelList.length > 0) {
      channelListRef.current = channelList;
      startPublishStatusWithInterval();
    }
  }, [channelList]);

  // get meeting id
  useEffect(() => {
    if (meetingInfo) {
      setModal('JoinMeeting');
    }
  }, [meetingInfo]);

  function startPublishStatusWithInterval() {
    let publishTimeout;
    (async function publishStatusWithInterval() {
      if (!isAuthenticatedRef.current) {
        clearTimeout(publishTimeout);
        return;
      }
      await publishStatusToAllChannels();
      publishTimeout = setTimeout(publishStatusWithInterval, PUBLISH_INTERVAL);
    })();
  }

  function computeAutoStatusForAChannel(channel) {
    const persistedPresence = JSON.parse(channel.Metadata || '{}').Presence;
    const isCustomStatus = persistedPresence && persistedPresence.filter(p => p.u === userId)[0];
    if (isCustomStatus) {
      return null;
    }

    if (location.pathname.includes(routes.MEETING)) {
      return PresenceAutoStatus.Busy;
    } else if (channel.ChannelArn === activeChannelRef.current.ChannelArn) {
      return PresenceAutoStatus.Online;
    } else {
      return PresenceAutoStatus.Idle;
    }
  }

  async function publishStatusToAllChannels() {
    const servicePromises = [];
    for (const channel of channelListRef.current) {
      const status = computeAutoStatusForAChannel(channel);
      if (status) {
        servicePromises.push(sendChannelMessage(
          channel.ChannelArn,
          toPresenceMessage(PresenceMode.Auto, status, true),
          Persistence.NON_PERSISTENT,
          MessageType.CONTROL,
          member,
        ));
      }
    }
    return await Promise.all(servicePromises);
  }

  const getBanList = async () => {
    const banListResponse = await listChannelBans(
      activeChannel.ChannelArn,
      50,
      null,
      userId
    );
    setBanList(banListResponse.ChannelBans.map((m) => m.Member.Arn));
  };

  const banUser = async (memberArn) => {
    try {
      await createChannelBan(activeChannel.ChannelArn, memberArn, userId);
      const newBanList = banList.concat(...banList, memberArn);
      setBanList(newBanList);
      dispatch({
        type: 0,
        payload: {
          message: 'Successfully banned user.',
          severity: 'success',
        },
      });
    } catch {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, unable to perform this action.',
          severity: 'error',
        },
      });
    }
  };

  const unbanUser = async (memberArn) => {
    await deleteChannelBan(activeChannel.ChannelArn, memberArn, userId);
    await getBanList();
  };

  useEffect(() => {
    if (activeChannel.ChannelArn && modal === 'Ban') {
      getBanList();
    }
  }, [activeChannel.ChannelArn, modal]);

  const onCreateChannel = async (e, newName, mode, privacy) => {
    e.preventDefault();
    if (!newName) {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, channel name cannot be blank.',
          severity: 'error',
        },
      });
    } else {
      const channelArn = await createChannel(
        appConfig.appInstanceArn,
        null,
        newName,
        mode,
        privacy,
        userId
      );
      if (channelArn) {
        const channel = await describeChannel(channelArn, userId);
        setModal('');
        if (channel) {
          setChannelList([...channelList, channel]);
          dispatch({
            type: 0,
            payload: {
              message: 'Successfully created channel.',
              severity: 'success',
              autoClose: true,
            },
          });
          setActiveChannel(channel);
          channelIdChangeHandler(channel.ChannelArn);
        } else {
          dispatch({
            type: 0,
            payload: {
              message: 'Error, could not retrieve channel information.',
              severity: 'error',
              autoClose: false,
            },
          });
        }
      } else {
        dispatch({
          type: 0,
          payload: {
            message: 'Error, could not create new channel.',
            severity: 'error',
            autoClose: false,
          },
        });
      }
    }
  };

  const joinMeeting = async (e) => {
    e.preventDefault();

    if (activeChannel.Metadata) {
      let metadata = JSON.parse(activeChannel.Metadata);
      let meeting = metadata.meeting;

      // Create own attendee and join meeting
      meetingManager.getAttendee = createGetAttendeeCallback();
      const { JoinInfo } = await createAttendee(member.username, member.userId, activeChannel.ChannelArn, meeting);
      const meetingSessionConfiguration = new MeetingSessionConfiguration(
        JoinInfo.Meeting,
        JoinInfo.Attendee
      );
      await meetingManager.join(meetingSessionConfiguration);

      setAppMeetingInfo(JoinInfo.Meeting.MeetingId, member.username);
      history.push(routes.DEVICE);
    }
  };

  const startMeeting = async (e) => {
    e.preventDefault();

    let meetingName = `${activeChannel.Name} Instant Meeting`;

    // Create Meeting Channel and Memberships from existing Channel
    const meetingChannelArn = await createChannel(
      appConfig.appInstanceArn,
      null,
      meetingName,
      'RESTRICTED',
      'PRIVATE',
      userId
    );
    channelIdChangeHandler(meetingChannelArn);

    const memberships = activeChannelMemberships;
    memberships.forEach(membership => createChannelMembership(
      meetingChannelArn,
      membership.Member.Arn,
      userId
    ));

    // Create meeting and attendee for self
    meetingManager.getAttendee = createGetAttendeeCallback();
    const { JoinInfo } = await createMeeting(member.username, member.userId, meetingChannelArn);
    const meetingSessionConfiguration = new MeetingSessionConfiguration(
      JoinInfo.Meeting,
      JoinInfo.Attendee
    );
    await meetingManager.join(meetingSessionConfiguration);

    const meetingId = JoinInfo.Meeting.MeetingId;
    const meeting = JSON.stringify(JoinInfo.Meeting);

    // Update meeting channel metadata with meeting info
    let meetingChannelmetadata = {
      isMeeting: true,
      meeting: meeting
    };

    await updateChannel(
      meetingChannelArn,
      meetingName,
      'RESTRICTED',
      JSON.stringify(meetingChannelmetadata),
      userId
    );

    // Send the meeting info as a chat message in the existing channel
    const options = {};
    options.Metadata = `{"isMeetingInfo":true}`;
    let meetingInfoMessage = {
      meeting: meeting,
      channelArn: meetingChannelArn,
      channelName: meetingName,
      inviter: member.username,
    };
    await sendChannelMessage(
      activeChannel.ChannelArn,
      JSON.stringify(meetingInfoMessage),
      Persistence.NON_PERSISTENT,
      MessageType.STANDARD,
      member,
      options
    );

    setAppMeetingInfo(meetingId, member.username);
    history.push(routes.DEVICE);
  };

  const setCustomStatus = async (e, status) => {
    e.preventDefault();
    await changeStatus(PresenceMode.Custom, status);
  };

  const changeStatus = async (type, status) => {
    await sendChannelMessage(
      activeChannel.ChannelArn,
      toPresenceMessage(type, status, true),
      Persistence.NON_PERSISTENT,
      MessageType.CONTROL,
      member,
    );

    const isAutomatic = type === PresenceMode.Auto;
    const persistedPresenceMap = toPresenceMap(activeChannel.Metadata);
    const customPresenceExists = persistedPresenceMap && persistedPresenceMap[userId];
    if (!isAutomatic || customPresenceExists) {
      if (!activeChannel.ChannelFlowArn) {
        dispatch({
          type: 0,
          payload: {
            message: 'Error, enable presence channel flow first.',
            severity: 'error',
          },
        });
        return;
      }

      // persist presence using standard message and channel flows
      const options = {};
      options.Metadata = JSON.stringify({ IsPresenceInfo: true, Status: toPresenceMessage(type, status, false) });
      await sendChannelMessage(
        activeChannel.ChannelArn,
        `changed status to ${status}`,
        Persistence.PERSISTENT,
        MessageType.STANDARD,
        member,
        options
      );
    }
  };

  const joinChannel = async (e) => {
    e.preventDefault();
    const membership = await createChannelMembership(
      activeChannel.ChannelArn,
      `${appConfig.appInstanceArn}/user/${userId}`,
      userId
    );
    if (membership) {
      const memberships = activeChannelMemberships;
      memberships.push({ Member: membership });
      setActiveChannelMemberships(memberships);
      channelIdChangeHandler(activeChannel.ChannelArn);
      dispatch({
        type: 0,
        payload: {
          message: `Successfully joined ${activeChannel.Name}`,
          severity: 'success',
          autoClose: true,
        },
      });
    } else {
      dispatch({
        type: 0,
        payload: {
          message: 'Error occurred. Unable to join channel.',
          severity: 'error',
          autoClose: true,
        },
      });
    }
  };

  const onAddMember = async () => {
    if (!selectedMember) {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, user name cannot be blank.',
          severity: 'error',
        },
      });
      return;
    }

    try {
      const membership = await createChannelMembership(
        activeChannel.ChannelArn,
        `${appConfig.appInstanceArn}/user/${selectedMember.value}`,
        userId
      );
      const memberships = activeChannelMemberships;
      memberships.push({ Member: membership });
      setActiveChannelMemberships(memberships);
      channelIdChangeHandler(activeChannel.ChannelArn);
      dispatch({
        type: 0,
        payload: {
          message: `New ${selectedMember.label} successfully added to ${activeChannel.Name}`,
          severity: 'success',
          autoClose: true,
        },
      });
      setModal('');
    } catch {
      dispatch({
        type: 0,
        payload: {
          message: 'Error occurred. Member not added to channel.',
          severity: 'error',
          autoClose: true,
        },
      });
    }
  };

  const onManageChannelFlow = async () => {
    if (!selectedMember) {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, channel flow name cannot be blank.',
          severity: 'error',
        },
      });
      return;
    }

    if (selectedMember.value === 'None') {
      try {
        await disassociateChannelFlow(
          activeChannel.ChannelArn,
          activeChannelFlow.ChannelFlowArn,
          userId
        );
        setActiveChannelFlow({});
        dispatch({
          type: 0,
          payload: {
            message: `Channel flow successfully removed from ${activeChannel.Name}`,
            severity: 'success',
            autoClose: true,
          },
        });
        setModal('');
      } catch {
        dispatch({
          type: 0,
          payload: {
            message: `Error occurred. Channel flow could not removed from ${activeChannel.Name}`,
            severity: 'error',
            autoClose: true,
          },
        });
      }
      return;
    }

    try {
      await associateChannelFlow(
        activeChannel.ChannelArn,
        selectedMember.value,
        userId
      );

      let flow = { Name: selectedMember.label, ChannelFlowArn: selectedMember.value };
      setActiveChannelFlow(flow);
      dispatch({
        type: 0,
        payload: {
          message: `Channel flow ${selectedMember.label} successfully associated with ${activeChannel.Name}`,
          severity: 'success',
          autoClose: true,
        },
      });
      setModal('');
    } catch {
      dispatch({
        type: 0,
        payload: {
          message: `Error occurred. Channel flow not associated with channel ${activeChannel.Name}`,
          severity: 'error',
          autoClose: true,
        },
      });
    }
  };

  const loadChannelFlow = async (channel) => {
    if (channel.ChannelFlowArn == null) {
      setActiveChannelFlow({});
    } else {
      let flow;
      try {
        flow = await describeChannelFlow(channel.ChannelFlowArn);
        setActiveChannelFlow(flow);
      } catch (err) {
        console.error('ERROR', err);
      }
    }
  };

  const channelIdChangeHandler = async (channelArn) => {
    if (activeChannel.ChannelArn === channelArn) return;
    let mods = [];
    setActiveChannelModerators([]);
    try {
      mods = await listChannelModerators(channelArn, userId);
      setActiveChannelModerators(mods);
    } catch (err) {
      console.error('ERROR', err);
    }

    const isModerator =
      mods?.find((moderator) => moderator.Moderator.Arn === messagingUserArn) ||
      false;

    // Assessing user role for given channel
    userPermission.setRole(isModerator ? 'moderator' : 'user');

    const newMessages = await listChannelMessages(channelArn, userId);
    const channel = await describeChannel(channelArn, userId);
    setMessages(newMessages.Messages);
    setChannelMessageToken(newMessages.NextToken);
    setActiveChannel(channel);
    await loadChannelFlow(channel);
    setUnreadChannels(unreadChannels.filter((c) => c !== channelArn));
  };

  const handleChannelDeletion = async (e, channelArn, channelMetadata) => {
    e.preventDefault();

    await deleteChannel(channelArn, userId);
    const newChannelList = channelList.filter(
      (channel) => channel.ChannelArn !== channelArn
    );
    setChannelList(newChannelList);
    setActiveChannel('');
    setMessages([]);
    setModal('');
    dispatch({
      type: 0,
      payload: {
        message: 'Channel successfully deleted.',
        severity: 'success',
        autoClose: true,
      },
    });

    // If the channel was a meeting channel, end the associated meeting
    if (channelMetadata) {
      const metadata = JSON.parse(channelMetadata);
      if (metadata.isMeeting) {
        const meeting = JSON.parse(metadata.meeting);
        await endMeeting(meeting.MeetingId);
      }
    }
  };

  const formatMemberships = (memArr) =>
    memArr.flatMap((m) =>
      m.Member.Arn !== messagingUserArn
        ? [{ value: m.Member.Arn, label: m.Member.Name }]
        : []
    );

  const fetchMemberships = async () => {
    const memberships = await listChannelMemberships(
      activeChannel.ChannelArn,
      userId
    );
    setActiveChannelMemberships(memberships);
  };

  const handlePickerChange = (changes) => {
    setSelectedMember(changes);
  };

  const handleJoinMeeting = async (e, meeting, meetingChannelArn) => {
    e.preventDefault();

    await channelIdChangeHandler(meetingChannelArn);

    meetingManager.getAttendee = createGetAttendeeCallback();
    const { JoinInfo } = await createAttendee(member.username, member.userId, meetingChannelArn, meeting);
    const meetingSessionConfiguration = new MeetingSessionConfiguration(
      JoinInfo.Meeting,
      JoinInfo.Attendee
    );
    await meetingManager.join(meetingSessionConfiguration);

    setAppMeetingInfo(JoinInfo.Meeting.MeetingId, member.username);

    setModal('');
    setMeetingInfo(null);

    history.push(routes.DEVICE);
  };

  const handleMessageAll = async (e, meetingChannelArn) => {
    e.preventDefault();

    setModal('');
    setMeetingInfo(null);

    await channelIdChangeHandler(meetingChannelArn);
  };

  const handleDeleteMemberships = () => {
    try {
      deleteChannelMembership(
        activeChannel.ChannelArn,
        selectedMember.value,
        userId
      );
      dispatch({
        type: 0,
        payload: {
          message: 'Successfully removed members from the channel.',
          severity: 'success',
          autoClose: true,
        },
      });
      setSelectedMember({});
    } catch (err) {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, unable to remove members.',
          severity: 'error',
        },
      });
    }
  };

  const handleLeaveChannel = async () => {
    try {
      await deleteChannelMembership(
        activeChannel.ChannelArn,
        createMemberArn(userId),
        userId
      );
      dispatch({
        type: 0,
        payload: {
          message: `Successfully left ${activeChannel.Name}.`,
          severity: 'success',
          autoClose: true,
        },
      });
      setSelectedMember({});
    } catch (err) {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, unable to leave the channel.',
          severity: 'error',
        },
      });
    }
  };

  const [isRestricted, setIsRestricted] = useState(
    activeChannel.Mode === 'RESTRICTED'
  );

  useEffect(() => {
    setIsRestricted(activeChannel.Mode === 'RESTRICTED');
  }, [activeChannel]);

  const loadUserActions = (role, channel) => {
    const map = channel.Metadata && JSON.parse(channel.Metadata).Presence && Object.fromEntries(JSON.parse(channel.Metadata).Presence?.map((entry) => [entry.u, entry.s]));
    const status = map && map[member.userId] || PresenceStatusPrefix.Auto;

    const presenceStatusOption = (
      <PopOverSubMenu className={'ch-sts-popover-toggle'} as='button' key="presence_status" text={"Change status"}>
        <PopOverItem
          as='button'
          onClick={() => changeStatus(PresenceMode.Auto, 'Online')}
          checked={status.startsWith(PresenceStatusPrefix.Auto)}
          children={<span>Automatic</span>}
        />
        <PopOverItem
          as='button'
          onClick={() => changeStatus(PresenceMode.Wfh, 'Working from Home')}
          checked={status.startsWith(PresenceStatusPrefix.Wfh)}
          children={<span>Working from Home</span>}
        />
        <PopOverItem
          as='button'
          onClick={() => setModal('CustomStatus')}
          checked={status.startsWith(PresenceStatusPrefix.Custom)}
          children={<span>Custom {status.startsWith(PresenceStatusPrefix.Custom) ? '(' + status.substr(status.indexOf('|') + 1) + ')' : ''}</span>}
        />
      </PopOverSubMenu>
    );

    const joinChannelOption = (
      <PopOverItem key="join_channel" as="button" onClick={joinChannel}>
        <span>Join Channel</span>
      </PopOverItem>
    );
    const viewDetailsOption = (
      <PopOverItem
        key="view_channel_details"
        as="button"
        onClick={() => setModal('ViewDetails')}
      >
        <span>View channel details</span>
      </PopOverItem>
    );
    const manageChannelFlowOption = (
      <PopOverItem
        key="manage_channel_flow"
        as="button"
        onClick={() => setModal('ManageChannelFlow')}
      >
        <span>Manage channel flow</span>
      </PopOverItem>
    );
    const editChannelOption = (
      <PopOverItem
        key="edit_channel"
        as="button"
        onClick={() => setModal('EditChannel')}
      >
        <span>Edit channel</span>
      </PopOverItem>
    );
    const viewMembersOption = (
      <PopOverItem
        key="view_members"
        as="button"
        onClick={() => setModal('ViewMembers')}
      >
        <span>View members</span>
      </PopOverItem>
    );
    const addMembersOption = (
      <PopOverItem
        key="add_member"
        as="button"
        onClick={() => setModal('AddMembers')}
      >
        <span>Add members</span>
      </PopOverItem>
    );
    const manageMembersOption = (
      <PopOverItem
        key="manage_members"
        as="button"
        onClick={() => setModal('ManageMembers')}
      >
        <span>Manage members</span>
      </PopOverItem>
    );
    const banOrAllowOption = (
      <PopOverItem key="ban_allow" as="button" onClick={() => setModal('Ban')}>
        <span>Ban/Allow members</span>
      </PopOverItem>
    );
    const startMeetingOption = (
      <PopOverItem
        key="start_meeting"
        as="button"
        onClick={startMeeting}
      >
        <span>Start meeting</span>
      </PopOverItem>
    );
    const joinMeetingOption = (
      <PopOverItem
        key="join_meeting"
        as="button"
        onClick={joinMeeting}
      >
        <span>Join meeting</span>
      </PopOverItem>
    );
    const leaveChannelOption = (
      <PopOverItem
        key="leave_channel"
        as="button"
        onClick={() => setModal('LeaveChannel')}
      >
        <span>Leave channel</span>
      </PopOverItem>
    );
    const deleteChannelOption = (
      <PopOverItem
        key="delete_channel"
        as="button"
        onClick={() => setModal('DeleteChannel')}
      >
        <span>Delete channel</span>
      </PopOverItem>
    );

    const meetingModeratorActions = [
      viewDetailsOption,
      <PopOverSeparator key="separator1" className="separator" />,
      addMembersOption,
      manageMembersOption,
      <PopOverSeparator key="separator2" className="separator" />,
      joinMeetingOption,
      <PopOverSeparator key="separator3" className="separator" />,
      leaveChannelOption,
      deleteChannelOption,
    ];
    const meetingMemberActions = [
      viewDetailsOption,
      <PopOverSeparator key="separator1" className="separator" />,
      viewMembersOption,
      <PopOverSeparator key="separator2" className="separator" />,
      joinMeetingOption,
      <PopOverSeparator key="separator3" className="separator" />,
      leaveChannelOption,
    ];
    const moderatorActions = [
      presenceStatusOption,
      <PopOverSeparator key="separator1" className="separator" />,
      viewDetailsOption,
      editChannelOption,
      <PopOverSeparator key="separator2" className="separator" />,
      addMembersOption,
      manageMembersOption,
      banOrAllowOption,
      <PopOverSeparator key="separator3" className="separator" />,
      manageChannelFlowOption,
      <PopOverSeparator key="separator4" className="separator" />,
      startMeetingOption,
      <PopOverSeparator key="separator5" className="separator" />,
      leaveChannelOption,
      deleteChannelOption,
    ];
    const restrictedMemberActions = [
      presenceStatusOption,
      <PopOverSeparator key="separator1" className="separator" />,
      viewDetailsOption,
      <PopOverSeparator key="separator2" className="separator" />,
      viewMembersOption,
      <PopOverSeparator key="separator3" className="separator" />,
      startMeetingOption,
      <PopOverSeparator key="separator4" className="separator" />,
      leaveChannelOption,
    ];
    const unrestrictedMemberActions = [
      presenceStatusOption,
      <PopOverSeparator key="separator1" className="separator" />,
      viewDetailsOption,
      <PopOverSeparator key="separator2" className="separator" />,
      viewMembersOption,
      addMembersOption,
      <PopOverSeparator key="separator3" className="separator" />,
      leaveChannelOption,
    ];
    const noMeetingModeratorActions = [
      viewDetailsOption,
      editChannelOption,
      <PopOverSeparator key="separator1" className="separator" />,
      addMembersOption,
      manageMembersOption,
      banOrAllowOption,
      <PopOverSeparator key="separator2" className="separator" />,
      manageChannelFlowOption,
      <PopOverSeparator key="separator3" className="separator" />,
      leaveChannelOption,
      deleteChannelOption,
    ];
    const noMeetingRestrictedMemberActions = [
      viewDetailsOption,
      <PopOverSeparator key="separator1" className="separator" />,
      viewMembersOption,
      <PopOverSeparator key="separator2" className="separator" />,
      leaveChannelOption,
    ];
    const noMeetingUnrestrictedMemberActions = [
      viewDetailsOption,
      <PopOverSeparator key="separator1" className="separator" />,
      viewMembersOption,
      addMembersOption,
      <PopOverSeparator key="separator2" className="separator" />,
      startMeetingOption,
      <PopOverSeparator key="separator3" className="separator" />,
      leaveChannelOption,
    ];
    const nonMemberActions = [
      joinChannelOption,
      viewDetailsOption,
      viewMembersOption,
    ];

    if (!hasMembership) {
      return nonMemberActions;
    }

    if (appConfig.apiGatewayInvokeUrl) {
      if (channel.Metadata) {
        let metadata = JSON.parse(channel.Metadata);
        if (metadata.isMeeting) {
          return role === 'moderator' ? meetingModeratorActions : meetingMemberActions;
        }
      }

      if (role === 'moderator') {
        return moderatorActions;
      }
      return isRestricted ? restrictedMemberActions : unrestrictedMemberActions;
    }

    if (role === 'moderator') {
      return noMeetingModeratorActions;
    }
    return isRestricted ? noMeetingRestrictedMemberActions : noMeetingUnrestrictedMemberActions;
  };

  return (
    <>
      <ModalManager
        modal={modal}
        setModal={setModal}
        activeChannel={activeChannel}
        meetingInfo={meetingInfo}
        userId={userId}
        onAddMember={onAddMember}
        onManageChannelFlow={onManageChannelFlow}
        handleChannelDeletion={handleChannelDeletion}
        handleDeleteMemberships={handleDeleteMemberships}
        handleJoinMeeting={handleJoinMeeting}
        handleMessageAll={handleMessageAll}
        handlePickerChange={handlePickerChange}
        formatMemberships={formatMemberships}
        activeChannelMemberships={activeChannelMemberships}
        selectedMember={selectedMember}
        onCreateChannel={onCreateChannel}
        activeChannelModerators={activeChannelModerators}
        handleLeaveChannel={handleLeaveChannel}
        banList={banList}
        banUser={banUser}
        unbanUser={unbanUser}
        activeChannelFlow={activeChannelFlow}
        setCustomStatus={setCustomStatus}
      />
      <div className="channel-list-wrapper">
        <div className="channel-list-header">
          <div className="channel-list-header-title">Channels</div>
          <IconButton
            className="create-channel-button channel-options"
            onClick={() => setModal('NewChannel')}
            icon={<Dots width="1.5rem" height="1.5rem" />}
          />
        </div>
        <ChannelList
          style={{
            padding: '8px',
          }}
        >
          {channelList.map((channel) => (
            <ChannelItem
              key={channel.ChannelArn}
              name={channel.Name}
              actions={loadUserActions(userPermission.role, channel)}
              isSelected={channel.ChannelArn === activeChannel.ChannelArn}
              onClick={e => {
                e.stopPropagation();
                console.log('Calling channel change handler');
                channelIdChangeHandler(channel.ChannelArn);
              }}
              unread={unreadChannels.includes(channel.ChannelArn)}
              unreadBadgeLabel="New"
            />
          ))}
        </ChannelList>
      </div>
    </>
  );
};

export default ChannelsWrapper;
