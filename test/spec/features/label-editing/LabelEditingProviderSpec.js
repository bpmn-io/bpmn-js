'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */

TestHelper.insertCSS('diagram-js-label-editing.css',
  'div { box-sizing: border-box; }' +
  'div[contenteditable=true] { line-height: 14px; font-family: Arial; font-size: 12px }'
);


var labelEditingModule = require('../../../../lib/features/label-editing'),
    coreModule = require('../../../../lib/core'),
    draggingModule = require('diagram-js/lib/features/dragging');

var LabelUtil = require('../../../../lib/features/label-editing/LabelUtil');

function triggerKeyEvent(element, event, code) {
  var e = document.createEvent('Events');

  if (e.initEvent) {
    e.initEvent(event, true, true);
  }

  e.keyCode = code;
  e.which = code;

  return element.dispatchEvent(e);
}

describe('features - label-editing', function() {

  var diagramXML = require('../../../fixtures/bpmn/features/label-editing/labels.bpmn');

  describe('basics', function() {

    var testModules = [ labelEditingModule, coreModule, draggingModule ];

    beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


    it('should register on dblclick', inject(function(elementRegistry, directEditing, eventBus) {

      // given
      var shape = elementRegistry.get('task-nested-embedded');

      // when
      eventBus.fire('element.dblclick', { element: shape });

      // then
      expect(directEditing.isActive()).to.be.true;
    }));


    it('should cancel on <ESC>', inject(function(elementRegistry, directEditing, eventBus) {

      // given
      var shape = elementRegistry.get('task-nested-embedded'),
          task = shape.businessObject;

      var oldName = task.name;

      // activate
      eventBus.fire('element.dblclick', { element: shape });

      var textbox = directEditing._textbox.content;

      // when
      // change + ESC is pressed
      textbox.innerText = 'new value';
      triggerKeyEvent(textbox, 'keydown', 27);

      // then
      expect(directEditing.isActive()).to.be.false;
      expect(task.name).to.equal(oldName);
    }));


    it('should complete on drag start', inject(function(elementRegistry, directEditing, dragging) {

      // given
      var shape = elementRegistry.get('task-nested-embedded'),
          task = shape.businessObject;

      directEditing.activate(shape);

      directEditing._textbox.content.innerText = 'FOO BAR';

      // when
      dragging.init(null, { x: 0, y: 0 }, 'foo');

      // then
      expect(task.name).to.equal('FOO BAR');
    }));


    it('should submit on root element click', inject(function(elementRegistry, directEditing, canvas, eventBus) {

      // given
      var shape = elementRegistry.get('task-nested-embedded'),
          task = shape.businessObject;

      // activate
      eventBus.fire('element.dblclick', { element: shape });

      var newName = 'new value';

      // a <textarea /> element
      var content = directEditing._textbox.content;

      content.innerText = newName;

      // when
      // change + <element.mousedown>

      eventBus.fire('element.mousedown', { element: canvas.getRootElement() });

      // then
      expect(directEditing.isActive()).to.be.false;
      expect(task.name).to.equal(newName);
    }));

  });


  describe('details', function() {

    var testModules = [ labelEditingModule, coreModule ];

    beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));

    var elementRegistry,
        eventBus,
        directEditing;


    beforeEach(inject([ 'elementRegistry', 'eventBus', 'directEditing', function(_elementRegistry, _eventBus, _directEditing) {
      elementRegistry = _elementRegistry;
      eventBus = _eventBus;
      directEditing = _directEditing;
    }]));


    function directEditActivate(element) {
      if (element.waypoints) {
        eventBus.fire('element.dblclick', { element: element });
      } else {
        eventBus.fire('element.dblclick', { element: element });
      }
    }

    function directEditUpdate(value) {
      directEditing._textbox.content.innerText = value;
    }

    function directEditComplete(value) {
      directEditUpdate(value);
      directEditing.complete();
    }

    function directEditCancel(value) {
      directEditUpdate(value);
      directEditing.cancel();
    }


    describe('command support', function() {

      it('should update via command stack', function() {

        // given
        var diagramElement = elementRegistry.get('user-task');

        var listenerCalled;

        eventBus.on('commandStack.changed', function(e) {
          listenerCalled = true;
        });

        // when
        directEditActivate(diagramElement);
        directEditComplete('BAR');

        // then
        expect(listenerCalled).to.be.true;
      });


      it('should undo via command stack', inject(function(commandStack) {

        // given
        var diagramElement = elementRegistry.get('user-task');

        var oldLabel = LabelUtil.getLabel(diagramElement);

        // when
        directEditActivate(diagramElement);
        directEditComplete('BAR');

        commandStack.undo();

        // then
        var label = LabelUtil.getLabel(diagramElement);
        expect(label).to.eql(oldLabel);
      }));

    });


    describe('should trigger redraw', function() {

      it('on shape change', function() {

        // given
        var diagramElement = elementRegistry.get('user-task');

        var listenerCalled;

        eventBus.on('element.changed', function(e) {
          if (e.element === diagramElement) {
            listenerCalled = true;
          }
        });

        // when
        directEditActivate(diagramElement);
        directEditComplete('BAR');

        // then
        expect(listenerCalled).to.be.true;
      });


      it('on connection on change', function() {

        // given
        var diagramElement = elementRegistry.get('sequence-flow-no');

        var listenerCalled;

        eventBus.on('element.changed', function(e) {
          if (e.element === diagramElement.label) {
            listenerCalled = true;
          }
        });

        // when
        directEditActivate(diagramElement);
        directEditComplete('BAR');

        // then
        expect(listenerCalled).to.be.true;
      });

    });


    describe('element support, should edit', function() {

      function directEdit(elementId) {

        return inject(function(elementRegistry, eventBus, directEditing) {

          var diagramElement = elementRegistry.get(elementId);

          var label = LabelUtil.getLabel(diagramElement);


          // when
          directEditActivate(diagramElement);

          // then
          // expect editing to be active
          expect(directEditing.getValue()).to.eql(label);
          expect(directEditing.isActive()).to.be.true;


          // when
          directEditComplete('B');

          // then
          // expect update to have happened
          label = LabelUtil.getLabel(diagramElement);
          expect(label).to.equal('B');


          // when
          directEditActivate(diagramElement);
          directEditCancel('C');

          // expect no label update to have happened
          label = LabelUtil.getLabel(diagramElement);
          expect(label).to.equal('B');
        });
      }


      it('task', directEdit('user-task'));


      it('gateway', directEdit('exclusive-gateway'));

      it('gateway via label', directEdit('exclusive-gateway_label'));


      it('event', directEdit('intermediate-throw-event'));

      it('event via label', directEdit('intermediate-throw-event_label'));

      it('event without label', directEdit('start-event'));


      it('data store reference', directEdit('data-store-reference'));

      it('data object reference', directEdit('data-object-reference'));


      it('sequenceflow', directEdit('sequence-flow-yes'));

      it('sequenceflow without label', directEdit('sequenceflow-unlabeled'));

      it('sequenceflow via label', directEdit('sequence-flow-yes_label'));


      it('message flow', directEdit('message-flow'));

      it('message flow via label', directEdit('message-flow_label'));


      it('pool', directEdit('expanded-pool'));

      it('pool, collapsed', directEdit('collapsed-pool'));


      it('lane with label', directEdit('nested-lane-1-2'));

      it('lane without label', directEdit('nested-lane-no-label'));

    });
  });


  describe('sizing', function() {

    var testModules = [ labelEditingModule, coreModule ];



    function testTextboxSizing(elementId, zoom, width, height, content) {
      return inject(function(canvas, elementRegistry, directEditing) {
        // zoom in
        canvas.zoom(zoom);
        // grab one element
        var shape = elementRegistry.get(elementId);
        // activate label editing
        directEditing.activate(shape);
        // grab the textarea
        var textbox = directEditing._textbox;
        // optionally set content text
        if (content) {
          textbox.content.innerText = content;
        }

        if (width === 'auto') {
          width = shape.width;
        }

        if (height === 'auto') {
          height = shape.height;
        }

        // then
        if (typeof width === 'object' && width.min) {
          expect(textbox.content.offsetWidth).to.be.at.least(width.min);
        } else {
          expect(textbox.content.offsetWidth).to.be.equal(width);
        }

        if (typeof height === 'object' && height.min) {
          expect(textbox.content.offsetHeight).to.be.at.least(height.min);
        } else {
          expect(textbox.content.offsetHeight).to.be.equal(height);
        }
      });
    }

    beforeEach(bootstrapViewer(diagramXML, {
      modules: testModules,
      canvas: { deferUpdate: false }
    }));


    describe('height', function() {

      var oneLineText = 'One line',
          twoLineText = 'Two\nlines',
          tenLineText = '1\n2\n3\n4\n5\n6\n7\n8\n9\n0';

      describe('external labels', function() {

        it('[no text] should have min height', testTextboxSizing('start-event', 1, 150, 20));

        it('[1 line text] should be 1 line high', testTextboxSizing('start-event', 1, 150, 20, oneLineText));

        it('[2 line text] should be 2 line high', testTextboxSizing('start-event', 1, 150, 34, twoLineText));

        it('[10 line text] should be 10 line high', testTextboxSizing('start-event', 1, 150, 146, tenLineText));

      });


      describe('internal labels', function() {

        it('[no text] should have fixed dimensions', testTextboxSizing('empty-task', 1, 'auto', 'auto'));

        it('[1 line text] should have fixed dimensions', testTextboxSizing('empty-task', 1, 'auto', 'auto', oneLineText));

        it('[2 line text] should have fixed dimensions', testTextboxSizing('empty-task', 1, 'auto', 'auto', twoLineText));

        it('[10 line text] should have fixed dimensions', testTextboxSizing('empty-task', 1, 'auto', 'auto', tenLineText));

      });


      describe('sequence flows', function() {

        it('[no text] should have min height', testTextboxSizing('sequenceflow-unlabeled', 1, 150, 20));

        it('[1 line text] should be 1 line high', testTextboxSizing('sequenceflow-unlabeled', 1, 150, 20, oneLineText));

        it('[2 line text] should be 2 line high', testTextboxSizing('sequenceflow-unlabeled', 1, 150, 34, twoLineText));

        it('[10 line text] should be 10 line high', testTextboxSizing('sequenceflow-unlabeled', 1, 150, 146, tenLineText));

      });


      describe('text annotation', function() {

        it('[no text] should have element height', testTextboxSizing('text-annotation', 1, 100, 98));

        it('[1 line text] should have element height', testTextboxSizing('text-annotation', 1, 100, 98, oneLineText));

        it('[2 line text] should have element height', testTextboxSizing('text-annotation', 1, 100, 98, twoLineText));

        it('[10 line text] should have element height', testTextboxSizing('text-annotation', 1, 100, 98, tenLineText));

      });


      describe('expanded sub process', function() {

        it('[no text] should have min height', testTextboxSizing('subprocess-expanded', 1, 200, 20));

        it('[1 line text] should be 1 line high', testTextboxSizing('subprocess-expanded', 1, 200, 20, oneLineText));

        it('[2 line text] should be 2 line high', testTextboxSizing('subprocess-expanded', 1, 200, 34, twoLineText));

        it('[10 line text] should be max 3 line high', testTextboxSizing('subprocess-expanded', 1, 200, 48, tenLineText));

      });


      describe('pools/lanes', function() {

        it('[no text] should have min height', testTextboxSizing('expanded-pool', 1, 150, 20));

        it('[1 line text] should be 1 line high', testTextboxSizing('expanded-pool', 1, 150, 20, oneLineText));

        it('[2 line text] should be 2 line high', testTextboxSizing('expanded-pool', 1, 150, 34, twoLineText));

        it('[10 line text] should be max 2 line high', testTextboxSizing('expanded-pool', 1, 150, 34, tenLineText));

      });

    });

    describe('width', function() {

      var oneWord = 'foobar',
          fiveWords = 'lorem ipsum dolor foobar foobar',
          longWord = 'loremipsumdolorfoobar';

      describe('external labels', function() {

        it('[no text] should have fixed width', testTextboxSizing('start-event', 1, 150, 20));

        it('[one word] should have fixed width', testTextboxSizing('start-event', 1, 150, 20, oneWord));

        it('[five words] should have fixed width, line break', testTextboxSizing('start-event', 1, 150, { min: 34 }, fiveWords));

        it('[long word] should have fixed width', testTextboxSizing('start-event', 1, 150, { min: 20 }, longWord));

      });


      describe('internal labels', function() {

        it('[no text] should have fixed dimensions (task)', testTextboxSizing('empty-task', 1, 100, 80));

        it('[no text] should have fixed dimensions (call activity)', testTextboxSizing('call-activity', 1, 100, 80));

        it('[no text] should have fixed dimensions (collapsed sub process)', testTextboxSizing('subprocess-collapsed', 1, 100, 80));

        it('[one word] should have fixed dimensions', testTextboxSizing('empty-task', 1, 100, 80, oneWord));

        it('[five words] should have fixed dimensions', testTextboxSizing('empty-task', 1, 100, 80, fiveWords));

        it('[long word] should have fixed dimensions', testTextboxSizing('empty-task', 1, 100, 80, longWord));

        describe('zoom', function() {

          it('should have fixed dimensions (low zoom)', testTextboxSizing('empty-task', 0.5, 100, 80, oneWord));

          it('should have fixed dimensions (high zoom)', testTextboxSizing('empty-task', 1.5, 150, 120, oneWord));

          it('should center text box position (low zoom)', inject(function(canvas, elementRegistry, directEditing) {

            // given
            canvas.zoom(0.5, { x: 0, y: 0 });

            var shape = elementRegistry.get('empty-task');

            // when
            directEditing.activate(shape);

            // then
            var textbox = directEditing._textbox;

            expect(textbox.content.offsetLeft).to.equal(211);
            expect(textbox.content.offsetTop).to.equal(17);

          }));

        });

      });


      describe('sequence flows', function() {

        it('[no text] should have fixed width', testTextboxSizing('sequenceflow-unlabeled', 1, 150, 20));

        it('[one word] should have fixed width', testTextboxSizing('sequenceflow-unlabeled', 1, 150, 20, oneWord));

        it('[five words] should have fixed width, line break', testTextboxSizing('sequenceflow-unlabeled', 1, 150, { min: 34 }, fiveWords));

        it('[long word] should have fixed width', testTextboxSizing('sequenceflow-unlabeled', 1, 150, { min: 20 }, longWord));

      });


      describe('text annotation', function() {

        it('[no text] should have min width', testTextboxSizing('text-annotation', 1, 100, 98));

        it('[one word] should have min width', testTextboxSizing('text-annotation', 1, 100, 98, oneWord));

        it('[five words] should expand width', testTextboxSizing('text-annotation', 1, { min: 176 }, 98, fiveWords));

        it('[long word] should expand width', testTextboxSizing('text-annotation', 1, { min: 129 }, 98, longWord));

      });


      describe('expanded sub process', function() {

        it('[no text] should have fixed width', testTextboxSizing('subprocess-expanded', 1, 200, 20));

        it('[one word] should have fixed width', testTextboxSizing('subprocess-expanded', 1, 200, 20, oneWord));

        it('[five words] should have fixed width, line break', testTextboxSizing('subprocess-expanded', 1, 200, 20, fiveWords));

        it('[long word] should have fixed width', testTextboxSizing('subprocess-expanded', 1, 200, 20, longWord));

      });


      describe('pools/lanes', function() {

        it('[no text] should have fixed width', testTextboxSizing('expanded-pool', 1, 150, 20));

        it('[one word] should have fixed width', testTextboxSizing('expanded-pool', 1, 150, 20, oneWord));

        it('[five words] should have fixed width, line break', testTextboxSizing('expanded-pool', 1, 150, 34, fiveWords));

        it('[long word] should have fixed width', testTextboxSizing('expanded-pool', 1, 150, { min: 20 }, longWord));

      });

    });

  });

});
