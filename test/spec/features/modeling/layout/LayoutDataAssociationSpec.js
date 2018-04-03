import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - layout data association', function() {

  var diagramXML = require('../../../../fixtures/bpmn/basic.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  var rootShape,
      taskShape;

  beforeEach(inject(function(elementRegistry, canvas) {
    rootShape = canvas.getRootElement();
    taskShape = elementRegistry.get('Task_1');
  }));


  it('should layout straight after DataObjectReference creation', inject(function(modeling) {

    // when
    var dataObjectShape = modeling.createShape({ type: 'bpmn:DataObjectReference' }, { x: 200, y: 400 }, rootShape);

    modeling.connect(dataObjectShape, taskShape);

    var waypoints = dataObjectShape.outgoing[0].waypoints;

    // then
    expect(waypoints).to.eql([
      { original: { x: 200, y: 400 }, x: 218, y: 375 },
      { original: { x: 403, y: 120 }, x: 374, y: 160 }
    ]);

  }));


  it('should layout straight after DataObjectReference move', inject(function(modeling) {

    // given
    var dataObjectShape = modeling.createShape({ type: 'bpmn:DataObjectReference' }, { x: 200, y: 400 }, rootShape);

    modeling.connect(dataObjectShape, taskShape);

    // when
    modeling.moveElements([ dataObjectShape ], { x: 20, y: 0 }, rootShape);

    var waypoints = dataObjectShape.outgoing[0].waypoints;

    // then
    expect(waypoints).to.eql([
      { original: { x: 220, y: 400 }, x: 236, y: 375 },
      { original: { x: 403, y: 120 }, x: 377, y: 160 }
    ]);

  }));


  it('should retain waypoints after DataObjectReference move', inject(function(modeling) {

    // given
    var dataObjectShape = modeling.createShape({ type: 'bpmn:DataObjectReference' }, { x: 200, y: 400 }, rootShape),
        connection = modeling.connect(dataObjectShape, taskShape),
        waypoints = connection.waypoints;

    // add a waypoint
    waypoints.splice(1, 0, { x: 400, y: 300 });

    modeling.updateWaypoints(connection, waypoints);

    // when
    modeling.moveElements([ dataObjectShape ], { x: 20, y: 0 }, rootShape);

    waypoints = taskShape.incoming[0].waypoints;

    // then
    expect(waypoints).to.eql([
      { original: { x: 220, y: 400 }, x: 238, y: 390 },
      { x: 400, y: 300 },
      { original: { x: 403, y: 120 }, x: 402, y: 160 }
    ]);

  }));

});
