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

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - layout', function() {

  describe('boundary events', function() {

    describe('loops', function() {

      var diagramXML = require('./LayoutSequenceFlowSpec.boundaryEventsLoops.bpmn');

      var testModules = [ coreModule, modelingModule ];

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      describe('in the corner', function() {

        it('attached top right', function() {

          // when
          var connection = connect('BoundaryEvent_TopRight', 'SubProcess');

          // then
          expect(connection).to.have.waypoints([
            { original: { x: 550, y: 200 }, x: 550, y: 182 },
            { x: 550, y: 162 },
            { x: 375, y: 162 },
            { original: { x: 375, y: 300 }, x: 375, y: 200 }
          ]);
        });


        it('attached bottom right', function() {

          // when
          var connection = connect('BoundaryEvent_BottomRight', 'SubProcess');

          // then
          expect(connection).to.have.waypoints([
            { original: { x: 550, y: 368 } , x: 568, y: 368 },
            { x: 588, y: 368 },
            { x: 588, y: 300 },
            { original: { x: 375, y: 300 } , x: 550, y: 300 }
          ]);
        });


        it('attached bottom left', function() {

          // when
          var connection = connect('BoundaryEvent_BottomLeft', 'SubProcess');

          // then
          expect(connection).to.have.waypoints([
            { original: { x: 200, y: 500 }, x: 200, y: 418 },
            { x: 200, y: 438 },
            { x: 375, y: 438 },
            { original: { x: 375, y: 300 }, x: 375, y: 400 }
          ]);
        });


        it('attached top left', function() {

          // when
          var connection = connect('BoundaryEvent_TopLeft', 'SubProcess');

          // then
          expect(connection).to.have.waypoints([
            { original: { x: 200, y: 238 }, x: 182, y: 238 },
            { x: 162, y: 238 },
            { x: 162, y: 300 },
            { original: { x: 375, y: 300 }, x: 200, y: 300 }
          ]);
        });
      });


      describe('on the side center', function() {

        var host = 'SubProcess_2';


        it('attached top center', function() {

          // when
          var connection = connect('BoundaryEvent_TopCenter', host);

          // then
          expect(connection).to.have.waypoints([
            { original: { x: 375, y: 460 }, x: 375, y: 442 },
            { x:375, y: 422 },
            { x:180, y: 422 },
            { x:180, y: 560 },
            { original:{ x: 375, y: 560 }, x: 200, y: 560 }
          ]);
        });


        it('attached center right', function() {

          // when
          var connection = connect('BoundaryEvent_CenterRight', host);

          // then
          expect(connection).to.have.waypoints([
            { original: { x: 550, y: 560 }, x: 568, y: 560 },
            { x: 588, y: 560 },
            { x: 588, y: 680 },
            { x: 375, y: 680 },
            { original: { x: 375, y: 560 }, x: 375, y: 660 }
          ]);
        });


        it('attached bottom center', function() {

          // when
          var connection = connect('BoundaryEvent_BottomCenter', host);

          // then
          expect(connection).to.have.waypoints([
            { original: { x: 375, y: 660 }, x: 375, y: 678 },
            { x: 375, y: 698 },
            { x: 180, y: 698 },
            { x: 180, y: 560 },
            { original: { x: 375, y: 560 }, x: 200, y: 560 }
          ]);
        });


        it('attached center left', function() {

          // when
          var connection = connect('BoundaryEvent_CenterLeft', host);

          // then
          expect(connection).to.have.waypoints([
            { original: { x: 200, y: 560 }, x: 182, y: 560 },
            { x: 162, y: 560 },
            { x: 162, y: 680 },
            { x: 375, y: 680 },
            { original: { x: 375, y: 560 }, x: 375, y: 660 }
          ]);
        });
      });
    });


    describe('non-loops', function() {

      var diagramXML = require('./LayoutSequenceFlowSpec.boundaryEvents.bpmn');

      var testModules = [ coreModule, modelingModule ];

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


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


      it('attached bottom center, orientation bottom', function() {

        // when
        var connection = connect('BoundaryEvent_BottomCenter', 'Task_Bottom');

        expect(connection).to.have.waypoints([
          { x: 450, y: 518 },
          { x: 450, y: 650 }
        ]);
      });


      it('attached top center, orientation top', function() {

        // when
        var connection = connect('BoundaryEvent_TopCenter', 'Task_Top');

        expect(connection).to.have.waypoints([
          { x: 450, y: 282 },
          { x: 450, y: 80 }
        ]);
      });


      it('attached right center, orientation right', function() {

        // when
        var connection = connect('BoundaryEvent_RightCenter', 'Task_Right');

        expect(connection).to.have.waypoints([
          { x: 668, y: 390 },
          { x: 850, y: 390 }
        ]);
      });


      it('attached right center, orientation left', function() {

        // when
        var connection = connect('BoundaryEvent_RightCenter', 'Task_Left');

        expect(connection).to.have.waypoints([
          { x: 668, y: 390 },
          { x: 688, y: 390 },
          { x: 688, y: 410 },
          { x: 536, y: 410 },
          { x: 536, y: 390 },
          { x: 100, y: 390 }
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


      it('should NOT relayout loop', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            task = elementRegistry.get('Task_1');

        // when
        reconnectEnd(sequenceFlow, task, getMid(task));

        // then
        expect(sequenceFlow).to.have.waypoints([
          { x: 382, y: 241 },
          { x: 559, y: 241 },
          { x: 559, y: 220 },
          { x: 382, y: 220 }
        ]);
      }));


      it('should relayout loop (b:l)', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2'),
            task = elementRegistry.get('Task_1');

        // when
        reconnectEnd(sequenceFlow, task, getMid(task));

        // then
        expect(sequenceFlow).to.have.waypoints([
          { x: 332, y: 260 },
          { x: 332, y: 280 },
          { x: 262, y: 280 },
          { x: 262, y: 220 },
          { x: 282, y: 220 }
        ]);
      }));


      it('should relayout loop (l:t)', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
            task = elementRegistry.get('Task_1');

        // when
        reconnectEnd(sequenceFlow, task, getMid(task));

        // then
        expect(sequenceFlow).to.have.waypoints([
          { x: 282, y: 220 },
          { x: 262, y: 220 },
          { x: 262, y: 160 },
          { x: 332, y: 160 },
          { x: 332, y: 180 }
        ]);
      }));


      it('should relayout loop (t:r)', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_4'),
            task = elementRegistry.get('Task_1');

        // when
        reconnectEnd(sequenceFlow, task, getMid(task));

        // then
        expect(sequenceFlow).to.have.waypoints([
          { x: 332, y: 180 },
          { x: 332, y: 160 },
          { x: 402, y: 160 },
          { x: 402, y: 220 },
          { x: 382, y: 220 }
        ]);
      }));

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

      it('should repair after reconnect end', inject(function() {

        // given
        var newDocking = { x: 660, y: 300 };
        var connection = element('SequenceFlow_1');

        // when
        reconnectEnd(connection, 'ExclusiveGateway_1', newDocking);

        // then
        expect(connection).to.have.waypoints([
          { x: 382, y: 241 },
          { x: 559, y: 241 },
          { x: 559, y: 300 },
          { x: 655, y: 300 }
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


  describe('subProcess', function() {

    var diagramXML = require('./LayoutSequenceFlowSpec.subProcess.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should layout straight between subProcesses (top -> bottom)', function() {

      // when
      var connection = connect('SubProcess_Center', 'SubProcess_Bottom'),
          source = connection.source,
          target = connection.target;

      var expectedX = getMid(target).x;

      // then
      expect(connection).to.have.waypoints([
        { x: expectedX, y: source.y + source.height },
        { x: expectedX, y: target.y }
      ]);
    });


    it('should layout straight between subProcesses (bottom -> top)', function() {

      // when
      var connection = connect('SubProcess_Bottom', 'SubProcess_Center'),
          source = connection.source,
          target = connection.target;

      var expectedX = getMid(target).x;

      // then
      expect(connection).to.have.waypoints([
        { x: expectedX, y: source.y },
        { x: expectedX, y: target.y + target.height }
      ]);
    });


    it('should layout straight between subProcess and task next to it (subProcess -> task)',
      function() {

        // when
        var connection = connect('SubProcess_Center', 'Task_Right'),
            source = connection.source,
            target = connection.target;

        var expectedY = getMid(target).y;

        // then
        expect(connection).to.have.waypoints([
          { x: source.x + source.width, y: expectedY },
          { x: target.x, y: expectedY }
        ]);
      }
    );


    it('should layout straight between subProcess and task next to it (task -> subProcess)',
      function() {

        // when
        var connection = connect('Task_Right', 'SubProcess_Center'),
            source = connection.source,
            target = connection.target;

        var expectedY = getMid(source).y;

        // then
        expect(connection).to.have.waypoints([
          { x: source.x, y: expectedY },
          { x: target.x + target.width, y: expectedY }
        ]);
      }
    );


    it('should layout straight between subProcess and task above (subProcess -> task)', function() {

      // when
      var connection = connect('SubProcess_Center', 'Task_Top'),
          source = connection.source,
          target = connection.target;

      var expectedX = getMid(target).x;

      // then
      expect(connection).to.have.waypoints([
        { x: expectedX, y: source.y },
        { x: expectedX, y: target.y + target.height }
      ]);
    });


    it('should layout straight between subProcess and task above (task -> subProcess)', function() {

      // when
      var connection = connect('Task_Top', 'SubProcess_Center'),
          source = connection.source,
          target = connection.target;

      var expectedX = getMid(source).x;

      // then
      expect(connection).to.have.waypoints([
        { x: expectedX, y: source.y + source.height },
        { x: expectedX, y: target.y }
      ]);
    });
  });
});
