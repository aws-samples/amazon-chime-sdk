import React from 'react';

const getReactionEmoji = (sentiment) => {
  if (sentiment === 'POSITIVE') {
    return <>&#128516;</>;
  }
  if (sentiment === 'NEGATIVE') {
    return <>&#128532;</>;
  }
};

export default getReactionEmoji;
