'use strict';

require('../../../TestHelper');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */


var assign = require('lodash/object/assign'),
    omit = require('lodash/object/omit');

var dragModule = require('../../../../lib/features/dragging');


describe('features/dragging - Dragging', function() {

  beforeEach(bootstrapDiagram({ modules: [ dragModule ] }));

  beforeEach(inject(function(canvas) {
    canvas.addShape({ id: 'shape', x: 10, y: 10, width: 50, height: 50 });
  }));


  describe('behavior', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    var recordEvents;

    beforeEach(inject(function(eventBus) {
      recordEvents = function(prefix) {
        var events = [];

        var eventTypes = [
          'start',
          'move',
          'end',
          'ended',
          'hover',
          'out',
          'cancel',
          'canceled',
          'cleanup',
          'init'
        ];

        eventTypes.forEach(function(type) {
          eventBus.on(prefix + '.' + type, function(e) {
            events.push(assign({}, e));
          });
        });

        return events;
      };
    }));


    function raw(e) {
      return omit(e, [ 'originalEvent', 'previousSelection' ]);
    }


    it('should cancel original event on init', inject(function(dragging) {

      // given
      var event = canvasEvent({ x: 10, y: 10 });

      // when
      dragging.init(event, 'foo');

      // then
      expect(event.defaultPrevented).to.be.true;
    }));


    it('should pass custom data', inject(function(dragging) {

      // given
      var events = recordEvents('foo');

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo', {
        data: { foo: 'BAR' }
      });

      // then
      expect(events.length).to.equal(1);

      expect(events).to.eql([
        { foo: 'BAR', type: 'foo.init' }
      ]);
    }));


    it('should fire life-cycle on successful drag', inject(function(dragging, canvas) {

      // given
      var events = recordEvents('foo');

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
      dragging.move(canvasEvent({ x: 30, y: 20 }));
      dragging.move(canvasEvent({ x: 5, y: 10 }));

      dragging.end();

      // then
      expect(events.map(raw)).to.eql([
        { type: 'foo.init' },
        { x: 10, y: 10, dx: 0, dy: 0, type: 'foo.start' },
        { x: 30, y: 20, dx: 20, dy: 10, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.end' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cleanup' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.ended' }
      ]);
    }));


    it('should fire life-cycle events', inject(function(dragging, canvas) {

      // given
      var events = recordEvents('foo');

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
      dragging.move(canvasEvent({ x: 30, y: 20 }));
      dragging.move(canvasEvent({ x: 5, y: 10 }));

      dragging.cancel();

      // then
      expect(events.map(raw)).to.eql([
        { type: 'foo.init' },
        { x: 10, y: 10, dx: 0, dy: 0, type: 'foo.start' },
        { x: 30, y: 20, dx: 20, dy: 10, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cancel' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cleanup' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.canceled' }
      ]);
    }));


    it('should cancel running', inject(function(dragging) {

      // given
      var events = recordEvents('foo');

      // a is active
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo', { data: { element: 'a' } });

      // when
      // activate b
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo', { data: { element: 'b' } });

      // then
      expect(events.map(raw)).to.eql([
        { element: 'a', type: 'foo.init' },
        { element: 'a', type: 'foo.cleanup' },
        { element: 'b', type: 'foo.init' }
      ]);

    }));


    describe('djs-drag-active marker', function() {

      it('should not add to root on drag start', inject(function(dragging, canvas, elementRegistry) {

        // given
        var rootElement = canvas.getRootElement(),
            rootGfx = elementRegistry.getGraphics(rootElement);

        // when
        dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');

        // then
        expect(rootGfx.hasClass('djs-drag-active')).to.be.false;

        // but when
        dragging.move(canvasEvent({ x: 30, y: 20 }));

        // then
        expect(rootGfx.hasClass('djs-drag-active')).to.be.true;
      }));


      it('should remove from root on drag end', inject(function(dragging, canvas, elementRegistry) {

        // given
        var rootElement = canvas.getRootElement(),
            rootGfx = elementRegistry.getGraphics(rootElement);

        // when
        dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
        dragging.move(canvasEvent({ x: 30, y: 20 }));
        dragging.cancel();

        // then
        expect(rootGfx.hasClass('djs-drag-active')).to.be.false;
      }));

    });


    it('should adjust positions to local point', inject(function(dragging) {

      // given
      var events = recordEvents('foo');

      // when
      dragging.init(canvasEvent({ x: 0, y: 0 }), { x: 10, y: 10 }, 'foo');
      dragging.move(canvasEvent({ x: 20, y: 10 }));
      dragging.move(canvasEvent({ x: -5, y: 0 }));

      dragging.cancel();

      // then
      expect(events.map(raw)).to.eql([
        { type: 'foo.init' },
        { x: 10, y: 10, dx: 0, dy: 0, type: 'foo.start' },
        { x: 30, y: 20, dx: 20, dy: 10, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cancel' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cleanup' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.canceled' }
      ]);
    }));


    // Related to issue bpmn-io/bpmn-js#355
    it.skip('should keep shape at cursor when zooming while creating',
    inject(function(elementFactory, zoomScroll, dragging, create) {
      // given
      var shape = elementFactory.createShape({
        id: 'shape',
        x: 0, y: 0,
        width: 50, height: 50
      });

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), shape);

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      var elementBefore = dragging.context().data.context.visual.getBBox();

      zoomScroll.stepZoom(-1.25);

      zoomScroll.stepZoom(0.25);

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      var elementAfter = dragging.context().data.context.visual.getBBox();

      expect(elementBefore).to.eql(elementAfter);
    }));

  });

});
