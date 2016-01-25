'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var is = require('../../../../../lib/util/ModelUtil').is;

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling/behavior - data store', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('create', function() {

    var processDiagramXML = require('./DataStoreBehavior.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


    it('should create DataStoreReference on participant', inject(function(elementRegistry, modeling) {

      // give
      var participantElement = elementRegistry.get('Participant'),
          participantBo = participantElement.businessObject,
          processBo = participantBo.processRef;

      // when
      var dataStoreShape = modeling.createShape(
                              { type: 'bpmn:DataStoreReference' },
                              { x: 220, y: 220 },
                              participantElement);

      var dataStoreReference = dataStoreShape.businessObject;

      // then
      // reference correctly wired
      expect(dataStoreReference.$parent).to.eql(processBo);
      expect(processBo.flowElements).to.contain(dataStoreReference);

      // no actual data store created
      expect(dataStoreReference.dataStoreRef).not.to.exist;
    }));


    it('should create DataStoreReference on sub process', inject(function(elementRegistry, modeling, bpmnjs) {

      // give
      var subProcessElement = elementRegistry.get('SubProcess'),
          subProcessBo = subProcessElement.businessObject;

      // when
      var dataStoreShape = modeling.createShape(
                              { type: 'bpmn:DataStoreReference' },
                              { x: 420, y: 220 },
                              subProcessElement);

      var dataStoreReference = dataStoreShape.businessObject;

      // then
      // reference correctly wired
      expect(dataStoreReference.$parent).to.eql(subProcessBo);
      expect(subProcessBo.flowElements).to.contain(dataStoreReference);

      // no actual data store created
      expect(dataStoreReference.dataStoreRef).not.to.exist;
    }));

  });


  describe('move', function() {

    var processDiagramXML = require('./DataStoreBehavior.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


    it('should move DataStoreReference', inject(function(elementRegistry, modeling, bpmnjs) {

      // give
      var subProcessElement = elementRegistry.get('SubProcess'),
          subProcessBo = subProcessElement.businessObject,
          participantElement = elementRegistry.get('Participant'),
          participantBo = participantElement.businessObject,
          dataStoreReference = elementRegistry.get('DataStoreReference'),
          dataStoreReferenceBo = dataStoreReference.businessObject;

      // when
      modeling.moveElements([ dataStoreReference ], { x: -200, y: 0 }, participantElement);

      // then
      // reference correctly wired
      expect(dataStoreReference.parent).to.eql(participantElement);
      expect(dataStoreReferenceBo.$parent).to.eql(participantBo.processRef);
    }));

  });


  describe('connect', function() {

    var processDiagramXML = require('./DataStoreBehavior.connect.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


    describe('dataOutputAssociation', function() {

      it('should execute', inject(function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task'),
            dataStoreRefShape = elementRegistry.get('DataStoreReference');

        // when
        var outputAssociation = modeling.connect(taskShape, dataStoreRefShape);

        var dataOutputAssociations = taskShape.businessObject.get('dataOutputAssociations');

        // then
        expect(dataOutputAssociations).to.eql([ outputAssociation.businessObject ]);
        expect(outputAssociation.businessObject.$parent).to.eql(taskShape.businessObject);

        expect(taskShape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));


      it('should undo', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task'),
            dataStoreRefShape = elementRegistry.get('DataStoreReference');

        // when
        modeling.connect(taskShape, dataStoreRefShape);
        commandStack.undo();

        // then
        expect(taskShape.businessObject.get('dataOutputAssociations')).to.be.empty;
        expect(taskShape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));


      it('should redo', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task'),
            dataStoreRefShape = elementRegistry.get('DataStoreReference');

        // when
        var outputAssociation = modeling.connect(taskShape, dataStoreRefShape);
        commandStack.undo();
        commandStack.redo();

        var dataOutputAssociations = taskShape.businessObject.get('dataOutputAssociations');

        // then
        expect(dataOutputAssociations).to.eql([ outputAssociation.businessObject ]);
        expect(outputAssociation.businessObject.$parent).to.eql(taskShape.businessObject);

        expect(taskShape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));

    });


    describe('dataInputAssociation', function() {

      it('should execute', inject(function(elementRegistry, modeling) {

        // given
        var taskShape = elementRegistry.get('Task'),
            dataStoreRefShape = elementRegistry.get('DataStoreReference');

        // when
        var inputAssociation = modeling.connect(dataStoreRefShape, taskShape);

        var dataInputAssociations = taskShape.businessObject.get('dataInputAssociations');

        // then
        expect(dataInputAssociations).to.eql([ inputAssociation.businessObject ]);
        expect(inputAssociation.businessObject.$parent).to.eql(taskShape.businessObject);

        expect(taskShape.businessObject.get('dataOutputAssociations')).to.be.empty;
      }));


      it('should undo', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task'),
            dataStoreRefShape = elementRegistry.get('DataStoreReference');

        // when
        modeling.connect(dataStoreRefShape, taskShape);
        commandStack.undo();

        // then
        expect(taskShape.businessObject.get('dataOutputAssociations')).to.be.empty;
        expect(taskShape.businessObject.get('dataInputAssociations')).to.be.empty;
      }));


      it('should redo', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task'),
            dataStoreRefShape = elementRegistry.get('DataStoreReference');

        // when
        var inputAssociation = modeling.connect(dataStoreRefShape, taskShape);
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

});
