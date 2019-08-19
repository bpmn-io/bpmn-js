import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import bpmnSearchModule from 'lib/features/search';


describe('features - BPMN search provider', function() {

  var testModules = [
    coreModule,
    modelingModule,
    bpmnSearchModule
  ];


  describe(' - with collaboration as root - ', function() {
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


  describe(' - with process as root - ', function() {
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
      expect(elements[0].primaryTokens).to.eql([
        { normal: 'has matched ID' }
      ]);
      expect(elements[0].secondaryTokens).to.eql([
        { normal: 'some_' },
        { matched: 'DataStore' },
        { normal: '_123456_id' }
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


    describe('should split result into matched and non matched tokens', function() {

      it('matched all', inject(function(bpmnSearch) {

        // given
        var pattern = 'all matched';

        // when
        var elements = bpmnSearch.find(pattern);

        // then
        expect(elements[0].primaryTokens).to.eql([
          { matched: 'all matched' }
        ]);
      }));


      it('matched start', inject(function(bpmnSearch) {

        // given
        var pattern = 'before';

        // when
        var elements = bpmnSearch.find(pattern);

        // then
        expect(elements[0].primaryTokens).to.eql([
          { matched: 'before' },
          { normal: ' 321' }
        ]);
      }));


      it('matched middle', inject(function(bpmnSearch) {

        // given
        var pattern = 'middle';

        // when
        var elements = bpmnSearch.find(pattern);

        // then
        expect(elements[0].primaryTokens).to.eql([
          { normal: '123 ' },
          { matched: 'middle' },
          { normal: ' 321' }
        ]);
      }));


      it('matched end', inject(function(bpmnSearch) {

        // given
        var pattern = 'after';

        // when
        var elements = bpmnSearch.find(pattern);

        // then
        expect(elements[0].primaryTokens).to.eql([
          { normal: '123 ' },
          { matched: 'after' }
        ]);
      }));

    });



  });

});
