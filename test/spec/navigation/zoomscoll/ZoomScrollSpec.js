'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var zoomScrollModule = require('../../../../lib/navigation/zoomscroll');


describe('navigation/zoomscroll', function() {

  beforeEach(bootstrapDiagram({ modules: [ zoomScrollModule ] }));


  describe('bootstrap', function() {

    it('should bootstrap', inject(function(zoomScroll, canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

      expect(zoomScroll).to.not.be.null;
    }));

  });

  describe('step zoom', function(){

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
      inject(function(zoomScroll, canvas){

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

});
