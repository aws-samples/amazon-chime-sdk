<<<<<<< HEAD
import React, { useMemo } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import s from "./InProgressTranscriptLine.module.css";

function TranscriptWord({ word }) {
  return (
    <span className={s.word}>
      <TransitionGroup component={null}>
        <CSSTransition
          key={word}
          timeout={300}
          classNames={{
            enter: s.swapIn,
            enterActive: s.swapInActive,
            exit: s.exit,
            exitActive: s.exitActive,
          }}
        >
=======
import React, { useMemo } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import s from './InProgressTranscriptLine.module.css';

function TranscriptWord ({ word }) {
  return (
    <span className={s.word}>
      <TransitionGroup component={null}>
        <CSSTransition key={word} timeout={300} classNames={{ enter: s.swapIn, enterActive: s.swapInActive, exit: s.exit, exitActive: s.exitActive }}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          <span>{word}</span>
        </CSSTransition>
      </TransitionGroup>
    </span>
  );
}

<<<<<<< HEAD
export default function InProgressTranscriptLine({ text }) {
  const words = useMemo(
    () => (text || "").split(/(\W+)/).filter(Boolean),
    [text]
  );
=======
export default function InProgressTranscriptLine ({
  text
}) {
  const words = useMemo(() => (text || '').split(/(\W+)/).filter(Boolean), [text]);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

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
<<<<<<< HEAD
              exitActive: s.exitActive,
            }}
          >
            <TranscriptWord word={w} />
=======
              exitActive: s.exitActive
            }}
          >
              <TranscriptWord word={w} />
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          </CSSTransition>
        ))}
      </TransitionGroup>
    </p>
  );
}
