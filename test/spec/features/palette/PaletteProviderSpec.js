'use strict';

require('../../../TestHelper');


var Modeler = require('../../../../lib/Modeler');

var domQuery = require('min-dom/lib/query');


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
      var paletteElement = domQuery('.djs-palette', container);

      // then
      expect(domQuery.all('.entry', paletteElement).length).toBe(10);

      done(err);
    });
  });

});
