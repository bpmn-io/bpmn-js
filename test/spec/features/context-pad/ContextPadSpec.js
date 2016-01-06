'use strict';


var globalEvent = require('../../../util/MockEvents').createEvent;


/* global bootstrapDiagram, inject, sinon */

var domQuery = require('min-dom/lib/query');

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

      expect(contextPad).to.exist;
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
      expect(contextPad._providers).to.eql([ provider ]);
    }));


    it('should query provider for entries', inject(function(contextPad) {

      // given
      var provider = new Provider();

      contextPad.registerProvider(provider);

      sinon.spy(provider, 'getContextPadEntries');

      // when
      var entries = contextPad.getEntries('FOO');

      // then
      expect(entries).to.eql({});

      // pass over providers
      expect(provider.getContextPadEntries).to.have.been.calledWith('FOO');
    }));

  });


  describe('lifecycle', function() {

    beforeEach(bootstrapDiagram({ modules: [ contextPadModule, providerModule ] }));


    function expectEntries(contextPad, element, entries) {

      var pad = contextPad.getPad(element),
          html = pad.html;

      entries.forEach(function(e) {
        var entry = domQuery('[data-action="' + e + '"]', html);
        expect(entry).not.to.be.null;
      });

      expect(domQuery.all('.entry', html).length).to.equal(entries.length);
    }


    it('should open', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);


      // when
      contextPad.open(shape);

      // then
      expect(contextPad.isOpen()).to.be.true;
    }));


    it('should provide context dependent entries', inject(function(canvas, contextPad) {

      // given
      var shapeA = { id: 's1', type: 'A', width: 100, height: 100, x: 10, y: 10 };
      var shapeB = { id: 's2', type: 'B', width: 100, height: 100, x: 210, y: 10 };

      canvas.addShape(shapeA);
      canvas.addShape(shapeB);

      // when (1)
      contextPad.open(shapeA);

      // then (1)
      expectEntries(contextPad, shapeA, [ 'action.a', 'action.b' ]);


      // when (2)
      contextPad.open(shapeB);

      // then (2)
      expectEntries(contextPad, shapeB, [ 'action.c', 'action.no-image' ]);

      // when (3)
      contextPad.open(shapeA);
      contextPad.close();

      // then (3)
      expect(contextPad.isOpen()).to.be.false;
    }));


    it('should close', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);


      contextPad.open(shape);

      // when
      contextPad.close();

      // then
      expect(!!contextPad.isOpen()).to.be.false;
    }));


    it('should reopen, resetting entries', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);


      contextPad.open(shape);
      contextPad.close();

      // when
      contextPad.open(shape);

      // then
      expectEntries(contextPad, shape, [ 'action.c', 'action.no-image' ]);
    }));


    it('should reopen if current element changed', inject(function(eventBus, canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);

      contextPad.open(shape);

      var open = sinon.spy(contextPad, 'open');

      // when
      eventBus.fire('element.changed', { element: shape });

      // then
      expect(open).to.have.been.calledWith(shape, true);
    }));


    it('should not reopen if other element changed', inject(function(eventBus, canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);

      contextPad.open(shape);

      var open = sinon.spy(contextPad, 'open');

      // when
      eventBus.fire('element.changed', { element: canvas.getRootElement() });

      // then
      expect(open).to.not.have.been.called;
    }));


  });


  describe('event handling', function() {

    beforeEach(bootstrapDiagram({ modules: [ contextPadModule, providerModule ] }));


    it('should handle click event', inject(function(canvas, contextPad) {

      // given
      var shape = canvas.addShape({ id: 's1', width: 100, height: 100, x: 10, y: 10 });

      contextPad.open(shape);

      var pad = contextPad.getPad(shape),
          html = pad.html,
          target = domQuery('[data-action="action.c"]', html);

      var event = globalEvent(target, { x: 0, y: 0 });

      // when
      contextPad.trigger('click', event);

      // then
      expect(event.__handled).to.be.true;
    }));


    it('should prevent unhandled events', inject(function(canvas, contextPad) {

      // given
      var shape = canvas.addShape({ id: 's1', width: 100, height: 100, x: 10, y: 10 });

      contextPad.open(shape);

      var pad = contextPad.getPad(shape),
          html = pad.html,
          target = domQuery('[data-action="action.c"]', html);

      var event = globalEvent(target, { x: 0, y: 0 });

      // when
      contextPad.trigger('dragstart', event);

      // then
      expect(event.defaultPrevented).to.be.true;
    }));


    it('should handle drag event', inject(function(canvas, contextPad) {

      // given
      var shape = canvas.addShape({ id: 's1', width: 100, height: 100, x: 10, y: 10, type: 'drag' });

      contextPad.open(shape);

      var pad = contextPad.getPad(shape),
          html = pad.html,
          target = domQuery('[data-action="action.dragstart"]', html);

      var event = globalEvent(target, { x: 0, y: 0 });

      // when
      contextPad.trigger('dragstart', event);

      // then
      expect(event.__handled).to.be.true;
    }));

  });

});
