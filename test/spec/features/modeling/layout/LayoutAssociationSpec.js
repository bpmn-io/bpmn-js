import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - layout association', function() {

  var diagramXML = require('../../../../fixtures/bpmn/basic.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  var rootShape;

  beforeEach(inject(function(canvas) {
    rootShape = canvas.getRootElement();
  }));


  it('should layout straight after TextAnnotation creation', inject(function(elementRegistry, modeling) {

    // given
    var startEventShape = elementRegistry.get('StartEvent_1');

    // when
    var textAnnotationShape = modeling.createShape({ type: 'bpmn:TextAnnotation' }, { x: 400, y: 400 }, rootShape);

    modeling.connect(textAnnotationShape, startEventShape);

    var waypoints = textAnnotationShape.outgoing[0].waypoints;

    // then
    expect(waypoints).to.eql([
      { original: { x: 400, y: 400 }, x: 389, y: 385 },
      { original: { x: 191, y: 120 }, x: 202, y: 134 }
    ]);

  }));


  it('should layout straight after TextAnnotation move', inject(function(elementRegistry, modeling) {

    // given
    var startEventShape = elementRegistry.get('StartEvent_1'),
        textAnnotationShape = modeling.createShape({ type: 'bpmn:TextAnnotation' }, { x: 400, y: 400 }, rootShape);

    modeling.connect(textAnnotationShape, startEventShape);

    // when
    modeling.moveElements([ textAnnotationShape ], { x: 20, y: 0 }, rootShape);

    var waypoints = textAnnotationShape.outgoing[0].waypoints;

    // then
    expect(waypoints).to.eql([
      { original: { x: 420, y: 400 }, x: 408, y: 385 },
      { original: { x: 191, y: 120 }, x: 202, y: 134 }
    ]);

  }));


  it('should retain waypoints after TextAnnotation move', inject(function(elementRegistry, modeling) {

    // given
    var startEventShape = elementRegistry.get('StartEvent_1'),
        textAnnotationShape = modeling.createShape({ type: 'bpmn:TextAnnotation' }, { x: 400, y: 400 }, rootShape);

    var connection = modeling.connect(textAnnotationShape, startEventShape),
        waypoints = connection.waypoints;

    // add a waypoint
    waypoints.splice(1, 0, { x: 400, y: 300 });

    modeling.updateWaypoints(connection, waypoints);

    // when
    modeling.moveElements([ textAnnotationShape ], { x: 20, y: 0 }, rootShape);

    // then
    expect(connection).to.have.waypoints([
      { original: { x: 420, y: 400 }, x: 417, y: 385 },
      { x: 400, y: 300 },
      { original: { x: 191, y: 120 }, x: 204, y: 132 }
    ]);

  }));

});
