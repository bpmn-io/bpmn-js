import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import createModule from 'diagram-js/lib/features/create';
import modelingModule from 'lib/features/modeling';
import paletteModule from 'lib/features/palette';

import { createMoveEvent } from 'diagram-js/lib/features/mouse/Mouse';

import { is } from 'lib/util/ModelUtil';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';


describe('features/palette', function() {

  var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

  var testModules = [
    coreModule,
    createModule,
    modelingModule,
    paletteModule
  ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should provide BPMN modeling palette', inject(function(canvas) {

    // when
    var paletteElement = domQuery('.djs-palette', canvas._container);
    var entries = domQueryAll('.entry', paletteElement);

    // then
    expect(entries.length).to.equal(14);
  }));


  describe('sub process', function() {

    it('should create sub process with start event', inject(function(dragging, palette) {

      // when
      triggerPaletteEntry('create.subprocess-expanded');

      // then
      var context = dragging.context(),
          elements = context.data.elements;

      expect(elements).to.have.length(2);
      expect(is(elements[0], 'bpmn:SubProcess')).to.be.true;
      expect(is(elements[1], 'bpmn:StartEvent')).to.be.true;
    }));

  });

});

// helpers //////////

function triggerPaletteEntry(id) {
  getBpmnJS().invoke(function(palette) {
    var entry = palette.getEntries()[ id ];

    if (entry && entry.action && entry.action.click) {
      entry.action.click(createMoveEvent(0, 0));
    }
  });
}
