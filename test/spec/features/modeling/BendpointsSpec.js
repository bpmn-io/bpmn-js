'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    bendpointsModule = require('diagram-js/lib/features/bendpoints'),
    coreModule = require('../../../../lib/core');


describe('features/bendpoints', function() {

  var diagramXML = require('../../../fixtures/bpmn/features/drop/drop.bpmn');

  var testModules = [ coreModule, bendpointsModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should contain bendpoints', inject(function(bendpoints) {
    expect(bendpoints).to.exist;
  }));

});