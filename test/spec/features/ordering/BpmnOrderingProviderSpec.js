import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  move,
  attach,
  connect,
  expectZOrder
} from './Helper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - ordering', function() {

  var testModules = [
    coreModule,
    modelingModule
  ];


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


    it('should stay behind Group', inject(function() {

      // when
      move('Participant', 'Collaboration');

      // then
      expectZOrder('Participant_StartEvent', 'Participant', 'Group');
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


    describe('should stay always in front', function() {

      it('moving <SequenceFlow_label> onto <Participant>', inject(function() {

        // when
        move('SequenceFlow_label', { x: 300, y: 0 }, 'Collaboration', false);

        // then
        expectZOrder('Collaboration', 'Participant', 'SequenceFlow_label');
      }));


      it('moving <StartEvent_label> onto <Participant>', inject(function() {

        // when
        move('StartEvent_label', { x: 50, y: -330 }, 'Participant', false);

        // then
        expectZOrder(
          'Participant',
          'Task_With_Boundary',
          'BoundaryEvent',
          'Participant_StartEvent',
          'StartEvent_label'
        );
      }));


      it('move <StartEvent> with label onto <Participant>', inject(function() {

        // when
        move('StartEvent', { x: 0, y: -330 }, 'Participant', false);

        // then
        expectZOrder(
          'Participant',
          'Participant_StartEvent',
          'StartEvent_label'
        );
      }));


      it('move <DataStore> with label onto <Participant_StartEvent>', inject(function() {

        // when
        move('DataStore', { x: -150, y: 330 }, 'Participant_StartEvent', false);

        // then
        expectZOrder(
          'Participant',
          'Participant_StartEvent',
          'DataStore',
          'DataStore_label'
        );
      }));

    });

  });


  describe('groups', function() {

    var diagramXML = require('./groups.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('should stay always in front', function() {

      it('moving <Group> onto <StartEvent>', inject(function() {

        // when
        move('Group', { x: 100, y: 0 }, 'StartEvent', false);

        // then
        expectZOrder('StartEvent', 'Group');
      }));


      it('moving <Group> onto <Task>', inject(function() {

        // when
        move('Group', { x: 200, y: 50 }, 'Task', false);

        // then
        expectZOrder('Task', 'Group');
      }));


      it('move <Group> onto <SubProcess>', inject(function() {

        // when
        move('Group', { x: 400, y: 0 }, 'SubProcess', false);

        // then
        expectZOrder('SubProcess', 'Group');
      }));


      it('move <Group> onto <Participant>', inject(function() {

        // when
        move('Group', { x: 50, y: 0 }, 'Participant', false);

        // then
        expectZOrder('Participant', 'Group');
      }));

    });

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
