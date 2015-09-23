'use strict';

/* global bootstrapDiagram, inject */


var pick = require('lodash/object/pick');

var modelingModule = require('../../../../lib/features/modeling');

function containment(element) {
  return pick(element, [ 'x', 'y', 'parent' ]);
}


describe('features/modeling - move elements', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, otherParentShape, childShape, otherChildShape, connection;

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

    otherParentShape = elementFactory.createShape({
      id: 'other-parent',
      x: 500, y: 200,
      width: 300, height: 300
    });

    canvas.addShape(otherParentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110,
      width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    otherChildShape = elementFactory.createShape({
      id: 'other-child',
      x: 250, y: 160,
      width: 100, height: 100
    });

    canvas.addShape(otherChildShape, parentShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [
        { x: 160, y: 160 },
        { x: 160, y: 300 },
        { x: 300, y: 210 }
      ],
      source: childShape,
      target: otherChildShape
    });

    canvas.addConnection(connection, parentShape);
  }));



  describe('should move', function() {

    it('execute', inject(function(modeling) {

      // when
      modeling.moveElements([ childShape, otherChildShape ], { x: -20, y: +20 }, otherParentShape);

      // then
      expect(childShape.x).to.equal(90);
      expect(childShape.y).to.equal(130);

      expect(otherChildShape.x).to.equal(230);
      expect(otherChildShape.y).to.equal(180);

      // update parent(s)
      expect(childShape.parent).to.equal(otherParentShape);
      expect(otherChildShape.parent).to.equal(otherParentShape);
    }));


    it('undo', inject(function(modeling, commandStack) {

      var oldContainment = containment(childShape),
          oldContainment2 = containment(otherChildShape);

      // given
      modeling.moveElements([ childShape, otherChildShape ], { x: -20, y: +20 }, otherParentShape);
      modeling.moveElements([ childShape ], { x: +40, y: -40 }, parentShape);

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(containment(childShape)).to.eql(oldContainment);
      expect(containment(otherChildShape)).to.eql(oldContainment2);
    }));


    it('redo', inject(function(modeling, commandStack) {

      // given
      modeling.moveElements([ childShape, otherChildShape ], { x: -20, y: +20 }, otherParentShape);
      modeling.moveElements([ childShape ], { x: +40, y: -40 }, parentShape);

      var newContainment = containment(childShape),
          newContainment2 = containment(otherChildShape);

      // when
      commandStack.undo();
      commandStack.undo();
      commandStack.redo();
      commandStack.redo();

      // then
      expect(containment(childShape)).to.eql(newContainment);
      expect(containment(otherChildShape)).to.eql(newContainment2);

      // correct positioning
      expect(childShape.x).to.equal(130);
      expect(childShape.y).to.equal(90);

      expect(otherChildShape.x).to.equal(230);
      expect(otherChildShape.y).to.equal(180);
    }));

  });


  describe('move children with container', function() {

    it('execute', inject(function(modeling) {

      // when
      modeling.moveElements([ parentShape ], { x: -20, y: +20 }, otherParentShape);

      // then
      expect(childShape.x).to.eql(90);
      expect(childShape.y).to.eql(130);

      expect(otherChildShape.x).to.eql(230);
      expect(otherChildShape.y).to.eql(180);

      // children remain unaffected
      expect(childShape.parent).to.equal(parentShape);
      expect(otherChildShape.parent).to.equal(parentShape);

      expect(parentShape.parent).to.equal(otherParentShape);
      expect(otherParentShape.children).to.eql([ parentShape ]);

      expect(parentShape.children).to.eql([ childShape, otherChildShape, connection ]);
    }));


    it('undo', inject(function(modeling, commandStack) {

      // given
      modeling.moveElements([ parentShape ], { x: -20, y: +20 }, otherParentShape);

      // when
      commandStack.undo();

      // then
      expect(childShape.x).to.eql(110);
      expect(childShape.y).to.eql(110);

      expect(otherChildShape.x).to.eql(250);
      expect(otherChildShape.y).to.eql(160);

      expect(childShape.parent).to.eql(parentShape);
      expect(otherChildShape.parent).to.eql(parentShape);

      expect(parentShape.children).to.eql([ childShape, otherChildShape, connection ]);
      expect(otherParentShape.children).to.be.empty;
    }));


    it('redo', inject(function(modeling, commandStack) {

      // given
      modeling.moveElements([ parentShape ], { x: -20, y: 20 }, otherParentShape);

      // when
      commandStack.undo();
      commandStack.redo();


      // then
      expect(childShape.x).to.eql(90);
      expect(childShape.y).to.eql(130);

      expect(otherChildShape.x).to.eql(230);
      expect(otherChildShape.y).to.eql(180);

      // children remain unaffected
      expect(childShape.parent).to.equal(parentShape);
      expect(otherChildShape.parent).to.equal(parentShape);

      expect(parentShape.parent).to.equal(otherParentShape);
      expect(otherParentShape.children).to.eql([ parentShape ]);

      expect(parentShape.children).to.eql([ childShape, otherChildShape, connection ]);
    }));

  });


  function waypoints(connection) {
    return connection.waypoints.map(function(p) {
      return { x: p.x, y: p.y };
    });
  }


  // See https://github.com/bpmn-io/bpmn-js/issues/200
  // If a connection is moved without moving the source
  // and target shape the connection should be relayouted
  // instead of beeing moved
  it('should layout dangling connection', inject(function(modeling) {

    // when
    modeling.moveElements([ childShape, connection ], { x: 0, y: -50 }, rootShape);

    // then
    // expect relayouted connection
    expect(connection.waypoints).to.eql([
      { x: 160, y: 110, original: { x: 160, y: 110 } },
      { x: 300, y: 210 }
    ]);
  }));


  it('should move included connection', inject(function(modeling) {

    // when
    modeling.moveElements([ childShape, connection, otherChildShape ], { x: 0, y: -50 }, rootShape);

    // then
    // expect moved
    expect(waypoints(connection)).to.eql([
      { x: 160, y: 110 },
      { x: 160, y: 250 },
      { x: 300, y: 160 }
    ]);
  }));


  describe('multiple selection', function(){

    it('should keep parent of secondary shape (scenario 1)', inject(function(modeling) {
      // scenario 1:
      // primary shape parent hover:    does not change
      // secondary shape parent hover:  does not change

      // given
      modeling.moveElements([ childShape ], { x: 350, y: -50 }, rootShape);

      // when
      modeling.moveElements([ childShape, otherChildShape ], { x: 0, y: 20 }, parentShape,
        { primaryShape: otherChildShape });

      // then
      expect(otherChildShape.parent.id).to.equal(parentShape.id);
      expect(childShape.parent.id).to.equal(rootShape.id);

    }));


    it('should keep parent of secondary shape (scenario 2)', inject(function(modeling) {
      // scenario 2:
      // primary shape parent hover:    does not change
      // secondary shape parent hover:  does change

      // given
      modeling.moveElements([ childShape ], { x: 330, y: -50 }, rootShape);

      // when
      modeling.moveElements([ childShape, otherChildShape ], { x: -145, y: 100 }, parentShape,
        { primaryShape: otherChildShape });

      // then
      expect(otherChildShape.parent.id).to.equal(parentShape.id);
      expect(childShape.parent.id).to.equal(rootShape.id);

    }));


    it('should set parent of sec. shape to parent of prim. shape (scenario 3)', inject(function(modeling) {
      // scenario 3:
      // primary shape parent hover:    does change
      // secondary shape parent hover:  does not change

      // given
      modeling.moveElements([ childShape ], { x: 350, y: -50 }, rootShape);

      // when
      modeling.moveElements([ childShape, otherChildShape ], { x: 400, y: 200 }, otherParentShape,
        { primaryShape: otherChildShape });

      // then
      expect(otherChildShape.parent.id).to.equal(otherParentShape.id);
      expect(childShape.parent.id).to.equal(otherParentShape.id);

    }));


    it('should set parent of sec. shape to parent of prim. shape (scenario 4)', inject(function(modeling) {
      // scenario 4:
      // primary shape parent hover:    does change
      // secondary shape parent hover:  does change

      // given
      modeling.moveElements([ childShape ], { x: 300, y: -50 }, rootShape);

      // when
      modeling.moveElements([ childShape, otherChildShape ], { x: 280, y: 200 }, otherParentShape,
        { primaryShape: otherChildShape });

      // then
      expect(otherChildShape.parent.id).to.equal(otherParentShape.id);
      expect(childShape.parent.id).to.equal(otherParentShape.id);

    }));

  });


  describe('drop', function() {

    // @see DropShapeSpec.js

  });

});
