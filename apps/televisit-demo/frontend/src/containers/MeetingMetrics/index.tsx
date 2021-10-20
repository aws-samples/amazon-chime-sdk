// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
import { useBandwidthMetrics } from "amazon-chime-sdk-component-library-react";

import { StyledMetrics } from "./Styled";
import { useNavigation } from "../../providers/NavigationProvider";
=======
import React from 'react';
import { useBandwidthMetrics } from 'amazon-chime-sdk-component-library-react';

import { StyledMetrics } from './Styled';
import { useNavigation } from '../../providers/NavigationProvider';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

function formatMetric(metric: number | null) {
  return metric ? `${metric} Kbps` : null;
}

const MeetingMetrics = () => {
  const { showMetrics } = useNavigation();

  return showMetrics ? <BandwidthMetrics /> : null;
};

const BandwidthMetrics = () => {
<<<<<<< HEAD
  const { availableIncomingBandwidth, availableOutgoingBandwidth } =
    useBandwidthMetrics();
=======
  const {
    availableIncomingBandwidth,
    availableOutgoingBandwidth
  } = useBandwidthMetrics();
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  return (
    <StyledMetrics>
      <p className="metric title">Bandwidth</p>
      <p className="metric">
<<<<<<< HEAD
        Incoming: {formatMetric(availableIncomingBandwidth) || "unavailable"}
      </p>
      <p className="metric">
        Outgoing: {formatMetric(availableOutgoingBandwidth) || "unavailable"}
=======
        Incoming: {formatMetric(availableIncomingBandwidth) || 'unavailable'}
      </p>
      <p className="metric">
        Outgoing: {formatMetric(availableOutgoingBandwidth) || 'unavailable'}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      </p>
    </StyledMetrics>
  );
};

export default MeetingMetrics;
