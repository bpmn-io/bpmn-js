'use strict';


/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - move connection', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, sourceShape, targetShape, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);


    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 50, y: 50, width: 400, height: 300
    });

    canvas.addShape(parentShape, rootShape);


    sourceShape = elementFactory.createShape({
      id: 'source',
      x: 100, y: 100, width: 100, height: 100
    });

    canvas.addShape(sourceShape, parentShape);


    targetShape = elementFactory.createShape({
      id: 'target',
      x: 300, y: 300, width: 100, height: 100
    });

    canvas.addShape(targetShape, parentShape);


    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [
        { x: 150, y: 150, original: { x: 0, y: 0 } },
        { x: 150, y: 200 },
        { x: 350, y: 150 }
      ],
      source: sourceShape,
      target: targetShape
    });

    canvas.addConnection(connection, parentShape);
  }));


  describe('should move by delta', function() {

    it('execute', inject(function(modeling) {

      // when
      modeling.moveConnection(connection, { x: 20, y: 10 });

      // then
      expect(connection.waypoints).to.eql([
        { x: 170, y: 160, original: { x: 20, y: 10 } }, { x: 170, y: 210 }, { x: 370, y: 160 }
      ]);
    }));


    it('undo', inject(function(modeling, commandStack) {

      // given
      modeling.moveConnection(connection, { x: 20, y: 10 });

      // when
      commandStack.undo();

      // then
      expect(connection.waypoints).to.eql([
        { x: 150, y: 150, original: { x: 0, y: 0 } }, { x: 150, y: 200 }, { x: 350, y: 150 }
      ]);
    }));


    it('redo', inject(function(modeling, commandStack) {

      // given
      modeling.moveConnection(connection, { x: 20, y: 10 });

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(connection.waypoints).to.eql([
        { x: 170, y: 160, original: { x: 20, y: 10 } }, { x: 170, y: 210 }, { x: 370, y: 160 }
      ]);
    }));

  });


  describe('should move to new parent', function() {

    it('execute', inject(function(modeling) {

      // when
      modeling.moveConnection(connection, { x: 0, y: 0 }, rootShape, 0);

      // then
      expect(connection.parent).to.equal(rootShape);
      expect(rootShape.children[0]).to.equal(connection);
    }));


    it('undo', inject(function(modeling, commandStack) {

      // given
      modeling.moveConnection(connection, { x: 0, y: 0 }, rootShape, 0);

      // when
      commandStack.undo();

      // then
      expect(connection.parent).to.equal(parentShape);
      expect(parentShape.children[2]).to.equal(connection);
    }));


    it('redo', inject(function(modeling, commandStack) {

      // given
      modeling.moveConnection(connection, { x: 0, y: 0 }, rootShape, 0);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(connection.parent).to.equal(rootShape);
      expect(rootShape.children[0]).to.equal(connection);
    }));

  });

});
