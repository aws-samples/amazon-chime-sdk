// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useContentShareState } from 'amazon-chime-sdk-component-library-react';
import React, { useContext, useEffect, useState } from 'react';
import { Layout } from '../containers/CustomizedVideoTileGrid';

interface GridStateValue {
  layout: Layout;
  setLayout: (layout: Layout) => void;
}

const GridStateContext = React.createContext<GridStateValue | null>(null);

const GridStateProvider: React.FC = ({ children }) => {
  const [layout, setLayout] = useState<Layout>('gallery');
  const { sharingAttendeeId } = useContentShareState();

  useEffect(() => {
    if (sharingAttendeeId && layout === 'gallery') {
      setLayout('featured');
    }
  }, [sharingAttendeeId]);

  const value = {
    layout,
    setLayout,
  };

  return (
    <GridStateContext.Provider value={value}>
      {children}
    </GridStateContext.Provider>
  );
};

const useGridState = (): GridStateValue => {
  const state = useContext(GridStateContext);

  if (!state) {
    throw new Error('useGridState must be used within GridStateProvider');
  }

  return state;
}

export { GridStateProvider, useGridState };
