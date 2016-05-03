'use strict';

var translate = require('diagram-js/lib/i18n/translate/translate');

function collectTranslations(template, replacements) {
  var log = {
    type: 'translations',
    msg: template
  };

  console.log(JSON.stringify(log));

  return translate(template, replacements);
}

module.exports = {
  translate: [ 'value', collectTranslations ]
};