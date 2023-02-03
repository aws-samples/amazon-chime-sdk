// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import json from "@rollup/plugin-json";

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'build/amazon-chime-sdk.js',
      format: 'iife',
      name: 'ChimeSDK',
      sourcemap: true,
    },
  ],
  plugins: [
      resolve({
        browser: true,
        mainFields: ['module', 'browser'],
      }),
      json(),
      commonjs(),
      terser()
    ],
  onwarn: (warning, next) => {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      // TODO: Fix https://github.com/aws/amazon-chime-sdk-js/issues/107
      return;
    } else if (warning.code === 'EVAL') {
      return;
    } else if (warning.code === 'THIS_IS_UNDEFINED') {
      // https://stackoverflow.com/questions/43556940/rollup-js-and-this-keyword-is-equivalent-to-undefined
      return;
    }
    next(warning);
  },
};
