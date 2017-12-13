'use strict';

var Helper = require('./Helper');

/* global bootstrapModeler, inject */

var move = Helper.move,
    attach = Helper.attach,
    connect = Helper.connect,
    expectZOrder = Helper.expectZOrder;

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - ordering', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('boundary events', function() {

    describe('move', function() {

      var diagramXML = require('./ordering.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should stay in front of Task', inject(function() {

        // when
        move('Task_With_Boundary');

        // then
        expectZOrder('Task_With_Boundary', 'BoundaryEvent');
      }));


      it('should stay in front of Task, moving both', inject(function() {

        // when
        move([ 'BoundaryEvent', 'Task_With_Boundary' ], 'Participant_StartEvent');

        // then
        expectZOrder('Task_With_Boundary', 'BoundaryEvent');
      }));

    });


    describe('add', function() {

      var diagramXML = require('./ordering-start-event.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should add in front of Task', inject(function() {

        // when
        var boundaryShape = attach({ type: 'bpmn:BoundaryEvent' }, { x: 300, y: 80 }, 'Task');

        // then
        expectZOrder('Task', boundaryShape.id);
      }));

    });

  });


  describe('participants', function() {

    var diagramXML = require('./ordering.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should stay behind MessageFlow', inject(function() {

      // when
      move('Participant', 'Collaboration');

      // then
      expectZOrder('Participant_StartEvent', 'Participant', 'MessageFlow');
    }));


    it('should stay behind DataInputAssociation when moving Participant with DataStore', inject(function() {

      // when
      move('Participant', { x: 5, y: 5 });

      // then
      expectZOrder('Participant', 'DataInputAssociation');
      expectZOrder('Participant_StartEvent', 'DataInputAssociation');
    }));


    it('should stay behind DataInputAssociation when moving Participant with Task', inject(function() {

      // when
      move('Participant_StartEvent', { x: 5, y: 5 });

      // then
      expectZOrder('Participant', 'DataInputAssociation');
      expectZOrder('Participant_StartEvent', 'DataInputAssociation');
    }));


    it('should stay behind DataOutputAssociation when moving Participant with DataStore', inject(function() {

      // when
      move('Participant', { x: 5, y: 5 });

      // then
      expectZOrder('Participant', 'DataOutputAssociation');
      expectZOrder('Participant_StartEvent', 'DataOutputAssociation');
    }));


    it('should stay behind DataOutputAssociation when moving Participant with Task', inject(function() {

      // when
      move('Participant_StartEvent', { x: 5, y: 5 });

      // then
      expectZOrder('Participant', 'DataOutputAssociation');
      expectZOrder('Participant_StartEvent', 'DataOutputAssociation');
    }));

  });


  describe('sub processes', function() {

    var diagramXML = require('./ordering-subprocesses.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should stay behind boundary events', inject(function() {

      // when
      move('BoundaryEvent_SubProcess', { x: 50, y: 0 }, 'SubProcess_1', true);

      // then
      expectZOrder('SubProcess_1', 'BoundaryEvent_SubProcess');
    }));


    it('should stay behind tasks', inject(function() {

      // when
      move(['Task_1', 'Task_2'], { x: 50, y: 0 }, 'SubProcess_1');

      // then
      expectZOrder('SubProcess_1', 'Task_1', 'Task_2');
    }));


    it('should be in front of tasks if task is not a child', inject(function() {

      // when
      move(['Task_1', 'Task_2'], { x: 200, y: 0 }, 'Root');

      // then
      expectZOrder('Task_1', 'Task_2', 'SubProcess_1');
    }));

  });


  describe('transaction', function() {

    var diagramXML = require('./ordering-subprocesses.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should stay behind boundary events', inject(function() {

      // when
      move('BoundaryEvent_Transaction', { x: 50, y: 0 }, 'Transaction_1', true);

      // then
      expectZOrder('Transaction_1', 'BoundaryEvent_Transaction');
    }));


    it('should stay behind tasks', inject(function() {

      // when
      move(['Task_1', 'Task_2'], { x: 50, y: 0 }, 'Transaction_1');

      // then
      expectZOrder('Transaction_1', 'Task_1', 'Task_2');
    }));


    it('should be in front of tasks if task is not a child', inject(function() {

      // when
      move(['Task_1', 'Task_2'], { x: 200, y: 0 }, 'Root');

      // then
      expectZOrder('Task_1', 'Task_2', 'Transaction_1');
    }));

  });


  describe('labels', function() {

    var diagramXML = require('./ordering.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should always be in front', inject(function() {

      // when
      move('SequenceFlow_label', { x: 500, y: 0 }, 'Collaboration', false);

      // then
      expectZOrder('Collaboration', 'Participant', 'SequenceFlow_label');
    }));

  });


  describe('connections', function() {

    var diagramXML = require('./ordering.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should render sequence flows behind tasks', inject(function() {

      // when
      var connection = connect('BoundaryEvent', 'Task');

      // then
      expectZOrder(connection, 'Task', 'BoundaryEvent', connection.label);
    }));

  });

});
