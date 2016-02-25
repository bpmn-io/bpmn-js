'use strict';

/**
 * An 18n wrapper for BPMN 2.0 elements
 */
var i18next = require('i18next'),
    defaultOptions = require('./DefaultOptions');

function I18n() {
}

I18n.prototype = i18next.init(defaultOptions);

module.exports = I18n;
