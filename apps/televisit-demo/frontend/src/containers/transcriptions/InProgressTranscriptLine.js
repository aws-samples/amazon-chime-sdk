import React, { useMemo } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import s from './InProgressTranscriptLine.module.css';

function TranscriptWord ({ word }) {
  return (
    <span className={s.word}>
      <TransitionGroup component={null}>
        <CSSTransition key={word} timeout={300} classNames={{ enter: s.swapIn, enterActive: s.swapInActive, exit: s.exit, exitActive: s.exitActive }}>
          <span>{word}</span>
        </CSSTransition>
      </TransitionGroup>
    </span>
  );
}

export default function InProgressTranscriptLine ({
  text
}) {
  const words = useMemo(() => (text || '').split(/(\W+)/).filter(Boolean), [text]);

  return (
    <p className={s.base}>
      <TransitionGroup component={null}>
        {words.map((w, i) => (
          <CSSTransition
            key={i}
            timeout={300}
            classNames={{
              enter: s.enter,
              enterActive: s.enterActive,
              exit: s.exit,
              exitActive: s.exitActive
            }}
          >
              <TranscriptWord word={w} />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </p>
  );
}
