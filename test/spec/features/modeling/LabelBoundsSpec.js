import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import Modeler from 'lib/Modeler';

import TestContainer from 'mocha-test-container-support';

var DELTA = 2;


describe('label bounds', function() {

  function createModeler(xml, done) {
    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err, warnings) {
      done(err, warnings, modeler);
    });
  }

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  describe('on import', function() {

    it('should import simple label process', function(done) {
      var xml = require('./LabelBoundsSpec.simple.bpmn');
      createModeler(xml, done);
    });

  });


  describe('on label change', function() {

    var diagramXML = require('./LabelBoundsSpec.simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML));

    var updateLabel;

    beforeEach(inject(function(directEditing) {

      updateLabel = function(shape, text) {
        directEditing.activate(shape);
        directEditing._textbox.content.innerText = text;
        directEditing.complete();
      };

    }));

    describe('label dimensions', function() {

      it('should expand width', inject(function(elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_1'),
            oldLabelWidth = shape.label.width;

        // when
        updateLabel(shape, 'Foooooooooobar');

        // then
        expect(shape.label.width).to.be.above(oldLabelWidth);
      }));


      it('should expand height', inject(function(elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_1'),
            oldLabelHeight = shape.label.height;

        // when
        updateLabel(shape, 'Foo\nbar\nbaz');

        // then
        expect(shape.label.height).to.be.above(oldLabelHeight);
      }));


      it('should reduce width', inject(function(elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_1'),
            oldLabelWidth = shape.label.width;

        // when
        updateLabel(shape, 'i');

        // then
        expect(shape.label.width).to.be.below(oldLabelWidth);
      }));


      it('should reduce height', inject(function(elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_3'),
            oldLabelHeight = shape.label.height;

        // when
        updateLabel(shape, 'One line');

        // then
        expect(shape.label.height).to.be.below(oldLabelHeight);
      }));

    });


    describe('label position', function() {

      var getExpectedX = function(shape) {
        return Math.round(shape.x + shape.width / 2 - shape.label.width / 2);
      };

      it('should shift to left', inject(function(elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_1');

        // when
        updateLabel(shape, 'Foooooooooobar');

        // then
        var expectedX = getExpectedX(shape);

        expect(shape.label.x).to.be.closeTo(expectedX, DELTA);
      }));


      it('should shift to right', inject(function(elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_1');

        // when
        updateLabel(shape, 'F');

        // then
        var expectedX = getExpectedX(shape);

        expect(shape.label.x).to.equal(expectedX);
      }));


      it('should remain the same', inject(function(elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_1');

        // when
        updateLabel(shape, 'FOOBAR');

        // copy old horizontal label position
        var oldX = shape.label.x + 0;

        updateLabel(shape, 'FOOBAR\n1');

        // then
        expect(shape.label.x).to.equal(oldX);
      }));

    });

    describe('label outlines', function() {

      it('should update after element bounds have been updated',
        inject(function(outline, elementRegistry, bpmnRenderer) {

          // given
          var shape = elementRegistry.get('StartEvent_1');

          var outlineSpy = sinon.spy(outline, 'updateShapeOutline');
          var rendererSpy = sinon.spy(bpmnRenderer, 'drawShape');

          // when
          updateLabel(shape, 'Fooooobar');

          // then
          // expect the outline updating to happen after the renderer
          // updated the elements bounds dimensions and position
          sinon.assert.callOrder(
            rendererSpy.withArgs(sinon.match.any, shape.label),
            outlineSpy.withArgs(sinon.match.any, shape.label)
          );
        })

      );

    });


    describe('interaction events', function() {

      it('should update bounds after element bounds have been updated',
        inject(function(interactionEvents, elementRegistry, bpmnRenderer, graphicsFactory) {

          // given
          var shape = elementRegistry.get('StartEvent_1');

          var graphicsFactorySpy = sinon.spy(graphicsFactory, 'update'),
              rendererSpy = sinon.spy(bpmnRenderer, 'drawShape');

          // when
          updateLabel(shape, 'Fooooobar');

          // then
          // expect the interaction event bounds updating to happen after the renderer
          // updated the elements bounds dimensions and position
          sinon.assert.callOrder(
            rendererSpy.withArgs(sinon.match.any, shape.label),
            graphicsFactorySpy
          );
        })
      );

    });

  });


  describe('on export', function() {

    it('should create DI when label has changed', function(done) {

      var xml = require('./LabelBoundsSpec.simple.bpmn');

      createModeler(xml, function(err, warnings, modeler) {

        if (err) {
          return done(err);
        }

        var elementRegistry = modeler.get('elementRegistry'),
            directEditing = modeler.get('directEditing');

        var shape = elementRegistry.get('StartEvent_1');

        directEditing.activate(shape);
        directEditing._textbox.content.innerText = 'BARBAZ';
        directEditing.complete();

        modeler.saveXML({ format: true }, function(err, result) {

          // strip spaces and line breaks after '>'
          result = result.replace(/>\s+/g,'>');

          // get label width and height from XML
          var matches = result.match(/StartEvent_1_di.*?BPMNLabel.*?width="(\d*).*?height="(\d*)/);

          var width = parseInt(matches[1]),
              height = parseInt(matches[2]);

          expect(width).to.equal(shape.label.width);
          expect(height).to.equal(shape.label.height);

          done(err);
        });
      });
    });


    it('should update existing DI when label has changed', function(done) {

      var xml = require('./LabelBoundsSpec.simple.bpmn');

      createModeler(xml, function(err, warnings, modeler) {

        if (err) {
          return done(err);
        }

        var elementRegistry = modeler.get('elementRegistry'),
            directEditing = modeler.get('directEditing');

        var shape = elementRegistry.get('StartEvent_3');

        directEditing.activate(shape);
        directEditing._textbox.content.innerText = 'BARBAZ';
        directEditing.complete();

        modeler.saveXML({ format: true }, function(err, result) {

          // strip spaces and line breaks after '>'
          result = result.replace(/>\s+/g,'>');

          // get label width and height from XML
          var matches = result.match(/StartEvent_3_di.*?BPMNLabel.*?width="(\d*).*?height="(\d*)/);

          var width = parseInt(matches[1]),
              height = parseInt(matches[2]);

          expect(width).to.equal(shape.label.width);
          expect(height).to.equal(shape.label.height);

          done(err);
        });
      });
    });


    it('should not update DI of untouched labels', function(done) {

      var xml = require('./LabelBoundsSpec.simple.bpmn');

      // strip windows line breaks (if any)
      xml = xml.replace(/\r/g, '');

      createModeler(xml, function(err, warnings, modeler) {

        if (err) {
          return done(err);
        }

        modeler.saveXML({ format: true }, function(err, result) {

          if (err) {
            return done(err);
          }

          expect(result).to.equal(xml);

          done(err);
        });
      });
    });

  });

});
