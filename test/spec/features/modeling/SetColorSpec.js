import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

var FUCHSIA_HEX = '#ff00ff',
    YELLOW_HEX = '#ffff00';


describe('features/modeling - set color', function() {

  var diagramXML = require('./SetColor.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  describe('execute', function() {

    it('setting fill color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });

      // then
      expect(taskShape.businessObject.di.get('background-color')).to.equal(FUCHSIA_HEX);
    }));


    it('unsetting fill color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);

      // then
      expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
    }));


    it('setting fill color without changing stroke color', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        modeling.setColor(taskShape, { fill: 'FUCHSIA', stroke: 'YELLOW' });

        // when
        modeling.setColor(taskShape, { fill: 'YELLOW' });

        // then
        expect(taskShape.businessObject.di.get('background-color')).to.equal(YELLOW_HEX);
        expect(taskShape.businessObject.di.get('border-color')).to.equal(YELLOW_HEX);
      }
    ));


    it('unsetting fill color without changing stroke color', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        modeling.setColor(taskShape, { fill: 'FUCHSIA', stroke: 'YELLOW' });

        // when
        modeling.setColor(taskShape, { fill: undefined });

        // then
        expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
        expect(taskShape.businessObject.di.get('border-color')).to.equal(YELLOW_HEX);
      }
    ));


    it('unsetting both fill and stroke color', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        modeling.setColor(taskShape, { fill: 'FUCHSIA' });

        // when
        modeling.setColor(taskShape);

        // then
        expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
        expect(taskShape.businessObject.di.get('border-color')).not.to.exist;
      }
    ));


    it('setting stroke color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

      // then
      expect(taskShape.businessObject.di.get('border-color')).to.equal(FUCHSIA_HEX);
      expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
    }));


    it('unsetting stroke color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);

      // then
      expect(taskShape.businessObject.di.get('border-color')).not.to.exist;
      expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
    }));



    it('setting stroke + fill color on external label', inject(function(elementRegistry, modeling) {

      // given
      var flowShape = elementRegistry.get('SequenceFlow_3'),
          flowLabel = flowShape.label,
          flowDi = getDi(flowShape);

      // when
      modeling.setColor(flowLabel, { stroke: 'FUCHSIA', fill: 'FUCHSIA' });

      // then
      expect(flowDi.get('border-color')).not.to.exist;
      expect(flowDi.get('background-color')).not.to.exist;

      expect(flowDi.label.get('color')).to.eql(FUCHSIA_HEX);
    }));


    it('unsetting stroke + fill color on external label', inject(function(elementRegistry, modeling) {

      // given
      var flowShape = elementRegistry.get('SequenceFlow_3'),
          flowLabel = flowShape.label,
          flowDi = getDi(flowShape);

      // assume
      modeling.setColor(flowLabel, { stroke: 'FUCHSIA', fill: 'FUCHSIA' });

      // when
      modeling.setColor(flowLabel, { stroke: undefined, fill: undefined });

      // then
      expect(flowDi.get('border-color')).not.to.exist;
      expect(flowDi.get('background-color')).not.to.exist;

      expect(flowDi.label.get('color')).not.to.exist;
    }));


    it('setting fill color (multiple elements)', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');

        // when
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

        // then
        expect(taskShape.businessObject.di.get('background-color')).to.equal(FUCHSIA_HEX);
        expect(startEventShape.businessObject.di.get('background-color')).to.equal(FUCHSIA_HEX);
        expect(taskShape.businessObject.di.get('border-color')).not.to.exist;
        expect(startEventShape.businessObject.di.get('border-color')).not.to.exist;
      }
    ));


    it('unsetting fill color (multiple elements)', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);

        // then
        expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
        expect(startEventShape.businessObject.di.get('background-color')).not.to.exist;
      }
    ));


    it('setting stroke color (multiple elements)', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');

        // when
        modeling.setColor([
          taskShape,
          startEventShape
        ], { stroke: 'FUCHSIA' });

        // then
        expect(taskShape.businessObject.di.get('border-color')).to.equal(FUCHSIA_HEX);
        expect(startEventShape.businessObject.di.get('border-color')).to.equal(FUCHSIA_HEX);
        expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
        expect(startEventShape.businessObject.di.get('background-color')).not.to.exist;
      }
    ));


    it('unsetting stroke color (multiple elements)', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');
        modeling.setColor([
          taskShape,
          startEventShape
        ], { stroke: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);

        // then
        expect(taskShape.businessObject.di.get('border-color')).not.to.exist;
        expect(startEventShape.businessObject.di.get('border-color')).not.to.exist;
      }
    ));


    it('should not set background-color on BPMNEdge', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.setColor(sequenceFlow, { fill: 'FUCHSIA' });

      // then
      expect(sequenceFlow.businessObject.di.get('background-color')).not.to.exist;
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
        var taskShape = elementRegistry.get('Task_1');

        // when
        modeling.setColor(taskShape, { fill: 'FUCHSIA' });
        commandStack.undo();

        // then
        expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
      }
    ));


    it('unsetting fill color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        modeling.setColor(taskShape, { fill: 'FUCHSIA' });

        // when
        modeling.setColor(taskShape);
        commandStack.undo();

        // then
        expect(taskShape.businessObject.di.get('background-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('setting stroke color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');

        // when
        modeling.setColor(taskShape, { stroke: 'FUCHSIA' });
        commandStack.undo();

        // then
        expect(taskShape.businessObject.di.get('border-color')).not.to.exist;
      }
    ));


    it('unsetting stroke color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

        // when
        modeling.setColor(taskShape);
        commandStack.undo();

        // then
        expect(taskShape.businessObject.di.get('border-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('setting fill color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');

        // when
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });
        commandStack.undo();

        // then
        expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
        expect(startEventShape.businessObject.di.get('background-color')).not.to.exist;
      }
    ));


    it('unsetting fill color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);
        commandStack.undo();

        // then
        expect(taskShape.businessObject.di.get('background-color')).to.equal(FUCHSIA_HEX);
        expect(startEventShape.businessObject.di.get('background-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('setting stroke color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');

        // when
        modeling.setColor([
          taskShape,
          startEventShape
        ], { stroke: 'FUCHSIA' });
        commandStack.undo();

        // then
        expect(taskShape.businessObject.di.get('border-color')).not.to.exist;
        expect(startEventShape.businessObject.di.get('border-color')).not.to.exist;
      }
    ));


    it('unsetting stroke color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');
        modeling.setColor([ taskShape, startEventShape ], { stroke: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);
        commandStack.undo();

        // then
        expect(taskShape.businessObject.di.get('border-color')).to.equal(FUCHSIA_HEX);
        expect(startEventShape.businessObject.di.get('border-color')).to.equal(FUCHSIA_HEX);
      }
    ));

  });


  describe('redo', function() {

    it('setting fill color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');

        // when
        modeling.setColor(taskShape, { fill: 'FUCHSIA' });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskShape.businessObject.di.get('background-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('unsetting fill color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        modeling.setColor(taskShape, { fill: 'FUCHSIA' });

        // when
        modeling.setColor(taskShape);
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
      }
    ));


    it('setting stroke color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');

        // when
        modeling.setColor(taskShape, { stroke: 'FUCHSIA' });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskShape.businessObject.di.get('border-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('unsetting stroke color', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

        // when
        modeling.setColor(taskShape);
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskShape.businessObject.di.get('border-color')).not.to.exist;
      }
    ));


    it('setting fill color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');

        // when
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskShape.businessObject.di.get('background-color')).to.equal(FUCHSIA_HEX);
        expect(startEventShape.businessObject.di.get('background-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('unsetting fill color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');
        modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskShape.businessObject.di.get('background-color')).not.to.exist;
        expect(startEventShape.businessObject.di.get('background-color')).not.to.exist;
      }
    ));


    it('setting stroke color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');

        // when
        modeling.setColor([ taskShape, startEventShape ], { stroke: 'FUCHSIA' });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskShape.businessObject.di.get('border-color')).to.equal(FUCHSIA_HEX);
        expect(startEventShape.businessObject.di.get('border-color')).to.equal(FUCHSIA_HEX);
      }
    ));


    it('unsetting stroke color (multiple elements)', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var startEventShape = elementRegistry.get('StartEvent_1');
        modeling.setColor([
          taskShape,
          startEventShape
        ], { stroke: 'FUCHSIA' });

        // when
        modeling.setColor([ taskShape, startEventShape ]);
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskShape.businessObject.di.get('border-color')).not.to.exist;
        expect(startEventShape.businessObject.di.get('border-color')).not.to.exist;
      }
    ));

  });


  // TODO @barmac: remove once we drop bpmn.io properties
  describe('legacy', function() {

    it('should set both BPMN in Color and bpmn.io properties on BPMNShape', inject(
      function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task_1');

        // when
        modeling.setColor(taskShape, { stroke: '#abcdef', fill: '#fedcba' });

        // then
        expect(taskShape.businessObject.di.get('border-color')).to.eql('#abcdef');
        expect(taskShape.businessObject.di.get('stroke')).to.eql('#abcdef');
        expect(taskShape.businessObject.di.get('background-color')).to.eql('#fedcba');
        expect(taskShape.businessObject.di.get('fill')).to.eql('#fedcba');
      }
    ));


    it('should set both BPMN in Color and bpmn.io properties on BPMNEdge', inject(
      function(elementRegistry, modeling) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1');

        // when
        modeling.setColor(sequenceFlow, { stroke: '#abcdef' });

        // then
        expect(sequenceFlow.businessObject.di.get('border-color')).to.eql('#abcdef');
        expect(sequenceFlow.businessObject.di.get('stroke')).to.eql('#abcdef');
      }
    ));

  });

});


// helpers //////////

function getDi(element) {
  return element.businessObject.di;
}