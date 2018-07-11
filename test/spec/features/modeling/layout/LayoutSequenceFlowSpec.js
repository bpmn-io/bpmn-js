import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  connect,
  element,
  move,
  reconnectEnd
} from './Helper';

import Modeler from 'lib/Modeler';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - layout', function() {

  describe.skip('overall experience, flow elements', function() {

    var diagramXML = require('./LayoutSequenceFlowSpec.flowElements.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: Modeler.prototype._modules }));


    it('should feel awesome', inject(function() { }));

  });


  describe('boundary events', function() {

    var diagramXML = require('./LayoutSequenceFlowSpec.boundaryEvents.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('loops', function() {

      it('attached top right', function() {

        // when
        var connection = connect('BoundaryEvent_TopRight', 'SubProcess');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 650, y: 300 }, x: 650, y: 282 },
          { x: 650, y: 262 },
          { x: 475, y: 262 },
          { original: { x: 475, y: 400 }, x: 475, y: 300 }
        ]);
      });


      it('attached bottom right', function() {

        // when
        var connection = connect('BoundaryEvent_BottomRight', 'SubProcess');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 650, y: 468 }, x: 668, y: 468 },
          { x: 688, y: 468 },
          { x: 688, y: 400 },
          { original: { x: 475, y: 400 }, x: 650, y: 400 }
        ]);
      });


      it('attached bottom left', function() {

        // when
        var connection = connect('BoundaryEvent_BottomLeft', 'SubProcess');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 300, y: 500 }, x: 300, y: 518 },
          { x: 300, y: 538 },
          { x: 475, y: 538 },
          { original: { x: 475, y: 400 }, x: 475, y: 500 }
        ]);
      });


      it('attached top left', function() {

        // when
        var connection = connect('BoundaryEvent_TopLeft', 'SubProcess');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 300, y: 338 }, x: 282, y: 338 },
          { x: 262, y: 338 },
          { x: 262, y: 400 },
          { original: { x: 475, y: 400 }, x: 300, y: 400 }
        ]);
      });

    });


    describe('non-loops', function() {

      it('attached top right, orientation top', function() {

        // when
        var connection = connect('BoundaryEvent_TopRight', 'Task_Top');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 650, y: 300 }, x: 650, y: 282 },
          { x: 650, y: 40 },
          { original: { x: 450, y: 40 }, x: 500, y: 40 }
        ]);
      });


      it('attached top right, orientation right', function() {

        // when
        var connection = connect('BoundaryEvent_TopRight', 'Task_Right');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 650, y: 300 }, x: 668, y: 300 },
          { x: 900, y: 300 },
          { original: { x: 900, y: 390 }, x: 900, y: 350 }
        ]);
      });


      it('attached top right, orientation bottom', function() {

        // when
        var connection = connect('BoundaryEvent_TopRight', 'Task_Bottom');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 650, y: 300 }, x: 650, y: 282 },
          { x: 650, y: 262 },
          { x: 450, y: 262 },
          { original: { x: 450, y: 690 }, x: 450, y: 650 }
        ]);
      });


      it('attached top right, orientation left', function() {

        // when
        var connection = connect('BoundaryEvent_TopRight', 'Task_Left');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 650, y: 300 }, x: 650, y: 282 },
          { x: 650, y: 262 },
          { x: 50, y: 262 },
          { original: { x: 50, y: 390 }, x: 50, y: 350 }
        ]);
      });

    });

  });


  describe('flow elements', function() {

    var diagramXML = require('./LayoutSequenceFlowSpec.flowElements.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('loops', function() {

      it('should layout loop', function() {

        // when
        var connection = connect('Task_1', 'Task_1');

        // then
        expect(connection).to.have.waypoints([
          { x: 332, y: 260 },
          { x: 332, y: 280 },
          { x: 262, y: 280 },
          { x: 262, y: 220 },
          { x: 282, y: 220 }
        ]);
      });

    });


    describe('gateway layout', function() {

      it('should layout v:h after Gateway', inject(function() {

        // when
        var connection = connect('ExclusiveGateway_1', 'BusinessRuleTask_1');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 678, y: 302 }, x: 678, y: 277 },
          { x: 678, y: 220 },
          { original: { x: 840, y: 220 }, x: 790, y: 220 }
        ]);
      }));


      it('should layout h:v before Gateway', inject(function() {

        // when
        var connection = connect('BusinessRuleTask_1', 'ParallelGateway_1');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 840, y: 220 }, x: 890, y: 220 },
          { x: 1005, y: 220 },
          { original: { x: 1005, y: 302 }, x: 1005, y: 277 }
        ]);
      }));

    });


    describe('other elements layout', function() {

      it('should layout h:h after StartEvent', inject(function() {

        // when
        var connection = connect('StartEvent_1', 'Task_1');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 170, y: 302 }, x: 188, y: 302 },
          { x: 235, y: 302 },
          { x: 235, y: 220 },
          { original: { x: 332, y: 220 }, x: 282, y: 220 }
        ]);
      }));


      it('should layout h:h after Task', inject(function() {

        // when
        var connection = connect('ServiceTask_1', 'BusinessRuleTask_1');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 678, y: 117 }, x: 728, y: 117 },
          { x: 759, y: 117 },
          { x: 759, y: 220 },
          { original: { x: 840, y: 220 }, x: 790, y: 220 }
        ]);
      }));


      it('should layout h:h after IntermediateEvent', inject(function() {

        // when
        var connection = connect('IntermediateThrowEvent_1', 'ServiceTask_1');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 496, y: 302 }, x: 514, y: 302 },
          { x: 571, y: 302 },
          { x: 571, y: 117 },
          { original: { x: 678, y: 117 }, x: 628, y: 117 }
        ]);
      }));


      it('should layout h:h after IntermediateEvent (right to left)', inject(function() {

        // when
        var connection = connect('IntermediateThrowEvent_1', 'Task_1');

        // then
        expect(connection).to.have.waypoints([
          { original: { x: 496, y: 302 }, x: 478, y: 302 },
          { x: 430, y: 302 },
          { x: 430, y: 220 },
          { original: { x: 332, y: 220 }, x: 382, y: 220 }
        ]);
      }));

    });


    describe('relayout', function() {

      it('should not repair after reconnect end', inject(function() {

        // given
        var newDocking = { x: 660, y: 280 };
        var connection = element('SequenceFlow_1');

        // when
        reconnectEnd(connection, 'ExclusiveGateway_1', newDocking);

        // then
        expect(connection).to.have.waypoints([
          { x: 382, y: 241 },
          { x: 559, y: 241 },
          { x: 559, y: 138 },
          { x: 660, y: 280 }
        ]);
      }));


      it('should repair after target move', inject(function() {

        // given
        var delta = { x: -30, y: 20 };
        var connection = element('SequenceFlow_1');

        // when
        move('ServiceTask_1', delta);

        // then
        expect(connection).to.have.waypoints([
          { x: 382, y: 241 },
          { x: 559, y: 241 },
          { x: 559, y: 158 },
          { x: 598, y: 158 }
        ]);
      }));


      it('should repair after source move', inject(function() {

        // given
        var delta = { x: -30, y: 20 };
        var connection = element('SequenceFlow_1');

        // when
        move('Task_1', delta);

        // then
        expect(connection).to.have.waypoints([
          { x: 352, y: 261 },
          { x: 559, y: 261 },
          { x: 559, y: 138 },
          { x: 628, y: 138 }
        ]);
      }));

    });

  });

});
