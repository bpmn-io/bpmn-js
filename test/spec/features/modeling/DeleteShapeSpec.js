'use strict';

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    contextPadModule = require('../../../../lib/features/context-pad'),
    selectionModule = require('../../../../lib/features/selection');

describe('features/modeling - #removeShape', function() {

  describe('basics', function() {

    var rootShape,
        parentShape,
        childShape,
        childShape2,
        childShape3,
        childShape4,
        connection,
        connection2;

    beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));

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

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
        source: childShape,
        target: childShape2
      });

      canvas.addConnection(connection, parentShape);

      childShape3 = elementFactory.createShape({
        id: 'child3',
        x: 600, y: 100, width: 100, height: 100
      });

      canvas.addShape(childShape3, rootShape);

      childShape4 = elementFactory.createShape({
        id: 'child4',
        x: 100, y: 500, width: 100, height: 100
      });

      canvas.addShape(childShape4, rootShape);

      connection2 = elementFactory.createConnection({
        id: 'connection2',
        waypoints: [ { x: 650, y: 150 }, { x: 150, y: 550 } ],
        source: childShape3,
        target: childShape4
      });

      canvas.addConnection(connection2, parentShape);
    }));


    it('should remove shape', inject(function(modeling, elementRegistry) {

      // when
      modeling.removeShape(childShape);

      // then
      expect(elementRegistry.get(childShape.id)).to.not.be.defined;

      expect(childShape.parent).to.be.null;
      expect(parentShape.children).to.not.contain(childShape);
    }));


    it('should remove incoming connection', inject(function(modeling) {

      // when
      modeling.removeShape(childShape2);

      // then
      expect(connection.parent).to.be.null;
    }));


    it('should remove outgoing connection', inject(function(modeling) {

      // when
      modeling.removeShape(childShape);

      // then
      expect(connection.parent).to.be.null;
    }));


    it('should remove children', inject(function(modeling) {

      // when
      modeling.removeShape(parentShape);

      // then
      expect(parentShape.parent).to.be.null;
      expect(childShape.parent).to.be.null;
      expect(childShape2.parent).to.be.null;
      expect(connection.parent).to.be.null;
      expect(childShape3.outgoing.length).to.equal(0);
      expect(childShape4.incoming.length).to.equal(0);
    }));


    it('ensure revert works', inject(function(modeling, elementRegistry, commandStack) {

      // when
      modeling.removeShape(childShape);

      // when
      commandStack.undo();

      // then
      expect(childShape.parent).to.equal(parentShape);
      expect(connection.parent).to.equal(parentShape);
      expect(childShape3.outgoing.length).to.equal(1);
      expect(childShape4.incoming.length).to.equal(1);
    }));


    it('should remove label', inject(function(modeling) {

      var label = modeling.createLabel(childShape, { x: 160, y: 145 });

      // when
      modeling.removeShape(childShape);

      // then
      expect(label.parent).to.be.null;
      expect(childShape.label).to.be.null;
    }));


    it('should undo remove label', inject(function(modeling, commandStack) {

      var label = modeling.createLabel(childShape, { x: 160, y: 145 });

      // when
      modeling.removeShape(childShape);
      commandStack.undo();

      // then
      expect(label.parent).to.equal(parentShape);
      expect(childShape.label).to.equal(label);
    }));


    it('should redo remove label', inject(function(modeling, commandStack) {

      var label = modeling.createLabel(childShape, { x: 160, y: 145 });

      // when
      modeling.removeShape(childShape);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(label.parent).to.be.null;
      expect(childShape.label).to.be.null;
    }));

  });


  describe('context pad interaction', function() {

    beforeEach(bootstrapDiagram({ modules: [ modelingModule, contextPadModule, selectionModule ] }));

    it('should close context pad on remove shape', inject(function(canvas, modeling, contextPad, selection) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 100, y: 100, width: 300, height: 300
      });

      selection.select(shape);

      // when
      modeling.removeShape(shape);

      // then
      expect(contextPad.isOpen()).to.be.false;
    }));

  });

});
