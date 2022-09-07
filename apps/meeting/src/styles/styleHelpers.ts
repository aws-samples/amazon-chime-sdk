// This file will contain all the helper functions for styling

const pixelToRem = (pixelUnit: number): string => `${pixelUnit/16}rem`;

export {
    pixelToRem as PixelToRem
}