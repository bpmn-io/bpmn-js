'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var $ = require('jquery');


var contextPadModule = require('../../../../lib/features/context-pad');

var providerModule = {
  __init__: [ 'contextPadProvider' ],
  contextPadProvider: ['type', require('./ContextPadProvider') ]
};

var initPadModule = {
  __init__: [ 'contextPad' ]
};


describe('features/context-pad', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ contextPadModule, initPadModule ] }));


    it('should bootstrap diagram with component', inject(function(canvas, contextPad) {

      canvas.addShape({ id: 's1', width: 100, height: 100, x: 10, y: 10 });

      canvas.addShape({ id: 's2', width: 50, height: 50, x: 200, y: 10 });
      canvas.addShape({ id: 's3', width: 150, height: 150, x: 300, y: 300 });

      expect(contextPad).toBeDefined();
    }));

  });


  describe('providers', function() {

    beforeEach(bootstrapDiagram({ modules: [ contextPadModule, initPadModule ] }));


    function Provider(entries) {
      this.getContextPadEntries = function(element) {
        return entries || {};
      };
    }


    it('should register provider', inject(function(contextPad) {

      // given
      var provider = new Provider();

      // when
      contextPad.registerProvider(provider);

      // then
      expect(contextPad._providers).toEqual([ provider ]);
    }));


    it('should query provider for entries', inject(function(contextPad) {

      // given
      var provider = new Provider();

      contextPad.registerProvider(provider);

      spyOn(provider, 'getContextPadEntries');

      // when
      var entries = contextPad.getEntries('FOO');

      // then
      expect(entries).toEqual({});

      // pass over providers
      expect(provider.getContextPadEntries).toHaveBeenCalledWith('FOO');
    }));

  });


  describe('lifecycle', function() {

    beforeEach(bootstrapDiagram({ modules: [ contextPadModule, providerModule ] }));


    it('should open', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);


      // when
      contextPad.open(shape);

      // then
      expect(!!contextPad.isOpen()).toBe(true);
    }));


    it('should provide context dependent entries', inject(function(canvas, contextPad) {

      // given
      var shapeA = { id: 's1', type: 'A', width: 100, height: 100, x: 10, y: 10 };
      var shapeB = { id: 's2', type: 'B', width: 100, height: 100, x: 210, y: 10 };

      canvas.addShape(shapeA);
      canvas.addShape(shapeB);

      // when
      contextPad.open(shapeA);
      contextPad.open(shapeB);
      contextPad.open(shapeA);
      contextPad.close();

      // then
      expect(!!contextPad.isOpen()).toBe(false);

    }));


    it('should close', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);


      contextPad.open(shape);

      // when
      contextPad.close();

      // then
      expect(!!contextPad.isOpen()).toBe(false);
    }));

  });


  describe('event handling', function() {

    beforeEach(bootstrapDiagram({ modules: [ contextPadModule, providerModule ] }));

    function createEvent(eventType, target) {
      return $.Event(eventType, { target: target });
    }


    it('should handle click event', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);

      contextPad.open(shape);

      var pad = contextPad.getPad(shape),
          html = pad.html,
          target = html.find('[data-action="action.c"]');

      var event = createEvent('click', target);

      // when
      contextPad.trigger(event.type, event);

      // then
      expect(event.__handled).toBeTruthy();
    }));


    it('should prevent unhandled events', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);
      contextPad.open(shape);

      var pad = contextPad.getPad(shape),
          html = pad.html,
          target = html.find('[data-action="action.c"]');

      var event = createEvent('dragstart', target);

      // when
      contextPad.trigger(event.type, event);

      // then
      expect(event.isDefaultPrevented()).toBeTruthy();
    }));


    it('should handle drag event', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', type: 'drag', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);
      contextPad.open(shape);

      var pad = contextPad.getPad(shape),
          html = pad.html,
          target = html.find('[data-action="action.dragstart"]');

      var event = createEvent('dragstart', target);

      // when
      contextPad.trigger(event.type, event);

      // then
      expect(event.__handled).toBeTruthy();
    }));

  });

});