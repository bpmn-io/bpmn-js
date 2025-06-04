import { inject, bootstrapModeler } from 'test/TestHelper';

import bpmnCrossWindowCopyPasteModule from 'lib/features/copy-paste/';
import bpmnCopyPasteModule from 'lib/features/copy-paste';
import copyPasteModule from 'diagram-js/lib/features/copy-paste';
import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

describe('features/window-copy-paste', function() {
  var testModules = [
    bpmnCrossWindowCopyPasteModule,
    bpmnCopyPasteModule,
    copyPasteModule,
    coreModule,
    modelingModule,
  ];

  var basicXML = require('./basic.bpmn');

  beforeEach(
    bootstrapModeler(basicXML, {
      modules: testModules,
    })
  );

  this.beforeAll(function() {
    if (!navigator.clipboard) {
      navigator.clipboard = {};
    }
    var content = '';
    navigator.clipboard.writeText = (text) => {
      content = text;
      return Promise.resolve();
    };
    navigator.clipboard.readText = () => Promise.resolve(content);
  });

  describe('revive string', function() {
    it('should pass with valid JSON', inject(async function(
        elementRegistry,
        copyPaste,
        clipboard,
        eventBus
    ) {

      var startEvent = elementRegistry.get('StartEvent_1');
      copyPaste.copy(startEvent);

      // get tree from clipboard
      var tree = clipboard.get();

      await new Promise((resolve) => setTimeout(resolve, 100));
      eventBus.fire('canvas.focus.changed', { focused: true });

      // get revived tree from system clipboard
      await new Promise((resolve) => setTimeout(resolve, 100));
      var revived_tree = clipboard.get();

      // strip di properties
      tree['0'].forEach((element) => delete element.di);
      revived_tree['0'].forEach((element) => delete element.di);

      // check that revived tree is identical to the original tree
      expect(revived_tree).to.jsonEqual(tree);
    }));

    it('should fail with invalid JSON', inject(async function(eventBus, clipboard) {
      navigator.clipboard.writeText('invalid JSON string');

      await new Promise((resolve) => setTimeout(resolve, 100));
      eventBus.fire('canvas.focus.changed', { focused: true });

      await new Promise((resolve) => setTimeout(resolve, 100));
      var revived_tree = clipboard.get();

      // check that revived tree is empty
      expect(revived_tree).to.be.undefined;
    }
    ));
  });

  // Test copy/paste into system cliboard
  describe('copy/paste into system clipboard', function() {
    it('should copy into system clipboard', inject(function(
        elementRegistry,
        copyPaste
    ) {

      // create mock JSON string
      var startEvent = elementRegistry.get('StartEvent_1'),
          mockString = JSON.stringify(startEvent);

      // triggers copy event, which triggers system copy.
      copyPaste.copy(startEvent);

      // checks that system copy is identical to the input string.
      navigator.clipboard.readText().then((text) => {
        expect(text).to.equal(mockString);
      });
    }));
  });
});
