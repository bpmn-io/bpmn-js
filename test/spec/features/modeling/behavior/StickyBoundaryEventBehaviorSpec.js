import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import moveModule from 'diagram-js/lib/features/move';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';


describe('features/modeling/behavior - sticky boundary events', function() {

  var testModules = [ coreModule, modelingModule, moveModule ];


  var processDiagramXML = require('../../../../fixtures/bpmn/boundary-events.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));


  it('should extend hit shape of current host', inject(function(elementRegistry, move) {

    // given
    var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
        hostGfx = elementRegistry.getGraphics(boundaryEvent.host);

    // when
    move.start(canvasEvent({ x: 0, y: 0 }), boundaryEvent);

    // then
    expect(hostGfx.classList.contains('djs-hit-extended')).to.be.true;
  }));


  it('should NOT extend hit shape after hovering other element',
    inject(function(canvas, elementRegistry, move, dragging) {

      // given
      var root = canvas.getRootElement(),
          rootGfx = canvas.getGraphics(root),
          boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
          host = boundaryEvent.host,
          hostGfx = elementRegistry.getGraphics(host);

      // when
      move.start(canvasEvent({ x: 0, y: 0 }), boundaryEvent);

      dragging.hover({ element: root, gfx: rootGfx });
      dragging.hover({ element: host, gfx: hostGfx });

      // then
      expect(hostGfx.classList.contains('djs-hit-extended')).to.be.false;
    })
  );


  it('should properly clean classes on end', inject(function(elementRegistry, move, dragging) {

    // given
    var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
        hostGfx = elementRegistry.getGraphics(boundaryEvent.host);

    // when
    move.start(canvasEvent({ x: 0, y: 0 }), boundaryEvent);
    dragging.end();

    // then
    expect(hostGfx.classList.contains('djs-hit-extended')).to.be.false;
  }));


  it('should properly clean classes on cancel', inject(function(elementRegistry, move, dragging) {

    // given
    var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
        hostGfx = elementRegistry.getGraphics(boundaryEvent.host);

    // when
    move.start(canvasEvent({ x: 0, y: 0 }), boundaryEvent);
    dragging.cancel();

    // then
    expect(hostGfx.classList.contains('djs-hit-extended')).to.be.false;
  }));

});
