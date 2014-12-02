'use strict';

var Matchers = require('../../../../Matchers'),
    TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var _ = require('lodash');

var fs = require('fs');

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


var LabelUtil = require('../../../../../lib/util/Label');


ddescribe('features/modeling - append text-annotation', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/containers.bpmn', 'utf8');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should append', function() {

    it('in lane');

    it('in participant', inject(function(elementRegistry, modeling) {

      // given
      var eventShape = elementRegistry.get('IntermediateCatchEvent_1'),
          process = elementRegistry.get('Participant_1').businessObject.processRef;

      // when
      var annotationShape = modeling.appendTextAnnotation(eventShape, 'bpmn:TextAnnotation'),
          annotation = annotationShape.businessObject;

      var connectingConnection = _.find(annotationShape.incoming, function(c) {
        return c.target === annotationShape;
      });

      var connecting = connectingConnection.businessObject;

      // then
      expect(annotationShape).toBeDefined();
      expect(annotation.$instanceOf('bpmn:TextAnnotation')).toBe(true);

      expect(connecting.$instanceOf('bpmn:Association')).toBe(true);
      expect(connecting.sourceRef).toBe(eventShape.businessObject);
      expect(connecting.targetRef).toBe(annotation);

      // correctly assign artifact parent
      expect(annotation.$parent).toBe(process);
      expect(connecting.$parent).toBe(process);

      expect(process.artifacts).toContain(annotation);
      expect(process.artifacts).toContain(connecting);
    }));


    it('in sub process', inject(function(elementRegistry, modeling) {

      // given
      var eventShape = elementRegistry.get('IntermediateThrowEvent_1');

      // when
      var annotationShape = modeling.appendTextAnnotation(eventShape, 'bpmn:TextAnnotation'),
          annotation = annotationShape.businessObject;

      var connectingConnection = _.find(annotationShape.incoming, function(c) {
        return c.target === annotationShape;
      });

      var connecting = connectingConnection.businessObject;

      // then
      expect(annotationShape).toBeDefined();
      expect(annotation.$instanceOf('bpmn:TextAnnotation')).toBe(true);

      expect(connecting.$instanceOf('bpmn:Association')).toBe(true);
      expect(connecting.sourceRef).toBe(eventShape.businessObject);
      expect(connecting.targetRef).toBe(annotation);

      // correctly assign artifact parent
      expect(annotation.$parent.id).toBe('Transaction_2');
      expect(connecting.$parent.id).toBe('Transaction_2');
    }));

  });


  describe('undo', function() {

    it('should undo wire connection source + target', inject(function(elementRegistry, modeling, commandStack) {

      // given
      var eventShape = elementRegistry.get('IntermediateCatchEvent_1'),
          process = elementRegistry.get('Participant_1').businessObject.processRef;

      var annotationShape = modeling.appendTextAnnotation(eventShape, 'bpmn:TextAnnotation'),
          annotation = annotationShape.businessObject;

      var connectingConnection = _.find(annotationShape.incoming, function(c) {
        return c.target === annotationShape;
      });

      var connecting = connectingConnection.businessObject;

      // when
      commandStack.undo();

      // then
      expect(connecting.sourceRef).toBe(null);
      expect(connecting.targetRef).toBe(null);
      expect(connecting.$parent).toBe(null);
      expect(process.artifacts).not.toContain(connecting);

      expect(annotation.$parent).toBe(null);
      expect(process.artifacts).not.toContain(annotation);
    }));

  });

});
