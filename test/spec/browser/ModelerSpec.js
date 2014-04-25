var fs = require('fs');

var Modeler = require('../../../lib/Modeler');

var Matchers = require('../Matchers');


describe('Modeler', function() {

  beforeEach(Matchers.add);

  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(container);
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