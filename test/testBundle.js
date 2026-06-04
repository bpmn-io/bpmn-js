import './globals.js';

var allTests = import.meta.webpackContext('.', {
  recursive: true,
  regExp: /(spec|integration).*Spec\.js$/
});

allTests.keys().forEach(allTests);
