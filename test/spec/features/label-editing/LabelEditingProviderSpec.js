'use strict';

require('../../../TestHelper');

/* global bootstrapViewer, inject */


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

      // a <textarea /> element
      var textarea = directEditing._textbox.textarea;

      // when
      // change + ESC is pressed
      textarea.value = 'new value';
      triggerKeyEvent(textarea, 'keydown', 27);

      // then
      expect(directEditing.isActive()).to.be.false;
      expect(task.name).to.equal(oldName);
    }));


    it('should complete on drag start', inject(function(elementRegistry, directEditing, dragging) {

      // given
      var shape = elementRegistry.get('task-nested-embedded'),
          task = shape.businessObject;

      directEditing.activate(shape);

      directEditing._textbox.textarea.value = 'FOO BAR';

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
      var textarea = directEditing._textbox.textarea;

      // when
      // change + <element.mousedown>
      textarea.value = newName;

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
      directEditing._textbox.textarea.value = value;
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

    beforeEach(bootstrapViewer(diagramXML, {
      modules: testModules,
      canvas: { deferUpdate: false }
    }));


    describe('textbox should have minimum size', function() {

      function testTextboxSizing(elementId, zoom, width, height) {
        return inject(function(canvas, elementRegistry, directEditing){
          // zoom in
          canvas.zoom(zoom);
          // grab one element
          var shape = elementRegistry.get(elementId);
          // activate label editing
          directEditing.activate(shape);
          // grab the textarea
          var textbox = directEditing._textbox;
          // then
          expect(textbox.textarea.offsetWidth).to.be.equal(width);
          expect(textbox.textarea.offsetHeight).to.be.equal(height);
        });
      }

      it('task', testTextboxSizing('task-nested-embedded', 1, 100, 80));
      it('task, low zoom', testTextboxSizing('task-nested-embedded', 1, 100, 80));

      it('call activity', testTextboxSizing('call-activity', 1, 100, 80));
      it('call activity, low zoom', testTextboxSizing('call-activity', 0.4, 100, 80));

      it('subprocess collapsed', testTextboxSizing('subprocess-collapsed', 1, 100, 80));
      it('subprocess collapsed, low zoom', testTextboxSizing('subprocess-collapsed', 0.4, 100, 80));

      it('subprocess expanded', testTextboxSizing('subprocess-expanded', 1, 200, 50));
      it('subprocess expanded, low zoom', testTextboxSizing('subprocess-expanded', 0.4, 200, 50));

      it('collapsed pool expanded', testTextboxSizing('collapsed-pool', 1, 385, 50));
      it('collapsed pool, low zoom', testTextboxSizing('collapsed-pool', 0.4, 385, 50));
    });

  });

});
