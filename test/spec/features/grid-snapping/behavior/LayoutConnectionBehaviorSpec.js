import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import gridSnappingModule from 'lib/features/grid-snapping';
import modelingModule from 'lib/features/modeling';
import moveModule from 'diagram-js/lib/features/move';


describe('features/grid-snapping - layout connection', function() {

  var diagramXML = require('./LayoutConnectionBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      gridSnappingModule,
      modelingModule,
      moveModule
    ]
  }));


  describe('on connection create', function() {

    it('should snap 3 segment connection (1 middle segment)', inject(
      function(elementRegistry, modeling) {

        // given
        var task1 = elementRegistry.get('Task_1'),
            task2 = elementRegistry.get('Task_2');

        // when
        var connection = modeling.connect(task1, task2);

        // then
        expect(connection.waypoints[1]).to.eql({ x: 250, y: 140 });
        expect(connection.waypoints[2]).to.eql({ x: 250, y: 240 });
      })
    );


    it('should snap 4 segment connection (2 middle segments)', inject(
      function(elementRegistry, modeling) {

        // given
        var boundaryEvent1 = elementRegistry.get('BoundaryEvent_1'),
            task4 = elementRegistry.get('Task_4');

        // when
        var connection = modeling.connect(boundaryEvent1, task4);

        // then
        expect(connection.waypoints[1]).to.eql({ x: 150, y: 520 });
        expect(connection.waypoints[2]).to.eql({ x: 230, y: 520 });
        expect(connection.waypoints[3]).to.eql({ x: 230, y: 440 });
      }
    ));

  });


  describe('on connection layout', function() {

    describe('should snap 3 segment connection (1 middle segment)', function() {

      var connection;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var task1 = elementRegistry.get('Task_1'),
            task2 = elementRegistry.get('Task_2');

        connection = modeling.connect(task1, task2);

        // when
        modeling.moveElements([ task2 ], { x: 50, y: 50 });
      }));


      it('should do', function() {

        // then
        expect(connection.waypoints[1]).to.eql({ x: 250, y: 140 });
        expect(connection.waypoints[2]).to.eql({ x: 250, y: 290 });
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(connection.waypoints[1]).to.eql({ x: 250, y: 140 });
        expect(connection.waypoints[2]).to.eql({ x: 250, y: 240 });
      }));


      it('should redo', inject(function(commandStack) {

        // given
        commandStack.undo();

        // when
        commandStack.redo();

        // then
        expect(connection.waypoints[1]).to.eql({ x: 250, y: 140 });
        expect(connection.waypoints[2]).to.eql({ x: 250, y: 290 });
      }));

    });


    describe('should snap 4 segment connection (2 middle segments)', function() {

      var connection;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var boundaryEvent1 = elementRegistry.get('BoundaryEvent_1'),
            task4 = elementRegistry.get('Task_4');

        connection = modeling.connect(boundaryEvent1, task4);

        // when
        modeling.moveElements([ task4 ], { x: 50, y: 50 });
      }));


      it('should do', function() {

        // then
        expect(connection.waypoints[1]).to.eql({ x: 150, y: 520 });
        expect(connection.waypoints[2]).to.eql({ x: 230, y: 520 });
        expect(connection.waypoints[3]).to.eql({ x: 230, y: 490 });
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(connection.waypoints[1]).to.eql({ x: 150, y: 520 });
        expect(connection.waypoints[2]).to.eql({ x: 230, y: 520 });
        expect(connection.waypoints[3]).to.eql({ x: 230, y: 440 });
      }));


      it('should redo', inject(function(commandStack) {

        // given
        commandStack.undo();

        // when
        commandStack.redo();

        // then
        expect(connection.waypoints[1]).to.eql({ x: 150, y: 520 });
        expect(connection.waypoints[2]).to.eql({ x: 230, y: 520 });
        expect(connection.waypoints[3]).to.eql({ x: 230, y: 490 });
      }));

    });

  });

});