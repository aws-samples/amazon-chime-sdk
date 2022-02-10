// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// Publish status to channel every 10 seconds
export const PUBLISH_INTERVAL = 10000;

// Check status every 15 seconds
export const REFRESH_INTERVAL = 15000;

// 20 seconds
export const STATUS_GRACE_PERIOD = 20;

// Control messages have 30 bytes limit
export const MAX_PRESENCE_STATUS_LENGTH = 25;

export const PRESENCE_REGEX = /P\|/;
export const PRESENCE_PREFIX = 'P|';
export const PRESENCE_PREFIX_SEPARATOR = '|';

export const PresenceMode = {
    Auto: "Auto",
    Wfh: "Wfh",
    Custom: "Cu",
}

export const PresenceStatusPrefix = {
    Auto: "Auto|",
    Wfh: "Wfh|",
    Custom: "Cu|", // Keep it short for control messages
}

export const PresenceAutoStatus = {
    Online: "Online",
    Offline: "Offline",
    Idle: "Idle",
    Busy: "Busy",
}

export const toPresenceMessage = (type, status, includePrefix) => {
    const prefix = includePrefix ? PRESENCE_PREFIX : '';
    return `${prefix}${type}|${status}`;
}

export const isAutomaticStatusExpired = (lastUpdatedTimestamp) => {
    if (!lastUpdatedTimestamp) return lastUpdatedTimestamp;
    return (Date.now() - new Date(lastUpdatedTimestamp)) / 1000 > STATUS_GRACE_PERIOD;
}

export const toPresenceMap = (metadata) => {
    const parsedMetadata = metadata && JSON.parse(metadata);
    if (parsedMetadata && parsedMetadata.Presence) {
        return Object.fromEntries(parsedMetadata.Presence.map((entry) => [entry.u, entry.s]));
    }
    return null;
}
