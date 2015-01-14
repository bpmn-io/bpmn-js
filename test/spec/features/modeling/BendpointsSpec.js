'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var _ = require('lodash');

var fs = require('fs');

var modelingModule = require('../../../../lib/features/modeling'),
    bendpointsModule = require('diagram-js/lib/features/bendpoints'),
    coreModule = require('../../../../lib/core');


describe('features/bendpoints', function() {

  var diagramXML = fs.readFileSync('test/fixtures/bpmn/features/drop/drop.bpmn', 'utf8');

  var testModules = [ coreModule, bendpointsModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should contain bendpoints', inject(function(bendpoints) {
    expect(bendpoints).toBeDefined();
  }));

});