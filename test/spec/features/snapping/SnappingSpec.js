'use strict';

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    snappingModule = require('../../../../lib/features/snapping'),
    moveModule = require('../../../../lib/features/move');


describe('features/snapping', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, snappingModule, moveModule ] }));


  var rootShape, parentShape, childShape, childShape2, label, connection;

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

    label = elementFactory.createLabel({
      id: 'label1',
      x: 250, y: 110, width: 40, height: 40,
      hidden: true
    });

    canvas.addShape(label, parentShape);

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

});
