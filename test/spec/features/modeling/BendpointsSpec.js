import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import modelingModule from 'bpmn-js/lib/features/modeling';
import bendpointsModule from 'diagram-js/lib/features/bendpoints';
import coreModule from 'bpmn-js/lib/core';

import diagramXML from '../../../fixtures/bpmn/simple.bpmn';


describe('features/bendpoints', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      bendpointsModule,
      modelingModule
    ]
  }));


  it('should contain bendpoints', inject(function(bendpoints) {
    expect(bendpoints).to.exist;
  }));

});