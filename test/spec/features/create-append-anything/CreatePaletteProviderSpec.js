import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import createAppendElements from 'lib/features/create-append-anything';

import { createMoveEvent } from 'diagram-js/lib/features/mouse/Mouse';


describe('features/palette', function() {

  var diagramXML = require('./CreateMenuProvider.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    createAppendElements
  ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('create', function() {

    it('should trigger create menu', inject(function(popupMenu, canvas) {

      // given
      var createSpy = sinon.spy(popupMenu, 'open');

      // when
      triggerPaletteEntry('create');

      // then
      const args = createSpy.getCall(0).args;

      expect(createSpy).to.have.been.called;
      expect(args[0]).to.eq(canvas.getRootElement());
      expect(args[1]).to.eq('bpmn-create');
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