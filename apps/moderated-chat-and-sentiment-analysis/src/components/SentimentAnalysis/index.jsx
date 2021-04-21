// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import {
  useChatMessagingState,
  useChatSentimentState,
} from '../../providers/ChatMessagesProvider';
import getReactionEmoji from '../../utilities/getReactionEmoji';
import './style.css';

const SentimentAnalysis = () => {
  const { messages } = useChatMessagingState();

  const { positiveCnt, negativeCnt } = useChatSentimentState();

  const getSentimentPercentage = (sentimentCnt, totalMessages) => {
    if (totalMessages === 0) {
      return '0%';
    }
    return `${((sentimentCnt / totalMessages) * 100).toFixed(2)}%`;
  };

  return (
    <>
      <div className="sentiment-emoji">{getReactionEmoji('POSITIVE')}</div>
      <div className="sentiment-percent">
        {getSentimentPercentage(positiveCnt, messages.length)}
      </div>
      <div className="sentiment-emoji">{getReactionEmoji('NEGATIVE')}</div>
      <div className="sentiment-percent">
        {getSentimentPercentage(negativeCnt, messages.length)}
      </div>
    </>
  );
};

export default SentimentAnalysis;
