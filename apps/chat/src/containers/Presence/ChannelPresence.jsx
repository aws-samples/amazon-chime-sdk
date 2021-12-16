// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import {
    ChannelList,
    ChannelItem,
} from 'amazon-chime-sdk-component-library-react';

import { useChatChannelState } from '../../providers/ChatMessagesProvider';
import { useAuthContext } from "../../providers/AuthProvider";

import './ChannelPresence.css';

const ChannelPresence = () => {
    const {member} = useAuthContext();
    const {activeChannelMembershipsWithPresence} = useChatChannelState();

    return (
        <>
            <div className="channel-members-list-wrapper">
                <div className="channel-members-list-header">
                    <div className="channel-list-header-title">Channel Members</div>
                </div>
                {activeChannelMembershipsWithPresence && activeChannelMembershipsWithPresence.length !== 0 && (
                    <ChannelList className="channel-members-list-item">
                        {activeChannelMembershipsWithPresence
                            .filter(membership => membership.Member.Name !== member.username)
                            .map((membership) => (
                                <ChannelItem
                                    key={membership.Member.Arn}
                                    name={`${membership.Member.Name} (${membership.Member.Presence.Status})`}
                                />
                            ))}
                    </ChannelList>
                )
                }
            </div>
        </>
    );
};

export default ChannelPresence;
