'use strict';

var Events = require('../../../util/Events');

/* global bootstrapDiagram, inject */


var labelSupportModule = require('../../../../lib/features/label-support'),
    modelingModule = require('../../../../lib/features/modeling'),
    rulesModule = require('./rules');


describe('features/label-support - Label', function() {

  beforeEach(bootstrapDiagram({ modules: [ labelSupportModule, modelingModule, rulesModule ] }));

  var Event;

  beforeEach(inject(function(canvas, dragging) {
    Event = Events.target(canvas._svg);

    dragging.setOptions({ manual: true });
  }));

  afterEach(inject(function(dragging) {
    dragging.setOptions({ manual: false });
  }));


  var rootShape, parentShape, childShape, label;

  beforeEach(inject(function(elementFactory, canvas, modeling) {

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
      x: 200, y: 250,
      width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    label = elementFactory.createLabel({
      id: 'label',
      width: 80, height: 40
    });

    modeling.createLabel(childShape, { x: 200, y: 250 }, label, parentShape);
  }));

  describe('modeling', function() {

    it('should move', inject(function(modeling) {
      // when
      modeling.moveShapes([ label ], { x: 75, y: 0 }, parentShape);

      // then
      expect(label.x).to.eql(235);
      expect(label.y).to.eql(230);
    }));


    it('should move with labelTarget', inject(function(modeling) {
      // when
      modeling.moveShapes([ childShape ], { x: 75, y: 0 }, parentShape);

      // then
      expect(label.x).to.eql(235);
      expect(label.y).to.eql(230);
    }));

  });

  describe('moving', function() {

    it('should move with labelTarget', inject(function(move, dragging) {
      // when
      move.start(Event.create({ x: 225, y: 275 }), childShape);

      dragging.move(Event.create({ x: 300, y: 275 }));
      dragging.end();

      // then
      expect(label.x).to.eql(235);
      expect(label.y).to.eql(230);
    }));


    it('should move with labelTarget -> undo', inject(function(move, dragging, commandStack) {
      // when
      move.start(Event.create({ x: 225, y: 275 }), childShape);

      dragging.move(Event.create({ x: 300, y: 275 }));
      dragging.end();

      commandStack.undo();

      // then
      expect(label.x).to.eql(160);
      expect(label.y).to.eql(230);
    }));


    it('should move with labelTarget -> redo', inject(function(move, dragging, commandStack) {
      // when
      move.start(Event.create({ x: 225, y: 275 }), childShape);

      dragging.move(Event.create({ x: 300, y: 275 }));
      dragging.end();

      commandStack.undo();

      commandStack.redo();

      // then
      expect(label.x).to.eql(235);
      expect(label.y).to.eql(230);
    }));


    it('should not be inside move collection', inject(function(move, dragging) {
      // when
      move.start(Event.create({ x: 225, y: 275 }), childShape);

      dragging.move(Event.create({ x: 225, y: 150 }));

      var ctx = dragging.active().data.context;

      // then
      expect(ctx.shapes).to.not.include(label);
    }));


    it('should not be inside move collection', inject(function(move, dragging) {
      // when
      move.start(Event.create({ x: 225, y: 275 }), childShape);

      dragging.move(Event.create({ x: 225, y: 150 }));
      dragging.end();

      var labelIdx = parentShape.children.indexOf(label),
          childShapeIdx = parentShape.children.indexOf(childShape);

      // then
      expect(labelIdx).to.be.above(childShapeIdx);
    }));

  });

  describe('visuals', function() {

    it('should add marker', inject(function(elementRegistry, move, dragging) {
      var labelGfx = elementRegistry.getGraphics(label);

      // when
      move.start(Event.create({ x: 225, y: 275 }), childShape);

      dragging.move(Event.create({ x: 225, y: 150 }));

      // then
      expect(labelGfx.hasClass('djs-dragging')).to.be.true;
    }));


    it('should remove marker', inject(function(elementRegistry, move, dragging) {

      // when
      move.start(Event.create({ x: 225, y: 275 }), childShape);

      dragging.move(Event.create({ x: 225, y: 150 }));
      dragging.end();

      var labelGfx = elementRegistry.getGraphics(label);
      // then
      expect(labelGfx.hasClass('djs-dragging')).to.be.false;
    }));


    it('should be inside dragGroup', inject(function(elementRegistry, move, dragging) {
      // when
      move.start(Event.create({ x: 225, y: 275 }), childShape);

      dragging.move(Event.create({ x: 225, y: 150 }));

      var ctx = dragging.active().data.context;

      var children = ctx.dragGroup.children();

      // then
      expect(children).to.have.lengthOf(2);
    }));


  });

});
