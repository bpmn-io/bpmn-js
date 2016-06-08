'use strict';

/* global bootstrapDiagram, inject, sinon */


var coreModule = require('../../../../lib/core'),
    draggingModule = require('../../../../lib/features/dragging'),
    modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move'),
    selectionModule = require('../../../../lib/features/selection');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;


describe('features/selection/Selections', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      coreModule,
      draggingModule,
      modelingModule,
      moveModule,
      selectionModule
    ]
  }));

  var shape1, shape2, connection1;

  beforeEach(inject(function(canvas) {

    // given
    shape1 = canvas.addShape({
      id: 'shape1',
      x: 10,
      y: 10,
      width: 100,
      height: 100
    });

    shape2 = canvas.addShape({
      id: 'shape2',
      x: 150,
      y: 10,
      width: 100,
      height: 100
    });

    connection1 = canvas.addConnection({
      id: 'connection1',
      source: 'shape1',
      target: 'shape2',
      waypoints: [ { x: 110, y: 60 }, { x: 150, y: 60 } ]
    });
  }));


  describe('bootstrap', function() {

    it('should bootstrap diagram with component', inject(function(selection) {
      expect(selection).to.exist;
    }));

  });


  describe('#select', function() {

    it('should add shape to selection', inject(function(selection) {

      // when
      selection.select(shape1);

      //then
      var selectedElements = selection.get();
      expect(selectedElements[0]).to.equal(shape1);
    }));


    it('should add connection to selection', inject(function(selection) {

      // when
      selection.select(connection1);

      //then
      var selectedElements = selection.get();
      expect(selectedElements[0]).to.equal(connection1);
    }));


    it('should add multiple elements to selection', inject(function(selection) {

      // when
      selection.select(shape2);
      selection.select(connection1, true);

      //then
      var selectedElements = selection.get();
      expect(selectedElements[0]).to.equal(shape2);
      expect(selectedElements[1]).to.equal(connection1);
    }));


    it('should select moved element if previously not in selection',
      inject(function(dragging, elementRegistry, modeling, move, selection) {

        // given
        selection.select(shape1);

        // when
        move.start(canvasEvent({
          x: shape2.x + 10 + shape2.width / 2,
          y: shape2.y + 30 + shape2.height/2
        }), shape2);

        dragging.hover({
          element: shape2,
          gfx: elementRegistry.getGraphics(shape2)
        });

        dragging.move(canvasEvent({ x: 300, y: 300 }));

        dragging.end();

        // then
        var selectedElements = selection.get();

        expect(selectedElements[0]).to.equal(shape2);
        expect(selectedElements.length).to.equal(1);
      })
    );
  });


  describe('#deselect', function() {

    it('should remove shape from selection', inject(function(selection) {
      selection.select(shape2);
      selection.select(connection1, true);

      selection.deselect(shape2);

      // then
      var selectedElements = selection.get();

      expect(selectedElements[0]).to.equal(connection1);
      expect(selectedElements.length).to.equal(1);
    }));


    it('should remove all elements from selection', inject(function(selection) {
      selection.select(shape2);
      selection.select(connection1, true);

      selection.select();

      // then
      var selectedElements = selection.get();
      expect(selectedElements.length).to.equal(0);
    }));


    it('should not fail on empty selection', inject(function(selection) {
      selection.select();

      var selectedElements = selection.get();

      // then
      expect(selectedElements.length).to.equal(0);
    }));

  });


  describe('clear', function() {

    it('should remove selection', inject(function(selection, eventBus) {

      // given
      selection.select(shape1);

      var changedSpy = sinon.spy(function() {});

      eventBus.on('selection.changed', changedSpy);

      // when
      eventBus.fire('diagram.clear');

      // then
      expect(selection._selectedElements).to.be.empty;

      expect(changedSpy).to.have.been.called;
    }));

  });

});
