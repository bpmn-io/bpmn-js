import { expect } from 'chai';
import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'bpmn-js/test/TestHelper.js';

import {
  query as domQuery
} from 'min-dom';

import alignElementsModule from 'bpmn-js/lib/features/align-elements';
import modelingModule from 'bpmn-js/lib/features/modeling';
import coreModule from 'bpmn-js/lib/core';

import basicXML from '../../../fixtures/bpmn/align-elements.bpmn';


describe('features/align-elements - context pad', function() {

  beforeEach(bootstrapModeler(basicXML, {
    modules: [
      alignElementsModule,
      modelingModule,
      coreModule
    ]
  }));


  it('should provide button to open menu', inject(function(elementRegistry, contextPad) {

    // given
    var elements = [
      elementRegistry.get('EndEvent_lane'),
      elementRegistry.get('Task_lane'),
      elementRegistry.get('SubProcess_lane')
    ];

    // when
    contextPad.open(elements);

    // then
    expect(getEntry(elements, 'align-elements')).to.exist;
  }));


  it('should NOT provide button if no actions are available', inject(
    function(elementRegistry, contextPad, popupMenu) {

      // given
      var elements = [
        elementRegistry.get('EndEvent_lane'),
        elementRegistry.get('Task_lane'),
        elementRegistry.get('SubProcess_lane')
      ];
      popupMenu.registerProvider('align-elements', 0, {
        getPopupMenuEntries: function() {
          return function() {
            return {};
          };
        }
      });

      // when
      contextPad.open(elements);

      // then
      expect(getEntry(elements, 'align-elements')).not.to.exist;
    })
  );


  it('should open popup menu when item is clicked', inject(
    function(elementRegistry, contextPad, popupMenu) {

      // given
      var elements = [
        elementRegistry.get('EndEvent_lane'),
        elementRegistry.get('Task_lane'),
        elementRegistry.get('SubProcess_lane')
      ];
      contextPad.open(elements);

      // when
      var entry = getEntry(elements, 'align-elements');
      entry.click();

      // then
      expect(popupMenu.isOpen()).to.be.true;
    })
  );
});


// helper //////////////////////////////////////////////////////////////////////
function getEntry(target, actionName) {
  return padEntry(getBpmnJS().invoke(function(contextPad) {
    return contextPad.getPad(target).html;
  }), actionName);
}

function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}
