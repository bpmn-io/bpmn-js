import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

const noop = () => { };

export default class DarkModeRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer, canvas, elementRegistry) {
    super(eventBus, 3000);
    this.bpmnRenderer = bpmnRenderer;
    this.canvas = canvas;
    this.elementRegistry = elementRegistry;

    eventBus.on([ 'import.done', 'elements.changed', 'diagram.init', 'shape.added', 'connection.added' ], () => {
      if (this.isDarkMode()) {
        setTimeout(() => this.refreshAll(), 50);
      }
    });

    this.themeObserver = new MutationObserver(() => {
      this.refreshAll();
    });

    try {
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: [ 'data-theme' ]
      });
    } catch (e) {
      noop();
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => this.refreshAll();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
    }

    try {
      const params = new URLSearchParams(window.location.search);
      this.darkModeBehavior = params.get('bpmnDarkMode') || 'css';
    } catch (e) {
      this.darkModeBehavior = 'css';
      noop();
    }
  }

  canRender(element) {
    if (!this.bpmnRenderer || !element) return false;
    const type = element.type;
    return typeof this.bpmnRenderer._renderer === 'function' && !!this.bpmnRenderer._renderer(type);
  }

  drawShape(parentNode, element) {
    if (!this.bpmnRenderer || !this.canRender(element)) {
      return null;
    }

    try {
      const shape = this.bpmnRenderer.drawShape(parentNode, element);
      if (shape && this.isDarkMode()) {
        this.applyTheme(shape);
      }
      return shape;
    } catch (err) {
      return null;
    }
  }

  drawConnection(parentNode, element) {
    if (!this.bpmnRenderer || !this.canRender(element)) {
      return null;
    }

    try {
      const connection = this.bpmnRenderer.drawConnection(parentNode, element);
      if (connection && this.isDarkMode()) {
        this.applyTheme(connection);
      }
      return connection;
    } catch (err) {
      return null;
    }
  }

  applyTheme(node) {
    if (!node) return;

    const visualGroup = node.matches('.djs-visual') ? node : node.querySelector('.djs-visual');
    if (!visualGroup) return;

    const texts = visualGroup.querySelectorAll('text, tspan');
    texts.forEach(textEl => {
      textEl.style.setProperty('fill', '#ffffff', 'important');
    });

    const shapes = visualGroup.querySelectorAll('rect, ellipse, polygon, circle, path');

    shapes.forEach(el => {
      el.style.setProperty('stroke', '#ffffff', 'important');

      if (el.tagName === 'path' || el.tagName === 'circle') {
        el.style.setProperty('fill', 'none', 'important');
      } else {
        el.style.setProperty('fill', '#22252a', 'important');
      }
    });

    try {
      const root = this.canvas?.getRootElement();
      if (root?.ownerSVGElement) {
        const svg = root.ownerSVGElement;
        const defs = svg.querySelectorAll('defs *');
        defs.forEach(defEl => {
          defEl.style?.setProperty('fill', '#ffffff', 'important');
          defEl.style?.setProperty('stroke', '#ffffff', 'important');
        });
      }
    } catch (e) {
      noop();
    }
  }

  refreshAll() {
    if (!this.canvas) return;

    try {
      const rootElement = this.canvas.getRootElement();
      if (!rootElement) return;

      if (this.elementRegistry?.getAll) {
        this.elementRegistry.getAll().forEach(element => {
          const gfx = this.canvas.getGraphics(element);
          if (gfx) this.applyTheme(gfx);
        });
      } else if (rootElement.ownerSVGElement) {
        const svg = rootElement.ownerSVGElement;
        const gfxs = svg.querySelectorAll('[data-element-id]');
        gfxs.forEach(g => this.applyTheme(g));
      }
    } catch (e) {
      noop();
    }
  }

  isDarkMode() {
    const hasDarkAttribute = document.documentElement.getAttribute('data-theme') === 'dark' ||
                             document.documentElement.classList.contains('dark-mode') ||
                             document.body.classList.contains('dark');

    const hasSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return hasDarkAttribute || hasSystemDark;
  }
}

DarkModeRenderer.$inject = [ 'eventBus', 'bpmnRenderer', 'canvas', 'elementRegistry' ];