'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    keyboardModule = require('../../../../lib/features/keyboard'),
    selectionModule = require('../../../../lib/features/selection');


describe('features/keyboard', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, keyboardModule, selectionModule ] }));

  it('should bootstrap diagram with keyboard', inject(function(keyboard) {
    expect(keyboard).toBeDefined();
  }));


  describe('listener handling', function() {

    beforeEach(function() {
      TestHelper.DomMocking.install();
    });

    var testDiv;

    beforeEach(function() {

      var testContainer = jasmine.getEnv().getTestContainer();

      testDiv = document.createElement('div');
      testDiv.setAttribute('class', 'testClass');
      testContainer.appendChild(testDiv);
    });


    it('should bind keyboard events to node', inject(function(keyboard) {
      // Actually three listeners are set
      var STANDARD_LISTENER_COUNT = 1;

      keyboard.bind(testDiv);

      expect(testDiv.$$listenerCount).toBe(STANDARD_LISTENER_COUNT);
    }));


    it('should unbind keyboard events to node', inject(function(keyboard) {

      keyboard.bind(testDiv);
      keyboard.unbind();

      expect(testDiv.$$listenerCount).toBe(0);
    }));


    it('should not fail to execute unbind if bins was not called before', inject(function(keyboard) {
      keyboard.unbind();
    }));


    it('should return node', inject(function(keyboard) {

      keyboard.bind(testDiv);
      var binding = keyboard.getBinding();

      expect(binding).toBe(testDiv);
    }));


    afterEach(function() {
      TestHelper.DomMocking.uninstall();
    });

  });

});
