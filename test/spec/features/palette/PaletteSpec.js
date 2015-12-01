'use strict';

/* global bootstrapDiagram, inject */

var paletteModule = require('../../../../lib/features/palette');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes');

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

      var paletteArray = domQuery.all('.djs-palette', container);

      expect(paletteArray.length).to.equal(1);
    }));


    it('should not attach palette to diagram without provider', inject(function(canvas, palette) {

      var container = canvas.getContainer();

      var paletteArray = domQuery.all('.djs-palette', container);

      expect(paletteArray.length).to.equal(0);
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
      expect(palette._providers).to.eql([ provider ]);
    }));


    it('should query provider for entries', inject(function(palette) {

      // given
      var provider = new Provider();

      palette.registerProvider(provider);

      sinon.spy(provider, 'getPaletteEntries');

      // when
      var entries = palette.getEntries();

      // then
      expect(entries).to.eql({});

      // pass over providers
      expect(provider.getPaletteEntries).to.have.been.called;
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
      expect(pEntries.entryA).to.exist;
      expect(pEntries.entryB).to.exist;

      // then DOM should contain entries
      var entryA = domQuery('[data-action="entryA"]', palette._container);
      expect(entryA).to.exist;
      expect(domClasses(entryA).has('FOO')).to.be.true;

      var entryB = domQuery('[data-action="entryB"]', palette._container);
      expect(entryB).to.exist;
      expect(domQuery('img', entryB)).to.exist;
    }));

  });


  describe('lifecycle', function() {

    beforeEach(bootstrapDiagram({ modules: [ paletteModule ] }));

    beforeEach(inject(function(palette) {
      palette.registerProvider(new Provider());
    }));

    function expectOpen(palette, open) {
      expect(palette.isOpen()).to.equal(open);
      expect(domClasses(palette._container).has('open')).to.equal(open);
    }

    it('should be opened (default)', inject(function(canvas, palette) {

      // then
      expectOpen(palette, true);
    }));


    it('should close', inject(function(canvas, palette) {

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
