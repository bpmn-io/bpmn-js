import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  createEvent as globalEvent
} from '../../../util/MockEvents';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import colorMenuProvider from 'lib/features/popup-menu';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

describe('features/popup-menu - replace menu provider', function() {

  var simpleXML= require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [
    coreModule,
    colorMenuProvider,
    modelingModule
  ];

  beforeEach(bootstrapModeler(simpleXML, { modules: testModules }));


  it('should show all color options', inject(function(elementRegistry) {
    var task = elementRegistry.get('Task_1');

    openPopup(task);

    var entries = queryEntries();

    expect(entries).to.have.lengthOf(6);

  }));


  it('should call setColor', inject(function(modeling, elementRegistry) {
    var spy = sinon.spy(modeling, 'setColor');
    var task = elementRegistry.get('Task_1');

    openPopup(task);

    triggerAction('blue-color');

    expect(spy).to.have.been.calledWith(
      task,
      {
        fill: 'rgb(187, 222, 251)',
        stroke: 'rgb(30, 136, 229)'
      }
    );

  }));

});



// helpers ////////////

function openPopup(element, offset) {
  offset = offset || 100;

  getBpmnJS().invoke(function(popupMenu) {

    popupMenu.open(element, 'bjs-color-picker', {
      x: element.x + offset, y: element.y + offset
    });

  });
}

function queryEntry(id) {
  var container = getBpmnJS().get('canvas').getContainer();

  return domQuery('.djs-popup [data-id="' + id + '"]', container);
}

function queryEntries() {
  var container = getBpmnJS().get('canvas').getContainer();

  return domQueryAll('.djs-popup .entry', container);
}

function triggerAction(id) {
  var entry = queryEntry(id);

  if (!entry) {
    throw new Error('entry "'+ id +'" not found in replace menu');
  }

  var popupMenu = getBpmnJS().get('popupMenu');

  return popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));
}
