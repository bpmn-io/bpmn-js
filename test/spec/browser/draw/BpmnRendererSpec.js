var fs = require('fs');

var Viewer = require('../../../../lib/Viewer');

var Matchers = require('../../Matchers');


describe('draw/BpmnRenderer', function() {

  beforeEach(Matchers.add);

  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(container);
  });


  it('should render events', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/render/events.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render events (interrupting)', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/render/events-interrupting.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });

});