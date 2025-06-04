/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../../model/Types').Moddle} Moddle
 * @typedef {import('diagram-js/lib/features/clipboard/Clipboard').default} Clipboard
 */

import { isObject } from 'min-dash';

/**
 * Cross-window copy-paste
 *
 * @param {EventBus} eventBus
 * @param {Moddle} moddle
 * @param {Clipboard} clipboard
 */
export default function BpmnCrossWindowCopyPaste(eventBus, moddle, clipboard) {
  function createReviver(moddle) {
    var elCache = {};

    /**
     * The actual reviewer that creates model instances
     * for elements with a $type attribute.
     *
     * Elements with ids will be re-used, if already
     * created.
     *
     * @param  {String} key
     * @param  {Object} object
     *
     * @return {Object} actual element
     */
    return function(key, object) {
      if (typeof object === 'object' && typeof object.$type === 'string') {
        var objectId = object.id;

        if (objectId && elCache[objectId]) {
          return elCache[objectId];
        }

        var type = object.$type;
        var attrs = Object.assign({}, object);

        delete attrs.$type;

        var newEl = moddle.create(type, attrs);

        if (objectId) {
          elCache[objectId] = newEl;
        }

        return newEl;
      }

      return object;
    };
  }

  eventBus.on('copyPaste.elementsCopied', (event) => {
    const { tree } = event;
    navigator.clipboard.writeText(JSON.stringify(tree));
  });

  eventBus.on('canvas.focus.changed', (event) => {
    const { focused } = event;
    if (focused) {
      navigator.clipboard
        .readText()
        .then((text) => {
          try {
            const parsedCopy = JSON.parse(text, createReviver(moddle));

            if (isObject(parsedCopy)) {
              clipboard.set(parsedCopy);
            }
          } catch (error) {
            console.error('Failed to parse clipboard contents: ', error.message);
          }
        })
        .catch((err) => {
          console.error('Failed to read clipboard contents: ', err.message);
        });
    }
  });
}

BpmnCrossWindowCopyPaste.$inject = [ 'eventBus', 'moddle', 'clipboard' ];
