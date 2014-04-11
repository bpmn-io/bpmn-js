
var Events = require('../../../lib/core/EventBus');
var TestHelper = require('../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;

var createSpy = jasmine.createSpy;

describe('Canvas', function() {

  var container;

  var defaultBootstrap = bootstrapDiagram(function() {
    container = document.createElement('div');
    document.body.appendChild(container);

    return {
      canvas: {
        container: container
      }
    };
  }, {});


  describe('initialize', function() {

    beforeEach(defaultBootstrap);

    it('should create <svg> element', inject(function() {

      // then
      var svg = container.querySelector('svg');

      expect(svg).not.toEqual(null);
    }));

  });


  describe('destroy', function() {

    beforeEach(defaultBootstrap);

    it('should remove created elements', inject(function(eventBus) {

      // when
      eventBus.fire('diagram.destroy');

      // then
      expect(container.childNodes.length).toBe(0);

      console.log(container.childNodes[0]);
    }));

  });


  describe('addShape', function() {

    beforeEach(defaultBootstrap);

    it('should fire <shape.added> event', inject(function(canvas, eventBus) {

      // given
      var listener = createSpy('listener');
      eventBus.on('shape.added', listener);

      // when
      canvas.addShape({ id: 'a', x: 10, y: 20 });

      // then
      expect(listener).toHaveBeenCalled();
    }));


    it('should fail when shape#id is not set', inject(function(canvas) {

      // given
      var s = { x: 10, y: 20};

      expect(function() {

        // when
        canvas.addShape(s);

        fail('expected exception');
      }).toThrowError('shape must have an id');
    }));


    it('should fail when adding shape#id twice', inject(function(canvas) {

      // given
      var s = { id: 'FOO', x: 10, y: 10 };

      expect(function() {
        // when
        canvas.addShape(s);
        canvas.addShape(s);

        fail('expected exception');
      }).toThrowError('shape with id FOO already added');
    }));


    it('should undo add of shape', inject(function(canvas, commandStack, elementRegistry) {

      // given
      var s1 = { id: 's1', x: 10, y: 20 };
      var s2 = { id: 's2', x: 10, y: 20, parent: s1 };
      var s3 = { id: 's3', x: 10, y: 20, parent: s1 };

      canvas
        .addShape(s1)
        .addShape(s2)
        .addShape(s3);

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(elementRegistry.getShapeById('s2')).not.toBeDefined();
      expect(elementRegistry.getShapeById('s3')).not.toBeDefined();
    }));


    it('should redo add of shape', inject(function(canvas, commandStack, elementRegistry) {

      // given
      var s1 = { id: 's1', x: 10, y: 20 };
      var s2 = { id: 's2', x: 10, y: 20, parent: s1 };
      var s3 = { id: 's3', x: 10, y: 20, parent: s1 };

      canvas
        .addShape(s1)
        .addShape(s2)
        .addShape(s3);

      // when
      commandStack.undo();
      commandStack.undo();
      commandStack.redo();
      commandStack.undo();
      commandStack.redo();
      commandStack.redo();

      // then
      expect(elementRegistry.getShapeById('s2')).toEqual(s2);
      expect(elementRegistry.getShapeById('s3')).toEqual(s3);

      expect(s2.parent).toEqual(s1);
      expect(s3.parent).toEqual(s1);
    }));

  });

  
  describe('viewbox', function() {

    beforeEach(bootstrapDiagram({ canvas: { width: 300, height: 300 } }));


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
          inner: { width: 300, height: 300 },
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
          inner: { width: 600, height: 600 },
          outer: { width: 300, height: 300 }
        });
      }));
    });


    describe('setter', function() {

      it('should set new viewbox', inject(function(canvas) {

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
          inner: { width: 300, height: 300 },
          outer: { width: 300, height: 300 }
        });
      }));

    });
  });


  describe('scroll', function() {

    beforeEach(bootstrapDiagram({ canvas: { width: 300, height: 300 } }));


    describe('getter', function() {

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

    });
  
  });


  describe('zoom', function() {

    beforeEach(bootstrapDiagram({ canvas: { width: 300, height: 300 } }));


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


      it('should zoom fit-viewport', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).toEqual(0.5);

        expect(viewbox).toEqual({
          x: 0, y: 0,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 600 },
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
            inner: { width: 300, height: 300 },
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
            inner: { width: 300, height: 300 },
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
            inner: { width: 300, height: 300 },
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
            inner: { width: 300, height: 300 },
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
            inner: { width: 300, height: 300 },
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
            inner: { width: 300, height: 300 },
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

});