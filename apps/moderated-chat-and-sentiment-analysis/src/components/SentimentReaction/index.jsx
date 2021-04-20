import React from 'react';
import { useChatSentimentState } from '../../providers/ChatMessagesProvider';
import getReactionEmoji from '../../utilities/getReactionEmoji';
import './style.css';

const SentimentReaction = () => {
  const { reactToSentiment } = useChatSentimentState();

  return (
    <>
      {reactToSentiment !== 'NEUTRAL' && (
        <div className="reaction-container">
          <div
            className="reaction-up"
            style={{ left: '5vw', animationDelay: '200ms' }}
          >
            <div
              className="reaction-wobble"
              style={{ animationDelay: '200ms' }}
            >
              {getReactionEmoji(reactToSentiment)}
            </div>
          </div>
          <div className="reaction-up" style={{ left: '15vw' }}>
            <div className="reaction-wobble">
              {getReactionEmoji(reactToSentiment)}
            </div>
          </div>
          <div
            className="reaction-up"
            style={{ left: '30vw', animationDelay: '500ms' }}
          >
            <div
              className="reaction-wobble"
              style={{ animationDelay: '500ms' }}
            >
              {getReactionEmoji(reactToSentiment)}
            </div>
          </div>
          <div
            className="reaction-up"
            style={{ left: '50vw', animationDelay: '400ms' }}
          >
            <div
              className="reaction-wobble"
              style={{ animationDelay: '400ms' }}
            >
              {getReactionEmoji(reactToSentiment)}
            </div>
          </div>
          <div
            className="reaction-up"
            style={{ left: '80vw', animationDelay: '600ms' }}
          >
            <div
              className="reaction-wobble"
              style={{ animationDelay: '600ms' }}
            >
              {getReactionEmoji(reactToSentiment)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SentimentReaction;
