<<<<<<< HEAD
import React from "react";
import s from "./SOAPReviewPane.module.css";
import cs from "clsx";

import { Heading, Textarea } from "@chakra-ui/react";

export default function SOAPReviewPane({ onInputChange, inputText }) {
  return (
    <div className={cs(s.base)}>
      <div className={s.page}>
        <Textarea
          width="100%"
          value={inputText}
          rows={35}
          onChange={onInputChange}
        />
=======
import React from 'react';
import s from './SOAPReviewPane.module.css';
import cs from 'clsx';

import { Heading, Textarea } from '@chakra-ui/react';

export default function SOAPReviewPane ({ onInputChange, inputText }) {
  return (
    <div className={cs(s.base)}>
      <div className={s.page}>
	      <Textarea
	        width="100%"
	        value={inputText}
	        rows={35}
	        onChange={onInputChange}
	      />
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      </div>
    </div>
  );
}
