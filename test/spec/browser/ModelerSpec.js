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


  function createModeler(xml, done) {
    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err) {
      done(err, modeler);
    });
  }

  it('should import simple process', function(done) {
    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');
    createModeler(xml, done);
  });


  it('should import empty definitions', function(done) {
    var xml = fs.readFileSync('test/fixtures/bpmn/empty-definitions.bpmn', 'utf8');
    createModeler(xml, done);
  });


  it('should handle errors', function(done) {

    var xml = 'invalid stuff';

    var renderer = new Modeler(container);

    renderer.importXML(xml, function(err) {

      expect(err).toBeDefined();

      done();
    });
  });


  describe('dependency injection', function() {

    it('should be available via di as <bpmnjs>', function(done) {

      debugger;

      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      createModeler(xml, function(err, modeler) {

        expect(modeler.get('bpmnjs')).toBe(modeler);
        done(err);
      });
    });

  });

});