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

  describe('Navigation', function() {

    it('should not reset scroll on create collaboration',
      inject(function(canvas, modeling) {

        // given
        canvas.scroll({ dx: 500, dy: 500 });
        canvas.zoom(0.5);
        var zoomedAndScrolledViewbox = canvas.viewbox();

        // when
        modeling.makeCollaboration();

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
        modeling.makeCollaboration();
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
        modeling.makeCollaboration();
        commandStack.undo();
        commandStack.redo();

        // then
        expectViewbox(zoomedAndScrolledViewbox);
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