// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import json from "@rollup/plugin-json";
import packageJson from "./package.json";
import progress from 'rollup-plugin-progress';
import sizes from 'rollup-plugin-sizes';

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
    nodeResolve({mainFields: ['module', 'main', 'browser'], preferBuiltins: true,}), typescript(),commonjs({include: [
      'node_modules/'
      ]}),json(),progress(), sizes({details: false})],
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
