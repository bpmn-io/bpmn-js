'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var _ = require('lodash'),
    $ = require('jquery');


var overlayModule = require('../../../../lib/features/overlays');


describe('features/  overlays', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('overlay to be defined', inject(function(overlays) {
      expect(overlays).toBeDefined();
      expect(overlays.getOverlays).toBeDefined();
      expect(overlays.addOverlay).toBeDefined();
      expect(overlays.removeOverlay).toBeDefined();
    }));
  });


  describe('#addOverlay()', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));

    it('should add \'<div>\'', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      expect(_.size(overlays.getOverlays())).toEqual(0);
      expect(document.getElementById('html-ov')).toEqual(null);

      // when

      // add overlay to a single shape (or connection)
      var id = overlays.addOverlay(shape, {
        show: {
          minZoom: 0.5
        },
        html: '<div class="overlay" id="html-ov"></div>'
      });

      // then
      // expect overlay to be attached to shape

      expect(id).toBeDefined();
      expect(document.getElementById('html-ov')).toBeDefined();
      expect(document.getElementById('html-ov')).not.toEqual(null);
      expect(_.size(overlays.getOverlays())).toEqual(1);
    }));

    it('should add jquery HTMLNode', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });
      var div = $('<div/>', {
        class: 'overlay',
        id:    'html-jq'
      });

      expect(_.size(overlays.getOverlays())).toEqual(0);
      expect(document.getElementById('html-jq')).toEqual(null);

      // when

      // add overlay to a single shape (or connection)
      var id = overlays.addOverlay(shape, {
        show: {
          minZoom: 0.5
        },
        html: div
      });

      // then
      // expect overlay to be attached to shape

      expect(id).toBeDefined();
      expect(document.getElementById('html-jq')).toBeDefined();
      expect(document.getElementById('html-jq')).not.toEqual(null);
      expect(_.size(overlays.getOverlays())).toEqual(1);
    }));
  });

  describe('#removeOverlay()', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));

    it('should remove overlay', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test2',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      expect(_.size(overlays.getOverlays())).toEqual(0);
      var id = overlays.addOverlay(shape, {
        show: {
          minZoom: 0.5
        },
        html: '<div class="overlay" id="html-ov2"></div>'
      });
      // Make it addOverlay worked
      expect(document.getElementById('html-ov2')).toBeDefined();
      expect(document.getElementById('html-ov2')).not.toEqual(null);
      expect(_.size(overlays.getOverlays())).toEqual(1);



      // when
      overlays.removeOverlay(id);

      // then
      // expect overlay to be removed
      expect(id).toBeDefined();
      expect(document.getElementById('html-ov2')).toEqual(null);
      expect(_.size(overlays.getOverlays())).toEqual(0);
    }));
  });

  describe('#_setOverlayVisible', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));

    it(' should respect global min/max rules', inject(function(overlays, canvas) {

      //Setup
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });
      var div = $('<div/>', {
        class: 'overlay',
        id:    'html-z1',
        text:  'Test'
      });

      // attach
      var overlayId = overlays.addOverlay(shape, {
        html: div
      });

      // test if html exist
      var element = document.getElementById(overlayId);
      expect(element).toBeDefined();

      canvas.zoom(0.6);
      expect(element.style.display).toEqual('');


      canvas.zoom(0.4);
      expect(element.style.display).toEqual('none');


      canvas.zoom(1.0);
      expect(element.style.display).toEqual('');


      canvas.zoom(5.0);
      expect(element.style.display).toEqual('none');
    }));

    it(' should respect overlay specific min/max rules', inject(function(overlays, canvas) {

      //Setup
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });
      var div = $('<div/>', {
        class: 'overlay',
        id:    'html-z2',
        text:  'Test'
      });

      // attach
      var overlayId = overlays.addOverlay(shape, {
        html: div,
        minZoom: 0.3,
        maxZoom: 4
      });

      // test if html exist
      var element = document.getElementById(overlayId);
      expect(element).toBeDefined();

      canvas.zoom(0.6);
      expect(element.style.display).toEqual('');

      canvas.zoom(0.3);
      expect(element.style.display).toEqual('');

      canvas.zoom(0.2);
      expect(element.style.display).toEqual('none');

      canvas.zoom(3);
      expect(element.style.display).toEqual('');

      canvas.zoom(4.0);
      expect(element.style.display).toEqual('');

      canvas.zoom(4.1);
      expect(element.style.display).toEqual('none');
    }));
  });

  describe('#_setOverlayPosition', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));

    it('overlay should reflect elements position', inject(function(overlays, canvas) {
      var shape = canvas.addShape({
        id: 'T-1',
        x: 104,
        y: 212,
        width: 102,
        height: 112
      });

      var div = $('<div/>', {
        class: 'overlay',
        id:    'html-p1',
        text:  'Test'
      });

      // when
      var overlayId = overlays.addOverlay(shape, {
        html: div
      });

      //then
      var element = document.getElementById(overlayId);

      var m = matrix(element.style.transform);
      expect(m).toEqual({
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 104,
        f: 212
      });
    }));

    it('overlay should be translated if viewport gets translated', inject(function(overlays, canvas) {
      var shape = canvas.addShape({
        id: 'T-2',
        x: 108,
        y: 220,
        width: 102,
        height: 112
      });

      var div = $('<div/>', {
        class: 'overlay',
        id:    'html-p2',
        text:  'Test'
      });

      var overlayId = overlays.addOverlay(shape, {
        html: div
      });

      // when
      canvas.scroll({
        dx: 100,
        dy: 26
      });

      //then
      var element = document.getElementById(overlayId);

      var m = matrix(element.style.transform);
      expect(m).toEqual({
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 8,
        f: 194
      });
    }));

    it('overlay position should be scaled if viewport is scaled', inject(function(overlays, canvas) {
      var shape = canvas.addShape({
        id: 'T-3',
        x: 108,
        y: 220,
        width: 102,
        height: 112
      });

      var div = $('<div/>', {
        class: 'overlay',
        id:    'html-p3',
        text:  'Test'
      });

      var overlayId = overlays.addOverlay(shape, {
        html: div
      });

      // when
      canvas.zoom(10);

      //then
      var element = document.getElementById(overlayId);

      var m = matrix(element.style.transform);
      expect(m).toEqual({
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 1080,
        f: 2200
      });
    }));

    it('overlay position should be absolute id specified', inject(function(overlays, canvas) {
      var shape = canvas.addShape({
        id: 'T-4',
        x: 108,
        y: 220,
        width: 102,
        height: 112
      });


      // when
      var div = $('<div/>', {
        class: 'overlay',
        id:    'html-p4',
        text:  'Test'
      });

      var overlayId = overlays.addOverlay(shape, {
        html: div,
        x: 333,
        y: 444
      });

      //then
      var element = document.getElementById(overlayId);

      var m = matrix(element.style.transform);
      expect(m).toEqual({
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 333,
        f: 444
      });
    }));
  });
});

function matrix(transformStr) {
  if(!transformStr || !(transformStr === 'none')) {
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