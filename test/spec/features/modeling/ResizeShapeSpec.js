'use strict';

/* global bootstrapDiagram, inject */

var pick = require('lodash/object/pick');

var resizeBounds = require('../../../../lib/features/resize/ResizeUtil').resizeBounds,
    canvasEvent = require('../../../util/MockEvents').createCanvasEvent,
    Elements = require('../../../../lib/util/Elements');


var modelingModule = require('../../../../lib/features/modeling'),
    resizeModule = require('../../../../lib/features/resize'),
    attachModule = require('../../../../lib/features/attach-support');

var layoutModule = {
  connectionDocking: [ 'type', require('../../../../lib/layout/CroppingConnectionDocking') ]
};

var getNewAttachPoint = require('../../../../lib/util/AttachUtil').getNewAttachPoint;

function bounds(b) {
  return pick(b, [ 'x', 'y', 'width', 'height' ]);
}


describe('features/modeling - resize shape', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      layoutModule,
      resizeModule,
      attachModule
    ]
  }));


  describe('basics', function() {

    var rootShape, parentShape, connection, shape1, shape2;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      parentShape = elementFactory.createShape({
        id: 'parent',
        x: 0, y: 50,
        width: 300, height: 250
      });

      canvas.addShape(parentShape, rootShape);

      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 50, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(shape1, parentShape);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        resizable: true,
        x: 200, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(shape2, parentShape);
    }));


    it('should change size of shape', inject(function(modeling) {

      // when
      modeling.resizeShape(shape2, { x: 200, y: 100, width: 124, height: 202 });

      // then
      expect(shape2.width).to.equal(124);
      expect(shape2.height).to.equal(202);
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // given
      modeling.resizeShape(shape2, { x: 200, y: 100, width: 124, height: 202 });
      modeling.resizeShape(shape2, { x: 200, y: 100, width: 999, height: 999 });

      // when
      commandStack.undo();

      // then
      expect(shape2.width).to.equal(124);
      expect(shape2.height).to.equal(202);

      // when
      commandStack.undo();

      // then
      expect(shape2.width).to.equal(100);
      expect(shape2.height).to.equal(100);
    }));


    it('should redo', inject(function(modeling, commandStack) {

      // given
      modeling.resizeShape(shape2, { x: 200, y: 100, width: 124, height: 202 });
      modeling.resizeShape(shape2, { x: 200, y: 100, width: 999, height: 999 });

      commandStack.undo();
      commandStack.undo();

      // when
      commandStack.redo();

      // then
      expect(shape2.width).to.equal(124);
      expect(shape2.height).to.equal(202);

      // when
      commandStack.redo();

      // then
      expect(shape2.width).to.equal(999);
      expect(shape2.height).to.equal(999);
    }));


    it('should crop connections', inject(function(modeling, connectionDocking, canvas, elementFactory, eventBus) {

      // given
      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 100, y: 150 },
          { x: 250, y: 150 }
        ],
        source: shape1,
        target: shape2
      });

      canvas.addConnection(connection);

      eventBus.on('commandStack.connection.layout.executed', function(e) {
        var context = e.context,
            connection;

        if (!context.cropped) {
          connection = context.connection;
          connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
          context.cropped = true;
        }
      });

      // when
      modeling.resizeShape(shape1, { x: 50, y: 100, width: 50, height: 100 });

      //then
      expect(connection.waypoints).to.deep.eql([
        { x: 100, y: 150, original: { x: 75, y: 150 } },
        { x: 200, y: 150, original: { x: 250, y: 150 } }
      ]);
    }));


    it('should customize minDimensions on shape resize', inject(function(eventBus, resize, dragging, canvas) {

      eventBus.on('resize.start', 1500, function(event) {
        var context = event.context;

        context.minDimensions = { width: 40, height: 60 };
      });

      resize.activate(canvasEvent({ x: 300, y: 200 }), shape2, 'se');
      dragging.move(canvasEvent({ x: -90, y: -90 }));
      dragging.end();

      expect(shape2.width).to.equal(40);
      expect(shape2.height).to.equal(60);
    }));


    it('should customize childrenBoxPadding on shape resize',
      inject(function(canvas, elementFactory, resize, dragging, eventBus) {

        // given
        var padding = 30;

        eventBus.on('resize.start', 1500, function(event) {
          var context = event.context;

          context.childrenBoxPadding = padding;
        });

        var getBBox = Elements.getBBox([shape1, shape2]);

        resize.activate(canvasEvent({ x: 300, y: 300 }), parentShape, 'se');
        dragging.move(canvasEvent({ x: -100, y: -100 }));
        dragging.end();

        var childrenBoxPadding = parentShape.width - (getBBox.x + getBBox.width);

        expect(childrenBoxPadding).to.equal(padding);
      })
    );

  });

  describe('connections', function() {

    var rootShape, parentShape, shapeA, shapeB, connectionA, connectionB;

    beforeEach(inject(function(elementFactory, canvas, elementRegistry, modeling) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      parentShape = elementFactory.createShape({
        id: 'parent',
        resizable: true,
        x: 400, y: 50,
        width: 450, height: 450
      });

      canvas.addShape(parentShape, rootShape);

      shapeA = elementFactory.createShape({
        id: 'shapeA',
        resizable: true,
        x: 100, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(shapeA, rootShape);

      shapeB = elementFactory.createShape({
        id: 'shapeB',
        x: 1100, y: 300,
        width: 100, height: 100
      });

      canvas.addShape(shapeB, rootShape);

      connectionA = elementFactory.createConnection({
        id: 'connectionA',
        waypoints: [
          { x: 150, y: 150 },
          { x: 425, y: 475, original: { x: 425, y: 475 } }
        ],
        source: shapeA,
        target: parentShape
      });

      canvas.addConnection(connectionA, rootShape);

      connectionB = elementFactory.createConnection({
        id: 'connectionB',
        waypoints: [
          { x: 825, y: 75, original: { x: 825, y: 75 } },
          { x: 1150, y: 350 }
        ],
        source: parentShape,
        target: shapeB
      });

      canvas.addConnection(connectionB, rootShape);
    }));


    describe('should update connection dockings', function() {

      it('on incoming connections', inject(function(modeling) {
        // given
        var shapeOldBounds = bounds(parentShape),
            shapeNewBounds = { x: 400, y: 50, width: 350, height: 350 };

        var expectedWaypoints = [
          { x: 150, y: 150 }, // start unchanged
          getNewAttachPoint({ x: 425, y: 475 }, shapeOldBounds, shapeNewBounds)
        ];

        // when
        modeling.resizeShape(parentShape, shapeNewBounds);

        expect(connectionA).to.have.waypoints(expectedWaypoints);
      }));


      it('on outgoing connections', inject(function(modeling) {
        // given
        var shapeOldBounds = bounds(parentShape),
            shapeNewBounds = { x: 300, y: 150, width: 350, height: 350 };

        var expectedWaypoints = [
          getNewAttachPoint({ x: 825, y: 75 }, shapeOldBounds, shapeNewBounds),
          { x: 1150, y: 350 } // end unchanged
        ];

        // when
        modeling.resizeShape(parentShape, shapeNewBounds);

        expect(connectionB).to.have.waypoints(expectedWaypoints);
      }));


      it('on incoming connections (undo)', inject(function(modeling, commandStack) {

        // given
        var originalWaypoints = connectionA.waypoints.slice();

        // when
        modeling.resizeShape(parentShape, { x: 400, y: 50, width: 350, height: 350 });

        commandStack.undo();

        // then
        expect(connectionA.waypoints).to.eql(originalWaypoints);
      }));


      it('on outgoing connections (undo -> redo)', inject(function(modeling, commandStack) {

        // given
        var shapeNewBounds = { x: 300, y: 150, width: 350, height: 350 },
            layoutedWaypoints;

        modeling.resizeShape(parentShape, shapeNewBounds);

        layoutedWaypoints = connectionB.waypoints.slice();

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connectionB.waypoints).to.eql(layoutedWaypoints);
      }));

    });

  });


  describe('resize directions', function() {

    it('should shrink sw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'sw', { x: 5, y: -15 }));

      // then
      expect(shape.height).to.equal(85);
      expect(shape.width).to.equal(95);

      expect(shape.x).to.equal(105); // move right
      expect(shape.y).to.equal(100); // stay the same
    }));


    it('should expand sw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'sw', { x: -5, y: 15 }));

      // then
      expect(shape.height).to.equal(115);
      expect(shape.width).to.equal(105);

      expect(shape.x).to.equal(95);  // move left
      expect(shape.y).to.equal(100); // stay the same
    }));


    it('should shrink nw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'nw', { x: 5, y: 15 }));

      // then
      expect(shape.height).to.equal(85);
      expect(shape.width).to.equal(95);

      expect(shape.x).to.equal(105); // move right
      expect(shape.y).to.equal(115); // move down
    }));


    it('should expand nw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'nw', { x: -5, y: -15 }));

      // then
      expect(shape.height).to.equal(115);
      expect(shape.width).to.equal(105);

      expect(shape.x).to.equal(95); // move left
      expect(shape.y).to.equal(85); // move up
    }));


    it('should shrink ne', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'ne', { x: -5, y: 15 }));

      // then
      expect(shape.height).to.equal(85);
      expect(shape.width).to.equal(95);

      expect(shape.x).to.equal(100);
      expect(shape.y).to.equal(115);
    }));


    it('should expand ne', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'ne', { x: 5, y: -15 }));

      // then
      expect(shape.height).to.equal(115);
      expect(shape.width).to.equal(105);

      expect(shape.x).to.equal(100);
      expect(shape.y).to.equal(85);
    }));


    it('should shrink se', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'se', { x: -5, y: -15 }));

      // then
      expect(shape.height).to.equal(85);
      expect(shape.width).to.equal(95);

      expect(shape.x).to.equal(100);
      expect(shape.y).to.equal(100);
    }));


    it('should expand se', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'se', { x: 5, y: 15 }));

      // then
      expect(shape.height).to.equal(115);
      expect(shape.width).to.equal(105);

      expect(shape.x).to.equal(100);
      expect(shape.y).to.equal(100);
    }));

  });


  describe('error handling', function() {

    var rootShape, shape1, shape2;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 50, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(shape1, rootShape);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 50, y: 250,
        width: 100, height: 100
      });

      canvas.addShape(shape2, rootShape);
    }));


    it('should throw error when there are missing properties', inject(function(modeling) {

      // when
      function resize() {
        return modeling.resizeShape(shape2, { width: 150, height: 150 });
      }

      // then
      expect(resize).to.throw('newBounds must have {x, y, width, height} properties');
    }));

  });



});
