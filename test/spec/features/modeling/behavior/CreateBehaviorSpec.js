import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import coreModule from 'bpmn-js/lib/core';
import modelingModule from 'bpmn-js/lib/features/modeling';
import { getMid } from 'diagram-js/lib/layout/LayoutUtil.js';

import processDiagramXML from './CreateBehavior.bpmn';


describe('features/modeling - CreateBehavior', function() {

  beforeEach(bootstrapModeler(processDiagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  it('should ensure parent is participant', inject(
    function(elementFactory, elementRegistry, modeling) {

      // given
      var lane = elementRegistry.get('Lane_1'),
          participant = elementRegistry.get('Participant_1');

      var task = elementFactory.createShape({
        type: 'bpmn:Task'
      });

      // when
      modeling.createShape(task, getMid(lane), lane);

      // then
      expect(task.parent).to.equal(participant);
    }
  ));

});