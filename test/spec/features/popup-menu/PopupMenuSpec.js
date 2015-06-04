'use strict';

/* global bootstrapDiagram, inject */

var domQuery = require('min-dom/lib/query');

var Events = require('../../../util/Events');

var popupMenuModule = require('../../../../lib/features/popup-menu');


describe('features/popup', function() {

  beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));


  describe('bootstrap', function() {

    it('overlay to be defined', inject(function(popupMenu) {
      expect(popupMenu).to.be.defined;
      expect(popupMenu.open).to.be.defined;
    }));
  });


  describe('#open', function() {

    it('should return popup instance', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open('popup-menu', { x: 100, y: 100, }, [ {id: 'id1', label: 'Entry 1'} ]);

      // then
      expect(popup).to.be.defined;
    }));


    it('should attach popup to html', inject(function(popupMenu) {

      // when
      popupMenu.open('popup-menu', { x: 100, y: 100, }, [ {id: 'id1', label: 'Entry 1'}, {className: 'test-popup'} ] );

      // then
      expect(popupMenu._container.querySelector('.test-popup')).to.exist;
    }));


    it('should add entries to menu', inject(function(popupMenu) {

      // when
      popupMenu.open('popup-menu', { x: 100, y: 100 }, [
          { id: 'id1', label: 'Entry 1', className:'firstEntry' },
          { id: 'id2', label: 'Entry 2' },
          { id: 'id3', label: 'Entry 3' }
        ]
      );

      // then
      var element = popupMenu._container.querySelector('.firstEntry');
      expect(element.textContent).to.equal('Entry 1');
    }));


    it('should add action-id to entry', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open('popup-menu', { x: 100, y: 100 }, [
          {id: 'id1', label: 'SAVE', action: { name: 'save'}},
          {id: 'id2', label: 'LOAD', action: { name: 'load'}},
          {id: 'id3', label: 'UNDO', action: { name: 'undo'}}
        ]
      );

      // then
      var parent = popup._container;
      var entry1 = parent.childNodes[0];
      var entry2 = parent.childNodes[1];
      var entry3 = parent.childNodes[2];

      expect(entry1.getAttribute('data-action')).to.equal('save');
      expect(entry2.getAttribute('data-action')).to.equal('load');
      expect(entry3.getAttribute('data-action')).to.equal('undo');
    }));
  });


  describe('#close', function() {

    it('should remove DOM', inject(function(popupMenu) {

      // given
      popupMenu.open('popup-menu', { x: 100, y: 100, }, [ {id: 'id1', label: 'Entry 1'} ]);

      // when
      popupMenu.close();

      // then
      var open = popupMenu.isOpen();

      expect(open).to.be.false;
    }));


    it('should not fail if already closed', inject(function(popupMenu){

      // given
      popupMenu.open('popup-menu', { x: 100, y: 100, }, [ {id: 'id1', label: 'Entry 1'} ]);

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
      var popup = popupMenu.open('popup-menu', {
        x: 100,
        y: 100
      }, [
      {
          label: 'Entry 1',
          className: 'Entry_1',
          action: {
            name: 'button 1',
            handler: function() {
              return 'Entry 1';
            }
          }
      }, {
          label: 'Entry 2',
          className: 'Entry_2',
          action: {
            name: 'button 2',
            handler: function() {
              return 'Entry 2';
            }
          }
      }]);

      entry = domQuery('.Entry_2', popup._container);

      evt = Events.create(entry, { x: 0, y: 0 });

      // when
      trigger = popup.trigger(evt);

      // then
      expect(trigger).to.equal('Entry 2');
    }));

  });


  describe('integration', function() {

    it('should set correct zoom level on creation');

    describe('events', function() {

      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.open('popup-menu', { x: 100, y: 100 }, [ { id: 'id1', label: 'a' } ]);

        // when
        eventBus.fire('contextPad.close');

        // then
        var open = popupMenu.isOpen();
        expect(open).to.be.false;
      }));


      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.open('popup-menu', { x: 100, y: 100 }, [ { id: 'id1', label: 'a' } ]);

        // when
        eventBus.fire('canvas.viewbox.changed');

        // then
        var open = popupMenu.isOpen();
        expect(open).to.be.false;
      }));

    });

  });


  describe('menu styling', function() {

    it('should standard class to entry', inject(function(popupMenu) {

      // when
      popupMenu.open('test-popup', { x: 100, y: 100 }, [
          {id: 'id1', label: 'Entry 1'},
          {id: 'id2', label: 'Entry 2'}
        ]
      );

      // then
      var elements = popupMenu._container.querySelectorAll('.entry');
      expect(elements.length).to.equal(2);
    }));


    it('should custom class to entry if specfied', inject(function(popupMenu) {

      // when
      popupMenu.open('test-popup', { x: 100, y: 100}, [
          {id: 'id1', label: 'Entry 1'},
          {id: 'id2', label: 'Entry 2 - special', className: 'special-entry'},
          {id: 'id2', label: 'Entry 3'}
        ]
      );

      // then
      var element = popupMenu._container.querySelector('.special-entry');
      expect(element.textContent).to.equal('Entry 2 - special');
    }));

    it('should add optional style attribute', inject(function(popupMenu) {

      // when
      popupMenu.open('test-popup', { x: 100, y: 100}, [
          {id: 'id1', label: 'Entry 1'},
          {id: 'id2', label: 'Entry 2', className: 'special-entry', style:'color: rgb(222,67,157)'},
          {id: 'id2', label: 'Entry 3'}
        ]
      );

      // then
      var element = popupMenu._container.querySelector('.special-entry');
      expect(element.getAttribute('style')).to.equal('color: rgb(222,67,157)');
    }));

  }) ;


  describe('singleton handling', function() {

    it('should update the popup menu, when it is opened again' , inject(function(popupMenu) {

      // when
      popupMenu.open('popup-menu1', { x: 100, y: 100 }, [ { label: 'Entry 1' }, { label: 'Entry 2' } ]);
      popupMenu.open('popup-menu2', { x: 200, y: 200 }, [ { label: 'Entry A' }, { label: 'Entry B' } ]);

      // then
      expect(popupMenu.name).to.equal('popup-menu2');
      expect(popupMenu._container.style.left).to.equal('200px');
      expect(popupMenu._container.style.top).to.equal('200px');
      expect(popupMenu._container.childNodes[0].innerText).to.equal('Entry A');
      expect(popupMenu._container.childNodes[1].innerText).to.equal('Entry B');
    }));
  });


  describe('#isOpen', function(){

    it('should not be open initially', inject(function(popupMenu){
   
      // when at initial state

      // then
      expect(popupMenu.isOpen()).to.be.false;
    }));


    it('should be open after opening', inject(function(popupMenu){
   
      // when
      popupMenu.open('popup-menu1', { x: 100, y: 100 }, [ { label: 'Entry 1' }, { label: 'Entry 2' } ]);

      // then 
      expect(popupMenu.isOpen()).to.be.true;
    }));


    it('should be closed after closing', inject(function(popupMenu){
      
      // given
      popupMenu.open('popup-menu1', { x: 100, y: 100 }, [ { label: 'Entry 1' }, { label: 'Entry 2' } ]);

      // when
      popupMenu.close();

      // then
      expect(popupMenu.isOpen()).to.be.false;
    }));
  });
});
