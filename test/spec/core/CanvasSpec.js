
var Events = require('../../../src/core/Events');
var TestHelper = require('../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;

var createSpy = jasmine.createSpy;

describe('Canvas', function() {

  beforeEach(bootstrapDiagram());


  describe('add shape', function() {

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

});