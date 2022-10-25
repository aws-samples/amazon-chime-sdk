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
  SecondaryButton,
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
  listChannelsModeratedByAppInstanceUser,
  deleteChannel,
  describeChannel,
  listChannelMemberships,
  deleteChannelMembership,
  listChannelModerators,
  listChannelBans,
  listSubChannels,
  createChannelBan,
  deleteChannelBan,
  createMeeting,
  createAttendee,
  endMeeting,
  createGetAttendeeCallback,
  listChannelFlows,
  describeChannelFlow,
  disassociateChannelFlow,
  resetAWSClients,
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
} from '../../utilities/presence';

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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [elasticChannelArnList, setElastiChannelArnList] = useState([]);
  const [standardChannelArnList, setStandardChannelArnList] = useState([]);
  const maximumMembershipsAllowed = '1000000';

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const {
    activeChannelRef,
    activeSubChannelRef,
    channelList,
    channelListRef,
    channelListModerator,
    setChannelListModerator,
    subChannelList,
    setSubChannelList,
    setChannelList,
    setActiveChannel,
    setActiveSubChannel,
    activeChannel,
    activeSubChannel,
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
    activeView,
    setActiveView,
    moderatedChannel,
    setModeratedChannel,
    subChannelIds,
    setSubChannelIds,
  } = useChatChannelState();
  const { setMessages } = useChatMessagingState();
  const { setAppMeetingInfo } = useAppState();

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  });

  const handleSwichViewClick = (e) => {
    if (activeView === 'Moderator') {
      setActiveView('User');
      setActiveChannel('');
    } else {
      setActiveView('Moderator');
    }
  };

  // get all channels
  useEffect(() => {
    if (!userId) return;
    const fetchChannels = async () => {
      if (activeView === 'User') {
        const userChannelMemberships = await listChannelMembershipsForAppInstanceUser(
          userId
        );
        const userChannelList = userChannelMemberships.map(
          (channelMembership) => {
            const channelSummary = channelMembership.ChannelSummary;
            channelSummary.SubChannelId =
              channelMembership.AppInstanceUserMembershipSummary.SubChannelId;

            return channelSummary;
          }
        );
        const tempChannelList = [...userChannelList];
        for (const channel of tempChannelList) {
          if (channel.SubChannelId && !subChannelIds.includes(channel.SubChannelId)) {
            subChannelIds.push(channel.SubChannelId);
          }
        }
        setSubChannelIds(subChannelIds);

        const publicChannels = await listChannels(
          appConfig.appInstanceArn,
          userId
        );

        const moderatorChannels = await listChannelsModeratedByAppInstanceUser(
          userId
        );
        const moderatorChannelList = moderatorChannels.map(
          (channelMembership) => channelMembership.ChannelSummary
        );

        const tempModeratorChannelList = [...moderatorChannelList];
        for (const moderatorChannel of tempModeratorChannelList) {
          const channel = await describeChannel(moderatorChannel.ChannelArn, userId);
          if (!elasticChannelArnList.includes(channel.ChannelArn) && channel.ElasticChannelConfiguration) {
            elasticChannelArnList.push(channel.ChannelArn);
          }
        }
        setElastiChannelArnList(elasticChannelArnList);

        setChannelList(
          mergeArrayOfObjects(
            mergeArrayOfObjects(publicChannels, userChannelList, 'ChannelArn'),
            moderatorChannelList,
            'ChannelArn'
          )
        );
      } else {
        setModeratedChannel(activeChannel);
      }
    await publishStatusToAllChannels();
    };
    fetchChannels();
  }, [userId, activeView]);

  useEffect(() => {
    if (!isAuthenticated) {
      resetAWSClients();
      console.clear();
      setActiveView('User');
      setActiveChannel('');
      setChannelList([]);
    };
  }, [isAuthenticated]);

  // get channel memberships
  useEffect(() => {
    if (
      activeChannel.ChannelArn &&
      activeChannel.ElasticChannelConfiguration == null
    ) {
      activeChannelRef.current = activeChannel;
      fetchMemberships();
      publishStatusToAllChannels();
    }
  }, [activeChannel.ChannelArn, activeChannel.SubChannelId]);

  // track channel presence
  useEffect(() => {
    if (channelList.length > 0) {
      channelListRef.current = channelList;
      startPublishStatusWithInterval();
    }
    if(activeChannel.ElasticChannelConfiguration){
      getSubChannelList(activeChannel);
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
      await updateChannelArnLists();
      await publishStatusToAllChannels();
      publishTimeout = setTimeout(publishStatusWithInterval, PUBLISH_INTERVAL);
    })();
  }

  function computeAutoStatusForAChannel(channel) {
    const persistedPresence = JSON.parse(channel.Metadata || '{}').Presence;
    const isCustomStatus =
      persistedPresence && persistedPresence.filter((p) => p.u === userId)[0];
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

  const updateChannelArnLists = async () => {
    for (const channel of channelList) {
      if (!elasticChannelArnList.includes(channel.ChannelArn) && !standardChannelArnList.includes(channel.ChannelArn)) {
        let newChannel;
        if (channel.ElasticChannelConfiguration) {
          newChannel = channel;
        } else {
          newChannel = await describeChannel(channel.ChannelArn, userId);
        }
        if (newChannel) {
          if (newChannel.ElasticChannelConfiguration) {
            elasticChannelArnList.push(channel.ChannelArn);
            setElastiChannelArnList(elasticChannelArnList);
          } else {
            standardChannelArnList.push(channel.ChannelArn);
            setStandardChannelArnList(standardChannelArnList);
          }
        }
      }
    }
  }

  async function publishStatusToAllChannels() {
    const servicePromises = [];
    for (const channel of channelListRef.current) {
      const channelType = JSON.parse(channel.Metadata || '{}').ChannelType;
      if (!channel.SubChannelId && !elasticChannelArnList.includes(channel.ChannelArn) && channelType != 'PUBLIC_ELASTIC') { //Elastic channels doesnt support presence
        const status = computeAutoStatusForAChannel(channel);
        if (status) {
          servicePromises.push(sendChannelMessage(
            channel.ChannelArn,
            toPresenceMessage(PresenceMode.Auto, status, true),
            Persistence.NON_PERSISTENT,
            MessageType.CONTROL,
            member,
            channel.SubChannelId,
          ));
        }
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

  const getSubChannelList = async (channel) => {
    const appInstanceUserArn = `${appConfig.appInstanceArn}/user/${userId}`;
    const subChannelListResponse = await listSubChannels(
      channel.ChannelArn,
      userId,
    );
    setSubChannelList([]);
    if (subChannelListResponse) {
      const memberSubChannelList = subChannelListResponse.SubChannels.filter(
        (m) => subChannelIds.includes(m.SubChannelId)
      )
      setSubChannelList(memberSubChannelList);
    }
  };

  const getChannels = (channel) => {
    {
      return (
        <React.Fragment key={channel.ChannelArn}>
          <ChannelItem
            key={channel.ChannelArn}
            name={(channel.SubChannelId || elasticChannelArnList.includes(channel.ChannelArn)
              || JSON.parse(channel.Metadata || '{}').ChannelType == 'PUBLIC_ELASTIC') ? '(Elastic) ' + channel.Name : channel.Name}
            actions={loadUserActions(userPermission.role, channel)}
            isSelected={
              channel.ChannelArn === activeChannel.ChannelArn &&
              (activeChannel.SubChannelId == null || activeView === 'User')
            }
            onClick={(e) => {
              e.stopPropagation();
              console.log('Calling channel change handler');
              channelIdChangeHandler(channel);
            }}
            unread={unreadChannels.includes(channel.ChannelArn)}
            unreadBadgeLabel="New"
          />
          {/* check ElasticChannelConfiguration to know channel is Elastic */}
          {activeView != 'User' &&
            activeSubChannel.ElasticChannelConfiguration &&
            subChannelList.length > 0 &&
            channel.ChannelArn === activeSubChannel.ChannelArn &&
            userPermission.role === 'moderator' && (
              <ChannelList
                style={{
                  padding: '8px',
                }}
              >
                {activeSubChannel.ElasticChannelConfiguration &&
                  subChannelList.map((m) => getSubChannels(m))}
              </ChannelList>
            )}
        </React.Fragment>
      );
    }
  };

  const getSubChannels = (subChannelSummary) => {
    {
      return (
        <ChannelItem
          key={subChannelSummary.SubChannelId}
          name={getSubChannelName(subChannelSummary.SubChannelId)}
          actions={loadUserActions(userPermission.role, activeSubChannel)}
          isSelected={
            subChannelSummary.SubChannelId === activeChannel.SubChannelId
          }
          onClick={(e) => {
            e.stopPropagation();
            console.log('Calling sub channel change handler');
            subChannelIdChangeHandler(
              subChannelSummary.SubChannelId,
              subChannelSummary.MembershipCount,
              activeSubChannel.ChannelArn
            );
          }}
        />
      );
    }
  };

  const getSubChannelName = (subChannelId) => {
    return (
      activeSubChannel.Name +
      "-" +
      subChannelId.substring(0, 3) +
      "-" +
      subChannelId.substring(3, 6)
    );
  };

  const joinSubChannel = async (subChannelId) => {
    try {
      const membership = await createChannelMembership(
        activeChannel.ChannelArn,
        `${appConfig.appInstanceArn}/user/${userId}`,
        userId,
        subChannelId
      );
      if (membership) {
        const memberships = activeChannelMemberships;
        memberships.push({ Member: membership });
        setActiveChannelMemberships(memberships);
        channelIdChangeHandler(activeChannel);
        dispatch({
          type: 0,
          payload: {
            message: `Successfully joined SubChannel ${getSubChannelName(subChannelId)}`,
            severity: 'success',
            autoClose: true,
          },
        });
      } else {
        dispatch({
          type: 0,
          payload: {
            message: 'Error occurred. Unable to join SubChannel.',
            severity: 'error',
            autoClose: true,
          },
        });
      }
    } catch (err) {
      dispatch({
        type: 0,
        payload: {
          message: `Error occurred. ${err.message}`,
          severity: 'error',
        },
      });
    }
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
    try {
      await deleteChannelBan(activeChannel.ChannelArn, memberArn, userId);
      await getBanList();
      dispatch({
        type: 0,
        payload: {
          message: 'Successfully removed ban.',
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

  useEffect(() => {
    if (activeChannel.ChannelArn && modal === 'Ban') {
      getBanList();
    }
  }, [activeChannel.ChannelArn, modal]);

  const onCreateChannel = async (e, newName, mode, privacy, elasticChannelConfiguration) => {
    e.preventDefault();
    if (!newName) {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, channel name cannot be blank.',
          severity: 'error',
        },
      });
    } else if (elasticChannelConfiguration && (!elasticChannelConfiguration.MaximumSubChannels ||
      !elasticChannelConfiguration.TargetMembershipsPerSubChannel ||
      !elasticChannelConfiguration.MinimumMembershipPercentage)) {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, one or nmore of elastic channel attribute is blank.',
          severity: 'error',
          autoClose: false,
        },
      });
    } else if (elasticChannelConfiguration &&
      (elasticChannelConfiguration.MaximumSubChannels * elasticChannelConfiguration.TargetMembershipsPerSubChannel > maximumMembershipsAllowed)) {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, total allowable memberships across all sub-channels must be less than or equal to 1000000.',
          severity: 'error',
          autoClose: false,
        },
      });
    } else {
      const channelArn = await createChannel(
        appConfig.appInstanceArn,
        null,
        newName,
        mode,
        privacy,
        elasticChannelConfiguration,
        userId
      );
      if (channelArn) {
        const channel = await describeChannel(channelArn, userId);
        setModal('');
        if (channel) {
          if (elasticChannelConfiguration !== null) {
            setModeratedChannel(channel);
          }
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
          channelIdChangeHandler(channel);
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
      null,
      userId
    );
    const meetingChannel = await describeChannel(meetingChannelArn, userId);
    channelIdChangeHandler(meetingChannel);

    const memberships = activeChannelMemberships;
    memberships.forEach((membership) => createChannelMembership(
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
      null,
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
    if (!activeChannel.ElasticChannelConfiguration && !activeChannel.SubChannelId) {
      await sendChannelMessage(
        activeChannel.ChannelArn,
        toPresenceMessage(type, status, true),
        Persistence.NON_PERSISTENT,
        MessageType.CONTROL,
        member,
        activeChannel.SubChannelId
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
        options.Metadata = JSON.stringify({
          IsPresenceInfo: true,
          Status: toPresenceMessage(type, status, false),
        });
        await sendChannelMessage(
          activeChannel.ChannelArn,
          `changed status to ${status}`,
          Persistence.PERSISTENT,
          MessageType.STANDARD,
          member,
          activeChannel.SubChannelId,
          options
        );
      }
    }
  };

  const joinChannel = async (e) => {
    e.preventDefault();
    const membership = await createChannelMembership(
      activeChannel.ChannelArn,
      `${appConfig.appInstanceArn}/user/${userId}`,
      userId,
      activeChannel.SubChannelId
    );
    if (membership) {
      const memberships = activeChannelMemberships;
      memberships.push({ Member: membership });
      setActiveChannelMemberships(memberships);
      channelIdChangeHandler(activeChannel);
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
        userId,
        activeChannel.SubChannelId
      );
      const memberships = activeChannelMemberships;
      memberships.push({ Member: membership });
      setActiveChannelMemberships(memberships);
      channelIdChangeHandler(activeChannel);
      dispatch({
        type: 0,
        payload: {
          message: `New ${selectedMember.label} successfully added to ${activeChannel.Name}`,
          severity: 'success',
          autoClose: true,
        },
      });
      setModal('');
    } catch (err) {
      if (activeChannel.ElasticChannelConfiguration) {
        dispatch({
          type: 0,
          payload: {
            message: `Error occurred. ${err.message}`,
            severity: 'error',
            autoClose: true,
          },
        });
      } else {
        dispatch({
          type: 0,
          payload: {
            message: 'Error occurred. Member not added to channel.',
            severity: 'error',
            autoClose: true,
          },
        });
      }
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

  const channelIdChangeHandler = async (channel) => {
    if (activeChannel.ChannelArn === channel.ChannelArn && !activeChannel.SubChannelId)
      return;
    let mods = [];
    setActiveChannelModerators([]);

    var isModerator = false;
    const channelType = JSON.parse(channel.Metadata || '{}').ChannelType;
    // Moderator is for channel only, not subChannel
    if (!channel.SubChannelId) {
      try {
        mods = await listChannelModerators(channel.ChannelArn, userId);
        setActiveChannelModerators(mods);
      } catch (err) {
        if (channel.Privacy != 'PUBLIC')
          console.error('ERROR', err);
      }

      isModerator =
        mods?.find(
          (moderator) => moderator.Moderator.Arn === messagingUserArn
        ) || false;
    }
    // Assessing user role for given channel
    userPermission.setRole(isModerator ? 'moderator' : 'user');

    const newChannel = await describeChannel(channel.ChannelArn, userId);
    newChannel.SubChannelId = channel.SubChannelId;
    channel = newChannel;
    // listChannelMessages is available to regular channels and subChannels
    if (
      (!channel.ElasticChannelConfiguration && channelType != 'PUBLIC_ELASTIC') ||
      (channel.SubChannelId)
    ) {
      const newMessages = await listChannelMessages(
        channel.ChannelArn,
        userId,
        channel.SubChannelId
      );
      setMessages(newMessages.Messages);
      setChannelMessageToken(newMessages.NextToken);
    } else if (channelType == 'PUBLIC_ELASTIC' && !channel.SubChannelId) {
      setMessages([]);
    }
    setActiveChannel(channel);
    if (channel.ElasticChannelConfiguration && isModerator) {
      setActiveSubChannel(channel);
      setActiveView('Moderator');
    } else {
      setActiveSubChannel({});
    }
    await loadChannelFlow(channel);
    setUnreadChannels(unreadChannels.filter((c) => c !== channel.ChannelArn));
    if (
      !channel.SubChannelId &&
      isModerator &&
      channel.ElasticChannelConfiguration
    ) {
      // check ElasticChannelConfiguration to know channel is Elastic
      getSubChannelList(channel);
    }
  };

  const subChannelIdChangeHandler = async (
    subChannelId,
    membershipCount,
    elasticChannelArn
  ) => {
    if (activeSubChannel.SubChannelId === subChannelId) return;
    const subChannel = {
      ChannelArn: elasticChannelArn,
      Name: getSubChannelName(subChannelId),
      SubChannelId: subChannelId,
      MembershipCount: membershipCount,
    };
    const newMessages = await listChannelMessages(
      elasticChannelArn,
      userId,
      subChannelId
    );
    setMessages(newMessages.Messages);
    setChannelMessageToken(newMessages.NextToken);
    setActiveChannel(subChannel);
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
    setActiveView('User');
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
    const channelType = JSON.parse(activeChannel.Metadata || '{}').ChannelType;
    if (!activeChannel.SubChannelId && !activeChannel.ElasticChannelConfiguration && channelType == 'PUBLIC_ELASTIC') {
      setActiveChannelMemberships([]);
    } else {
      const memberships = await listChannelMemberships(
        activeChannel.ChannelArn,
        userId,
        activeChannel.SubChannelId
      );
      setActiveChannelMemberships(memberships);
    }
  };

  const handlePickerChange = (changes) => {
    setSelectedMember(changes);
  };

  const handleJoinMeeting = async (e, meeting, meetingChannelArn) => {
    e.preventDefault();
    const meetingChannel = {
      ChannelArn: meetingChannelArn
    };

    await channelIdChangeHandler(meetingChannel);

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
    
    const meetingChannel = {
      ChannelArn: meetingChannelArn
    };

    await channelIdChangeHandler(meetingChannel);
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

  const leaveSubChannel = async (subChannelId) => {
    try {
      const subId = subChannelId != null? subChannelId : activeChannel.SubChannelId;
      await deleteChannelMembership(
        activeChannel.ChannelArn,
        createMemberArn(userId),
        userId,
        subId
      );
      dispatch({
        type: 0,
        payload: {
          message: `Successfully left subChannel ${getSubChannelName(subId)}.`,
          severity: 'success',
          autoClose: true,
        },
      });
    } catch (err) {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, unable to leave the sub channel.',
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
    const map =
      channel.Metadata &&
      JSON.parse(channel.Metadata).Presence &&
      Object.fromEntries(
        JSON.parse(channel.Metadata).Presence?.map((entry) => [
          entry.u,
          entry.s,
        ])
      );
    const status = (map && map[member.userId]) || PresenceStatusPrefix.Auto;

    const presenceStatusOption = (
      <PopOverSubMenu
        className={"ch-sts-popover-toggle"}
        as="button"
        key="presence_status"
        text={"Change status"}
      >
        <PopOverItem
          as="button"
          onClick={() => changeStatus(PresenceMode.Auto, 'Online')}
          checked={status.startsWith(PresenceStatusPrefix.Auto)}
          children={<span>Automatic</span>}
        />
        <PopOverItem
          as="button"
          onClick={() => changeStatus(PresenceMode.Wfh, 'Working from Home')}
          checked={status.startsWith(PresenceStatusPrefix.Wfh)}
          children={<span>Working from Home</span>}
        />
        <PopOverItem
          as="button"
          onClick={() => setModal('CustomStatus')}
          checked={status.startsWith(PresenceStatusPrefix.Custom)}
          children={<span>Custom{status.startsWith(PresenceStatusPrefix.Custom) ? '(' + status.substr(status.indexOf('|') + 1) + ')' : ''}</span>}
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
      <PopOverItem key="start_meeting" as="button" onClick={startMeeting}>
        <span>Start meeting</span>
      </PopOverItem>
    );
    const joinMeetingOption = (
      <PopOverItem key="join_meeting" as="button" onClick={joinMeeting}>
        <span>Join meeting</span>
      </PopOverItem>
    );
    const leaveChannelOption = (
      <PopOverItem
        key="leave_channel"
        as="button"
        onClick={() => setModal('LeaveChannel')}
      >
        { (activeChannel.SubChannelId && role === 'moderator') ?
          (<span>Leave subchannel</span>) : (<span>Leave channel</span>)
        }
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

    const listSubChannelsOption = (
      <PopOverItem
        key="list_join"
        as="button"
        onClick={() => setModal('ListSubChannel')}
      >
        <span>List subchannels</span>
      </PopOverItem>
    );

    const joinSubChannelOption = (
      <PopOverItem
        key="list_join1"
        as="button"
        onClick={() => setModal('JoinSubChannel')}
      >
        <span>Join subchannel</span>
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
    const elasticChannelModeratorActions = [
      viewDetailsOption,
      <PopOverSeparator key="separator1" className="separator" />,
      addMembersOption,
      banOrAllowOption,
      <PopOverSeparator key="separator2" className="separator" />,
      leaveChannelOption,
      deleteChannelOption,
      <PopOverSeparator key="separator3" className="separator" />,
      listSubChannelsOption,
      joinSubChannelOption,
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
    const subChannelModeratorActions = [
      viewDetailsOption,
      <PopOverSeparator key="separator1" className="separator" />,
      manageMembersOption,
      <PopOverSeparator key="separator2" className="separator" />,
      viewMembersOption,
      <PopOverSeparator key="separator3" className="separator" />,
      leaveChannelOption,
    ];
    const subChannelMemberActions = [
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
    //User is a moderator of Elastic Channel
    if (activeChannel.ElasticChannelConfiguration && role === 'moderator') {
      return elasticChannelModeratorActions;
    }

    if (activeChannel.SubChannelId && role === 'user') {
      return subChannelMemberActions;
    }

    if (!hasMembership) {
      return nonMemberActions;
    }
    //User is moderator of a SubChannel
    if (activeChannel.SubChannelId && role === 'moderator') {
      return subChannelModeratorActions;
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
        activeSubChannel={activeSubChannel}
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
        subChannelList={subChannelList}
        joinSubChannel={joinSubChannel}
        leaveSubChannel={leaveSubChannel}
      />
      <div className="channel-list-wrapper">
        {activeView != 'Moderator' ? (
          <div className="channel-list-header">
            <div className="channel-list-header-title">Channels</div>
            <IconButton
              className="create-channel-button channel-options"
              onClick={() => setModal('NewChannel')}
              icon={<Dots width="1.5rem" height="1.5rem" />}
            />
          </div>
        ) : (
          <div className="channel-list-header">
            <SecondaryButton
              label="Back"
              onClick={handleSwichViewClick}
              className={"create-back-button"}
            />
          </div>
        )}
        <ChannelList
          style={{
            padding: '8px',
          }}
        >
          {activeView == 'User'
            ? channelList.map((channel) => getChannels(channel))
            : getChannels(moderatedChannel)}
        </ChannelList>
      </div>
    </>
  );
};

export default ChannelsWrapper;
