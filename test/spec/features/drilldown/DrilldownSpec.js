import { expectToBeAccessible } from '@bpmn-io/a11y';

import {
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import drilldownModule from 'lib/features/drilldown';
import modelingModule from 'lib/features/modeling';
import { bootstrapModeler, getBpmnJS } from '../../../helper';
import { classes } from 'min-dom';


describe('features - drilldown', function() {

  var testModules = [
    coreModule,
    modelingModule,
    drilldownModule
  ];

  var collaborationXML = require('./collaboration-subprocesses.bpmn');
  var multiLayerXML = require('./nested-subprocesses.bpmn');
  var legacyXML = require('./legacy-subprocesses.bpmn');

  beforeEach(bootstrapModeler(multiLayerXML, { modules: testModules }));


  describe('Overlays', function() {

    it('should show overlay on Subprocess with content', inject(function(elementRegistry, overlays) {

      // given
      var collapsedProcess = elementRegistry.get('collapsedProcess');
      var overlay = overlays.get({ element: collapsedProcess });

      // then
      expect(overlay).to.exist;
    }));


    it('should not show overlay on Subprocess without content', inject(function(elementRegistry, overlays) {

      // given
      var collapsedProcess = elementRegistry.get('collapsedProcess_withoutContent');
      var overlay = overlays.get({ element: collapsedProcess });

      // then
      expect(overlay).to.not.exist;
    }));


    it('should switch plane on click', inject(function(elementRegistry, overlays, canvas) {

      // given
      var collapsedProcess = elementRegistry.get('collapsedProcess');
      var overlay = overlays.get({ element: collapsedProcess })[0];

      // when
      overlay.html.click();

      // then
      var collapsedRoot = canvas.getRootElement();

      expect(collapsedRoot.businessObject).to.equal(collapsedProcess.businessObject);
    }));

  });


  describe('Breadcrumbs', function() {

    it('should not show breadcrumbs in root view', inject(function(canvas) {

      // given
      var container = canvas.getContainer();

      // then
      expect(classes(container).contains('bjs-breadcrumbs-shown')).to.be.false;
    }));


    it('should show breadcrumbs in subprocess view', inject(function(canvas) {

      // given
      var container = canvas.getContainer();

      // when
      canvas.setRootElement(canvas.findRoot('collapsedProcess_plane'));

      // then
      expect(classes(container).contains('bjs-breadcrumbs-shown')).to.be.true;
    }));


    it('should show execution tree', inject(function(canvas) {

      // when
      canvas.setRootElement(canvas.findRoot('collapsedProcess_2_plane'));

      // then
      expectBreadcrumbs([
        'Root',
        'Collapsed Process',
        'Expanded Process',
        'Collapsed Process 2'
      ]);
    }));


    it('should switch to process plane on click', inject(function(canvas) {

      // given
      var subRoot = canvas.findRoot('collapsedProcess_plane');
      var nestedRoot = canvas.findRoot('collapsedProcess_2_plane');

      canvas.setRootElement(nestedRoot);

      // when
      clickBreadcrumb(1);

      // then
      expectBreadcrumbs([
        'Root',
        'Collapsed Process'
      ]);

      expect(
        canvas.getRootElement()
      ).to.equal(subRoot);
    }));


    it('should switch to root', inject(function(canvas) {

      // given
      var processRoot = canvas.findRoot('rootProcess');
      var nestedRoot = canvas.findRoot('collapsedProcess_2_plane');

      canvas.setRootElement(nestedRoot);

      // when
      clickBreadcrumb(0);

      // then
      expectBreadcrumbs([
        'Root'
      ]);

      expect(
        canvas.getRootElement()
      ).to.equal(processRoot);
    }));


    it('should switch to containing process plane on embedded click', inject(function(canvas) {

      // given
      var subRoot = canvas.findRoot('collapsedProcess_plane');
      var nestedRoot = canvas.findRoot('collapsedProcess_2_plane');

      canvas.setRootElement(nestedRoot);

      // when
      clickBreadcrumb(2);

      // then
      expectBreadcrumbs([
        'Root',
        'Collapsed Process'
      ]);

      expect(
        canvas.getRootElement()
      ).to.equal(subRoot);
    }));

  });


  describe('Navigation', function() {

    it('should reset scroll and zoom', inject(function(canvas) {

      // given
      canvas.scroll({ dx: 500, dy: 500 });
      canvas.zoom(0.5);

      // when
      canvas.setRootElement(canvas.findRoot('collapsedProcess_plane'));

      // then
      expectViewbox({
        x: 0,
        y: 0,
        scale: 1
      });
    }));


    it('should remember scroll and zoom', inject(function(canvas) {

      // given
      var rootRoot = canvas.getRootElement();
      var planeRoot = canvas.findRoot('collapsedProcess_plane');

      canvas.scroll({ dx: 500, dy: 500 });
      canvas.zoom(0.5);

      var rootViewbox = canvas.viewbox();

      canvas.setRootElement(planeRoot);
      canvas.scroll({ dx: 100, dy: 100 });

      var planeViewbox = canvas.viewbox();

      // when
      canvas.setRootElement(rootRoot);

      // then
      expectViewbox(rootViewbox);

      // but when
      canvas.setRootElement(planeRoot);

      // then
      expectViewbox(planeViewbox);
    }));


    it('should not reset viewbox on root change', inject(function(canvas, modeling) {

      // given
      canvas.scroll({ dx: 500, dy: 500 });
      canvas.zoom(0.5);
      var zoomedAndScrolledViewbox = canvas.viewbox();

      // when
      modeling.makeCollaboration();

      // then
      expectViewbox(zoomedAndScrolledViewbox);
    }));

    // helpers //////////

    function expectViewbox(expectedViewbox) {
      return getBpmnJS().invoke(function(canvas) {

        var viewbox = canvas.viewbox();

        expect(viewbox.x).to.eql(expectedViewbox.x);
        expect(viewbox.y).to.eql(expectedViewbox.y);
        expect(viewbox.scale).to.eql(expectedViewbox.scale);
      });
    }

  });


  describe('Collaboration', function() {

    beforeEach(bootstrapModeler(collaborationXML, { modules: testModules }));

    describe('Overlays', function() {

      it('should show overlay', inject(function(elementRegistry, overlays) {

        // given
        var collapsedProcess = elementRegistry.get('collapsedProcess');
        var overlay = overlays.get({ element: collapsedProcess });

        // then
        expect(overlay).to.exist;
      }));


      it('should switch plane on click', inject(function(elementRegistry, overlays, canvas) {

        // given
        var collapsedProcess = elementRegistry.get('collapsedProcess');
        var overlay = overlays.get({ element: collapsedProcess })[0];

        // when
        overlay.html.click();

        // then
        var collapsedRoot = canvas.getRootElement();

        expect(collapsedRoot.businessObject).to.equal(collapsedProcess.businessObject);
      }));

    });


    describe('Breadcrumbs', function() {

      it('should not show breadcrumbs in root view', inject(function(canvas) {

        // given
        var container = canvas.getContainer();

        // then
        expect(classes(container).contains('bjs-breadcrumbs-shown')).to.be.false;
      }));


      it('should show breadcrumbs in subprocess view', inject(function(canvas) {

        // given
        var container = canvas.getContainer();

        // when
        canvas.setRootElement(canvas.findRoot('collapsedProcess_plane'));

        // then
        expect(classes(container).contains('bjs-breadcrumbs-shown')).to.be.true;
      }));


      it('should show execution tree', inject(function(canvas) {

        // when
        canvas.setRootElement(canvas.findRoot('collapsedProcess_2_plane'));

        // then
        expectBreadcrumbs([
          'Root',
          'Collapsed Process',
          'Expanded Process',
          'Collapsed Process 2'
        ]);
      }));


      it('should switch to process plane on click', inject(function(canvas) {

        // given
        var subRoot = canvas.findRoot('collapsedProcess_plane');
        var nestedRoot = canvas.findRoot('collapsedProcess_2_plane');

        canvas.setRootElement(nestedRoot);

        // when
        clickBreadcrumb(1);

        // then
        expectBreadcrumbs([
          'Root',
          'Collapsed Process'
        ]);

        expect(
          canvas.getRootElement()
        ).to.equal(subRoot);
      }));


      it('should switch to root', inject(function(canvas) {

        // given
        var collaboration = canvas.findRoot('Collaboration_0wnumpk');
        var nestedRoot = canvas.findRoot('collapsedProcess_2_plane');

        canvas.setRootElement(nestedRoot);

        // when
        clickBreadcrumb(0);

        expect(
          canvas.getRootElement()
        ).to.equal(collaboration);
      }));


      it('should switch to containing process plane on embedded click', inject(function(canvas) {

        // given
        var subRoot = canvas.findRoot('collapsedProcess_plane');
        var nestedRoot = canvas.findRoot('collapsedProcess_2_plane');

        canvas.setRootElement(nestedRoot);

        // when
        clickBreadcrumb(2);

        // then
        expectBreadcrumbs([
          'Root',
          'Collapsed Process'
        ]);

        expect(
          canvas.getRootElement()
        ).to.equal(subRoot);
      }));

    });


    describe('Navigation', function() {

      it('should reset scroll and zoom', inject(function(canvas) {

        // given
        canvas.scroll({ dx: 500, dy: 500 });
        canvas.zoom(0.5);

        // when
        canvas.setRootElement(canvas.findRoot('collapsedProcess_plane'));

        // then
        expectViewbox({
          x: 0,
          y: 0,
          scale: 1
        });
      }));


      it('should remember scroll and zoom', inject(function(canvas) {

        // given
        var rootRoot = canvas.getRootElement();
        var planeRoot = canvas.findRoot('collapsedProcess_plane');

        canvas.scroll({ dx: 500, dy: 500 });
        canvas.zoom(0.5);

        var rootViewbox = canvas.viewbox();

        canvas.setRootElement(planeRoot);
        canvas.scroll({ dx: 100, dy: 100 });

        var planeViewbox = canvas.viewbox();

        // when
        canvas.setRootElement(rootRoot);

        // then
        expectViewbox(rootViewbox);

        // but when
        canvas.setRootElement(planeRoot);

        // then
        expectViewbox(planeViewbox);
      }));


      it('should not reset viewbox on root change', inject(function(canvas, modeling) {

        // given
        canvas.scroll({ dx: 500, dy: 500 });
        canvas.zoom(0.5);
        var zoomedAndScrolledViewbox = canvas.viewbox();

        // when
        modeling.makeProcess();

        // then
        expectViewbox(zoomedAndScrolledViewbox);

      }));

      // helpers //////////

      function expectViewbox(expectedViewbox) {
        return getBpmnJS().invoke(function(canvas) {

          var viewbox = canvas.viewbox();

          expect(viewbox.x).to.eql(expectedViewbox.x);
          expect(viewbox.y).to.eql(expectedViewbox.y);
          expect(viewbox.scale).to.eql(expectedViewbox.scale);
        });
      }

    });

  });


  describe('features - drilldown - Legacy Processes', function() {

    beforeEach(bootstrapModeler(legacyXML, { modules: testModules }));

    it('should import collapsed subprocess', inject(function(canvas) {

      // when
      var inlineProcess1 = canvas.findRoot('inlineSubprocess_plane');
      var inlineProcess2 = canvas.findRoot('inlineSubprocess_2_plane');

      // then
      expect(inlineProcess1).to.exist;
      expect(inlineProcess2).to.exist;
    }));


    it('should import data associations on subprocess', inject(function(elementRegistry) {

      // when
      var dataInputAssociation = elementRegistry.get('DataInputAssociation_1');
      var dataOutputAssociation = elementRegistry.get('DataOutputAssociation_1');

      // then
      expect(dataInputAssociation).to.exist;
      expect(dataOutputAssociation).to.exist;
    }));


    it('should move inlined elements to sensible position', inject(function(elementRegistry) {

      // when
      var startEvent = elementRegistry.get('subprocess_startEvent');

      // then
      expect(startEvent).to.exist;
      expect(startEvent.x).to.equal(180);
      expect(startEvent.y).to.equal(160);
    }));


    it('should create new planes for empty processes', inject(function(canvas) {

      // when
      var emptyRoot = canvas.findRoot('emptyProcess_plane');

      // then
      expect(emptyRoot).to.exist;
    }));

  });


  describe('a11y', function() {

    it('should report no violations', inject(async function(canvas) {

      // given
      const container = canvas.getContainer();

      // then
      await expectToBeAccessible(container);
    }));
  });
});


describe('features/drilldown - integration', function() {

  var testModules = [
    coreModule,
    modelingModule,
    drilldownModule
  ];

  var workingXML = require('./nested-subprocesses.bpmn');

  beforeEach(bootstrapModeler(workingXML, { modules: testModules }));


  describe('error handling - should handle broken DI', function() {

    const subprocessMissingDi_XML = require('./subprocess-missing-di.bpmn');
    const subprocessMissingBpmnDiagram_XML = require('./subprocess-missing-bpmndiagram.bpmn');
    const processMissingBpmnDiagram_XML = require('./process-missing-bpmndiagram.bpmn');

    const planeMissingBpmnElement_XML = require('./plane-missing-bpmnelement.bpmn');
    const diagramMissingPlane_XML = require('./diagram-missing-plane.bpmn');


    async function importXML(xml) {
      const bpmnJS = getBpmnJS();

      let result;

      try {
        result = await bpmnJS.importXML(xml);
      } catch (error) {
        result = {
          error,
          warnings: error.warnings
        };
      }

      return result;
    }


    it('no <bpmndi:BPMNDiagram#plane />', async function() {

      const {
        error,
        warnings
      } = await importXML(diagramMissingPlane_XML);

      // then
      expect(error).not.to.exist;
      expect(warnings).to.be.empty;
    });


    it('no <bpmndi:BPMNPlane#bpmnElement />', async function() {

      const {
        error,
        warnings
      } = await importXML(planeMissingBpmnElement_XML);

      // then
      expect(error).not.to.exist;
      expect(warnings).to.be.empty;
    });


    it('no <bpmndi:BPMNShape /> for sub process', async function() {

      const {
        error,
        warnings
      } = await importXML(subprocessMissingDi_XML);

      // then
      expect(error).not.to.exist;
      expect(warnings).to.be.empty;
    });


    it('no <bpmndi:BPMNDiagram /> for sub process', async function() {

      const {
        error,
        warnings
      } = await importXML(subprocessMissingBpmnDiagram_XML);

      // then
      expect(error).not.to.exist;
      expect(warnings).to.be.empty;
    });


    it('no <bpmndi:BPMNDiagram /> for process', async function() {

      const {
        error,
        warnings
      } = await importXML(processMissingBpmnDiagram_XML);

      // then
      expect(error).not.to.exist;
      expect(warnings).to.be.empty;
    });
  });

});


// helpers

function getBreadcrumbs() {
  return getBpmnJS().invoke(function(canvas) {
    return canvas.getContainer().querySelector('.bjs-breadcrumbs');
  });
}

function expectBreadcrumbs(expected) {
  var breadcrumbs = getBreadcrumbs();

  var crumbs = Array.from(breadcrumbs.children).map(function(element) {
    return element.innerText;
  });

  expect(crumbs).to.eql(expected);
}

function clickBreadcrumb(index) {
  getBreadcrumbs().children[index].click();
}