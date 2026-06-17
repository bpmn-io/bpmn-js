import { expect } from 'chai';
import {
  bootstrapViewer,
  inject
} from 'bpmn-js/test/TestHelper.js';

import textAnnotationXML from './AssociationSpec.text-annotation.bpmn';
import compensationXML from './AssociationSpec.compensation.bpmn';
import dataAssociationXML from './AssociationSpec.data-association.bpmn';
import cataInputOutputXML from './AssociationSpec.data-input-output.bpmn';
import collaborationXML from './AssociationSpec.collaboration.bpmn';
import eventsXML from './AssociationSpec.events.bpmn';


describe('import - associations', function() {

  describe('should import association', function() {

    it('connecting task -> text annotation', function() {

      // given
      return bootstrapViewer(textAnnotationXML)().then(function(result) {

        var err = result.error;

        expect(err).not.to.exist;

        // when
        inject(function(elementRegistry) {

          var association = elementRegistry.get('Association_1');

          // then
          expect(association).to.exist;
        })();

      });
    });


    it('connecting boundary -> compensate task', function() {


      // given
      return bootstrapViewer(compensationXML)().then(function(result) {

        var err = result.error;

        expect(err).not.to.exist;

        // when
        inject(function(elementRegistry) {

          var association = elementRegistry.get('Association_1');

          // then
          expect(association).to.exist;
        })();

      });
    });

  });


  describe('should import data association', function() {

    function expectRendered(elementIds) {

      inject(function(elementRegistry, canvas) {

        elementIds.forEach(function(id) {

          var element = elementRegistry.get(id);

          // then
          expect(element).to.exist;

          // data associations always rendered on root
          expect(element.parent).to.eql(canvas.getRootElement());
        });
      })();
    }


    it('task -> data object -> task', function() {


      // given
      return bootstrapViewer(dataAssociationXML)().then(function(result) {

        var err = result.error;

        // then
        expect(err).not.to.exist;

        expectRendered([
          'DataInputAssociation',
          'DataOutputAssociation'
        ]);
      });
    });


    it('data input -> task -> data output', function() {


      // given
      return bootstrapViewer(cataInputOutputXML)().then(function(result) {

        var err = result.error;

        // then
        expect(err).not.to.exist;

        expectRendered([
          'DataInputAssociation',
          'DataOutputAssociation'
        ]);
      });
    });


    it('in collaboration', function() {


      // given
      return bootstrapViewer(collaborationXML)().then(function(result) {

        var err = result.error;

        // then
        expect(err).not.to.exist;

        expectRendered([
          'DataInputAssociation',
          'DataOutputAssociation'
        ]);
      });
    });


    it('catch event -> data object -> throw event', function() {


      // given
      return bootstrapViewer(eventsXML)().then(function(result) {

        var err = result.error;

        // then
        expect(err).not.to.exist;

        expectRendered([
          'DataInputAssociation',
          'DataOutputAssociation'
        ]);
      });
    });


    it('boundary event -> data object', function() {


      // given
      return bootstrapViewer(dataAssociationXML)().then(function(result) {

        var err = result.error;

        // then
        expect(err).not.to.exist;
        expectRendered([
          'DataOutputAssociation_2'
        ]);
      });

    });

  });

});
