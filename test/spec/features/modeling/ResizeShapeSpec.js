import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { pick } from 'min-dash';

import {
  getBusinessObject
} from 'lib/util/ModelUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - resize shape', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple-resizable.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('shape', function() {

    it('should resize', inject(function(elementRegistry, modeling) {

      // given
      var subProcessElement = elementRegistry.get('SubProcess_1'),
          originalWidth = subProcessElement.width;

      // when
      modeling.resizeShape(subProcessElement, { x: 339, y: 142, width: 250, height: 200 });

      // then
      expect(subProcessElement.width).to.equal(250);
      expect(subProcessElement.width).to.not.equal(originalWidth);

    }));


    describe('businessObject', function() {

      it('should update bounds', inject(function(elementRegistry, modeling) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess_1');

        // when
        modeling.resizeShape(subProcessElement, { x: 339, y: 142, width: 250, height: 200 });

        // then
        var bo = getBusinessObject(subProcessElement);
        expect(bo.di.bounds.width).to.equal(250);
      }));


      it('should update group bounds', inject(function(elementRegistry, modeling) {

        // given
        var subProcessElement = elementRegistry.get('Group_1');

        // when
        modeling.resizeShape(subProcessElement, { x: 250, y: 250, width: 550, height: 400 });

        // then
        var bo = getBusinessObject(subProcessElement);
        expect(bo.di.bounds.width).to.equal(550);
      }));

    });


    describe('connected flow', function() {

      it('should resize', inject(function(elementRegistry, modeling, bpmnFactory) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess_1');

        var sequenceFlowElement = elementRegistry.get('SequenceFlow_2'),
            sequenceFlow = sequenceFlowElement.businessObject;

        // when

        // Decreasing width by 100px
        modeling.resizeShape(subProcessElement, { x: 339, y: 142, width: 250, height: 200 });

        // then

        // expect flow layout
        var diWaypoints = bpmnFactory.createDiWaypoints([
          { x: 589, y: 242 },
          { x: 821, y: 242 }
        ]);

        expect(sequenceFlow.di.waypoint).eql(diWaypoints);
      }));


      it('should move', inject(function(elementRegistry, modeling, bpmnFactory) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess_1');

        var sequenceFlowElement = elementRegistry.get('SequenceFlow_2'),
            sequenceFlow = sequenceFlowElement.businessObject;

        // when
        modeling.moveShape(subProcessElement, { x: -50, y: 0 });

        // then

        // expect flow layout
        var diWaypoints = bpmnFactory.createDiWaypoints([
          { x: 639, y: 242 },
          { x: 821, y: 242 }
        ]);

        expect(sequenceFlow.di.waypoint).eql(diWaypoints);
      }));

    });

  });


  describe('integration', function() {

    var diagramXML = require('../../../fixtures/bpmn/boundary-events.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should not move Boundary Event if unnecessary', inject(function(elementRegistry, modeling) {

      // given
      var boundaryEvent = elementRegistry.get('BoundaryEvent_3'),
          originalPosition = getPosition(boundaryEvent),
          subProcessElement = elementRegistry.get('SubProcess_1');

      // when
      modeling.resizeShape(subProcessElement, { x: 204, y: 28, width: 400, height: 339 });

      // then
      expect(getPosition(boundaryEvent)).to.jsonEqual(originalPosition);
    }));

  });

});

// helper /////
function getPosition(shape) {
  return pick(shape, [ 'x', 'y' ]);
}
