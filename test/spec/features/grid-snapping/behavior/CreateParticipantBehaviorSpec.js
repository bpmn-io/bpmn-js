import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import coreModule from 'bpmn-js/lib/core';
import createModule from 'diagram-js/lib/features/create';
import gridSnappingModule from 'bpmn-js/lib/features/grid-snapping';
import modelingModule from 'bpmn-js/lib/features/modeling';

import { createCanvasEvent as canvasEvent } from 'bpmn-js/test/util/MockEvents.js';


describe('features/grid-snapping - create participant', function() {

  var diagramXML = require('./CreateParticipantBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      createModule,
      gridSnappingModule,
      modelingModule
    ]
  }));


  it('should snap width and height', inject(
    function(create, dragging, elementFactory, elementRegistry) {

      // given
      var process = elementRegistry.get('Process_1'),
          processGfx = elementRegistry.getGraphics(process);

      var participant = elementFactory.createParticipantShape();

      // when
      create.start(canvasEvent({ x: 100, y: 100 }), participant);

      dragging.hover({ element: process, gfx: processGfx });

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      dragging.end();

      // then
      expect(participant.width).to.equal(610);
      expect(participant.height).to.equal(340);
    }
  ));

});