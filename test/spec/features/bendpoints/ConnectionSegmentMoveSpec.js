'use strict';

require('../../../TestHelper');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */

var bendpointsModule = require('../../../../lib/features/bendpoints'),
    modelingModule =   require('../../../../lib/features/modeling'),
    selectModule =     require('../../../../lib/features/selection');

var layoutModule = {
  connectionDocking: [
    'type',
    require('../../../../lib/layout/CroppingConnectionDocking')
  ]
};


function setupShapes(elementFactory, canvas) {
  var rootShape, shape1, shape2, connection;

  rootShape = elementFactory.createRoot({
    id: 'root'
  });
  canvas.setRootElement(rootShape);

  shape1 = elementFactory.createShape({
    id: 'shape1', type: 'A',
    x: 100, y: 400,
    width: 200, height: 100
  });
  canvas.addShape(shape1, rootShape);

  shape2 = elementFactory.createShape({
    id: 'shape2', type: 'A',
    x: 600, y: 50,
    width: 100, height: 200
  });
  canvas.addShape(shape2, rootShape);

  connection = elementFactory.createConnection({
    id: 'connection',
    waypoints: [
      { x: 200, y: 450 },
      { x: 400, y: 450 },
      { x: 400, y: 150 },
      { x: 650, y: 150 }
    ],
    source: shape1,
    target: shape2
  });
  canvas.addConnection(connection, rootShape);

  return {
    rootShape: rootShape,
    source: shape1,
    target: shape2,
    connection: connection
  };
}

describe('features/bendpoints - parallel move', function() {

  describe('modeling', function() {

    beforeEach(bootstrapDiagram({ modules: [ bendpointsModule, modelingModule, selectModule ]}));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    var rootShape, shape1, shape2, connection;

    beforeEach(inject(function(elementFactory, canvas) {
      var diagram = setupShapes(elementFactory, canvas);

      rootShape = diagram.rootShape;
      shape1 = diagram.source;
      shape2 = diagram.target;
      connection = diagram.connection;
    }));


    it('should vertical move first segment, updating connection start',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var oldStart = connection.waypoints[0];

      // when
      connectionSegmentMove.start(canvasEvent({ x: 275, y: 450 }), connection, 1);
      dragging.move(canvasEvent({ x: 275, y: 430}));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 200, y: 430 },
        { x: 400, y: 430 },
        { x: 400, y: 150 },
        { x: 650, y: 150 }
      ]);

      expect(connection).to.have.startDocking({ x: oldStart.original.x, y: 430 });
    }));


    it('should vertical move last segment, updating connection end',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var oldEnd = connection.waypoints[3];

      // when
      connectionSegmentMove.start(canvasEvent({ x: 425, y: 150 }), connection, 3);
      dragging.move(canvasEvent({ x: 425, y: 210 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 200, y: 450 },
        { x: 400, y: 450 },
        { x: 400, y: 210 },
        { x: 650, y: 210 }
      ]);

      expect(connection).to.have.endDocking({ x: oldEnd.original.x, y: 210 });
    }));


    it('should add new segment, left of start shape',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var oldStart = connection.waypoints[0],
          expectedWaypoints = [
            { x: 200, y: 450 },
            { x: 50, y: 450 },
            { x: 50, y: 150 },
            { x: 650, y: 150 }
          ];

      // when
      // moving mid segment left of start shape
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 50, y: 200}));
      dragging.end();

      // then
      expect(connection).to.have.waypoints(expectedWaypoints);
      expect(connection).to.have.startDocking(oldStart.original);
    }));


    it('should add new segment, right of end shape',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var oldEnd = connection.waypoints[3],
          expectedWaypoints = [
            { x: 200, y: 450 },
            { x: 750, y: 450 },
            { x: 750, y: 150 },
            { x: 650, y: 150 }
          ];


      // precondition: drag middle to the left
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 750, y: 200}));
      dragging.end();

      // then
      expect(connection).to.have.waypoints(expectedWaypoints);
      expect(connection).to.have.endDocking(oldEnd.original);
    }));


    it('should update upper bendpoint on horizontal movement',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // precondition: drag middle to the left
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 620, y: 200}));
      dragging.end();

      // then
      expect(connection.waypoints[2].x).to.eql(620);
    }));


    it('should update lower bendpoint on horizontal movement',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // precondition: drag middle to the left
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 280, y: 200}));
      dragging.end();

      // then
      expect(connection.waypoints[0].x).to.eql(280);
      expect(connection.waypoints.length).to.eql(3);
    }));


    // see issue #367
    it('keeps the other axis',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // precondition: drag last intersection down a bit
      connectionSegmentMove.start(canvasEvent({ x: 425, y: 150 }), connection, 3);
      dragging.move(canvasEvent({ x: 425, y: 210}));
      dragging.end();
      // when: middle intersection is dragged to the left
      //       multiple steps are needed because it needs to pass the shape
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 300 }), connection, 2);
      dragging.move(canvasEvent({ x: 650, y: 300}));
      dragging.move(canvasEvent({ x: 750, y: 300}));
      dragging.end();

      // then: the y axis doesn't change (back to target center)
      expect(connection.waypoints[3].y).to.eql(210);
    }));


    it('keeps the start docking as long as needed',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // precondition:
      var wp0 = connection.waypoints[0];
      var originalDocking = {x: 150, y: 450};
      wp0.original = {x: 150, y: 450};

      // when: dragging intersection out of the element
      connectionSegmentMove.start(canvasEvent({ x: 275, y: 450 }), connection, 1);
      dragging.move(canvasEvent({ x: 275, y: 350}));
      dragging.end();

      // then: the docking point needs to stay untouched
      expect(connection).to.have.startDocking(originalDocking);
    }));


    it('keeps the end docking as long as needed',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // precondition:
      var wpLast = connection.waypoints[connection.waypoints.length - 1];
      var originalDocking = {x: 680, y: 150};
      wpLast.original = {x: 680, y: 150};

      // when: dragging intersection out of the element
      connectionSegmentMove.start(canvasEvent({ x: 425, y: 150 }), connection, 3);
      dragging.move(canvasEvent({ x: 425, y: 300 }));
      dragging.end();

      // then: the docking point needs to stay untouched
      expect(connection).to.have.endDocking(originalDocking);
    }));
  });


  describe("with connectionDocking support", function() {

    var diagram;

    beforeEach(bootstrapDiagram({ modules: [ bendpointsModule, modelingModule, selectModule, layoutModule ]}));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));

    beforeEach(inject(function(elementFactory, canvas) {
      diagram = setupShapes(elementFactory, canvas);
    }));


    it('should crop connection to source',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var shapeCornerX = diagram.source.x + diagram.source.width;

      // when
      connectionSegmentMove.start(canvasEvent({ x: 275, y: 450 }), diagram.connection, 1);
      dragging.move(canvasEvent({ x: 275, y: 430}));
      // cropping is applied from the second move event on
      dragging.move(canvasEvent({ x: 275, y: 470}));
      dragging.end();

      // then
      expect(diagram.connection.waypoints[0].x).to.eql(shapeCornerX);
    }));


    it('should crop connection to target',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var shapeCornerX = diagram.target.x;

      // when
      connectionSegmentMove.start(canvasEvent({ x: 425, y: 150 }), diagram.connection, 3);
      dragging.move(canvasEvent({ x: 425, y: 210 }));
      // cropping is applied from the second move event on
      dragging.move(canvasEvent({ x: 425, y: 230 }));
      dragging.end();

      // then
      expect(diagram.connection.waypoints[3].x).to.eql(shapeCornerX);
    }));


    it('should crop first segment on fast movement',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var shapeCornerY = diagram.source.y;

      // when
      connectionSegmentMove.start(canvasEvent({ x: 275, y: 450 }), diagram.connection, 1);
      //dragging.move(canvasEvent({ x: 275, y: 430}));
      dragging.move(canvasEvent({ x: 275, y: 350}));
      dragging.end();

      // then
      expect(diagram.connection.waypoints[0].y).to.eql(shapeCornerY);
    }));


    it('should crop last segment on fast movement',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var shapeCornerY = diagram.target.y + diagram.target.height;

      // when
      connectionSegmentMove.start(canvasEvent({ x: 425, y: 150 }), diagram.connection, 3);
      //dragging.move(canvasEvent({ x: 425, y: 210 }));
      dragging.move(canvasEvent({ x: 425, y: 350 }));
      dragging.end();

      // then
      expect(diagram.connection.waypoints[4].y).to.eql(shapeCornerY);
    }));

  });
});
