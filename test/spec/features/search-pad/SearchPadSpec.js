'use strict';

/* global bootstrapDiagram, inject, sinon */

var searchPadModule = require('../../../../lib/features/search-pad');
var SearchPad = require('../../../../lib/features/search-pad/SearchPad');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes');

var EVENTS = {
  closed: 'searchPad.closed',
  opened: 'searchPad.opened',
  preselected: 'searchPad.preselected',
  selected: 'searchPad.selected'
};


describe('features/searchPad', function() {

  beforeEach(bootstrapDiagram({ modules: [ searchPadModule ] }));

  var capturedEvents;
  var searchProvider;
  var elements;

  var input_node;

  beforeEach(inject(function(searchPad, eventBus, canvas) {

    canvas.setRootElement({ id: 'FOO' });

    elements = {
      one: {
        a: canvas.addShape({ id: 'one-a', x: 0, y: 0, width: 100, height: 80 })
      },
      two: {
        a: canvas.addShape({ id: 'two-a', x: 0, y: 0, width: 100, height: 80 }),
        b: canvas.addShape({ id: 'two-b', x: 0, y: 0, width: 100, height: 80 })
      }
    };

    function SearchProvider() {

      this.setup = function(pattern, results) {
        this._pattern = pattern;
        this._results = results;
      };

      this.find = function(pattern) {
        if (pattern === this._pattern) {
          return this._results;
        }

        if (pattern === 'one') {
          return [{
            primaryTokens: [
              { normal: 'one' }
            ],
            secondaryTokens: [
              { normal: 'some_' },
              { matched: 'DataStore' },
              { normal: '_123456_id' }
            ],
            element: elements.one.a
          }];
        }

        if (pattern === 'two') {
          return [{
            primaryTokens: [
              { normal: 'one' }
            ],
            secondaryTokens: [
              { normal: 'some_' },
              { matched: 'DataStore' },
              { normal: '_123456_id' }
            ],
            element: elements.two.a
          },{
            primaryTokens: [
              { normal: 'two' }
            ],
            secondaryTokens: [
              { normal: 'some_' },
              { matched: 'DataStore' },
              { normal: '_123456_id' }
            ],
            element: elements.two.b
          }];
        }

        return [];
      };
    }

    searchProvider = new SearchProvider();

    searchPad.registerProvider(searchProvider);

    capturedEvents = [];

    Object.keys(EVENTS).forEach(function(k) {
      var e = EVENTS[k];
      eventBus.on(e, function() {
        capturedEvents.push(e);
      });
    });

    input_node = domQuery(SearchPad.INPUT_SELECTOR, canvas.getContainer());
  }));


  it('should be closed by default', inject(function(canvas, eventBus, searchPad) {
    // then
    expect(searchPad.isOpen()).to.equal(false);
  }));


  it('should open', inject(function(canvas, eventBus, searchPad) {
    // when
    searchPad.open();

    // then
    expect(searchPad.isOpen()).to.equal(true);
    expect(capturedEvents).to.eql([ EVENTS.opened ]);
  }));


  it('should error on open when provider not registered', inject(function(canvas, eventBus, searchPad) {
    // given
    searchPad.registerProvider(undefined);

    // when
    expect(function() {
      searchPad.open();
    }).to.throw('no search provider registered');

    // then
    expect(searchPad.isOpen()).to.equal(false);
    expect(capturedEvents).to.eql([]);
  }));


  it('should close', inject(function(canvas, eventBus, searchPad) {
    // given
    searchPad.open();

    // when
    searchPad.close();

    // then
    expect(searchPad.isOpen()).to.equal(false);
    expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.closed ]);
  }));


  it('should toggle open/close', inject(function(canvas, eventBus, searchPad) {
    // when
    searchPad.toggle();
    searchPad.toggle();

    // then
    expect(searchPad.isOpen()).to.equal(false);
    expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.closed ]);

    // when
    searchPad.toggle();

    // then
    expect(searchPad.isOpen()).to.equal(true);
    expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.closed, EVENTS.opened ]);
  }));


  describe('searching/selection', function() {

    var element;

    beforeEach(inject(function(searchPad, eventBus) {
      // given
      element = searchProvider.find('one')[0].element;
      searchPad.open();
    }));


    it('should not search on empty string', inject(function(canvas, eventBus, searchPad) {
      // given
      var find = sinon.spy(searchProvider, 'find');

      // when
      typeText(input_node, '');

      // then
      expect(find).callCount(0);
    }));


    it('should display results', inject(function(canvas, eventBus, searchPad) {
      // given
      var find = sinon.spy(searchProvider, 'find');

      // when
      typeText(input_node, 'two');

      // then
      expect(find).callCount(3);
      var result_nodes = domQuery.all(SearchPad.RESULT_SELECTOR, canvas.getContainer());
      expect(result_nodes).length(2);
    }));


    it('should preselect first result', inject(function(canvas, eventBus, searchPad) {
      // when
      typeText(input_node, 'two');

      // then
      var result_nodes = domQuery.all(SearchPad.RESULT_SELECTOR, canvas.getContainer());
      expect(domClasses(result_nodes[0]).has(SearchPad.RESULT_SELECTED_CLASS)).to.be.true;
      expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.preselected ]);
    }));


    it('should select result on enter', inject(function(canvas, eventBus, searchPad) {
      // given
      typeText(input_node, 'two');

      // when
      triggerKeyEvent(input_node, 'keyup', 13);

      // then
      expect(capturedEvents).to.eql([
        EVENTS.opened,
        EVENTS.preselected,
        EVENTS.closed,
        EVENTS.selected
      ]);
    }));


    it('should set overlay on an highlighted element', inject(function(searchPad, overlays) {
      // when
      typeText(input_node, 'one');

      // then
      var overlay = overlays.get({ element: element });
      expect(overlay).length(1);
    }));


    it('should remove overlay from an element on enter', inject(function(searchPad, overlays) {
      // given
      typeText(input_node, 'one');

      // when
      triggerKeyEvent(input_node, 'keyup', 13);

      // then
      var overlay = overlays.get({ element: element });
      expect(overlay).length(0);
    }));


    it('select should center viewbox on an element', inject(function(searchPad, canvas) {
      // given
      typeText(input_node, 'one');

      var container = canvas.getContainer();
      container.style.width = '1000px';
      container.style.height = '1000px';

      canvas.viewbox({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000
      });

      // when
      triggerKeyEvent(input_node, 'keyup', 13);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox).to.have.property('x', -450);
      expect(newViewbox).to.have.property('y', -460);
    }));


    it('select should keep zoom level', inject(function(searchPad, canvas) {
      // given
      canvas.zoom(0.4);

      typeText(input_node, 'one');

      // when
      triggerKeyEvent(input_node, 'keyup', 13);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox).to.have.property('scale', 0.4);
    }));


    it('select should apply selection on an element', inject(function(searchPad, selection) {
      // given
      typeText(input_node, 'one');

      // when
      triggerKeyEvent(input_node, 'keyup', 13);

      // then
      expect(selection.isSelected(element)).to.be.true;
    }));


    it('should close on escape', inject(function(canvas, eventBus, searchPad) {
      // when
      triggerKeyEvent(input_node, 'keyup', 27);

      // then
      expect(searchPad.isOpen()).to.equal(false);
      expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.closed ]);
    }));


    it('should preselect next/previus results on arrow down/up', inject(function(canvas, eventBus, searchPad) {
      // given
      typeText(input_node, 'two');
      var result_nodes = domQuery.all(SearchPad.RESULT_SELECTOR, canvas.getContainer());

      // when press 'down'
      triggerKeyEvent(input_node, 'keyup', 40);

      // then
      expect(domClasses(result_nodes[0]).has(SearchPad.RESULT_SELECTED_CLASS)).to.be.false;
      expect(domClasses(result_nodes[1]).has(SearchPad.RESULT_SELECTED_CLASS)).to.be.true;

      // when press 'up'
      triggerKeyEvent(input_node, 'keyup', 38);

      // then
      expect(domClasses(result_nodes[0]).has(SearchPad.RESULT_SELECTED_CLASS)).to.be.true;
      expect(domClasses(result_nodes[1]).has(SearchPad.RESULT_SELECTED_CLASS)).to.be.false;

      expect(capturedEvents).to.eql([
        EVENTS.opened,
        EVENTS.preselected,
        EVENTS.preselected,
        EVENTS.preselected
      ]);
    }));


    it('should not move input cursor on arrow down', inject(function(canvas, eventBus, searchPad) {
      // given
      typeText(input_node, 'two');

      // when press 'down'
      var e = triggerKeyEvent(input_node, 'keydown', 40);
      expect(e.defaultPrevented).to.be.true;
    }));


    it('should not move input cursor on arrow up', inject(function(canvas, eventBus, searchPad) {
      // given
      typeText(input_node, 'two');

      // when press 'up'
      var e = triggerKeyEvent(input_node, 'keydown', 38);
      expect(e.defaultPrevented).to.be.true;
    }));


    it('should not search while navigating text in input box left', inject(function(canvas, eventBus, searchPad) {
      // given
      var find = sinon.spy(searchProvider, 'find');
      typeText(input_node, 'two');

      // when press 'left'
      triggerKeyEvent(input_node, 'keyup', 37);

      // then
      expect(find).callCount('two'.length);
    }));


    it('should not search while navigating text in input box right', inject(function(canvas, eventBus, searchPad) {
      // given
      var find = sinon.spy(searchProvider, 'find');
      typeText(input_node, 'two');

      // when press 'right'
      triggerKeyEvent(input_node, 'keyup', 39);

      // then
      expect(find).callCount('two'.length);
    }));

  });

});


function triggerKeyEvent(element, event, code) {
  var e = document.createEvent('Events');

  if (e.initEvent) {
    e.initEvent(event, true, true);
  }

  e.keyCode = code;
  e.which = code;
  element.dispatchEvent(e);
  return e;
}


function typeText(element, text) {
  var input = text.split('');

  element.value = '';

  input.forEach(function(c) {
    element.value += c;
    triggerKeyEvent(element, 'keyup', c.charCodeAt(0));
  });
}
