'use strict';

require('../../TestHelper');

/* global bootstrapModeler, inject */

var coreModule = require('../../../lib/core'),
    modelingModule = require('../../../lib/features/modeling');


describe('LabelUtil', function() {

  var diagramXML = require('./LabelUtil.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: [ coreModule, modelingModule ] }));


  it('should correctly place horizontal label', inject(function(modeling, elementRegistry) {

    // given
    var element1 = elementRegistry.get('StartEvent_1'),
        element2 = elementRegistry.get('ExclusiveGateway_2');

    // when
    var connection = modeling.connect(element1, element2);

    // then
    expect(connection.label.x).to.be.equal(427);
    expect(connection.label.y).to.be.equal(332);
  }));


  it('should correctly place vertical label', inject(function(modeling, elementRegistry) {

    // given
    var element1 = elementRegistry.get('StartEvent_1'),
        element2 = elementRegistry.get('ExclusiveGateway_1');

    // when
    var connection = modeling.connect(element1, element2);

    // then
    expect(connection.label.x).to.be.equal(292);
    expect(connection.label.y).to.be.equal(219.5);
  }));

});
