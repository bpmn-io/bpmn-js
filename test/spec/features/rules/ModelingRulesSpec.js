'use strict';

var Matchers = require('../../../Matchers'),
TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var _ = require('lodash');

var fs = require('fs');

var modelingModule = require('../../../../lib/features/modeling'),
    rulesModule = require('../../../../lib/features/modeling/rules'),
    coreModule = require('../../../../lib/core');


describe('features/ModelingRules', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/sequence-flows.bpmn', 'utf8');

  var testModules = [ coreModule, modelingModule, rulesModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  // See workaround https://github.com/bpmn-io/bpmn-js/issues/176
  // The wanted behavior until https://github.com/bpmn-io/bpmn-js/issues/176 is fixed
  describe('connect with source == target', function() {

    it('should not allow connection', inject(function(elementRegistry, modeling, rules) {

      // given
      var taskShape = elementRegistry.get('Task_1'),
      task = taskShape.businessObject;


      // when
      var allowed = rules.allowed('connection.create', {
        connection: null,
        source: taskShape,
        target: taskShape
      });

      // then
      // connection should not be allowed
      expect(allowed).toBe(false);
    }));
  });
});
