/* eslint-env node */

import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: './headless-test.js',
  output: {
    file: './dist/headless-test.js',
  },
  plugins: pgl()
};

function pgl(plugins = []) {
  return [
    nodeResolve(),
    commonjs(),
    json(),
    ...plugins
  ];
}