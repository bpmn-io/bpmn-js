'use strict';

var fs = require('fs');

var Viewer = require('../../../../../lib/Viewer');

var Matchers = require('../../../Matchers');


describe('import - collapsed container', function() {

  beforeEach(Matchers.add);

  var container, renderer;

  beforeEach(function(done) {

    if (!container) {

      // create container
      var c = document.createElement('div');
      document.getElementsByTagName('body')[0].appendChild(c);

      // import XML
      var xml = fs.readFileSync('test/fixtures/bpmn/import/collapsed-subprocess-children.bpmn', 'utf8');

      renderer = new Viewer(c);

      renderer.importXML(xml, function(err) {
        if (err) {
          done(err);
        } else {
          container = c;
          done();
        }
      });
    } else {
      done();
    }
  });


  it('should import collapsed subProcess', function() {

    var elementRegistry = renderer.get('elementRegistry');

    var collapsedShape = elementRegistry.getShapeById('SubProcess_1');
    var childShape = elementRegistry.getShapeById('IntermediateCatchEvent_1');

    expect(collapsedShape.collapsed).toBe(true);
    expect(childShape.hidden).toBe(true);
  });


  it('should import collapsed transaction', function() {

    var elementRegistry = renderer.get('elementRegistry');

    var collapsedShape = elementRegistry.getShapeById('Transaction_1');
    var childShape = elementRegistry.getShapeById('UserTask_1');

    expect(collapsedShape.collapsed).toBe(true);
    expect(childShape.hidden).toBe(true);
  });


  it('should import collapsed adhocSubProcess', function() {

    var elementRegistry = renderer.get('elementRegistry');

    var collapsedShape = elementRegistry.getShapeById('AdHocSubProcess_1');
    var childShape = elementRegistry.getShapeById('StartEvent_1');

    expect(collapsedShape.collapsed).toBe(true);
    expect(childShape.hidden).toBe(true);
  });


  it('should import collapsed with nested elements', function() {

    var elementRegistry = renderer.get('elementRegistry');

    var collapsedShape = elementRegistry.getShapeById('SubProcess_4');
    var childShape = elementRegistry.getShapeById('SubProcess_5');
    var nestedChildShape = elementRegistry.getShapeById('Task_3');

    expect(collapsedShape.collapsed).toBe(true);
    expect(childShape.hidden).toBe(true);
    expect(nestedChildShape.hidden).toBe(true);
  });


  it('should import expanded subProcess', function() {

    var elementRegistry = renderer.get('elementRegistry');

    var expandedShape = elementRegistry.getShapeById('SubProcess_3');
    var childShape = elementRegistry.getShapeById('Task_2');

    expect(expandedShape.collapsed).toBe(false);
    expect(childShape.hidden).toBe(false);
  });


});