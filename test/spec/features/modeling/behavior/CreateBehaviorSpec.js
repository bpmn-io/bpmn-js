import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import { getMid } from 'diagram-js/lib/layout/LayoutUtil';


describe('features/modeling - CreateBehavior', function() {

  var processDiagramXML = require('./CreateBehavior.bpmn');

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