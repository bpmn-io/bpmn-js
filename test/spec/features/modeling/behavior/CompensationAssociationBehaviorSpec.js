import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject,
  is
} from 'lib/util/ModelUtil';

import modelingModule from 'lib/features/modeling';


describe('modeling/behavior - CompensationAssociation', function() {

  var diagramXML = require('./CompensationAssociationBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: modelingModule }));


  it('should use manhattan layout', inject(function(modeling, elementRegistry) {

    // given
    var boundaryShape = elementRegistry.get('CompensationBoundary'),
        activityShape = elementRegistry.get('CompensationActivity');


    // when
    var newConnection = modeling.connect(boundaryShape, activityShape);

    // then
    expect(waypoints(newConnection)).to.eql([
      { x: 107, y: 142 },
      { x: 107, y: 254 },
      { x: 206, y: 254 }
    ]);
  }));


  it('should create directed association', inject(function(modeling, elementRegistry) {

    // given
    var boundaryShape = elementRegistry.get('CompensationBoundary'),
        activityShape = elementRegistry.get('CompensationActivity');


    // when
    var newConnection = modeling.connect(boundaryShape, activityShape);

    // then
    expect(is(newConnection, 'bpmn:Association')).to.be.true;
    expect(getBusinessObject(newConnection)).to.have.property('associationDirection', 'One');
  }));

});


function waypoints(connection) {
  return connection.waypoints.map(function(wp) {
    return { x: wp.x, y: wp.y };
  });
}