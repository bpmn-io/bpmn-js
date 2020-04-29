import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';


describe('import - associations', function() {

  describe('should import association', function() {

    it('connecting task -> text annotation', function() {

      var xml = require('./AssociationSpec.text-annotation.bpmn');

      // given
      return bootstrapViewer(xml)().then(function(result) {

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

      var xml = require('./AssociationSpec.compensation.bpmn');

      // given
      return bootstrapViewer(xml)().then(function(result) {

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

      var xml = require('./AssociationSpec.data-association.bpmn');

      // given
      return bootstrapViewer(xml)().then(function(result) {

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

      var xml = require('./AssociationSpec.data-input-output.bpmn');

      // given
      return bootstrapViewer(xml)().then(function(result) {

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

      var xml = require('./AssociationSpec.collaboration.bpmn');

      // given
      return bootstrapViewer(xml)().then(function(result) {

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

      var xml = require('./AssociationSpec.events.bpmn');

      // given
      return bootstrapViewer(xml)().then(function(result) {

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

      var xml = require('./AssociationSpec.data-association.bpmn');

      // given
      return bootstrapViewer(xml)().then(function(result) {

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
