'use strict';

require('../../../TestHelper');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject, sinon */

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

  describe('should provide hints', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        bendpointsModule,
        modelingModule,
        selectModule
      ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));

    var sourceShape, targetShape, connection;

    beforeEach(inject(function(elementFactory, canvas) {

      sourceShape = elementFactory.createShape({
        id: 'sourceShape', type: 'A',
        x: 100, y: 100,
        width: 200, height: 100
      });
      canvas.addShape(sourceShape);

      targetShape = elementFactory.createShape({
        id: 'targetShape', type: 'A',
        x: 600, y: 100,
        width: 100, height: 200
      });
      canvas.addShape(targetShape);
    }));


    it('basic', inject(function(canvas, connectionSegmentMove, dragging, eventBus, elementFactory) {

      // given
      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 200, y: 150 },
          { x: 200, y: 300 },
          { x: 600, y: 300 },
          { x: 600, y: 150 }
        ],
        source: sourceShape,
        target: targetShape
      });
      canvas.addConnection(connection);

      var spy = sinon.spy(function(e) {
        expect(e.context.hints).to.have.property('segmentMove');
      });

      eventBus.once('commandStack.execute', spy);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 1);
      dragging.move(canvasEvent({ x: 0, y: 50 }));
      dragging.end();

      // then
      expect(spy).to.have.been.called;

    }));


    it('remove start segment', inject(function(canvas, connectionSegmentMove, dragging, eventBus, elementFactory) {

      // given
      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 200, y: 150 },
          { x: 200, y: 300 },
          { x: 600, y: 300 },
          { x: 600, y: 150 }
        ],
        source: sourceShape,
        target: targetShape
      });
      canvas.addConnection(connection);

      var spy = sinon.spy(function(e) {
        expect(e.context.hints.segmentMove).to.eql({
          segmentStartIndex: 1,
          newSegmentStartIndex: 0
        });
      });

      eventBus.once('commandStack.execute', spy);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);
      dragging.move(canvasEvent({ x: 0, y: -150 }));
      dragging.end();

      // then
      expect(spy).to.have.been.called;

    }));


    describe('remove skewed segments', function() {

      it('start', inject(function(canvas, connectionSegmentMove, dragging, eventBus, elementFactory) {

        // given
        connection = elementFactory.createConnection({
          id: 'connection',
          waypoints: [
            { x: 200, y: 150 },
            { x: 50, y: 400 },
            { x: 600, y: 400 },
            { x: 600, y: 150 }
          ],
          source: sourceShape,
          target: targetShape
        });
        canvas.addConnection(connection);

        var spy = sinon.spy(function(e) {
          expect(e.context.hints).to.have.property('segmentMove');
          expect(e.context.hints.segmentMove.newSegmentStartIndex).to.eql(0);
        });

        eventBus.once('commandStack.execute', spy);

        // when
        connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);
        dragging.move(canvasEvent({ x: 0, y: -250 }));
        dragging.end();

        // then
        expect(spy).to.have.been.called;
      }));


      it('mid (one bendpoint removed)', inject(function(canvas, connectionSegmentMove, dragging, eventBus, elementFactory) {

        // given
        connection = elementFactory.createConnection({
          id: 'connection',
          waypoints: [
            { x: 200, y: 150 },
            { x: 200, y: 400 },

            { x: 300, y: 300 },
            { x: 600, y: 300 },

            { x: 600, y: 150 }
          ],
          source: sourceShape,
          target: targetShape
        });
        canvas.addConnection(connection);

        var spy = sinon.spy(function(e) {
          expect(e.context.hints).to.have.property('segmentMove');
          expect(e.context.hints.segmentMove.newSegmentStartIndex).to.eql(1);
        });

        eventBus.once('commandStack.execute', spy);

        // when
        connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 3);
        dragging.move(canvasEvent({ x: 0, y: 100 }));
        dragging.end();

        // then
        expect(spy).to.have.been.called;
      }));


      it('mid (two bendpoints removed)', inject(function(canvas, connectionSegmentMove, dragging, eventBus, elementFactory) {

        // given
        connection = elementFactory.createConnection({
          id: 'connection',
          waypoints: [
            { x: 200, y: 150 },
            { x: 200, y: 400 },
            { x: 250, y: 400 },

            { x: 300, y: 300 },
            { x: 600, y: 300 },

            { x: 600, y: 150 }
          ],
          source: sourceShape,
          target: targetShape
        });
        canvas.addConnection(connection);

        var spy = sinon.spy(function(e) {
          expect(e.context.hints).to.have.property('segmentMove');
          expect(e.context.hints.segmentMove.newSegmentStartIndex).to.eql(1);
        });

        eventBus.once('commandStack.execute', spy);

        // when
        connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 4);
        dragging.move(canvasEvent({ x: 0, y: 100 }));
        dragging.end();

        // then
        expect(spy).to.have.been.called;
      }));

    });

  });


  describe('without docking', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        bendpointsModule,
        modelingModule,
        selectModule
      ]
    }));

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
        dragging.move(canvasEvent({ x: 275, y: 430 }));
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
      })
    );


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
      })
    );


    it('should move mid segment beyond source',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // when
        // moving mid segment left of start shape
        connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
        dragging.move(canvasEvent({ x: 50, y: 200 }));
        dragging.end();

        // then
        expect(connection).to.have.waypoints([
          { x: 200, y: 450 },
          { x: 50, y: 450 },
          { x: 50, y: 150 },
          { x: 650, y: 150 }
        ]);
      })
    );


    it('should move mid segment beyond target',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // given drag middle to the left
        connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
        dragging.move(canvasEvent({ x: 750, y: 200 }));
        dragging.end();

        // then
        expect(connection).to.have.waypoints([
          { x: 200, y: 450 },
          { x: 750, y: 450 },
          { x: 750, y: 150 },
          { x: 650, y: 150 }
        ]);
      })
    );


    it('should move mid segment, removing last',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // given drag middle to the left
        connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
        dragging.move(canvasEvent({ x: 620, y: 200 }));
        dragging.end();

        // then
        expect(connection.waypoints[2].x).to.eql(620);
      })
    );


    it('should move mid segment, removing first',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // given drag middle to the left
        connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
        dragging.move(canvasEvent({ x: 280, y: 200 }));
        dragging.end();

        // then
        expect(connection.waypoints[0].x).to.eql(280);
        expect(connection.waypoints.length).to.eql(3);
      })
    );


    // see issue #367
    it('should keep other axis',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // given drag last intersection down a bit
        connectionSegmentMove.start(canvasEvent({ x: 425, y: 150 }), connection, 3);
        dragging.move(canvasEvent({ x: 425, y: 210 }));
        dragging.end();
        // when: middle intersection is dragged to the left
        //       multiple steps are needed because it needs to pass the shape
        connectionSegmentMove.start(canvasEvent({ x: 400, y: 300 }), connection, 2);
        dragging.move(canvasEvent({ x: 650, y: 300 }));
        dragging.move(canvasEvent({ x: 750, y: 300 }));
        dragging.end();

        // then: the y axis doesn't change (back to target center)
        expect(connection.waypoints[3].y).to.eql(210);
      })
    );


    it('should keep the start docking as long as needed',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // given
        // connection.waypoint[0] === { x: 150, y: 450 }

        // when: dragging intersection out of the element
        connectionSegmentMove.start(canvasEvent({ x: 275, y: 450 }), connection, 1);
        dragging.move(canvasEvent({ x: 275, y: 350 }));
        dragging.end();
      })
    );


    it('should keep the end docking as long as needed',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // given
        // connection.waypoints[last] === { x: 680, y: 150 }

        // when
        // dragging intersection out of the element
        connectionSegmentMove.start(canvasEvent({ x: 425, y: 150 }), connection, 3);
        dragging.move(canvasEvent({ x: 425, y: 300 }));
        dragging.end();
      })
    );

  });


  describe('with docking (via connectionDocking)', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        bendpointsModule,
        modelingModule,
        selectModule,
        layoutModule
      ]
    }));

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
        dragging.move(canvasEvent({ x: 275, y: 430 }));
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
      })
    );


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
      })
    );


    it('should move mid segment beyond source',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // given
        var oldEnd = connection.waypoints[3];

        // when
        // moving mid segment left of start shape
        connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
        dragging.move(canvasEvent({ x: 50, y: 200 }));
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
      })
    );


    it('should move mid segment beyond target',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // given
        var oldStart = connection.waypoints[0];

        // given drag middle to the left
        connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
        dragging.move(canvasEvent({ x: 750, y: 200 }));
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
      })
    );


    it('should move mid segment, removing last',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // given
        var oldStart = connection.waypoints[0];

        // given drag middle to the left
        connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
        dragging.move(canvasEvent({ x: 620, y: 200 }));
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
      })
    );


    it('should move mid segment, removing first',
      inject(function(canvas, connectionSegmentMove, dragging) {

        // given
        var oldEnd = connection.waypoints[3];

        // given drag middle to the left
        connectionSegmentMove.start(canvasEvent({ x: 400, y: 200 }), connection, 2);
        dragging.move(canvasEvent({ x: 280, y: 200 }));
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
      })
    );

  });

  describe('width docking (skewed segments, no filteredWaypoints)', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        bendpointsModule,
        modelingModule,
        selectModule,
        layoutModule
      ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));

    var sourceShape, targetShape, createConnection;

    beforeEach(inject(function(elementFactory, canvas) {
      sourceShape = elementFactory.createShape({
        id: 'sourceShape', type: 'A',
        x: 100, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(sourceShape);

      targetShape = elementFactory.createShape({
        id: 'targetShape', type: 'A',
        x: 600, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(targetShape);

      createConnection = function(waypoints) {
        return elementFactory.createConnection({
          id: 'connection',
          waypoints: waypoints,
          source: sourceShape,
          target: targetShape
        });
      };

    }));


    it('two skewed side segments', inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var connection = createConnection([
        { x: 150, y: 150 },
        { x:  50, y: 400 },
        { x: 750, y: 400 },
        { x: 650, y: 150 }
      ]);

      canvas.addConnection(connection);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);
      dragging.move(canvasEvent({ x: 0, y: -250 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 200, y: 150 },
        { x: 600, y: 150 }
      ]);
    }));


    it('4 manhatten waypoints in the middle', inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var connection = createConnection([
        { x: 150, y: 200 },
        { x: 150, y: 400 },

        { x:  300, y: 400 },
        { x:  300, y: 450 },
        { x:  500, y: 450 },
        { x:  500, y: 400 },

        { x: 650, y: 400 },
        { x: 650, y: 200 }
      ]);

      canvas.addConnection(connection);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 4);
      dragging.move(canvasEvent({ x: 0, y: -50 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 150, y: 200 },
        { x: 150, y: 400 },
        { x: 650, y: 400 },
        { x: 650, y: 200 }
      ]);

    }));


    it('4 waypoints in the middle, 2 skewed side-segments', inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var connection = createConnection([
        { x: 150, y: 200 },
        { x: 150, y: 400 },

        { x:  300, y: 400 },
        { x:  350, y: 450 },
        { x:  450, y: 450 },
        { x:  500, y: 400 },

        { x: 650, y: 400 },
        { x: 650, y: 200 }
      ]);

      canvas.addConnection(connection);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 4);
      dragging.move(canvasEvent({ x: 0, y: -50 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 150, y: 200 },
        { x: 150, y: 400 },
        { x: 650, y: 400 },
        { x: 650, y: 200 }
      ]);
    }));


    it('2 waypoints in the middle with skewed segments', inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var connection = createConnection([
        { x: 150, y: 200 },
        { x: 150, y: 400 },

        { x:  300, y: 300 },
        { x:  500, y: 300 },

        { x: 650, y: 400 },
        { x: 650, y: 200 }
      ]);

      canvas.addConnection(connection);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 3);
      dragging.move(canvasEvent({ x: 0, y: 100 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 150, y: 200 },
        { x: 150, y: 400 },
        { x: 650, y: 400 },
        { x: 650, y: 200 }
      ]);
    }));


    it('two horizontal segment in the middle, in front of last segment', inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var connection = createConnection([
        { x: 150, y: 200 },
        { x: 150, y: 400 },

        { x:  500, y: 400 },
        { x:  500, y: 450 },

        { x: 650, y: 450 },
        { x: 650, y: 200 }
      ]);

      canvas.addConnection(connection);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);
      dragging.move(canvasEvent({ x: 0, y: 50 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 150, y: 200 },
        { x: 150, y: 450 },
        { x: 650, y: 450 },
        { x: 650, y: 200 }
      ]);
    }));


    it('one skewed segment in the middle, in front of last segment', inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var connection = createConnection([
        { x: 150, y: 200 },
        { x: 150, y: 400 },

        { x:  500, y: 400 },

        { x: 650, y: 450 },
        { x: 650, y: 200 }
      ]);

      canvas.addConnection(connection);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);
      dragging.move(canvasEvent({ x: 0, y: 50 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 150, y: 200 },
        { x: 150, y: 450 },
        { x: 650, y: 450 },
        { x: 650, y: 200 }
      ]);
    }));


    it('one skewed and one horizontal segment in the middle, in front of last segment', inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var connection = createConnection([
        { x: 150, y: 200 },
        { x: 150, y: 400 },

        { x:  500, y: 400 },
        { x:  550, y: 450 },

        { x: 650, y: 450 },
        { x: 650, y: 200 }
      ]);

      canvas.addConnection(connection);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);
      dragging.move(canvasEvent({ x: 0, y: 50 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 150, y: 200 },
        { x: 150, y: 450 },
        { x: 650, y: 450 },
        { x: 650, y: 200 }
      ]);
    }));


    it('skewed segment on start', inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var connection = createConnection([
        { x: 150, y: 200 },
        { x: 50, y: 300 },

        { x:  50, y: 400 },

        { x: 650, y: 400 },
        { x: 650, y: 200 }
      ]);

      canvas.addConnection(connection);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);
      dragging.move(canvasEvent({ x: 100, y: 0 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 150, y: 200 },
        { x: 150, y: 400 },
        { x: 650, y: 400 },
        { x: 650, y: 200 }
      ]);
    }));


    it('skewed segment on end', inject(function(canvas, connectionSegmentMove, dragging) {

      // given
      var connection = createConnection([
        { x: 150, y: 200 },
        { x: 150, y: 400 },
        { x: 750, y: 400 },

        { x: 750, y: 250 },
        { x: 650, y: 200 }
      ]);

      canvas.addConnection(connection);

      // when
      connectionSegmentMove.start(canvasEvent({ x: 0, y: 0 }), connection, 3);
      dragging.move(canvasEvent({ x: -100, y: 0 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 150, y: 200 },
        { x: 150, y: 400 },
        { x: 650, y: 400 },
        { x: 650, y: 200 }
      ]);
    }));


  });

});
