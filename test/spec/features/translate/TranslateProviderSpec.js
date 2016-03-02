'use strict';

var Modeler = require('../../../../lib/Modeler');

var TestContainer = require('mocha-test-container-support');

describe('features - translate', function() {

  var container,
      diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  function fakeTranslator(str, args){
    // context pad
    if (str === 'Remove'){
      str = 'Eliminar';
    }
    // palette
    if (str === 'Activate the hand tool'){
      str = 'Activar herramienta mano';
    }
    return str
      .replace(/{([\w]+?)}/g, function($0, $1) {
        return args[$1] || $0;
      });
  }

  function createModeler(xml, cb) {
    var modeler = new Modeler({ container: container });
    modeler.importXML(xml, function(err, warnings) {
      cb(err, warnings, modeler);
    });
  }

  function triggerApplyLanguage(cb){
    createModeler(diagramXML, function(err, warnings, modeler) {
      var translate = modeler.get('translate'),
          eventBus = modeler.get('eventBus');
      // use the fakeTranslator
      translate.t = fakeTranslator;
      eventBus.on('translate.applyLanguage', function(){
        cb(modeler);
      });
      translate.applyLanguage();
    });
  }

  describe('dependency injection', function() {
    it('should be available via di as <translate>', function(done) {
      createModeler(diagramXML, function(err, warnings, modeler) {
        expect(modeler.get('translate').constructor.name).to.equal('TranslateProvider');
        done(err);
      });
   });
  });

  describe('events', function() {
    it('should fire event when apply language', function(done) {
      triggerApplyLanguage(function(){
        done();
      });
    });
  });

  describe('change UI language', function() {
    it('should change the language in the context pad', function(done) {
      triggerApplyLanguage(function(modeler){
        var contextPad = modeler.get('contextPad');
        contextPad.open('Task_1');
        expect(contextPad._current.entries.delete.title).to.equal('Eliminar');
        done();
      });
    });

    it('should change the language in the palette', function(done) {
      triggerApplyLanguage(function(modeler){
        var palette = modeler.get('palette');
        expect(palette.getEntries()['hand-tool'].title).to.equal('Activar herramienta mano');
        done();
      });
    });
  });
});