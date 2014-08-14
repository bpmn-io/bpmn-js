'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var _ = require('lodash'),
    $ = require('jquery');


var overlayModule = require('../../../../lib/features/overlays');


function asMatrix(transformStr) {
  if (!transformStr || transformStr !== 'none') {
    var m = transformStr.match(/[+-]?\d*[.]?\d+(?=,|\))/g);

    return {
     a: parseFloat(m[0]),
     b: parseFloat(m[1]),
     c: parseFloat(m[2]),
     d: parseFloat(m[3]),
     e: parseFloat(m[4]),
     f: parseFloat(m[5])
    };
  }
}

function highlight(element) {
  return $(element).css({ background: 'fuchsia', minWidth: 10, minHeight: 10 });
}


function createOverlay() {
  return highlight('<div>TEST<br/>TEST</div>').css({ width: 40, height: 40 });
}


describe('features/overlays', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('overlay to be defined', inject(function(overlays) {
      expect(overlays).toBeDefined();
      expect(overlays.get).toBeDefined();
      expect(overlays.add).toBeDefined();
      expect(overlays.remove).toBeDefined();
    }));
  });


  describe('#add', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('should add <div>', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay" id="html-ov"></div>'
      });

      // then
      expect(id).toBeDefined();
      expect(overlays.get(id)).toBeDefined();
      expect(document.getElementById('html-ov')).toBeDefined();
    }));


    it('should add jquery overlay', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: highlight($('<div id="html-jq" class="overlay" />'))
      });

      // then
      expect(overlays.get(id)).toBeDefined();
      expect(document.getElementById('html-jq')).toBeDefined();
    }));


    it('should add overlay on shape (by id)', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      var id = overlays.add('test', {
        position: {
          left: 0,
          top: 0
        },
        html: highlight($('<div id="html-id" class="overlay" />'))
      });

      // then
      expect(overlays.get(id)).toBeDefined();
      expect(document.getElementById('html-id')).toBeDefined();
    }));

  });


  describe('#remove', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('should remove overlay', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: highlight('<div class="overlay" id="html-ov2"></div>')
      });

      // when
      overlays.remove(id);

      // then
      expect(overlays.get(id)).not.toBeDefined();
      expect(overlays.get({ element: shape }).length).toBe(0);

      expect(document.getElementById('html-ov2')).toEqual(null);
    }));


    it('should remove multiple by filter', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      overlays.add(shape, 'badge', {
        position: {
          left: 0,
          top: 0
        },
        html: highlight('<div class="badge">1</div>')
      });

      overlays.add(shape, 'badge', {
        position: {
          right: 0,
          top: 0
        },
        html: highlight('<div class="badge">2</div>')
      });

      // when
      overlays.remove({ element: shape, type: 'badge' });

      // then
      expect(overlays.get({ element: shape, type: 'badge' }).length).toBe(0);
      expect(overlays.get({ element: shape }).length).toBe(0);

      expect(overlays._getOverlayContainer(shape, true).html.text()).toBe('');
    }));


    it('should remove automatically on <*.remove>', inject(function(eventBus, overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay" id="html-ov1"></div>'
      });

      // when
      eventBus.fire('shape.remove', { element: shape });

      // then
      expect(overlays.get(id)).toBe(undefined);
      expect(document.getElementById('html-ov1')).toBe(null);
    }));

  });


  describe('#get', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    var shape1, shape2, overlay1, overlay2, overlay3;

    beforeEach(inject(function(canvas, overlays) {

      shape1 = canvas.addShape({
        id: 'shape1',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });

      shape2 = canvas.addShape({
        id: 'shape2',
        x: 300,
        y: 100,
        width: 50,
        height: 50
      });


      overlay1 = {
        position: {
          top: 10,
          left: 20
        },
        html: createOverlay()
      };

      overlay1.id = overlays.add(shape1, 'badge', overlay1);


      overlay2 = {
        position: {
          bottom: 50,
          right: 0
        },
        html: createOverlay()
      };

      overlay2.id = overlays.add(shape1, overlay2);

      overlay3 = {
        position: {
          top: 10,
          left: 20
        },
        html: createOverlay()
      };

      overlay3.id = overlays.add(shape2, 'badge', overlay3);
    }));


    it('should return overlays by element', inject(function(overlays) {

      // when
      var filteredOverlays = overlays.get({ element: shape1 });

      // then
      expect(filteredOverlays.length).toBe(2);
    }));


    it('should return overlays by element + type', inject(function(overlays) {

      // when
      var filteredOverlays = overlays.get({ element: shape2, type: 'badge' });

      // then
      expect(filteredOverlays.length).toBe(1);
    }));


    it('should return overlays by type', inject(function(overlays) {

      // when
      var filteredOverlays = overlays.get({ type: 'badge' });

      // then
      expect(filteredOverlays.length).toBe(2);
    }));

  });


  describe('positioning', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    var shape;

    beforeEach(inject(function(canvas) {

      shape = canvas.addShape({
        id: 'shape',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });
    }));


    function position(overlayHtml) {
      return overlayHtml.parent().position();
    }


    it('should position top left of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          left: 40,
          top: 40
        },
        html: html
      });

      // then
      expect(position(html)).toEqual({
        top: 40,
        left: 40
      });

    }));


    it('should position bottom left of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          bottom: 40,
          left: 40
        },
        html: html
      });

      // then
      expect(position(html)).toEqual({
        top: 60,
        left: 40
      });

    }));


    it('should position bottom right of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          bottom: 40,
          right: 40
        },
        html: html
      });

      // then
      expect(position(html)).toEqual({
        top: 60,
        left: 60
      });
    }));


    it('should position top right of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          top: 40,
          right: 40
        },
        html: html
      });

      // then
      expect(position(html)).toEqual({
        top: 40,
        left: 60
      });
    }));

  });


  describe('zoom behavior', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ], overlays: { deferUpdate: false }}));


    var shape;

    beforeEach(inject(function(canvas) {

      shape = canvas.addShape({
        id: 'shape',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });
    }));


    function isVisible(element) {
      return !element.parent().is(':hidden');
    }


    it('should respect default min/max show rules', inject(function(overlays, canvas) {

      // given
      var html = createOverlay();

      var id = overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 }
      });

      // when zoom in visibility range
      canvas.zoom(0.7);

      // then
      expect(isVisible(html)).toBe(true);


      // when zoom below visibility range
      canvas.zoom(0.6);

      // then
      expect(isVisible(html)).toBe(false);


      // when zoom in visibility range
      canvas.zoom(3.0);

      // then
      expect(isVisible(html)).toBe(true);


      // when zoom above visibility range
      canvas.zoom(6.0);

      // then
      expect(isVisible(html)).toBe(false);
    }));


    it('should respect overlay specific min/max rules', inject(function(overlays, canvas) {

      // given
      var html = createOverlay();

      var id = overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 },
        show: {
          minZoom: 0.3,
          maxZoom: 4
        }
      });


      // when zoom in visibility range
      canvas.zoom(0.6);

      // then
      expect(isVisible(html)).toBe(true);


      // when zoom on visibility range border
      canvas.zoom(0.3);

      // then
      expect(isVisible(html)).toBe(true);


      // when zoom below visibility range
      canvas.zoom(0.2);

      // then
      expect(isVisible(html)).toBe(false);


      // when zoom in visibility range
      canvas.zoom(3);

      // then
      expect(isVisible(html)).toBe(true);


      // when zoom on visibility range border
      canvas.zoom(4.0);

      // then
      expect(isVisible(html)).toBe(true);

      // when zoom above visibility range
      canvas.zoom(4.1);

      // then
      expect(isVisible(html)).toBe(false);
    }));

  });


  describe('scroll/zoom behavior', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ], overlays: { deferUpdate: false }}));


    var shape, overlay;

    beforeEach(inject(function(canvas, overlays) {

      shape = canvas.addShape({
        id: 'shape',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });

      overlay = {
        html: createOverlay(),
        position: {
          left: 20,
          top: 20
        }
      };

      overlay.id = overlays.add(shape, overlay);
    }));


    function transformMatrix(element) {
      return asMatrix(element.css('transform'));
    }


    it('should not be transformed initially', inject(function(overlays, canvas) {
      // given
      // diagram got newly created

      // then
      expect(transformMatrix(overlays._overlayRoot)).toBe(undefined);
    }));


    it('should transform overlay container on scroll', inject(function(overlays, canvas) {

      // when
      canvas.scroll({
        dx: 100,
        dy: 50
      });

      // then
      expect(transformMatrix(overlays._overlayRoot)).toEqual({ a : 1, b : 0, c : 0, d : 1, e : 100, f : 50 });
    }));


    it('should transform overlay container on zoom', inject(function(overlays, canvas) {

      // when
      canvas.zoom(2);

      // then
      expect(transformMatrix(overlays._overlayRoot)).toEqual({ a : 2, b : 0, c : 0, d : 2, e : 0, f : 0 });
    }));


    it('should transform overlay container on zoom (with position)', inject(function(overlays, canvas) {

      // when
      canvas.zoom(2, { x: 300, y: 300 });

      // then
      expect(transformMatrix(overlays._overlayRoot)).toEqual({ a : 2, b : 0, c : 0, d : 2, e : -300, f : -300 });
    }));

  });

});