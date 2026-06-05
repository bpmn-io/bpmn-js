import { expect } from 'chai';
import {
  bootstrapModeler,
  collectTranslations,
  inject
} from 'bpmn-js/test/TestHelper.js';

import coreModule from 'bpmn-js/lib/core';
import translateModule from 'diagram-js/lib/i18n/translate';
import customTranslateModule from './custom-translate/index.js';
import modelingModule from 'bpmn-js/lib/features/modeling';
import paletteModule from 'bpmn-js/lib/features/palette';
import contextPadModule from 'bpmn-js/lib/features/context-pad';

var diagramXML = require('bpmn-js/test/fixtures/bpmn/simple.bpmn');


// skipping this file during translation extraction

// eslint-disable-next-line mocha/consistent-spacing-between-blocks
collectTranslations ? describe.skip : describe('i18n - translate', function() {

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
    expect(handToolEntry.title).to.equal('Hand-Tool aktivieren');
  }));


  it('should translate context pad', inject(function(contextPad) {

    // given
    contextPad.open('Task_1');

    // when
    var deleteEntry = contextPad._current.entries.delete;

    // then
    expect(deleteEntry.title).to.equal('Entfernen');
  }));

});