import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  ignored: [
    'dist',
    'coverage'
  ],
  build: [
    'test/config/*.cjs',
    'tasks/**/*.js',
    '*.js',
    '*.mjs'
  ],
  test: [
    'test/**/*.js'
  ]
};

export default [
  {
    ignores: files.ignored
  },

  // build
  ...bpmnIoPlugin.configs.node.map(config => {

    return {
      ...config,
      files: files.build
    };
  }),

  // lib + test
  ...bpmnIoPlugin.configs.browser.map(config => {

    return {
      ...config,
      ignores: files.build
    };
  }),

  ...bpmnIoPlugin.configs.esm.map(config => {

    return {
      ...config,
      ignores: [
        ...files.build,
        ...files.test
      ]
    };
  }),

  // test
  ...bpmnIoPlugin.configs.mocha.map(config => {

    return {
      ...config,
      files: files.test,
    };
  })
];