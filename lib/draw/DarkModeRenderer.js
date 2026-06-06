import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

// Função utilitária para evitar blocos vazios (corrige ESLint no-empty)
const noop = () => { };

export default class DarkModeRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer, canvas, elementRegistry) {
    super(eventBus, 2000);
    this.bpmnRenderer = bpmnRenderer;
    this.canvas = canvas;
    this.elementRegistry = elementRegistry;

    // Observador para garantir persistência das cores durante re-renderizações internas
    this.observer = new MutationObserver(() => {
      if (!this.isDarkMode()) {
        return;
      }

      const canvasContainer = this.canvas.getContainer();
      if (!canvasContainer) {
        return;
      }

      this.observer.disconnect();
      this.refreshAll();
      this.observer.observe(canvasContainer, {
        childList: true,
        subtree: true,
        attributes: true
      });
    });

    // Escuta mudança de tema do SO
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => this.refreshAll();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
    }

    eventBus.on('diagram.init', () => {
      this.refreshAll();

      // Ativa o MutationObserver após o canvas existir
      this.observer.observe(this.canvas.getContainer(), {
        childList: true,
        subtree: true,
        attributes: true
      });
    });

    // Limpeza automática ao destruir o diagrama
    eventBus.on('diagram.destroy', () => {
      if (this.observer) this.observer.disconnect();
    });

    // Comportamento configurável via query param
    try {
      const params = new URLSearchParams(window.location.search);
      this.darkModeBehavior = params.get('bpmnDarkMode') || 'css';
    } catch (e) {
      this.darkModeBehavior = 'css';
      noop();
    }

    try {
      console.log('[DarkModeRenderer] init, behavior=', this.darkModeBehavior);
    } catch (e) {
      noop();
    }
  }

  canRender(element) {
    return true;
  }

  drawShape(parentNode, element) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);
    this.applyTheme(shape);
    return shape;
  }

  drawConnection(parentNode, element) {
    const connection = this.bpmnRenderer.drawConnection(parentNode, element);
    this.applyTheme(connection);
    return connection;
  }

  applyTheme(node) {
    if (!this.isDarkMode()) return;

    const behavior = this.darkModeBehavior;
    const elements = node.querySelectorAll('rect, ellipse, polygon, circle, path');

    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const fill = style.fill;
      const stroke = style.stroke;

      const isCustomFill =
        fill !== 'rgb(255, 255, 255)' &&
        fill !== 'none' &&
        fill !== 'transparent';

      const isCustomStroke =
        stroke !== 'rgb(0, 0, 0)' &&
        stroke !== 'none' &&
        stroke !== 'transparent';

      if (behavior === 'swap') {
        if (isCustomFill && isCustomStroke) {
          el.setAttribute('fill', stroke);
          el.setAttribute('stroke', fill);
        }
      } else {
        if (!isCustomFill) {
          el.style.setProperty('fill', 'var(--bpmn-fill)', 'important');
        }

        if (!isCustomStroke) {
          el.style.setProperty('stroke', 'var(--bpmn-stroke)', 'important');
        }

        if (el.tagName === 'path' && !isCustomFill) {
          el.style.setProperty('fill', 'none', 'important');
        }
      }
    });

    try {
      const root = this.canvas.getRootElement();

      if (root?.ownerSVGElement) {
        const svg = root.ownerSVGElement;
        const defs = svg.querySelectorAll('defs *');
        const behavior = this.darkModeBehavior;

        defs.forEach(defEl => {
          if (behavior === 'swap') {
            const f = defEl.getAttribute('fill');
            const s = defEl.getAttribute('stroke');

            if (
              f && s &&
              !/^url\(|^var\(|^none|transparent/i.test(f) &&
              !/^url\(|^var\(|^none|transparent/i.test(s)
            ) {
              defEl.setAttribute('fill', s);
              defEl.setAttribute('stroke', f);
            }
          } else {
            defEl.style?.setProperty('fill', 'var(--bpmn-fill)', 'important');
            defEl.style?.setProperty('stroke', 'var(--bpmn-stroke)', 'important');
          }
        });
      }
    } catch (e) {
      console.error('Erro ao aplicar tema nos defs', e);
    }
  }

  refreshAll() {
    const rootElement = this.canvas.getRootElement();
    if (!rootElement) return;

    if (this.elementRegistry?.getAll) {
      this.elementRegistry.getAll().forEach(element => {
        const gfx = this.canvas.getGraphics(element);
        if (gfx) this.applyTheme(gfx);
      });
    } else {
      const root = this.canvas.getRootElement();

      if (root?.ownerSVGElement) {
        const svg = root.ownerSVGElement;
        const gfxs = svg.querySelectorAll('[data-element-id]');
        gfxs.forEach(g => this.applyTheme(g));
      }
    }
  }

  isDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}

DarkModeRenderer.$inject = [ 'eventBus', 'bpmnRenderer', 'canvas', 'elementRegistry' ];
