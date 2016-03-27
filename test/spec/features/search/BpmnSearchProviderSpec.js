'use strict';

var coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    bpmnSearchModule = require('../../../../lib/features/search');

/* global bootstrapViewer, inject */

describe('features - BPMN search provider', function() {

  var diagramXML = require('./bpmn-search.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    bpmnSearchModule
  ];

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
    expect(elements[0].primaryTokens).to.eql([
      { normal: 'has matched ID'}
    ]);
    expect(elements[0].secondaryTokens).to.eql([
      { normal: 'some_'},
      { matched: 'DataStore'},
      { normal: '_123456_id'},
    ]);
  }));


  describe('should split result into matched and non matched tokens', function() {

    it('matched all', inject(function(bpmnSearch) {
      // given
      var pattern = 'all matched';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expect(elements[0].primaryTokens).to.eql([
        { matched: 'all matched'}
      ]);
    }));


    it('matched start', inject(function(bpmnSearch) {
      // given
      var pattern = 'before';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expect(elements[0].primaryTokens).to.eql([
        { matched: 'before'},
        { normal: ' 321'}
      ]);
    }));


    it('matched middle', inject(function(bpmnSearch) {
      // given
      var pattern = 'middle';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expect(elements[0].primaryTokens).to.eql([
        { normal: '123 '},
        { matched: 'middle'},
        { normal: ' 321'}
      ]);
    }));


    it('matched end', inject(function(bpmnSearch) {
      // given
      var pattern = 'after';

      // when
      var elements = bpmnSearch.find(pattern);

      // then
      expect(elements[0].primaryTokens).to.eql([
        { normal: '123 '},
        { matched: 'after'}
      ]);
    }));

  });

});
