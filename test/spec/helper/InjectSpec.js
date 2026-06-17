import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import coreModule from 'bpmn-js/lib/core';
import { expect } from 'chai';

import diagramXML from '../../fixtures/bpmn/simple.bpmn';


describe('helper - inject', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule
    ]
  }));


  it('should work with Promise as return value', function() {

    // given
    var expected = 'resolved';

    // when
    var testFn = inject(function(eventBus) {

      expect(eventBus).to.exist;

      return Promise.resolve(expected);
    });

    // then
    return testFn().then(function(result) {

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
    var testFn = inject(function(eventBus) {
      expect(eventBus).to.exist;

      return Promise.reject(expected);
    });

    // then
    return testFn().then(onResolved, onRejected);
  });

});
