// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Chime from 'aws-sdk/clients/chime';
import { Observable } from 'lib0/observable';
import { v4 as uuid } from 'uuid';

interface ChannelMessage {
  Content: string;
  CreatedTimestamp: Date;
  LastEditedTimestamp: Date;
  LastUpdatedTimestamp: Date;
  MessageId: string;
  Metadata: string;
  Redacted: boolean;
  Sender: {
    Arn: string;
    Name: string;
  }
  Type: 'STANDARD' | 'CONTROL'
}

class Peer {
  constructor(
    public readonly peerId: string,
    public synced: boolean = false,
  ) { }
}

export enum Persistence {
  Persistent = 'PERSISTENT',
  NonPersistent = 'NON_PERSISTENT',
}

export class ChimeChannel extends Observable<string> {
  private readonly peerMap = new Map<string, Peer>();

  private channelSynced = false;

  constructor(
    private readonly appInstanceUserArn: string,
    private readonly channelArn: string,
    private readonly chimeClient: Chime,
  ) {
    super();
  }

  isSynced = (): boolean => {
    console.log(`Channel synced: ${this.channelSynced}`);
    return this.channelSynced;
  };

  evaluateSynced = (): boolean => {
    let synced = true;
    for (const [peerId, peer] of this.peerMap) {
      if (!peer.synced) {
        console.log(`Peer is not synced. [peerId=${peerId}]`);
        synced = false;
        break;
      }
    }

    if (synced !== this.channelSynced) {
      this.channelSynced = synced;
      this.emit('synced', [synced]);
      console.log(`Update channel sync status. [Sync=${synced},channelArn=${this.channelArn}]`);
    }
    return synced;
  };

  addPeer = (peerId: string): void => {
    console.log(`Added peer: ${peerId}`);
    this.peerMap.set(peerId, new Peer(peerId));
  };

  removePeer = (peerId: string): void => {
    console.log(`Deleted peer: ${peerId}`);
    this.peerMap.delete(peerId);
  };

  hasPeer = (peerId: string): boolean => this.peerMap.has(peerId);

  setPeerSyncState = (peerId: string, synced: boolean): void => {
    if (this.peerMap.has(peerId)) {
      this.peerMap.get(peerId)!.synced = synced;
    } else {
      console.error(`Peer ${peerId} does not exists`);
    }
  };

  getUserArn = (): string | undefined => this.appInstanceUserArn;

  getChannelArn = (): string | undefined => this.channelArn;

  getMessages = async (): Promise<ChannelMessage[]> => {
    this.assertInitialized();

    const channelMessages: ChannelMessage[] = [];
    let nextToken;
    do {
      try {
        // eslint-disable-next-line no-await-in-loop
        const { ChannelMessages, NextToken } = await this.chimeClient.listChannelMessages({
          ChannelArn: this.channelArn,
          ChimeBearer: this.appInstanceUserArn,
          NextToken: nextToken,
        }).promise();
        channelMessages.push(...(ChannelMessages as ChannelMessage[]));
        nextToken = NextToken;
      } catch (error) {
        console.error(error);
        throw error;
      }
    } while (nextToken);
    return channelMessages;
  };

  sendMessage = async (message: Uint8Array, persistence: Persistence): Promise<void> => {
    this.assertInitialized();

    await this.chimeClient.sendChannelMessage({
      ChannelArn: this.channelArn,
      ClientRequestToken: uuid(),
      Content: String.fromCharCode(...message),
      Persistence: persistence,
      Type: 'STANDARD',
      ChimeBearer: this.appInstanceUserArn,
    }).promise();
  };

  private assertInitialized = (): void => {
    if (!this.channelArn || !this.appInstanceUserArn) {
      throw new Error(`Not initialized. [channelArn=${this.channelArn}, `
        + `appInstanceUserArn=${this.appInstanceUserArn}]`);
    }
  };
}
