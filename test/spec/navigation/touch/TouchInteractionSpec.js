'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var touchModule = require('../../../../lib/navigation/touch');


describe('navigation/touch', function() {

  beforeEach(bootstrapDiagram({ modules: [ touchModule ] }));


  describe('bootstrap', function() {

    it('should bootstrap', inject(function(touchInteraction) {
      expect(touchInteraction).not.toBe(null);
    }));

  });
});