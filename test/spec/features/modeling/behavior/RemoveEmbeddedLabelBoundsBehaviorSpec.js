import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import coreModule from 'bpmn-js/lib/core';
import modelingModule from 'bpmn-js/lib/features/modeling';

import { getDi } from 'bpmn-js/lib/util/ModelUtil.js';


describe('features/modeling - RemoveEmbeddedLabelBoundsBehavior', function() {

  var processDiagramXML = require('./RemoveEmbeddedLabelBoundsBehavior.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));

  var bounds,
      di;

  beforeEach(inject(function(elementRegistry, modeling) {

    // given
    var subProcess = elementRegistry.get('Activity_1');

    di = getDi(subProcess);

    bounds = di.get('label').get('bounds');

    // when
    modeling.resizeShape(subProcess, {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
  }));


  it('<do>', function() {

    // then
    expect(di.get('label').get('bounds')).not.to.exist;
  });


  it('<undo>', inject(function(commandStack) {

    // when
    commandStack.undo();

    // then
    expect(di.get('label').get('bounds')).to.equal(bounds);
  }));


  it('<redo>', inject(function(commandStack) {

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    expect(di.get('label').get('bounds')).not.to.exist;
  }));

});