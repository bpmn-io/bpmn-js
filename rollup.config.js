import { terser } from 'rollup-plugin-terser';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import license from 'rollup-plugin-license';
import replace from 'rollup-plugin-replace';

import {
  readFileSync
} from 'fs';

import pkg from './package.json';

const outputDir = 'dist';

const distros = [
  {
    input: 'Viewer',
    output: 'bpmn-viewer'
  },
  {
    input: 'NavigatedViewer',
    output: 'bpmn-navigated-viewer'
  },
  {
    input: 'Modeler',
    output: 'bpmn-modeler'
  }
];

const configs = distros.reduce(function(configs, distro) {
  const {
    input,
    output
  } = distro;

  return [
    ...configs,
    {
      input: `./lib/${input}.js`,
      output: {
        name: 'BpmnJS',
        file: `${outputDir}/${output}.development.js`,
        format: 'umd'
      },
      plugins: pgl([
        banner(output)
      ])
    },
    {
      input: `./lib/${input}.js`,
      output: {
        name: 'BpmnJS',
        file: `${outputDir}/${output}.production.min.js`,
        format: 'umd'
      },
      plugins: pgl([
        banner(output, true),
        terser({
          output: {
            comments: /license|@preserve/
          }
        })
      ])
    }
  ];
}, []);

export default configs;


// helpers //////////////////////

function banner(bundleName, minified) {

  const bannerName = (
    minified
      ? 'banner-min'
      : 'banner'
  );

  const bannerTemplate = readFileSync(`${__dirname}/resources/${bannerName}.txt`, 'utf8');

  const banner = processTemplate(bannerTemplate, {
    version: pkg.version,
    date: today(),
    name: bundleName
  });

  return license({
    banner
  });
}

function pgl(plugins=[]) {
  return [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    nodeResolve({
      mainFields: [
        'browser',
        'module',
        'main'
      ]
    }),
    commonjs(),
    json(),
    ...plugins
  ];
}

function pad(n) {
  if (n < 10) {
    return '0' + n;
  } else {
    return n;
  }
}

function today() {
  const d = new Date();

  return [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate())
  ].join('-');
}

function processTemplate(str, args) {
  return str.replace(/\{\{\s*([^\s]+)\s*\}\}/g, function(_, n) {

    var replacement = args[n];

    if (!replacement) {
      throw new Error('unknown template {{ ' + n + '}}');
    }

    return replacement;
  });
}