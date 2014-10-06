'use strict';

/* global bootstrapDiagram, inject */

var TestHelper    = require('../../../TestHelper'),
    palleteModule = require('../../../../lib/features/palette'),
    $             = require('jquery');

describe('features/palette', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ palleteModule ] }));

    function Provider() {
      this.getPaletteEntries = function() {
        return {};
      };
    }


    it('should attach palette to diagram', inject(function(canvas, palette) {

      // when
      var provider = new Provider();

      palette.registerProvider(provider);

      // then
      var container = canvas.getContainer();

      var paletteArray = $(container).children('.diagram-palette');

      expect(paletteArray.length).toBe(1);
    }));

    it('should not attach palette to diagram without provider', inject(function(canvas, palette) {

      var container = canvas.getContainer();

      var paletteArray = $(container).children('.diagram-palette');

      expect(paletteArray.length).toBe(0);
    }));

  });


  describe('providers', function() {

    beforeEach(bootstrapDiagram({ modules: [ palleteModule ] }));


    function Provider(entries) {
      this.getPaletteEntries = function() {
        return entries || {};
      };
    }


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
          alt: 'A'
        },
        'entryB': {
          alt: 'B'
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
      var entryA = $(palette.getPaletteContainer()).find('[data-action="entryA"]');
      expect(entryA.length).toBe(1);

      var entryB = $(palette.getPaletteContainer()).find('[data-action="entryB"]');
      expect(entryB.length).toBe(1);
    }));
  });


  describe('lifecycle', function() {

    beforeEach(bootstrapDiagram({ modules: [ palleteModule ] }));

    it('should be closed', inject(function(canvas, palette) {

      // then
      var hasClass = $(palette.getPaletteContainer()).hasClass('open');

      expect(palette.isOpen()).toBe(false);
      expect(hasClass).toBe(false);
    }));

    it('should open', inject(function(canvas, palette) {

      var paletteContainer = $(palette.getPaletteContainer());

      // when
      palette.open();

      // then
      var hasClass = $(palette.getPaletteContainer()).hasClass('open');
      expect(!!palette.isOpen()).toBe(true);
      expect(hasClass).toBe(true);
    }));

    it('should been closed', inject(function(canvas, palette) {

      // when
      palette.open();
      palette.close();

      // then
      var hasClass = $(palette.getPaletteContainer()).hasClass('open');
      expect(!!palette.isOpen()).toBe(false);
      expect(hasClass).toBe(false);
    }));
  });
});
