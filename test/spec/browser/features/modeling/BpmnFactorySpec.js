'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapBpmnJS, inject */


var fs = require('fs');

var modelingModule = require('../../../../../lib/features/modeling');


xdescribe('features - bpmn-factory', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf-8');

  var testModules = [ modelingModule ];

  beforeEach(bootstrapBpmnJS(diagramXML, { modules: testModules }));


  describe('create task', function() {

    it('should create', inject(function(bpmnFactory) {
      var result = bpmnFactory.createNode('bpmn:Task');

      expect(result.semantic.id).toBeDefined();
      expect(result.di.id).toBeDefined();

      expect(result.di.bounds.width).toBe(100);
      expect(result.di.bounds.height).toBe(80);
      expect(result.di.bounds.x).toBe(-50);
      expect(result.di.bounds.y).toBe(-40);
    }));


    it('should create with position', inject(function(bpmnFactory) {

      var result = bpmnFactory.createNode('bpmn:Task', { x: 100, y: 100 });

      expect(result.semantic.id).toBeDefined();
      expect(result.di.id).toBeDefined();

      expect(result.di.bounds.width).toBe(100);
      expect(result.di.bounds.height).toBe(80);
      expect(result.di.bounds.x).toBe(50);
      expect(result.di.bounds.y).toBe(60);
    }));

  });

});