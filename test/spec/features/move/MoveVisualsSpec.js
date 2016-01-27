'use strict';

/* global bootstrapDiagram, inject */

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

var modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move'),
    rulesModule = require('./rules');


describe('features/move - MoveVisuals', function() {

  beforeEach(bootstrapDiagram({ modules: [ moveModule, rulesModule, modelingModule ] }));

  beforeEach(inject(function(canvas, dragging) {
    dragging.setOptions({ manual: true });
  }));


  var rootShape, parentShape, childShape, childShape2, connection;

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
  }));


  describe('style integration via <djs-dragging>', function() {

    it('should append class to shape + outgoing connections', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(canvasEvent({ x: 10, y: 10 }), childShape);

      // when
      dragging.move(canvasEvent({ x: 20, y: 20 }));

      // then
      expect(elementRegistry.getGraphics(childShape).hasClass('djs-dragging')).to.equal(true);
      expect(elementRegistry.getGraphics(connection).hasClass('djs-dragging')).to.equal(true);
    }));


    it('should append class to shape + incoming connections', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(canvasEvent({ x: 10, y: 10 }), childShape2);

      // when
      dragging.move(canvasEvent({ x: 20, y: 20 }));

      // then
      expect(elementRegistry.getGraphics(childShape2).hasClass('djs-dragging')).to.equal(true);
      expect(elementRegistry.getGraphics(connection).hasClass('djs-dragging')).to.equal(true);
    }));


    it('should remove class on drag end', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(canvasEvent({ x: 10, y: 10 }), childShape2);

      // when
      dragging.move(canvasEvent({ x: 30, y: 30 }));
      dragging.end();

      // then
      expect(elementRegistry.getGraphics(childShape2).hasClass('djs-dragging')).to.equal(false);
      expect(elementRegistry.getGraphics(connection).hasClass('djs-dragging')).to.equal(false);
    }));

  });


  describe('drop markup', function() {

    it('should indicate drop allowed', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(canvasEvent({ x: 10, y: 10 }), childShape);

      // when
      dragging.move(canvasEvent({ x: 20, y: 20 }));
      dragging.hover(canvasEvent({ x: 20, y: 20 }, {
        element: parentShape,
        gfx: elementRegistry.getGraphics(parentShape)
      }));

      dragging.move(canvasEvent({ x: 22, y: 22 }));

      // then
      var ctx = dragging.context();
      expect(ctx.data.context.canExecute).to.equal(true);

      expect(elementRegistry.getGraphics(parentShape).hasClass('drop-ok')).to.equal(true);
    }));


    it('should indicate drop not allowed', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(canvasEvent({ x: 10, y: 10 }), childShape);

      // when
      dragging.move(canvasEvent({ x: 20, y: 20 }));
      dragging.hover(canvasEvent({ x: 20, y: 20 }, {
        element: childShape,
        gfx: elementRegistry.getGraphics(childShape)
      }));

      dragging.move(canvasEvent({ x: 22, y: 22 }));

      // then
      var ctx = dragging.context();
      expect(ctx.data.context.canExecute).to.equal(false);

      expect(elementRegistry.getGraphics(childShape).hasClass('drop-not-ok')).to.equal(true);
    }));

  });

  describe('drop markup on target change', function() {

    var differentShape;

    beforeEach(inject(function(elementFactory, canvas) {

      differentShape = elementFactory.createShape({
        id: 'differentShape',
        x: 10, y: 110, width: 50, height: 50
      });

      canvas.addShape(differentShape, rootShape);

    }));

    it('should indicate new target, if selected shapes have different parents',
      inject(function(move, dragging, elementRegistry, selection) {

      // given
      selection.select([ childShape, differentShape ]);

      move.start(canvasEvent({ x: 10, y: 10 }), differentShape);

      // when
      dragging.move(canvasEvent({ x: 200, y: 200 }));
      dragging.hover(canvasEvent({ x: 200, y: 200 }, {
        element: parentShape,
        gfx: elementRegistry.getGraphics(parentShape)
      }));

      dragging.move(canvasEvent({ x: 120, y: 180 }));

      // then
      var ctx = dragging.context();
      expect(ctx.data.context.differentParents).to.equal(true);

      expect(elementRegistry.getGraphics(parentShape).hasClass('new-parent')).to.equal(true);

    }));


    it('should not indicate new target, if target does not change',
      inject(function(move, dragging, elementRegistry, selection) {

      // given
      selection.select([ childShape, differentShape ]);

      move.start(canvasEvent({ x: 10, y: 10 }), childShape);

      // when
      dragging.move(canvasEvent({ x: 200, y: 200 }));
      dragging.hover(canvasEvent({ x: 200, y: 200 }, {
        element: parentShape,
        gfx: elementRegistry.getGraphics(parentShape)
      }));

      dragging.move(canvasEvent({ x: 120, y: 180 }));

      // then
      var ctx = dragging.context();
      expect(ctx.data.context.differentParents).to.equal(true);

      expect(elementRegistry.getGraphics(parentShape).hasClass('drop-new-target')).to.equal(false);

    }));


    it('should not indicate new target, if drop is not allowed',
      inject(function(move, dragging, elementRegistry, selection) {

      // given
      selection.select([ childShape, differentShape ]);

      move.start(canvasEvent({ x: 10, y: 10 }), differentShape);

      // when
      dragging.move(canvasEvent({ x: 200, y: 200 }));
      dragging.hover(canvasEvent({ x: 200, y: 200 }, {
        element: childShape,
        gfx: elementRegistry.getGraphics(childShape)
      }));

      dragging.move(canvasEvent({ x: 150, y: 15 }));

      // then
      var ctx = dragging.context();
      expect(ctx.data.context.differentParents).to.equal(true);

      var childGfx = elementRegistry.getGraphics(childShape);
      expect(childGfx.hasClass('drop-new-target')).to.equal(false);
      expect(childGfx.hasClass('drop-not-ok')).to.equal(true);
    }));

  });

  describe('addDragger', function(){

    it('should be exposed and return the added dragger', inject(function(moveVisuals) {

      // when
      var dragger = moveVisuals.addDragger({}, childShape);

      // then
      expect(dragger).to.exist;
      expect(dragger.node).to.exist;
    }));

  });

});
