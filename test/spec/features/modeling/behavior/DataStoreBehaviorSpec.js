import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


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
        participantElement
      );

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
        subProcessElement
      );

      var dataStoreReference = dataStoreShape.businessObject;

      // then
      // reference correctly wired
      expect(dataStoreReference.$parent).to.eql(subProcessBo);
      expect(subProcessBo.flowElements).to.contain(dataStoreReference);

      // no actual data store created
      expect(dataStoreReference.dataStoreRef).not.to.exist;
    }));


    it('should create DataStoreReference on collaboration', inject(function(elementRegistry, modeling, bpmnjs) {

      // give
      var collaborationElement = elementRegistry.get('Collaboration'),
          participantElement = elementRegistry.get('Participant'),
          participantBo = participantElement.businessObject;

      // when
      var dataStoreShape = modeling.createShape(
        { type: 'bpmn:DataStoreReference' },
        { x: 420, y: 370 },
        collaborationElement
      );

      var dataStoreReference = dataStoreShape.businessObject;

      // then
      // reference correctly wired
      expect(dataStoreReference.$parent).to.eql(participantBo.processRef);
      expect(participantBo.processRef.flowElements).to.contain(dataStoreReference);

      // no actual data store created
      expect(dataStoreReference.dataStoreRef).not.to.exist;
    }));

  });


  describe('move', function() {

    var processDiagramXML = require('./DataStoreBehavior.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


    it('should move DataStoreReference to Participant', inject(function(elementRegistry, modeling, bpmnjs) {

      // give
      var participantElement = elementRegistry.get('Participant'),
          participantBo = participantElement.businessObject,
          dataStoreReference = elementRegistry.get('DataStoreReference'),
          dataStoreReferenceBo = dataStoreReference.businessObject;

      // when
      modeling.moveElements([ dataStoreReference ], { x: -200, y: 0 }, participantElement);

      // then
      expect(dataStoreReference.parent).to.eql(participantElement);
      expect(dataStoreReferenceBo.$parent).to.eql(participantBo.processRef);
    }));


    it('should move DataStoreReference from partipant to Collaboration keeping parent particpant', inject(
      function(elementRegistry, modeling, bpmnjs) {

        // give
        var collaborationElement = elementRegistry.get('Collaboration'),
            participant2Element = elementRegistry.get('Participant_2'),
            participant2Bo = participant2Element.businessObject,
            dataStoreReference2 = elementRegistry.get('DataStoreReference_2'),
            dataStoreReference2Bo = dataStoreReference2.businessObject;

        // when
        modeling.moveElements([ dataStoreReference2 ], { x: 0, y: 250 }, collaborationElement);

        // then
        expect(dataStoreReference2.parent).to.eql(collaborationElement);
        expect(dataStoreReference2Bo.$parent).to.eql(participant2Bo.processRef);
      })
    );


    it('should move DataStoreReference from subprocess to Collaboration keeping parent particpant', inject(
      function(elementRegistry, modeling, bpmnjs) {

        // give
        var collaborationElement = elementRegistry.get('Collaboration'),
            participantElement = elementRegistry.get('Participant'),
            participantBo = participantElement.businessObject,
            dataStoreReference = elementRegistry.get('DataStoreReference'),
            dataStoreReferenceBo = dataStoreReference.businessObject;

        // when
        modeling.moveElements([ dataStoreReference ], { x: 0, y: 250 }, collaborationElement);

        // then
        expect(dataStoreReference.parent).to.eql(collaborationElement);
        expect(dataStoreReferenceBo.$parent).to.eql(participantBo.processRef);
      })
    );


    it('should move without changing parent', inject(
      function(elementRegistry, modeling, bpmnjs) {

        // give
        var collaborationElement = elementRegistry.get('Collaboration'),
            participant2Element = elementRegistry.get('Participant_2'),
            participant2Bo = participant2Element.businessObject,
            dataStoreReference3 = elementRegistry.get('DataStoreReference_3'),
            dataStoreReference3Bo = dataStoreReference3.businessObject;

        // when
        modeling.moveElements([ dataStoreReference3 ], { x: 50, y: 0 }, collaborationElement);

        // then
        expect(dataStoreReference3.parent).to.eql(collaborationElement);
        expect(dataStoreReference3Bo.$parent).to.eql(participant2Bo.processRef);
      })
    );

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


  describe('process', function() {
    var processDiagramXML = require('./DataStoreBehavior.process.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    it('should not update parent on subprocess delete', inject(
      function(elementRegistry, eventBus, modeling) {

        // given
        var spy = sinon.spy();

        eventBus.on('commandStack.dataStore.updateContainment.execute', spy);

        var subProcessElement = elementRegistry.get('SubProcess');

        // when
        modeling.removeShape(subProcessElement);

        // then
        expect(spy).to.not.have.been.called;
      }
    ));

  });


  describe('collaboration', function() {

    describe('update parent on participant removed', function() {
      var processDiagramXML = require('./DataStoreBehavior.remove-participant.bpmn');

      var dataStoreReferenceBo,
          participantBo,
          participant2Bo;

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        var participantElement = elementRegistry.get('Participant'),
            participant2Element = elementRegistry.get('Participant_2'),
            dataStoreReference = elementRegistry.get('DataStoreReference');

        dataStoreReferenceBo = dataStoreReference.businessObject;
        participantBo = participantElement.businessObject;
        participant2Bo = participant2Element.businessObject;

        // when
        modeling.removeShape(participantElement);
      }));


      it('should do', function() {

        // then
        expect(dataStoreReferenceBo.$parent).to.eql(participant2Bo.processRef);
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(dataStoreReferenceBo.$parent).to.eql(participantBo.processRef);
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(dataStoreReferenceBo.$parent).to.eql(participant2Bo.processRef);
      }));

    });


    describe('collaboration -> process', function() {

      var processDiagramXML = require('./DataStoreBehavior.collaboration.bpmn');

      var dataStoreShape,
          participant;

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

      beforeEach(inject(function(elementRegistry, modeling) {
        dataStoreShape = elementRegistry.get('DataStoreReference');

        participant = elementRegistry.get('Participant');

        // when
        modeling.removeShape(participant);
      }));


      it('should do', inject(function(canvas) {
        var rootElement = canvas.getRootElement();

        // then
        expect(dataStoreShape.businessObject.$parent).to.eql(rootElement.businessObject);
      }));


      it('should undo', inject(function(canvas, commandStack) {

        // when
        commandStack.undo();

        // then
        expect(dataStoreShape.businessObject.$parent).to.eql(participant.businessObject.processRef);
      }));


      it('should redo', inject(function(canvas, commandStack) {
        var rootElement = canvas.getRootElement();

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(dataStoreShape.businessObject.$parent).to.eql(rootElement.businessObject);
      }));

    });


    describe('process -> collaboration', function() {

      var processDiagramXML = require('./DataStoreBehavior.process.bpmn');

      var dataStoreShape,
          participant,
          process;

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

      beforeEach(inject(function(canvas, elementRegistry, modeling) {
        process = canvas.getRootElement();

        dataStoreShape = elementRegistry.get('DataStoreReference');

        // when
        participant = modeling.createShape(
          { type: 'bpmn:Participant' },
          { x: 200, y: 200 },
          process
        );
      }));


      it('should do', function() {

        // then
        expect(dataStoreShape.businessObject.$parent).to.eql(participant.businessObject.processRef);
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(dataStoreShape.businessObject.$parent).to.eql(process.businessObject);
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(dataStoreShape.businessObject.$parent).to.eql(participant.businessObject.processRef);
      }));
    });

  });

});
