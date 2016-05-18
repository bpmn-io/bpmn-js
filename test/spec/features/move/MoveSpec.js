'use strict';

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */

var assign = require('lodash/object/assign'),
    pick = require('lodash/object/pick');

var modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move');


describe('features/move - Move', function() {

  beforeEach(bootstrapDiagram({ modules: [ moveModule, modelingModule ] }));

  beforeEach(inject(function(canvas, dragging) {
    dragging.setOptions({ manual: true });
  }));


  var rootShape, parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 200, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);
  }));


  describe('event centering', function() {

    it('should emit events relative to shape center', inject(function(eventBus, move, dragging) {

      // given
      function recordEvents(prefix) {
        var events = [];

        [ 'start', 'move', 'end', 'hover', 'out', 'cancel', 'cleanup', 'init' ].forEach(function(type) {
          eventBus.on(prefix + '.' + type, function(e) {
            events.push(assign({}, e));
          });
        });

        return events;
      }

      function position(e) {
        return pick(e, [ 'x', 'y', 'dx', 'dy' ]);
      }

      var events = recordEvents('shape.move');


      // when
      move.start(canvasEvent({ x: 0, y: 0 }), childShape);

      dragging.move(canvasEvent({ x: 20, y: 20 }));

      // then
      expect(events.map(position)).to.eql([
        { },
        { x: 160, y: 160, dx: 0, dy: 0 },
        { x: 180, y: 180, dx: 20, dy: 20 }
      ]);
    }));

  });

  describe('modeling', function() {

    it('should round movement to pixels', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(canvasEvent({ x: 0, y: 0 }), childShape);

      // when
      dragging.move(canvasEvent({ x: 20, y: 20 }));
      dragging.hover({
        element: parentShape,
        gfx: elementRegistry.getGraphics(parentShape)
      });

      dragging.move(canvasEvent({ x: 30.4, y: 99.7 }));

      dragging.end();

      // then
      expect(childShape.x).to.eql(140);
      expect(childShape.y).to.eql(210);
    }));

  });

});
