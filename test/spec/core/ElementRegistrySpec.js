'use strict';

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

      expect(shape).to.exist;
      expect(gfx).to.exist;
    }));

  });


  describe('remove', function() {

    it('should wire element', inject(function(elementRegistry, canvas) {

      // when
      canvas.removeShape('1');

      // then
      var shape = elementRegistry.get('1'),
          gfx = elementRegistry.getGraphics('1');

      expect(shape).not.to.exist;
      expect(gfx).not.to.exist;
    }));

  });


  describe('updateId', function() {

    it('should update id', inject(function(elementRegistry, canvas) {

      // given
      var oldId = '1',
          newId = '56';

      var shape = elementRegistry.get(oldId);

      // when
      elementRegistry.updateId(shape, newId);

      // then
      var shapeByOldId = elementRegistry.get(oldId),
          gfxByOldId = elementRegistry.getGraphics(oldId);

      var shapeByNewId = elementRegistry.get(newId),
          gfxByNewId = elementRegistry.getGraphics(newId);

      expect(shapeByOldId).not.to.exist;
      expect(gfxByOldId).not.to.exist;

      expect(shapeByNewId).to.exist;
      expect(gfxByNewId).to.exist;
    }));


    it('should update by id', inject(function(elementRegistry, canvas) {

      // given
      var oldId = '1',
          newId = '56';

      elementRegistry.updateId(oldId, newId);

      // then
      var shapeByOldId = elementRegistry.get(oldId),
          gfxByOldId = elementRegistry.getGraphics(oldId);

      var shapeByNewId = elementRegistry.get(newId),
          gfxByNewId = elementRegistry.getGraphics(newId);

      expect(shapeByOldId).not.to.exist;
      expect(gfxByOldId).not.to.exist;

      expect(shapeByNewId).to.exist;
      expect(gfxByNewId).to.exist;
    }));

  });


  describe('getGraphics', function() {

    it('should get by id', inject(function(elementRegistry) {

      // when
      var gfx = elementRegistry.getGraphics('1');

      // then
      expect(gfx).to.exist;
    }));


    it('should get secondary by element', inject(function(elementRegistry, canvas) {

      // when
      var secondaryGfx = elementRegistry.getGraphics(canvas.getRootElement(), true);

      // then
      expect(secondaryGfx).to.exist;
    }));

  });


  describe('get', function() {

    it('should get by id', inject(function(elementRegistry) {

      // when
      var shape = elementRegistry.get('1');

      // then
      expect(shape).to.exist;
      expect(shape.id).to.equal('1');
    }));


    it('should get by graphics', inject(function(elementRegistry) {

      // given
      var gfx = elementRegistry.getGraphics('1');

      // when
      var shape = elementRegistry.get(gfx);

      // then
      expect(shape).to.exist;
      expect(shape.id).to.equal('1');
    }));

  });


  describe('getAll', function() {

    it('should return all', inject(function(elementRegistry) {

      // when
      var elements = elementRegistry.getAll();

      // then
      // two shapes + root
      expect(elements.length).to.equal(3);
    }));

  });


  describe('filter', function() {

    it('should noop, returning all', inject(function(elementRegistry) {

      // when
      var elements = elementRegistry.filter(function(element, gfx) {

        // assume we get element and gfx as params
        expect(element).to.exist;
        expect(gfx).to.exist;

        return true;
      });

      // then
      // two shapes + root
      expect(elements.length).to.equal(3);
    }));


    it('should filtered', inject(function(elementRegistry) {

      // when
      var elements = elementRegistry.filter(function(s, gfx) {
        return s.type === 'FOOO';
      });

      // then
      expect(elements.length).to.equal(1);
      expect(elements[0].type).to.equal('FOOO');
    }));

  });

  describe('forEach', function() {

    it('should iterate over all', inject(function(elementRegistry) {

      // when
      var elements = [];

      elementRegistry.forEach(function(element, gfx) {
        elements.push(element);
        // assume we get element and gfx as params
        expect(element).to.exist;
        expect(gfx).to.exist;
      });

      // then
      // two shapes + root
      expect(elements.length).to.equal(3);
    }));

  });

});
