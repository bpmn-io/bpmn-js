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
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

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

    it('should create sub process with start event', inject(function(dragging) {

      // when
      triggerPaletteEntry('create.subprocess-expanded');

      // then
      var context = dragging.context(),
          elements = context.data.elements;

      expect(elements).to.have.length(2);
      expect(is(elements[0], 'bpmn:SubProcess')).to.be.true;
      expect(is(elements[1], 'bpmn:StartEvent')).to.be.true;
      expect(elements[0].di.isExpanded).to.be.true;
    }));


    it('should select sub-process', inject(function(canvas, dragging, selection) {

      // given
      var rootElement = canvas.getRootElement(),
          rootGfx = canvas.getGraphics(rootElement);

      triggerPaletteEntry('create.subprocess-expanded');

      // when
      dragging.hover({ element: rootElement, gfx: rootGfx });

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      // when
      dragging.end();

      // then
      var selected = selection.get();

      expect(selected).to.have.length(1);
      expect(is(selected[0], 'bpmn:SubProcess')).to.be.true;
    }));

  });


  describe('gateway', function() {

    it('should set gateway marker', inject(function(dragging) {

      // when
      triggerPaletteEntry('create.exclusive-gateway');

      // then
      var context = dragging.context(),
          elements = context.data.elements;

      expect(elements).to.have.length(1);
      expect(is(elements[0], 'bpmn:ExclusiveGateway')).to.be.true;
      expect(elements[0].di.isMarkerVisible).to.be.true;
    }));

  });


  describe('tools', function() {

    it('should not fire <move> on globalConnect', inject(
      function(eventBus) {

        // given
        var moveSpy = sinon.spy();

        eventBus.on('global-connect.move', moveSpy);

        // when
        triggerPaletteEntry('global-connect-tool');

        // then
        expect(moveSpy).to.not.have.been.called;

      }
    ));

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