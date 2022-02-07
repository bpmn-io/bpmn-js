import {
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import DrilldownModule from 'lib/features/drilldown';
import { bootstrapModeler, getBpmnJS } from '../../../helper';


describe('features - drilldown', function() {

  var testModules = [
    coreModule,
    modelingModule,
    DrilldownModule
  ];

  var multiLayerXML = require('./nested-subprocesses.bpmn');

  beforeEach(bootstrapModeler(multiLayerXML, { modules: testModules }));

  describe('navigation - collaboration', function() {

    var process, participant;

    beforeEach(inject(function(canvas, elementFactory) {
      process = canvas.getRootElement();
      participant = elementFactory.createParticipantShape({ x: 100, y: 100 });
    }));


    it('should not reset scroll on create collaboration',
      inject(function(canvas, modeling) {

        // given
        canvas.scroll({ dx: 500, dy: 500 });
        canvas.zoom(0.5);
        var zoomedAndScrolledViewbox = canvas.viewbox();

        // when
        modeling.createShape(participant, { x: 0, y: 0 }, process);


        // then
        expectViewbox(zoomedAndScrolledViewbox);
      })
    );


    it('should not reset scroll on create collaboration - undo',
      inject(function(canvas, modeling, commandStack) {

        // given
        canvas.scroll({ dx: 500, dy: 500 });
        canvas.zoom(0.5);
        var zoomedAndScrolledViewbox = canvas.viewbox();

        // when
        modeling.createShape(participant, { x: 0, y: 0 }, process);
        commandStack.undo();

        // then
        expectViewbox(zoomedAndScrolledViewbox);
      })
    );


    it('should not reset scroll on create collaboration - redo',
      inject(function(canvas, modeling, commandStack) {

        // given
        canvas.scroll({ dx: 500, dy: 500 });
        canvas.zoom(0.5);
        var zoomedAndScrolledViewbox = canvas.viewbox();

        // when
        modeling.createShape(participant, { x: 400, y: 225 }, process);
        commandStack.undo();
        commandStack.redo();

        // then
        expectViewbox(zoomedAndScrolledViewbox);
      })
    );


    it('should remember scroll and zoom after switching planes', inject(function(canvas, modeling) {

      // given
      canvas.scroll({ dx: 500, dy: 500 });
      canvas.zoom(0.5);
      var zoomedAndScrolledViewbox = canvas.viewbox();

      modeling.createShape(participant, { x: 400, y: 225 }, process);
      var collaboration = canvas.getRootElement();

      // when
      canvas.setRootElement(canvas.findRoot('collapsedProcess_plane'));
      canvas.setRootElement(collaboration);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.eql(zoomedAndScrolledViewbox.x);
      expect(newViewbox.y).to.eql(zoomedAndScrolledViewbox.y);
      expect(newViewbox.scale).to.eql(zoomedAndScrolledViewbox.scale);
    }));

  });


  describe('breadcrumbs - name changes', function() {

    it('should update on plane name change',
      inject(function(canvas, modeling) {

        // given
        canvas.setRootElement(canvas.findRoot('collapsedProcess_2_plane'));

        // when
        modeling.updateProperties(canvas.getRootElement(), { name: 'new name' });

        // then
        expectBreadcrumbs([
          'Root',
          'Collapsed Process',
          'Expanded Process',
          'new name'
        ]);
      })
    );


    it('should update on element name change',
      inject(function(canvas, elementRegistry, modeling) {

        // given
        canvas.setRootElement(canvas.findRoot('collapsedProcess_2_plane'));
        var shape = elementRegistry.get('collapsedProcess_2');

        // when
        modeling.updateProperties(shape, { name: 'new name' });

        // then
        expectBreadcrumbs([
          'Root',
          'Collapsed Process',
          'Expanded Process',
          'new name'
        ]);
      })
    );


    it('should update on process name change',
      inject(function(canvas, elementRegistry, modeling) {

        // given
        canvas.setRootElement(canvas.findRoot('collapsedProcess_2_plane'));
        var shape = elementRegistry.get('rootProcess');

        // when
        modeling.updateProperties(shape, { name: 'new name' });

        // then
        expectBreadcrumbs([
          'new name',
          'Collapsed Process',
          'Expanded Process',
          'Collapsed Process 2'
        ]);
      })
    );

  });

});


// helpers //////////

function expectViewbox(expectedViewbox) {
  return getBpmnJS().invoke(function(canvas) {

    var viewbox = canvas.viewbox();

    expect(viewbox.x).to.eql(expectedViewbox.x);
    expect(viewbox.y).to.eql(expectedViewbox.y);
    expect(viewbox.scale).to.eql(expectedViewbox.scale);
  });
}

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