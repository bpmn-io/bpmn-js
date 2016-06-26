'use strict';

/* global bootstrapDiagram, inject, sinon */

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - move shape', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule
    ]
  }));


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
        { x: 150, y: 150, original: { x: 150, y: 150 } },
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


  describe('layout connections', function() {

    it('should layout after move', inject(function(modeling) {

      // when
      modeling.moveShape(childShape, { x: -20, y: +20 }, parentShape);

      // then
      // update parent
      expect(connection).to.have.waypoints([
        { x: 130, y: 170 },
        { x: 250, y: 160 }
      ]);
    }));


    it('should provide original waypoints to layout', inject(function(eventBus, modeling) {

      // given
      var originalWaypoints = connection.waypoints;

      var preLayoutSpy = sinon.spy(function(event) {

        var context = event.context,
            connection = context.connection;

        expect(connection).to.have.waypoints(originalWaypoints);

        expect(connection).to.have.startDocking({ x: 150, y: 150 });
      });

      eventBus.on('commandStack.connection.layout.preExecute', preLayoutSpy);

      // when
      modeling.moveShape(childShape, { x: -20, y: +20 }, parentShape);

      // then
      expect(preLayoutSpy).to.have.been.called;
    }));

  });

});
