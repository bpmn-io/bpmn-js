'use strict';

var Modeler = require('../../../../lib/Modeler');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

describe('features - i18n', function() {

  var container,
      diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  function createModeler(xml, done) {
    var modeler = new Modeler({ container: container });
    modeler.importXML(xml, function(err, warnings) {
      done(err, warnings, modeler);
    });
  }

  function triggerChangeLanguage(newLang, translationObj, cb){
    createModeler(diagramXML, function(err, warnings, viewer) {
      var i18n = viewer.get('i18n')
      i18n.on('languageChanged', function() {
        cb(viewer);
      });
      i18n.addResourceBundle(newLang, 'translation', translationObj);
      i18n.changeLanguage(newLang);
    });
  }

  describe('dependency injection', function() {
    it('should be available via di as <118n>', function(done) {
      createModeler(diagramXML, function(err, warnings, viewer) {
        expect(viewer.get('i18n').constructor.name).to.equal('I18n');
        done(err);
      });
   });
  });

  describe('events', function() {
    it('should fire event when language changes', function(done) {
      var newLang = 'es-MX';
      triggerChangeLanguage(newLang, {}, function(viewer){
        expect(viewer.get('i18n').language).to.equal(newLang);
        done();
      });
    });
  });

  describe('change UI language', function() {
    it('should change the language in the context pad', function(done) {
      var newLang = 'es-MX',
          translationObj = { 'Remove': 'Eliminar' },
          translationKeyToCheck = 'Remove';
      triggerChangeLanguage(newLang, translationObj, function(viewer){
        var contextPad = viewer.get('contextPad');
        contextPad.open('Task_1');
        expect(contextPad._current.entries.delete.title).to.equal(translationObj[translationKeyToCheck]);
        done();
      });
    });

    it('should change the language in the palette', function(done) {
      var newLang = 'es-MX',
        translationObj = { 'Activate the hand tool': 'Activar herramienta mano' },
        translationKeyToCheck = 'Activate the hand tool';
      triggerChangeLanguage(newLang, translationObj, function(viewer){
        var palette = viewer.get('palette');
        expect(palette.getEntries()['hand-tool'].title).to.equal(translationObj[translationKeyToCheck]);
        done();
      });
    });
  });
});