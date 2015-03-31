'use strict';

var TestHelper = require('../TestHelper');

var Modeler = require('../../lib/Modeler');


describe('scenario - simple modeling', function() {


  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
  });


  it('should build process from start to end event', function(done) {

    // given
    var modeler = new Modeler({ container: container });

    // when
    modeler.createDiagram(function(err) {

      done(err);
    });
  });

});