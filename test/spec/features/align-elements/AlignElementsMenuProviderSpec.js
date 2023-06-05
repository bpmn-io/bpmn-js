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

import alignElementsModule from 'lib/features/align-elements';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';



describe('features/align-elements - popup menu', function() {

  var testModules = [ alignElementsModule, modelingModule, coreModule ];

  var basicXML = require('../../../fixtures/bpmn/align-elements.bpmn');

  beforeEach(bootstrapModeler(basicXML, { modules: testModules }));


  it('should provide alignment buttons', inject(function(elementRegistry, popupMenu) {

    // given
    var elements = [
      elementRegistry.get('EndEvent_lane'),
      elementRegistry.get('Task_lane'),
      elementRegistry.get('SubProcess_lane')
    ];

    // when
    popupMenu.open(elements, 'align-elements', {
      x: 0,
      y: 0
    });

    // then
    forEach([
      'left',
      'center',
      'right',
      'top',
      'middle',
      'bottom'
    ], function(alignment) {
      expect(getEntry('align-elements-' + alignment)).to.exist;
    });
  }));


  it('should close popup menu when button is clicked', inject(
    function(elementRegistry, popupMenu) {

      // given
      var elements = [
        elementRegistry.get('EndEvent_lane'),
        elementRegistry.get('Task_lane'),
        elementRegistry.get('SubProcess_lane')
      ];
      popupMenu.open(elements, 'align-elements', {
        x: 0,
        y: 0
      });
      var entry = getEntry('align-elements-center');

      // when
      entry.click();

      // then
      expect(popupMenu.isOpen()).to.be.false;
    })
  );


  it('should properly size icons even with border-box', inject(function(elementRegistry, popupMenu, canvas) {

    // given
    var container = canvas.getContainer();
    var elements = [
      elementRegistry.get('EndEvent_lane'),
      elementRegistry.get('Task_lane'),
      elementRegistry.get('SubProcess_lane')
    ];

    // when
    container.style['box-sizing'] = 'border-box';
    popupMenu.open(elements, 'align-elements', {
      x: 0,
      y: 0
    });

    // then
    var entry = getEntry('align-elements-left'),
        icon = domQuery('svg', entry);

    var bbox = icon.getBoundingClientRect();

    expect(bbox.width).to.eql(20);
    expect(bbox.height).to.eql(20);
  }));
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
