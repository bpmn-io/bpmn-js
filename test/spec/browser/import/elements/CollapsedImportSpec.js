'use strict';

var fs = require('fs');

var Viewer = require('../../../../../lib/Viewer');

var Matchers = require('../../../Matchers');


describe('import - collapsed container', function() {

  beforeEach(Matchers.add);

  var loadedXml;

  var container, renderer;


  function ensureLoaded(xml, done) {

    if (xml !== loadedXml) {

      // create container
      container = document.createElement('div');
      document.getElementsByTagName('body')[0].appendChild(container);

      renderer = new Viewer(container);

      renderer.importXML(xml, function(err) {
        if (err) {
          done(err);
        } else {
          loadedXml = xml;
          done();
        }
      });
    } else {
      done();
    }
  }


  describe('in process', function() {


    beforeEach(function(done) {
      var xml = fs.readFileSync('test/fixtures/bpmn/import/collapsed.bpmn', 'utf8');
      ensureLoaded(xml, done);
    });


    it('should import collapsed subProcess', function() {

      var elementRegistry = renderer.get('elementRegistry');

      var collapsedShape = elementRegistry.getById('SubProcess_1');
      var childShape = elementRegistry.getById('IntermediateCatchEvent_1');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    });


    it('should import collapsed transaction', function() {

      var elementRegistry = renderer.get('elementRegistry');

      var collapsedShape = elementRegistry.getById('Transaction_1');
      var childShape = elementRegistry.getById('UserTask_1');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    });


    it('should import collapsed adhocSubProcess', function() {

      var elementRegistry = renderer.get('elementRegistry');

      var collapsedShape = elementRegistry.getById('AdHocSubProcess_1');
      var childShape = elementRegistry.getById('StartEvent_1');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    });


    it('should import collapsed with nested elements', function() {

      var elementRegistry = renderer.get('elementRegistry');

      var collapsedShape = elementRegistry.getById('SubProcess_4');
      var childShape = elementRegistry.getById('SubProcess_5');
      var nestedChildShape = elementRegistry.getById('Task_3');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
      expect(nestedChildShape.hidden).toBe(true);
    });


    it('should import expanded subProcess', function() {

      var elementRegistry = renderer.get('elementRegistry');

      var expandedShape = elementRegistry.getById('SubProcess_3');
      var childShape = elementRegistry.getById('Task_2');

      expect(expandedShape.collapsed).toBe(false);
      expect(childShape.hidden).toBe(false);
    });

  });


  describe('in collaboration', function() {

    beforeEach(function(done) {
      var xml = fs.readFileSync('test/fixtures/bpmn/import/collapsed-collaboration.bpmn', 'utf8');
      ensureLoaded(xml, done);
    });


    it('should import collapsed subProcess in pool', function() {

      var elementRegistry = renderer.get('elementRegistry');

      var expandedShape = elementRegistry.getById('SubProcess_1');
      var childShape = elementRegistry.getById('Task_1');

      expect(expandedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    });


    it('should import expanded subProcess in pool', function() {

      var elementRegistry = renderer.get('elementRegistry');

      var expandedShape = elementRegistry.getById('SubProcess_2');
      var childShape = elementRegistry.getById('StartEvent_1');

      expect(expandedShape.collapsed).toBe(false);
      expect(childShape.hidden).toBe(false);
    });


    it('should import collapsed subProcess in lane', function() {

      var elementRegistry = renderer.get('elementRegistry');

      var expandedShape = elementRegistry.getById('SubProcess_4');
      var childShape = elementRegistry.getById('Task_2');

      expect(expandedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    });


    it('should import expanded subProcess in lane', function() {

      var elementRegistry = renderer.get('elementRegistry');

      var expandedShape = elementRegistry.getById('SubProcess_3');
      var childShape = elementRegistry.getById('StartEvent_2');

      expect(expandedShape.collapsed).toBe(false);
      expect(childShape.hidden).toBe(false);
    });

  });
});