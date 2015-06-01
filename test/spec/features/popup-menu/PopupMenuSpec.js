'use strict';

/* global bootstrapDiagram, inject */

var domQuery = require('min-dom/lib/query');

var Events = require('../../../util/Events');

var popupMenuModule = require('../../../../lib/features/popup-menu');


describe('features/popup', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));


    it('overlay to be defined', inject(function(popupMenu) {
      expect(popupMenu).to.be.defined;
      expect(popupMenu.open).to.be.defined;
    }));
  });


  describe('#open', function() {

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));

    it('should return popup instance', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open('popup-menu', {
        x: 100,
        y: 100
      }, [
        {label: 'Entry 1'},
        {label: 'Entry 2'}
      ]);

      // then
      expect(popup).to.be.defined;
    }));

    it('should attach popup to html', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open('popup-menu', {
        x: 100,
        y: 100
      }, [
        {label: 'Entry 1'},
        {label: 'Entry 2'},
        {label: 'Entry 3'}
        ],
      {
        className: 'test-popup'
      });
      var popuphtml = popup._container;

      // then
      expect(popuphtml.querySelector('.test-popup')).to.be.defined;
    }));

    it('should add entries to menu', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open('popup-menu', {
        x: 100,
        y: 100
      }, [
          {id: 'id1', label: 'Entry 1', className:'firstEntry'},
          {id: 'id2', label: 'Entry 2'},
          {id: 'id3', label: 'Entry 3'}
        ],
        {
          className: 'test-popup'
        }
      );
      var popuphtml = popup._container;

      // then
      var element = popuphtml.querySelector('.firstEntry');
      expect(element.textContent).to.equal('Entry 1');
    }));

    it('should add action-id to entry', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open('popup-menu', {
        x: 100,
        y: 100
      }, [
          {id: 'id1', label: 'SAVE', action: { name: 'save'}},
          {id: 'id2', label: 'LOAD', action: { name: 'load'}},
          {id: 'id3', label: 'UNDO', action: { name: 'undo'}}
        ],
        {
          className: 'test-popup'
        }
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

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));

    it('should remove DOM', inject(function(popupMenu) {

      // given
      var popup = popupMenu.open('popup-menu', {
        x: 100,
        y: 100,
      }, [
          {id: 'id1', label: 'Entry 1'},
          {id: 'id2', label: 'Entry 2'}
        ],
        {
          className: 'menuToRemove'
        }
      );

      // when
      popup.close();

      // then
      var removed = popup._container.parentNode === null;

      expect(removed).to.be.true;
    }));

  });

  describe('#trigger', function () {

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));

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
      }], {
        className: 'test-popup'
      });

      entry = domQuery('.Entry_2', popup._container);

      evt = Events.create(entry, { x: 0, y: 0 });

      // when
      trigger = popup.trigger(evt);

      // then
      expect(trigger).to.equal('Entry 2');
    }));

  });


  describe('integration', function() {

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));

    it('should set correct zoom level on creation');

    describe('events', function() {

      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        var popup = popupMenu.open('popup-menu', {
          x: 100,
          y: 100
        }, [
            {id: 'id1', label: 'a',},
            {id: 'id2', label: 'b'}
          ],
          {
            className: 'menuToRemove'
          }
        );

        // when
        eventBus.fire('contextPad.close');

        // then
        var removed = popup._container.parentNode === null;
        expect(removed).to.be.true;
      }));

      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        var popup = popupMenu.open('popup-menu', {
          x: 100,
          y: 100
        }, [
            {id: 'id1', label: 'a',},
            {id: 'id2', label: 'b'}
          ],
          {
            className: 'menuToRemove'
          }
        );

        // when
        eventBus.fire('canvas.viewbox.changed');

        // then
        var removed = popup._container.parentNode === null;
        expect(removed).to.be.true;
      }));

    });

  });


  describe('menu styling', function() {

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));

    it('should standard class to entry', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open('test-popup', {
        x: 100,
        y: 100
      }, [
          {id: 'id1', label: 'Entry 1'},
          {id: 'id2', label: 'Entry 2'}
        ]
      );

      // then
      var elements = popup._container.querySelectorAll('.entry');
      expect(elements.length).to.equal(2);
    }));

    it('should custom class to entry if specfied', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open('test-popup', {
        x: 100,
        y: 100
      }, [
          {id: 'id1', label: 'Entry 1'},
          {id: 'id2', label: 'Entry 2 - special', className: 'special-entry'},
          {id: 'id2', label: 'Entry 3'}
        ]
      );

      // then
      var element = popup._container.querySelector('.special-entry');
      expect(element.textContent).to.equal('Entry 2 - special');
    }));

    it('should add optional style attribute', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open('test-popup', {
        x: 100,
        y: 100
      }, [
          {id: 'id1', label: 'Entry 1'},
          {id: 'id2', label: 'Entry 2', className: 'special-entry', style:'color: rgb(222,67,157)'},
          {id: 'id2', label: 'Entry 3'}
        ]
      );

      // then
      var element = popup._container.querySelector('.special-entry');
      expect(element.getAttribute('style')).to.equal('color: rgb(222,67,157)');
    }));

  });

});
