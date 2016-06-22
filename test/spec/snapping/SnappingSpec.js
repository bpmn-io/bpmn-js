'use strict';

/* global bootstrapDiagram, inject */

var assign = require('lodash/object/assign');

var snappingModule = require('../../../lib/features/snapping'),
    modelingModule = require('../../../lib/features/modeling'),
    moveModule = require('../../../lib/features/move'),
    createModule = require('../../../lib/features/create');

var canvasEvent = require('../../util/MockEvents').createCanvasEvent;

var SnapContext = require('../../../lib/features/snapping/SnapContext');

var Event = require('../../../lib/core/EventBus').Event;


describe('features/snapping - Snapping', function() {

  describe('basics', function() {

    beforeEach(bootstrapDiagram({ modules: [ snappingModule ] }));


    var rootElement, shape;

    beforeEach(inject(function(canvas, elementFactory) {

      rootElement = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootElement);

      shape = canvas.addShape(elementFactory.createShape({
        id: 'shape',
        x: 100, y: 100, width: 100, height: 100
      }));


      // snap target
      canvas.addShape(elementFactory.createShape({
        id: 'snap-target',
        x: 400, y: 150, width: 50, height: 50
      }));
    }));


    describe('#initSnap', function() {

      it('should init snapContext', inject(function(snapping) {

        // given
        var event = {
          x: 100,
          y: 100,
          context: {
            shape: shape
          }
        };

        // when
        var snapContext = snapping.initSnap(event);

        // then
        expect(snapContext).to.exist;
        expect(event.context.snapContext).to.equal(snapContext);
      }));


      it('should reuse existing snapContext', inject(function(snapping) {

        // given
        var originalSnapContext = new SnapContext();

        var event = {
          x: 100,
          y: 100,
          context: {
            shape: shape,
            snapContext: originalSnapContext
          }
        };

        // when
        var snapContext = snapping.initSnap(event);

        // then
        expect(snapContext).to.equal(originalSnapContext);
      }));

    });


    describe('eventBus integration', function() {

      var startEvent;

      beforeEach(function() {
        startEvent = assign(new Event(), {
          x: 150,
          y: 150,
          context: {
            shape: shape,
            target: rootElement
          }
        });
      });


      function moveTo(startEvent, newPosition) {

        return assign(new Event(), startEvent, {
          x: newPosition.x,
          y: newPosition.y,
          dx: newPosition.x - startEvent.x,
          dy: newPosition.y - startEvent.y
        });
      }

      it('should init on shape.move.start', inject(function(eventBus) {

        // when
        eventBus.fire('shape.move.start', startEvent);

        // then
        expect(startEvent.context.snapContext).to.exist;
      }));


      it('should init on create.start', inject(function(eventBus) {

        // when
        eventBus.fire('create.start', startEvent);

        // then
        expect(startEvent.context.snapContext).to.exist;
      }));


      it('should snap on shape.move.move / horizontally', inject(function(eventBus) {

        // given
        eventBus.fire('shape.move.start', startEvent);

        // when
        var moveEvent = moveTo(startEvent, { x: 180, y: 170 });

        eventBus.fire('shape.move.move', moveEvent);

        // then
        expect(moveEvent.x).to.eql(180);
        expect(moveEvent.y).to.eql(175); // snap at (180,175)
      }));


      it('should snap on shape.move.move / vertically', inject(function(eventBus) {

        // given
        eventBus.fire('shape.move.start', startEvent);

        // when
        var moveEvent = moveTo(startEvent, { x: 420, y: 200 });

        eventBus.fire('shape.move.move', moveEvent);

        // then
        expect(moveEvent.x).to.eql(425);
        expect(moveEvent.y).to.eql(200); // snap at (425,200)
      }));


      it('should snap on shape.move.end', inject(function(eventBus) {

        // given
        eventBus.fire('shape.move.start', startEvent);

        // when
        var endEvent = moveTo(startEvent, { x: 180, y: 170 });

        eventBus.fire('shape.move.end', endEvent);

        // then
        expect(endEvent.x).to.eql(180);
        expect(endEvent.y).to.eql(175); // snap at (180,175)
      }));

    });

  });


  describe('integration', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        createModule,
        snappingModule,
        modelingModule,
        moveModule
      ]
    }));

    beforeEach(inject(function(dragging, elementRegistry) {
      dragging.setOptions({ manual: true });
    }));

    var rootElement;

    beforeEach(inject(function(canvas, elementFactory) {

      rootElement = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootElement);

      canvas.addShape(elementFactory.createShape({
        id: 'snap-target',
        x: 100, y: 100, width: 100, height: 100
      }));
    }));


    it('should snap horizontal on create', inject(function(create, dragging, elementFactory, elementRegistry) {

      // given
      var newShape = elementFactory.createShape({
        id: 'new-shape',
        x: 0, y: 0,
        width: 100, height: 100
      });

      // when
      create.start(canvasEvent({ x: 50, y: 50 }), newShape);

      dragging.hover({ element: rootElement });
      dragging.move(canvasEvent({ x: 100, y: 350 }));
      dragging.move(canvasEvent({ x: 145, y: 350 }));

      dragging.end();

      var createdShape = elementRegistry.get('new-shape');

      // then
      expect(createdShape).to.have.bounds({
        x: 100, // snapped to mid(100, _)
        y: 300,
        width: 100,
        height: 100
      });
    }));


    it('should snap vertical on create', inject(function(create, dragging, elementFactory, elementRegistry) {

      // given
      var newShape = elementFactory.createShape({
        id: 'new-shape',
        x: 0, y: 0,
        width: 100, height: 100
      });

      // when
      create.start(canvasEvent({ x: 50, y: 50 }), newShape);

      dragging.hover({ element: rootElement });
      dragging.move(canvasEvent({ x: 100, y: 145 }));
      dragging.move(canvasEvent({ x: 350, y: 145 }));

      dragging.end();

      var createdShape = elementRegistry.get('new-shape');

      // then
      expect(createdShape).to.have.bounds({
        x: 300, // snapped to mid(100, _)
        y: 100,
        width: 100,
        height: 100
      });
    }));

  });

});