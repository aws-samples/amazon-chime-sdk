// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
import ReactDOM from "react-dom";
import Chat from "./Chat";
import configureAmplify from "./services/servicesConfig";
=======
import React from 'react';
import ReactDOM from 'react-dom';
import Chat from './Chat';
import configureAmplify from './services/servicesConfig';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

// Call services configuration
configureAmplify();

<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", (_event) => {
  ReactDOM.render(<Chat />, document.getElementById("root"));
=======
document.addEventListener('DOMContentLoaded', _event => {
  ReactDOM.render(<Chat />, document.getElementById('root'));
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
});
