import TestContainer from 'mocha-test-container-support';

import Diagram from 'diagram-js/lib/Diagram';

import ViewerDefaultExport from '../../';

import Viewer from 'lib/Viewer';

import inherits from 'inherits';

import {
  createViewer
} from 'test/TestHelper';


describe('Viewer', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should import simple process', function() {
    var xml = require('../fixtures/bpmn/simple.bpmn');

    // when
    return createViewer(container, Viewer, xml).then(function(result) {

      var err = result.error;
      var warnings = result.warnings;
      var viewer = result.viewer;

      // then
      expect(err).not.to.exist;
      expect(warnings).to.be.empty;

      var definitions = viewer.getDefinitions();

      expect(definitions).to.exist;
      expect(definitions).to.eql(viewer._definitions);
    });
  });


  it('should re-import simple process', function() {

    var xml = require('../fixtures/bpmn/simple.bpmn');

    // given
    return createViewer(container, Viewer, xml).then(function(result) {

      var viewer = result.viewer;

      // when
      // mimic re-import of same diagram
      return viewer.importXML(xml).then(function(result) {

        // then
        expect(result.warnings).to.be.empty;
      });

    });
  });


  it('should be instance of Diagram', function() {

    // when
    var viewer = new Viewer({ container: container });

    // then
    expect(viewer).to.be.instanceof(Diagram);
  });


  describe('overlay support', function() {

    it('should allow to add overlays', function() {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        var viewer = result.viewer;

        expect(err).not.to.exist;

        // when
        var overlays = viewer.get('overlays'),
            elementRegistry = viewer.get('elementRegistry');

        // then
        expect(overlays).to.exist;
        expect(elementRegistry).to.exist;

        // when
        overlays.add('SubProcess_1', {
          position: {
            bottom: 0,
            right: 0
          },
          html: '<div style="max-width: 50px">YUP GREAT STUFF!</div>'
        });

        // then
        expect(overlays.get({ element: 'SubProcess_1' }).length).to.equal(1);
      });

    });

  });


  describe('editor actions support', function() {

    it('should not ship per default', function() {

      // given
      var viewer = new Viewer();

      // when
      var editorActions = viewer.get('editorActions', false);

      // then
      expect(editorActions).not.to.exist;
    });

  });


  describe('error handling', function() {

    function expectMessage(e, expectedMessage) {

      expect(e).to.exist;

      if (expectedMessage instanceof RegExp) {
        expect(e.message).to.match(expectedMessage);
      } else {
        expect(e.message).to.equal(expectedMessage);
      }
    }

    function expectWarnings(warnings, expected) {

      expect(warnings.length).to.equal(expected.length);

      warnings.forEach(function(w, idx) {
        expectMessage(w, expected[idx]);
      });
    }


    it('should handle non-bpmn input', function() {

      var xml = 'invalid stuff';

      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;

        expect(err).to.exist;

        expectMessage(err, /missing start tag/);
      });
    });


    it('should handle invalid BPMNPlane#bpmnElement', function() {

      var xml = require('../fixtures/bpmn/error/di-plane-no-bpmn-element.bpmn');

      // when
      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        var warnings = result.warnings;

        // then
        expect(err).not.to.exist;

        expectWarnings(warnings, [
          'unresolved reference <Collaboration_2>',
          'no bpmnElement referenced in <bpmndi:BPMNPlane id="BPMNPlane_1" />',
          'correcting missing bpmnElement ' +
            'on <bpmndi:BPMNPlane id="BPMNPlane_1" /> ' +
            'to <bpmn:Process id="Process_1" />'
        ]);
      });
    });


    it('should handle invalid namespaced element', function() {

      var xml = require('../fixtures/bpmn/error/categoryValue.bpmn');

      // when
      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        var warnings = result.warnings;

        // then
        expect(err).not.to.exist;

        expectWarnings(warnings, [
          /unparsable content <categoryValue> detected/,
          'unresolved reference <sid-afd7e63e-916e-4bd0-a9f0-98cbff749193>'
        ]);
      });
    });


    it('should handle missing namespace', function() {

      var xml = require('../fixtures/bpmn/error/missing-namespace.bpmn');

      // when
      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        var warnings = result.warnings;

        // then
        expect(err).to.exist;
        expect(err.message).to.eql('failed to parse document as <bpmn:Definitions>');

        expect(warnings).to.have.length(1);
        expect(warnings[0].message).to.match(/unparsable content <definitions> detected/);
      });
    });


    it('should handle duplicate ids', function() {

      var xml = require('../fixtures/bpmn/error/duplicate-ids.bpmn');

      // when
      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        var warnings = result.warnings;

        // then
        expect(err).not.to.exist;

        expectWarnings(warnings, [
          /duplicate ID <test>/
        ]);
      });
    });


    it('should throw error due to missing diagram', function() {

      var xml = require('../fixtures/bpmn/empty-definitions.bpmn');

      // when
      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;

        // then
        expect(err.message).to.eql('no diagram to display');
      });
    });

  });


  describe('dependency injection', function() {

    it('should provide self as <bpmnjs>', function() {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      return createViewer(container, Viewer, xml).then(function(result) {

        var viewer = result.viewer;
        var err = result.error;

        expect(viewer.get('bpmnjs')).to.equal(viewer);
        expect(err).not.to.exist;
      });
    });


    it('should allow Diagram#get before import', function() {

      // when
      var viewer = new Viewer({ container: container });

      // then
      var eventBus = viewer.get('eventBus');

      expect(eventBus).to.exist;
    });


    it('should keep references to services across re-import', function() {

      // given
      var someXML = require('../fixtures/bpmn/simple.bpmn'),
          otherXML = require('../fixtures/bpmn/basic.bpmn');

      var viewer = new Viewer({ container: container });

      var eventBus = viewer.get('eventBus'),
          canvas = viewer.get('canvas');

      // when
      return viewer.importXML(someXML).then(function() {

        // then
        expect(viewer.get('canvas')).to.equal(canvas);
        expect(viewer.get('eventBus')).to.equal(eventBus);

        return viewer.importXML(otherXML);
      }).then(function() {

        // then
        expect(viewer.get('canvas')).to.equal(canvas);
        expect(viewer.get('eventBus')).to.equal(eventBus);
      });
    });
  });


  describe('creation', function() {

    var testModules = [
      { logger: [ 'type', function() { this.called = true; } ] }
    ];

    // given
    var xml = require('../fixtures/bpmn/simple.bpmn');

    var viewer;

    afterEach(function() {
      viewer.destroy();
    });

    it('should override default modules', function() {

      // given
      viewer = new Viewer({ container: container, modules: testModules });

      // when
      return viewer.importXML(xml).catch(function(err) {

        // then
        expect(err.message).to.equal('No provider for "bpmnImporter"! (Resolving: bpmnImporter)');
      });

    });


    it('should add module to default modules', function() {

      // given
      viewer = new Viewer({ container: container, additionalModules: testModules });

      // when
      return viewer.importXML(xml).then(function(result) {

        // then
        var logger = viewer.get('logger');
        expect(logger.called).to.be.true;
      });

    });


    it('should use custom size and position', function() {

      // when
      viewer = new Viewer({
        container: container,
        width: 200,
        height: 100,
        position: 'fixed'
      });

      // then
      expect(viewer._container.style.position).to.equal('fixed');
      expect(viewer._container.style.width).to.equal('200px');
      expect(viewer._container.style.height).to.equal('100px');
    });


    var camundaPackage = require('../fixtures/json/model/camunda');

    it('should provide custom moddle extensions', function() {

      var xml = require('../fixtures/bpmn/extension/camunda.bpmn');

      // given
      viewer = new Viewer({
        container: container,
        moddleExtensions: {
          camunda: camundaPackage
        }
      });

      // when
      return viewer.importXML(xml).then(function(result) {

        var elementRegistry = viewer.get('elementRegistry');

        var taskShape = elementRegistry.get('send'),
            sendTask = taskShape.businessObject;

        // then
        expect(sendTask).to.exist;

        var extensionElements = sendTask.extensionElements;

        // receive task should be moddle extended
        expect(sendTask.$instanceOf('camunda:ServiceTaskLike')).to.be.true;

        // extension elements should provide typed element
        expect(extensionElements).to.exist;
        expect(extensionElements.values).to.exist;

        expect(extensionElements.values).to.have.length(1);
        expect(extensionElements.values[0].$instanceOf('camunda:InputOutput')).to.be.true;
      });

    });


    it('should allow to add default custom moddle extensions', function() {

      // given
      var xml = require('../fixtures/bpmn/extension/custom.bpmn'),
          additionalModdleDescriptors = {
            custom: require('../fixtures/json/model/custom')
          };

      function CustomViewer(options) {
        Viewer.call(this, options);
      }

      inherits(CustomViewer, Viewer);

      CustomViewer.prototype._moddleExtensions = additionalModdleDescriptors;

      viewer = new CustomViewer({
        container: container,
        moddleExtensions: {
          camunda: camundaPackage
        }
      });

      // when
      return viewer.importXML(xml).then(function(result) {

        var elementRegistry = viewer.get('elementRegistry');

        var taskShape = elementRegistry.get('send'),
            sendTask = taskShape.businessObject;

        // then
        expect(sendTask).to.exist;

        var extensionElements = sendTask.extensionElements;

        // receive task should be moddle extended
        expect(sendTask.$instanceOf('camunda:ServiceTaskLike')).to.be.true;
        expect(sendTask.$instanceOf('custom:ServiceTaskGroup')).to.be.true;

        // extension elements should provide typed element
        expect(extensionElements).to.exist;

        expect(extensionElements.values.length).to.equal(2);
        expect(extensionElements.values[0].$instanceOf('camunda:InputOutput')).to.be.true;

        expect(extensionElements.values[1].$instanceOf('custom:CustomSendElement')).to.be.true;
      });

    });


    it('should allow user to override default custom moddle extensions', function() {

      // given
      var xml = require('../fixtures/bpmn/extension/custom-override.bpmn');

      var additionalModdleDescriptors = {
        custom: require('../fixtures/json/model/custom')
      };

      var customOverride = require('../fixtures/json/model/custom-override');

      function CustomViewer(options) {
        Viewer.call(this, options);
      }

      inherits(CustomViewer, Viewer);

      CustomViewer.prototype._moddleExtensions = additionalModdleDescriptors;

      viewer = new CustomViewer({
        container: container,
        moddleExtensions: {
          camunda: camundaPackage,
          custom : customOverride
        }
      });

      // when
      return viewer.importXML(xml).then(function(result) {

        var elementRegistry = viewer.get('elementRegistry');

        var taskShape = elementRegistry.get('send'),
            sendTask = taskShape.businessObject;

        // then
        expect(sendTask).to.exist;

        var extensionElements = sendTask.extensionElements;

        // receive task should be moddle extended
        expect(sendTask.$instanceOf('camunda:ServiceTaskLike')).to.be.true;
        expect(sendTask.$instanceOf('custom:ServiceTaskGroupOverride')).to.be.true;

        // extension elements should provide typed element
        expect(extensionElements).to.exist;

        expect(extensionElements.values.length).to.equal(2);
        expect(extensionElements.values[0].$instanceOf('camunda:InputOutput')).to.be.true;

        expect(extensionElements.values[1].$instanceOf('custom:CustomSendElementOverride')).to.be.true;
      });

    });

  });


  describe('configuration', function() {

    var xml = require('../fixtures/bpmn/simple.bpmn');

    it('should configure Canvas', function() {

      // given
      var viewer = new Viewer({
        container: container,
        canvas: {
          deferUpdate: true
        }
      });

      // when
      return viewer.importXML(xml).then(function(result) {

        var canvasConfig = viewer.get('config.canvas');

        // then
        expect(canvasConfig.deferUpdate).to.be.true;
      });

    });


    describe('container', function() {

      it('should attach if provided', function() {

        var xml = require('../fixtures/bpmn/simple.bpmn');

        var viewer = new Viewer({ container: container });

        return viewer.importXML(xml).then(function(result) {

          expect(viewer._container.parentNode).to.equal(container);
        });
      });


      it('should not attach if absent', function() {

        var xml = require('../fixtures/bpmn/simple.bpmn');

        var viewer = new Viewer();

        return viewer.importXML(xml).then(function(result) {

          expect(viewer._container.parentNode).to.equal(null);
        });
      });

    });

  });


  describe('#importXML', function() {

    it('should emit <import.*> events', function() {

      // given
      var viewer = new Viewer({ container: container });

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var events = [];

      viewer.on([
        'import.parse.start',
        'import.parse.complete',
        'import.render.start',
        'import.render.complete',
        'import.done'
      ], function(e) {

        // log event type + event arguments
        events.push([
          e.type,
          Object.keys(e).filter(function(key) {
            return key !== 'type';
          })
        ]);
      });

      // when
      return viewer.importXML(xml).then(function(result) {

        // then
        expect(events).to.eql([
          [ 'import.parse.start', [ 'xml' ] ],
          [ 'import.parse.complete', ['error', 'definitions', 'context' ] ],
          [ 'import.render.start', [ 'definitions' ] ],
          [ 'import.render.complete', [ 'error', 'warnings' ] ],
          [ 'import.done', [ 'error', 'warnings' ] ]
        ]);
      });
    });


    it('should work without callback', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var xml = require('../fixtures/bpmn/simple.bpmn');

      // when
      viewer.importXML(xml);

      // then
      viewer.on('import.done', function(event) {
        done();
      });
    });


    describe('multiple BPMNDiagram elements', function() {

      var multipleXML = require('../fixtures/bpmn/multiple-diagrams.bpmn');


      it('should import default without bpmnDiagram specified', function() {

        // when
        return createViewer(container, Viewer, multipleXML).then(function(result) {

          var err = result.error;

          // then
          expect(err).not.to.exist;
        });
      });


      it('should import bpmnDiagram specified by id', function() {

        // when
        return createViewer(container, Viewer, multipleXML, 'BpmnDiagram_2').then(function(result) {

          var err = result.error;

          // then
          expect(err).not.to.exist;
        });
      });


      it('should handle diagram not found', function() {

        // given
        var xml = require('../fixtures/bpmn/multiple-diagrams.bpmn');

        // when
        return createViewer(container, Viewer, xml, 'Diagram_IDontExist').then(function(result) {

          var err = result.error;

          // then
          expect(err).to.exist;
          expect(err.message).to.eql('BPMNDiagram <Diagram_IDontExist> not found');
        });
      });


      describe('without callback', function() {

        it('should open default', function(done) {

          // given
          var viewer = new Viewer({ container: container });

          // when
          viewer.importXML(multipleXML);

          // then
          viewer.on('import.done', function(event) {
            done(event.error);
          });
        });


        it('should open specified BPMNDiagram', function(done) {

          // given
          var viewer = new Viewer({ container: container });

          // when
          viewer.importXML(multipleXML, 'BpmnDiagram_2');

          // then
          viewer.on('import.done', function(event) {
            done(event.error);
          });
        });

      });

    });

  });


  describe('#importDefinitions', function() {

    describe('single diagram', function() {

      var xml = require('../fixtures/bpmn/simple.bpmn'),
          viewer,
          definitions;

      beforeEach(function() {
        return createViewer(container, Viewer, xml, null).then(function(result) {

          var error = result.error;
          var tmpViewer = result.viewer;

          if (error) {
            throw error;
          }

          definitions = tmpViewer.getDefinitions();

          tmpViewer.destroy();
        });
      });

      beforeEach(function() {
        viewer = new Viewer({ container: container });
      });

      afterEach(function() {
        viewer.destroy();
      });


      it('should emit <import.*> events', function() {

        // given
        var events = [];

        viewer.on([
          'import.parse.start',
          'import.parse.complete',
          'import.render.start',
          'import.render.complete',
          'import.done'
        ], function(e) {

          // log event type + event arguments
          events.push([
            e.type,
            Object.keys(e).filter(function(key) {
              return key !== 'type';
            })
          ]);
        });

        // when
        return viewer.importDefinitions(definitions).then(function() {

          // then
          expect(events).to.eql([
            [ 'import.render.start', [ 'definitions' ] ],
            [ 'import.render.complete', [ 'error', 'warnings' ] ]
          ]);
        });
      });


      it('should work without callback', function(done) {

        // given
        viewer.on('import.render.complete', function(context) {

          // then
          done(context.error);
        });

        // when
        viewer.importDefinitions(definitions);
      });

    });


    describe('multiple BPMNDiagram elements', function() {

      var multipleXML = require('../fixtures/bpmn/multiple-diagrams.bpmn'),
          viewer,
          definitions;

      beforeEach(function() {
        return createViewer(container, Viewer, multipleXML).then(function(result) {

          var error = result.error;
          var tmpViewer = result.viewer;

          if (error) {
            throw error;
          }

          definitions = tmpViewer.getDefinitions();

          tmpViewer.destroy();
        });
      });

      beforeEach(function() {
        viewer = new Viewer({ container: container });
      });

      afterEach(function() {
        viewer.destroy();
      });


      it('should import default without bpmnDiagram specified', function() {

        // when
        return viewer.importDefinitions(definitions);
      });


      it('should import bpmnDiagram specified by id', function() {

        // when
        return viewer.importDefinitions(definitions, 'BpmnDiagram_2');
      });


      it('should handle diagram not found', function() {

        // when
        return viewer.importDefinitions(definitions, 'Diagram_IDontExist').catch(function(err) {

          // then
          expect(err).to.exist;
          expect(err.message).to.eql('BPMNDiagram <Diagram_IDontExist> not found');
        });
      });


      describe('without callback', function() {

        it('should open default', function(done) {

          // given
          viewer.on('import.render.complete', function(event) {

            // then
            done(event.error);
          });

          // when
          viewer.importDefinitions(definitions);
        });


        it('should open specified BPMNDiagram', function(done) {

          // given
          viewer.on('import.render.complete', function(event) {

            // then
            done(event.error);
          });

          // when
          viewer.importDefinitions(definitions, 'BpmnDiagram_2');
        });

      });

    });
  });


  describe('#open', function() {

    var multipleXMLSimple = require('../fixtures/bpmn/multiple-diagrams.bpmn'),
        multipleXMLOverlappingDI = require('../fixtures/bpmn/multiple-diagrams-overlapping-di.bpmn'),
        multipleXMLWithLaneSet = require('../fixtures/bpmn/multiple-diagrams-lanesets.bpmn'),
        diagram1 = 'BpmnDiagram_1',
        diagram2 = 'BpmnDiagram_2';


    it('should open the first diagram if id was not provided', function() {

      var viewer, renderedDiagram;

      // when
      return createViewer(container, Viewer, multipleXMLSimple, diagram1).then(function(result) {

        var err = result.error;
        viewer = result.viewer;

        expect(err).not.to.exist;

        renderedDiagram = viewer.get('canvas').getRootElement().businessObject.di;

        return viewer.open();
      }).then(function() {

        // then
        expect(viewer.get('canvas').getRootElement().businessObject.di).to.equal(renderedDiagram);
      });
    });


    it('should switch between diagrams', function() {

      var viewer, definitions;

      // when
      return createViewer(container, Viewer, multipleXMLSimple, diagram1).then(function(result) {

        var err = result.error;
        var warnings = result.warnings;
        viewer = result.viewer;

        // then

        expect(err).not.to.exist;

        expect(warnings).to.be.empty;

        definitions = viewer.getDefinitions();

        expect(definitions).to.exist;

        return viewer.open(diagram2);
      }).then(function(result) {

        // then
        var warnings = result.warnings;

        expect(warnings).to.be.empty;

        expect(definitions).to.equal(viewer.getDefinitions());

        var elementRegistry = viewer.get('elementRegistry');

        expect(elementRegistry.get('Task_A')).to.not.exist;
        expect(elementRegistry.get('Task_B')).to.exist;
      });
    });


    it('should switch between diagrams with overlapping DI', function() {

      var viewer, definitions;

      // when
      return createViewer(container, Viewer, multipleXMLOverlappingDI, diagram1).then(function(result) {

        var err = result.error;
        var warnings = result.warnings;
        viewer = result.viewer;

        // then
        expect(err).not.to.exist;

        expect(warnings).to.be.empty;

        definitions = viewer.getDefinitions();

        expect(definitions).to.exist;

        return viewer.open(diagram2);
      }).then(function(result) {

        var warnings = result.warnings;

        expect(warnings).to.be.empty;

        expect(definitions).to.equal(viewer.getDefinitions());
      });
    });


    it('should switch between diagrams with laneSets', function() {

      var viewer, definitions;

      // when
      return createViewer(container, Viewer, multipleXMLWithLaneSet, diagram2).then(function(result) {

        var err = result.error;
        var warnings = result.warnings;
        viewer = result.viewer;

        // then
        expect(err).not.to.exist;

        expect(warnings).to.be.empty;

        definitions = viewer.getDefinitions();

        expect(definitions).to.exist;

        return viewer.open(diagram1);
      }).then(function(result) {

        // then
        var warnings = result.warnings;

        expect(warnings).to.be.empty;

        expect(definitions).to.equal(viewer.getDefinitions());

        var elementRegistry = viewer.get('elementRegistry');

        expect(elementRegistry.get('Task_A')).to.exist;
        expect(elementRegistry.get('Task_B')).to.not.exist;
      });

    });


    it('should complete with error if xml was not imported', function() {

      // given
      var viewer = new Viewer();

      // when
      return viewer.open().catch(function(err) {

        // then
        expect(err).to.exist;
        expect(err.message).to.eql('no XML imported');

        var definitions = viewer.getDefinitions();

        expect(definitions).to.not.exist;
      });

    });


    it('should open with error if diagram does not exist', function() {

      var viewer, definitions;

      // when
      return createViewer(container, Viewer, multipleXMLSimple, diagram1).then(function(result) {

        var err = result.error;
        var warnings = result.warnings;
        viewer = result.viewer;

        // then
        expect(err).not.to.exist;

        expect(warnings).to.be.empty;

        definitions = viewer.getDefinitions();

        expect(definitions).to.exist;

        return viewer.open('Diagram_IDontExist');
      }).catch(function(err) {

        // then
        expect(err).to.exist;
        expect(err.message).to.eql('BPMNDiagram <Diagram_IDontExist> not found');

        // definitions stay the same
        expect(viewer.getDefinitions()).to.eql(definitions);
      });
    });


    it('should emit <import.*> events', function() {

      var viewer = new Viewer({ container: container });

      var events = [];

      return viewer.importXML(multipleXMLSimple, diagram1).then(function(result) {

        // given
        viewer.on([
          'import.parse.start',
          'import.parse.complete',
          'import.render.start',
          'import.render.complete',
          'import.done'
        ], function(e) {

          // log event type + event arguments
          events.push([
            e.type,
            Object.keys(e).filter(function(key) {
              return key !== 'type';
            })
          ]);
        });

        // when
        return viewer.open(diagram2);
      }).then(function() {

        // then
        expect(events).to.eql([
          [ 'import.render.start', [ 'definitions' ] ],
          [ 'import.render.complete', [ 'error', 'warnings' ] ]
        ]);
      });
    });

  });


  describe('#saveXML', function() {

    it('should export XML', function() {

      // given
      var xml = require('../fixtures/bpmn/simple.bpmn');

      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        var viewer = result.viewer;

        expect(err).not.to.exist;

        // when
        return viewer.saveXML({ format: true });
      }).then(function(result) {

        var xml = result.xml;

        // then
        expect(xml).to.contain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).to.contain('<bpmn2:definitions');
        expect(xml).to.contain('  ');
      });
    });


    it('should emit <saveXML.*> events', function() {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var viewer;
      var events = [];

      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        viewer = result.viewer;

        expect(err).not.to.exist;

        viewer.on([
          'saveXML.start',
          'saveXML.serialized',
          'saveXML.done'
        ], function(e) {

          // log event type + event arguments
          events.push([
            e.type,
            Object.keys(e).filter(function(key) {
              return key !== 'type';
            })
          ]);
        });

        return viewer.importXML(xml);
      }).then(function(result) {

        // when
        return viewer.saveXML();
      }).then(function() {

        // then
        expect(events).to.eql([
          [ 'saveXML.start', [ 'definitions' ] ],
          [ 'saveXML.serialized', ['error', 'xml' ] ],
          [ 'saveXML.done', ['error', 'xml' ] ]
        ]);
      });
    });

  });


  describe('#saveSVG', function() {

    function currentTime() {
      return new Date().getTime();
    }

    function validSVG(svg) {
      var expectedStart = '<?xml version="1.0" encoding="utf-8"?>';
      var expectedEnd = '</svg>';

      expect(svg.indexOf(expectedStart)).to.equal(0);
      expect(svg.indexOf(expectedEnd)).to.equal(svg.length - expectedEnd.length);

      // ensure correct rendering of SVG contents
      expect(svg.indexOf('undefined')).to.equal(-1);

      // expect header to be written only once
      expect(svg.indexOf('<svg width="100%" height="100%">')).to.equal(-1);
      expect(svg.indexOf('<g class="viewport"')).to.equal(-1);

      var parser = new DOMParser();
      var svgNode = parser.parseFromString(svg, 'image/svg+xml');

      // [comment, <!DOCTYPE svg>, svg]
      expect(svgNode.childNodes).to.have.length(3);

      // no error body
      expect(svgNode.body).not.to.exist;

      // FIXME(nre): make matcher
      return true;
    }


    it('should export svg', function() {

      // given
      var xml = require('../fixtures/bpmn/simple.bpmn');

      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        var viewer = result.viewer;

        if (err) {
          throw err;
        }

        // when
        return viewer.saveSVG();
      }).then(function(result) {

        var svg = result.svg;

        // then
        expect(validSVG(svg)).to.be.true;
      });
    });


    it('should export huge svg', function() {

      this.timeout(5000);

      // given
      var xml = require('../fixtures/bpmn/complex.bpmn');

      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        var viewer = result.viewer;

        if (err) {
          throw err;
        }

        // when
        return viewer.saveSVG();
      }).then(function(result) {

        var svg = result.svg;

        var time = currentTime();

        // then
        expect(validSVG(svg)).to.be.true;

        // no svg export should not take too long
        expect(currentTime() - time).to.be.below(1000);
      });
    });


    it('should remove outer-makers on export', function() {

      // given
      var xml = require('../fixtures/bpmn/simple.bpmn');
      function appendTestRect(svgDoc) {
        var rect = document.createElementNS(svgDoc.namespaceURI, 'rect');
        rect.setAttribute('class', 'outer-bound-marker');
        rect.setAttribute('width', 500);
        rect.setAttribute('height', 500);
        rect.setAttribute('x', 10000);
        rect.setAttribute('y', 10000);
        svgDoc.appendChild(rect);
      }

      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        var viewer = result.viewer;

        if (err) {
          throw err;
        }

        var svgDoc = viewer._container.childNodes[1].childNodes[1];

        appendTestRect(svgDoc);
        appendTestRect(svgDoc);

        expect(svgDoc.querySelectorAll('.outer-bound-marker')).to.exist;

        // when
        return viewer.saveSVG();
      }).then(function(result) {

        var svg = result.svg;

        var svgDoc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgDoc.innerHTML = svg;

        // then
        expect(validSVG(svg)).to.be.true;
        expect(svgDoc.querySelector('.outer-bound-marker')).to.be.null;

      });
    });


    it('should emit <saveSVG.*> events', function() {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var viewer;
      var events = [];

      return createViewer(container, Viewer, xml).then(function(result) {

        var err = result.error;
        viewer = result.viewer;

        expect(err).not.to.exist;

        viewer.on([
          'saveSVG.start',
          'saveSVG.done'
        ], function(e) {

          // log event type + event arguments
          events.push([
            e.type,
            Object.keys(e).filter(function(key) {
              return key !== 'type';
            })
          ]);
        });

        return viewer.importXML(xml);
      }).then(function() {

        // when
        return viewer.saveSVG();
      }).then(function() {

        // then
        expect(events).to.eql([
          [ 'saveSVG.start', [ ] ],
          [ 'saveSVG.done', ['error', 'svg' ] ]
        ]);
      });
    });

  });


  describe('#on', function() {

    it('should fire with given three', function() {

      // given
      var viewer = new Viewer({ container: container });

      var xml = require('../fixtures/bpmn/simple.bpmn');

      // when
      viewer.on('foo', 1000, function() {
        return 'bar';
      }, viewer);

      // then
      return viewer.importXML(xml).then(function() {
        var eventBus = viewer.get('eventBus');

        var result = eventBus.fire('foo');

        expect(result).to.equal('bar');
      });
    });
  });


  describe('#off', function() {

    var xml = require('../fixtures/bpmn/simple.bpmn');

    it('should remove listener permanently', function() {

      // given
      var viewer = new Viewer({ container: container });

      var handler = function() {
        return 'bar';
      };

      viewer.on('foo', 1000, handler);

      // when
      viewer.off('foo');

      // then
      return viewer.importXML(xml).then(function() {
        var eventBus = viewer.get('eventBus');

        var result = eventBus.fire('foo');

        expect(result).not.to.exist;
      });
    });


    it('should remove listener on existing diagram instance', function() {

      // given
      var viewer = new Viewer({ container: container });

      var handler = function() {
        return 'bar';
      };

      viewer.on('foo', 1000, handler);

      // when
      return viewer.importXML(xml).then(function() {
        var eventBus = viewer.get('eventBus');

        // when
        viewer.off('foo', handler);

        var result = eventBus.fire('foo');

        expect(result).not.to.exist;
      });
    });
  });


  describe('#destroy', function() {

    it('should remove traces in document tree', function() {

      // given
      var viewer = new Viewer({
        container: container
      });

      // when
      viewer.destroy();

      // then
      expect(viewer._container.parentNode).not.to.exist;
    });

  });


  describe('#attachTo', function() {

    it('should attach the viewer', function() {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var viewer = new Viewer();

      return viewer.importXML(xml).then(function(result) {

        // assume
        expect(viewer._container.parentNode).not.to.exist;

        var resizedSpy = sinon.spy();

        viewer.on('canvas.resized', resizedSpy);

        // when
        viewer.attachTo(container);

        // then
        expect(viewer._container.parentNode).to.equal(container);

        // should trigger resized
        expect(resizedSpy).to.have.been.called;
      });
    });
  });


  describe('#detach', function() {

    it('should detach the viewer', function() {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var viewer = new Viewer({ container: container });

      return viewer.importXML(xml).then(function(result) {

        // assume
        expect(viewer._container.parentNode).to.equal(container);

        // when
        viewer.detach();

        // then
        expect(viewer._container.parentNode).not.to.exist;
      });
    });
  });


  describe('#clear', function() {

    it('should NOT clear if no diagram', function() {

      // given
      var viewer = new Viewer({ container: container });

      var eventBus = viewer.get('eventBus');

      var spy = sinon.spy();

      eventBus.on('diagram.clear', spy);

      // when
      viewer.clear();

      // then
      expect(spy).not.to.have.been.called;
    });


    it('should not throw if diagram is already empty', function() {

      // given
      var viewer = new Viewer({ container: container });

      function clearDiagram() {
        viewer.clear();
      }

      // then
      expect(clearDiagram).to.not.throw();
    });


    it('should remove di property', function() {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var viewer = new Viewer({ container: container }),
          elementRegistry = viewer.get('elementRegistry');

      return viewer.importXML(xml).then(function(result) {

        var elements = elementRegistry.getAll();

        // when
        viewer.clear();

        // then
        expect(elements.some(function(el) {
          return el && el.businessObject && el.businessObject.di;
        }), 'at least one element still has di').to.be.false;
      });
    });

  });


  it('default export', function() {
    expect(ViewerDefaultExport).to.equal(Viewer);
  });


  describe('Legacy callback support', function() {

    describe('#importXML', function() {

      it('should emit <import.*> events', function(done) {

        // given
        var viewer = new Viewer({ container: container });

        var xml = require('../fixtures/bpmn/simple.bpmn');

        var events = [];

        viewer.on([
          'import.parse.start',
          'import.parse.complete',
          'import.render.start',
          'import.render.complete',
          'import.done'
        ], function(e) {

          // log event type + event arguments
          events.push([
            e.type,
            Object.keys(e).filter(function(key) {
              return key !== 'type';
            })
          ]);
        });

        // when
        viewer.importXML(xml, function(err) {

          // then
          expect(events).to.eql([
            [ 'import.parse.start', [ 'xml' ] ],
            [ 'import.parse.complete', ['error', 'definitions', 'context' ] ],
            [ 'import.render.start', [ 'definitions' ] ],
            [ 'import.render.complete', [ 'error', 'warnings' ] ],
            [ 'import.done', [ 'error', 'warnings' ] ]
          ]);

          done(err);
        });
      });

    });


    describe('#importDefinitions', function() {

      describe('single diagram', function() {

        var xml = require('../fixtures/bpmn/simple.bpmn'),
            viewer,
            definitions;

        beforeEach(function() {
          return createViewer(container, Viewer, xml, null).then(function(result) {

            var error = result.error;
            var tmpViewer = result.viewer;

            if (error) {
              throw error;
            }

            definitions = tmpViewer.getDefinitions();

            tmpViewer.destroy();
          });
        });

        beforeEach(function() {
          viewer = new Viewer({ container: container });
        });

        afterEach(function() {
          viewer.destroy();
        });


        it('should emit <import.*> events', function(done) {

          // given
          var events = [];

          viewer.on([
            'import.parse.start',
            'import.parse.complete',
            'import.render.start',
            'import.render.complete',
            'import.done'
          ], function(e) {

            // log event type + event arguments
            events.push([
              e.type,
              Object.keys(e).filter(function(key) {
                return key !== 'type';
              })
            ]);
          });

          // when
          viewer.importDefinitions(definitions, function(err) {

            // then
            expect(events).to.eql([
              [ 'import.render.start', [ 'definitions' ] ],
              [ 'import.render.complete', [ 'error', 'warnings' ] ]
            ]);

            done(err);
          });
        });

      });


      describe('multiple BPMNDiagram elements', function() {

        var multipleXML = require('../fixtures/bpmn/multiple-diagrams.bpmn'),
            viewer,
            definitions;

        beforeEach(function() {
          return createViewer(container, Viewer, multipleXML).then(function(result) {

            var error = result.error;
            var tmpViewer = result.viewer;

            if (error) {
              throw error;
            }

            definitions = tmpViewer.getDefinitions();

            tmpViewer.destroy();
          });
        });

        beforeEach(function() {
          viewer = new Viewer({ container: container });
        });

        afterEach(function() {
          viewer.destroy();
        });


        it('should import default without bpmnDiagram specified', function(done) {

          // when
          viewer.importDefinitions(definitions, function(err) {
            done(err);
          });
        });


        it('should import bpmnDiagram specified by id', function(done) {

          // when
          viewer.importDefinitions(definitions, 'BpmnDiagram_2', function(err) {
            done(err);
          });
        });


        it('should handle diagram not found', function(done) {

          // when
          viewer.importDefinitions(definitions, 'Diagram_IDontExist', function(err) {

            // then
            expect(err).to.exist;
            expect(err.message).to.eql('BPMNDiagram <Diagram_IDontExist> not found');
            done();
          });
        });
      });
    });


    describe('#open', function() {

      var multipleXMLSimple = require('../fixtures/bpmn/multiple-diagrams.bpmn'),
          multipleXMLOverlappingDI = require('../fixtures/bpmn/multiple-diagrams-overlapping-di.bpmn'),
          multipleXMLWithLaneSet = require('../fixtures/bpmn/multiple-diagrams-lanesets.bpmn'),
          diagram1 = 'BpmnDiagram_1',
          diagram2 = 'BpmnDiagram_2';


      it('should open the first diagram if id was not provided', function(done) {

        var viewer, renderedDiagram;

        // when
        createViewer(container, Viewer, multipleXMLSimple, diagram1).then(function(result) {

          var err = result.error;
          viewer = result.viewer;

          expect(err).not.to.exist;

          renderedDiagram = viewer.get('canvas').getRootElement().businessObject.di;

          viewer.open(function(err) {

            expect(viewer.get('canvas').getRootElement().businessObject.di).to.equal(renderedDiagram);

            done(err);
          });
        });
      });


      it('should switch between diagrams', function(done) {

        var viewer, definitions;

        // when
        createViewer(container, Viewer, multipleXMLSimple, diagram1).then(function(result) {

          var err = result.error;
          var warnings = result.warnings;
          viewer = result.viewer;

          // then

          expect(err).not.to.exist;

          expect(warnings).to.be.empty;

          definitions = viewer.getDefinitions();

          expect(definitions).to.exist;

          viewer.open(diagram2, function(err, warnings) {

            // then
            expect(warnings).to.be.empty;

            expect(definitions).to.equal(viewer.getDefinitions());

            var elementRegistry = viewer.get('elementRegistry');

            expect(elementRegistry.get('Task_A')).to.not.exist;
            expect(elementRegistry.get('Task_B')).to.exist;

            done(err);
          });
        });
      });


      it('should switch between diagrams with overlapping DI', function(done) {

        var viewer, definitions;

        // when
        createViewer(container, Viewer, multipleXMLOverlappingDI, diagram1).then(function(result) {

          var err = result.error;
          var warnings = result.warnings;
          viewer = result.viewer;

          // then
          expect(err).not.to.exist;

          expect(warnings).to.be.empty;

          definitions = viewer.getDefinitions();

          expect(definitions).to.exist;

          viewer.open(diagram2, function(err, warnings) {

            expect(warnings).to.be.empty;

            expect(definitions).to.equal(viewer.getDefinitions());

            done(err);
          });
        });
      });


      it('should switch between diagrams with laneSets', function(done) {

        var viewer, definitions;

        // when
        createViewer(container, Viewer, multipleXMLWithLaneSet, diagram2).then(function(result) {

          var err = result.error;
          var warnings = result.warnings;
          viewer = result.viewer;

          // then
          expect(err).not.to.exist;

          expect(warnings).to.be.empty;

          definitions = viewer.getDefinitions();

          expect(definitions).to.exist;

          viewer.open(diagram1, function(err, warnings) {

            // then
            expect(warnings).to.be.empty;

            expect(definitions).to.equal(viewer.getDefinitions());

            var elementRegistry = viewer.get('elementRegistry');

            expect(elementRegistry.get('Task_A')).to.exist;
            expect(elementRegistry.get('Task_B')).to.not.exist;

            done(err);
          });
        });
      });


      it('should complete with error if xml was not imported', function(done) {

        // given
        var viewer = new Viewer();

        // when
        viewer.open(function(err) {

          // then
          expect(err).to.exist;
          expect(err.message).to.eql('no XML imported');

          var definitions = viewer.getDefinitions();

          expect(definitions).to.not.exist;

          done();
        });
      });


      it('should open with error if diagram does not exist', function(done) {

        var viewer, definitions;

        // when
        createViewer(container, Viewer, multipleXMLSimple, diagram1).then(function(result) {

          var err = result.error;
          var warnings = result.warnings;
          viewer = result.viewer;

          // then
          expect(err).not.to.exist;

          expect(warnings).to.be.empty;

          definitions = viewer.getDefinitions();

          expect(definitions).to.exist;

          viewer.open('Diagram_IDontExist', function(err) {

            // then
            expect(err).to.exist;
            expect(err.message).to.eql('BPMNDiagram <Diagram_IDontExist> not found');

            // definitions stay the same
            expect(viewer.getDefinitions()).to.eql(definitions);

            done();
          });
        });
      });


      it('should emit <import.*> events', function(done) {

        var viewer = new Viewer({ container: container });

        var events = [];

        viewer.importXML(multipleXMLSimple, diagram1).then(function(result) {

          // given
          viewer.on([
            'import.parse.start',
            'import.parse.complete',
            'import.render.start',
            'import.render.complete',
            'import.done'
          ], function(e) {

            // log event type + event arguments
            events.push([
              e.type,
              Object.keys(e).filter(function(key) {
                return key !== 'type';
              })
            ]);
          });

          // when
          viewer.open(diagram2, function(err) {

            // then
            expect(events).to.eql([
              [ 'import.render.start', [ 'definitions' ] ],
              [ 'import.render.complete', [ 'error', 'warnings' ] ]
            ]);

            done(err);
          });
        });
      });
    });


    describe('#saveXML', function() {

      it('should export XML', function(done) {

        // given
        var xml = require('../fixtures/bpmn/simple.bpmn');

        createViewer(container, Viewer, xml).then(function(result) {

          var err = result.error;
          var viewer = result.viewer;

          expect(err).not.to.exist;

          // when
          viewer.saveXML({ format: true }, function(err, xml) {

            // then
            expect(xml).to.contain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xml).to.contain('<bpmn2:definitions');
            expect(xml).to.contain('  ');

            done();
          });
        });
      });


      it('should emit <saveXML.*> events', function(done) {

        var xml = require('../fixtures/bpmn/simple.bpmn');

        var viewer;
        var events = [];

        createViewer(container, Viewer, xml).then(function(result) {

          var err = result.error;
          viewer = result.viewer;

          expect(err).not.to.exist;

          viewer.on([
            'saveXML.start',
            'saveXML.serialized',
            'saveXML.done'
          ], function(e) {

            // log event type + event arguments
            events.push([
              e.type,
              Object.keys(e).filter(function(key) {
                return key !== 'type';
              })
            ]);
          });

          return viewer.importXML(xml);
        }).then(function(result) {

          // when
          viewer.saveXML(function(err) {

            // then
            expect(events).to.eql([
              [ 'saveXML.start', [ 'definitions' ] ],
              [ 'saveXML.serialized', ['error', 'xml' ] ],
              [ 'saveXML.done', ['error', 'xml' ] ]
            ]);

            done();
          });
        });
      });

    });


    describe('#saveSVG', function() {

      function currentTime() {
        return new Date().getTime();
      }

      function validSVG(svg) {
        var expectedStart = '<?xml version="1.0" encoding="utf-8"?>';
        var expectedEnd = '</svg>';

        expect(svg.indexOf(expectedStart)).to.equal(0);
        expect(svg.indexOf(expectedEnd)).to.equal(svg.length - expectedEnd.length);

        // ensure correct rendering of SVG contents
        expect(svg.indexOf('undefined')).to.equal(-1);

        // expect header to be written only once
        expect(svg.indexOf('<svg width="100%" height="100%">')).to.equal(-1);
        expect(svg.indexOf('<g class="viewport"')).to.equal(-1);

        var parser = new DOMParser();
        var svgNode = parser.parseFromString(svg, 'image/svg+xml');

        // [comment, <!DOCTYPE svg>, svg]
        expect(svgNode.childNodes).to.have.length(3);

        // no error body
        expect(svgNode.body).not.to.exist;

        // FIXME(nre): make matcher
        return true;
      }


      it('should export svg', function(done) {

        // given
        var xml = require('../fixtures/bpmn/simple.bpmn');

        createViewer(container, Viewer, xml).then(function(result) {

          var err = result.error;
          var viewer = result.viewer;

          if (err) {
            throw err;
          }

          // when
          viewer.saveSVG(function(err, svg) {

            // then
            expect(validSVG(svg)).to.be.true;

            done(err);
          });
        });
      });


      it('should export huge svg', function(done) {

        this.timeout(5000);

        // given
        var xml = require('../fixtures/bpmn/complex.bpmn');

        createViewer(container, Viewer, xml).then(function(result) {

          var err = result.error;
          var viewer = result.viewer;

          if (err) {
            throw err;
          }

          // when
          viewer.saveSVG(function(err, svg) {

            var time = currentTime();

            // then
            expect(validSVG(svg)).to.be.true;

            // no svg export should not take too long
            expect(currentTime() - time).to.be.below(1000);

            done(err);
          });
        });
      });


      it('should remove outer-makers on export', function(done) {

        // given
        var xml = require('../fixtures/bpmn/simple.bpmn');
        function appendTestRect(svgDoc) {
          var rect = document.createElementNS(svgDoc.namespaceURI, 'rect');
          rect.setAttribute('class', 'outer-bound-marker');
          rect.setAttribute('width', 500);
          rect.setAttribute('height', 500);
          rect.setAttribute('x', 10000);
          rect.setAttribute('y', 10000);
          svgDoc.appendChild(rect);
        }

        createViewer(container, Viewer, xml).then(function(result) {

          var err = result.error;
          var viewer = result.viewer;

          if (err) {
            throw err;
          }

          var svgDoc = viewer._container.childNodes[1].childNodes[1];

          appendTestRect(svgDoc);
          appendTestRect(svgDoc);

          expect(svgDoc.querySelectorAll('.outer-bound-marker')).to.exist;

          // when
          viewer.saveSVG(function(err, svg) {

            var svgDoc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgDoc.innerHTML = svg;

            // then
            expect(validSVG(svg)).to.be.true;
            expect(svgDoc.querySelector('.outer-bound-marker')).to.be.null;

            done(err);
          });
        });
      });


      it('should emit <saveSVG.*> events', function(done) {

        var xml = require('../fixtures/bpmn/simple.bpmn');

        var viewer;
        var events = [];

        createViewer(container, Viewer, xml).then(function(result) {

          var err = result.error;
          viewer = result.viewer;

          expect(err).not.to.exist;

          viewer.on([
            'saveSVG.start',
            'saveSVG.done'
          ], function(e) {

            // log event type + event arguments
            events.push([
              e.type,
              Object.keys(e).filter(function(key) {
                return key !== 'type';
              })
            ]);
          });

          return viewer.importXML(xml);
        }).then(function() {

          // when
          viewer.saveSVG(function(err) {

            // then
            expect(events).to.eql([
              [ 'saveSVG.start', [ ] ],
              [ 'saveSVG.done', ['error', 'svg' ] ]
            ]);

            done(err);
          });
        });
      });

    });
  });
});
