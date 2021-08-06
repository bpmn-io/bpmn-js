import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { getDi } from 'lib/util/ModelUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

var FUCHSIA_HEX = '#ff00ff',
    YELLOW_HEX = '#ffff00';

describe('features/modeling - set color', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  describe('execute', function() {

    it('setting fill color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1'),
          taskDi = getDi(taskShape);

      // when
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });

      // then
      expect(taskDi.get('background-color')).to.equal(FUCHSIA_HEX);
    }));


    it('unsetting fill color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1'),
          taskDi = getDi(taskShape);
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);

      // then
      expect(taskDi.get('background-color')).not.to.exist;
    }));


    it('setting fill color without changing stroke color', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        modeling.setColor(taskShape, { fill: 'FUCHSIA', stroke: 'YELLOW' });

        // when
        modeling.setColor(taskShape, { fill: 'YELLOW' });

        // then
        expect(taskDi.get('background-color')).to.equal(YELLOW_HEX);
        expect(taskDi.get('border-color')).to.equal(YELLOW_HEX);
      }
    ));


    it('unsetting fill color without changing stroke color', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        modeling.setColor(taskShape, { fill: 'FUCHSIA', stroke: 'YELLOW' });

        // when
        modeling.setColor(taskShape, { fill: undefined });

        // then
        expect(taskDi.get('background-color')).not.to.exist;
        expect(taskDi.get('border-color')).to.equal(YELLOW_HEX);
      }
    ));


    it('unsetting both fill and stroke color', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        modeling.setColor(taskShape, { fill: 'FUCHSIA' });

        // when
        modeling.setColor(taskShape);

        // then
        expect(taskDi.get('background-color')).not.to.exist;
        expect(taskDi.get('border-color')).not.to.exist;
      }
    ));


    it('setting stroke color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1'),
          taskDi = getDi(taskShape);

      // when
      modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

      // then
      expect(taskDi.get('border-color')).to.equal(FUCHSIA_HEX);
      expect(taskDi.get('background-color')).not.to.exist;
    }));


    it('unsetting stroke color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1'),
          taskDi = getDi(taskShape);
      modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);

      // then
      expect(taskDi.get('border-color')).not.to.exist;
      expect(taskDi.get('background-color')).not.to.exist;
    }));


    it('setting fill color (multiple elements)', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);

        // when
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

        // then
        expect(taskDi.get('background-color')).to.equal(FUCHSIA_HEX);
        expect(startEventDi.get('background-color')).to.equal(FUCHSIA_HEX);
        expect(taskDi.get('border-color')).not.to.exist;
        expect(startEventDi.get('border-color')).not.to.exist;
      }
    ));


    it('unsetting fill color (multiple elements)', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);

        // then
        expect(taskDi.get('background-color')).not.to.exist;
        expect(startEventDi.get('background-color')).not.to.exist;
      }
    ));


    it('setting stroke color (multiple elements)', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);

        // when
        modeling.setColor([
          taskShape,
          startEventShape
        ], { stroke: 'FUCHSIA' });

        // then
        expect(taskDi.get('border-color')).to.equal(FUCHSIA_HEX);
        expect(startEventDi.get('border-color')).to.equal(FUCHSIA_HEX);
        expect(taskDi.get('background-color')).not.to.exist;
        expect(startEventDi.get('background-color')).not.to.exist;
      }
    ));


    it('unsetting stroke color (multiple elements)', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);

        modeling.setColor([
          taskShape,
          startEventShape
        ], { stroke: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);

        // then
        expect(taskDi.get('border-color')).not.to.exist;
        expect(startEventDi.get('border-color')).not.to.exist;
      }
    ));


    it('should not set background-color on BPMNEdge', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
          sequenceFlowDi = getDi(sequenceFlow);

      // when
      modeling.setColor(sequenceFlow, { fill: 'FUCHSIA' });

      // then
      expect(sequenceFlowDi.get('background-color')).not.to.exist;
    }));


    it('should throw for an invalid color', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_1');

      // when
      function setColor() {
        modeling.setColor(sequenceFlow, { fill: 'INVALID_COLOR' });
      }

      // then
      expect(setColor).to.throw(/^invalid color value/);
    }));


    it('should throw for a color with alpha', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_1');

      // when
      function setColor() {
        modeling.setColor(sequenceFlow, { fill: 'rgba(0, 255, 0, 0.5)' });
      }

      // then
      expect(setColor).to.throw(/^invalid color value/);
    }));
  });


  describe('undo', function() {

    it('setting fill color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);

        // when
        modeling.setColor(taskShape, { fill: 'FUCHSIA' });
        commandStack.undo();

        // then
        expect(taskDi.get('background-color')).not.to.exist;
      }
    ));


    it('unsetting fill color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);

        modeling.setColor(taskShape, { fill: 'FUCHSIA' });

        // when
        modeling.setColor(taskShape);
        commandStack.undo();

        // then
        expect(taskDi.get('background-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('setting stroke color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);

        // when
        modeling.setColor(taskShape, { stroke: 'FUCHSIA' });
        commandStack.undo();

        // then
        expect(taskDi.get('border-color')).not.to.exist;
      }
    ));


    it('unsetting stroke color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

        // when
        modeling.setColor(taskShape);
        commandStack.undo();

        // then
        expect(taskDi.get('border-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('setting fill color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);

        // when
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });
        commandStack.undo();

        // then
        expect(taskDi.get('background-color')).not.to.exist;
        expect(startEventDi.get('background-color')).not.to.exist;
      }
    ));


    it('unsetting fill color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);
        commandStack.undo();

        // then
        expect(taskDi.get('background-color')).to.equal(FUCHSIA_HEX);
        expect(startEventDi.get('background-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('setting stroke color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);

        // when
        modeling.setColor([
          taskShape,
          startEventShape
        ], { stroke: 'FUCHSIA' });
        commandStack.undo();

        // then
        expect(taskDi.get('border-color')).not.to.exist;
        expect(startEventDi.get('border-color')).not.to.exist;
      }
    ));


    it('unsetting stroke color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);
        modeling.setColor([ taskShape, startEventShape ], { stroke: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);
        commandStack.undo();

        // then
        expect(taskDi.get('border-color')).to.equal(FUCHSIA_HEX);
        expect(startEventDi.get('border-color')).to.equal(FUCHSIA_HEX);
      }
    ));

  });


  describe('redo', function() {

    it('setting fill color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);

        // when
        modeling.setColor(taskShape, { fill: 'FUCHSIA' });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskDi.get('background-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('unsetting fill color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        modeling.setColor(taskShape, { fill: 'FUCHSIA' });

        // when
        modeling.setColor(taskShape);
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskDi.get('background-color')).not.to.exist;
      }
    ));


    it('setting stroke color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);

        // when
        modeling.setColor(taskShape, { stroke: 'FUCHSIA' });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskDi.get('border-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('unsetting stroke color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

        // when
        modeling.setColor(taskShape);
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskDi.get('border-color')).not.to.exist;
      }
    ));


    it('setting fill color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);

        // when
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskDi.get('background-color')).to.equal(FUCHSIA_HEX);
        expect(startEventDi.get('background-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('unsetting fill color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskDi.get('background-color')).not.to.exist;
        expect(startEventDi.get('background-color')).not.to.exist;
      }
    ));


    it('setting stroke color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);

        // when
        modeling.setColor([ taskShape, startEventShape ], { stroke: 'FUCHSIA' });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskDi.get('border-color')).to.equal(FUCHSIA_HEX);
        expect(startEventDi.get('border-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('unsetting stroke color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);
        var startEventShape = elementRegistry.get('StartEvent_1'),
            startEventDi = getDi(startEventShape);
        modeling.setColor([
          taskShape,
          startEventShape
        ], { stroke: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskDi.get('border-color')).not.to.exist;
        expect(startEventDi.get('border-color')).not.to.exist;
      }
    ));

  });


  // TODO @barmac: remove once we drop bpmn.io properties
  describe('legacy', function() {

    it('should set both BPMN in Color and bpmn.io properties on BPMNShape', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            taskDi = getDi(taskShape);

        // when
        modeling.setColor(taskShape, { stroke: '#abcdef', fill: '#fedcba' });

        // then
        expect(taskDi.get('border-color')).to.eql('#abcdef');
        expect(taskDi.get('stroke')).to.eql('#abcdef');
        expect(taskDi.get('background-color')).to.eql('#fedcba');
        expect(taskDi.get('fill')).to.eql('#fedcba');
      }
    ));


    it('should set both BPMN in Color and bpmn.io properties on BPMNEdge', inject(
      function(elementRegistry, modeling) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            sequenceFlowDi = getDi(sequenceFlow);

        // when
        modeling.setColor(sequenceFlow, { stroke: '#abcdef' });

        // then
        expect(sequenceFlowDi.get('border-color')).to.eql('#abcdef');
        expect(sequenceFlowDi.get('stroke')).to.eql('#abcdef');
      }
    ));
  });
});
