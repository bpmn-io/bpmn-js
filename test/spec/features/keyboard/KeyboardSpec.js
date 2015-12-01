'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    keyboardModule = require('../../../../lib/features/keyboard');

var createKeyEvent = require('../../../util/KeyEvents').createKeyEvent;


describe('features/keyboard', function() {

  beforeEach(bootstrapDiagram({
    modules: [ modelingModule, keyboardModule ],
    canvas: { deferUpdate: false },
    keyboard: { speed: 5, invertY: false }
  }));


  it('should bootstrap diagram with keyboard', inject(function(keyboard) {
    expect(keyboard).to.exist;
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


    describe('arrow keys', function(){

      it('should handle left arrow', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 37, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.viewbox().x).to.eql(-5);
        expect(canvas.viewbox().y).to.eql(0);
      }));


      it('should handle right arrow', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 39, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.viewbox().x).to.eql(5);
        expect(canvas.viewbox().y).to.eql(0);
      }));


      it('should handle up arrow', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 38, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.viewbox().x).to.eql(0);
        expect(canvas.viewbox().y).to.eql(-5);
      }));


      it('should handle down arrow', inject(function(canvas, keyboard) {

        // given
        var e = createKeyEvent(container, 40, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(canvas.viewbox().x).to.eql(0);
        expect(canvas.viewbox().y).to.eql(5);
      }));


      describe('configurability', function() {

        it('should configure speed',
            inject(function(canvas, keyboard, injector) {

          // given
          var keyboardConfig = injector.get('config.keyboard');

          var keyDownEvent = createKeyEvent(container, 38, true);

          // when
          keyboardConfig.speed = 23; // plenty of fuel needed
          keyboard._keyHandler(keyDownEvent);

          // then
          expect(canvas.viewbox().x).to.eql(0);
          expect(canvas.viewbox().y).to.eql(-23);
        }));


        it('should configure natural scrolling',
            inject(function(canvas, keyboard, injector) {

          // given
          var keyboardConfig = injector.get('config.keyboard');

          var keyDownEvent = createKeyEvent(container, 38, true),
              keyUpEvent = createKeyEvent(container, 40, true);

          // when
          keyboardConfig.invertY = true;
          keyboard._keyHandler(keyDownEvent);

          // then
          expect(canvas.viewbox().x).to.eql(0);
          expect(canvas.viewbox().y).to.eql(5);


          // but does up work, too?

          // when
          keyboard._keyHandler(keyUpEvent);

          // then
          expect(canvas.viewbox().x).to.eql(0);
          expect(canvas.viewbox().y).to.eql(0);
        }));

      });

    });

  });

});
