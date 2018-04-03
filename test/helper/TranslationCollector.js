import translate from 'diagram-js/lib/i18n/translate/translate';

function collectTranslations(template, replacements) {
  var log = {
    type: 'translations',
    msg: template
  };

  console.log(JSON.stringify(log));

  return translate(template, replacements);
}

export default {
  translate: [ 'value', collectTranslations ]
};