// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import {
  Navbar,
  NavbarHeader,
  NavbarItem,
  Attendees,
  Eye,
  SignalStrength
} from 'amazon-chime-sdk-component-library-react';

import { useNavigation } from '../../providers/NavigationProvider';
import { useAppState } from '../../providers/AppStateProvider';
import LocalMediaStreamMetrics from '../LocalMediaStreamMetrics';
import { useGridState } from '../../providers/GridStateProvider';
import GalleryLayout from '../../components/GalleryLayout';
import FeaturedLayout from '../../components/FeaturedLayout';

const Navigation = () => {
  const { toggleRoster, closeNavbar } = useNavigation();
  const { theme, toggleTheme } = useAppState();
  const { layout, setLayout } = useGridState();
  return (
    <Navbar className="nav" flexDirection="column" container>
      <NavbarHeader title="Navigation" onClose={closeNavbar} />
      <NavbarItem
        icon={<Attendees />}
        onClick={toggleRoster}
        label="Attendees"
      />
      <NavbarItem
        icon={<Eye />}
        onClick={toggleTheme}
        label={theme === 'light' ? 'Dark mode' : 'Light mode'}
      />
      <NavbarItem
        icon={<SignalStrength />}
        onClick={() => {}}
        label="Media metrics"
      >
        <LocalMediaStreamMetrics />
      </NavbarItem>
      <NavbarItem
        icon={layout === 'gallery'
          ? <GalleryLayout />
          : <FeaturedLayout />}
        onClick={() => {
          layout === 'gallery'
            ? setLayout('featured')
            : setLayout('gallery')
        }}
        label="Switch Layout"
      />
    </Navbar>
  );
};

export default Navigation;
