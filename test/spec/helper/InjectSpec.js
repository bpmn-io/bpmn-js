import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import { expect } from 'chai';


describe('helper - inject', function() {

  var diagramXML = require('../../fixtures/bpmn/simple.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule
    ]
  }));


  it('should work with Promise as return value', function() {

    // given
    var expected = 'resolved';

    // when
    var test = inject(function(eventBus) {

      expect(eventBus).to.exist;

      return Promise.resolve(expected);
    });

    // then
    return test().then(function(result) {

      expect(result).to.eql(expected);
    });
  });


  it('should handle Promise rejection', function() {

    // given
    var expected = new Error('rejected');

    function onResolved() {
      throw new Error('should not resolve');
    }

    function onRejected(error) {
      expect(error).to.eql(expected);
    }

    // when
    var test = inject(function(eventBus) {
      expect(eventBus).to.exist;

      return Promise.reject(expected);
    });

    // then
    return test().then(onResolved, onRejected);
  });

});
