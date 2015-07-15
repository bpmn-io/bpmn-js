'use strict';

/* global inject, bootstrapModeler */


var modelingModule = require('../../../../../lib/features/modeling');


describe('modeling/behavior - drop on connection', function(){

  var diagramXML = require('./CreateOnFlowBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: modelingModule }));


  describe('rules', function() {

    it('should be allowed for an IntermediateThrowEvent', inject(function(elementRegistry, bpmnRules, elementFactory) {

      // when
      var sequenceFlow = elementRegistry.get('SequenceFlow');
      var intermediateThrowEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

      // then
      expect(bpmnRules.canCreate(intermediateThrowEvent, sequenceFlow)).to.be.true;
    }));

  });


  describe('execution', function() {

    it('should connect start -> target -> end', inject(function(modeling, elementRegistry, elementFactory) {

      // given
      var intermediateThrowEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

      var startEvent = elementRegistry.get('StartEvent'),
          sequenceFlow = elementRegistry.get('SequenceFlow'),
          task = elementRegistry.get('Task');

      var position = { x: 340, y: 120 }; // first bendpoint

      // when
      var newShape = modeling.createShape(intermediateThrowEvent, position, sequenceFlow);

      // then

      var targetConnection = newShape.outgoing[0];

      // new incoming connection
      expect(newShape.incoming.length).to.equal(1);
      expect(newShape.incoming[0]).to.eql(sequenceFlow);

      // new outgoing connection
      expect(newShape.outgoing.length).to.equal(1);
      expect(targetConnection).to.be.ok;
      expect(targetConnection.type).to.equal('bpmn:SequenceFlow');

      expect(startEvent.outgoing[0]).to.equal(newShape.incoming[0]);
      expect(task.incoming[0]).to.equal(newShape.outgoing[0]);

      // split target at insertion point
      expect(sequenceFlow.waypoints).eql([
        { original: { x: 209, y: 120 }, x: 209, y: 120 },
        { original: { x: 340, y: 120 }, x: 322, y: 120 }
      ]);

      expect(targetConnection.waypoints).eql([
        { original: { x: 340, y: 120 }, x: 340, y: 138 },
        { x: 340, y: 299 },
        { original: { x: 502, y: 299 }, x: 502, y: 299 }
      ]);
    }));


    it('should connect start -> target', inject(function(modeling, elementRegistry, elementFactory) {

      // given
      var endEventShape = elementFactory.createShape({ type: 'bpmn:EndEvent' });

      var sequenceFlow = elementRegistry.get('SequenceFlow');

      var position = { x: 340, y: 120 }; // first bendpoint

      // when
      var newShape = modeling.createShape(endEventShape, position, sequenceFlow);

      // then

      // new incoming connection
      expect(newShape.incoming.length).to.equal(1);
      expect(newShape.incoming[0]).to.eql(sequenceFlow);

      // no outgoing edges
      expect(newShape.outgoing.length).to.equal(0);

      // split target at insertion point
      expect(sequenceFlow.waypoints).eql([
        { original: { x: 209, y: 120 }, x: 209, y: 120 },
        { original: { x: 340, y: 120 }, x: 322, y: 120 }
      ]);
    }));


    it('should connect target -> end', inject(function(modeling, elementRegistry, elementFactory) {

      // given
      var startEventShape = elementFactory.createShape({ type: 'bpmn:StartEvent' });

      var sequenceFlow = elementRegistry.get('SequenceFlow');

      var position = { x: 340, y: 120 }; // first bendpoint

      // when
      var newShape = modeling.createShape(startEventShape, position, sequenceFlow);

      // then

      // no incoming connection
      expect(newShape.incoming.length).to.equal(0);

      // no outgoing edges
      expect(newShape.outgoing.length).to.equal(1);
      expect(newShape.outgoing[0]).to.eql(sequenceFlow);

      // split target at insertion point
      expect(sequenceFlow.waypoints).eql([
        { original: { x: 340, y: 120 }, x: 340, y: 138 },
        { x: 340, y: 299 },
        { original: { x: 502, y: 299 }, x: 502, y: 299 }
      ]);
    }));
  });


  describe('rules', function() {

    it('should not insert participant', inject(function(rules, elementRegistry, elementFactory) {

      // given
      var participantShape = elementFactory.createShape({ type: 'bpmn:Participant' });

      var sequenceFlow = elementRegistry.get('SequenceFlow');

      var position = { x: 340, y: 120 }; // first bendpoint

      // when
      var canDrop = rules.allowed('shape.create', {
        shape: participantShape,
        parent: sequenceFlow,
        position: position
      });

      // then
      expect(canDrop).to.be.false;
    }));

  });

});
