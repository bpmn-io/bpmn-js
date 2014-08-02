'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move');


describe('features/move', function() {


  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ modelingModule, moveModule ] }));


    var rootShape, parentShape, childShape, childShape2, connection;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

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

    it('should bootstrap diagram with component', inject(function() {

    }));

  });

});