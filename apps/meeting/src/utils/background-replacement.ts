// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BackgroundImageBeach } from './background-replacement-image';
import { ReplacementDropdownOptionType, ReplacementOptions, ReplacementType } from '../types/index';

export async function createBlob(option: ReplacementDropdownOptionType): Promise<Blob> {
  const { type, value } = option;
  switch (type) {
    case ReplacementType.Color:
      return await createColorBlob(value);
      
    case ReplacementType.Image:
      return await createImageBlob(value);

    default:
      throw new Error(`Unsupported replacement option: ${option}`);
  }
}
export async function createColorBlob(color: string): Promise<Blob> {
  // Validate the hex color format
  const isValidHex = (color: string) => /^#[0-9A-F]{6}$/i.test(color);
  if (!isValidHex(color)) {
    throw new Error(`Invalid hex color format: ${color}`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  if (ctx !== null) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 500, 500);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob !== null) {
          console.log(`loaded canvas ${canvas}: ${blob}`);
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      });
    });
  } else {
    throw new Error('Failed to get canvas context');
  }
}

export async function createImageBlob(image: string): Promise<Blob> {
  let option: string | undefined;
  switch (image) {
    case ReplacementOptions.Beach:
      option = BackgroundImageBeach();
      break;
    default:
      return Promise.reject(new Error(`Unsupported replacement image: ${image}`));
  }
  try {
    const response = await fetch(option);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return blob;
  } catch (e) {
    console.log(`Cannot create image blob with ${image}: ${e}`);
    throw e;
  }
}
