var fs = require('fs');

var BpmnModel = require('../../../lib/Model'),
    Modeler = require('../../../lib/Modeler');

var Matchers = require('../Matchers');

describe('Modeler', function() {

  var bpmnModel = BpmnModel.instance();

  function read(xml, opts, callback) {
    return BpmnModel.fromXML(xml, 'bpmn:Definitions', opts, callback);
  }


  var container;


  beforeEach(Matchers.add);

  beforeEach(function() {
    container = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(container);
  });

  afterEach(function() {
    container.parentNode.removeChild(container);
  });


  it('should import simple process', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

    var renderer = new Modeler(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });
  
  
  it('should import empty definitions', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/empty-definitions.bpmn', 'utf8');

    var renderer = new Modeler(container);

    renderer.importXML(xml, function(err) {

      done(err);
    });
  });


  it('should handle errors', function(done) {

    var xml = 'invalid stuff';

    var renderer = new Modeler(container);

    renderer.importXML(xml, function(err) {

      expect(err).toBeDefined();

      done();
    });
  });

});