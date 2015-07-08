'use strict';

/* global bootstrapDiagram, inject */


var pick = require('lodash/object/pick');

var modelingModule = require('../../../../lib/features/modeling');

function containment(element) {
  return pick(element, [ 'x', 'y', 'parent' ]);
}


describe('features/modeling - move shape', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, parentShape2, childShape, childShape2, connection;

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

    parentShape2 = elementFactory.createShape({
      id: 'parent2',
      x: 500, y: 500,
      width: 300, height: 300
    });

    canvas.addShape(parentShape2, rootShape);

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


  describe('move single', function() {

    it('should move according to delta', inject(function(modeling) {

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
      expect(connection.waypoints).to.eql([
        { x : 140, y : 180 }, { x : 250, y : 160 }
      ]);
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // given
      modeling.moveShape(childShape, { x: -20, y: +20 }, rootShape);
      modeling.moveShape(childShape, { x: -20, y: +20 });

      // when
      commandStack.undo();

      // then
      expect(childShape.x).to.equal(90);
      expect(childShape.y).to.equal(130);

      expect(childShape.parent).to.equal(rootShape);

      // when
      commandStack.undo();

      // then
      expect(childShape.x).to.equal(110);
      expect(childShape.y).to.equal(110);

      expect(childShape.parent).to.equal(parentShape);
    }));

  });


  describe('move multiple', function() {

    it('should move according to delta', inject(function(modeling) {

      // when
      modeling.moveShapes([ childShape, childShape2 ], { x: -20, y: +20 }, parentShape2);

      // then
      expect(childShape.x).to.equal(90);
      expect(childShape.y).to.equal(130);

      expect(childShape2.x).to.equal(180);
      expect(childShape2.y).to.equal(130);

      // update parent(s)
      expect(childShape.parent).to.equal(parentShape2);
      expect(childShape2.parent).to.equal(parentShape2);
    }));

    // See https://github.com/bpmn-io/bpmn-js/issues/200
    // If a connection is moved without moving the source
    // and target shape the connection should be relayouted
    // instead of beeing moved
    it('should not move connection after move', inject(function(canvas, modeling, elementFactory) {

      // given
      modeling.removeShape(childShape);
      modeling.removeShape(childShape2);

      var s1 = modeling.createShape({
        id:'s1',
        width: 100, height: 100
      }, { x: 170, y: 200 }, rootShape);

      modeling.appendShape(s1, {
        id:'s2',
        width: 100, height: 100
      },{ x: 330, y: 200 }, rootShape);

      var c1 = s1.outgoing[0];

      // when
      modeling.moveShapes([ s1, c1 ], { x: 0, y: +100 }, rootShape);

      // then
      expect(c1.waypoints[1]).to.eql({ x : 330, y : 200 });
    }));

    it('should undo', inject(function(modeling, commandStack) {

      var oldContainment = containment(childShape),
          oldContainment2 = containment(childShape2);

      // given
      modeling.moveShapes([ childShape, childShape2 ], { x: -20, y: +20 }, parentShape2);
      modeling.moveShapes([ childShape ], { x: 40, y: 40 }, parentShape);

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(containment(childShape)).to.eql(oldContainment);
      expect(containment(childShape2)).to.eql(oldContainment2);
    }));


    it('should redo', inject(function(modeling, commandStack) {

      // given
      modeling.moveShapes([ childShape, childShape2 ], { x: -20, y: +20 }, parentShape2);
      modeling.moveShapes([ childShape ], { x: 40, y: 40 }, parentShape);

      var newContainment = containment(childShape),
          newContainment2 = containment(childShape2);

      // when
      commandStack.undo();
      commandStack.undo();
      commandStack.redo();
      commandStack.redo();

      // then
      expect(containment(childShape)).to.eql(newContainment);
      expect(containment(childShape2)).to.eql(newContainment2);
    }));

  });


  describe('move children with container', function() {

    it('should move according to delta', inject(function(modeling) {

      // when
      modeling.moveShapes([ parentShape ], { x: -20, y: +20 }, parentShape2);

      // then
      expect(childShape.x).to.equal(90);
      expect(childShape.y).to.equal(130);

      expect(childShape2.x).to.equal(180);
      expect(childShape2.y).to.equal(130);

      // update parent(s)
      expect(childShape.parent).to.equal(parentShape);
      expect(childShape2.parent).to.equal(parentShape);

      expect(childShape.parent).to.equal(parentShape);
      expect(childShape2.parent).to.equal(parentShape);

      expect(parentShape.children.length).to.equal(3);
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // given
      var oldContainment = containment(childShape);
      var oldContainment2 = containment(childShape2);

      modeling.moveShapes([ parentShape ], { x: -20, y: 20 }, parentShape2);
      modeling.moveShapes([ parentShape ], { x: 40, y: -20 });

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(containment(childShape)).to.eql(oldContainment);
      expect(containment(childShape2)).to.eql(oldContainment2);

      expect(parentShape.children.length).to.equal(3);
    }));


    it('should redo', inject(function(modeling, commandStack) {

      // given
      modeling.moveShapes([ parentShape ], { x: -20, y: 20 }, parentShape2);
      modeling.moveShapes([ parentShape ], { x: 40, y: -20 });

      var newContainment = containment(childShape),
          newContainment2 = containment(childShape2);

      // when
      commandStack.undo();
      commandStack.undo();
      commandStack.redo();
      commandStack.redo();

      // then
      expect(containment(childShape)).to.eql(newContainment);
      expect(containment(childShape2)).to.eql(newContainment2);

      expect(parentShape.children.length).to.equal(3);
    }));

  });


  describe('drop', function() {

    it('should drop', inject(function(modeling) {

      // when
      modeling.moveShapes([ childShape, childShape2 ], { x: 450, y: 400 }, parentShape2);

      // then
      expect(childShape.parent).to.equal(parentShape2);
      expect(childShape2.parent).to.equal(parentShape2);
    }));
  });

});
