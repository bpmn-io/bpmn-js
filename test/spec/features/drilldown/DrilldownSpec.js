import {
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import DrilldownModule from 'lib/features/drilldown';
import { bootstrapViewer } from '../../../helper';

describe('features - drilldown', function() {

  var testModules = [
    coreModule,
    DrilldownModule
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
      var breadcrumbs = canvas.getContainer().querySelector('.bjs-breadcrumbs');

      // then
      expect(breadcrumbs.classList.contains('djs-element-hidden')).to.be.true;
    }));


    it('should show breadcrumbs in subprocess view', inject(function(canvas) {

      // given
      var breadcrumbs = canvas.getContainer().querySelector('.bjs-breadcrumbs');

      // when
      canvas.setActivePlane('collapsedProcess');

      // then
      expect(breadcrumbs.classList.contains('djs-element-hidden')).to.be.false;
    }));


    it('should show execution tree', inject(function(canvas) {

      // given
      var breadcrumbs = canvas.getContainer().querySelector('.bjs-breadcrumbs');

      // when
      canvas.setActivePlane('collapsedProcess_2');

      // then
      expectBreadcrumbs(breadcrumbs, ['Root', 'Collapsed Process', 'Expanded Process', 'Collapsed Process 2']);
    }));


    it('should switch to process plane on click', inject(function(canvas) {

      // given
      var breadcrumbs = canvas.getContainer().querySelector('.bjs-breadcrumbs');
      canvas.setActivePlane('collapsedProcess_2');

      // when
      breadcrumbs.children[1].click();

      // then
      expectBreadcrumbs(breadcrumbs, ['Root', 'Collapsed Process']);
    }));


    it('should switch to containing process plane on embedded click', inject(function(canvas) {

      // given
      var breadcrumbs = canvas.getContainer().querySelector('.bjs-breadcrumbs');
      canvas.setActivePlane('collapsedProcess_2');

      // when
      breadcrumbs.children[2].click();

      // then
      expectBreadcrumbs(breadcrumbs, ['Root', 'Collapsed Process']);
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

});


// helpers

function expectBreadcrumbs(breadcrumbs, expected) {
  var crumbs = Array.from(breadcrumbs.children).map(function(element) {
    return element.innerText;
  });

  expect(crumbs).to.eql(expected);
}