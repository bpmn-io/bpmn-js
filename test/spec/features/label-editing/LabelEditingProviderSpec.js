'use strict';

require('../../../TestHelper');

var is = require('../../../../lib/util/ModelUtil').is;

/* global bootstrapViewer, inject */


var labelEditingModule = require('../../../../lib/features/label-editing'),
    coreModule = require('../../../../lib/core'),
    draggingModule = require('diagram-js/lib/features/dragging'),
    modelingModule = require('../../../../lib/features/modeling');


var LabelUtil = require('../../../../lib/features/label-editing/LabelUtil');

var minBoundsLabel = require('../../../../lib/util/LabelUtil').DEFAULT_LABEL_SIZE,
    minBoundsTextbox = {
      width: 150,
      height: 50
    };

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

    var testModules = [ labelEditingModule, coreModule, draggingModule, modelingModule ];

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

    var testModules = [ labelEditingModule, coreModule, modelingModule ];

    beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));

    var elementRegistry,
        eventBus,
        directEditing;

    beforeEach(inject([ 'elementRegistry', 'eventBus', 'directEditing',
      function(_elementRegistry, _eventBus, _directEditing) {
        elementRegistry = _elementRegistry;
        eventBus = _eventBus;
        directEditing = _directEditing;
      }
    ]));

    function directEditActivate(element) {
      if (element.waypoints) {
        eventBus.fire('element.dblclick', { element: element });
      } else {
        eventBus.fire('element.dblclick', { element: element });
      }
    }

    function directEditUpdateLabel(value) {
      directEditing._textbox.textarea.value = value;
    }

    function directEditUpdateShape(bounds) {
      var textarea = directEditing._textbox.textarea;
      if (bounds.x && bounds.y) {
        textarea.style.left = bounds.x + 'px';
        textarea.style.top = bounds.y + 'px';
      }
      textarea.style.height = bounds.height + 'px';
      textarea.style.width = bounds.width + 'px';
    }

    function directEditComplete(value, bounds) {
      if (value) {
        directEditUpdateLabel(value);
      }
      if (bounds) {
        directEditUpdateShape(bounds);
      }
      directEditing.complete();
    }

    function directEditCancel(value, bounds) {
      if (value) {
        directEditUpdateLabel(value);
      }
      if (bounds) {
        directEditUpdateShape(bounds);
      }
      directEditing.cancel();
    }


    describe('command support', function() {

      describe('- label', function() {

        it('should update via command stack', function() {
          // given
          var diagramElement = elementRegistry.get('user-task');

          var listenerCalled;

          eventBus.on('commandStack.changed', function(e) {
            listenerCalled = true;
          });

          // when
          directEditActivate(diagramElement);
          directEditComplete('BAR', {});

          // then
          expect(listenerCalled).to.be.true;
        });


        it('should be undone via command stack', inject(function(commandStack) {
          // given
          var diagramElement = elementRegistry.get('user-task');

          var oldLabel = LabelUtil.getLabel(diagramElement);

          // when
          directEditActivate(diagramElement);
          directEditComplete('BAR', {});

          commandStack.undo();

          // then
          var label = LabelUtil.getLabel(diagramElement);
          expect(label).to.eql(oldLabel);
        }));

      });


      describe('- shape', function() {

        it('of TextAnnotation should update via commandStack', function() {
          // given
          var diagramElement = elementRegistry.get('text-annotation');
          var oldPosition = { x: diagramElement.x, y: diagramElement.y };
          var newBounds = { height: 100, width: 150 };

          // when
          directEditActivate(diagramElement);

          // then expect textarea to be autosizing
          expect(directEditing._textbox.textarea.autosizing).to.be.true;

          // when resizing textarea
          directEditComplete('', newBounds);

          // then element should have new bounds
          expect(diagramElement.x).to.eql(oldPosition.x);
          expect(diagramElement.y).to.eql(oldPosition.y);
          expect(diagramElement.height).to.eql(newBounds.height);
          expect(diagramElement.width).to.eql(newBounds.width);
        });


        it('of TextAnnotation should be undone via commandStack', inject(function(commandStack) {
          // given
          var diagramElement = elementRegistry.get('text-annotation');
          var oldBounds = {
            x: diagramElement.x,
            y: diagramElement.y,
            width: diagramElement.width,
            height: diagramElement.height
          };
          var newBounds = {  height: 100, width: 150 };

          directEditActivate(diagramElement);
          directEditComplete('', newBounds);

          // when
          commandStack.undo();

          // then element should have old bounds
          expect(diagramElement.x).to.eql(oldBounds.x);
          expect(diagramElement.y).to.eql(oldBounds.y);
          expect(diagramElement.height).to.eql(oldBounds.height);
          expect(diagramElement.width).to.eql(oldBounds.width);
        }));


        describe('of external label should update via commandStack', function() {

          it('to newBounds if newBoundsTextbox > minBoundsTextbox', function() {
            // given
            var diagramElement = elementRegistry.get('exclusive-gateway').label;
            var newBounds = { height: minBoundsTextbox.height + 10, width: minBoundsTextbox.width + 10 };

            // when
            directEditActivate(diagramElement);

            // then expect textarea to be autosizing
            expect(directEditing._textbox.textarea.autosizing).to.be.true;

            // when resizing textarea
            directEditComplete('', newBounds);

            // then element should have new bounds
            expect(diagramElement.height).to.eql(minBoundsTextbox.height + 10);
            expect(diagramElement.width).to.eql(minBoundsTextbox.width + 10);
          });


          it('to minBoundsLabel.width and correct height if newBoundsTextbox <= minBoundsTextbox', function() {
            // given
            var diagramElement = elementRegistry.get('exclusive-gateway').label;
            var newBounds = { height: minBoundsTextbox.height - 10, width: minBoundsTextbox.width - 10 };

            // when resizing textarea
            directEditActivate(diagramElement);
            directEditComplete('', newBounds);

            // then element should have minBoundsLabel.width
            expect(diagramElement.width).to.eql(minBoundsLabel.width);

            // then element should have max(minBoundsLabel.height, newBounds.height)
            expect(diagramElement.height).to.eql(Math.max(minBoundsLabel.height, newBounds.height));
          });
        });


        it('of external label should be undone via commandStack', inject(function(commandStack) {
          // given
          var diagramElement = elementRegistry.get('exclusive-gateway').label;
          var oldBounds = {
            x: diagramElement.x,
            y: diagramElement.y,
            width: diagramElement.width,
            height: diagramElement.height
          };
          var newBounds = { height: 100, width: 200 };

          directEditActivate(diagramElement);
          directEditComplete('', newBounds);

          // when
          commandStack.undo();

          // then element should have old bounds
          expect(diagramElement.height).to.eql(oldBounds.height);
          expect(diagramElement.width).to.eql(oldBounds.width);
        }));


        it('of element without autosizing textarea should not update', function() {
          // given
          var diagramElement = elementRegistry.get('user-task');
          var bounds = {
            x: diagramElement.x,
            y: diagramElement.y,
            width: diagramElement.width,
            height: diagramElement.height
          };
          var newBounds = { width: 120, height: 100 };

          // when
          directEditActivate(diagramElement);

          // then expect textarea to be not autosizing
          expect(!!directEditing._textbox.textarea.autosizing).to.be.false;

          // when resizing textarea
          directEditComplete('', newBounds);

          // then expect bounds to stay the same
          expect(diagramElement.x).to.eql(bounds.x);
          expect(diagramElement.y).to.eql(bounds.y);
          expect(diagramElement.height).to.eql(bounds.height);
          expect(diagramElement.width).to.eql(bounds.width);
        });

      });

    });


    describe('- position', function() {

      it('of external label should stay centered if completing', function() {
        // given
        var diagramElement = elementRegistry.get('exclusive-gateway').label;
        var newBounds = { height: 100, width: 200 };
        var midXOldLabel = diagramElement.x + diagramElement.width / 2;
        var oldY = diagramElement.y;

        // when resizing textarea
        directEditActivate(diagramElement);
        directEditComplete('', newBounds);

        //then new label should be centered and y remaining the same
        var midXNewLabel = diagramElement.x + newBounds.width / 2;
        expect(midXNewLabel).to.eql(midXOldLabel);
        expect(diagramElement.y).to.eql(oldY);
      });


      it('of old external label should be centered if undoing', inject(function(commandStack){
        // given
        var diagramElement = elementRegistry.get('exclusive-gateway').label;
        var oldBounds = {
          x: diagramElement.x,
          y: diagramElement.y,
          width: diagramElement.width,
          height: diagramElement.height
        };
        var newBounds = { height: 100, width: 200 };
        var midXOldLabel = diagramElement.x + diagramElement.width / 2;

        directEditActivate(diagramElement);
        directEditComplete('', newBounds);

        // when
        commandStack.undo();

        // then
        var midXUndoneLabel = diagramElement.x + diagramElement.width / 2;
        expect(midXUndoneLabel).to.eql(midXOldLabel);
        expect(diagramElement.y).to.eql(oldBounds.y);
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
        directEditComplete('BAR', {});

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
        directEditComplete('BAR', {});

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


          // when element has external label or is a textannotation
          var LabelOrTextAnnotation =
              is(diagramElement, 'bpmn:TextAnnotation') ||
              !!diagramElement.label || diagramElement.type ==='label';

          // then
          //expect textarea to be autosizing
          //else to be not autosizing
          expect(!!directEditing._textbox.textarea.autosizing).to.eql(LabelOrTextAnnotation);

          // when
          directEditComplete('B', {});

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

    var testModules = [ labelEditingModule, coreModule, modelingModule ];

    beforeEach(bootstrapViewer(diagramXML, {
      modules: testModules,
      canvas: { deferUpdate: false }
    }));


    describe('textbox should have minimum size', function() {

      function testTextboxSizing(elementId, zoom, width, height) {
        return inject(function(canvas, elementRegistry, directEditing) {
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
