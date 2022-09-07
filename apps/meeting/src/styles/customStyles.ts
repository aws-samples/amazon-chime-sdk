// This file will contains all the custom styles to override the default

import { PixelToRem } from "./styleHelpers";

const flexCenterCenter = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const bigButtonStyles = {
  height: PixelToRem(40),
  width: PixelToRem(250),
  ...flexCenterCenter,
};

export { bigButtonStyles as BigButtonStyles };
