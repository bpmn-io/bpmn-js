'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var zoomScrollModule = require('../../../../lib/navigation/zoomscroll');


describe('navigation/zoomscroll', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({
      modules: [ zoomScrollModule ],
      canvas: { deferUpdate: false }
    }));


    it('should bootstrap', inject(function(zoomScroll, canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

      expect(zoomScroll).to.exist;
      expect(zoomScroll._enabled).to.be.true;
    }));

  });


  describe('step zoom', function() {

    beforeEach(bootstrapDiagram({
      modules: [ zoomScrollModule ],
      canvas: { deferUpdate: false }
    }));


    it('should zoom in along fixed zoom steps', inject(function(zoomScroll, canvas){

      // when
      zoomScroll.stepZoom(1);

      // then
      expect(canvas.zoom()).to.equal(1.349);
    }));


    it('should zoom out along fixed zoom steps', inject(function(zoomScroll, canvas){

      // when
      zoomScroll.stepZoom(-1);

      // then
      expect(canvas.zoom()).to.equal(0.741);
    }));


    it('should snap to a proximate zoom step', inject(function(zoomScroll, canvas){

      // given
      // a zoom level in between two fixed zoom steps
      canvas.zoom(1.1);

      // when
      zoomScroll.stepZoom(1);

      // then
      expect(canvas.zoom()).to.equal(1.349);
    }));


    it('should snap to default zoom level (1.00) when zooming in from the minimum zoom level',
      inject(function(zoomScroll, canvas){

      // given
      // zoom to the minimun level
      canvas.zoom(0.2);

      // when
      // zoom in along fixed steps 5 times
      for(var i = 0; i < 5; i++) {
        zoomScroll.stepZoom(1);
      }

      // then
      expect(canvas.zoom()).to.equal(1);
    }));


    it('should snap to default zoom level (1.00) when zooming out from the maximum zoom level',
      inject(function(zoomScroll, canvas) {

      // given
      // zoom to the maximum level
      canvas.zoom(4);

      // when
      // zoom out along fixed steps 5 times
      for(var i = 0; i < 5; i++) {
        zoomScroll.stepZoom(-1);
      }

      // then
      expect(canvas.zoom()).to.equal(1);
    }));

  });


  describe('toggle', function() {

    beforeEach(bootstrapDiagram({
      modules: [ zoomScrollModule ],
      canvas: { deferUpdate: false },
      zoomScroll: {
        enabled: false
      }
    }));


    it('should force enable', inject(function(zoomScroll) {
      // when
      var newEnabled = zoomScroll.toggle(true);

      // then
      expect(newEnabled).to.be.true;
    }));


    it('should force disable', inject(function(zoomScroll) {
      // when
      var newEnabled = zoomScroll.toggle(false);

      // then
      expect(newEnabled).to.be.false;
    }));


    it('should toggle on', inject(function(zoomScroll) {
      // assume
      expect(zoomScroll._enabled).to.be.false;

      // when
      var newEnabled = zoomScroll.toggle();

      // then
      expect(newEnabled).to.be.true;
    }));


    it('should toggle enabled state on diagram click',
        inject(function(canvas, elementRegistry, zoomScroll) {

      // given
      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

      var rootNode = canvas.getContainer();

      // when
      rootNode.addEventListener('click', function() {
        var newState = zoomScroll.toggle();

        rootNode.style.background = newState ? 'lightgreen' : 'none';
      });

      // then
      // test manually if zoom scroll is actually toggled...
    }));

  });

});
