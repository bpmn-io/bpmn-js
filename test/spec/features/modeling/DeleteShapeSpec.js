'use strict';

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - #removeShape', function() {

  var rootShape, parentShape;

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
  }));

  describe('basics', function () {
    var childShape, childShape2, connection;

    beforeEach(inject(function(elementFactory, canvas) {

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
    }));


    it('ensure revert works', inject(function(modeling, elementRegistry, commandStack) {

      // when
      modeling.removeShape(childShape);

      // when
      commandStack.undo();

      // then
      expect(childShape.parent).to.equal(parentShape);
      expect(connection.parent).to.equal(parentShape);
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

  describe('attachment', function () {

    var attachedShape, attachedShape2, attachedShape3, attachedShape4;

    beforeEach(inject(function(modeling, elementFactory) {

      attachedShape = elementFactory.createShape({
        id: 'attachedShape',
        x: 200, y: 110, width: 50, height: 50
      });

      modeling.createShape(attachedShape, { x: 100, y: 100 }, parentShape, true);

      attachedShape2 = elementFactory.createShape({
        id: 'attachedShape2',
        x: 0, y: 0, width: 50, height: 50
      });

      modeling.createShape(attachedShape2, { x: 400, y: 100 }, parentShape, true);

      attachedShape3 = elementFactory.createShape({
        id: 'attachedShape3',
        x: 0, y: 0, width: 50, height: 50
      });

      modeling.createShape(attachedShape3, { x: 100, y: 400 }, parentShape, true);

      attachedShape4 = elementFactory.createShape({
        id: 'attachedShape4',
        x: 0, y: 0, width: 50, height: 50
      });

      modeling.createShape(attachedShape4, { x: 400, y: 400 }, parentShape, true);

    }));

    it('should remove attacher from host', inject(function(modeling) {

      // when
      modeling.removeShape(attachedShape);

      // then
      expect(parentShape.attachers).to.have.length(3);
    }));


    it('should add attacher to host on undo', inject(function(modeling, commandStack) {

      // when
      modeling.removeShape(attachedShape);

      commandStack.undo();

      // then
      expect(parentShape.attachers).to.include(attachedShape);
    }));

    it('should only have one attacher on remove', inject(function(modeling) {

      // when
      modeling.removeShape(attachedShape2);

      modeling.removeShape(attachedShape3);

      // then
      expect(parentShape.attachers).to.have.length(2);
      expect(parentShape.attachers).to.include(attachedShape4);
    }));


    it('should have 3 attachers on remove UNDO', inject(function(commandStack, modeling) {

      // given
      modeling.removeShape(attachedShape2);

      modeling.removeShape(attachedShape4);

      // when
      commandStack.undo();

      commandStack.undo();

      // then
      expect(parentShape.attachers).to.have.length(4);
      expect(parentShape.attachers).to.eql([ attachedShape, attachedShape2, attachedShape3, attachedShape4 ]);
    }));


    it('should remove all attached shapes when removing host',
      inject(function(commandStack, modeling, elementRegistry) {

      // when
      modeling.removeShape(parentShape);

      // then
      var parent = elementRegistry.get('parent');

      var attacher = elementRegistry.get('attachedShape');

      var attacher2 = elementRegistry.get('attachedShape2');

      var attacher3 = elementRegistry.get('attachedShape3');

      var attacher4 = elementRegistry.get('attachedShape4');


      expect(parent).to.not.exist;

      expect(attacher).to.not.exist;
      expect(attacher2).to.not.exist;
      expect(attacher3).to.not.exist;
      expect(attacher4).to.not.exist;
    }));


    it('should add all attached shapes on host removal -> undo',
      inject(function(commandStack, modeling, elementRegistry) {

      // given
      modeling.removeShape(parentShape);

      // when
      commandStack.undo();

      // then
      var parent = elementRegistry.get('parent');

      var attacher = elementRegistry.get('attachedShape');

      var attacher2 = elementRegistry.get('attachedShape2');

      var attacher3 = elementRegistry.get('attachedShape3');

      var attacher4 = elementRegistry.get('attachedShape4');

      expect(parent).to.exist;
      expect(parent.attachers).to.eql([attacher, attacher2, attacher3, attacher4 ]);

      expect(attacher).to.exist;
      expect(attacher2).to.exist;
      expect(attacher3).to.exist;
      expect(attacher4).to.exist;
    }));


    it('should remove all attached shapes on host removal -> redo',
      inject(function(commandStack, modeling, elementRegistry) {

      // given
      modeling.removeShape(parentShape);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      var parent = elementRegistry.get('parent');

      var attacher = elementRegistry.get('attachedShape');

      var attacher2 = elementRegistry.get('attachedShape2');

      var attacher3 = elementRegistry.get('attachedShape3');

      var attacher4 = elementRegistry.get('attachedShape4');

      expect(parent).to.not.exist;

      expect(attacher).to.not.exist;
      expect(attacher2).to.not.exist;
      expect(attacher3).to.not.exist;
      expect(attacher4).to.not.exist;
    }));

  });

});
