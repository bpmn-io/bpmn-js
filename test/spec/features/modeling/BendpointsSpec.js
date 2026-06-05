import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import modelingModule from 'bpmn-js/lib/features/modeling';
import bendpointsModule from 'diagram-js/lib/features/bendpoints';
import coreModule from 'bpmn-js/lib/core';


describe('features/bendpoints', function() {

  var diagramXML = require('../../../fixtures/bpmn/features/drop/drop.bpmn');

  var testModules = [ coreModule, bendpointsModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should contain bendpoints', inject(function(bendpoints) {
    expect(bendpoints).to.exist;
  }));

});