'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - #removeElements', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas, elementRegistry) {

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


  describe('remove multiple elements', function() {

    it('should execute', inject(function(modeling, elementRegistry) {

      // when
      modeling.removeElements([ connection, childShape, parentShape ]);

      // then
      expect(elementRegistry.get(connection.id)).to.not.be.defined;
      expect(elementRegistry.get(childShape.id)).to.not.be.defined;
      expect(elementRegistry.get(parentShape.id)).to.not.be.defined;
    }));


    it('should revert', inject(function(modeling, elementRegistry, commandStack) {

      // given
      modeling.removeElements([ connection, childShape, parentShape ]);

      // when
      commandStack.undo();

      // then
      expect(elementRegistry.get(connection.id)).to.exist;
      expect(elementRegistry.get(childShape.id)).to.exist;
      expect(elementRegistry.get(parentShape.id)).to.exist;
    }));


    it('should redo', inject(function(modeling, elementRegistry, commandStack) {

      // given
      modeling.removeElements([ connection, childShape, parentShape ]);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(elementRegistry.get(connection.id)).to.not.be.defined;
      expect(elementRegistry.get(childShape.id)).to.not.be.defined;
      expect(elementRegistry.get(parentShape.id)).to.not.be.defined;
    }));

  });

});
