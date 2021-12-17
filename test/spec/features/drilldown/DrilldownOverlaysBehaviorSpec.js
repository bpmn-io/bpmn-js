import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';
import drilldownModule from 'lib/features/drilldown';
import { classes } from 'min-dom';

describe('features/modeling/behavior - subprocess planes', function() {

  var diagramXML = require('./DrilldownOverlayBehaviorSpec.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule,
      replaceModule,
      drilldownModule
    ]
  }));


  describe('create new drilldowns', function() {

    it('should create drilldown for new process',
      inject(function(elementFactory, modeling, canvas, overlays) {

        // given
        var subProcess = elementFactory.createShape({
          type: 'bpmn:SubProcess',
          isExpanded: false
        });

        // when
        modeling.createShape(subProcess, { x: 300, y: 300 }, canvas.getRootElement());

        // then
        var elementOverlays = overlays.get({ element: subProcess });
        expect(elementOverlays).to.not.be.empty;

      })
    );


    it('should not create drilldown for expanded subprocess',
      inject(function(elementFactory, modeling, canvas, overlays) {

        // given
        var subProcess = elementFactory.createShape({
          type: 'bpmn:SubProcess',
          isExpanded: true
        });

        // when
        modeling.createShape(subProcess, { x: 300, y: 300 }, canvas.getRootElement());

        // then
        var elementOverlays = overlays.get({ element: subProcess });
        expect(elementOverlays).to.be.empty;
      })
    );


    it('should undo',
      inject(function(elementFactory, modeling, commandStack, canvas, overlays) {

        // given
        var subProcess = elementFactory.createShape({
          type: 'bpmn:SubProcess',
          isExpanded: false
        });
        modeling.createShape(subProcess, { x: 300, y: 300 }, canvas.getRootElement());

        // when
        commandStack.undo();

        // then
        var elementOverlays = overlays.get({ element: subProcess });
        expect(elementOverlays).to.be.empty;
      })
    );


    it('should redo',
      inject(function(elementFactory, modeling, commandStack, canvas, overlays) {

        // given
        var subProcess = elementFactory.createShape({
          type: 'bpmn:SubProcess',
          isExpanded: false
        });
        modeling.createShape(subProcess, { x: 300, y: 300 }, canvas.getRootElement());

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var elementOverlays = overlays.get({ element: subProcess });
        expect(elementOverlays).to.not.be.empty;
      })
    );


    it('should recreate drilldown on undo delete',
      inject(function(elementRegistry, modeling, commandStack, overlays) {

        // given
        var subProcess = elementRegistry.get('Subprocess_with_content');
        modeling.removeShape(subProcess);

        // when
        commandStack.undo();

        // then
        var elementOverlays = overlays.get({ element: subProcess });
        expect(elementOverlays).to.not.be.empty;

      })
    );

  });


  describe('overlay visibility', function() {

    describe('empty subprocess', function() {

      it('should hide drilldown', inject(function(elementRegistry, overlays) {

        // given
        var subProcess = elementRegistry.get('Subprocess_empty');

        // then
        var overlay = overlays.get({ element: subProcess })[0];

        expect(classes(overlay.html).contains('bjs-drilldown-empty')).to.be.true;
      }));


      it('should show when content is added',
        inject(function(elementRegistry, overlays, elementFactory, modeling, canvas) {

          // given
          var subProcess = elementRegistry.get('Subprocess_empty');
          var task = elementFactory.createShape({ type: 'bpmn:Task' });
          var planeRoot = canvas.findRoot('Subprocess_empty_plane');

          // when
          modeling.createShape(task, { x: 300, y: 300 }, planeRoot);

          // then
          var overlay = overlays.get({ element: subProcess })[0];

          expect(classes(overlay.html).contains('bjs-drilldown-empty')).to.be.false;
        })
      );


      it('should undo',
        inject(function(elementRegistry, overlays, elementFactory,
            modeling, canvas, commandStack) {

          // given
          var subProcess = elementRegistry.get('Subprocess_empty');
          var task = elementFactory.createShape({ type: 'bpmn:Task' });
          var planeRoot = canvas.findRoot('Subprocess_empty_plane');

          modeling.createShape(task, { x: 300, y: 300 }, planeRoot);

          // when
          commandStack.undo();

          // then
          var overlay = overlays.get({ element: subProcess })[0];

          expect(classes(overlay.html).contains('bjs-drilldown-empty')).to.be.true;
        })
      );


      it('should redo',
        inject(function(elementRegistry, overlays, elementFactory,
            modeling, canvas, commandStack) {

          // given
          var subProcess = elementRegistry.get('Subprocess_empty');
          var task = elementFactory.createShape({ type: 'bpmn:Task' });
          var planeRoot = canvas.findRoot('Subprocess_empty_plane');
          modeling.createShape(task, { x: 300, y: 300 }, planeRoot);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var overlay = overlays.get({ element: subProcess })[0];

          expect(classes(overlay.html).contains('bjs-drilldown-empty')).to.be.false;
        })
      );

    });


    describe('subprocess with content', function() {

      it('should show drilldown', inject(function(elementRegistry, overlays) {

        // given
        var subProcess = elementRegistry.get('Subprocess_with_content');

        // then
        var overlay = overlays.get({ element: subProcess })[0];

        expect(classes(overlay.html).contains('bjs-drilldown-empty')).to.be.false;
      }));


      it('should hide when content is removed',
        inject(function(elementRegistry, overlays, modeling) {

          // given
          var subProcess = elementRegistry.get('Subprocess_with_content');
          var startEvent = elementRegistry.get('StartEvent_embedded');

          // when
          modeling.removeShape(startEvent);

          // then
          var overlay = overlays.get({ element: subProcess })[0];

          expect(classes(overlay.html).contains('bjs-drilldown-empty')).to.be.true;
        })
      );


      it('should undo',
        inject(function(elementRegistry, overlays, modeling, commandStack) {

          // given
          var subProcess = elementRegistry.get('Subprocess_with_content');
          var startEvent = elementRegistry.get('StartEvent_embedded');
          modeling.removeShape(startEvent);

          // when
          commandStack.undo();

          // then
          var overlay = overlays.get({ element: subProcess })[0];

          expect(classes(overlay.html).contains('bjs-drilldown-empty')).to.be.false;
        })
      );


      it('should redo',
        inject(function(elementRegistry, overlays, modeling, commandStack) {

          // given
          var subProcess = elementRegistry.get('Subprocess_with_content');
          var startEvent = elementRegistry.get('StartEvent_embedded');
          modeling.removeShape(startEvent);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var overlay = overlays.get({ element: subProcess })[0];

          expect(classes(overlay.html).contains('bjs-drilldown-empty')).to.be.true;
        })
      );

    });

  });


  describe('expand/collapse', function() {

    describe('collapse', function() {

      it('should create new overlay on collapse',
        inject(function(elementRegistry, modeling, canvas, overlays) {

          // given
          var subProcess = elementRegistry.get('Subprocess_expanded');

          // when
          modeling.toggleCollapse(subProcess);

          // then
          var elementOverlays = overlays.get({ element: subProcess });
          expect(elementOverlays).to.not.be.empty;
        }));


      it('should undo',
        inject(function(elementRegistry, modeling, overlays, commandStack) {

          // given
          var subProcess = elementRegistry.get('Subprocess_expanded');
          modeling.toggleCollapse(subProcess);

          // when
          commandStack.undo();

          // then
          var elementOverlays = overlays.get({ element: subProcess });
          expect(elementOverlays).to.be.empty;
        }));


      it('should redo',
        inject(function(elementRegistry, modeling, overlays, commandStack) {

          // given
          var subProcess = elementRegistry.get('Subprocess_expanded');
          modeling.toggleCollapse(subProcess);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var elementOverlays = overlays.get({ element: subProcess });
          expect(elementOverlays).to.not.be.empty;
        }));

    });


    describe('expand', function() {

      it('should remove overlay on expand',
        inject(function(elementRegistry, modeling, overlays) {

          // given
          var subProcess = elementRegistry.get('Subprocess_with_content');

          // when
          modeling.toggleCollapse(subProcess);

          // then
          var elementOverlays = overlays.get({ element: subProcess });
          expect(elementOverlays).to.be.empty;
        }));


      it('should undo',
        inject(function(elementRegistry, modeling, overlays, commandStack) {

          // given
          var subProcess = elementRegistry.get('Subprocess_with_content');
          modeling.toggleCollapse(subProcess);

          // when
          commandStack.undo();

          // then
          var elementOverlays = overlays.get({ element: subProcess });
          expect(elementOverlays).to.not.empty;
        }));


      it('should redo',
        inject(function(elementRegistry, modeling, overlays, commandStack) {

          // given
          var subProcess = elementRegistry.get('Subprocess_with_content');
          modeling.toggleCollapse(subProcess);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var elementOverlays = overlays.get({ element: subProcess });
          expect(elementOverlays).to.be.empty;
        }));

    });

  });


  it('should only show one overlay', inject(function(elementRegistry, overlays, modeling) {

    // given
    var filledSubProcess = elementRegistry.get('Subprocess_with_content');
    var emptySubProcessPlane = elementRegistry.get('Subprocess_empty_plane');

    // when
    modeling.moveShape(filledSubProcess, { x: 0, y: 0 }, emptySubProcessPlane);

    // then
    var elementOverlays = overlays.get({ element: filledSubProcess });
    expect(elementOverlays).to.have.lengthOf(1);
  }));

});
