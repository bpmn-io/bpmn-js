'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var Events = require('../../../util/Events');

var modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move'),
    dragModule = require('../../../../lib/features/dragging'),
    createModule = require('../../../../lib/features/create'),
    rulesModule = require('./rules');


describe('features/create - Create', function () {

  beforeEach(bootstrapDiagram({ modules: [ createModule, rulesModule, modelingModule, moveModule, dragModule ] }));

  var rootShape, parentShape, childShape, attacher;

  var createEvent;

  beforeEach(inject(function(canvas, dragging, elementRegistry) {
    createEvent = Events.scopedCreate(canvas);

    global.elementRegistry = elementRegistry;

    dragging.setOptions({ manual: true });
  }));

  afterEach(inject(function(dragging) {
    dragging.setOptions({ manual: false });
  }));

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 200, height: 200
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'childShape',
      x: 150, y: 350, width: 100, height: 100
    });

    canvas.addShape(childShape, rootShape);

    attacher = elementFactory.createShape({
      id: 'attacher',
      x: 0, y: 0, width: 50, height: 50
    });

  }));

  describe('basics', function() {

    it('should create a shape', inject(function(create, elementRegistry, dragging) {
      // given
      var parentGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), attacher);

      dragging.move(createEvent({ x: 125, y: 125 }));
      dragging.hover({ element: parentShape, gfx: parentGfx });
      dragging.move(createEvent({ x: 175, y: 175 }));

      dragging.end();

      var shape = elementRegistry.get('attacher');

      // then
      expect(shape).to.exist;
      expect(shape.parent).to.equal(parentShape);
    }));


    it('should append a shape', inject(function(create, elementRegistry, dragging) {
      // given
      var rootGfx = elementRegistry.getGraphics('root');

      // when
      create.start(createEvent({ x: 0, y: 0 }), attacher, parentShape);

      dragging.move(createEvent({ x: 175, y: 175 }));
      dragging.hover({ element: rootShape, gfx: rootGfx });
      dragging.move(createEvent({ x: 400, y: 200 }));

      dragging.end();

      var shape = elementRegistry.get('attacher');

      // then
      expect(shape).to.exist;
      expect(shape.incoming).to.have.length(1);
    }));


    it('should attach a shape', inject(function(create, elementRegistry, dragging) {
      // given
      var childShapeGfx = elementRegistry.getGraphics('childShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), attacher);

      dragging.move(createEvent({ x: 150, y: 350 }));
      dragging.hover({ element: childShape, gfx: childShapeGfx });
      dragging.move(createEvent({ x: 200, y: 350 }));

      dragging.end();

      // then
      expect(attacher.host).to.equal(childShape);
      expect(childShape.attachers).to.include(attacher);
    }));

  });

  describe('visuals', function() {

    it('should add visuals', inject(function(create, elementRegistry, dragging) {

      // when
      create.start(createEvent({ x: 50, y: 50 }), attacher);

      dragging.move(createEvent({ x: 50, y: 50 }));

      var ctx = dragging.active();

      // then
      expect(ctx.data.context.visual.hasClass('djs-drag-group')).to.be.true;
    }));


    it('should remove visuals', inject(function(create, elementRegistry, dragging, eventBus) {
      var parentGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(createEvent({ x: 50, y: 50 }), attacher);

      dragging.move(createEvent({ x: 100, y: 100 }));
      dragging.hover({ element: parentShape, gfx: parentGfx});
      dragging.move(createEvent({ x: 150, y: 150 }));

      var ctx = dragging.active();

      dragging.end();

      // then
      expect(ctx.data.context.visual.parent()).to.not.exist;
    }));

  });

  describe('rules', function () {

    it('should not allow shape create', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('rootShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), attacher);

      dragging.move(createEvent({ x: 50, y: 25 }));
      dragging.hover({ element: rootShape, gfx: targetGfx});
      dragging.move(createEvent({ x: 50, y: 50 }));

      dragging.end();

      expect(elementRegistry.getGraphics('attacher')).to.not.exist;
    }));


    it('should add "drop-ok" marker', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), attacher);

      dragging.move(createEvent({ x: 200, y: 50 }));
      dragging.hover({ element: parentShape, gfx: targetGfx});
      dragging.move(createEvent({ x: 200, y: 225 }));

      expect(canvas.hasMarker(parentShape, 'drop-ok')).to.be.true;
    }));


    it('should add "drop-not-ok" marker', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('rootShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), attacher);

      dragging.move(createEvent({ x: 50, y: 25 }));
      dragging.hover({ element: rootShape, gfx: targetGfx});
      dragging.move(createEvent({ x: 50, y: 50 }));

      expect(canvas.hasMarker(rootShape, 'drop-not-ok')).to.be.true;
    }));


    it('should add "attach-ok" marker', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var hostGfx = elementRegistry.getGraphics('childShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), attacher);

      dragging.move(createEvent({ x: 150, y: 350 }));
      dragging.hover({ element: childShape, gfx: hostGfx });
      dragging.move(createEvent({ x: 200, y: 350 }));

      expect(canvas.hasMarker(childShape, 'attach-ok')).to.be.true;
    }));


    it('should remove markers', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), attacher);

      dragging.move(createEvent({ x: 200, y: 50 }));
      dragging.hover({ element: parentShape, gfx: targetGfx});
      dragging.move(createEvent({ x: 200, y: 225 }));

      var hasMarker = canvas.hasMarker(parentShape, 'drop-ok');

      dragging.end();

      expect(canvas.hasMarker(parentShape, 'drop-ok')).to.be.false;
      expect(canvas.hasMarker(parentShape, 'drop-ok')).to.not.eql(hasMarker);
    }));

  });

});
