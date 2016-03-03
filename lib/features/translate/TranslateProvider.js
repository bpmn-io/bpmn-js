'use strict';

/**
 * A translation helper for bpmn-js
 */

function TranslateProvider(eventBus) {
  this._eventBus = eventBus;
}

TranslateProvider.$inject = ['eventBus'];

TranslateProvider.prototype.t = function(str, args) {
  /*
   * Simple string interpolation
   * @params {string} str - String to interpolate
   * @params {object} args - Object with the substitutes
   */
  return str
    .replace(/{([\w]+?)}/g, function($0, $1) {
      return args[$1] || $0;
    });
};

TranslateProvider.prototype.applyLanguage = function() {
  this._eventBus.fire('translate.applyLanguage');
};

module.exports = TranslateProvider;
