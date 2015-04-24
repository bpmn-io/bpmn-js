'use strict';

/* global bootstrapDiagram, inject */

var TestHelper = require('../../TestHelper');

var layoutModule = {
  connectionDocking: [ 'type', require('../../../lib/layout/CroppingConnectionDocking') ]
};


function mid(shape) {
  return {
    x: shape.x + shape.width / 2,
    y: shape.y + shape.height / 2
  };
}

function visualizeExpected(canvas, point) {
  return canvas._svg.circle(point.x, point.y, 4);
}

function visualizeActual(canvas, point) {
  return canvas._svg.circle(point.x, point.y, 4).attr({
    fill: 'orange',
    'stroke': 'black',
    'stroke-width': '1px',
    'shapeRendering': 'crisp-edges'
  });
}

function expectDockingPoint(connection, shape, expected) {
  return TestHelper.getDiagramJS().invoke(function(canvas, connectionDocking) {

    var cropStart = shape === connection.source;
    var dockingPoint = connectionDocking.getDockingPoint(connection, shape, cropStart);

    visualizeExpected(canvas, expected.actual);
    visualizeActual(canvas, dockingPoint.actual);

    expect(dockingPoint).to.eql(expected);
  });
}

function expectCropping(connection, expectedWaypoints) {

  return TestHelper.getDiagramJS().invoke(function(canvas, connectionDocking) {
    var croppedWaypoints = connectionDocking.getCroppedWaypoints(connection);

    expectedWaypoints.forEach(function(p) {
      visualizeExpected(canvas, p);
    });

    croppedWaypoints.forEach(function(p) {
      visualizeActual(canvas, p);
    });

    expect(croppedWaypoints).to.eql(expectedWaypoints);
  });
}


describe('features/layout/CroppingConnectionDocking', function() {

  beforeEach(bootstrapDiagram({ modules: [ layoutModule ] }));

  describe('basics', function() {

    var topLeftShape,
        bottomRightShape,
        bottomLeftShape,
        topLeft_bottomLeftConnection,
        bottomLeft_bottomRightConnection,
        topLeft_bottomRightConnection,
        topLeft_bottomRightFreeStyleConnection,
        backAndForthConnection,
        unconnectedConnection;

    beforeEach(inject(function(canvas) {

      topLeftShape = canvas.addShape({
        id: 's-topLeft',
        x: 100, y: 100,
        width: 100, height: 100
      });

      bottomLeftShape = canvas.addShape({
        id: 's-bottomLeft',
        x: 100, y: 400,
        width: 100, height: 100
      });

      bottomRightShape = canvas.addShape({
        id: 's-bottomRight',
        x: 400, y: 400,
        width: 100, height: 100
      });

      function createConnection(id, startShape, endShape) {

        return canvas.addConnection({
          id: id,
          waypoints: [ mid(startShape), mid(endShape) ],
          source: startShape,
          target: endShape
        });
      }

      topLeft_bottomLeftConnection = createConnection('c-topLeft-bottomLeft', topLeftShape, bottomLeftShape);
      topLeft_bottomRightConnection = createConnection('c-topLeft-bottomRight', topLeftShape, bottomRightShape);
      bottomLeft_bottomRightConnection = createConnection('c-bottomLeft-bottomRight', bottomLeftShape, bottomRightShape);

      topLeft_bottomRightFreeStyleConnection = canvas.addConnection({
        id: 'c-freestyle',
        waypoints: [
          mid(topLeftShape),
          { x: 250, y: 250 },
          { x: 350, y: 250 },
          { x: 350, y: 350 },
          mid(bottomRightShape)
        ],
        source: topLeftShape,
        target: bottomRightShape
      });

      backAndForthConnection = canvas.addConnection({
        id: 'c-backandforth',
        waypoints: [
          mid(topLeftShape),
          { x: 300, y: 150 },
          { x: 300, y: 200 },
          { x: 190, y: 170 },
          { x: 400, y: 300 },
          mid(bottomRightShape)
        ],
        source: topLeftShape,
        target: bottomRightShape
      });

      unconnectedConnection = canvas.addConnection({
        id: 'c-unconnected',
        waypoints: [ { x: 130, y: 210 }, { x: 130, y: 390 } ],
        source: topLeftShape,
        target: bottomLeftShape
      });

    }));


    describe('#getDockingPoint', function() {

      it('should get topLeft -> bottomLeft source docking', inject(function(connectionDocking, canvas) {

        // vertical source docking
        expectDockingPoint(topLeft_bottomLeftConnection, topLeft_bottomLeftConnection.source, {
          point : { x: 150, y: 150 },
          actual : { x : 150, y : 200 },
          idx : 0
        });
      }));


      it('should get topLeft -> bottomLeft target docking', inject(function(connectionDocking, canvas) {

        // vertical target docking
        expectDockingPoint(topLeft_bottomLeftConnection, topLeft_bottomLeftConnection.target, {
          point : { x : 150, y : 450 },
          actual : { x : 150, y : 400 },
          idx : 1
        });
      }));


      it('should get bottomLeft -> bottomRight source docking', inject(function(connectionDocking, canvas) {

        // horizontal source docking
        expectDockingPoint(bottomLeft_bottomRightConnection, bottomLeft_bottomRightConnection.source, {
          point : { x : 150, y : 450 },
          actual : { x : 200, y : 450 },
          idx : 0
        });
      }));


      it('should get bottomLeft -> bottomRight target docking', inject(function(connectionDocking, canvas) {

        // vertical target docking
        expectDockingPoint(bottomLeft_bottomRightConnection, bottomLeft_bottomRightConnection.target, {
          point : { x : 450, y : 450 },
          actual : { x : 400, y : 450 },
          idx : 1
        });
      }));


      it('should get topLeft -> bottomRight source docking', inject(function(connectionDocking, canvas) {

        // diagonal source docking
        expectDockingPoint(topLeft_bottomRightConnection, topLeft_bottomRightConnection.source, {
          point : { x : 150, y : 150 },
          actual : { x : 200, y : 200 },
          idx : 0
        });
      }));


      it('should get topLeft -> bottomRight target docking', inject(function(connectionDocking, canvas) {

        // vertical target docking
        expectDockingPoint(topLeft_bottomRightConnection, topLeft_bottomRightConnection.target, {
          point : { x : 450, y : 450 },
          actual : { x : 400, y : 400 },
          idx : 1
        });
      }));


      it('should take shape x,y from shape', inject(function(connectionDocking, canvas) {

        var shape = topLeft_bottomRightConnection.target;

        // simulate position update
        shape.x += 20;
        shape.y += 20;


        // vertical target docking
        expectDockingPoint(topLeft_bottomRightConnection, shape, {
          point : { x : 450, y : 450 },
          actual : { x : 420, y : 420 },
          idx : 1
        });
      }));


      it('should fallback if no intersection', inject(function(connectionDocking, canvas) {

        // non intersecting (source)
        expectDockingPoint(unconnectedConnection, unconnectedConnection.source, {
          point : unconnectedConnection.waypoints[0],
          actual : unconnectedConnection.waypoints[0],
          idx : 0
        });

        // non intersecting (target)
        expectDockingPoint(unconnectedConnection, unconnectedConnection.target, {
          point : unconnectedConnection.waypoints[1],
          actual : unconnectedConnection.waypoints[1],
          idx : 1
        });
      }));

    });


    describe('#getCroppedWaypoints', function() {

      it('should crop topLeft -> bottomLeft connection', inject(function(connectionDocking) {

        // vertical connection
        expectCropping(topLeft_bottomLeftConnection, [
          { x: 150, y: 200, original: topLeft_bottomLeftConnection.waypoints[0] },
          { x: 150, y: 400, original: topLeft_bottomLeftConnection.waypoints[1]  }
        ]);
      }));


      it('should crop bottomLeft -> bottomRight connection', inject(function(connectionDocking) {

        expectCropping(bottomLeft_bottomRightConnection, [
          { x: 200, y: 450, original: bottomLeft_bottomRightConnection.waypoints[0] },
          { x: 400, y: 450, original: bottomLeft_bottomRightConnection.waypoints[1] }
        ]);
      }));


      it('should crop topLeft -> bottomRight connection', inject(function(connectionDocking) {

        expectCropping(topLeft_bottomRightConnection, [
          { x: 200, y: 200, original: topLeft_bottomRightConnection.waypoints[0] },
          { x: 400, y: 400, original: topLeft_bottomRightConnection.waypoints[1] }
        ]);
      }));


      it('should crop backAndForth connection', inject(function(connectionDocking) {

        expectCropping(backAndForthConnection, [
          { x: 200, y: 150, original: backAndForthConnection.waypoints[0] },
          backAndForthConnection.waypoints[1],
          backAndForthConnection.waypoints[2],
          backAndForthConnection.waypoints[3],
          backAndForthConnection.waypoints[4],
          { x: 433, y: 400, original: backAndForthConnection.waypoints[5] }
        ]);
      }));


      it('should crop topLeft -> bottomRightFreeStyle connection', inject(function(connectionDocking) {

        expectCropping(topLeft_bottomRightFreeStyleConnection, [
          { x: 200, y: 200, original: topLeft_bottomRightFreeStyleConnection.waypoints[0] },
          topLeft_bottomRightFreeStyleConnection.waypoints[1],
          topLeft_bottomRightFreeStyleConnection.waypoints[2],
          topLeft_bottomRightFreeStyleConnection.waypoints[3],
          { x: 400, y: 400, original: topLeft_bottomRightFreeStyleConnection.waypoints[4] }
        ]);
      }));


      it('should crop unconnected connection', inject(function(connectionDocking) {

        // unconnected connection
        expectCropping(unconnectedConnection, [
          { x: 130, y: 210, original: unconnectedConnection.waypoints[0] },
          { x: 130, y: 390, original: unconnectedConnection.waypoints[1] }
        ]);

      }));

    });

  });


  describe('multiple intersections', function() {

    var shapeA, shapeB, shapeC,
        diagonalConnection,
        verticalConnection;

    beforeEach(inject(function(canvas) {

      shapeA = canvas.addShape({
        id: 'shapeA',
        x: 100, y: 100,
        width: 100, height: 100
      });

      shapeB = canvas.addShape({
        id: 'shapeB',
        x: 300, y: 200,
        width: 100, height: 100
      });

      shapeC = canvas.addShape({
        id: 'shapeC',
        x: 100, y: 300,
        width: 100, height: 100
      });

      diagonalConnection = canvas.addConnection({
        id: 'diagonalConnection',
        waypoints: [
          { x: 100, y: 150 },
          { x: 400, y: 250 }
        ],
        source: shapeA,
        target: shapeB
      });

      verticalConnection = canvas.addConnection({
        id: 'verticalConnection',
        waypoints: [
          { x: 150, y: 150 },
          { x: 150, y: 50 },
          { x: 150, y: 500 },
          { x: 150, y: 350 }
        ],
        source: shapeA,
        target: shapeC
      });
    }));


    describe('#getDockingPoint', function() {

      it('should dock diagonalConnection start', inject(function(connectionDocking) {

        expectDockingPoint(diagonalConnection, shapeA, {
          point: { x: 100, y: 150 },
          actual: { x : 200, y : 183 },
          idx: 0
        });
      }));


      it('should dock diagonalConnection end', inject(function(connectionDocking) {

        expectDockingPoint(diagonalConnection, shapeB, {
          point: { x: 400, y: 250 },
          actual : { x : 300, y : 217 },
          idx : 1
        });
      }));


      it('should dock verticalConnection start', inject(function(connectionDocking) {

        expectDockingPoint(verticalConnection, shapeA, {
          point: { x: 150, y: 150 },
          actual: { x: 150, y: 100 },
          idx: 0
        });
      }));


      it('should dock verticalConnection end', inject(function(connectionDocking) {

        expectDockingPoint(verticalConnection, shapeC, {
          point: { x: 150, y: 350 },
          actual: { x: 150, y: 400 },
          idx : 3
        });
      }));

    });

  });

});