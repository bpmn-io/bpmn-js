import Modeler from '../../lib/Modeler';

import { getParents } from 'diagram-js/lib/util/Elements';

import { generateDiagram } from './generate-diagram';

import diagramCSS from 'diagram-js/assets/diagram-js.css';
import bpmnCSS from '../../assets/bpmn-js.css';
import bpmnFontCSS from 'bpmn-font/dist/css/bpmn-embedded.css';


// styles are needed so elements are laid out and rendered realistically
insertCSS('diagram-js', diagramCSS);
insertCSS('bpmn-js', bpmnCSS);
insertCSS('bpmn-font', bpmnFontCSS);


const SIZES = [
  { label: 'S', phases: 10, tasksPerPhase: 50 }, // ~1k elements
  { label: 'M', phases: 20, tasksPerPhase: 100 }, // ~4k elements
  { label: 'L', phases: 20, tasksPerPhase: 200 } // ~8k elements
];

const results = [];


describe('benchmark/huge-diagram', function() {

  // huge diagrams -> be generous
  this.timeout(600000);

  SIZES.forEach(function(size) {

    describe('size ' + size.label, function() {

      const { xml, stats } = generateDiagram(size);

      let modeler, elements, container;

      before(async function() {
        container = createContainer();
        modeler = new Modeler({ container });

        const ms = await time(() => modeler.importXML(xml));

        elements = modeler.get('elementRegistry').getAll().filter(e => e.parent);

        record('import', size, stats, ms);
      });


      it('getParents', function() {
        const ms = time(() => getParents(elements));

        record('getParents', size, stats, ms);
      });


      it('copy', function() {
        const copyPaste = modeler.get('copyPaste');

        modeler.get('selection').select(elements);

        const ms = time(() => copyPaste.copy(elements));

        record('copy', size, stats, ms);
      });


      it('select all', function() {
        const selection = modeler.get('selection');

        // given no selection
        selection.select(null);

        // when selecting all elements
        const ms = time(() => selection.select(elements));

        record('select all', size, stats, ms);
      });


      it('reselect all', function() {
        const selection = modeler.get('selection');

        // given the full selection is active
        selection.select(elements);

        // when re-applying the same selection the `selection.changed`
        // diff dominates -- the pre-Set implementation scanned the
        // old/new selection linearly (O(n^2)) in both Selection and
        // SelectionVisuals, with no actual marker changes to do
        const ms = time(() => selection.select(elements.slice()));

        record('reselect all', size, stats, ms);
      });


      it('isSelected', function() {
        const selection = modeler.get('selection');

        // given the full selection is active
        selection.select(elements);

        // when probing membership for every element
        const ms = time(() => {
          for (let i = 0; i < elements.length; i++) {
            selection.isSelected(elements[i]);
          }
        });

        record('isSelected', size, stats, ms);
      });


      it('move preview', function() {
        const move = modeler.get('move');
        const dragging = modeler.get('dragging');
        const elementRegistry = modeler.get('elementRegistry');

        const shapes = elements.filter(e => !e.waypoints);
        const shape = elementRegistry.get('Phase_0');

        modeler.get('selection').select(shapes);

        dragging.setOptions({ manual: true });

        const ms = time(() => {
          move.start(canvasEvent(modeler, { x: 200, y: 200 }), shape);

          dragging.hover({
            element: shape.parent,
            gfx: elementRegistry.getGraphics(shape.parent)
          });

          // triggers preview setup (dragger creation + edge resolution)
          dragging.move(canvasEvent(modeler, { x: 260, y: 260 }));
        });

        dragging.cancel();

        record('move preview', size, stats, ms);
      });


      it('space tool preview', function() {
        const spaceTool = modeler.get('spaceTool');
        const dragging = modeler.get('dragging');
        const canvas = modeler.get('canvas');

        const root = canvas.getRootElement();

        dragging.setOptions({ manual: true });

        const ms = time(() => {
          spaceTool.activateMakeSpace(canvasEvent(modeler, { x: 200, y: 200 }));

          dragging.hover({
            element: root,
            gfx: canvas.getGraphics(root)
          });

          // triggers space tool init (selfAndAllChildren + adjustment calculation)
          dragging.move(canvasEvent(modeler, { x: 260, y: 200 }));
        });

        dragging.cancel();

        record('space preview', size, stats, ms);
      });


      it('move commit', function() {
        const modeling = modeler.get('modeling');

        const shapes = elements.filter(e => !e.waypoints);

        // when committing a move of the whole diagram
        //
        // AttachSupport's `postExecuted('elements.move')` filters the moved
        // shapes for attachers moved without their host. This exercises the
        // guarded membership check (`isAttacher(shape) && !includes(...)`) --
        // included so we can detect trade-offs (e.g. an unconditional `Set`
        // allocation regressing the common, attacher-free case) early.
        const ms = time(() => modeling.moveElements(shapes, { x: 20, y: 20 }));

        record('move commit', size, stats, ms);
      });


      after(function() {
        modeler && modeler.destroy();
        container && container.remove();
      });

    });

  });


  after(printResults);

});


// helpers ///////////////////////////////////////////////

function time(fn) {
  const start = performance.now();
  const result = fn();

  if (result && typeof result.then === 'function') {
    return result.then(() => performance.now() - start);
  }

  return performance.now() - start;
}

function record(op, size, stats, ms) {
  results.push({ op, size: size.label, elements: stats.total, ms });
}

function createContainer() {
  const container = document.createElement('div');

  container.style.cssText = 'position:absolute;left:-10000px;width:1000px;height:700px';
  document.body.appendChild(container);

  return container;
}

function canvasEvent(modeler, position) {
  const canvas = modeler.get('canvas');
  const rect = canvas._container.getBoundingClientRect();

  return modeler.get('eventBus').createEvent({
    target: canvas._svg,
    x: position.x + rect.left,
    y: position.y + rect.top,
    clientX: position.x + rect.left,
    clientY: position.y + rect.top,
    button: 0
  });
}

function insertCSS(name, css) {
  const style = document.createElement('style');

  style.setAttribute('data-css', name);
  style.textContent = css;
  document.head.appendChild(style);
}

function printResults() {
  const rows = results.map(r =>
    r.op.padEnd(14) +
    r.size.padEnd(3) +
    String(r.elements).padStart(6) + ' elements' +
    r.ms.toFixed(1).padStart(10) + 'ms'
  );

  console.log(
    '\n\n===== huge-diagram benchmark =====\n' +
    rows.join('\n') +
    '\n==================================\n'
  );
}
