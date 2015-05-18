'use strict';

module.exports.isMac = function isMac() {
  return (/mac/i).test(navigator.platform);
};