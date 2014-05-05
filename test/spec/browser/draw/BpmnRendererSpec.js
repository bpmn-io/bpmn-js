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


  it('should render text annotations', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/text-annotation.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });

 it('should render activity-marker', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/activity-marker-combination.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });

  it('should render activity-marker', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/activity-marker.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });

  it('should render data objects', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/data-objects.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render events', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/events.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render events (interrupting)', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/events-interrupting.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render gateways', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/gateways.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render groups', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/group.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render pools', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/pools.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });

});