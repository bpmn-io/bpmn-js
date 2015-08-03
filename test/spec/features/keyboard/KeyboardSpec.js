'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    keyboardModule = require('../../../../lib/features/keyboard'),
    selectionModule = require('../../../../lib/features/selection'),
    zoomScrollModule = require('../../../../lib/navigation/zoomscroll');

var createKeyEvent = require('../../../util/KeyEvents').createKeyEvent;

describe('features/keyboard', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, keyboardModule, selectionModule, zoomScrollModule ] }));

  it('should bootstrap diagram with keyboard', inject(function(keyboard) {
    expect(keyboard).to.be.defined;
  }));


  describe('listener handling', function() {

    beforeEach(function() {
      TestHelper.DomMocking.install();
    });

    var testDiv;

    beforeEach(function() {

      var testContainer = this.currentTest.__test_container_support__.testContentContainer;

      testDiv = document.createElement('div');
      testDiv.setAttribute('class', 'testClass');
      testContainer.appendChild(testDiv);
    });


    it('should bind keyboard events to node', inject(function(keyboard) {
      // Actually three listeners are set
      var STANDARD_LISTENER_COUNT = 1;

      keyboard.bind(testDiv);

      expect(testDiv.$$listenerCount).to.equal(STANDARD_LISTENER_COUNT);
    }));


    it('should unbind keyboard events to node', inject(function(keyboard) {

      keyboard.bind(testDiv);
      keyboard.unbind();

      expect(testDiv.$$listenerCount).to.equal(0);
    }));


    it('should not fail to execute unbind if bins was not called before', inject(function(keyboard) {
      keyboard.unbind();
    }));


    it('should return node', inject(function(keyboard) {

      keyboard.bind(testDiv);
      var binding = keyboard.getBinding();

      expect(binding).to.equal(testDiv);
    }));


    afterEach(function() {
      TestHelper.DomMocking.uninstall();
    });

  });

  describe('default listeners', function() {

    var container;

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    describe('zoom in', function(){

      it('should handle numpad plus', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 107, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.zoom()).to.be.above(1);
      }));


      it('should handle regular plus', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 187, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.zoom()).to.be.above(1);
      }));


      it('should handle regular plus in Firefox (US layout)', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 61, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.zoom()).to.be.above(1);
      }));


      it('should handle regular plus in Firefox (german layout)', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 171, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.zoom()).to.be.above(1);
      }));

    });

    describe('zoom out', function(){

      it('should handle numpad minus', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 109, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.zoom()).to.be.below(1);
      }));


      it('should handle regular minus', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 189, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.zoom()).to.be.below(1);
      }));


      it('should handle regular minus in Firefox', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 173, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.zoom()).to.be.below(1);
      }));

    });

    describe('default zoom level', function(){

      it('should handle numpad zero', inject(function(canvas, keyboard) {

        // given
        canvas.zoom(2.345);
        var e = createKeyEvent(container, 96, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.zoom()).to.equal(1);
      }));


      it('should handle regular zero', inject(function(canvas, keyboard) {

        // given
        canvas.zoom(2.345);
        var e = createKeyEvent(container, 48, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.zoom()).to.equal(1);
      }));

    });

  });

});
