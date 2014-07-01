'use strict';

var Matchers = require('../../Matchers'),
    TestHelper = require('../../TestHelper');

/* global bootstrapBpmnJS, inject */


var fs = require('fs');

var bpmnCoreModule = require('../../../../lib/core');


describe('core', function() {

  beforeEach(Matchers.add);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf-8');

  var testModules = [ bpmnCoreModule ];

  beforeEach(bootstrapBpmnJS(diagramXML, { modules: testModules }));


  describe('BpmnRegistry', function() {


    it('should get process semantic by ID', inject(function(bpmnRegistry) {

      expect(bpmnRegistry.getSemantic('Process_1')).toBeDefined();

    }));

  });

});