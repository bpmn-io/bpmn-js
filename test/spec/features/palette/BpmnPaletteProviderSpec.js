'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');


var fs = require('fs');

var Modeler = require('../../../../lib/Modeler');
var bpmnPaletteModule = require('../../../../lib/features/palette');



describe('palette', function() {


  beforeEach(Matchers.addDeepEquals);


  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
  });


  function createModeler(xml, done) {
    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err) {
      done(err, modeler);
    });
  }

  iit('should should draw palette', function(done) {

    var modeler = new Modeler({ container: container });
    modeler.createDiagram(function(err) {

      var palette = modeler.get('bpmnPaletteProvider');

      palette.open();

      done(err);
    });
  });



});
