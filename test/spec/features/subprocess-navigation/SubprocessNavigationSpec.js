import {
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import subprocessNavigationModule from 'lib/features/subprocess-navigation';
import { bootstrapViewer } from '../../../helper';

describe('features - subprocess-navigation', function() {

  var testModules = [
    coreModule,
    subprocessNavigationModule
  ];

  var multiLayerXML = require('./nested-subprocesses.bpmn');
  var legacyXML = require('./legacy-subprocesses.bpmn');

  beforeEach(bootstrapViewer(multiLayerXML, { modules: testModules }));

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
      var plane = canvas.getActivePlane();
      expect(plane.name).to.eql('collapsedProcess');
    }));

  });


  describe('Breadcrumbs', function() {

    it('should not show breadcrumbs in root view', inject(function(canvas) {

      // given
      var breadcrumbs = getBreadcrumbs(canvas);

      // then
      expect(breadcrumbs).to.not.exist;
    }));


    it('should show breadcrumbs in subprocess view', inject(function(canvas) {

      // when
      canvas.setActivePlane('collapsedProcess');

      // then
      expect(getBreadcrumbs(canvas)).to.exist;
    }));


    it('should show execution tree', inject(function(canvas) {

      // when
      canvas.setActivePlane('collapsedProcess_2');

      // then
      expectBreadcrumbs(getBreadcrumbs(canvas), ['Root', 'Collapsed Process', 'Expanded Process', 'Collapsed Process 2']);
    }));


    it('should switch to process plane on click', inject(function(canvas) {

      // given
      canvas.setActivePlane('collapsedProcess_2');

      // when
      getBreadcrumbs(canvas).children[2].click();

      // then
      expectBreadcrumbs(getBreadcrumbs(canvas), ['Root', 'Collapsed Process']);
    }));


    it('should switch to containing process plane on embedded click', inject(function(canvas) {

      // given
      canvas.setActivePlane('collapsedProcess_2');

      // when
      getBreadcrumbs(canvas).children[3].click();

      // then
      expectBreadcrumbs(getBreadcrumbs(canvas), ['Root', 'Collapsed Process']);
    }));


    it('should switch to containing process plane on drillup icon', inject(function(canvas) {

      // given
      canvas.setActivePlane('collapsedProcess_2');

      // when
      getBreadcrumbs(canvas).querySelector('.bjs-drilldown').click();

      // then
      expectBreadcrumbs(getBreadcrumbs(canvas), ['Root', 'Collapsed Process']);
    }));

  });


  describe('Navigation', function() {

    it('should reset scroll and zoom', inject(function(canvas) {

      // given
      canvas.scroll({ dx: 500, dy: 500 });
      canvas.zoom(0.5);

      // when
      canvas.setActivePlane('collapsedProcess');

      // then
      var viewbox = canvas.viewbox();
      expect(viewbox.x).to.eql(0);
      expect(viewbox.y).to.eql(0);
      expect(viewbox.scale).to.eql(1);
    }));


    it('should remember scroll and zoom', inject(function(canvas) {

      // given
      canvas.scroll({ dx: 500, dy: 500 });
      canvas.zoom(0.5);
      var zoomedAndScrolledViewbox = canvas.viewbox();

      // when
      canvas.setActivePlane('collapsedProcess');
      canvas.setActivePlane('rootProcess');

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.eql(zoomedAndScrolledViewbox.x);
      expect(newViewbox.y).to.eql(zoomedAndScrolledViewbox.y);
      expect(newViewbox.scale).to.eql(zoomedAndScrolledViewbox.scale);
    }));

  });


  describe('Legacy Processes', function() {

    beforeEach(bootstrapViewer(legacyXML, { modules: testModules }));

    it('should import collapsed subprocess', inject(function(canvas) {

      // when
      var inlineProcess1 = canvas.getPlane('inlineSubprocess');
      var inlineProcess2 = canvas.getPlane('inlineSubprocess_2');

      // then
      expect(inlineProcess1).to.exist;
      expect(inlineProcess2).to.exist;
    }));


    it('should move inlined elements to sensible position', inject(function(elementRegistry) {

      // when
      var startEvent = elementRegistry.get('subprocess_startEvent');

      // then
      expect(startEvent).to.exist;
      expect(startEvent.x).to.equal(180);
      expect(startEvent.y).to.equal(160);
    }));

  });


  describe('Secondary Elements', function() {

    it('should render a secondary element', inject(function(elementRegistry) {

      // given
      var processShape = elementRegistry.get('collapsedProcess_secondary');

      // expect
      expect(processShape).to.exist;
    }));


    it('should link to primary element', inject(function(elementRegistry) {

      // given
      var processShape = elementRegistry.get('collapsedProcess_secondary');

      // expect
      expect(processShape.primaryShape).to.exist;
    }));


    it('should have padding', inject(function(elementRegistry) {

      // given
      var processShape = elementRegistry.get('single-task-process_secondary');

      // expect
      // default task is 100x80, expect 50px padding to every side
      expect(processShape.width).to.eql(200);
      expect(processShape.height).to.eql(180);

    }));


    it('should render flows with muted stroke color', inject(function(eventBus, elementRegistry, canvas) {

      // given
      var spy = sinon.spy();
      var primaryElement = elementRegistry.get('root_startEvent');

      var secondaryElement = {
        id:'secondary',
        type: 'bpmn:StartEvent',
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        isSecondary: true,
        primaryShape: primaryElement,
        businessObject: primaryElement.businessObject,
        di: primaryElement.di
      };

      eventBus.on('render.connection', 2000, spy);

      // when
      canvas.addShape(secondaryElement);

      // then
      expect(spy).to.have.been.called;

      var attrs = spy.firstCall.args[1].attrs;
      expect(attrs.stroke).to.equal('#dddddd');

    }));


    describe('boundary events', function() {

      it('should render secondary element', inject(function(elementRegistry) {

        // given
        var boundary_secondary = elementRegistry.get('boundaryError_secondary');

        // expect
        expect(boundary_secondary).to.exist;
      }));


      it('should position it relatively to original element', inject(function(elementRegistry) {

        // given
        var process_secondary = elementRegistry.get('errorSubProcess_secondary');
        var process_primary = process_secondary.primaryShape;
        var boundary_secondary = process_secondary.attachers[0];
        var boundary_primary = process_primary.attachers[0];

        // assume
        expect(boundary_primary).to.exist;
        expect(boundary_secondary).to.exist;

        // (middle - element process offset) / total border length
        var relativePositionPrimary = {
          x: (boundary_primary.x + boundary_primary.width/2 - process_primary.x) / process_primary.width,
          y: (boundary_primary.y + boundary_primary.width/2 - process_primary.y) / process_primary.height
        };

        var relativePositionSecondary = {
          x: (boundary_secondary.x + boundary_secondary.width/2 - process_secondary.x) / process_secondary.width,
          y: (boundary_secondary.y + boundary_secondary.width/2 - process_secondary.y) / process_secondary.height
        };

        // then
        expect(relativePositionPrimary).to.be.eql(relativePositionSecondary);
      }));

    });


  });

});


// helpers

function getBreadcrumbs(canvas) {
  return canvas.getContainer().querySelector('.djs-overlay:not([style*="display: none"]) .bjs-breadcrumbs');
}

function expectBreadcrumbs(breadcrumbs, expected) {
  var crumbs = Array.from(breadcrumbs.children)
    .filter(function(child) {
      return !!child.querySelector('.bjs-crumb');
    })
    .map(function(element) {
      return element.innerText;
    });

  expect(crumbs).to.eql(expected);
}

