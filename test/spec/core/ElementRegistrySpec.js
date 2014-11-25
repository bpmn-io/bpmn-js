var TestHelper = require('../../TestHelper');

/* global bootstrapDiagram, inject */


describe('ElementRegistry', function() {

  beforeEach(bootstrapDiagram());

  beforeEach(inject(function(canvas) {

    canvas.addShape({ id: '1', type: 'FOOO', x: 10, y: 20, width: 40, height: 40 });
    canvas.addShape({ id: '2', type: 'BAR', x: 100, y: 200, width: 40, height: 40 });
  }));


  describe('add', function() {

    it('should wire element', inject(function(elementRegistry, canvas) {

      // when
      canvas.addShape({ id: '3', type: 'XXX', x: 300, y: 300, width: 50, height: 50 });

      // then
      var shape = elementRegistry.get('3'),
          gfx = elementRegistry.getGraphics(shape);

      expect(shape).toBeDefined();
      expect(gfx).toBeDefined();
    }));

  });


  describe('remove', function() {

    it('should wire element', inject(function(elementRegistry, canvas) {

      // when
      canvas.removeShape('1');

      // then
      var shape = elementRegistry.get('1'),
          gfx = elementRegistry.getGraphics('1');

      expect(shape).not.toBeDefined();
      expect(gfx).not.toBeDefined();
    }));

  });


  describe('getGraphics', function() {

    it('should get by id', inject(function(elementRegistry) {

      // when
      var gfx = elementRegistry.getGraphics('1');

      // then
      expect(gfx).toBeDefined();
    }));

  });


  describe('get', function() {

    it('should get by id', inject(function(elementRegistry) {

      // when
      var shape = elementRegistry.get('1');

      // then
      expect(shape).toBeDefined();
      expect(shape.id).toEqual('1');
    }));


    it('should get by graphics', inject(function(elementRegistry) {

      // given
      var gfx = elementRegistry.getGraphics('1');

      // when
      var shape = elementRegistry.get(gfx);

      // then
      expect(shape).toBeDefined();
      expect(shape.id).toEqual('1');
    }));

  });


  describe('filter', function() {

    it('should noop, returning all', inject(function(elementRegistry) {

      // when
      var elements = elementRegistry.filter(function(element, gfx) {

        // assume we get element and gfx as params
        expect(element).toBeDefined();
        expect(gfx).toBeDefined();

        return true;
      });

      // then
      // two shapes + root
      expect(elements.length).toBe(3);
    }));


    it('should filtered', inject(function(elementRegistry) {

      // when
      var elements = elementRegistry.filter(function(s, gfx) {
        return s.type === 'FOOO';
      });

      // then
      expect(elements.length).toBe(1);
      expect(elements[0].type).toBe('FOOO');
    }));

  });

});