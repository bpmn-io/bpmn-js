'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */


describe('import - associations', function() {

  describe('should import association', function() {

    it('connecting task -> text annotation', function(done) {

      var xml = require('../../../fixtures/bpmn/import/association/text-annotation.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        if (err) {
          return done(err);
        }

        // when
        inject(function(elementRegistry) {

          var association = elementRegistry.get('Association_1');

          // then
          expect(association).to.exist;

          done();
        })();

      });
    });


    it('connecting boundary -> compensate task', function(done) {

      var xml = require('../../../fixtures/bpmn/import/association/compensation.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        if (err) {
          return done(err);
        }

        // when
        inject(function(elementRegistry) {

          var association = elementRegistry.get('Association_1');

          // then
          expect(association).to.exist;

          done();
        })();

      });
    });

  });


  describe('should import data association', function() {

    it('task -> data object -> task', function(done) {

      var xml = require('../../../fixtures/bpmn/import/association/data-association.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        if (err) {
          return done(err);
        }

        // when
        inject(function(elementRegistry) {

          var dataInputAssociation = elementRegistry.get('DataInputAssociation_1');
          var dataOutputAssociation = elementRegistry.get('DataOutputAssociation_1');

          // then
          expect(dataInputAssociation).to.exist;
          expect(dataOutputAssociation).to.exist;

          done();
        })();

      });
    });


    it('data input -> task -> data output', function(done) {

      var xml = require('../../../fixtures/bpmn/import/association/data-input-output.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        if (err) {
          return done(err);
        }

        // when
        inject(function(elementRegistry) {

          var dataInputAssociation = elementRegistry.get('DataInputAssociation_1');
          var dataOutputAssociation = elementRegistry.get('DataOutputAssociation_1');

          // then
          expect(dataInputAssociation).to.exist;
          expect(dataOutputAssociation).to.exist;

          done();
        })();

      });
    });


    it('catch event -> data object -> throw event', function(done) {

      var xml = require('../../../fixtures/bpmn/import/association/data-association-events.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        if (err) {
          return done(err);
        }

        // when
        inject(function(elementRegistry) {

          var dataInputAssociation = elementRegistry.get('DataInputAssociation');
          var dataOutputAssociation = elementRegistry.get('DataOutputAssociation');

          // then
          expect(dataInputAssociation).to.exist;
          expect(dataOutputAssociation).to.exist;

          done();
        })();

      });
    });

  });

});