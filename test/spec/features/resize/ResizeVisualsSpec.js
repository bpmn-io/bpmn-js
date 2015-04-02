'use strict';

var Events = require('../../../util/Events');

/* global bootstrapDiagram, inject */

var pick = require('lodash/object/pick');

var resizeModule = require('../../../../lib/features/resize'),
    rulesModule = require('./rules'),
    selectModule = require('../../../../lib/features/selection');


function bounds(b) {
  return pick(b, [ 'x', 'y', 'width', 'height' ]);
}

describe('features/resize - visuals', function() {

  beforeEach(bootstrapDiagram({ modules: [ resizeModule, rulesModule, selectModule ] }));


  var shape, gfx;

  beforeEach(inject(function(canvas, elementFactory, elementRegistry) {
    var s = elementFactory.createShape({
      id: 'c1',
      resizable: true, // checked by our rules
      x: 100, y: 100, width: 100, height: 100
    });

    shape = canvas.addShape(s);
    gfx = elementRegistry.getGraphics(shape);
  }));


  describe('handles', function() {

    it('should add on selection', inject(function(selection) {

      // when
      selection.select(shape);

      // then
      var resizeAnchors = gfx.selectAll('.djs-resizer');

      expect(resizeAnchors.length).to.equal(4);
    }));


    it('should remove on deselect', inject(function(selection) {

      // when
      selection.select(shape, false);
      selection.deselect(shape, false);

      // then
      var resizeAnchors = gfx.selectAll('.resize');

      expect(resizeAnchors.length).to.equal(0);
    }));


    it('should update on shape change');

  });


  describe('frame', function() {

    it('should show during resize', inject(function(canvas, resize, dragging) {

      // when
      resize.activate(Events.create(canvas._svg, { x: 0, y: 0 }), shape, 'se');
      dragging.move(Events.create(canvas._svg, { x: 20, y: 20 }));

      // then
      var frames = canvas.getDefaultLayer().selectAll('.djs-resize-overlay');

      expect(frames.length).to.equal(1);
    }));


    it('should update during resize', inject(function(canvas, resize, dragging) {

      // when
      resize.activate(Events.create(canvas._svg, { x: 0, y: 0 }), shape, 'se');
      dragging.move(Events.create(canvas._svg, { x: 20, y: 20 }));
      dragging.move(Events.create(canvas._svg, { x: 100, y: 200 }));

      // then
      var frame = canvas.getDefaultLayer().select('.djs-resize-overlay');

      var bbox = frame.getBBox();

      expect(bounds(bbox)).to.eql({
        x: 100,
        y: 100,
        width: 200,
        height: 300
      });
    }));


    it('should hide after resize', inject(function(canvas, resize, dragging) {

      // when
      resize.activate(Events.create(canvas._svg, { x: 0, y: 0 }), shape, 'se');
      dragging.move(Events.create(canvas._svg, { x: 100, y: 200 }));
      dragging.end();

      // then
      var frame = canvas.getDefaultLayer().select('.djs-resize-overlay');

      expect(frame).to.be.null;
    }));

  });


  describe('rule integration', function() {

    it('should add resize handles only if allowed', inject(function(canvas, elementFactory, elementRegistry, selection) {

      // given
      var s = elementFactory.createShape({
        id: 'c2',
        resizable: false,
        x: 300, y: 100, width: 100, height: 100
      });

      var nonResizable = canvas.addShape(s);
      var nonResizableGfx = elementRegistry.getGraphics(nonResizable);

      // when
      selection.select(nonResizable);

      // then
      var resizeAnchors = gfx.selectAll('.resize');

      expect(resizeAnchors.length).to.equal(0);
    }));


    describe('live check, rejecting', function() {

      it('should indicate resize not allowed', inject(function(canvas, resize, dragging) {

        // when resize to small
        resize.activate(Events.create(canvas._svg, { x: 0, y: 0 }), shape, 'se');
        dragging.move(Events.create(canvas._svg, { x: -99, y: -99 }));

        // then
        var frame = canvas.getDefaultLayer().select('.djs-resize-overlay');

        expect(frame.hasClass('resize-not-ok')).to.equal(true);


        // when resize big enough
        dragging.move(Events.create(canvas._svg, { x: -50, y: -50 }));

        // then
        expect(frame.hasClass('resize-not-ok')).to.equal(false);
      }));


      it('should not perform actual resize operation', inject(function(canvas, dragging, resize) {

        // when
        resize.activate(Events.create(canvas._svg, { x: 0, y: 0 }), shape, 'se');
        dragging.move(Events.create(canvas._svg, { x: -99, y: -99 }));
        dragging.end();

        // then
        // no change happened
        expect(shape.width).to.equal(100);
        expect(shape.height).to.equal(100);
      }));

    });

  });

});
