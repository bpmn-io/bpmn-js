'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');

describe('features/modeling - remove element behavior', function() {

  var testModules = [ coreModule, modelingModule ];

  describe('combine sequence flow when deleting element', function() {

    var processDiagramXML = require('./RemoveElementBehavior.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    it('should combine sequence flows on remove', inject(function(modeling, elementRegistry) {

      // given
      var task = elementRegistry.get('Task1');

      // when
      modeling.removeShape(task);

      // then
      expect(elementRegistry.get(task.id)).to.be.undefined;
      expect(elementRegistry.get('SequenceFlow1')).to.not.be.undefined;
      expect(elementRegistry.get('SequenceFlow2')).to.be.undefined;

      expect(elementRegistry.get('StartEvent1').outgoing.length).to.be.equal(1);
      expect(elementRegistry.get('EndEvent1').incoming.length).to.be.equal(1);

    }));


    it('should remove all sequence flows', inject(function(modeling, elementRegistry) {

      // given
      var task = elementRegistry.get('Task3');

      // when
      modeling.removeShape(task);

      // then
      expect(elementRegistry.get(task.id)).to.be.undefined;
      expect(elementRegistry.get('SequenceFlow4')).to.be.undefined;
      expect(elementRegistry.get('SequenceFlow5')).to.be.undefined;
      expect(elementRegistry.get('SequenceFlow6')).to.be.undefined;

      expect(elementRegistry.get('StartEvent2').outgoing).to.be.empty;
      expect(elementRegistry.get('StartEvent2').incoming).to.be.empty;

    }));


    it('should not combine not allowed connection', inject(function(modeling, elementRegistry) {

      // given
      var task = elementRegistry.get('Task2');

      // when
      modeling.removeShape(task);

      // then
      expect(elementRegistry.get(task.id)).to.be.undefined;
      expect(elementRegistry.get('SequenceFlow3')).to.be.undefined;
      expect(elementRegistry.get('DataOutputAssociation1')).to.be.undefined;

      expect(elementRegistry.get('DataStoreReference1').incoming).to.be.empty;
      expect(elementRegistry.get('IntermediateThrowEvent1').outgoing.length).to.be.eql(1);

    }));

  });

});
