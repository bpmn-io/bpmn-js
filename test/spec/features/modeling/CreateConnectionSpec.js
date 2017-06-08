'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - create connection', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule
    ]
  }));

  var rootShape,
      parentShape,
      sourceShape,
      targetShape,
      newConnection;

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

    sourceShape = elementFactory.createShape({
      id: 'sourceShape',
      x: 110, y: 110, width: 40, height: 40
    });

    canvas.addShape(sourceShape, parentShape);

    targetShape = elementFactory.createShape({
      id: 'targetShape',
      x: 210, y: 110, width: 40, height: 40
    });

    canvas.addShape(targetShape, parentShape);

    newConnection = elementFactory.createConnection({
      id: 'newConnection'
    });

  }));


  describe('basics', function() {

    describe('should create', function() {

      it('execute', inject(function(modeling, elementRegistry) {

        // when
        modeling.connect(sourceShape, targetShape, newConnection);

        var connection = elementRegistry.get('newConnection');

        // then
        expect(connection.id).to.eql('newConnection');

        expect(connection.waypoints).to.eql([
          { x: 130, y: 130 },
          { x: 230, y: 130 }
        ]);
      }));


      it('undo', inject(function(modeling, commandStack, elementRegistry) {

        // given
        modeling.connect(sourceShape, targetShape, newConnection);

        // when
        commandStack.undo();

        // then
        expect(parentShape.children).not.to.contain(newConnection);
        expect(newConnection.parent).not.to.exist;

        expect(elementRegistry.get('newConnection')).not.to.exist;
      }));

    });


    it('should have a parent', inject(function(modeling) {

      // given
      modeling.createConnection(sourceShape, targetShape, newConnection, rootShape);

      // when
      var parent = newConnection.parent;

      // then
      expect(parent).to.equal(rootShape);
    }));


    it('should have parentIndex', inject(function(modeling) {

      // given
      modeling.createConnection(sourceShape, targetShape, 0, newConnection, parentShape);

      // when
      var children = parentShape.children;

      // then
      expect(children).to.eql([
        newConnection,
        sourceShape,
        targetShape
      ]);
    }));

  });

});
