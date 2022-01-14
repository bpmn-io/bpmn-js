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

  describe('Navigation - Collaboration', function() {

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


    it('should remember scroll and zoom after morph', inject(function(canvas, modeling) {

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