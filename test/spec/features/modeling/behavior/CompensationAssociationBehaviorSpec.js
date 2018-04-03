import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';


describe('modeling/behavior - CompensationAssociation', function() {

  var diagramXML = require('./CompensationAssociationBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: modelingModule }));


  it('should manhattan layout', inject(function(modeling, elementRegistry) {

    // given
    var boundaryShape = elementRegistry.get('CompensationBoundary'),
        activityShape = elementRegistry.get('CompensationActivity');


    // when
    var newConnection = modeling.connect(boundaryShape, activityShape, {
      type: 'bpmn:DataInputAssociation'
    });

    // then
    expect(waypoints(newConnection)).to.eql([
      { x: 107, y: 142 },
      { x: 107, y: 254 },
      { x: 206, y: 254 }
    ]);
  }));

});


function waypoints(connection) {
  return connection.waypoints.map(function(wp) {
    return { x: wp.x, y: wp.y };
  });
}