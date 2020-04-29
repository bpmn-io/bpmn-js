import TestContainer from 'mocha-test-container-support';

import Modeler from 'lib/Modeler';


describe('direct editing - touch integration', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  function createModeler(xml) {
    var modeler = new Modeler({ container: container });

    return modeler.importXML(xml).then(function(result) {
      return { error: null, modeler: modeler };
    }).catch(function(err) {
      return { error: err, modeler: modeler };
    });
  }


  it('should work on modeler (manual test)', function() {
    var xml = require('../../../fixtures/bpmn/simple.bpmn');
    return createModeler(xml).then(function(result) {
      expect(result.error).not.to.exist;
    });
  });


  it('should edit labels via double tap (manual test)', function() {
    var xml = require('./LabelEditing.bpmn');
    return createModeler(xml).then(function(result) {
      expect(result.error).not.to.exist;
    });
  });

});
