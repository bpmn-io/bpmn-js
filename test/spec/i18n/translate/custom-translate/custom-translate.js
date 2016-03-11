'use strict';

var translate = require('../../../../../lib/i18n/translate/translate');

module.exports = function customTranslate(template, replacements) {
  if (template === 'Remove') {
    template = 'Eliminar';
  }

  if (template === 'Activate the hand tool') {
    template = 'Activar herramienta mano';
  }

  return translate(template, replacements);
};