
var Events = require('../../../src/core/Events');
var TestHelper = require('../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;

var createSpy = jasmine.createSpy;

describe('Canvas', function() {


  describe('addShape', function() {

    beforeEach(bootstrapDiagram());

    it('should fire <shape.added> event', inject(function(canvas, events) {

      // given
      var listener = createSpy('listener');
      events.on('shape.added', listener);

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


    it('should undo add of shape', inject(function(canvas, commandStack, shapes) {

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
      expect(shapes.getShapeById('s2')).not.toBeDefined();
      expect(shapes.getShapeById('s3')).not.toBeDefined();
    }));


    it('should redo add of shape', inject(function(canvas, commandStack, shapes) {

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
      expect(shapes.getShapeById('s2')).toEqual(s2);
      expect(shapes.getShapeById('s3')).toEqual(s3);

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


  describe('scale', function() {

    beforeEach(bootstrapDiagram({ canvas: { width: 300, height: 300 } }));


    describe('getter', function() {

      it('should return 1.0 / without zoom', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        // when
        var scale = canvas.scale();

        // then
        expect(scale).toEqual(1.0);
      }));


      it('should return 1.0 / without zoom / with overflow', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        var scale = canvas.scale();

        // then
        expect(scale).toEqual(1.0);
      }));


      it('should return new scale after zoom', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        canvas.scale(0.5);
        var scale = canvas.scale();

        // then
        expect(scale).toEqual(0.5);
      }));

    });

    describe('setter', function() {

      it('should return new scale', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        // when
        var scale = canvas.scale(0.5);

        // then
        expect(scale).toEqual(0.5);
      }));


      it('should scale fit-viewport', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        var scale = canvas.scale('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(scale).toEqual(0.5);

        expect(viewbox).toEqual({
          x: 0, y: 0,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 600 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should scale 1.0', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        var originalViewbox = canvas.viewbox();

        // when
        canvas.scale('fit-viewport');
        canvas.scale(1.0);

        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).toEqual(originalViewbox);
      }));


      it('should scale zoom', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        // when
        var scale = canvas.scale(2.0, { x: 100, y: 100 });
        var viewbox = canvas.viewbox();

        // then
        expect(scale).toEqual(2.0);

        expect(viewbox).toEqual({
          x: 100, y: 100,
          width: 150, height: 150,
          scale: 2,
          inner: { width: 300, height: 300 },
          outer: { width: 300, height: 300 }
        });

      }));

    });
  });


});