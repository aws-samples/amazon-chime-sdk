/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/* eslint-disable no-use-before-define */
/* eslint-disable import/no-unresolved */
/* eslint-disable react/prop-types */
<<<<<<< HEAD
import React, { useState, useEffect } from "react";

import { v4 as uuid } from "uuid";
=======
import React, { useState, useEffect } from 'react';

import { v4 as uuid } from 'uuid';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  PopOverItem,
  PopOverSeparator,
  IconButton,
  Dots,
  useNotificationDispatch,
  useMeetingManager,
  ChannelList,
  ChannelItem,
<<<<<<< HEAD
} from "amazon-chime-sdk-component-library-react";
import { useTheme } from "styled-components";
import { useHistory } from "react-router-dom";
=======
} from 'amazon-chime-sdk-component-library-react';
import { useTheme } from 'styled-components';
import { useHistory } from 'react-router-dom';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
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
<<<<<<< HEAD
  startTranscription,
} from "../../api/ChimeAPI";
import appConfig from "../../Config";

import { useUserPermission } from "../../providers/UserPermissionProvider";
import mergeArrayOfObjects from "../../utilities/mergeArrays";
import {
  useChatChannelState,
  useChatMessagingState,
} from "../../providers/ChatMessagesProvider";
import { useAppState } from "../../providers/AppStateProvider";
import { useAuthContext } from "../../providers/AuthProvider";
import ModalManager from "./ModalManager";
import routes from "../../constants/routes";

import "./ChannelsWrapper.css";
=======
  startTranscription
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

import './ChannelsWrapper.css';

>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const ChannelsWrapper = () => {
  const history = useHistory();
  const meetingManager = useMeetingManager();
  const dispatch = useNotificationDispatch();
<<<<<<< HEAD
  const [modal, setModal] = useState("");
=======
  const [modal, setModal] = useState('');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const [selectedMember, setSelectedMember] = useState({}); // TODO change to an empty array when using batch api
  const [activeChannelModerators, setActiveChannelModerators] = useState([]);
  const [banList, setBanList] = useState([]);
  const theme = useTheme();
  const userPermission = useUserPermission();
  const { userId } = useAuthContext().member;
  const member = useAuthContext().member;
  const messagingUserArn = `${appConfig.appInstanceArn}/user/${userId}`;
  const {
    activeChannelRef,
    channelList,
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
  } = useChatChannelState();
  const { setMessages } = useChatMessagingState();
  const { setAppMeetingInfo } = useAppState();

  // get all channels
  useEffect(() => {
    if (!userId) return;
    const fetchChannels = async () => {
<<<<<<< HEAD
      const userChannelMemberships =
        await listChannelMembershipsForAppInstanceUser(userId);
=======
      const userChannelMemberships = await listChannelMembershipsForAppInstanceUser(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      const userChannelList = userChannelMemberships.map(
        (channelMembership) => channelMembership.ChannelSummary
      );
      const publicChannels = await listChannels(
        appConfig.appInstanceArn,
        userId
      );

      setChannelList(
<<<<<<< HEAD
        mergeArrayOfObjects(userChannelList, publicChannels, "ChannelArn")
=======
        mergeArrayOfObjects(userChannelList, publicChannels, 'ChannelArn')
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      );
    };
    fetchChannels();
  }, [userId]);

  // get channel memberships
  useEffect(() => {
    if (activeChannel.ChannelArn) {
      fetchMemberships();
    }
  }, [activeChannel.ChannelArn]);

  // get meeting id
  useEffect(() => {
    if (meetingInfo) {
<<<<<<< HEAD
      setModal("JoinMeeting");
=======
      setModal('JoinMeeting');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }
  }, [meetingInfo]);

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
<<<<<<< HEAD
          message: "Successfully banned user.",
          severity: "success",
=======
          message: 'Successfully banned user.',
          severity: 'success',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        },
      });
    } catch {
      dispatch({
        type: 0,
        payload: {
<<<<<<< HEAD
          message: "Error, unable to perform this action.",
          severity: "error",
=======
          message: 'Error, unable to perform this action.',
          severity: 'error',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        },
      });
    }
  };

  const unbanUser = async (memberArn) => {
    await deleteChannelBan(activeChannel.ChannelArn, memberArn, userId);
    await getBanList();
  };

  useEffect(() => {
<<<<<<< HEAD
    if (activeChannel.ChannelArn && modal === "Ban") {
=======
    if (activeChannel.ChannelArn && modal === 'Ban') {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      getBanList();
    }
  }, [activeChannel.ChannelArn, modal]);

  const onCreateChannel = async (e, newName, mode, privacy) => {
    e.preventDefault();
    if (!newName) {
      dispatch({
        type: 0,
        payload: {
<<<<<<< HEAD
          message: "Error, channel name cannot be blank.",
          severity: "error",
=======
          message: 'Error, channel name cannot be blank.',
          severity: 'error',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
<<<<<<< HEAD
        setModal("");
=======
        setModal('');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        if (channel) {
          setChannelList([...channelList, channel]);
          dispatch({
            type: 0,
            payload: {
<<<<<<< HEAD
              message: "Successfully created channel.",
              severity: "success",
=======
              message: 'Successfully created channel.',
              severity: 'success',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
              autoClose: true,
            },
          });
          setActiveChannel(channel);
          channelIdChangeHandler(channel.ChannelArn);
        } else {
          dispatch({
            type: 0,
            payload: {
<<<<<<< HEAD
              message: "Error, could not retrieve channel information.",
              severity: "error",
=======
              message: 'Error, could not retrieve channel information.',
              severity: 'error',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
              autoClose: false,
            },
          });
        }
      } else {
        dispatch({
          type: 0,
          payload: {
<<<<<<< HEAD
            message: "Error, could not create new channel.",
            severity: "error",
=======
            message: 'Error, could not create new channel.',
            severity: 'error',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
<<<<<<< HEAD
      let meeting = metadata.meeting;
=======
      let meeting = metadata.meeting; 
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

      // Create own attendee and join meeting
      meetingManager.getAttendee = createGetAttendeeCallback();

<<<<<<< HEAD
      const response = await createAttendee(
        member.username,
        member.userId,
        activeChannel.ChannelArn,
        meeting
      );
=======
      const response = await createAttendee(member.username, member.userId, activeChannel.ChannelArn, meeting);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

      if (response.JoinInfo) {
        await meetingManager.join({
          meetingInfo: response.JoinInfo.Meeting,
<<<<<<< HEAD
          attendeeInfo: response.JoinInfo.Attendee,
=======
          attendeeInfo: response.JoinInfo.Attendee
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        });

        setAppMeetingInfo(response.JoinInfo.Meeting.MeetingId, member.username);
        history.push(routes.DEVICE);
      } else {
        if (response.message) {
          dispatch({
            type: 0,
            payload: {
<<<<<<< HEAD
              message:
                "Unable to join the meeting that has ended. Please start a new meeting.",
              severity: "error",
=======
              message: 'Unable to join the meeting that has ended. Please start a new meeting.',
              severity: 'error',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
              autoClose: true,
            },
          });
        }
        setAppMeetingInfo(null, member.username);
<<<<<<< HEAD
        setModal("");
        setMeetingInfo(null);

        // Update meeting channel metadata with meeting info
        let meetingChannelmetadata = {
          isMeeting: false,
=======
        setModal('');
        setMeetingInfo(null);
        
        // Update meeting channel metadata with meeting info
        let meetingChannelmetadata = {
          isMeeting: false
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        };

        await updateChannel(
          activeChannel.ChannelArn,
          activeChannel.Name,
<<<<<<< HEAD
          "RESTRICTED",
=======
          'RESTRICTED',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          JSON.stringify(meetingChannelmetadata),
          userId
        );
      }
    }
  };

  const startMeeting = async (e) => {
    e.preventDefault();

    // Create meeting and attendee for self
    meetingManager.getAttendee = createGetAttendeeCallback();
<<<<<<< HEAD
    const { JoinInfo } = await createMeeting(
      member.username,
      member.userId,
      activeChannel.ChannelArn
    );
    await meetingManager.join({
      meetingInfo: JoinInfo.Meeting,
      attendeeInfo: JoinInfo.Attendee,
=======
    const { JoinInfo } = await createMeeting(member.username, member.userId, activeChannel.ChannelArn);
    await meetingManager.join({
      meetingInfo: JoinInfo.Meeting,
      attendeeInfo: JoinInfo.Attendee
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });

    const meetingId = JoinInfo.Meeting.MeetingId;
    const meeting = JSON.stringify(JoinInfo.Meeting);

    // Update meeting channel metadata with meeting info
    let meetingChannelmetadata = {
      isMeeting: true,
<<<<<<< HEAD
      meeting: meeting,
=======
      meeting: meeting
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    };

    await updateChannel(
      activeChannel.ChannelArn,
      activeChannel.Name,
<<<<<<< HEAD
      "RESTRICTED",
=======
      'RESTRICTED',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      JSON.stringify(meetingChannelmetadata),
      userId
    );

    // Send the meeting info as a chat message in the existing channel
    const options = {};
    options.Metadata = `{"isMeetingInfo":true}`;
    let meetingInfoMessage = {
      meeting: meeting,
      channelArn: activeChannel.ChannelArn,
      channelName: activeChannel.Name,
      inviter: member.username,
<<<<<<< HEAD
    };
    await sendChannelMessage(
      activeChannel.ChannelArn,
      JSON.stringify(meetingInfoMessage),
      "NON_PERSISTENT",
      member,
      options
    );

=======
    }
    await sendChannelMessage(
      activeChannel.ChannelArn,
      JSON.stringify(meetingInfoMessage),
      'NON_PERSISTENT',
      member,
      options
    );
    
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    setAppMeetingInfo(meetingId, member.username);
    history.push(routes.DEVICE);
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
<<<<<<< HEAD
          severity: "success",
=======
          severity: 'success',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          autoClose: true,
        },
      });
    } else {
      dispatch({
        type: 0,
        payload: {
<<<<<<< HEAD
          message: "Error occurred. Unable to join channel.",
          severity: "error",
=======
          message: 'Error occurred. Unable to join channel.',
          severity: 'error',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
<<<<<<< HEAD
          message: "Error, user name cannot be blank.",
          severity: "error",
=======
          message: 'Error, user name cannot be blank.',
          severity: 'error',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
<<<<<<< HEAD
          severity: "success",
          autoClose: true,
        },
      });
      setModal("");
=======
          severity: 'success',
          autoClose: true,
        },
      });
      setModal('');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    } catch {
      dispatch({
        type: 0,
        payload: {
<<<<<<< HEAD
          message: "Error occurred. Member not added to channel.",
          severity: "error",
=======
          message: 'Error occurred. Member not added to channel.',
          severity: 'error',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          autoClose: true,
        },
      });
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
<<<<<<< HEAD
      console.error("ERROR", err);
=======
      console.error('ERROR', err);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }

    const isModerator =
      mods?.find((moderator) => moderator.Moderator.Arn === messagingUserArn) ||
      false;

    // Assessing user role for given channel
<<<<<<< HEAD
    userPermission.setRole(isModerator ? "moderator" : "user");

    const newMessages = await listChannelMessages(channelArn, userId);
    const channel = await describeChannel(channelArn, userId);
    const memberships = await listChannelMemberships(channelArn, userId);
=======
    userPermission.setRole(isModerator ? 'moderator' : 'user');

    const newMessages = await listChannelMessages(channelArn, userId);
    const channel = await describeChannel(channelArn, userId);
    const memberships = await listChannelMemberships(
      channelArn,
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    function containsUser(userName, list) {
      var i;
      for (i = 0; i < list.length; i++) {
        if (list[i].Member.Name === userName) {
          return true;
        }
      }
      return false;
    }
<<<<<<< HEAD
    if (!containsUser("ModeratorBot", memberships)) {
      const newmember = await createChannelMembership(
        channelArn,
        `${appConfig.appInstanceArn}/user/ModeratorBot`,
        userId
      );
=======
    if (!containsUser('ModeratorBot', memberships)) {
      const newmember = await createChannelMembership(
        channelArn, 
        `${appConfig.appInstanceArn}/user/ModeratorBot`, 
        userId);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }
    setMessages(newMessages.Messages);
    setChannelMessageToken(newMessages.NextToken);
    await sendChannelMessage(
      channelArn,
      "Welcome to the Demo Waiting Room. Please let us know what you want to do while waiting for doctor to join. You have options as self evaluation, retireve lab results, get medications, schedule future appointments.",
<<<<<<< HEAD
      "PERSISTENT",
      { userId: "ModeratorBot", username: "ModeratorBot" }
=======
      'PERSISTENT',
      {"userId": "ModeratorBot", "username": "ModeratorBot"}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    );
    setActiveChannel(channel);
    setUnreadChannels(unreadChannels.filter((c) => c !== channelArn));
  };

  const handleChannelDeletion = async (e, channelArn, channelMetadata) => {
    e.preventDefault();

    await deleteChannel(channelArn, userId);
    const newChannelList = channelList.filter(
      (channel) => channel.ChannelArn !== channelArn
    );
    setChannelList(newChannelList);
<<<<<<< HEAD
    setActiveChannel("");
    setMessages([]);
    setModal("");
    dispatch({
      type: 0,
      payload: {
        message: "Channel successfully deleted.",
        severity: "success",
=======
    setActiveChannel('');
    setMessages([]);
    setModal('');
    dispatch({
      type: 0,
      payload: {
        message: 'Channel successfully deleted.',
        severity: 'success',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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

  const handleJoinMeeting = async (e) => {
    e.preventDefault();

    await channelIdChangeHandler(meetingInfo.channelArn);
<<<<<<< HEAD

    meetingManager.getAttendee = createGetAttendeeCallback();
    const { JoinInfo } = await createAttendee(
      member.username,
      member.userId,
      meetingInfo.channelArn,
      meetingInfo.meeting
    );

    await meetingManager.join({
      meetingInfo: JoinInfo.Meeting,
      attendeeInfo: JoinInfo.Attendee,
=======
    
    meetingManager.getAttendee = createGetAttendeeCallback();
    const { JoinInfo } = await createAttendee(member.username, member.userId, meetingInfo.channelArn, meetingInfo.meeting);

    await meetingManager.join({
      meetingInfo: JoinInfo.Meeting,
      attendeeInfo: JoinInfo.Attendee
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });

    setAppMeetingInfo(JoinInfo.Meeting.MeetingId, member.username);

<<<<<<< HEAD
    setModal("");
    setMeetingInfo(null);

    history.push(routes.DEVICE);
  };
=======
    setModal('');
    setMeetingInfo(null);

    history.push(routes.DEVICE);
  }
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const handleMessageAll = async (e, meetingChannelArn) => {
    e.preventDefault();

<<<<<<< HEAD
    setModal("");
    setMeetingInfo(null);

    await channelIdChangeHandler(meetingChannelArn);
  };
=======
    setModal('');
    setMeetingInfo(null);

    await channelIdChangeHandler(meetingChannelArn);
  }
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

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
<<<<<<< HEAD
          message: "Successfully removed members from the channel.",
          severity: "success",
=======
          message: 'Successfully removed members from the channel.',
          severity: 'success',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          autoClose: true,
        },
      });
      setSelectedMember({});
    } catch (err) {
      dispatch({
        type: 0,
        payload: {
<<<<<<< HEAD
          message: "Error, unable to remove members.",
          severity: "error",
=======
          message: 'Error, unable to remove members.',
          severity: 'error',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
<<<<<<< HEAD
          severity: "success",
=======
          severity: 'success',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          autoClose: true,
        },
      });
      setSelectedMember({});
    } catch (err) {
      dispatch({
        type: 0,
        payload: {
<<<<<<< HEAD
          message: "Error, unable to leave the channel.",
          severity: "error",
=======
          message: 'Error, unable to leave the channel.',
          severity: 'error',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        },
      });
    }
  };

  const [isRestricted, setIsRestricted] = useState(
<<<<<<< HEAD
    activeChannel.Mode === "RESTRICTED"
  );

  useEffect(() => {
    setIsRestricted(activeChannel.Mode === "RESTRICTED");
=======
    activeChannel.Mode === 'RESTRICTED'
  );

  useEffect(() => {
    setIsRestricted(activeChannel.Mode === 'RESTRICTED');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  }, [activeChannel]);

  const loadUserActions = (role, channel) => {
    const joinChannelOption = (
      <PopOverItem key="join_channel" as="button" onClick={joinChannel}>
        <span>Join Channel</span>
      </PopOverItem>
    );
    const viewDetailsOption = (
      <PopOverItem
        key="view_channel_details"
        as="button"
<<<<<<< HEAD
        onClick={() => setModal("ViewDetails")}
=======
        onClick={() => setModal('ViewDetails')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      >
        <span>View channel details</span>
      </PopOverItem>
    );
    const editChannelOption = (
      <PopOverItem
        key="edit_channel"
        as="button"
<<<<<<< HEAD
        onClick={() => setModal("EditChannel")}
=======
        onClick={() => setModal('EditChannel')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      >
        <span>Edit channel</span>
      </PopOverItem>
    );
    const viewMembersOption = (
      <PopOverItem
        key="view_members"
        as="button"
<<<<<<< HEAD
        onClick={() => setModal("ViewMembers")}
=======
        onClick={() => setModal('ViewMembers')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      >
        <span>View members</span>
      </PopOverItem>
    );
    const addMembersOption = (
      <PopOverItem
        key="add_member"
        as="button"
<<<<<<< HEAD
        onClick={() => setModal("AddMembers")}
=======
        onClick={() => setModal('AddMembers')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      >
        <span>Add members</span>
      </PopOverItem>
    );
    const manageMembersOption = (
      <PopOverItem
        key="manage_members"
        as="button"
<<<<<<< HEAD
        onClick={() => setModal("ManageMembers")}
=======
        onClick={() => setModal('ManageMembers')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      >
        <span>Manage members</span>
      </PopOverItem>
    );
    const banOrAllowOption = (
<<<<<<< HEAD
      <PopOverItem key="ban_allow" as="button" onClick={() => setModal("Ban")}>
=======
      <PopOverItem key="ban_allow" as="button" onClick={() => setModal('Ban')}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        <span>Ban/Allow members</span>
      </PopOverItem>
    );
    const startMeetingOption = (
<<<<<<< HEAD
      <PopOverItem key="start_meeting" as="button" onClick={startMeeting}>
=======
      <PopOverItem
        key="start_meeting"
        as="button"
        onClick={startMeeting}
      >
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        <span>Start meeting</span>
      </PopOverItem>
    );
    const joinMeetingOption = (
<<<<<<< HEAD
      <PopOverItem key="join_meeting" as="button" onClick={joinMeeting}>
=======
      <PopOverItem
        key="join_meeting"
        as="button"
        onClick={joinMeeting}
      >
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        <span>Join meeting</span>
      </PopOverItem>
    );
    const leaveChannelOption = (
      <PopOverItem
        key="leave_channel"
        as="button"
<<<<<<< HEAD
        onClick={() => setModal("LeaveChannel")}
=======
        onClick={() => setModal('LeaveChannel')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      >
        <span>Leave channel</span>
      </PopOverItem>
    );
    const deleteChannelOption = (
      <PopOverItem
        key="delete_channel"
        as="button"
<<<<<<< HEAD
        onClick={() => setModal("DeleteChannel")}
=======
        onClick={() => setModal('DeleteChannel')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
      viewDetailsOption,
      editChannelOption,
      <PopOverSeparator key="separator1" className="separator" />,
      addMembersOption,
      manageMembersOption,
      banOrAllowOption,
      <PopOverSeparator key="separator2" className="separator" />,
      startMeetingOption,
      <PopOverSeparator key="separator3" className="separator" />,
      leaveChannelOption,
      deleteChannelOption,
    ];
    const restrictedMemberActions = [
      viewDetailsOption,
      <PopOverSeparator key="separator1" className="separator" />,
      viewMembersOption,
      <PopOverSeparator key="separator2" className="separator" />,
      startMeetingOption,
      <PopOverSeparator key="separator3" className="separator" />,
      leaveChannelOption,
    ];
    const unrestrictedMemberActions = [
      viewDetailsOption,
      <PopOverSeparator key="separator1" className="separator" />,
      viewMembersOption,
      addMembersOption,
      <PopOverSeparator key="separator2" className="separator" />,
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
<<<<<<< HEAD
          return role === "moderator"
            ? meetingModeratorActions
            : meetingMemberActions;
        }
      }

      if (role === "moderator") {
=======
          return role === 'moderator' ? meetingModeratorActions : meetingMemberActions;
        }
      }

      if (role === 'moderator') {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        return moderatorActions;
      }
      return isRestricted ? restrictedMemberActions : unrestrictedMemberActions;
    }

<<<<<<< HEAD
    if (role === "moderator") {
      return noMeetingModeratorActions;
    }
    return isRestricted
      ? noMeetingRestrictedMemberActions
      : noMeetingUnrestrictedMemberActions;
=======
    if (role === 'moderator') {
      return noMeetingModeratorActions;
    }
    return isRestricted ? noMeetingRestrictedMemberActions : noMeetingUnrestrictedMemberActions;
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
      />
      <div className="channel-list-wrapper">
        <div className="channel-list-header">
          <div className="channel-list-header-title">Channels</div>
          <IconButton
            className="create-channel-button channel-options"
<<<<<<< HEAD
            onClick={() => setModal("NewChannel")}
=======
            onClick={() => setModal('NewChannel')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
            icon={<Dots width="1.5rem" height="1.5rem" />}
          />
        </div>
        <ChannelList
          style={{
<<<<<<< HEAD
            padding: "8px",
=======
            padding: '8px',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          }}
        >
          {channelList.map((channel) => (
            <ChannelItem
              key={channel.ChannelArn}
              name={channel.Name}
              actions={loadUserActions(userPermission.role, channel)}
              isSelected={channel.ChannelArn === activeChannel.ChannelArn}
<<<<<<< HEAD
              onClick={(e) => {
=======
              onClick={e => {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
                e.stopPropagation();
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
