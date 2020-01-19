import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import rulesModule from 'lib/features/rules';
import snappingModule from 'lib/features/snapping';
import spaceToolModule from 'diagram-js/lib/features/space-tool';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';

import { SUB_PROCESS_MIN_DIMENSIONS } from 'lib/features/modeling/behavior/ResizeBehavior';

var testModules = [
  coreModule,
  modelingModule,
  rulesModule,
  snappingModule,
  spaceToolModule
];


describe('features/modeling - space tool behavior', function() {

  describe('participant', function() {

    describe('minimum dimensions', function() {

      var diagramXML = require('./SpaceToolBehaviorSpec.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should ensure minimum dimensions', inject(
        function(dragging, elementRegistry, spaceTool) {

          // given
          var subProcess = elementRegistry.get('SubProcess_1');

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 0 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(subProcess.width).to.equal(SUB_PROCESS_MIN_DIMENSIONS.width);
        })
      );

    });

  });

});