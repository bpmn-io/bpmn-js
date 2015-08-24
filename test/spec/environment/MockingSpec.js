'use strict';

var TestHelper = require('../../TestHelper');

/* global bootstrapDiagram, inject */


var EventBus = require('../../../lib/core/EventBus');


describe('environment/Mocking', function() {

  var mockEventBus, bootstrapCalled;


  beforeEach(bootstrapDiagram(function() {
    mockEventBus = new EventBus();

    bootstrapCalled = true;

    return {
      eventBus: mockEventBus
    };
  }));

  afterEach(function() {
    bootstrapCalled = false;
  });


  it('should use spy', inject(function(eventBus) {

    expect(eventBus).to.equal(mockEventBus);
    expect(bootstrapCalled).to.equal(true);
  }));


  it('should reparse bootstrap code', inject(function(eventBus) {

    expect(bootstrapCalled).to.equal(true);
  }));

});
