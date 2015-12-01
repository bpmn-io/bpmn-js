'use strict';

var TestHelper = require('../../TestHelper');

/* global bootstrapViewer, inject */

var Events = require('diagram-js/lib/core/EventBus');

var Viewer = require('../../../lib/Viewer');


describe('environment - mocking', function() {

  var diagramXML = require('../../fixtures/bpmn/simple.bpmn');

  var mockEvents, bootstrapCalled;

  beforeEach(bootstrapViewer(diagramXML, {
    modules: Viewer.prototype._modules
  }, function() {
    mockEvents = new Events();

    bootstrapCalled = true;

    return {
      eventBus: mockEvents
    };
  }));

  afterEach(function() {
    bootstrapCalled = false;
  });


  it('should use spy', inject(function(eventBus) {

    expect(eventBus).to.eql(mockEvents);
    expect(bootstrapCalled).to.be.true;
  }));


  it('should reparse bootstrap code', inject(function(eventBus) {

    expect(bootstrapCalled).to.be.true;
  }));


  it('should inject bpmnjs', inject(function(bpmnjs) {

    expect(bpmnjs).to.exist;
  }));

});
