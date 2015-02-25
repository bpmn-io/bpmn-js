'use strict';

var TestHelper = require('../../TestHelper');

/* global bootstrapDiagram, inject */


var merge = require('lodash/object/merge');

var createSpy = jasmine.createSpy;

var Matchers = require('../../Matchers');


describe('Canvas', function() {

  beforeEach(Matchers.addDeepEquals);

  var container;

  /**
   * Create a diagram with the given options
   */
  function createDiagram(options) {

    return bootstrapDiagram(function() {
      container = jasmine.getEnv().getTestContainer();
      return merge({ canvas: { container: container } }, options);
    }, {});
  }

  describe('initialize', function() {

    beforeEach(createDiagram());

    it('should create <svg> element', inject(function() {

      // then
      var svg = container.querySelector('svg');

      expect(svg).not.toEqual(null);
    }));

  });


  describe('destroy', function() {

    beforeEach(createDiagram());

    it('should remove created elements', inject(function(eventBus) {

      // when
      eventBus.fire('diagram.destroy');

      // then
      expect(container.childNodes.length).toBe(0);
    }));

  });


  describe('#addShape', function() {

    beforeEach(createDiagram());


    it('should fire <shape.add> event', inject(function(canvas, eventBus) {

      // given
      var listener = createSpy('listener');
      eventBus.on('shape.add', listener);

      // when
      canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });

      // then
      expect(listener).toHaveBeenCalled();
    }));


    it('should fire <shape.added> event', inject(function(canvas, eventBus) {

      // given
      var listener = createSpy('listener');
      eventBus.on('shape.added', listener);

      // when
      canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });

      // then
      expect(listener).toHaveBeenCalled();
    }));


    it('should add shape to registry', inject(function(canvas, elementRegistry) {

      var shape = { id: 'a', x: 10, y: 20, width: 50, height: 50 };

      // when
      canvas.addShape(shape);

      // then
      expect(elementRegistry.get('a')).toBe(shape);
    }));


    it('should fail when shape#id is not set', inject(function(canvas) {

      // given
      var s = { x: 10, y: 20, width: 50, height: 50 };

      expect(function() {

        // when
        canvas.addShape(s);

        fail('expected exception');
      }).toThrowError('element must have an id');
    }));


    it('should fail when adding shape#id twice', inject(function(canvas, elementRegistry) {

      // given
      var s = { id: 'FOO', x: 10, y: 10, width: 50, height: 50 };

      expect(function() {
        // when
        canvas.addShape(s);
        canvas.addShape(s);

        fail('expected exception');
      }).toThrowError('element with id FOO already exists');

    }));


    it('should add element hidden', inject(function(canvas, elementRegistry) {

      // given
      var shape = { id: 'FOO', x: 10, y: 10, width: 50, height: 50, hidden: true };

      // when
      canvas.addShape(shape);

      var gfx = elementRegistry.getGraphics(shape);

      // then
      expect(gfx.attr('display')).toBe('none');
    }));


    it('should wire parent child relationship', inject(function(elementFactory, canvas) {

      // given
      var parentShape = elementFactory.createShape({
        id: 'parent',
        x: 100, y: 100, width: 300, height: 300
      });

      var childShape = elementFactory.createShape({
        id: 'child',
        x: 110, y: 110, width: 100, height: 100
      });

      // when
      canvas.addShape(parentShape);
      canvas.addShape(childShape, parentShape);

      // then
      expect(parentShape.children).toEqual([ childShape ]);
      expect(childShape.parent).toBe(parentShape);
    }));

  });


  describe('#removeShape', function() {

    beforeEach(createDiagram());


    it('should fire <shape.removed> event', inject(function(canvas, eventBus, elementRegistry) {

      // given
      var listener = createSpy('listener');
      eventBus.on('shape.removed', listener);

      canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });

      // when
      var shape = canvas.removeShape('a');

      // then
      expect(shape.parent).toBeFalsy();
      expect(elementRegistry.get('a')).not.toBeDefined();

      expect(listener).toHaveBeenCalled();
    }));


    it('should remove shape from registry', inject(function(canvas, elementRegistry) {

      // given
      canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });

      // when
      canvas.removeShape('a');

      // then
      expect(elementRegistry.get('a')).toBeFalsy();
    }));


    it('should unwire parent child relationship', inject(function(elementFactory, canvas) {

      // given
      var parentShape = elementFactory.createShape({
        id: 'parent',
        x: 100, y: 100, width: 300, height: 300
      });

      var childShape = elementFactory.createShape({
        id: 'child',
        x: 110, y: 110, width: 100, height: 100
      });

      canvas.addShape(parentShape);
      canvas.addShape(childShape, parentShape);

      // when
      canvas.removeShape(childShape);

      // then
      expect(parentShape.children).toEqual([]);
      expect(childShape.parent).toBe(null);
    }));

  });


  describe('#addConnection', function() {

    beforeEach(createDiagram());


    it('should fire <connection.added> event', inject(function(canvas, eventBus) {

      // given
      var listener = createSpy('listener');

      canvas.addShape({ id: 's1', x: 10, y: 10, width: 30, height: 30 });
      canvas.addShape({ id: 's2', x: 100, y: 100, width: 30, height: 30 });

      eventBus.on('connection.added', listener);

      // when
      canvas.addConnection({ id: 'c1', waypoints: [ { x: 25, y: 25 }, {x: 115, y: 115} ]});

      // then
      expect(listener).toHaveBeenCalled();
    }));

  });


  describe('#removeConnection', function() {

    beforeEach(createDiagram());


    it('should fire <connection.removed> event', inject(function(canvas, eventBus, elementRegistry) {

      // given
      var listener = createSpy('listener');

      canvas.addShape({ id: 's1', x: 10, y: 10, width: 30, height: 30 });
      canvas.addShape({ id: 's2', x: 100, y: 100, width: 30, height: 30 });

      eventBus.on('connection.removed', listener);

      canvas.addConnection({ id: 'c1', waypoints: [ { x: 25, y: 25 }, {x: 115, y: 115} ]});

      // when
      var connection = canvas.removeConnection('c1');

      // then
      expect(connection.parent).toBeFalsy();
      expect(elementRegistry.get('c1')).not.toBeDefined();

      expect(listener).toHaveBeenCalled();
    }));

  });


  describe('root element(s)', function() {

    beforeEach(createDiagram());


    it('should always return root element', inject(function(canvas) {
      // when
      // accessing root element for the first time
      expect(canvas.getRootElement()).toBeDefined();

      // expect
      // the canvas to be correctly wired
      expect(canvas._svg.attr('data-element-id')).toBe('__implicitroot');
    }));


    it('should have implicit root element', inject(function(canvas) {

      // when
      var a = canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });
      var root = canvas.getRootElement();

      // then
      expect(a.parent).toBe(root);
    }));


    it('should allow setting root element', inject(function(canvas, elementRegistry) {

      var rootElement = { id: 'XXXX' };

      // when
      var setRootElement = canvas.setRootElement(rootElement);

      // then
      expect(canvas.getRootElement()).toBe(rootElement);

      // new root element is registered
      expect(elementRegistry.get('XXXX')).toBeDefined();
      expect(elementRegistry.getGraphics('XXXX')).toBe(canvas.getDefaultLayer());

      // root element is returned from setter?
      expect(setRootElement).toBe(rootElement);
    }));


    it('should only update root element with override flag', inject(function(canvas) {

      var rootElement = { id: 'oldRoot' },
          newRootElement = { id: 'newRoot' };

      // when
      canvas.setRootElement(rootElement);

      // then
      expect(function() {
        canvas.setRootElement(newRootElement);
      }).toThrow();

      // but when
      canvas.setRootElement(newRootElement, true);

      // then
      expect(canvas.getRootElement()).toBe(newRootElement);
    }));


    it('should use explicitly defined root element', inject(function(canvas, elementRegistry) {

      // given
      var rootElement = canvas.setRootElement({ id: 'XXXX' });

      // when
      var shape = canvas.addShape({ id: 'child', width: 100, height: 100, x: 10, y: 10 }, elementRegistry.get('XXXX'));

      // then
      expect(shape.parent).toBe(rootElement);
    }));

  });


  describe('update behavior', function() {

    beforeEach(createDiagram());

    var a, b, c;

    beforeEach(inject(function(canvas) {
      a = canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });
      b = canvas.addShape({ id: 'b', x: 20, y: 30, width: 50, height: 50 });
      c = canvas.addShape({ id: 'c', x: 30, y: 40, width: 50, height: 50 });
    }));

    it('should update shape z-index', inject(function(canvas, eventBus) {

      // when

      // then
    }));

  });


  describe('viewbox', function() {

    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));


    describe('getter', function() {

      it('should provide default viewbox', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        // when
        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).toEqual({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1.0,
          inner: { width: 300, height: 300, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));

      it('should provide default viewbox / overflowing diagram', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).toEqual({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1.0,
          inner: { width: 600, height: 600, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should provide default viewbox / offset element', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 50, y: 100, width: 150, height: 100 });

        // when
        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).toEqual({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1.0,
          inner: { width: 150, height: 100, x: 50, y: 100 },
          outer: { width: 300, height: 300 }
        });
      }));

    });


    describe('setter', function() {

      it('should set viewbox', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = { x: 100, y: 100, width: 600, height: 600 };

        // when
        canvas.viewbox(viewbox);

        var changedViewbox = canvas.viewbox();

        // then
        expect(changedViewbox).toEqual({
          x: 100, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 300, height: 300, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should set viewbox to origin', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 100, y: 100, width: 200, height: 200 });

        var viewbox = { x: 100, y: 100, width: 300, height: 300 };

        // when
        canvas.viewbox(viewbox);

        var changedViewbox = canvas.viewbox();

        // then
        expect(changedViewbox).toEqual({
          x: 100, y: 100,
          width: 300, height: 300,
          scale: 1,
          inner: { width: 200, height: 200, x: 100, y: 100 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should set viewbox / negative coordinates', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: -50, y: -50, width: 600, height: 600 });

        // when
        // set viewbox to inner viewbox
        canvas.viewbox(canvas.viewbox().inner);

        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).toEqual({
          x: -50, y: -50,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 600, x: -50, y: -50 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should set viewbox / overflow', inject(function(canvas, eventBus) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 1200, height: 1200 });

        var viewbox = { x: 100, y: 100, width: 600, height: 600 };

        // when
        canvas.viewbox(viewbox);

        // then
        var changedViewbox = canvas.viewbox();

        expect(changedViewbox).toEqual({
          x: 100, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 1200, height: 1200, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should set viewbox / zoomed in', inject(function(canvas, eventBus) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = { x: 50, y: 50, width: 200, height: 200 };

        // when
        canvas.viewbox(viewbox);

        // then
        var changedViewbox = canvas.viewbox();

        expect(changedViewbox).toEqual({
          x: 50, y: 50,
          width: 200, height: 200,
          scale: 1.5,
          inner: { width: 300, height: 300, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should fire <canvas.viewbox.changed> event', inject(function(canvas, eventBus) {

        var changedListener = createSpy('listener');
        eventBus.on('canvas.viewbox.changed', changedListener);

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = { x: 100, y: 100, width: 600, height: 600 };

        // when
        canvas.viewbox(viewbox);

        // then
        var calls = changedListener.calls;

        expect(calls.count()).toEqual(1);
        expect(calls.argsFor(0)[0].viewbox).toEqual({
          x: 100, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 300, height: 300, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });

      }));

    });

  });


  describe('scroll', function() {

    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));


    describe('setter', function() {

      it('should scroll x/y', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = canvas.viewbox();

        // when
        var newScroll = canvas.scroll({ dx: 50, dy: 100 });

        // then
        expect(newScroll.x).toBe(viewbox.x + 50);
        expect(newScroll.y).toBe(viewbox.y + 100);

      }));


      it('should fire <canvas.viewbox.changed>', inject(function(eventBus, canvas) {

        var changedListener = createSpy('listener');
        eventBus.on('canvas.viewbox.changed', changedListener);

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = canvas.viewbox();

        // when
        canvas.scroll({ dx: 50, dy: 100 });

        // then
        var calls = changedListener.calls;

        expect(calls.count()).toEqual(1);

        // expect { viewbox } event
        var newViewbox = calls.argsFor(0)[0].viewbox;

        expect(newViewbox.x).toEqual(viewbox.x - 50);
        expect(newViewbox.y).toEqual(viewbox.y - 100);

      }));

    });


    describe('getter', function() {

      it('should get scroll', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = canvas.viewbox();

        // when
        canvas.scroll({ dx: 50, dy: 100 });

        var newScroll = canvas.scroll();

        // then
        expect(newScroll.x).toBe(viewbox.x + 50);
        expect(newScroll.y).toBe(viewbox.y + 100);

      }));

    });

  });


  describe('zoom', function() {

    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));


    describe('getter', function() {

      it('should return 1.0 / without zoom', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        // when
        var zoom = canvas.zoom();

        // then
        expect(zoom).toEqual(1.0);
      }));


      it('should return 1.0 / without zoom / with overflow', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        var zoom = canvas.zoom();

        // then
        expect(zoom).toEqual(1.0);
      }));


      it('should return new scale after zoom', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        canvas.zoom(0.5);
        var zoom = canvas.zoom();

        // then
        expect(zoom).toEqual(0.5);
      }));

    });


    describe('setter', function() {

      it('should return new scale', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        // when
        var zoom = canvas.zoom(0.5);

        // then
        expect(zoom).toEqual(0.5);
      }));


      it('should zoom fit-viewport (horizontally)', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 50, y: 100, width: 600, height: 200 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).toEqual(0.5);

        expect(viewbox).toEqual({
          x: 50, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 200, x: 50, y: 100 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should zoom fit-viewport (vertically)', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 50, y: 100, width: 250, height: 600 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).toEqual(0.5);

        expect(viewbox).toEqual({
          x: 50, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 250, height: 600, x: 50, y: 100 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should zoom fit-viewport / scroll into view', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // scroll somewhere to change viewbox (x, y)
        canvas.zoom(2.0, { x: 200, y: 200 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).toEqual(0.5);

        expect(viewbox).toEqual({
          x: 0, y: 0,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 600, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should zoom fit-viewport, negative coordinates', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: -50, y: -50, width: 600, height: 600 });

        // when
        canvas.zoom('fit-viewport');

        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).toEqual({
          x: -50, y: -50,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 600, x: -50, y: -50 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should zoom 1.0', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        var originalViewbox = canvas.viewbox();

        // when
        canvas.zoom('fit-viewport');
        canvas.zoom(1.0);

        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).toEqual(originalViewbox);
      }));


      describe('reposition', function() {

        it('should zoom out (center)', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          // when
          var zoom = canvas.zoom(0.5, { x: 150, y: 150 });
          var viewbox = canvas.viewbox();

          // then
          expect(zoom).toEqual(0.5);

          expect(viewbox).toEqual({
            x: -150, y: -150,
            width: 600, height: 600,
            scale: 0.5,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));


        it('should zoom out (1/3)', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          // when
          var zoom = canvas.zoom(0.5, { x: 100, y: 100 });
          var viewbox = canvas.viewbox();

          // then
          expect(zoom).toEqual(0.5);

          expect(viewbox).toEqual({
            x: -100, y: -100,
            width: 600, height: 600,
            scale: 0.5,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));


        it('should zoom out / zoomed in', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          canvas.viewbox({ x: 50, y: 50, width: 200, height: 200 });

          // when
          var zoom = canvas.zoom(0.5, { x: 150, y: 150 });
          var viewbox = canvas.viewbox();

          expect(zoom).toEqual(0.5);

          // then
          expect(viewbox).toEqual({
            x: -150,
            y: -150,
            width: 600,
            height: 600,
            scale: 0.5,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));


        it('should zoom in (center)', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          // when
          var zoom = canvas.zoom(2.0, { x: 150, y: 150 });
          var viewbox = canvas.viewbox();

          expect(zoom).toEqual(2.0);

          // then
          expect(viewbox).toEqual({
            x: 75,
            y: 75,
            width: 150,
            height: 150,
            scale: 2.0,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));


        it('should zoom in (1/3)', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          // when
          var zoom = canvas.zoom(2.0, { x: 100, y: 150 });
          var viewbox = canvas.viewbox();

          expect(zoom).toEqual(2.0);

          // then
          expect(viewbox).toEqual({
            x: 50,
            y: 75,
            width: 150,
            height: 150,
            scale: 2.0,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));

        it('should zoom in (2/3)', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          // when
          var zoom = canvas.zoom(2.0, { x: 150, y: 200 });
          var viewbox = canvas.viewbox();

          expect(zoom).toEqual(2.0);

          // then
          expect(viewbox).toEqual({
            x: 75,
            y: 100,
            width: 150,
            height: 150,
            scale: 2.0,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));


        it('should zoom with auto positioning in / out', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

          // when
          canvas.zoom(2.0, 'auto');
          canvas.zoom(0.3, 'auto');
          canvas.zoom(1.5, 'auto');
          canvas.zoom(1.8, 'auto');
          canvas.zoom(0.5, 'auto');

          var viewbox = canvas.viewbox();

          // then
          expect(viewbox.x).toEqual(-150);
          expect(viewbox.y).toEqual(-150);
        }));

      });

    });

  });


  describe('#getAbsoluteBBox', function() {

    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));


    it('should return abs position (default zoom)', inject(function(canvas) {

      // given
      var shape = { id: 's0', x: 10, y: 20, width: 300, height: 200 };
      canvas.addShape(shape);

      // when
      var bbox = canvas.getAbsoluteBBox(shape);

      // then
      expect(bbox).toDeepEqual({ x: 10, y: 20, width: 300, height: 200 });
    }));


    it('should return abs position (moved)', inject(function(canvas) {

      // given
      var shape = { id: 's0', x: 10, y: 20, width: 300, height: 200 };
      canvas.addShape(shape);

      canvas.viewbox({ x: 50, y: 50, width: 300, height: 300 });

      // when
      var bbox = canvas.getAbsoluteBBox(shape);

      // then
      expect(bbox).toDeepEqual({ x: -40, y: -30, width: 300, height: 200 });
    }));


    it('should return abs position (zoomed in)', inject(function(canvas) {

      // given
      var shape = { id: 's0', x: 10, y: 20, width: 300, height: 200 };
      canvas.addShape(shape);

      canvas.viewbox({ x: 50, y: 50, width: 600, height: 600 });

      // when
      var bbox = canvas.getAbsoluteBBox(shape);

      // then
      expect(bbox).toDeepEqual({ x: -20, y: -15, width: 150, height: 100 });
    }));


    it('should return abs position (zoomed in)', inject(function(canvas) {

      // given
      var shape = { id: 's0', x: 10, y: 20, width: 300, height: 200 };
      canvas.addShape(shape);

      canvas.viewbox({ x: 50, y: 50, width: 150, height: 150 });

      // when
      var bbox = canvas.getAbsoluteBBox(shape);

      // then
      expect(bbox).toDeepEqual({ x: -80, y: -60, width: 600, height: 400 });
    }));

  });

});