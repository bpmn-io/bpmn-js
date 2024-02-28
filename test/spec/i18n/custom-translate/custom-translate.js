import translate from 'diagram-js/lib/i18n/translate/translate';

export default function customTranslate(template, replacements) {
  if (template === 'Delete') {
    template = 'Entfernen';
  }

  if (template === 'Activate hand tool') {
    template = 'Hand-Tool aktivieren';
  }

  return translate(template, replacements);
}