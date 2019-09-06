import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import keyboardMoveSelectionModule from 'diagram-js/lib/features/keyboard-move-selection';
import modelingModule from 'lib/features/modeling';
import rulesModule from 'lib/features/rules';

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';


describe('features/keyboard-move-selection', function() {

  var diagramXML = require('./keyboard-move-selection.bpmn');

  var testModules = [
    coreModule,
    keyboardMoveSelectionModule,
    modelingModule,
    rulesModule
  ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should move task', inject(function(elementRegistry, keyboardMoveSelection, selection) {

    // given
    var task = elementRegistry.get('Task_1');

    selection.select(task);

    var mid = getMid(task);

    // when
    keyboardMoveSelection.moveSelection('right');

    // then
    expect(getMid(task)).not.to.eql(mid);
  }));


  it('should move participant', inject(function(elementRegistry, keyboardMoveSelection, selection) {

    // given
    var participant = elementRegistry.get('Participant_1');

    selection.select(participant);

    var mid = getMid(participant);

    // when
    keyboardMoveSelection.moveSelection('right');

    // then
    expect(getMid(participant)).not.to.eql(mid);
  }));


  it('should NOT move lane', inject(function(elementRegistry, keyboardMoveSelection, selection) {

    // given
    var lane = elementRegistry.get('Lane_1');

    selection.select(lane);

    var mid = getMid(lane);

    // when
    keyboardMoveSelection.moveSelection('right');

    // then
    expect(getMid(lane)).to.eql(mid);
  }));

});