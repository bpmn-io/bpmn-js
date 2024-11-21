import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';

import {
  pick
} from 'min-dash';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import bpmnSearchModule from 'lib/features/search';


describe('features - BPMN search provider', function() {

  var testModules = [
    coreModule,
    modelingModule,
    bpmnSearchModule
  ];


  describe('collaboration', function() {
    var diagramXML = require('./bpmn-search-collaboration.bpmn');

    beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


    it('should not return root element (collaboration)', inject(function(bpmnSearch) {

      // given
      var pattern = 'collaboration';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expect(elements).to.have.length(0);
    }));

  });


  describe('process', function() {

    var diagramXML = require('./bpmn-search.bpmn');

    beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


    it('find should return all elements that match label or ID', inject(function(bpmnSearch) {

      // given
      var pattern = '123456';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expect(elements).length(3);
      elements.forEach(function(e) {
        expect(e).to.have.property('element');
        expect(e).to.have.property('primaryTokens');
        expect(e).to.have.property('secondaryTokens');
      });
    }));


    it('matches IDs', inject(function(bpmnSearch) {

      // given
      var pattern = 'datastore';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expectTokens(elements[0].primaryTokens, [
        { value: 'has matched ID' }
      ]);
      expectTokens(elements[0].secondaryTokens, [
        { value: 'some_' },
        { value: 'DataStore', match: true },
        { value: '_123456_id' }
      ]);
    }));


    it('should not return root element (process)', inject(function(bpmnSearch) {

      // given
      var pattern = 'process';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expect(elements).to.have.length(0);
    }));


    it('should not return root element (collabsed subprocess)', inject(function(bpmnSearch, elementRegistry) {

      // given
      var subprocessShape = elementRegistry.get('collapsed');
      var pattern = 'Collapsed';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expect(elements).to.have.length(1);
      expect(elements[0].element).to.eql(subprocessShape);
    }));


    describe('should split result into matched and non matched tokens', function() {

      it('matched all', inject(function(bpmnSearch) {

        // given
        var pattern = 'all matched';

        // when
        var elements = bpmnSearch.find(pattern);

        // then
        expectTokens(elements[0].primaryTokens, [
          { value: 'all matched', match: true }
        ]);
      }));


      it('matched start', inject(function(bpmnSearch) {

        // given
        var pattern = 'before';

        // when
        var elements = bpmnSearch.find(pattern);

        // then
        expectTokens(elements[0].primaryTokens, [
          { value: 'before', match: true },
          { value: ' 321' }
        ]);
      }));


      it('matched middle', inject(function(bpmnSearch) {

        // given
        var pattern = 'middle';

        // when
        var elements = bpmnSearch.find(pattern);

        // then
        expectTokens(elements[0].primaryTokens, [
          { value: '123 ' },
          { value: 'middle', match: true },
          { value: ' 321' }
        ]);
      }));


      it('matched end', inject(function(bpmnSearch) {

        // given
        var pattern = 'after';

        // when
        var elements = bpmnSearch.find(pattern);

        // then
        expectTokens(elements[0].primaryTokens, [
          { value: '123 ' },
          { value: 'after', match: true }
        ]);
      }));

    });

  });


  describe('sorting', function() {

    var diagramXML = require('./bpmn-search-sorting.bpmn');

    beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


    it('should sort', inject(function(bpmnSearch) {

      // given
      var pattern = 'foo';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expect(elements).length(6);
      expect(elements[0].element.id).to.eql('foo_2');
      expect(elements[1].element.id).to.eql('foo_3');
      expect(elements[2].element.id).to.eql('bar');
      expect(elements[3].element.id).to.eql('baz');
      expect(elements[4].element.id).to.eql('foo_0');
      expect(elements[5].element.id).to.eql('foo_1');
    }));


    it('should handle elements without label', inject(function(bpmnSearch) {

      // given
      var pattern = 'ass';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expect(elements).length(2);
      expect(elements[0].element.id).to.eql('Association_1');
      expect(elements[1].element.id).to.eql('Association_2');
    }));

  });

});


// helpers ///////////////

function expectTokens(tokens, expectedTokens) {
  const cleanTokens = tokens.map(
    token => pick(token, [ 'value', 'match' ])
  );

  expect(cleanTokens).to.eql(expectedTokens);
}