'use strict';

require('../../../../TestHelper');

/* global inject, bootstrapModeler */

var find = require('lodash/collection/find');

var modelingModule = require('../../../../../lib/features/modeling');


describe('modeling/behavior - fix DataInputAssociation#targetRef', function(){

  var diagramXML = require('./DataInputAssociationBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: modelingModule }));


  it('should add on connect', inject(function(modeling, elementRegistry) {

    // given
    var dataObjectShape = elementRegistry.get('DataObjectReference'),
        taskShape = elementRegistry.get('Task_B');


    // when
    var newConnection = modeling.connect(dataObjectShape, taskShape, {
      type: 'bpmn:DataInputAssociation'
    });

    var dataInputAssociation = newConnection.businessObject;

    // then
    expect(dataInputAssociation.targetRef).to.exist;
    expect(dataInputAssociation.targetRef).to.eql(getTargetRefProp(taskShape));
  }));


  it('should remove on connect / undo', inject(function(modeling, elementRegistry, commandStack) {

    // given
    var dataObjectShape = elementRegistry.get('DataObjectReference'),
        taskShape = elementRegistry.get('Task_B');

    var newConnection = modeling.connect(dataObjectShape, taskShape, {
      type: 'bpmn:DataInputAssociation'
    });

    var dataInputAssociation = newConnection.businessObject;

    // when
    commandStack.undo();

    // then
    expect(dataInputAssociation.targetRef).to.not.exist;
    expect(getTargetRefProp(taskShape)).to.not.exist;
  }));


  it('should update on reconnectEnd', inject(function(modeling, elementRegistry) {

    // given
    var oldTarget = elementRegistry.get('Task_A'),
        connection = elementRegistry.get('DataInputAssociation'),
        dataInputAssociation = connection.businessObject,
        newTarget = elementRegistry.get('Task_B');

    // when
    modeling.reconnectEnd(connection, newTarget, { x: newTarget.x, y: newTarget.y });

    // then
    expect(getTargetRefProp(oldTarget)).not.to.exist;

    expect(dataInputAssociation.targetRef).to.exist;
    expect(dataInputAssociation.targetRef).to.eql(getTargetRefProp(newTarget));
  }));


  it('should update on reconnectEnd / undo', inject(function(modeling, elementRegistry, commandStack) {

    // given
    var oldTarget = elementRegistry.get('Task_A'),
        connection = elementRegistry.get('DataInputAssociation'),
        dataInputAssociation = connection.businessObject,
        newTarget = elementRegistry.get('Task_B');

    modeling.reconnectEnd(connection, newTarget, { x: newTarget.x, y: newTarget.y });

    // when
    commandStack.undo();

    // then
    expect(getTargetRefProp(newTarget)).not.to.exist;

    expect(dataInputAssociation.targetRef).to.exist;
    expect(dataInputAssociation.targetRef).to.eql(getTargetRefProp(oldTarget));
  }));


  it('should unset on remove', inject(function(modeling, elementRegistry) {

    // given
    var oldTarget = elementRegistry.get('Task_A'),
        connection = elementRegistry.get('DataInputAssociation'),
        dataInputAssociation = connection.businessObject;

    // when
    modeling.removeElements([ connection ]);

    // then
    expect(getTargetRefProp(oldTarget)).not.to.exist;

    expect(dataInputAssociation.targetRef).to.not.exist;
  }));


  it('should unset on remove / undo', inject(function(modeling, elementRegistry, commandStack) {

    // given
    var oldTarget = elementRegistry.get('Task_A'),
        connection = elementRegistry.get('DataInputAssociation'),
        dataInputAssociation = connection.businessObject;

    modeling.removeElements([ connection ]);

    // when
    commandStack.undo();

    // then
    expect(dataInputAssociation.targetRef).to.exist;
    expect(dataInputAssociation.targetRef).to.eql(getTargetRefProp(oldTarget));
  }));

});



function getTargetRefProp(element) {

  expect(element).to.exist;

  var properties = element.businessObject.get('properties');

  return find(properties, function(p) {
    return p.name === '__targetRef_placeholder';
  });
}