'use strict';

require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

var Modeler = require('../../../../lib/Modeler');

var domQuery = require('min-dom/lib/query');


describe('palette', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should should draw palette', function(done) {

    var modeler = new Modeler({ container: container });
    modeler.createDiagram(function(err) {

      // assume
      var provider = modeler.get('paletteProvider');

      // then
      expect(provider).to.exist;

      // when
      var paletteElement = domQuery('.djs-palette', container);

      // then
      expect(domQuery.all('.entry', paletteElement).length).to.equal(7);

      done(err);
    });
  });

});
