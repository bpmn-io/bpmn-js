import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory';

/**
 * A factory that creates graphical elements,
 * but does so in a headless compatible way.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 */
export default class HeadlessGraphicsFactory extends GraphicsFactory {

  constructor(eventBus, elementRegistry) {
    super(eventBus, elementRegistry);
  }

  update(type, element, gfx) {

    // do not visually update
    return;
  }

}
