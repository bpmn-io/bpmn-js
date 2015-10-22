'use strict';

require('../../../TestHelper');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */

var bendpointsModule = require('../../../../lib/features/bendpoints'),
    modelingModule = require('../../../../lib/features/modeling'),
    selectModule = require('../../../../lib/features/selection');

var layoutModule = {
  connectionDocking: [
    'type',
    require('../../../../lib/layout/CroppingConnectionDocking')
  ]
};


describe('features/bendpoints - segment move', function() {

  describe('without docking', function() {

    beforeEach(bootstrapDiagram({ modules: [ bendpointsModule, modelingModule, selectModule ]}));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    var sourceShape, targetShape, connection;

    beforeEach(inject(function(elementFactory, canvas) {
      sourceShape = elementFactory.createShape({
        id: 'sourceShape', type: 'A',
        x: 100, y: 400,
        width: 200, height: 100
      });
      canvas.addShape(sourceShape);

      targetShape = elementFactory.createShape({
        id: 'targetShape', type: 'A',
        x: 600, y: 50,
        width: 100, height: 200
      });
      canvas.addShape(targetShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 200, y: 450 },
          { x: 400, y: 450 },
          { x: 400, y: 150 },
          { x: 650, y: 150 }
        ],
        source: sourceShape,
        target: targetShape
      });
      canvas.addConnection(connection);
    }));


    it('should vertical move first segment',
       inject(function(canvas, connectionSegmentMove, dragging) {

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

      // not introducing a docking (!)
      expect(connection).to.have.startDocking(undefined);
      expect(connection).to.have.endDocking(undefined);
    }));


    it('should vertical move last segment',
       inject(function(canvas, connectionSegmentMove, dragging) {

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

      // not introducing a docking (!)
      expect(connection).to.have.startDocking(undefined);
      expect(connection).to.have.endDocking(undefined);
    }));


    it('should move mid segment beyond source',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // when
      // moving mid segment left of start shape
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 50, y: 200}));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 200, y: 450 },
        { x: 50, y: 450 },
        { x: 50, y: 150 },
        { x: 650, y: 150 }
      ]);
    }));


    it('should move mid segment beyond target',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // precondition: drag middle to the left
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 750, y: 200}));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 200, y: 450 },
        { x: 750, y: 450 },
        { x: 750, y: 150 },
        { x: 650, y: 150 }
      ]);
    }));


    it('should move mid segment, removing last',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // precondition: drag middle to the left
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 620, y: 200}));
      dragging.end();

      // then
      expect(connection.waypoints[2].x).to.eql(620);
    }));


    it('should move mid segment, removing first',
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
    it('should keep other axis',
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


    it('should keep the start docking as long as needed',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // precondition:
      var wp0 = connection.waypoints[0];
      wp0 = {x: 150, y: 450};

      // when: dragging intersection out of the element
      connectionSegmentMove.start(canvasEvent({ x: 275, y: 450 }), connection, 1);
      dragging.move(canvasEvent({ x: 275, y: 350}));
      dragging.end();
    }));


    it('should keep the end docking as long as needed',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // precondition:
      var wpLast = connection.waypoints[connection.waypoints.length - 1];
      wpLast = {x: 680, y: 150};

      // when: dragging intersection out of the element
      connectionSegmentMove.start(canvasEvent({ x: 425, y: 150 }), connection, 3);
      dragging.move(canvasEvent({ x: 425, y: 300 }));
      dragging.end();
    }));

  });


  describe('with docking (via connectionDocking)', function() {

    beforeEach(bootstrapDiagram({ modules: [ bendpointsModule, modelingModule, selectModule, layoutModule ]}));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    var sourceShape, targetShape, connection;

    beforeEach(inject(function(elementFactory, canvas) {
      sourceShape = elementFactory.createShape({
        id: 'sourceShape', type: 'A',
        x: 100, y: 400,
        width: 200, height: 100
      });
      canvas.addShape(sourceShape);

      targetShape = elementFactory.createShape({
        id: 'targetShape', type: 'A',
        x: 600, y: 50,
        width: 100, height: 200
      });
      canvas.addShape(targetShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 300, y: 450, original: { x: 250, y: 450 } },
          { x: 400, y: 450 },
          { x: 400, y: 150 },
          { x: 600, y: 150, original: { x: 650, y: 150 } }
        ],
        source: sourceShape,
        target: targetShape
      });
      canvas.addConnection(connection);
    }));


    it('should vertical move first segment',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var oldEnd = connection.waypoints[3];

      // when
      connectionSegmentMove.start(canvasEvent({ x: 275, y: 450 }), connection, 1);
      dragging.move(canvasEvent({ x: 275, y: 430}));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 300, y: 430 },
        { x: 400, y: 430 },
        { x: 400, y: 150 },
        { x: 600, y: 150 }
      ]);

      // updating start docking
      expect(connection).to.have.startDocking({ x: 250, y: 430 });
      expect(connection).to.have.endDocking(oldEnd.original);
    }));


    it('should vertical move last segment',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var oldStart = connection.waypoints[0];

      // when
      connectionSegmentMove.start(canvasEvent({ x: 425, y: 150 }), connection, 3);
      dragging.move(canvasEvent({ x: 425, y: 210 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 300, y: 450 },
        { x: 400, y: 450 },
        { x: 400, y: 210 },
        { x: 600, y: 210 }
      ]);

      // updating end docking
      expect(connection).to.have.startDocking(oldStart.original);
      expect(connection).to.have.endDocking({ x: 650, y: 210 });
    }));


    it('should move mid segment beyond source',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var oldEnd = connection.waypoints[3];

      // when
      // moving mid segment left of start shape
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 50, y: 200}));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 100, y: 450 },
        { x: 50, y: 450 },
        { x: 50, y: 150 },
        { x: 600, y: 150 }
      ]);

      // updating end docking
      expect(connection).to.have.startDocking({ x: 250, y: 450 });
      expect(connection).to.have.endDocking(oldEnd.original);
    }));


    it('should move mid segment beyond target',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var oldStart = connection.waypoints[0];

      // precondition: drag middle to the left
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 750, y: 200}));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 300, y: 450 },
        { x: 750, y: 450 },
        { x: 750, y: 150 },
        { x: 700, y: 150 }
      ]);

      // updating end docking
      expect(connection).to.have.startDocking(oldStart.original);
      expect(connection).to.have.endDocking({ x: 650, y: 150 });
    }));


    it('should move mid segment, removing last',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var oldStart = connection.waypoints[0];

      // precondition: drag middle to the left
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 620, y: 200}));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 300, y: 450 },
        { x: 620, y: 450 },
        { x: 620, y: 250 }
      ]);

      // updating end docking
      expect(connection).to.have.startDocking(oldStart.original);
      expect(connection).to.have.endDocking({ x: 620, y: 150 });
    }));


    it('should move mid segment, removing first',
       inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var oldEnd = connection.waypoints[3];

      // precondition: drag middle to the left
      connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
      dragging.move(canvasEvent({ x: 280, y: 200}));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 280, y: 400 },
        { x: 280, y: 150 },
        { x: 600, y: 150 }
      ]);

      // updating end docking
      expect(connection).to.have.startDocking({ x: 280, y: 450 });
      expect(connection).to.have.endDocking(oldEnd.original);
    }));

  });

});
