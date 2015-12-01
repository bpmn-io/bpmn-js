'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var selectionModule = require('../../../../lib/features/selection');


describe('features/outline/Outline', function() {

  beforeEach(bootstrapDiagram({ modules: [ selectionModule ] }));

  describe('select', function() {

    it('should add outline to shape', inject(function(selection, canvas, elementRegistry) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      selection.select(shape);

      // then
      var gfx = elementRegistry.getGraphics(shape);
      var outline = gfx.select('.djs-outline');


      expect(outline).to.exist; // OUTLINE EXISTS
      expect(gfx.hasClass('selected')).to.be.true; // Outline class is set
    }));

    it('should add outline to connection', inject(function(selection, canvas, elementRegistry) {

      // given
      var connection = canvas.addConnection({ id: 'select1', waypoints: [ { x: 25, y: 25 }, {x: 115, y: 115} ]});

      // when
      selection.select(connection);

      // then
      var gfx = elementRegistry.getGraphics(connection);
      var outline = gfx.select('.djs-outline');

      expect(outline).to.exist; // OUTLINE EXISTS
      expect(gfx.hasClass('selected')).to.be.true; // Outline class is set
    }));

  });

  describe('deselect', function() {

    it('should remove outline class from shape', inject(function(selection, canvas, elementRegistry) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      selection.select(shape);
      selection.deselect(shape);

      // then
      var gfx = elementRegistry.getGraphics(shape);
      var outline = gfx.select('.djs-outline');

      expect(outline).to.exist; // OUTLINE box is not removed
      expect(gfx.hasClass('selected')).to.be.false; // Outline class is not set
    }));

    it('should remove outline class from connection', inject(function(selection, canvas, elementRegistry) {

      // given
      var connection = canvas.addConnection({ id: 'select3', waypoints: [ { x: 25, y: 25 }, {x: 115, y: 115} ]});

      // when
      selection.select(connection);
      selection.deselect(connection);

      // then
      var gfx = elementRegistry.getGraphics(connection);
      var outline = gfx.select('.djs-outline');

      expect(outline).to.exist; // OUTLINE box is not removed
      expect(gfx.hasClass('selected')).to.be.false; // Outline class is not set
    }));
  });

});
