import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  find
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - append text-annotation', function() {

  var diagramXML = require('../../../../fixtures/bpmn/containers.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should append', function() {

    it('in lane');

    it('in participant', inject(function(elementRegistry, modeling) {

      // given
      var eventShape = elementRegistry.get('IntermediateCatchEvent_1'),
          process = elementRegistry.get('Participant_1').businessObject.processRef;

      // when
      var annotationShape = modeling.appendShape(eventShape, { type: 'bpmn:TextAnnotation' }),
          annotation = annotationShape.businessObject;

      var connectingConnection = find(annotationShape.incoming, function(c) {
        return c.target === annotationShape;
      });

      var connecting = connectingConnection.businessObject;

      // then
      expect(annotationShape).to.exist;
      expect(annotation.$instanceOf('bpmn:TextAnnotation')).to.be.true;

      expect(connecting.$instanceOf('bpmn:Association')).to.be.true;
      expect(connecting.sourceRef).to.eql(eventShape.businessObject);
      expect(connecting.targetRef).to.eql(annotation);

      // correctly assign artifact parent
      expect(annotation.$parent).to.eql(process);
      expect(connecting.$parent).to.eql(process);

      expect(process.artifacts).to.include(annotation);
      expect(process.artifacts).to.include(connecting);
    }));


    it('in sub process', inject(function(elementRegistry, modeling) {

      // given
      var eventShape = elementRegistry.get('IntermediateThrowEvent_1');

      // when
      var annotationShape = modeling.appendShape(eventShape, { type: 'bpmn:TextAnnotation' }),
          annotation = annotationShape.businessObject;

      var connectingConnection = find(annotationShape.incoming, function(c) {
        return c.target === annotationShape;
      });

      var connecting = connectingConnection.businessObject;

      // then
      expect(annotationShape).to.exist;
      expect(annotation.$instanceOf('bpmn:TextAnnotation')).to.be.true;

      expect(connecting.$instanceOf('bpmn:Association')).to.be.true;
      expect(connecting.sourceRef).to.eql(eventShape.businessObject);
      expect(connecting.targetRef).to.eql(annotation);

      // correctly assign artifact parent
      expect(annotation.$parent.id).to.equal('Transaction_2');
      expect(connecting.$parent.id).to.equal('Transaction_2');
    }));

    it('with right size', inject(function(elementRegistry, elementFactory, modeling) {

      // given
      var eventShape = elementRegistry.get('IntermediateCatchEvent_1');

      // when
      var annotationShape = modeling.appendShape(eventShape, { type: 'bpmn:TextAnnotation' });

      // then
      expect(annotationShape.width).to.eql(100);
      expect(annotationShape.height).to.eql(30);
    }));
  });



  describe('undo', function() {

    it('should undo wire connection source + target', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var eventShape = elementRegistry.get('IntermediateCatchEvent_1'),
          process = elementRegistry.get('Participant_1').businessObject.processRef;

      var annotationShape = modeling.appendShape(eventShape, { type: 'bpmn:TextAnnotation' }),
          annotation = annotationShape.businessObject;

      var connectingConnection = find(annotationShape.incoming, function(c) {
        return c.target === annotationShape;
      });

      var connecting = connectingConnection.businessObject;

      // when
      commandStack.undo();

      // then
      expect(connecting.sourceRef).to.be.null;
      expect(connecting.targetRef).to.be.null;
      expect(connecting.$parent).to.be.null;
      expect(process.artifacts).not.to.include(connecting);

      expect(annotation.$parent).to.be.null;
      expect(process.artifacts).not.to.include(annotation);
    }));

  });

});
