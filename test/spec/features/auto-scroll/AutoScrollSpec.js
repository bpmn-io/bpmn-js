'use strict';

require('../../../TestHelper');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject, sinon */


var dragModule = require('../../../../lib/features/dragging');
var scrollModule = require('../../../../lib/features/auto-scroll');


describe('features/auto-scroll - AutoScroll', function() {

  beforeEach(bootstrapDiagram({ modules: [ dragModule, scrollModule ] }));


  describe('scrolling canvas near borders', function() {

    var scrollStep = 33;
    var scrollThreshold = 50;
    var scrollSpy;
    var clientRect;


    beforeEach(inject(function(dragging, autoScroll, canvas) {
      // given
      autoScroll.setOptions({
        scrollThresholdIn: [
          scrollThreshold,
          scrollThreshold,
          scrollThreshold,
          scrollThreshold
        ],
        scrollThresholdOut: [ 0, 0, 0, 0 ],
        scrollRepeatTimeout: 100000,
        scrollStep: scrollStep
      });

      scrollSpy = sinon.spy(canvas, 'scroll');

      dragging.init(canvasEvent({ x: 100, y: 100 }), 'foo');

      clientRect = canvas._container.getBoundingClientRect();
    }));


    it('not scrolled when inside the border', inject(function(dragging) {
      // when
      dragging.move(canvasEvent({
        x: scrollThreshold + 1,
        y: scrollThreshold + 1
      }));

      // then
      expect(scrollSpy).to.not.be.called;
    }));


    it('stopped on cleanup', inject(function(dragging, autoScroll) {
      // given
      var stopScroll = sinon.spy(autoScroll, 'stopScroll');

      // when
      dragging.move(canvasEvent({
        x: scrollThreshold - 1,
        y: scrollThreshold - 1
      }));
      dragging.cancel();

      // then
      expect(scrollSpy).to.be.called;
      expect(stopScroll).to.be.called;
    }));


    it('left-down', inject(function(dragging, canvas) {
      // when
      dragging.move(canvasEvent({
        x: scrollThreshold - 1,
        y: (clientRect.height - scrollThreshold) + 1
      }));

      // then
      expect(scrollSpy).to.be.calledWith({ dx: scrollStep, dy: -scrollStep });
    }));


    it('left', inject(function(dragging) {
      // when
      dragging.move(canvasEvent({
        x: scrollThreshold - 1,
        y: scrollThreshold + 1
      }));

      // then
      expect(scrollSpy).to.be.calledWith({ dx: scrollStep, dy: 0 });
    }));


    it('left-up', inject(function(dragging) {
      // when
      dragging.move(canvasEvent({
        x: scrollThreshold - 1,
        y: scrollThreshold - 1
      }));

      // then
      expect(scrollSpy).to.be.calledWith({ dx: scrollStep, dy: scrollStep });
    }));


    it('up', inject(function(dragging) {
      // when
      dragging.move(canvasEvent({ x: scrollThreshold + 1, y: scrollThreshold - 1 }));

      // then
      expect(scrollSpy).to.be.calledWith({ dx: 0, dy: scrollStep });
    }));


    it('right-up', inject(function(dragging, canvas) {
      // when
      dragging.move(canvasEvent({
        x: (clientRect.width - scrollThreshold) + 1,
        y: scrollThreshold - 1
      }));

      // then
      expect(scrollSpy).to.be.calledWith({ dx: -scrollStep, dy: scrollStep });
    }));


    it('right', inject(function(dragging, canvas) {
      // when
      dragging.move(canvasEvent({
        x: (clientRect.width - scrollThreshold) + 1,
        y: scrollThreshold + 1
      }));

      // then
      expect(scrollSpy).to.be.calledWith({ dx: -scrollStep, dy: 0 });
    }));


    it('right-down', inject(function(dragging, canvas, mouseTracking) {
      // when
      dragging.move(canvasEvent({
        x: (clientRect.width - scrollThreshold) + 1,
        y: (clientRect.height - scrollThreshold) + 1
      }));

      // then
      expect(scrollSpy).to.be.calledWith({ dx: -scrollStep, dy: -scrollStep });
    }));


    it('down', inject(function(dragging, canvas, mouseTracking) {
      // when
      dragging.move(canvasEvent({
        x: scrollThreshold + 1,
        y: (clientRect.height - scrollThreshold) + 1
      }));

      // then
      expect(scrollSpy).to.be.calledWith({ dx: 0, dy: -scrollStep });
    }));

  });

});
