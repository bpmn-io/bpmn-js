'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var interactionEventsModule = require('../../../../lib/features/interaction-events');


describe('features/interaction-events', function() {

  beforeEach(bootstrapDiagram({ modules: [ interactionEventsModule ] }));


  var rootShape, parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 200, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);
  }));


  describe('bootstrap', function() {

    it('should bootstrap diagram with component', inject(function() {}));

  });


  describe('event emitting', function() {

    it('should emit element.(click|hover|out|dblclick) events', inject(function(eventBus) {

      // FIXME(nre): automate this test
      // we could mock raw dom events via custom events and ensure our correct synthetic events fire

      [ 'hover', 'out', 'click', 'dblclick' ].forEach(function(type) {
        eventBus.on('element.' + type, function(event) {
          console.log(type, event);
        });
      });

    }));

  });

});
