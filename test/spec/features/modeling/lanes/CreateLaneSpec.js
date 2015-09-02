'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - lanes', function() {


  describe('should add to participant', function() {

    var diagramXML = require('./no-lane.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('execute', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant'),
          participant = participantShape.businessObject,
          bpmnProcess = participant.processRef;

      // when
      var laneShape = modeling.createShape({ type: 'bpmn:Lane' }, { x: 180, y: 100 }, participantShape);

      var lane = laneShape.businessObject;

      // then
      // expect it to have an id
      expect(lane.id).to.exist;

      expect(laneShape).to.exist;
      expect(lane).to.exist;


      expect(bpmnProcess.laneSets).to.exist;

      var laneSet = bpmnProcess.laneSets[0];

      // expect correct bpmn containment for new laneSet
      expect(laneSet.$parent).to.eql(bpmnProcess);

      // expect correct bpmn containment for lane
      expect(laneSet.lanes).to.contain(lane);
      expect(lane.$parent).to.equal(laneSet);

      // expect correct di wiring
      expect(lane.di.$parent).to.eql(participant.di.$parent);
      expect(lane.di.$parent.planeElement).to.include(lane.di);
    }));


    it('undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant'),
          participant = participantShape.businessObject,
          bpmnProcess = participant.processRef;

      var laneShape = modeling.createShape({ type: 'bpmn:Lane' }, { x: 180, y: 100 }, participantShape);

      var lane = laneShape.businessObject;
      var laneSet = lane.$parent;

      // when
      commandStack.undo();

      // then
      expect(lane.$parent).to.be.null;
      expect(laneSet.lanes).not.to.contain(lane);

      // lane sets remain initialized
      expect(bpmnProcess.laneSets).to.exist;
      expect(bpmnProcess.laneSets.length).to.eql(1);
    }));


    it('redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant'),
          participant = participantShape.businessObject,
          bpmnProcess = participant.processRef;

      var laneShape = modeling.createShape({ type: 'bpmn:Lane' }, { x: 180, y: 100 }, participantShape);

      var lane = laneShape.businessObject;

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(laneShape).to.exist;
      expect(lane).to.exist;

      expect(bpmnProcess.laneSets).to.exist;

      var laneSet = bpmnProcess.laneSets[0];

      // expect correct bpmn containment
      expect(laneSet.lanes).to.contain(lane);
      expect(lane.$parent).to.equal(laneSet);

      // expect correct di wiring
      expect(lane.di.$parent).to.eql(participant.di.$parent);
      expect(lane.di.$parent.planeElement).to.include(lane.di);
    }));

  });


  describe('should add to lane', function() {

    var diagramXML = require('./nested-lane.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('execute', inject(function(elementRegistry, modeling) {

      // given
      var parentLaneShape = elementRegistry.get('Lane'),
          parentLane = parentLaneShape.businessObject;

      // when
      var laneShape = modeling.createShape({ type: 'bpmn:Lane' }, { x: 180, y: 100 }, parentLaneShape);

      var lane = laneShape.businessObject;

      // then
      expect(laneShape).to.exist;
      expect(lane).to.exist;

      var laneSet = parentLane.childLaneSet;

      expect(laneSet).to.exist;

      // expect correct bpmn containment for new laneSet
      expect(laneSet.$parent).to.eql(parentLane);

      // expect correct bpmn containment for lane
      expect(laneSet.lanes).to.contain(lane);
      expect(lane.$parent).to.equal(laneSet);

      // expect correct di wiring
      expect(lane.di.$parent).to.eql(parentLane.di.$parent);
      expect(lane.di.$parent.planeElement).to.include(lane.di);
    }));


    it('undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var parentLaneShape = elementRegistry.get('Lane'),
          parentLane = parentLaneShape.businessObject;

      var laneShape = modeling.createShape({ type: 'bpmn:Lane' }, { x: 180, y: 100 }, parentLaneShape);

      var lane = laneShape.businessObject;
      var laneSet = lane.$parent;

      // when
      commandStack.undo();

      // then
      expect(lane.$parent).to.be.null;
      expect(laneSet.lanes).not.to.contain(lane);

      // childLaneSet sets remain initialized
      expect(parentLane.childLaneSet).to.exist;
    }));


    it('redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var parentLaneShape = elementRegistry.get('Lane'),
          parentLane = parentLaneShape.businessObject;

      var laneShape = modeling.createShape({ type: 'bpmn:Lane' }, { x: 180, y: 100 }, parentLaneShape);

      var lane = laneShape.businessObject;

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(laneShape).to.exist;
      expect(lane).to.exist;

      var laneSet = parentLane.childLaneSet;

      expect(laneSet).to.exist;

      // expect correct bpmn containment for new laneSet
      expect(laneSet.$parent).to.eql(parentLane);

      // expect correct bpmn containment for lane
      expect(laneSet.lanes).to.contain(lane);
      expect(lane.$parent).to.equal(laneSet);

      // expect correct di wiring
      expect(lane.di.$parent).to.eql(parentLane.di.$parent);
      expect(lane.di.$parent.planeElement).to.include(lane.di);
    }));

  });


  function ids(elements) {
    return elements.map(function(e) { return e.id; });
  }

  describe('should wrap existing children', function() {

    var diagramXML = require('./nested-lane.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('execute', inject(function(elementRegistry, modeling) {

      // given
      var nestedLaneShape = elementRegistry.get('Nested_Lane');

      // when
      var newLaneShape = modeling.createShape({ type: 'bpmn:Lane' }, { x: 180, y: 100 }, nestedLaneShape);

      // then
      expect(ids(newLaneShape.children)).to.eql([ 'Task_Boundary', 'Task', 'Boundary', 'Boundary_label' ]);
    }));

  });

});
