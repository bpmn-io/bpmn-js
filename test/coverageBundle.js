import './globals.js';

var allTests = import.meta.webpackContext('.', {
  recursive: true,
  regExp: /(spec|integration).*Spec\.js$/
});

allTests.keys().forEach(allTests);

var allSources = import.meta.webpackContext('../lib', {
  recursive: true,
  regExp: /.*\.js$/
});

allSources.keys().forEach(allSources);
