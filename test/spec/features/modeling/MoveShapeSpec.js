'use strict';

/* global bootstrapDiagram, inject */


var pick = require('lodash/object/pick'),
    map = require('lodash/collection/map');

var modelingModule = require('../../../../lib/features/modeling');

function containment(element) {
  return pick(element, [ 'x', 'y', 'parent' ]);
}


describe('features/modeling - move shape', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100,
      width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110,
      width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 200, y: 110,
      width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [
        { x: 150, y: 150 },
        { x: 150, y: 200 },
        { x: 350, y: 150 }
      ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);
  }));


  describe('should move according to delta', function() {

    it('execute', inject(function(modeling) {

      // when
      modeling.moveShape(childShape, { x: -20, y: +20 });

      // then
      expect(childShape.x).to.equal(90);
      expect(childShape.y).to.equal(130);

      // keep old parent
      expect(childShape.parent).to.equal(parentShape);
    }));


    it('should update parent', inject(function(modeling) {

      // when
      modeling.moveShape(childShape, { x: -20, y: +20 }, rootShape);

      // then
      // update parent
      expect(childShape.parent).to.equal(rootShape);
    }));


    it('should layout connections after move', inject(function(modeling) {

      // when
      modeling.moveShape(childShape, { x: -20, y: +20 }, parentShape);

      // then
      // update parent
      expect(connection.waypoints).to.deep.equal([
        { x: 140, y: 180, original: { x: 130, y: 170 } },
        { x: 250, y: 160 }
      ]);
    }));


    it('undo', inject(function(modeling, commandStack) {

      // given
      modeling.moveShape(childShape, { x: -20, y: +20 });

      // when
      commandStack.undo();

      // then
      expect(childShape.x).to.equal(110);
      expect(childShape.y).to.equal(110);

      // keep old parent
      expect(childShape.parent).to.equal(parentShape);
    }));


    it('redo', inject(function(modeling, commandStack) {

      // given
      modeling.moveShape(childShape, { x: -20, y: +20 });

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(childShape.x).to.equal(90);
      expect(childShape.y).to.equal(130);

      // keep old parent
      expect(childShape.parent).to.equal(parentShape);
    }));

  });


  describe('should update parent', function() {

    it('execute', inject(function(modeling) {

      // when
      modeling.moveShape(childShape, { x: 0, y: 0 }, rootShape);

      // then
      // update parent
      expect(childShape.parent).to.equal(rootShape);
    }));


    it('undo', inject(function(modeling, commandStack) {

      // given
      modeling.moveShape(childShape, { x: 0, y: 0 }, rootShape);

      // when
      commandStack.undo();

      // then
      // update parent
      expect(childShape.parent).to.equal(parentShape);
    }));


    it('redo', inject(function(modeling, commandStack) {

      // given
      modeling.moveShape(childShape, { x: 0, y: 0 }, rootShape);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      // update parent
      expect(childShape.parent).to.equal(rootShape);
    }));

  });


  describe('should update parent with parentIndex', function() {

    it('execute', inject(function(modeling) {

      // when
      modeling.moveShape(childShape, { x: -20, y: +20 }, rootShape, 0);

      // then
      expect(rootShape.children[0]).to.equal(childShape);
    }));


    it('undo', inject(function(modeling, commandStack) {

      // given
      modeling.moveShape(childShape, { x: -20, y: +20 }, rootShape, 0);

      // when
      commandStack.undo();

      // then
      expect(rootShape.children).not.to.contain(childShape);
      expect(parentShape.children[0]).to.equal(childShape);
    }));


    it('execute', inject(function(modeling, commandStack) {

      // given
      modeling.moveShape(childShape, { x: -20, y: +20 }, rootShape, 0);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(rootShape.children[0]).to.equal(childShape);
    }));

  });


  it('should layout connections after move', inject(function(modeling) {

    // when
    modeling.moveShape(childShape, { x: -20, y: +20 }, parentShape);

    // then
    // update parent
    expect(connection.waypoints).to.eql([
      { x : 140, y : 180, original: { x: 130, y: 170 } },
      { x : 250, y : 160 }
    ]);
  }));

});
