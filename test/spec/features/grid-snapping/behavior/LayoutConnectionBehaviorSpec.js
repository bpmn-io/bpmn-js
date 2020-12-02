import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import gridSnappingModule from 'lib/features/grid-snapping';
import modelingModule from 'lib/features/modeling';
import moveModule from 'diagram-js/lib/features/move';
import copyPasteModule from 'lib/features/copy-paste';


describe('features/grid-snapping - layout connection', function() {

  describe('on connection create', function() {

    var diagramXML = require('./LayoutConnectionBehavior.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        gridSnappingModule,
        modelingModule,
        moveModule
      ]
    }));


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

    var diagramXML = require('./LayoutConnectionBehavior.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        gridSnappingModule,
        modelingModule,
        moveModule
      ]
    }));

    var task1, task2, connection;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      task1 = elementRegistry.get('Task_1'),
      task2 = elementRegistry.get('Task_2');

      connection = modeling.connect(task1, task2);
    }));


    it('should NOT snap on reconnect start', inject(function(modeling) {

      // when
      modeling.moveElements([ task1 ], { x: 50, y: 50 });

      // then
      expect(connection.waypoints[1]).to.eql({ x: 275, y: 190 });
      expect(connection.waypoints[2]).to.eql({ x: 275, y: 240 });
    }));


    it('should NOT snap on reconnect end', inject(function(modeling) {

      // when
      modeling.moveElements([ task2 ], { x: -50, y: -50 });

      // then
      expect(connection.waypoints[1]).to.eql({ x: 225, y: 140 });
      expect(connection.waypoints[2]).to.eql({ x: 225, y: 190 });
    }));


    it('should snap', inject(function(modeling, elementRegistry) {

      // given
      var flow = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.layoutConnection(flow);

      // then
      expect(flow.waypoints[1]).to.eql({ x: 530, y: 242 });
      expect(flow.waypoints[2]).to.eql({ x: 530, y: 310 });
    }));


    it('should UNDO snap', inject(function(modeling, commandStack, elementRegistry) {

      // given
      var flow = elementRegistry.get('SequenceFlow_1');

      modeling.layoutConnection(flow);

      // when
      commandStack.undo();

      // then
      expect(flow.waypoints[1]).to.eql({ x: 526, y: 242 });
      expect(flow.waypoints[2]).to.eql({ x: 526, y: 310 });
    }));

  });


  describe('on paste multiple', function() {

    var diagramXML = require('./LayoutConnectionBehavior.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        gridSnappingModule,
        modelingModule,
        moveModule,
        copyPasteModule
      ]
    }));


    it('should not update waypoints', inject(
      function(canvas, eventBus, copyPaste, elementRegistry) {

        // given
        var layoutSpy = sinon.spy();

        copyPaste.copy([
          elementRegistry.get('Task_2'),
          elementRegistry.get('SequenceFlow_1'),
          elementRegistry.get('Task_5')
        ]);

        eventBus.on('commandStack.connection.updateWaypoints.execute', layoutSpy);

        // when
        copyPaste.paste({
          element: canvas.getRootElement(),
          point: {
            x: 100,
            y: 200
          }
        });

        // then
        expect(layoutSpy).not.to.have.been.called;
      }
    ));

  });

});