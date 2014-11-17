'use strict';

var TestHelper = require('../../../TestHelper');

var Modeler = require('../../../../lib/Modeler');

var $ = require('jquery');


describe('palette', function() {

  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
  });


  it('should should draw palette', function(done) {

    var modeler = new Modeler({ container: container });
    modeler.createDiagram(function(err) {

      // assume
      var provider = modeler.get('paletteProvider');

      // then
      expect(provider).toBeTruthy();

      // when
      var paletteElement = $(container).find('.djs-palette');

      // then
      expect(paletteElement.find('.entry').length).toBe(7);

      done(err);
    });
  });

});
