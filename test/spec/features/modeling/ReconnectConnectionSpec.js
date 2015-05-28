'use strict';

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - reconnect connection', function() {


  beforeEach(bootstrapDiagram({
    modules: [ modelingModule ]
  }));


  var parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape);

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


  describe('reconnectStart', function() {

    describe('passing position', function() {

      it('should execute', inject(function(modeling) {

        // given
        var newWaypoints = [ { x: 120, y: 120 }, { x: 150, y: 200 }, { x: 350, y: 150 } ];

        // when
        modeling.reconnectStart(connection, childShape, { x: 120, y: 120 });

        // then
        expect(connection.waypoints).to.eql(newWaypoints);
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // given
        var oldWaypoints = connection.waypoints.slice();

        modeling.reconnectStart(connection, childShape, { x: 120, y: 120 });

        // when
        commandStack.undo();

        // then
        expect(connection.waypoints).to.eql(oldWaypoints);
      }));

    });



    describe('passing waypoints', function() {

      it('should execute', inject(function(modeling) {

        var newWaypoints = [ { x: 110, y: 110 }, { x: 300, y: 300 } ];

        // when
        modeling.reconnectStart(connection, childShape, newWaypoints);

        // then
        expect(connection.waypoints).to.eql(newWaypoints);
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // given
        var oldWaypoints = connection.waypoints.slice();

        modeling.reconnectStart(connection, childShape, [ { x: 110, y: 110 }, { x: 300, y: 300 } ]);

        // when
        commandStack.undo();

        // then
        expect(connection.waypoints).to.eql(oldWaypoints);
      }));

    });

  });


  describe('reconnectEnd', function() {

    describe('passing position', function() {

      it('should execute', inject(function(modeling) {

        // given
        var newWaypoints = [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 300, y: 100 } ];

        // when
        modeling.reconnectEnd(connection, childShape2, { x: 300, y: 100 });

        // then
        expect(connection.waypoints).to.eql(newWaypoints);
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // given
        var oldWaypoints = connection.waypoints.slice();

        modeling.reconnectEnd(connection, childShape2, { x: 300, y: 100 });

        // when
        commandStack.undo();

        // then
        expect(connection.waypoints).to.eql(oldWaypoints);
      }));

    });



    describe('passing waypoints', function() {

      it('should execute', inject(function(modeling) {

        var newWaypoints = [ { x: 110, y: 110 }, { x: 300, y: 300 } ];

        // when
        modeling.reconnectEnd(connection, childShape2, newWaypoints);

        // then
        expect(connection.waypoints).to.eql(newWaypoints);
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // given
        var oldWaypoints = connection.waypoints.slice();

        modeling.reconnectEnd(connection, childShape2, [ { x: 110, y: 110 }, { x: 300, y: 300 } ]);

        // when
        commandStack.undo();

        // then
        expect(connection.waypoints).to.eql(oldWaypoints);
      }));

    });

  });

});
