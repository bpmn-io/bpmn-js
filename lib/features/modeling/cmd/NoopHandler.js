'use strict';

function NoopHandler() {}

module.exports = NoopHandler;

NoopHandler.prototype.execute = function() {};
NoopHandler.prototype.revert = function() {};