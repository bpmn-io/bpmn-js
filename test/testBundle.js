var allTests = require.context('.', true, /(spec|integration).*Spec\.js$/);

allTests.keys().forEach(allTests);