var SchemaValidator = require('xsd-schema-validator');

var BpmnModel = require('../../../../lib/Model'),
    Helper = require('../Helper'),
    Matchers = require('../../Matchers');

var BPMN_XSD = 'resources/bpmn/xsd/BPMN20.xsd';


describe('Model - roundtrip', function() {

  var bpmnModel = BpmnModel.instance();

  function readBpmnDiagram(file) {
    return Helper.readFile('test/fixtures/bpmn/' + file);
  }

  function readBpmn(file, callback) {
    BpmnModel.fromXML(readBpmnDiagram(file), 'bpmn:Definitions', callback);
  }

  function writeBpmn(element, opts, callback) {
    BpmnModel.toXML(element, opts, callback);
  }

  function validate(err, xml, done) {

    if (err) {
      done(err);
    } else {

      if (!xml) {
        done(new Error('XML is not defined'));
      }

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

  beforeEach(Matchers.add);

  describe('Roundtrip', function() {

    it('should serialize home-made bpmn model', function(done) {

      // given
      var model = bpmnModel;

      var definitions = model.create('bpmn:Definitions', { targetNamespace: 'http://foo' });

      var ServiceTask = model.getType('bpmn:ServiceTask');

      var process = model.create('bpmn:Process');
      var serviceTask = model.create('bpmn:ServiceTask', { name: 'MyService Task'});

      process.get('flowElements').push(serviceTask);
      definitions.get('rootElements').push(process);

      // when
      writeBpmn(definitions, { format: true }, function(err, xml) {

        // then
        validate(err, xml, done);
      });
    });

    xit('should write complex process', function(done) {

      // given
      readBpmn('complex.bpmn', function(err, result) {

        if (err) {
          done(err);
          return;
        }
        
        // when
        writeBpmn(result, { format: true }, function(err, xml) {
          validate(err, xml, done);
        });
      });
    });

    it('should write complex process', function(done) {

      // given
      readBpmn('complex-no-extensions.bpmn', function(err, result) {

        if (err) {
          done(err);
          return;
        }

        // when
        writeBpmn(result, { format: true }, function(err, xml) {
          validate(err, xml, done);
        });
      });
    });

    it('should write simple process', function(done) {

      // given
      readBpmn('simple.bpmn', function(err, result) {

        if (err) {
          done(err);
          return;
        }
        
        // when
        writeBpmn(result, { format: true }, function(err, xml) {
          validate(err, xml, done);
        });
      });
    });
  });
});