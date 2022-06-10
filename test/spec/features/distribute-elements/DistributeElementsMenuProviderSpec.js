import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  forEach
} from 'min-dash';

import distributeElementsModule from 'lib/features/distribute-elements';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/distribute-elements - popup menu', function() {

  var testModules = [ distributeElementsModule, modelingModule, coreModule ];

  var basicXML = require('../../../fixtures/bpmn/distribute-elements.bpmn');

  beforeEach(bootstrapModeler(basicXML, { modules: testModules }));


  it('should provide distribution buttons', inject(function(elementRegistry, popupMenu) {

    // given
    var elements = [
      elementRegistry.get('ExclusiveGateway_10cec0a'),
      elementRegistry.get('Task_08pns8h'),
      elementRegistry.get('Task_0511uak'),
      elementRegistry.get('EndEvent_0c9irey')
    ];

    // when
    popupMenu.open(elements, 'align-elements', {
      x: 0,
      y: 0
    });

    // then
    forEach([
      'horizontal',
      'vertical'
    ], function(distribution) {
      expect(getEntry('distribute-elements-' + distribution)).to.exist;
    });
  }));

  forEach([
    'horizontal',
    'vertical'
  ], function(distribution) {
    it('should close popup menu when button is clicked', inject(
      function(elementRegistry, popupMenu) {

        // given
        var elements = [
          elementRegistry.get('ExclusiveGateway_10cec0a'),
          elementRegistry.get('Task_08pns8h'),
          elementRegistry.get('Task_0511uak'),
          elementRegistry.get('EndEvent_0c9irey')
        ];
        popupMenu.open(elements, 'align-elements', {
          x: 0,
          y: 0
        });
        var entry = getEntry('distribute-elements-' + distribution);

        // when
        entry.click();

        // then
        expect(popupMenu.isOpen()).to.be.false;
      })
    );
  });

});


// helper //////////////////////////////////////////////////////////////////////
function getEntry(actionName) {
  return padEntry(getBpmnJS().invoke(function(popupMenu) {
    return popupMenu._current.container;
  }), actionName);
}

function padEntry(element, name) {
  return domQuery('[data-id="' + name + '"]', element);
}
