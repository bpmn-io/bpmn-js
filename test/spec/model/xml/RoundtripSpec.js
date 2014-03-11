var BpmnModel = require('../../../../lib/model/BpmnModel'),
    SchemaValidator = require('xsd-schema-validator');

var Helper = require('../../Helper');

var BPMN_XSD = 'resources/bpmn/xsd/BPMN20.xsd';


xdescribe('BpmnModel - roundtrip', function() {

  var bpmnModel = BpmnModel.instance();

  function readBpmnDiagram(file) {
    return Helper.readFile('test/fixtures/bpmn/' + file);
  }

  function readBpmn(file, callback) {
    BpmnModel.fromXML(readBpmnDiagram(file), 'bpmn:Definitions', callback);
  }

  function writeBpmn(element, opts, callback) {
    var result, err;

    try {
      result = BpmnModel.toXML(element, callback, opts);
    } catch (e) {
      err = e;
    }

    callback(err, result);
  }

  function validate(err, xml, done) {
    console.log('validate');

    if (err) {
      done(err);
    } else {
      SchemaValidator.validateXML(xml, BPMN_XSD, function(err, result) {
        
        if (err) {
          done(err);
        } else {
          expect(result.valid).toBe(true);
          done();
        }
      });
    }
  }

  beforeEach(Helper.initAdditionalMatchers);

  describe('Roundtrip', function() {

    it('should serialize home-made bpmn model', function(done) {

      var model = bpmnModel;

      var definitions = model.create('bpmn:Definitions');

      var ServiceTask = model.getType('bpmn:ServiceTask');

      var process = model.create('bpmn:Process');
      var serviceTask = model.create('bpmn:ServiceTask', { name: 'MyService Task'});

      process.get('flowElements').push(serviceTask);
      definitions.get('rootElements').push(process);

      // when
      writeBpmn(definitions, { format: true }, function(err, xml) {
        validate(err, xml, done);
      });
    });

    xit('should write complex process', function(done) {

      // given
      readBpmn('complex.bpmn', function(err, result) {

        // when
        writeBpmn(result, { format: true }, function(err, xml) {
          validate(err, xml, done);
        });
      });
    });

    it('should write complex process', function(done) {

      // given
      readBpmn('complex-no-extensions.bpmn', function(err, result) {

        // when
        writeBpmn(result, { format: true }, function(err, xml) {
          validate(err, xml, done);
        });
      });
    });

    it('should write simple process', function(done) {

      // given
      readBpmn('simple.bpmn', function(err, result) {

        // when
        writeBpmn(result, { format: true }, function(err, xml) {
          validate(err, xml, done);
        });
      });
    });
  });
});