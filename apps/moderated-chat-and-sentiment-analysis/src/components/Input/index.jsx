/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable import/no-unresolved */
// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useRef, useEffect } from 'react';
import { Input as InputComponent } from 'amazon-chime-sdk-component-library-react';
import { sendChannelMessage } from '../../api/ChimeAPI';
import './style.css';

const Input = ({ activeChannelArn, member }) => {
  const [text, setText] = useState('');
  const inputRef = useRef();

  const resetState = () => {
    setText('');
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current?.focus();
    }
  }, [activeChannelArn]);

  const onChange = (e) => {
    setText(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await sendChannelMessage(activeChannelArn, text, member);
    resetState();
  };

  return (
    <div className="message-input-container">
      <form onSubmit={onSubmit} className="message-input-form">
        <InputComponent
          onChange={onChange}
          value={text}
          type="text"
          placeholder="Type your message"
          autoFocus
          className="text-input"
          ref={inputRef}
        />
      </form>
    </div>
  );
};

export default Input;
