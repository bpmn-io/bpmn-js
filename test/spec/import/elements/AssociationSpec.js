'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */


var _ = require('lodash');

var fs = require('fs');


describe('import - associations', function() {

  describe('should import association', function() {

    it('connecting task -> text annotation', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/import/association/text-annotation.bpmn', 'utf8');

      // given
      bootstrapViewer(xml)(function(err) {

        if (err) {
          return done(err);
        }

        // when
        inject(function(elementRegistry) {

          var association = elementRegistry.get('Association_1');

          // then
          expect(association).toBeDefined();

          done();
        })();

      });
    });


    it('connecting boundary -> compensate task', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/import/association/compensation.bpmn', 'utf8');

      // given
      bootstrapViewer(xml)(function(err) {

        if (err) {
          return done(err);
        }

        // when
        inject(function(elementRegistry) {

          var association = elementRegistry.get('Association_1');

          // then
          expect(association).toBeDefined();

          done();
        })();

      });
    });

  });


  describe('should import data association', function() {

    it('task -> data object -> task', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/import/association/data-association.bpmn', 'utf8');

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
          expect(dataInputAssociation).toBeDefined();
          expect(dataOutputAssociation).toBeDefined();

          done();
        })();

      });
    });


    it('data input -> task -> data output', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/import/association/data-input-output.bpmn', 'utf8');

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
          expect(dataInputAssociation).toBeDefined();
          expect(dataOutputAssociation).toBeDefined();

          done();
        })();

      });
    });

  });

});