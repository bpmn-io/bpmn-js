'use strict';

/* global bootstrapDiagram, inject, sinon */

var fs = require('fs');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes');

var globalEvent = require('../../../util/MockEvents').createEvent;

var popupMenuModule = require('../../../../lib/features/popup-menu'),
    modelingModule = require('../../../../lib/features/modeling'),
    commandStack = require('../../../../lib/command');


function queryEntry(popupMenu, id) {
  return queryPopup(popupMenu, '[data-id="' + id + '"]');
}

function queryPopup(popupMenu, selector) {
  return domQuery(selector, popupMenu._current.container);
}

var menuProvider = {
  getHeaderEntries: function() {
    return [ { id: 'entry1', label: 'foo' } ];
  },
  getEntries: function() {
    return [ { id: 'entry2', label: 'foo' }, { id: 'entry3', label: 'bar' } ];
  }
};

describe('features/popup', function() {

  beforeEach(bootstrapDiagram({ modules: [ popupMenuModule, commandStack, modelingModule ] }));

  describe('bootstrap', function() {

    it('overlay to be defined', inject(function(popupMenu) {
      expect(popupMenu).to.exist;
      expect(popupMenu.open).to.exist;
    }));

  });


  describe('#registerProvider', function() {
    it('should register provider', inject(function(popupMenu) {

      // given
      var provider = {};

      // when
      popupMenu.registerProvider('provider', provider);

      // then
      expect(popupMenu._providers.provider).to.exist;

    }));
  });

  describe('#create', function() {
    it('should create menu for specific element', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('menu', menuProvider);

      popupMenu.create('menu', {});

      // then
      expect(popupMenu._current.provider.getHeaderEntries()).to.include({ id: 'entry1', label: 'foo' });
      expect(popupMenu._current.provider.getEntries()).to.include({ id: 'entry2', label: 'foo' });

    }));


    it('should throw error when no provider', inject(function(popupMenu) {

      // when not registering a provider

      // then
      expect(function() { popupMenu.create('foo'); }).to.throw('Provider is not registered: foo');

    }));


    it('should throw error when element is missing', inject(function(popupMenu) {

      popupMenu.registerProvider('menu', menuProvider);

      expect(function() { popupMenu.create('menu'); }).to.throw('Element is missing');

    }));

  });

  describe('#isEmpty', function() {

    it('should return true if empty', inject(function(popupMenu){
      // given
      popupMenu.registerProvider('empty-menu', {
        getEntries: function() { return []; },
        getHeaderEntries: function() { return []; }
      });

      // when
      popupMenu.create('empty-menu', {});

      // then
      expect(popupMenu.isEmpty()).to.be.true;
    }));


    it('should return false if entries', inject(function(popupMenu){
      // given
      popupMenu.registerProvider('entry-menu', {
        getEntries: function() { return [ { id: 1 } ]; }
      });

      // when
      popupMenu.create('entry-menu', {});

      // then
      expect(popupMenu.isEmpty()).to.be.false;
    }));


    it('should return false if header entries', inject(function(popupMenu){
      // given
      popupMenu.registerProvider('header-entry-menu', {
        getEntries: function() { return [ { id: 1 } ]; }
      });

      // when
      popupMenu.create('header-entry-menu', {});

      // then
      expect(popupMenu.isEmpty()).to.be.false;
    }));
  });

  describe('#open', function() {

    beforeEach(inject(function(popupMenu) {
      popupMenu.registerProvider('menu', menuProvider);
    }));

    it('should return popup instance', inject(function(popupMenu) {

      // when
      var popup = popupMenu.create('menu', {}).open({ x: 100, y: 100 });

      // then
      expect(popup).to.exist;
      expect(popup._current).to.exist;
    }));


    it('should attach popup to html', inject(function(popupMenu) {

      // when
      popupMenu.create('menu', {}).open({ x: 100, y: 100 });

      var container = popupMenu._current.container;

      // then
      expect(domClasses(container).has('djs-popup')).to.be.true;
      expect(domClasses(container).has('menu')).to.be.true;
    }));


    it('should add entries to menu', inject(function(popupMenu) {

      // when
      popupMenu.create('menu', {}).open({ x: 100, y: 100 });

      // then
      var domEntry = queryEntry(popupMenu, 'entry1');

      expect(domEntry.textContent).to.eql('foo');
    }));


    it('should add action-id to entry', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('item-menu', {
        getEntries: function() {
          return [
            {id: 'save', label: 'SAVE' },
            {id: 'load', label: 'LOAD' },
            {id: 'undo', label: 'UNDO' }
          ];
        },
        getHeaderEntries: function() {}
      });

      popupMenu.create('item-menu', {}).open({ x: 100, y: 100 });

      // then
      var parent = queryPopup(popupMenu, '.djs-popup-body');
      var entry1 = parent.childNodes[0];
      var entry2 = parent.childNodes[1];
      var entry3 = parent.childNodes[2];

      expect(entry1.getAttribute('data-id')).to.eql('save');
      expect(entry2.getAttribute('data-id')).to.eql('load');
      expect(entry3.getAttribute('data-id')).to.eql('undo');
    }));

  });

  describe('#close', function() {

    beforeEach(inject(function(popupMenu) {
      popupMenu.registerProvider('menu', menuProvider);
      popupMenu.create('menu', {}).open({ x: 100, y: 100 });
    }));

    it('should remove DOM', inject(function(popupMenu) {

      // when
      popupMenu.close();

      // then
      var open = popupMenu.isOpen();

      expect(open).to.be.false;
    }));


    it('should not fail if already closed', inject(function(popupMenu){

      // when
      popupMenu.close();

      // then
      expect(popupMenu.close).not.to.throw;
    }));

  });

  describe('#isOpen', function(){

    it('should not be open initially', inject(function(popupMenu){

      // when
      popupMenu.registerProvider('menu', menuProvider);
      popupMenu.create('menu', {});

      // then
      expect(popupMenu.isOpen()).to.be.false;
    }));


    it('should be open after opening', inject(function(popupMenu){

      // when
      popupMenu.registerProvider('menu', menuProvider);
      popupMenu.create('menu', {}).open({ x: 100, y: 100 });

      // then
      expect(popupMenu.isOpen()).to.be.true;
    }));


    it('should be closed after closing', inject(function(popupMenu){

      // given
      popupMenu.registerProvider('menu', menuProvider);
      popupMenu.create('menu', {}).open({ x: 100, y: 100 });

      // when
      popupMenu.close();

      // then
      expect(popupMenu.isOpen()).to.be.false;
    }));

  });

  describe('#trigger', function () {

    it('should trigger the right action handler', inject(function(popupMenu) {

      // given
      popupMenu.registerProvider('test-menu', {
        getEntries: function() {
          return [
            {
              id: '1',
              label: 'Entry 1',
              className: 'Entry_1',
              action: function(event, entry) {
                return 'Entry 1';
              }
            }, {
              id: '2',
              label: 'Entry 2',
              className: 'Entry_2',
              action: function(event, entry) {
                return 'Entry 2';
              }
            }
          ];
        }
      });

      popupMenu.create('test-menu', {});
      popupMenu.open({ x: 100, y: 100 });

      var entry = queryPopup(popupMenu, '.Entry_2');

      // when
      var trigger = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(trigger).to.eql('Entry 2');
    }));

  });

  describe('integration', function() {

    describe('events', function() {

      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.registerProvider('menu', menuProvider);

        popupMenu.create('menu', {}).open({ x: 100, y: 100 });

        // when
        eventBus.fire('contextPad.close');

        // then
        var open = popupMenu.isOpen();

        expect(open).to.be.false;
      }));


      it('should close menu (canvas.viewbox.changing)', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.registerProvider('menu', menuProvider);

        popupMenu.create('menu', {}).open({ x: 100, y: 100 });

        // when
        eventBus.fire('canvas.viewbox.changing');

        // then
        var open = popupMenu.isOpen();

        expect(open).to.be.false;
      }));

    });

  });

  describe('menu styling', function() {

    it('should add standard class to entry', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2' }
          ];
        }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);

      // when
      popupMenu.create('test-menu', {}).open({ x: 100, y: 100 });

      // then
      var elements = domQuery.all('.entry', popupMenu._current.container);

      expect(elements.length).to.eql(2);
    }));


    it('should add custom class to entry if specfied', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2 - special', className: 'special-entry' }
          ];
        }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);

      // when
      popupMenu.create('test-menu', {}).open({ x: 100, y: 100 });

      // then
      var element = queryPopup(popupMenu, '.special-entry');

      expect(element.textContent).to.eql('Entry 2 - special');
    }));


    it('should name the css classes correctly', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2' }
          ];
        },
        getHeaderEntries: function() {
          return [{ id: 'A', label: 'Header Entry A' }];
        }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);

      // when
      popupMenu.create('test-menu', {}).open({ x: 100, y: 100 });

      var popupBody = queryPopup(popupMenu, '.djs-popup-body');
      var popupHeader = queryPopup(popupMenu, '.djs-popup-header');

      // then
      expect(domQuery.all('.entry', popupBody).length).to.eql(2);
      expect(domQuery.all('.entry', popupHeader).length).to.eql(1);
    }));


    it('should look awesome', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2', active: true },
            { id: '3', label: 'Entry 3' },
            { id: '4', label: 'Entry 4', disabled: true },
            { id: '5', label: 'Entry 5' }
          ];
        },
        getHeaderEntries: function() {
          return [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B' },
            { id: 'C', label: 'C', active: true },
            { id: 'D', label: 'D', disabled: true },
            { id: 'E', label: 'E', disabled: true }
          ];
        }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);

      // when
      popupMenu.create('test-menu', {}).open({ x: 100, y: 100 });

      // then
      // looks awesome?
    }));

  });

  describe('singleton handling', function() {

    it('should update the popup menu, when it is opened again' , inject(function(popupMenu) {

      // given
      var popupMenu1 = {
        getEntries: function() {
          return [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2' }
          ];
        }
      };

      popupMenu.registerProvider('popup-menu1', popupMenu1);

      var popupMenu2 = {
        getEntries: function() {
          return [
            { id: '3', label: 'Entry A' },
            { id: '4', label: 'Entry B' }
          ];
        }
      };

      popupMenu.registerProvider('popup-menu2', popupMenu2);

      // when
      var popup1 = popupMenu.create('popup-menu1', {});
      var popup2 = popupMenu.create('popup-menu2', {});

      popup1.open({ x: 100, y: 100 });
      popup2.open({ x: 200, y: 200 });

      var container = popupMenu._current.container,
          entriesContainer = domQuery('.djs-popup-body', container);

      // then
      expect(domQuery('.popup-menu1', document)).to.be.null;
      expect(domQuery('.popup-menu2', document)).not.to.be.null;

      expect(domClasses(container).has('popup-menu2')).to.be.true;

      expect(container.style.left).to.eql('200px');
      expect(container.style.top).to.eql('200px');

      expect(entriesContainer.childNodes[0].textContent).to.eql('Entry A');
      expect(entriesContainer.childNodes[1].textContent).to.eql('Entry B');
    }));

  });


  describe('header', function() {

    it('should throw an error, if the id of a header entry is not set', inject(function(popupMenu){

      // when
      popupMenu.registerProvider('test-menu', {
        getEntries: function() {
          return { label: 'foo' };
        }
      });

      var testMenu = popupMenu.create('test-menu', {});

      // then
      expect(function(){
        testMenu.open({ x: 100, y: 100 });
      }).to.throw('every entry must have the id property set');
    }));


    it('should be attached to the top of the popup menu, if set' , inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('menu', menuProvider);
      popupMenu.create('menu', {}).open({ x: 100, y: 100 });

      // then
      expect(queryPopup(popupMenu, '.djs-popup-header')).to.exist;
    }));


    it('should add a custom css class to the header section, if specified', inject(function(popupMenu){

      var testMenuProvider = {
        getHeaderEntries: function() {
          return [ { id: '1', className: 'header-entry-1' } ];
        },
        getEntries: function() {
          return [ { id: '2', label: 'foo' } ];
        }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.create('test-menu', {}).open({ x: 100, y: 100 });

      // then
      expect(queryPopup(popupMenu, '.header-entry-1')).to.exist;
    }));


    it('should add an image to the header section, if specified', inject(function(popupMenu){

      // given
      var testImage = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/resources/a.png', 'base64');

      var testMenuProvider = {
        getHeaderEntries: function() {
          return [
            {
              id: '1',
              imageUrl: testImage,
              className: 'image-1'
            }
          ];
        },
        getEntries: function() { return []; }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.create('test-menu', {}).open({ x: 100, y: 100 });

      // then
      var img = queryPopup(popupMenu, '.image-1 img');

      expect(img).to.exist;
      expect(img.getAttribute('src')).to.eql(testImage);
    }));


    it('should add a labeled element to the header section, if specified', inject(function(popupMenu){

      var testMenuProvider = {
        getHeaderEntries: function() {
          return [ { id: '1', label: 'foo', className: 'label-1' } ];
        },
        getEntries: function() { return []; }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.create('test-menu', {}).open({ x: 100, y: 100 });

      // then
      var headerEntry = queryPopup(popupMenu, '.label-1');

      expect(headerEntry.textContent).to.eql('foo');
    }));


    it('should throw an error if the position argument is missing', inject(function(popupMenu){

      popupMenu.registerProvider('menu', menuProvider);

      // then
      expect(function(){
        popupMenu.create('menu', {}).open();
      }).to.throw('the position argument is missing');
    }));


    it('should attach only the entries if no header entries is set', inject(function(popupMenu){

      // when
      var testMenuProvider = {
        getEntries: function() { return []; }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.create('test-menu', {}).open({ x: 100, y: 100 });

      // then
      expect(queryPopup(popupMenu, '.djs-popup-header')).not.to.exist;
      expect(queryPopup(popupMenu, '.djs-popup-body')).to.exist;
    }));


    it('should trigger action on click', inject(function(popupMenu){

      // given
      var actionListener = sinon.spy();

      var testProvider = {
        getHeaderEntries: function() {
          return [{
            id: '1',
            action: actionListener,
            label: 'foo'
          }];
        },
        getEntries: function() { return []; }
      };

      popupMenu.registerProvider('test-menu', testProvider);
      popupMenu.create('test-menu', {}).open({ x: 100, y: 100 });

      var entry = queryPopup(popupMenu, '.entry');

      // when
      popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(actionListener).to.have.been.called;
    }));


    it('should add disabled and active classes', inject(function(popupMenu){

      // given
      var entry;

      var testMenuProvider = {
        getHeaderEntries: function() {
          return [
            {
              id: 'foo',
              active: true,
              disabled: true,
              label: 'foo'
            }
          ];
        },
        getEntries: function() { return []; }
      };

      // when
      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.create('test-menu', {}).open({ x: 100, y: 100 });

      // then
      entry = queryEntry(popupMenu, 'foo');

      expect(domClasses(entry).has('active')).to.be.true;
      expect(domClasses(entry).has('disabled')).to.be.true;
    }));

  });

  // different browsers, different outcomes
  describe('position', function () {

    beforeEach(inject(function(popupMenu, elementRegistry) {

      var customProvider = {
        getEntries: function() {
          return [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2', active: true },
            { id: '3', label: 'Entry 3' },
            { id: '4', label: 'Entry 4', disabled: true },
            { id: '5', label: 'Entry 5' }
          ];
        },
        getHeaderEntries: function() {
          return [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B' },
            { id: 'C', label: 'C', active: true },
            { id: 'D', label: 'D', disabled: true },
            { id: 'E', label: 'E', disabled: true }
          ];
        }
      };

      popupMenu.registerProvider('custom-provider', customProvider);

      popupMenu.create('custom-provider', {});
    }));


    it('should open within bounds above', inject(function(popupMenu, canvas) {
      // given
      var clientRect = canvas._container.getBoundingClientRect();

      var cursorPosition = { x: clientRect.left + 100, y: clientRect.top + 500 };

      // when
      popupMenu.open({ x: 100, y: 500, cursor: cursorPosition });

      var menu = popupMenu._current.container;

      var menuDimensions = {
        width: menu.scrollWidth,
        height: menu.scrollHeight
      };

      expect(menu.offsetTop).to.equal(500 - menuDimensions.height);
    }));


    it('should open within bounds to the left', inject(function(popupMenu, canvas) {
      // given
      var clientRect = canvas._container.getBoundingClientRect();

      var cursorPosition = { x: clientRect.left + 2000, y: clientRect.top + 100 };

      // when
      popupMenu.open({ x: 2000, y: 100, cursor: cursorPosition });

      var menu = popupMenu._current.container;

      var menuDimensions = {
        width: menu.scrollWidth,
        height: menu.scrollHeight
      };

      expect(menu.offsetLeft).to.equal(2000 - menuDimensions.width);
    }));

  });

});
