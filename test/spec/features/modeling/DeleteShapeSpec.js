'use strict';

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');

function items(collection) {
  return collection.map(function(e) {
    return e;
  });
}

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

    var child, connection, attachedShape, attachedShape2, attachedShape3, attachedShape4;

    beforeEach(inject(function(modeling, elementFactory, canvas) {

      child = elementFactory.createShape({
        id: 'child',
        x: 600, y: 75,
        width: 50, height: 50
      });

      canvas.addShape(child, rootShape);

      attachedShape = elementFactory.createShape({
        id: 'attachedShape',
        x: 75, y: 75, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape, rootShape);

      attachedShape2 = elementFactory.createShape({
        id: 'attachedShape2',
        x: 375, y: 75, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape2, rootShape);

      attachedShape3 = elementFactory.createShape({
        id: 'attachedShape3',
        x: 75, y: 375, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape3, rootShape);

      attachedShape4 = elementFactory.createShape({
        id: 'attachedShape4',
        x: 375, y: 375, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape4, rootShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        source: attachedShape2,
        target: child,
        waypoints: [
          { x: 400, y: 100 },
          { x: 625, y: 100 }
        ]
      });

      canvas.addConnection(connection, rootShape);
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


    describe('remove multiple', function() {

      it('should execute', inject(function(modeling) {

        // when
        modeling.removeShape(attachedShape2);

        modeling.removeShape(attachedShape3);

        // then
        expect(items(parentShape.attachers)).to.eql([ attachedShape, attachedShape4 ]);
      }));


      it('should undo', inject(function(commandStack, modeling) {

        // given
        var originalAttachers = items(parentShape.attachers);

        modeling.removeShape(attachedShape2);

        modeling.removeShape(attachedShape4);

        // when
        commandStack.undo();

        commandStack.undo();

        // then
        expect(items(parentShape.attachers)).to.eql(originalAttachers);
      }));

    });


    it('should remove connection when deleting shape', inject(function(modeling) {
      // when
      modeling.removeShape(attachedShape2);

      // then
      expect(child.incoming).to.have.length(0);
    }));


    it('should add connection when deleting shape -> undo', inject(function(commandStack, modeling) {
      // given
      modeling.removeShape(attachedShape2);

      // when
      commandStack.undo();

      // then
      expect(child.incoming).to.have.length(1);
    }));


    it('should remove connection when deleting host of connected shape', inject(function(modeling) {
      // when
      modeling.removeShape(parentShape);

      // then
      expect(child.incoming).to.have.length(0);
    }));


    it('should add connection when deleting host of connected shape -> undo', inject(function(commandStack, modeling) {
      // given
      modeling.removeShape(parentShape);

      // when
      commandStack.undo();

      // then
      expect(child.incoming).to.have.length(1);
    }));


    describe('remove attachers shapes with host', function() {

      it('should execute', inject(function(modeling, elementRegistry) {

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


      it('should undo', inject(function(commandStack, modeling, elementRegistry) {

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
        expect(items(parent.attachers)).to.eql([attacher, attacher2, attacher3, attacher4 ]);

        expect(attacher).to.exist;
        expect(attacher2).to.exist;
        expect(attacher3).to.exist;
        expect(attacher4).to.exist;
      }));


      it('should redo', inject(function(commandStack, modeling, elementRegistry) {

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

});
