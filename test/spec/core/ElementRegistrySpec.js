'use strict';


var EventBus = require('../../../lib/core/EventBus'),
    ElementRegistry = require('../../../lib/core/ElementRegistry');


describe('elementRegistry', function() {

  var eventBus, shapes;

  beforeEach(function() {
    eventBus = new EventBus();
    shapes = new ElementRegistry(eventBus);
  });

});