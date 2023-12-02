var fs = require('fs');
var path = require('path');

var translationsPath = path.join(__dirname, '../../docs/translations.json');

function TranslationReporter() {
  var translations = [];

  if (fs.existsSync(translationsPath)) {
    var file = fs.readFileSync(translationsPath, 'utf8');

    translations = JSON.parse(file);
  }

  this.onBrowserLog = function(browser, log, type) {
    if (log === undefined || typeof log !== 'string') {
      return;
    }

    if (log.substring(0, 1) === '\'') {
      log = log.substring(1, log.length - 1);
    }

    try {
      log = JSON.parse(log);

      if (log.type === 'translations' && !translations.includes(log.template)) {
        translations = [
          ...translations,
          log.template
        ];
      }
    } catch (e) {
      return;
    }
  };

  this.onRunComplete = function() {
    fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2));
  };
}

module.exports = {
  'reporter:translation-reporter' : [ 'type', TranslationReporter ]
};