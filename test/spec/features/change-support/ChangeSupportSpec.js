'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/change-support', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  var rootElement, shapeA, shapeB, connection;

  beforeEach(inject(function(canvas) {

    rootElement = canvas.setRootElement({
      id: 'root'
    });

    shapeA = canvas.addShape({
      id: 'A',
      x: 100, y: 100, width: 300, height: 300
    }, rootElement);

    shapeB = canvas.addShape({
      id: 'B',
      x: 500, y: 100, width: 100, height: 100
    });

    connection = canvas.addConnection({
      id: 'C',
      source: shapeA,
      target: shapeB,
      waypoints: [ { x: 100, y: 100 }, { x: 500, y: 150 } ]
    });
  }));


  it('should emit <element.changed> event', inject(function(eventBus) {

    // given
    var affectedElements = recordEvents(eventBus, 'element.changed');

    // when
    eventBus.fire('elements.changed', { elements: [ rootElement, shapeB ] });

    // then
    expect(affectedElements).to.eql([
      rootElement,
      shapeB
    ]);
  }));


  it('should omit <element.changed> event for deleted shape',
    inject(function(eventBus, modeling) {

      // given
      modeling.removeShape(shapeA);
      var affectedElements = recordEvents(eventBus, 'shape.changed');

      // when
      eventBus.fire('elements.changed', { elements: [ shapeA ] });

      // then
      expect(affectedElements.length).to.equal(0);
    })
  );


  it('should emit <shape.changed> event', inject(function(eventBus) {

    // given
    var affectedElements = recordEvents(eventBus, 'shape.changed');

    // when
    eventBus.fire('elements.changed', { elements: [ rootElement, shapeB, connection ] });

    // then
    expect(affectedElements).to.eql([
      shapeB
    ]);
  }));


  it('should emit <connection.changed> event', inject(function(eventBus) {

    // given
    var affectedElements = recordEvents(eventBus, 'connection.changed');

    // when
    eventBus.fire('elements.changed', { elements: [ rootElement, shapeB, connection ] });

    // then
    expect(affectedElements).to.eql([
      connection
    ]);
  }));


  it('should emit <root.changed> event', inject(function(eventBus) {

    // given
    var affectedElements = recordEvents(eventBus, 'root.changed');

    // when
    eventBus.fire('elements.changed', { elements: [ rootElement, shapeB, connection ] });

    // then
    expect(affectedElements).to.eql([
      rootElement
    ]);
  }));


  describe('command stack integration', function() {

    it('should emit <element.changed> on execute', inject(function(eventBus, modeling) {

      // given
      var affectedElements = recordEvents(eventBus, 'element.changed');

      // when
      modeling.moveShape(shapeA, { x: 10, y: 5 });

      // then
      expect(affectedElements).to.eql([
        shapeA
      ]);
    }));


    it('should emit <element.changed> on undo', inject(
      function(eventBus, modeling, commandStack) {

        // given
        modeling.moveShape(shapeA, { x: 10, y: 5 });

        var affectedElements = recordEvents(eventBus, 'element.changed');

        // when
        commandStack.undo();

        // then
        expect(affectedElements).to.eql([
          shapeA
        ]);
      })
    );

  });

});


function recordEvents(eventBus, eventName) {

  var results = [];

  eventBus.on(eventName, function(event) {
    results.push(event.element);
  });

  return results;
}
