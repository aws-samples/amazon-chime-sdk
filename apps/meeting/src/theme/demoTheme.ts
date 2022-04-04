import { lightTheme, darkTheme } from 'amazon-chime-sdk-component-library-react';

const { colors: lightThemeColors, shadows: lightThemeShadows } = lightTheme;
const { colors: darkThemeColors, shadows: darkThemeShadows } = darkTheme;

const chatLightTheme = {
  title: lightThemeColors.greys.grey100,
  primaryText: lightThemeColors.greys.grey80,
  secondaryText: lightThemeColors.greys.grey50,
  headerBorder: lightThemeColors.greys.grey40,
  containerBorder: lightThemeColors.greys.grey30,
  bgd: lightThemeColors.greys.grey10,
  fgd: lightThemeColors.greys.white,
  shadow: lightThemeShadows.large,
  maxWidth: '18.5rem',
};

const chatDarkTheme = {
  title: darkThemeColors.greys.white,
  primaryText: darkThemeColors.greys.white,
  secondaryText: darkThemeColors.greys.grey20,
  headerBorder: darkThemeColors.greys.black,
  containerBorder: darkThemeColors.greys.black,
  bgd: darkThemeColors.greys.grey100,
  fgd: darkThemeColors.greys.grey60,
  shadow: darkThemeShadows.large,
  maxWidth: '18.5rem',
};

export const demoLightTheme = {
  ...lightTheme,
  chat: chatLightTheme,
};

export const demoDarkTheme = {
  ...darkTheme,
  chat: chatDarkTheme,
};
