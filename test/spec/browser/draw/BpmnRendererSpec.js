'use strict';

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


  it('should render activity markers', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/activity-markers.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render activity markers (combination)', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/activity-markers-combination.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render conditional flows', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/conditional-flow.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render conditional default flows', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/conditional-flow-default.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render NO conditional flow (gateway)', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/conditional-flow-gateways.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render conditional flow (typed task)', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/conditional-flow-typed-task.bpmn', 'utf8');

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


  it('should render event subprocesses (collapsed)', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/event-subprocesses-collapsed.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render event subprocesses (expanded)', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/event-subprocesses-expanded.bpmn', 'utf8');

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


  it('should render group', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/group.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render message marker', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/message-marker.bpmn', 'utf8');

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


  it('should render pool collection marker', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/pools-with-collection-marker.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render task types', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/task-types.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render text annotations', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/render/text-annotation.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should render flow markers', function(done) {

    var xml = fs.readFileSync(__dirname + '/../../../fixtures/bpmn/flow-markers.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });

});