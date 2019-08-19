import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';


describe('import - associations', function() {

  describe('should import association', function() {

    it('connecting task -> text annotation', function(done) {

      var xml = require('./AssociationSpec.text-annotation.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        // when
        inject(function(elementRegistry) {

          var association = elementRegistry.get('Association_1');

          // then
          expect(association).to.exist;

          done(err);
        })();

      });
    });


    it('connecting boundary -> compensate task', function(done) {

      var xml = require('./AssociationSpec.compensation.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

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


    it('task -> data object -> task', function(done) {

      var xml = require('./AssociationSpec.data-association.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        // then
        expectRendered([
          'DataInputAssociation',
          'DataOutputAssociation'
        ]);

        done(err);
      });
    });


    it('data input -> task -> data output', function(done) {

      var xml = require('./AssociationSpec.data-input-output.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        // then
        expectRendered([
          'DataInputAssociation',
          'DataOutputAssociation'
        ]);

        done(err);
      });
    });


    it('in collaboration', function(done) {

      var xml = require('./AssociationSpec.collaboration.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        // then
        expectRendered([
          'DataInputAssociation',
          'DataOutputAssociation'
        ]);

        done(err);
      });
    });


    it('catch event -> data object -> throw event', function(done) {

      var xml = require('./AssociationSpec.events.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        // then
        expectRendered([
          'DataInputAssociation',
          'DataOutputAssociation'
        ]);

        done(err);
      });
    });


    it('boundary event -> data object', function(done) {

      var xml = require('./AssociationSpec.data-association.bpmn');

      // given
      bootstrapViewer(xml)(function(err) {

        // then
        expectRendered([
          'DataOutputAssociation_2'
        ]);

        done(err);
      });

    });

  });

});