var allTests = require.context('.', true, /(spec|integration).*Spec\.js$/);

allTests.keys().forEach(allTests);

var allSources = require.context('../lib', true, /.*\.js$/);

allSources.keys().forEach(allSources);