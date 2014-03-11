var BpmnModel = require('../../../lib/model/BpmnModel');

describe('BpmnModel - browser support', function() {

  function read(xml, callback, done) {

    BpmnModel.fromXML(xml, 'bpmn:Definitions', function(err, definitions) {

      if (err) {
        done(err);
      } else {
        callback(definitions);
        done();
      }
    });
  }

  it('should parse simple xml', function(done) {

    var xml =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" id="simple" targetNamespace="http://activiti.org/bpmn">' +
        '<bpmn2:process id="Process_1">' +
        '</bpmn2:process>' +
      '</bpmn2:definitions>';

    // when
    read(xml, function(definitions) {

      // then
      expect(definitions.id).toBe('simple');
      expect(definitions.targetNamespace).toBe('http://activiti.org/bpmn');

      expect(definitions.rootElements.length).toBe(1);
      expect(definitions.rootElements[0].id).toBe('Process_1');
    }, done);
  });
});