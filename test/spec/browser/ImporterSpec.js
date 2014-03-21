var fs = require('fs');

var BpmnModel = require('../../../lib/Model'),
    Viewer = require('../../../lib/Viewer');

var Matchers = require('../Matchers');

describe('Importer', function() {

  var bpmnModel = BpmnModel.instance();

  function read(xml, opts, callback) {
    return BpmnModel.fromXML(xml, 'bpmn:Definitions', opts, callback);
  }

  beforeEach(Matchers.add);

  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(container);
  });

  afterEach(function() {
    container.parentNode.removeChild(container);
  });

  it('should import simple process', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

    read(xml, function(err, result) {
      var renderer = new Viewer(container);

      renderer.importDefinitions(result, done);
    });
  });

  it('should import empty definitions', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/empty-definitions.bpmn', 'utf8');

    read(xml, function(err, result) {
      var renderer = new Viewer(container);

      renderer.importDefinitions(result, done);
    });
  });
});