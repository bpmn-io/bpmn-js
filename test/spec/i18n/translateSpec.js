import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

// skipping this file during translation extraction
var skip = window.__env__ && window.__env__.TRANSLATIONS === 'enabled';

import coreModule from 'lib/core';
import translateModule from 'diagram-js/lib/i18n/translate';
import customTranslateModule from './custom-translate';
import modelingModule from 'lib/features/modeling';
import paletteModule from 'lib/features/palette';
import contextPadModule from 'lib/features/context-pad';

var diagramXML = require('test/fixtures/bpmn/simple.bpmn');


skip ? describe.only : describe('i18n - translate', function() {


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