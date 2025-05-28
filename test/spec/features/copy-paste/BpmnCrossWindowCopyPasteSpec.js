import {
    inject,
    bootstrapModeler,
} from 'test/TestHelper';

import EventBus from 'diagram-js/lib/core/EventBus';
import bpmnCrossWindowCopyPasteModule from 'lib/features/copy-paste/';
import bpmnCopyPasteModule from 'lib/features/copy-paste';
import copyPasteModule from 'diagram-js/lib/features/copy-paste';
import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';


describe.only('features/window-copy-paste', function () {

    var testModules = [
        bpmnCrossWindowCopyPasteModule,
        bpmnCopyPasteModule,
        copyPasteModule,
        coreModule,
        modelingModule
    ];

    var basicXML = require('./basic.bpmn')

    beforeEach(bootstrapModeler(basicXML, {
        modules: testModules
    }));

    describe('revive string', function () {

        it('should pass with valid JSON', inject(function (elementRegistry, moddle, copyPaste, clipboard, eventBus) {

            // create event
            var startEvent = elementRegistry.get('StartEvent_1'),
                mockString = JSON.stringify(startEvent);

            copyPaste.copy(startEvent);

            eventBus.fire('canvas.focus.changed', {
                focused: true
            });

            //wait for 1 second to ensure clipboard is set
            setTimeout(function () {
                var revived = clipboard.get();

                expect(revived).to.equal(startEvent);
            }, 1000);
        }));
    });

    // Test copy/paste into system cliboard
    describe('copy/paste into system clipboard', function () {

        it('should copy into system clipboard', inject(function (elementRegistry, copyPaste) {

            // create mock JSON string
            var startEvent = elementRegistry.get('StartEvent_1'),
                mockString = JSON.stringify(startEvent);

            // triggers copy event, which triggers system copy.
            copyPaste.copy(startEvent);

            // checks that system copy is identical to the input string.
            navigator.clipboard.readText().then(text => { expect(text).to.equal(mockString); });
        }));

    });
});