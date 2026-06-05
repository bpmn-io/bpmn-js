import { expect } from 'chai';
import sinon from 'sinon';
import { expectToBeAccessible } from '@bpmn-io/a11y';

import {
  query as domQuery
} from 'min-dom';

import TestContainer from 'mocha-test-container-support';

import Diagram from 'diagram-js/lib/Diagram.js';

import ViewerDefaultExport from 'bpmn-js';

import Viewer from 'bpmn-js/lib/Viewer.js';

import inherits from 'inherits-browser';

import {
  createViewer
} from 'bpmn-js/test/TestHelper.js';

import { getDi } from 'bpmn-js/lib/util/ModelUtil.js';

import simpleXML from '../fixtures/bpmn/simple.bpmn';
import diPlaneNoBpmnElementXML from '../fixtures/bpmn/error/di-plane-no-bpmn-element.bpmn';
import categoryValueXML from '../fixtures/bpmn/error/categoryValue.bpmn';
import missingNamespaceXML from '../fixtures/bpmn/error/missing-namespace.bpmn';
import duplicateIdsXML from '../fixtures/bpmn/error/duplicate-ids.bpmn';
import emptyDefinitionsXML from '../fixtures/bpmn/empty-definitions.bpmn';
import noProcessCollaborationXML from '../fixtures/bpmn/error/no-process-collaboration.bpmn';
import otherXML from '../fixtures/bpmn/basic.bpmn';
import collapsedSubProcessXML from '../fixtures/bpmn/collapsed-sub-process.bpmn';
import collapsedSubProcessLegacyXML from '../fixtures/bpmn/collapsed-sub-process-legacy.bpmn';
import multipleNestedProcessesXML from '../fixtures/bpmn/multiple-nested-processes.bpmn';
import camundaModdle from '../fixtures/json/model/camunda.json';
import camundaXML from '../fixtures/bpmn/extension/camunda.bpmn';
import customXML from '../fixtures/bpmn/extension/custom.bpmn';
import customModdle from '../fixtures/json/model/custom.json';
import customOverrideXML from '../fixtures/bpmn/extension/custom-override.bpmn';
import customOverrideModdle from '../fixtures/json/model/custom-override.json';
import multipleXML from '../fixtures/bpmn/multiple-diagrams.bpmn';
import multipleXMLOverlappingDI from '../fixtures/bpmn/multiple-diagrams-overlapping-di.bpmn';
import multipleXMLWithLaneSet from '../fixtures/bpmn/multiple-diagrams-lanesets.bpmn';
import complexXML from '../fixtures/bpmn/complex.bpmn';


var singleStart = window.__env__ && window.__env__.SINGLE_START === 'viewer';


describe('Viewer', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  (singleStart ? it.only : it)('should import simple process', function() {

    // when
    return createViewer(container, Viewer, simpleXML).then(function(result) {

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


    // given
    return createViewer(container, Viewer, simpleXML).then(function(result) {

      var viewer = result.viewer;

      // when
      // mimic re-import of same diagram
      return viewer.importXML(simpleXML).then(function(result) {

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


  it('should not include Outline module by default', function() {

    // given
    var viewer = new Viewer();

    // when
    var outline = viewer.get('outline', false);

    // then
    expect(outline).not.to.exist;
  });


  describe('overlay support', function() {

    it('should allow to add overlays', function() {


      return createViewer(container, Viewer, simpleXML).then(function(result) {

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

      var simpleXML = 'invalid stuff';

      return createViewer(container, Viewer, simpleXML).then(function(result) {

        var err = result.error;

        expect(err).to.exist;

        expectMessage(err, /missing start tag/);
      });
    });


    it('should handle invalid BPMNPlane#bpmnElement', function() {


      // when
      return createViewer(container, Viewer, diPlaneNoBpmnElementXML).then(function(result) {

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


      // when
      return createViewer(container, Viewer, categoryValueXML).then(function(result) {

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


      // when
      return createViewer(container, Viewer, missingNamespaceXML).then(function(result) {

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


      // when
      return createViewer(container, Viewer, duplicateIdsXML).then(function(result) {

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


      // when
      return createViewer(container, Viewer, emptyDefinitionsXML).then(function(result) {

        var err = result.error;

        // then
        expect(err.message).to.eql('no diagram to display');
      });
    });


    it('should handle missing process/collaboration', function() {


      // when
      return createViewer(container, Viewer, noProcessCollaborationXML).then(function(result) {

        var err = result.error;

        // then
        expect(err.message).to.eql('no process or collaboration to display');
      });
    });

  });


  describe('dependency injection', function() {

    it('should provide self as <bpmnjs>', function() {


      return createViewer(container, Viewer, simpleXML).then(function(result) {

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
      var someXML = simpleXML;

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


  describe('drill down', function() {

    function verifyDrilldown(xml) {

      return createViewer(container, Viewer, xml).then(function() {
        var drilldown = domQuery('.bjs-drilldown', container);
        var breadcrumbs = domQuery('.bjs-breadcrumbs', container);
        var djsContainer = domQuery('.djs-container', container);

        // assume
        expect(drilldown).to.exist;
        expect(breadcrumbs).to.exist;
        expect(djsContainer.classList.contains('bjs-breadcrumbs-shown')).to.be.false;

        // when
        drilldown.click();

        // then
        expect(djsContainer.classList.contains('bjs-breadcrumbs-shown')).to.be.true;
      });

    }

    it('should allow drill down into collapsed sub-process', function() {

      return verifyDrilldown(collapsedSubProcessXML);
    });


    it('should allow drill down into legacy collapsed sub-process', function() {

      return verifyDrilldown(collapsedSubProcessLegacyXML);
    });


    it('should allow drill down into multi-di collapsed sub-process', function() {

      return verifyDrilldown(multipleNestedProcessesXML);
    });

  });


  describe('creation', function() {

    var testModules = [
      { logger: [ 'type', function() { this.called = true; } ] }
    ];

    // given

    var viewer;

    afterEach(function() {
      viewer.destroy();
    });

    it('should override default modules', function() {

      // given
      viewer = new Viewer({ container: container, modules: testModules });

      // when
      return viewer.importXML(simpleXML).catch(function(err) {

        // then
        expect(err.message).to.equal('No provider for "bpmnImporter"! (Resolving: bpmnImporter)');
      });

    });


    it('should add module to default modules', function() {

      // given
      viewer = new Viewer({ container: container, additionalModules: testModules });

      // when
      return viewer.importXML(simpleXML).then(function(result) {

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



    it('should provide custom moddle extensions', function() {


      // given
      viewer = new Viewer({
        container: container,
        moddleExtensions: {
          camunda: camundaModdle
        }
      });

      // when
      return viewer.importXML(camundaXML).then(function(result) {

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
      var simpleXML = customXML,
          additionalModdleDescriptors = {
            custom: customModdle
          };

      function CustomViewer(options) {
        Viewer.call(this, options);
      }

      inherits(CustomViewer, Viewer);

      CustomViewer.prototype._moddleExtensions = additionalModdleDescriptors;

      viewer = new CustomViewer({
        container: container,
        moddleExtensions: {
          camunda: camundaModdle
        }
      });

      // when
      return viewer.importXML(simpleXML).then(function(result) {

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

      var additionalModdleDescriptors = {
        custom: customModdle
      };


      function CustomViewer(options) {
        Viewer.call(this, options);
      }

      inherits(CustomViewer, Viewer);

      CustomViewer.prototype._moddleExtensions = additionalModdleDescriptors;

      viewer = new CustomViewer({
        container: container,
        moddleExtensions: {
          camunda: camundaModdle,
          custom : customOverrideModdle
        }
      });

      // when
      return viewer.importXML(customOverrideXML).then(function(result) {

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


    it('should configure Canvas', function() {

      // given
      var viewer = new Viewer({
        container: container,
        canvas: {
          deferUpdate: true
        }
      });

      // when
      return viewer.importXML(simpleXML).then(function(result) {

        var canvasConfig = viewer.get('config.canvas');

        // then
        expect(canvasConfig.deferUpdate).to.be.true;
      });

    });


    describe('container', function() {

      it('should attach if provided', function() {


        var viewer = new Viewer({ container: container });

        return viewer.importXML(simpleXML).then(function(result) {

          expect(viewer._container.parentNode).to.equal(container);
        });
      });


      it('should not attach if absent', function() {


        var viewer = new Viewer();

        return viewer.importXML(simpleXML).then(function(result) {

          expect(viewer._container.parentNode).to.equal(null);
        });
      });

    });

  });


  describe('#importXML', function() {

    it('should emit <import.*> events', function() {

      // given
      var viewer = new Viewer({ container: container });


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
      return viewer.importXML(simpleXML).then(function(result) {

        // then
        expect(events).to.eql([
          [ 'import.parse.start', [ 'xml' ] ],
          [ 'import.parse.complete', [ 'error', 'definitions', 'elementsById', 'references', 'warnings' ] ],
          [ 'import.render.start', [ 'definitions' ] ],
          [ 'import.render.complete', [ 'error', 'warnings' ] ],
          [ 'import.done', [ 'error', 'warnings' ] ]
        ]);
      });
    });


    it('should work without callback', function(done) {

      // given
      var viewer = new Viewer({ container: container });


      // when
      viewer.importXML(simpleXML);

      // then
      viewer.on('import.done', function(event) {
        done();
      });
    });


    describe('multiple BPMNDiagram elements', function() {



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

        // when
        return createViewer(container, Viewer, multipleXML, 'Diagram_IDontExist').then(function(result) {

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

      var viewer, definitions;

      beforeEach(function() {
        return createViewer(container, Viewer, simpleXML, null).then(function(result) {

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

      var viewer, definitions;

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

    var multipleXMLSimple = multipleXML, diagram1 = 'BpmnDiagram_1', diagram2 = 'BpmnDiagram_2';


    it('should open the first diagram if id was not provided', function() {

      var viewer, renderedDiagram;

      // when
      return createViewer(container, Viewer, multipleXMLSimple, diagram1).then(function(result) {

        var err = result.error;
        viewer = result.viewer;

        expect(err).not.to.exist;

        renderedDiagram = getDi(viewer.get('canvas').getRootElement());

        return viewer.open();
      }).then(function() {

        // then
        expect(getDi(viewer.get('canvas').getRootElement())).to.equal(renderedDiagram);
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


    it('should complete with error if simpleXML was not imported', function() {

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

      return createViewer(container, Viewer, simpleXML).then(function(result) {

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


      var viewer;
      var events = [];

      return createViewer(container, Viewer, simpleXML).then(function(result) {

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

        return viewer.importXML(simpleXML);
      }).then(function(result) {

        // when
        return viewer.saveXML();
      }).then(function() {

        // then
        expect(events).to.eql([
          [ 'saveXML.start', [ 'definitions' ] ],
          [ 'saveXML.serialized', [ 'xml' ] ],
          [ 'saveXML.done', [ 'xml' ] ]
        ]);
      });
    });


    it('should emit <saveXML.done> on error', function() {


      var viewer;
      var events = [];

      return createViewer(container, Viewer, simpleXML).then(function(result) {

        var err = result.error;
        viewer = result.viewer;

        expect(err).not.to.exist;

        // when
        viewer.on('saveXML.start', 250, function() {
          throw new Error('failing pre-save listener');
        });

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

        return viewer.importXML(simpleXML);
      }).then(function(result) {

        // when
        return viewer.saveXML();
      }).catch(function(error) {
        events.push([ 'error' ]);
      }).finally(function() {

        // then
        expect(events).to.eql([
          [ 'saveXML.start', [ 'definitions' ] ],
          [ 'saveXML.done', [ 'error' ] ],
          [ 'error' ]
        ]);
      });

    });


    it('should emit <saveXML.done> on no definitions loaded', function() {

      var events = [];

      var viewer = new Viewer({
        container: container
      });

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

      return viewer.saveXML().catch(function(error) {
        events.push([ 'error' ]);
      }).finally(function() {

        // then
        expect(events).to.eql([
          [ 'saveXML.done', [ 'error' ] ],
          [ 'error' ]
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

      // expect svg to not be empty
      expect(svg.indexOf('<g')).not.to.equal(-1);

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

      return createViewer(container, Viewer, simpleXML).then(function(result) {

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

      return createViewer(container, Viewer, complexXML).then(function(result) {

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
      function appendTestRect(svgDoc) {
        var rect = document.createElementNS(svgDoc.namespaceURI, 'rect');
        rect.setAttribute('class', 'outer-bound-marker');
        rect.setAttribute('width', 500);
        rect.setAttribute('height', 500);
        rect.setAttribute('x', 10000);
        rect.setAttribute('y', 10000);
        svgDoc.appendChild(rect);
      }

      return createViewer(container, Viewer, simpleXML).then(function(result) {

        var err = result.error;
        var viewer = result.viewer;

        if (err) {
          throw err;
        }

        var svgDoc = domQuery('svg', viewer._container);

        appendTestRect(svgDoc);
        appendTestRect(svgDoc);

        expect(domQuery('.outer-bound-marker', svgDoc)).to.exist;

        // when
        return viewer.saveSVG();
      }).then(function(result) {

        var svg = result.svg;

        var svgDoc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgDoc.innerHTML = svg;

        // then
        expect(validSVG(svg)).to.be.true;
        expect(domQuery('.outer-bound-marker', svgDoc)).not.to.exist;

      });
    });


    it('should emit <saveSVG.*> events', function() {


      var viewer;
      var events = [];

      return createViewer(container, Viewer, simpleXML).then(function(result) {

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

        return viewer.importXML(simpleXML);
      }).then(function() {

        // when
        return viewer.saveSVG();
      }).then(function() {

        // then
        expect(events).to.eql([
          [ 'saveSVG.start', [ ] ],
          [ 'saveSVG.done', [ 'error', 'svg' ] ]
        ]);
      });
    });

  });


  describe('#on', function() {

    it('should fire with given three', function() {

      // given
      var viewer = new Viewer({ container: container });


      // when
      viewer.on('foo', 1000, function() {
        return 'bar';
      }, viewer);

      // then
      return viewer.importXML(simpleXML).then(function() {
        var eventBus = viewer.get('eventBus');

        var result = eventBus.fire('foo');

        expect(result).to.equal('bar');
      });
    });
  });


  describe('#off', function() {


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
      return viewer.importXML(simpleXML).then(function() {
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
      return viewer.importXML(simpleXML).then(function() {
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


      var viewer = new Viewer();

      return viewer.importXML(simpleXML).then(function(result) {

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


      var viewer = new Viewer({ container: container });

      return viewer.importXML(simpleXML).then(function(result) {

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

  });


  it('default export', function() {
    expect(ViewerDefaultExport).to.equal(Viewer);
  });


  describe('accessibility', function() {

    it('should report no issues', async function() {

      // given
      await createViewer(container, Viewer, simpleXML);

      // then
      await expectToBeAccessible(container);
    });

  });

});
