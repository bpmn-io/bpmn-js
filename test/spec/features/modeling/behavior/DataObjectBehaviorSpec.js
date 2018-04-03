import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { is } from 'lib/util/ModelUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling/behavior - data object', function() {

  var testModules = [ coreModule, modelingModule ];

  var rootShape;


  describe('DataObjectReference', function() {

    var processDiagramXML = require('./DataObjectBehavior.data-object-reference.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    var subProcess1;

    beforeEach(inject(function(canvas, elementRegistry) {
      subProcess1 = elementRegistry.get('SubProcess_1');
      rootShape = canvas.getRootElement();
    }));


    it('should create the corresponding DataObject', inject(function(modeling) {

      // when
      var dataObjectRefShape = modeling.createShape({ type: 'bpmn:DataObjectReference' },
        { x: 220, y: 220 }, rootShape);

      var dataObject = dataObjectRefShape.businessObject.dataObjectRef;

      // then
      expect(dataObject).to.exist;
      expect(is(dataObject, 'bpmn:DataObject')).to.be.true;
      expect(dataObject.id).to.exist;
    }));


    it('should create the corresponding DataObject / undo');


    it('should have the right parents', inject(function(modeling) {

      // when
      var dataObjectRefShape1 = modeling.createShape({ type: 'bpmn:DataObjectReference' },
        { x: 220, y: 220 }, rootShape);
      var dataObjectRefShape2 = modeling.createShape({ type: 'bpmn:DataObjectReference' },
        { x: 380, y: 220 }, subProcess1);

      var dataObject1 = dataObjectRefShape1.businessObject.dataObjectRef;
      var dataObject2 = dataObjectRefShape2.businessObject.dataObjectRef;

      // then
      expect(dataObject1.$parent.id).to.equal(rootShape.id);
      expect(dataObjectRefShape1.parent.id).to.equal(rootShape.id);

      expect(dataObject2.$parent.id).to.equal(subProcess1.id);
      expect(dataObjectRefShape2.parent.id).to.equal(subProcess1.id);
    }));

  });


  describe('create', function() {

    var processDiagramXML = require('./DataObjectBehavior.create-data-association.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    var dataObjectRefShape1,
        taskShape;

    beforeEach(inject(function(canvas, elementRegistry) {
      rootShape = canvas.getRootElement();
      dataObjectRefShape1 = elementRegistry.get('DataObjectReference_1');
      taskShape = elementRegistry.get('Task_1');
    }));


    describe('dataOutputAssociation', function() {

      it('should execute', inject(function(modeling) {

        // when
        var outputAssociation = modeling.connect(taskShape, dataObjectRefShape1);

        var dataOutputAssociations = taskShape.businessObject.get('dataOutputAssociations');

        // then
        expect(dataOutputAssociations[0].$parent).to.equal(taskShape.businessObject);
        expect(dataOutputAssociations).to.include(outputAssociation.businessObject);
        expect(taskShape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // when
        modeling.connect(taskShape, dataObjectRefShape1);
        commandStack.undo();

        // then
        expect(taskShape.businessObject.get('dataOutputAssociations')).to.be.empty;
        expect(taskShape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));


      it('should redo', inject(function(modeling, commandStack) {

        // when
        var outputAssociation = modeling.connect(taskShape, dataObjectRefShape1);
        commandStack.undo();
        commandStack.redo();

        var dataOutputAssociations = taskShape.businessObject.get('dataOutputAssociations');

        // then
        expect(dataOutputAssociations[0].$parent).to.equal(taskShape.businessObject);
        expect(dataOutputAssociations).to.include(outputAssociation.businessObject);
        expect(taskShape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));

    });


    describe('dataInputAssociation', function() {

      it('should execute', inject(function(modeling) {

        // when
        var inputAssociation = modeling.connect(dataObjectRefShape1, taskShape);

        var dataInputAssociations = taskShape.businessObject.get('dataInputAssociations');

        // then
        expect(dataInputAssociations[0].$parent).to.equal(taskShape.businessObject);
        expect(dataInputAssociations).to.include(inputAssociation.businessObject);
        expect(taskShape.businessObject.get('dataOutputAssociations')).to.be.empty;
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // when
        modeling.connect(dataObjectRefShape1, taskShape);
        commandStack.undo();

        // then
        expect(taskShape.businessObject.get('dataOutputAssociations')).to.be.empty;
        expect(taskShape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));


      it('should redo', inject(function(modeling, commandStack) {

        // when
        var inputAssociation = modeling.connect(dataObjectRefShape1, taskShape);
        commandStack.undo();
        commandStack.redo();

        var dataInputAssociations = taskShape.businessObject.get('dataInputAssociations');

        // then
        expect(dataInputAssociations[0].$parent).to.equal(taskShape.businessObject);
        expect(dataInputAssociations).to.include(inputAssociation.businessObject);
        expect(taskShape.businessObject.get('dataOutputAssociations')).to.be.empty;
      }));

    });

  });


  describe('remove', function() {

    var processDiagramXML = require('./DataObjectBehavior.remove-data-association.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    var task1Shape,
        task2Shape,
        outputAssociation,
        inputAssociation;

    beforeEach(inject(function(canvas, elementRegistry) {
      rootShape = canvas.getRootElement();

      task1Shape = elementRegistry.get('Task_1');
      task2Shape = elementRegistry.get('Task_2');

      outputAssociation = elementRegistry.get('DataOutputAssociation_1');
      inputAssociation = elementRegistry.get('DataInputAssociation_1');
    }));


    describe('DataOutputAssociation', function() {

      it('should execute', inject(function(modeling) {

        // when
        modeling.removeConnection(outputAssociation);

        // then
        expect(task1Shape.businessObject.get('dataOutputAssociations')).to.be.empty;
        expect(task1Shape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // when
        modeling.removeConnection(outputAssociation);

        commandStack.undo();

        var dataOutputAssociations = task1Shape.businessObject.get('dataOutputAssociations');

        // then
        expect(dataOutputAssociations[0].$parent).to.equal(task1Shape.businessObject);
        expect(dataOutputAssociations).to.be.include(outputAssociation.businessObject);
        expect(task1Shape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));


      it('should redo', inject(function(modeling, commandStack) {

        // when
        modeling.removeConnection(outputAssociation);

        commandStack.undo();
        commandStack.redo();

        // then
        expect(task1Shape.businessObject.get('dataOutputAssociations')).to.be.empty;
        expect(task1Shape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));

    });


    describe('dataInputAssociation', function() {

      it('should execute', inject(function(modeling) {

        // when
        modeling.removeConnection(inputAssociation);

        // then
        expect(task2Shape.businessObject.get('dataInputAssociations')).to.be.empty;
        expect(task2Shape.businessObject.get('dataOutputAssociations')).to.be.empty;
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // when
        modeling.removeConnection(inputAssociation);

        commandStack.undo();

        var dataInputAssociations = task2Shape.businessObject.get('dataInputAssociations');

        // then
        expect(dataInputAssociations[0].$parent).to.equal(task2Shape.businessObject);
        expect(dataInputAssociations).to.include(inputAssociation.businessObject);
        expect(task2Shape.businessObject.get('dataOutputAssociations')).to.be.empty;
      }));


      it('should redo', inject(function(modeling, commandStack) {

        // when
        modeling.removeConnection(inputAssociation);

        commandStack.undo();
        commandStack.redo();

        // then
        expect(task2Shape.businessObject.get('dataInputAssociations')).to.be.empty;
        expect(task2Shape.businessObject.get('dataOutputAssociations')).to.be.empty;
      }));

    });

  });

});
