'use strict'

var fs = require('fs');

var Modeler = require('../../../../../lib/Modeler');

var Matchers = require('../../../Matchers');


describe('features/label-editing', function() {

  beforeEach(Matchers.add);

  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(container);
  });


  it('should register on dblclick', function(done) {

    done();
  });


  it('should save on escape', function(done) {

    done();
  });

});