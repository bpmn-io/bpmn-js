'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var _ = require('lodash'),
    $ = require('jquery');


var overlayModule = require('../../../../lib/features/overlays');


describe('features/overlay', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('overlay to be defined', inject(function(overlays) {
      expect(overlays).toBeDefined();
      expect(overlays.getOverlays).toBeDefined();
      expect(overlays.addOverlayToElement).toBeDefined();
      expect(overlays.removeOverlay).toBeDefined();
    }));
  });


  describe('overlay handling', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    var overlay;

    function TestOverlay() {
      this.name = 'test-overlay';

      this.attach = function(element) {
        $(element).text('Test overlay');
        $(element).css({
          'background-color': '#42B415',
          'color': 'white',
          'border-radius': '50px',
          'font-family': 'Arial',
          'padding': '3px',
          'font-size': '13px',
          'display': 'inline-block',
          'min-height': '16px',
          'min-width': '16px',
          'text-align': 'center',
          'position': 'absolute'
        });
      };
    }

    beforeEach(function() {
      overlay = new TestOverlay();
    });


    it('should register overlay type', inject(function(overlays) {
      expect(_.size(overlays._overlayTypes)).toEqual(0);
      overlays.registerOverlayType({ name: 'test-overlay' });

      expect(overlays._overlayTypes['test-overlay']).toBeDefined();
      expect(_.size(overlays._overlayTypes)).toEqual(1);
    }));


    it('add/remove overlay', inject(function(overlays, canvas) {
      //Setup
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });
      overlays.registerOverlayType(overlay);

      // attach
      expect(_.size(overlays.getOverlays())).toEqual(0);
      var overlayId = overlays.addOverlayToElement('test-overlay', shape, {text: 'Test'});
      expect(overlayId).toBeDefined();
      expect(_.size(overlays.getOverlays())).toEqual(1);

      // test if html exist
      var element = document.getElementById(overlayId);
      expect(element).toBeDefined();
      // Remove overlay
      overlays.removeOverlay(overlayId);

      // Check if removed from list
      expect(_.size(overlays.getOverlays())).toEqual(0);
      // check if removed from DOM
      element = document.getElementById(overlayId);
      expect(!!element).toBeFalsy();
    }));

    it(' should removed if shape is removed', inject(function(overlays, canvas) {

      //Setup
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });
      overlays.registerOverlayType(overlay);

      // attach
      var overlayId = overlays.addOverlayToElement('test-overlay', shape, {text: 'Test'});

      // test if html exist
      var element = document.getElementById(overlayId);
      expect(element).toBeDefined();

      // Remove overlay
      canvas.removeShape(shape);

      // check if removed from DOM
      element = document.getElementById(overlayId);
      expect(!!element).toBeFalsy();
    }));

    it(' should respect global min/max rules', inject(function(overlays, canvas) {

      //Setup
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });
      overlays.registerOverlayType(overlay);

      // attach
      var overlayId = overlays.addOverlayToElement('test-overlay', shape, {text: 'Test'});

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
      overlays.registerOverlayType(overlay);

      // attach
      var overlayId = overlays.addOverlayToElement('test-overlay', shape, {
        text: 'Test',
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
});