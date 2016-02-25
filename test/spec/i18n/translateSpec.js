'use strict';

require('test/TestHelper');

/* global bootstrapModeler, inject */

var coreModule = require('lib/core'),
    translateModule = require('diagram-js/lib/i18n/translate'),
    customTranslateModule = require('./custom-translate'),
    modelingModule = require('lib/features/modeling'),
    paletteModule = require('lib/features/palette'),
    contextPadModule = require('lib/features/context-pad');

var diagramXML = require('test/fixtures/bpmn/simple.bpmn');


describe('i18n - translate', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule,
      paletteModule,
      contextPadModule,
      translateModule,
      customTranslateModule
    ]
  }));


  it('should translate palette', inject(function(palette) {

    // when
    var handToolEntry = palette.getEntries()['hand-tool'];

    // then
    expect(handToolEntry.title).to.equal('Activar herramienta mano');
  }));


  it('should translate context pad', inject(function(contextPad) {

    // given
    contextPad.open('Task_1');

    // when
    var deleteEntry = contextPad._current.entries.delete;

    // then
    expect(deleteEntry.title).to.equal('Eliminar');
  }));

});