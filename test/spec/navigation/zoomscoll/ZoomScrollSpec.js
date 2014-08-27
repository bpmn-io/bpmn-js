'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var zoomScrollModule = require('../../../../lib/navigation/zoomscroll');


describe('navigation/zoomscroll', function() {

  beforeEach(bootstrapDiagram({ modules: [ zoomScrollModule ] }));


  describe('bootstrap', function() {

    it('should bootstrap', inject(function(zoomScroll) {
      expect(zoomScroll).not.toBe(null);
    }));

  });

});