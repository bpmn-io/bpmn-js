'use strict';

var Events = require('../../../util/Events');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move'),
    rulesModule = require('./rules');


describe('features/move - Move', function() {

  beforeEach(bootstrapDiagram({ modules: [ moveModule, rulesModule, modelingModule ] }));

  var Event;

  beforeEach(inject(function(canvas, dragging) {
    Event = Events.target(canvas._svg);

    dragging.setOptions({ manual: true });
  }));

  afterEach(inject(function(dragging) {
    dragging.setOptions({ manual: false });
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


  describe('bootstrap', function() {

    it('should bootstrap diagram with component', inject(function() {}));

  });


  describe('style integration via <djs-dragging>', function() {

    it('should append class to shape + outgoing connections', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(Event.create({ x: 10, y: 10 }), childShape);

      // when
      dragging.move(Event.create({ x: 20, y: 20 }));

      // then
      expect(elementRegistry.getGraphics(childShape).hasClass('djs-dragging')).to.equal(true);
      expect(elementRegistry.getGraphics(connection).hasClass('djs-dragging')).to.equal(true);
    }));


    it('should append class to shape + incoming connections', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(Event.create({ x: 10, y: 10 }), childShape2);

      // when
      dragging.move(Event.create({ x: 20, y: 20 }));

      // then
      expect(elementRegistry.getGraphics(childShape2).hasClass('djs-dragging')).to.equal(true);
      expect(elementRegistry.getGraphics(connection).hasClass('djs-dragging')).to.equal(true);
    }));


    it('should remove class on drag end', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(Event.create({ x: 10, y: 10 }), childShape2);

      // when
      dragging.move(Event.create({ x: 30, y: 30 }));
      dragging.end();

      // then
      expect(elementRegistry.getGraphics(childShape2).hasClass('djs-dragging')).to.equal(false);
      expect(elementRegistry.getGraphics(connection).hasClass('djs-dragging')).to.equal(false);
    }));

  });


  describe('drop markup', function() {

    it('should indicate drop allowed', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(Event.create({ x: 10, y: 10 }), childShape);

      // when
      dragging.move(Event.create({ x: 20, y: 20 }));
      dragging.hover(Event.create({ x: 20, y: 20 }, {
        element: parentShape,
        gfx: elementRegistry.getGraphics(parentShape)
      }));

      dragging.move(Event.create({ x: 22, y: 22 }));

      // then
      var ctx = dragging.active();
      expect(ctx.data.context.canExecute).to.equal(true);

      expect(elementRegistry.getGraphics(parentShape).hasClass('drop-ok')).to.equal(true);
    }));


    it('should indicate drop not allowed', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(Event.create({ x: 10, y: 10 }), childShape);

      // when
      dragging.move(Event.create({ x: 20, y: 20 }));
      dragging.hover(Event.create({ x: 20, y: 20 }, {
        element: childShape,
        gfx: elementRegistry.getGraphics(childShape)
      }));

      dragging.move(Event.create({ x: 22, y: 22 }));

      // then
      var ctx = dragging.active();
      expect(ctx.data.context.canExecute).to.equal(false);

      expect(elementRegistry.getGraphics(childShape).hasClass('drop-not-ok')).to.equal(true);
    }));

  });


  describe('modeling', function() {

    it('should round movement to pixels', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(Event.create({ x: 0, y: 0 }), childShape);

      // when
      dragging.move(Event.create({ x: 20, y: 20 }));
      dragging.hover({
        element: parentShape,
        gfx: elementRegistry.getGraphics(parentShape)
      });

      dragging.move(Event.create({ x: 30.4, y: 99.7 }));

      dragging.end();

      // then
      expect(childShape.x).to.eql(140);
      expect(childShape.y).to.eql(210);
    }));

  });

});
