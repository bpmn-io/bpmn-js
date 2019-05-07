import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import autoResizeModule from 'lib/features/auto-resize';
import coreModule from 'lib/core';
import gridSnappingModule from 'lib/features/grid-snapping';
import modelingModule from 'lib/features/modeling';


describe('features/grid-snapping - auto-resize', function() {

  var diagramXML = require('./AutoResizeBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      autoResizeModule,
      coreModule,
      gridSnappingModule,
      modelingModule
    ]
  }));


  it('should snap <sw> (width, height)', inject(function(elementRegistry, modeling) {

    // given
    var subProcess = elementRegistry.get('SubProcess_1'),
        task = elementRegistry.get('Task_1');

    [
      { x: 100, y: 100, width: 350, height: 270 },
      { x: 100, y: 100, width: 450, height: 270 },
      { x: 100, y: 100, width: 450, height: 360 },
      { x: 100, y: 100, width: 450, height: 360 },
      { x: 100, y: 100, width: 560, height: 460 }
    ].forEach(function(bounds) {

      // when
      modeling.moveElements([ task ], { x: 36, y: 48 }, subProcess);

      // then
      expect(subProcess).to.have.bounds(bounds);
    });
  }));

});