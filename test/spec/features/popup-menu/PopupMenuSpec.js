'use strict';

/* global bootstrapDiagram, inject, sinon */

var fs = require('fs');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    Events = require('../../../util/Events'),
    popupMenuModule = require('../../../../lib/features/popup-menu');


function queryEntry(popupMenu, id) {
  return queryPopup(popupMenu, '[data-id="' + id + '"]');
}

function queryPopup(popupMenu, selector) {
  return domQuery(selector, popupMenu._current.container);
}

describe('features/popup', function() {

  beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));

  describe('bootstrap', function() {

    it('overlay to be defined', inject(function(popupMenu) {
      expect(popupMenu).to.be.defined;
      expect(popupMenu.open).to.be.defined;
    }));
  });


  describe('#open', function() {

    it('should throw an exception when the entries argument is missing', inject(function(popupMenu) {

      expect(function() {
        popupMenu.open({ position: { x: 100, y: 100 } });
      }).to.throw('the entries argument is missing');
    }));


    it('should throw an exception when the entry id argument is missing', inject(function(popupMenu) {

      expect(function() {
        popupMenu.open({ position: { x: 100, y: 100 }, entries: [{ label: 'foo' }]});
      }).to.throw('every entry must have the id property set');
    }));


    it('should return popup instance', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open({ position: { x: 100, y: 100, }, entries: [] });

      // then
      expect(popup).to.be.defined;
    }));


    it('should attach popup to html', inject(function(popupMenu) {

      // when
      popupMenu.open({ position: { x: 100, y: 100, }, entries: [], className: 'test-popup' });

      // then
      var container = popupMenu._current.container;
      expect(domClasses(container).has('djs-popup')).to.be.true;
      expect(domClasses(container).has('test-popup')).to.be.true;
    }));


    it('should add entries to menu', inject(function(popupMenu) {

      // when
      popupMenu.open({
        position: { x: 100, y: 100 },
        entries: [
          { id: 'id1', label: 'Entry 1', className:'firstEntry' },
          { id: 'id2', label: 'Entry 2' },
          { id: 'id3', label: 'Entry 3' }
        ]
      });

      // then
      var element = queryPopup(popupMenu, '.firstEntry');
      expect(element.textContent).to.eql('Entry 1');
    }));


    it('should add action-id to entry', inject(function(popupMenu) {

      // when
      popupMenu.open({
        position: { x: 100, y: 100 },
        entries: [
          {id: 'save', label: 'SAVE' },
          {id: 'load', label: 'LOAD' },
          {id: 'undo', label: 'UNDO' }
        ]
      });

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

    it('should remove DOM', inject(function(popupMenu) {

      // given
      popupMenu.open({
        position: { x: 100, y: 100, },
        entries: []
      });

      // when
      popupMenu.close();

      // then
      var open = popupMenu.isOpen();

      expect(open).to.be.false;
    }));


    it('should not fail if already closed', inject(function(popupMenu){

      // given
      popupMenu.open({
        position: { x: 100, y: 100, },
        entries: []
      });

      // when
      popupMenu.close();

      // then
      expect(function() {
        popupMenu.close();
      }).not.to.throw;
    }));
  });


  describe('#trigger', function () {

    it('should trigger the right action handler', inject(function(popupMenu) {

      var entry, evt, trigger;

      // given
      popupMenu.open({
        position: { x: 100, y: 100 },
        entries: [
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
        ]
      });

      entry = queryPopup(popupMenu, '.Entry_2');
      evt = Events.create(entry, { x: 0, y: 0 });

      // when
      trigger = popupMenu.trigger(evt);

      // then
      expect(trigger).to.eql('Entry 2');
    }));

  });


  describe('integration', function() {

    describe('events', function() {


      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.open({
          position: { x: 100, y: 100, },
          entries: []
        });

        // when
        eventBus.fire('contextPad.close');

        // then
        var open = popupMenu.isOpen();
        expect(open).to.be.false;
      }));


      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.open({
          position: { x: 100, y: 100, },
          entries: []
        });

        // when
        eventBus.fire('canvas.viewbox.changed');

        // then
        var open = popupMenu.isOpen();
        expect(open).to.be.false;
      }));

    });


    describe('header entries', function() {

      beforeEach(inject(function(popupMenu){

        popupMenu.open({
          position: { x: 100, y: 100 },
          entries: [],
          headerEntries: [
            {
              id: 'foo',
              label: 'foo',
              className: 'foo',
              action: function(event, entry){
                if (entry.active) {
                  popupMenu.update(entry, { active: false });
                  popupMenu.update('bar', { disabled: false });
                } else {
                  popupMenu.update(entry, { active: true });
                  popupMenu.update('bar', { disabled: true });
                }
              }
            },
            {
              id: 'bar',
              label: 'bar',
              className: 'bar'
            }
          ]
        });
      }));


      it('should add classes to entries', inject(function(popupMenu){

        // given
        var barEntry,
            fooEntry = queryEntry(popupMenu, 'foo'),
            evt = { target: fooEntry, preventDefault: function(){} };

        // when
        popupMenu.trigger(evt);

        fooEntry = queryEntry(popupMenu, 'foo');
        barEntry = queryEntry(popupMenu, 'bar');

        // then
        expect(domClasses(fooEntry).has('active')).to.be.true;
        expect(domClasses(barEntry).has('disabled')).to.be.true;
      }));


      it('should remove classes from entries', inject(function(popupMenu){

        // given
        var barEntry,
            fooEntry = queryEntry(popupMenu, 'foo'),
            evt = { target: fooEntry, preventDefault: function(){} };

        // when
        popupMenu.trigger(evt);
        popupMenu.trigger(evt);

        fooEntry = queryEntry(popupMenu, 'foo');
        barEntry = queryEntry(popupMenu, 'bar');

        // then
        expect(domClasses(fooEntry).has('active')).to.be.false;
        expect(domClasses(barEntry).has('disabled')).to.be.false;
      }));
    });
  });


  describe('menu styling', function() {

    it('should add standard class to entry', inject(function(popupMenu) {

      // when
      popupMenu.open(
        {
          position: { x: 100, y: 100, },
          entries: [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2' }
          ]
        }
      );

      // then
      var elements = domQuery.all('.entry', popupMenu._current.container);
      expect(elements.length).to.eql(2);
    }));


    it('should add custom class to entry if specfied', inject(function(popupMenu) {

      popupMenu.open(
        {
          position: { x: 100, y: 100, },
          entries: [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2 - special', className: 'special-entry' }
          ]
        }
      );

      // then
      var element = queryPopup(popupMenu, '.special-entry');
      expect(element.textContent).to.eql('Entry 2 - special');
    }));


    it('should name the css classes correctly', inject(function(popupMenu) {

      // when
      popupMenu.open(
        {
          position: { x: 100, y: 100 },
          entries: [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2' }
          ],
          headerEntries: [{ id: 'A', label: 'Header Entry A' }]
        }
      );

      var popupBody = queryPopup(popupMenu, '.djs-popup-body');
      var popupHeader = queryPopup(popupMenu, '.djs-popup-header');

      // then
      expect(domQuery.all('.entry', popupBody).length).to.eql(2);
      expect(domQuery.all('.entry', popupHeader).length).to.eql(1);
    }));


    it('should look awesome', inject(function(popupMenu) {

      // when
      popupMenu.open(
        {
          position: { x: 100, y: 100 },
          entries: [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2', active: true },
            { id: '3', label: 'Entry 3' },
            { id: '4', label: 'Entry 4', disabled: true },
            { id: '5', label: 'Entry 5' }
          ],
          headerEntries: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B' },
            { id: 'C', label: 'C', active: true },
            { id: 'D', label: 'D', disabled: true },
            { id: 'E', label: 'E', disabled: true }
          ]
        }
      );

      // then
      // looks awesome?
    }));

  });


  describe('singleton handling', function() {

    it('should update the popup menu, when it is opened again' , inject(function(popupMenu) {

      // when
      popupMenu.open(
        {
          className: 'popup-menu1',
          position: { x: 100, y: 100, },
          entries: [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2' }
          ]
        }
      );

      popupMenu.open(
        {
          className: 'popup-menu2',
          position: { x: 200, y: 200, },
          entries: [
            { id: '1', label: 'Entry A' },
            { id: '2', label: 'Entry B' }
          ]
        }
      );

      var container = popupMenu._current.container,
          entriesContainer = domQuery('.djs-popup-body', container);

      // then
      expect(domClasses(container).has('popup-menu2')).to.be.true;
      expect(container.style.left).to.eql('200px');
      expect(container.style.top).to.eql('200px');
      expect(entriesContainer.childNodes[0].textContent).to.eql('Entry A');
      expect(entriesContainer.childNodes[1].textContent).to.eql('Entry B');
    }));

  });


  describe('#isOpen', function(){

    it('should not be open initially', inject(function(popupMenu){

      // when
      // at initial state

      // then
      expect(popupMenu.isOpen()).to.be.false;
    }));


    it('should be open after opening', inject(function(popupMenu){
      // when
       popupMenu.open({ position: { x: 100, y: 100, }, entries: [] });

      // then
      expect(popupMenu.isOpen()).to.be.true;
    }));


    it('should be closed after closing', inject(function(popupMenu){

      // given
      popupMenu.open({ position: { x: 100, y: 100, }, entries: [] });

      // when
      popupMenu.close();

      // then
      expect(popupMenu.isOpen()).to.be.false;
    }));

  });


  describe('header', function() {

    it('should throw an error, if the id of a header entry is not set', inject(function(popupMenu){

      // when
      var menu = {
        position: { x: 100, y: 100 },
        headerEntries: [{ className: 'header-entry-1' }],
        entries: []
      };

      // then
      expect(function(){
        popupMenu.open(menu);
      }).to.throw('every entry must have the id property set');
    }));



    it('should be attached to the top of the popup menu, if set' , inject(function(popupMenu) {

      // when
      popupMenu.open({
        position: { x: 100, y: 100 },
        headerEntries: [{ id: '1', className: 'header-entry-1' }],
        entries: []
      });

      // then
      expect(queryPopup(popupMenu, '.djs-popup-header')).to.exist;
    }));


    it('should add a custom css class to the header section, if specified', inject(function(popupMenu){

      // when
      popupMenu.open({
        position: { x: 100, y: 100 },
        headerEntries: [{ id: '1', className: 'header-entry-1' }],
        entries: []
      });

      // then
      expect(queryPopup(popupMenu, '.header-entry-1')).to.exist;
    }));


    it('should add an image to the header section, if specified', inject(function(popupMenu){

      // given
      var testImage = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/resources/a.png', 'base64');

      // when
      popupMenu.open({
        position: { x: 100, y: 100 },
        headerEntries: [
          {
            id: '1',
            imageUrl: testImage,
            className: 'image-1'
          }
        ],
        entries: []
      });

      // then
      var img = queryPopup(popupMenu, '.image-1 img');

      expect(img).to.exist;
      expect(img.getAttribute('src')).to.eql(testImage);
    }));


    it('should add a labeled element to the header section, if specified', inject(function(popupMenu){

      // when
      popupMenu.open({
        position: { x: 100, y: 100 },
        headerEntries: [{ id: '1', label: 'foo', className: 'label-1' }],
        entries: []
      });

      // then
      var headerEntry = queryPopup(popupMenu, '.label-1');
      expect(headerEntry.textContent).to.eql('foo');
    }));


    it('should throw an error if the position argument is missing', inject(function(popupMenu){

      // when
      var menu = {
        entries: []
      };

      // then
      expect(function(){
        popupMenu.open(menu);
      }).to.throw('the position argument is missing');
    }));


    it('should attach only the entries if no header entries is set', inject(function(popupMenu){

      // when
      popupMenu.open({
        entries: [],
        position: { x: 100, y: 100 }
      });

      // then
      expect(queryPopup(popupMenu, '.djs-popup-header')).not.to.exist;
      expect(queryPopup(popupMenu, '.djs-popup-body')).to.exist;
    }));


    it('should trigger action on click', inject(function(popupMenu){

      // given
      var actionListener = sinon.spy();

      popupMenu.open({
        entries: [],
        headerEntries: [{
          id: '1',
          action: actionListener,
          label: 'foo'
        }],
        position: { x: 100, y: 100 }
      });

      var entry = queryPopup(popupMenu, '.entry'),
          evt = { target: entry, preventDefault: function(){} };

      // when
      popupMenu.trigger(evt);

      // then
      expect(actionListener).to.have.been.called;
    }));


    it('should add disabled and active classes', inject(function(popupMenu){

      // given
      var entry, evt;

      popupMenu.open({
        position: { x: 100, y: 100 },
        entries: [],
        headerEntries: [
          {
            id: 'foo',
            action: function(event, entry) {
              if (entry.active) {
                popupMenu.update(entry, { active: false });
              } else {
                popupMenu.update(entry, { active: true });
              }
              if (entry.disabled) {
                popupMenu.update(entry, { disabled: false });
              } else {
                popupMenu.update(entry, { disabled: true });
              }
            },
            label: 'foo'
          }
        ]
      });

      // when
      entry = queryEntry(popupMenu, 'foo');
      evt = Events.create(entry, { x: 0, y: 0 });

      popupMenu.trigger(evt);

      // then
      entry = queryEntry(popupMenu, 'foo');
      expect(domClasses(entry).has('active')).to.be.true;
      expect(domClasses(entry).has('disabled')).to.be.true;

    }));

  });


  describe('#update', function() {

    it('should update a header entry by id', inject(function(popupMenu){

      // given
      popupMenu.open({
        entries: [],
        headerEntries: [
          {
            id: 'my-header-entry',
            label: 'foo'
          }
        ],
        position: { x: 100, y: 100 }
      });

      // when
      popupMenu.update('my-header-entry', { label: 'bar' });

      var headerEntry = popupMenu._getEntry('my-header-entry');

      // then
      expect(headerEntry.label).to.eql('bar');
    }));


    it('should update a header entry by instance', inject(function(popupMenu){

      // given

      var headerEntry = {
        id: 'my-header-entry',
        label: 'foo'
      };

      popupMenu.open({
        entries: [],
        headerEntries: [
          headerEntry
        ],
        position: { x: 100, y: 100 }
      });

      // when
      popupMenu.update(headerEntry, { label: 'bar' });

      // then
      expect(popupMenu._getEntry(headerEntry.id).label).to.eql('bar');
    }));


    it('should update an entry by id', inject(function(popupMenu){

      // given
      popupMenu.open({
        entries: [
          {
            id: 'my-entry',
            label: 'foo'
          }
        ],
        position: { x: 100, y: 100 }
      });

      // when
      popupMenu.update('my-entry', { label: 'bar' });

      // then
      expect(popupMenu._getEntry('my-entry').label).to.eql('bar');
    }));


    it('should update an entry by instance', inject(function(popupMenu){

      // given
      popupMenu.open({
        entries: [
          {
            id: 'my-entry',
            label: 'foo'
          }
        ],
        position: { x: 100, y: 100 }
      });

      var entry = popupMenu._current.menu.entries[0];

      // when
      popupMenu.update(entry, { label: 'bar' });

      // then
      expect(popupMenu._getEntry('my-entry').label).to.eql('bar');
    }));


    it('should throw an error if no entry could be found', inject(function(popupMenu){

      // given
      popupMenu.open({
        entries: [],
        position: { x: 100, y: 100 }
      });

      // when
      expect(function() {
        popupMenu.update('non-existent-entry', { foo: 'bar' });
      }).to.throw('entry not found');
    }));

  });

});
