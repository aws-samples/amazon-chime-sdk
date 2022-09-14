// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import AWS from 'aws-sdk';
import Chime from 'aws-sdk/clients/chime';
import {
  ConsoleLogger,
  DefaultMessagingSession,
  LogLevel,
  Message,
  MessagingSession,
  MessagingSessionConfiguration,
  MessagingSessionObserver,
} from 'amazon-chime-sdk-js';
import * as Y from 'yjs';
import { Observable } from 'lib0/observable';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as mutex from 'lib0/mutex';
import * as awarenessProtocol from 'y-protocols/awareness';
import { v4 as uuid } from 'uuid';
import debounce from 'lodash/debounce';

import { ChimeChannel, Persistence } from './channel';

enum MessageType {
  Sync = 0,
  Awareness = 1,
  QueryAwareness = 2,
  BroadcastPeerId = 3,
}

enum PeerOperation {
  Add = 0,
  Remove = 1,
}

export class MessagingProvider extends Observable<string> implements MessagingSessionObserver {
  private static readonly SEND_CHANNEL_MESSAGE_DELAY = 500;

  synced = false;

  shouldConnect = false;

  private messagingSession: MessagingSession | undefined;

  private pendingDocUpdates: Uint8Array[] = [];

  private pendingClientIds: Set<number> = new Set();

  private chimeClient: any;

  private channel: ChimeChannel | undefined;

  private readonly peerId: string = uuid();

  private readonly mux: any = mutex.createMutex();

  constructor(
    public readonly doc: Y.Doc,
    private readonly apiGatewayUrl: string,
    private readonly appInstanceArn: string,
    private readonly adminUserArn: string,
    private channelArn: string | null,
    public readonly awareness: awarenessProtocol.Awareness = new awarenessProtocol.Awareness(doc),
  ) {
    super();

    if (this.appInstanceArn === '') {
      throw new Error('AppInstanceArn is blank in appConfig');
    }

    if (this.adminUserArn === '') {
      throw new Error('AdminUserArn is blank in appConfig');
    }

    if (!this.isValidHttpsUrl(this.apiGatewayUrl)) {
      throw new Error('ApiGatewayUrl is an invalid url');
    }
    this.apiGatewayUrl = this.apiGatewayUrl.replace(/\/+$/, '');

    void this.connect();
  }

  get connected(): boolean {
    return this.shouldConnect;
  }

  connect = async (): Promise<void> => {
    if (!this.channelArn) {
      const channelResponse = await fetch(`${new URL(this.apiGatewayUrl).href}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appInstanceArn: this.appInstanceArn,
          appInstanceUserArn: this.adminUserArn,
        }),
      });
      const channelResponseBody = await channelResponse.json();
      console.log(`Created channel: ${channelResponseBody.ChimeChannelArn}`);
      this.channelArn = channelResponseBody.ChimeChannelArn;
    } else {
      console.log(`Use existing channel: ${this.channelArn}`);
    }
    const userResponse = await fetch(`${new URL(this.apiGatewayUrl).href}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: 'Demo User',
        appInstanceArn: this.appInstanceArn,
        channelArn: this.channelArn,
        adminUserArn: this.adminUserArn,
      }),
    });
    const userResponseBody = await userResponse.json();
    const appInstanceUserArn = `${this.appInstanceArn}/user/${userResponseBody.ChimeUserId}`;
    console.log(`Created user: ${appInstanceUserArn}`);

    AWS.config.update({ region: 'us-east-1' });
    AWS.config.credentials = new AWS.Credentials(
      userResponseBody.ChimeCredentials.AccessKeyId,
      userResponseBody.ChimeCredentials.SecretAccessKey,
      userResponseBody.ChimeCredentials.SessionToken,
    );

    this.chimeClient = new Chime({ region: 'us-east-1' });
    this.channel = new ChimeChannel(appInstanceUserArn, this.channelArn!, this.chimeClient);
    this.channel.on('synced', (synced: boolean) => {
      this.emit('synced', [{ synced }]);
    });

    this.shouldConnect = true;

    const endpoint = await this.chimeClient.getMessagingSessionEndpoint().promise();
    const configuration = new MessagingSessionConfiguration(
      appInstanceUserArn,
      null,
      endpoint.Endpoint!.Url!,
      this.chimeClient,
    );

    this.messagingSession = new DefaultMessagingSession(
      configuration,
      new ConsoleLogger('SDK', LogLevel.INFO),
    );
    this.messagingSession.addObserver(this);
    await this.messagingSession.start();
    this.doc.on('destroy', this.destroy);
    this.emit('connected', []);
  };

  disconnect = (): void => {
    this.shouldConnect = false;

    awarenessProtocol.removeAwarenessStates(this.awareness, [this.doc.clientID], 'disconnect');
    this.publishPeerId(this.peerId, PeerOperation.Remove);

    this.doc.off('update', this.docUpdateHandler);
    this.awareness.off('update', this.awarenessUpdateHandler);
    this.messagingSession?.removeObserver(this);
    this.messagingSession?.stop();
    console.log(`Disconnected the peer. [peerId=${this.peerId}]`);
  };

  destroy = (): void => {
    this.doc.off('destroy', this.destroy);
    super.destroy();
  };

  getChannelArn = (): string | undefined => this.channel!.getChannelArn();

  getUserArn = (): string | undefined => this.channel!.getUserArn();

  // Once the messaging session is connected, the provider attempts to load a document from
  // the Chime SDK messaging channel or from other peers.
  messagingSessionDidStart = (): void => {
    this.mux(() => {
      void this.loadDocument();
    });

    this.mux(() => {
      // Publish the peer ID so other peers can add it to their membership.
      this.publishPeerId(this.peerId, PeerOperation.Add);

      // Publish the current document as a state vector.
      const encoderSync = encoding.createEncoder();
      encoding.writeVarUint(encoderSync, MessageType.Sync);
      encoding.writeVarString(encoderSync, this.peerId);
      syncProtocol.writeSyncStep1(encoderSync, this.doc);
      void this.channel!.sendMessage(encoding.toUint8Array(encoderSync), Persistence.NonPersistent);

      // Publish the current document as a single update.
      const encoderState = encoding.createEncoder();
      encoding.writeVarUint(encoderState, MessageType.Sync);
      encoding.writeVarString(encoderState, this.peerId);
      syncProtocol.writeSyncStep2(encoderState, this.doc);
      void this.channel!.sendMessage(encoding.toUint8Array(encoderState), Persistence.NonPersistent);

      // Query awareness. Other peers will reply with their local awareness states.
      const encoderAwarenessQuery = encoding.createEncoder();
      encoding.writeVarUint(encoderAwarenessQuery, MessageType.QueryAwareness);
      encoding.writeVarString(encoderAwarenessQuery, this.peerId);
      void this.channel!.sendMessage(encoding.toUint8Array(encoderAwarenessQuery), Persistence.NonPersistent);

      // Publish local awareness state.
      const encoderAwarenessState = encoding.createEncoder();
      encoding.writeVarUint(encoderAwarenessState, MessageType.Awareness);
      encoding.writeVarString(encoderAwarenessState, this.peerId);
      encoding.writeVarUint8Array(encoderAwarenessState,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.doc.clientID]));
      void this.channel!.sendMessage(encoding.toUint8Array(encoderAwarenessState), Persistence.NonPersistent);
    });

    this.doc.on('update', this.docUpdateHandler);
    this.awareness.on('update', this.awarenessUpdateHandler);
  };

  messagingSessionDidStop = (event: CloseEvent): void => {
    console.log('The Chime SDK messaging session stopped due to', event);
  };

  messagingSessionDidReceiveMessage = (message: Message): void => {
    if (message.type === 'CREATE_CHANNEL_MESSAGE') {
      const payload = JSON.parse(message.payload);
      if (payload.ChannelArn !== this.channelArn) {
        return;
      }

      const buf = Uint8Array.from([...payload.Content].map((ch: string) => ch.charCodeAt(0)));
      const decoder = decoding.createDecoder(buf);
      const encoder = encoding.createEncoder();
      const messageType: MessageType = decoding.readVarUint(decoder);
      switch (messageType) {
        case MessageType.Sync:
          this.handleSyncMessage(encoder, decoder);
          break;
        case MessageType.Awareness:
          this.handleAwareness(decoder);
          break;
        case MessageType.QueryAwareness:
          this.handleQueryAwareness(encoder, decoder);
          break;
        case MessageType.BroadcastPeerId:
          this.handleBroadcastPeerId(decoder);
          break;
        default:
          break;
      }
    }
  };

  // If the provider receives the state vector (messageYjsSyncStep1), the provider sends
  // the current document as a single update.
  //
  // If the provider receives document updates (messageYjsSyncStep2) when the Chime channel is not synced,
  // the provider notifies other peers that it synced the peer ID.
  private readonly handleSyncMessage = (encoder: encoding.Encoder, decoder: decoding.Decoder): void => {
    const peerId = decoding.readVarString(decoder);
    if (peerId === this.peerId) {
      return;
    }

    encoding.writeVarUint(encoder, MessageType.Sync);
    encoding.writeVarString(encoder, this.peerId);

    const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, this.doc, this);
    if (syncMessageType === syncProtocol.messageYjsSyncStep1) {
      void this.channel!.sendMessage(encoding.toUint8Array(encoder), Persistence.NonPersistent);
    } else if (syncMessageType === syncProtocol.messageYjsSyncStep2 && !this.channel!.isSynced()) {
      if (this.channel!.hasPeer(peerId)) {
        this.channel!.setPeerSyncState(peerId, true);
      } else {
        this.channel!.addPeer(peerId);
        this.channel!.setPeerSyncState(peerId, true);
        this.publishPeerId(this.peerId, PeerOperation.Add);
      }

      this.channel!.evaluateSynced();
      console.log(`Synced with the peer. [peerId=${peerId}]`);
    }
  };

  private readonly handleQueryAwareness = (encoder: encoding.Encoder, decoder: decoding.Decoder): void => {
    const peerId = decoding.readVarString(decoder);
    if (peerId === this.peerId) {
      return;
    }

    encoding.writeVarUint(encoder, MessageType.Awareness);
    encoding.writeVarString(encoder, this.peerId);
    encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(
      this.awareness, [...this.awareness.getStates().keys()],
    ));
    void this.channel!.sendMessage(encoding.toUint8Array(encoder), Persistence.NonPersistent);
  };

  private readonly handleAwareness = (decoder: decoding.Decoder): void => {
    const peerId = decoding.readVarString(decoder);
    if (peerId === this.peerId) {
      return;
    }

    awarenessProtocol.applyAwarenessUpdate(this.awareness, decoding.readVarUint8Array(decoder), this);
  };

  private readonly handleBroadcastPeerId = (decoder: decoding.Decoder): void => {
    const peerId = decoding.readVarString(decoder);
    if (peerId === this.peerId) {
      return;
    }

    const peerOperation: PeerOperation = decoding.readUint8(decoder);
    if (peerOperation === PeerOperation.Add) {
      if (!this.channel!.hasPeer(peerId)) {
        this.channel!.addPeer(peerId);
        this.publishPeerId(this.peerId, PeerOperation.Add);
      }
    } else if (peerOperation === PeerOperation.Remove) {
      this.channel!.removePeer(peerId);
      this.publishPeerId(this.peerId, PeerOperation.Add);
    }
  };

  private readonly publishPeerId = (peerId: string, operation: PeerOperation): void => {
    const encoderPeerId = encoding.createEncoder();
    encoding.writeVarUint(encoderPeerId, MessageType.BroadcastPeerId);
    encoding.writeUint8(encoderPeerId, operation);
    encoding.writeVarString(encoderPeerId, peerId);
    void this.channel!.sendMessage(encoding.toUint8Array(encoderPeerId), Persistence.NonPersistent);
  };

  private readonly docUpdateHandler = (update: Uint8Array, _origin: any): void => {
    this.pendingDocUpdates.push(update);
    this.sendPendingDocUpdates();
  };

  private isValidHttpsUrl = (value: string): boolean => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  private readonly sendPendingDocUpdates = debounce(() => {
    const mergedUpdate = Y.mergeUpdates(this.pendingDocUpdates);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MessageType.Sync);
    encoding.writeVarString(encoder, this.peerId);
    syncProtocol.writeUpdate(encoder, mergedUpdate);
    void this.channel!.sendMessage(encoding.toUint8Array(encoder), Persistence.Persistent);
    this.pendingDocUpdates = [];
    void this.sendPendingAwarenessUpdates.flush();
  }, MessagingProvider.SEND_CHANNEL_MESSAGE_DELAY, {
    maxWait: MessagingProvider.SEND_CHANNEL_MESSAGE_DELAY,
  });

  private readonly awarenessUpdateHandler = (
    { added, updated, removed }: {
      added: number[],
      updated: number[],
      removed: number[],
    },
    _origin: any,
  ): void => {
    for (const clientId of [...added, ...updated, ...removed]) {
      this.pendingClientIds.add(clientId);
    }
    this.sendPendingAwarenessUpdates();
  };

  private readonly sendPendingAwarenessUpdates = debounce(() => {
    if (!this.pendingClientIds.size) {
      return;
    }
    const changedClients = [...this.pendingClientIds];
    const encoderAwareness = encoding.createEncoder();
    encoding.writeVarUint(encoderAwareness, MessageType.Awareness);
    encoding.writeVarString(encoderAwareness, this.peerId);
    encoding.writeVarUint8Array(
      encoderAwareness,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients),
    );
    void this.channel!.sendMessage(encoding.toUint8Array(encoderAwareness), Persistence.NonPersistent);
    this.pendingClientIds = new Set();
  }, MessagingProvider.SEND_CHANNEL_MESSAGE_DELAY, {
    maxWait: MessagingProvider.SEND_CHANNEL_MESSAGE_DELAY,
  });

  private readonly loadDocument = async (): Promise<void> => {
    try {
      const channelMessages = await this.channel!.getMessages();
      this.doc.transact(() => {
        for (const channelMessage of channelMessages) {
          const content = channelMessage.Content;
          const buf = Uint8Array.from([...content].map((ch: string) => ch.charCodeAt(0)));
          const decoder = decoding.createDecoder(buf);
          decoding.readVarUint(decoder); // Reads messageType
          decoding.readVarString(decoder); // Reads peerId
          decoding.readVarUint(decoder); // Reads syncStep
          const update = decoding.readVarUint8Array(decoder); // Reads update
          Y.applyUpdate(this.doc, update);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };
}
