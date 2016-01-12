'use strict';

require('../../../TestHelper');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */


var handToolModule = require('../../../../lib/features/hand-tool'),
    draggingModule = require('../../../../lib/features/dragging');


describe('features/hand-tool', function() {

  beforeEach(bootstrapDiagram({ modules: [ handToolModule, draggingModule ] }));

  var rootShape, childShape;

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));

  beforeEach(inject(function(canvas, elementFactory) {
    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 50, height: 100
    });

    canvas.addShape(childShape, rootShape);
  }));

  describe('general', function() {

    it('should not move element', inject(function(canvas, handTool, dragging) {
      // given
      var position = {
        x: childShape.x,
        y: childShape.y
      };

      // when
      handTool.activateMove(canvasEvent({ x: 150, y: 150 }));

      dragging.move(canvasEvent({ x: 300, y: 300 }));
      dragging.end();


      // then
      expect(childShape.x).to.equal(position.x);
      expect(childShape.y).to.equal(position.y);
    }));
  });

});
