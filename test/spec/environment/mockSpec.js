var Events = require('../../../src/core/EventBus');
var TestHelper = require('../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;

describe('Mock', function() {

  var mockEvents;

  beforeEach(bootstrapDiagram(function() {
    mockEvents = new Events();

    return {
      events: mockEvents
    };
  }));

  it('should use spy', inject(function(events) {
    expect(events).toEqual(mockEvents);
  }));
});