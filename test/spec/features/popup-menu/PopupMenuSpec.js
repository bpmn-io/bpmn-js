'use strict';

/* global bootstrapDiagram, inject */

var popupMenuModule = require('../../../../lib/features/popup-menu');



describe('features/popup', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));


    it('overlay to be defined', inject(function(popupMenu) {
      expect(popupMenu).toBeDefined();
      expect(popupMenu.open).toBeDefined();
    }));
  });


  describe('#open', function() {

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));

    it('should return popup instance', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open({
        x: 100,
        y: 100
      }, [
        {label: 'Entry 1'},
        {label: 'Entry 2'}
      ]);

      // then
      expect(popup).toBeDefined();
    }));

    it('should attach popup to html', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open({
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
      expect(popuphtml.querySelector('.test-popup')).toBeDefined();
    }));

    it('should add entries to menu', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open({
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
      expect(element.textContent).toBe('Entry 1');
    }));

    it('should add action-id to entry', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open({
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

      expect(entry1.getAttribute('data-action')).toBe('save');
      expect(entry2.getAttribute('data-action')).toBe('load');
      expect(entry3.getAttribute('data-action')).toBe('undo');
    }));
  });

  describe('#close', function() {

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));

    it('should remove DOM', inject(function(popupMenu) {

      // given
      var popup = popupMenu.open({
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

      expect(removed).toBeTruthy();
    }));
  });


  describe('integration', function() {

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));

    it('should set correct zoom level on creation');

    describe('events', function() {

      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        var popup = popupMenu.open({
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
        expect(removed).toBeTruthy();
      }));

      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        var popup = popupMenu.open({
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
        expect(removed).toBeTruthy();
      }));
    });
  });


  describe('menu styling', function() {

    beforeEach(bootstrapDiagram({ modules: [ popupMenuModule ] }));

    it('should standard class to entry', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open({
        x: 100,
        y: 100
      }, [
          {id: 'id1', label: 'Entry 1'},
          {id: 'id2', label: 'Entry 2'}
        ],
        {
          className: 'test-popup'
        }
      );

      // then
      var elements = popup._container.querySelectorAll('.entry');
      expect(elements.length).toBe(2);
    }));

    it('should custom class to entry if specfied', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open({
        x: 100,
        y: 100
      }, [
          {id: 'id1', label: 'Entry 1'},
          {id: 'id2', label: 'Entry 2 - special', className: 'special-entry'},
          {id: 'id2', label: 'Entry 3'}
        ],
        {
          className: 'test-popup'
        }
      );

      // then
      var element = popup._container.querySelector('.special-entry');
      expect(element.textContent).toBe('Entry 2 - special');
    }));

    it('should add optional style attribute', inject(function(popupMenu) {

      // when
      var popup = popupMenu.open({
        x: 100,
        y: 100
      }, [
          {id: 'id1', label: 'Entry 1'},
          {id: 'id2', label: 'Entry 2', className: 'special-entry', style:'color: rgb(222,67,157)'},
          {id: 'id2', label: 'Entry 3'}
        ],
        {
          className: 'test-popup'
        }
      );

      // then
      var element = popup._container.querySelector('.special-entry');
      expect(element.getAttribute('style')).toBe('color: rgb(222,67,157)');
    }));
  });
});
