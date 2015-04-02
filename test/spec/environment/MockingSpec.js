'use strict';

var TestHelper = require('../../TestHelper');

/* global bootstrapDiagram, inject */


var Events = require('../../../lib/core/EventBus');


describe('environment/Mocking', function() {

  var mockEvents, bootstrapCalled;


  beforeEach(bootstrapDiagram(function() {
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

    expect(eventBus).to.equal(mockEvents);
    expect(bootstrapCalled).to.equal(true);
  }));


  it('should reparse bootstrap code', inject(function(eventBus) {

    expect(bootstrapCalled).to.equal(true);
  }));

});
