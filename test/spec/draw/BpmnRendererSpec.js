'use strict';

var Matchers = require('../../Matchers'),
    TestHelper = require('../../TestHelper');

/* global bootstrapViewer, inject */


var fs = require('fs');


describe('draw - bpmn renderer', function() {

  beforeEach(Matchers.addDeepEquals);


  it('should render activity markers', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/activity-markers.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render activity markers (combination)', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/activity-markers-combination.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render conditional flows', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/conditional-flow.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render conditional default flows', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/conditional-flow-default.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render NO conditional flow (gateway)', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/conditional-flow-gateways.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render conditional flow (typed task)', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/conditional-flow-typed-task.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render data objects', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/data-objects.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render events', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/events.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render events (interrupting)', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/events-interrupting.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render event subprocesses (collapsed)', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/event-subprocesses-collapsed.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render event subprocesses (expanded)', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/event-subprocesses-expanded.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render gateways', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/gateways.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render group', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/group.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render message marker', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/message-marker.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render pools', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/pools.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render pool collection marker', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/pools-with-collection-marker.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render task types', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/task-types.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render text annotations', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/text-annotation.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });


  it('should render flow markers', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/flow-markers.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });

  it('should render xor gateways blank and with X', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/xor.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });

  it('should render boundary events with correct z-index', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/boundary-event-z-index.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });

  it('should render boundary events without flowNodeRef', function(done) {
   var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/boundary-event-without-refnode.bpmn', 'utf8');
   bootstrapViewer(xml)(done);
  });

  it('should render boundary event only once if referenced incorrectly via flowNodeRef (robustness)', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/boundary-event-with-refnode.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });

  it('should render gateway event if attribute is missing in XML', function(done) {
    var xml = fs.readFileSync(__dirname + '/../../fixtures/bpmn/draw/gateway-type-default.bpmn', 'utf8');
    bootstrapViewer(xml)(done);
  });

});