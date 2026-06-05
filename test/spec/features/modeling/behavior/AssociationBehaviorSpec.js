import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import coreModule from 'bpmn-js/lib/core';
import modelingModule from 'bpmn-js/lib/features/modeling';

import diagramXML from './AssociationBehavior.bpmn';


describe('modeling/behavior - AssociationBehavior', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  it('should move to new parent on source move', inject(function(modeling, elementRegistry) {

    // given
    var association = elementRegistry.get('Association_1'),
        process = elementRegistry.get('Process_1'),
        startEvent = elementRegistry.get('StartEvent_1');

    // when
    modeling.moveElements([ startEvent ], { x: 100, y: 100 }, process);

    // then
    expect(association.parent).to.equal(process);
  }));


  it('should move to new parent on target move', inject(function(modeling, elementRegistry) {

    // given
    var association = elementRegistry.get('Association_1'),
        process = elementRegistry.get('Process_1'),
        textAnnotation = elementRegistry.get('TextAnnotation_1');

    // when
    modeling.moveElements([ textAnnotation ], { x: 100, y: 100 }, process);

    // then
    expect(association.parent).to.equal(process);
  }));

});