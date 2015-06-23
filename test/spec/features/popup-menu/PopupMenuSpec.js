'use strict';

/* global bootstrapModeler, inject */

var TestHelper = require('../../../TestHelper'),
    coreModule = require('../../../../lib/core'),
    popupMenuModule = require('diagram-js/lib/features/popup-menu'),
    modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace'),
    domQuery = require('min-dom/lib/query'),
    is = require('../../../../lib/util/ModelUtil').is;

function queryEntry(popupMenu, id) {
  return queryPopup(popupMenu, '[data-id="' + id + '"]');
}

function queryPopup(popupMenu, selector) {
  return domQuery(selector, popupMenu._current.container);
}

describe('features/popup-menu', function() {

  var diagramXML = require('../../../fixtures/bpmn/draw/activity-markers-simple.bpmn');

  var testModules = [ coreModule, modelingModule, popupMenuModule, replaceModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('replacing a task', function() {

    it('should retain the loop characteristics for call activites',
      inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'replace-with-call-activity');

      // when
      // replacing the task with a call activity
      popupMenu.trigger({ target: entry, preventDefault: function(){} });

      // then
      // get the send task from the registry
      var callActivity = elementRegistry.filter(function(element, gfx) {
        return element.type === 'bpmn:CallActivity';
      })[0];

      expect(callActivity.businessObject.loopCharacteristics).toBeDefined();
      expect(is(callActivity.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(true);
      expect(callActivity.businessObject.loopCharacteristics.isSequential).toBe(true);
    }));

  });

});
