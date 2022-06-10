import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import alignElementsModule from 'lib/features/align-elements';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';



describe('features/align-elements - context pad', function() {

  var testModules = [ alignElementsModule, modelingModule, coreModule ];

  var basicXML = require('../../../fixtures/bpmn/align-elements.bpmn');

  beforeEach(bootstrapModeler(basicXML, { modules: testModules }));


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
