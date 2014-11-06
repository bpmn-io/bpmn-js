'use strict';

/* global bootstrapDiagram, inject */

var TestHelper    = require('../../../TestHelper'),
    paletteModule = require('../../../../lib/features/palette'),
    $             = require('jquery');


function Provider(entries) {
  this.getPaletteEntries = function() {
    return entries || {};
  };
}


describe('features/palette', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ paletteModule ] }));


    it('should attach palette to diagram', inject(function(canvas, palette) {

      // when
      palette.registerProvider(new Provider());

      // then
      var container = canvas.getContainer();

      var paletteArray = $(container).children('.djs-palette');

      expect(paletteArray.length).toBe(1);
    }));


    it('should not attach palette to diagram without provider', inject(function(canvas, palette) {

      var container = canvas.getContainer();

      var paletteArray = $(container).children('.djs-palette');

      expect(paletteArray.length).toBe(0);
    }));

  });


  describe('providers', function() {

    beforeEach(bootstrapDiagram({ modules: [ paletteModule ] }));


    it('should register provider', inject(function(palette) {

      // given
      var provider = new Provider();

      // when
      palette.registerProvider(provider);

      // then
      expect(palette._providers).toEqual([ provider ]);
    }));


    it('should query provider for entries', inject(function(palette) {

      // given
      var provider = new Provider();

      palette.registerProvider(provider);

      spyOn(provider, 'getPaletteEntries');

      // when
      var entries = palette.getEntries();

      // then
      expect(entries).toEqual({});

      // pass over providers
      expect(provider.getPaletteEntries).toHaveBeenCalled();
    }));


    it('should add palette entries', inject(function(canvas, palette) {

      // given
      var entries  = {
        'entryA': {
          alt: 'A',
          className: 'FOO',
          action: function() {
            console.log('click entryA', arguments);
          }
        },
        'entryB': {
          alt: 'B',
          imageUrl: 'http://placehold.it/40x40',
          action: {
            click: function() {
              console.log('click entryB');
            },
            dragstart: function(event) {
              console.log('dragstart entryB');
              event.preventDefault();
            }
          }
        }
      };

      var provider = new Provider(entries);

      // when
      palette.registerProvider(provider);
      palette.open();

      // then data structure should set
      var pEntries = palette.getEntries();
      expect(pEntries.entryA).toBeDefined();
      expect(pEntries.entryB).toBeDefined();

      // then DOM should contain entries
      var entryA = $(palette._container).find('[data-action="entryA"]');
      expect(entryA.length).toBe(1);
      expect(entryA.is('.FOO')).toBe(true);

      var entryB = $(palette._container).find('[data-action="entryB"]');
      expect(entryB.length).toBe(1);
      expect(entryB.find('img').length).toBe(1);
    }));
  });


  describe('lifecycle', function() {

    beforeEach(bootstrapDiagram({ modules: [ paletteModule ] }));

    beforeEach(inject(function(palette) {
      palette.registerProvider(new Provider());
    }));

    function expectOpen(palette, open) {
      expect(palette.isOpen()).toBe(open);
      expect(palette._container.is('.open')).toBe(open);
    }

    it('should be opened (default)', inject(function(canvas, palette) {

      // then
      expectOpen(palette, true);
    }));


    it('should close', inject(function(canvas, palette) {

      var paletteContainer = $(palette._container);

      // when
      palette.close();

      // then
      expectOpen(palette, false);
    }));


    it('should been opened', inject(function(canvas, palette) {

      // when
      palette.close();
      palette.open();

      // then
      expectOpen(palette, true);
    }));

  });

});
