/*!
 * bpmn-js - bpmn-viewer v18.16.1
 *
 * Copyright (c) 2014-present, camunda Services GmbH
 *
 * Released under the bpmn.io license
 * http://bpmn.io/license
 *
 * Source Code: https://github.com/bpmn-io/bpmn-js
 *
 * Date: 2026-05-28
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.BpmnJS = factory());
})(this, (function () { 'use strict';

  function e(e,t){t&&(e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:false,writable:true,configurable:true}}));}

  /**
   * Flatten array, one level deep.
   *
   * @template T
   *
   * @param {T[][] | T[] | null} [arr]
   *
   * @return {T[]}
   */

  const nativeToString = Object.prototype.toString;
  const nativeHasOwnProperty = Object.prototype.hasOwnProperty;

  function isUndefined$1(obj) {
    return obj === undefined;
  }

  function isDefined(obj) {
    return obj !== undefined;
  }

  function isNil(obj) {
    return obj == null;
  }

  function isArray$1(obj) {
    return nativeToString.call(obj) === '[object Array]';
  }

  function isObject(obj) {
    return nativeToString.call(obj) === '[object Object]';
  }

  function isNumber(obj) {
    return nativeToString.call(obj) === '[object Number]';
  }

  /**
   * @param {any} obj
   *
   * @return {boolean}
   */
  function isFunction(obj) {
    const tag = nativeToString.call(obj);

    return (
      tag === '[object Function]' ||
      tag === '[object AsyncFunction]' ||
      tag === '[object GeneratorFunction]' ||
      tag === '[object AsyncGeneratorFunction]' ||
      tag === '[object Proxy]'
    );
  }

  function isString(obj) {
    return nativeToString.call(obj) === '[object String]';
  }

  /**
   * Return true, if target owns a property with the given key.
   *
   * @param {Object} target
   * @param {String} key
   *
   * @return {Boolean}
   */
  function has(target, key) {
    return !isNil(target) && nativeHasOwnProperty.call(target, key);
  }

  /**
   * @template T
   * @typedef { (
   *   ((e: T) => boolean) |
   *   ((e: T, idx: number) => boolean) |
   *   ((e: T, key: string) => boolean) |
   *   string |
   *   number
   * ) } Matcher
   */

  /**
   * @template T
   * @template U
   *
   * @typedef { (
   *   ((e: T) => U) | string | number
   * ) } Extractor
   */


  /**
   * @template T
   * @typedef { (val: T, key: any) => boolean } MatchFn
   */

  /**
   * @template T
   * @typedef { T[] } ArrayCollection
   */

  /**
   * @template T
   * @typedef { { [key: string]: T } } StringKeyValueCollection
   */

  /**
   * @template T
   * @typedef { { [key: number]: T } } NumberKeyValueCollection
   */

  /**
   * @template T
   * @typedef { StringKeyValueCollection<T> | NumberKeyValueCollection<T> } KeyValueCollection
   */

  /**
   * @template T
   * @typedef { KeyValueCollection<T> | ArrayCollection<T> } Collection
   */

  /**
   * Find element in collection.
   *
   * @template T
   * @param {Collection<T>} collection
   * @param {Matcher<T>} matcher
   *
   * @return {Object}
   */
  function find(collection, matcher) {

    const matchFn = toMatcher(matcher);

    let match;

    forEach(collection, function(val, key) {
      if (matchFn(val, key)) {
        match = val;

        return false;
      }
    });

    return match;

  }


  /**
   * Find element index in collection.
   *
   * @template T
   * @param {Collection<T>} collection
   * @param {Matcher<T>} matcher
   *
   * @return {number | string | undefined}
   */
  function findIndex(collection, matcher) {

    const matchFn = toMatcher(matcher);

    let idx = isArray$1(collection) ? -1 : undefined;

    forEach(collection, function(val, key) {
      if (matchFn(val, key)) {
        idx = key;

        return false;
      }
    });

    return idx;
  }


  /**
   * Filter elements in collection.
   *
   * @template T
   * @param {Collection<T>} collection
   * @param {Matcher<T>} matcher
   *
   * @return {T[]} result
   */
  function filter(collection, matcher) {

    const matchFn = toMatcher(matcher);

    let result = [];

    forEach(collection, function(val, key) {
      if (matchFn(val, key)) {
        result.push(val);
      }
    });

    return result;
  }


  /**
   * Iterate over collection; returning something
   * (non-undefined) will stop iteration.
   *
   * @template T
   * @param {Collection<T>} collection
   * @param { ((item: T, idx: number) => (boolean|void)) | ((item: T, key: string) => (boolean|void)) } iterator
   *
   * @return {T} return result that stopped the iteration
   */
  function forEach(collection, iterator) {

    let val,
        result;

    if (isUndefined$1(collection)) {
      return;
    }

    const convertKey = isArray$1(collection) ? toNum : identity;

    for (let key in collection) {

      if (has(collection, key)) {
        val = collection[key];

        result = iterator(val, convertKey(key));

        if (result === false) {
          return val;
        }
      }
    }
  }


  /**
   * Reduce collection, returning a single result.
   *
   * @template T
   * @template V
   *
   * @param {Collection<T>} collection
   * @param {(result: V, entry: T, index: any) => V} iterator
   * @param {V} result
   *
   * @return {V} result returned from last iterator
   */
  function reduce(collection, iterator, result) {

    forEach(collection, function(value, idx) {
      result = iterator(result, value, idx);
    });

    return result;
  }


  /**
   * Return true if every element in the collection
   * matches the criteria.
   *
   * @param  {Object|Array} collection
   * @param  {Function} matcher
   *
   * @return {Boolean}
   */
  function every(collection, matcher) {

    return !!reduce(collection, function(matches, val, key) {
      return matches && matcher(val, key);
    }, true);
  }


  /**
   * Return true if some elements in the collection
   * match the criteria.
   *
   * @param  {Object|Array} collection
   * @param  {Function} matcher
   *
   * @return {Boolean}
   */
  function some(collection, matcher) {

    return !!find(collection, matcher);
  }


  /**
   * Transform a collection into another collection
   * by piping each member through the given fn.
   *
   * @param  {Object|Array}   collection
   * @param  {Function} fn
   *
   * @return {Array} transformed collection
   */
  function map(collection, fn) {

    let result = [];

    forEach(collection, function(val, key) {
      result.push(fn(val, key));
    });

    return result;
  }


  /**
   * Create an object pattern matcher.
   *
   * @example
   *
   * ```javascript
   * const matcher = matchPattern({ id: 1 });
   *
   * let element = find(elements, matcher);
   * ```
   *
   * @template T
   *
   * @param {T} pattern
   *
   * @return { (el: any) =>  boolean } matcherFn
   */
  function matchPattern(pattern) {

    return function(el) {

      return every(pattern, function(val, key) {
        return el[key] === val;
      });

    };
  }


  /**
   * @template T
   * @param {Matcher<T>} matcher
   *
   * @return {MatchFn<T>}
   */
  function toMatcher(matcher) {
    return isFunction(matcher) ? matcher : (e) => {
      return e === matcher;
    };
  }


  function identity(arg) {
    return arg;
  }

  function toNum(arg) {
    return Number(arg);
  }

  /**
   * @typedef { {
   *   (...args: any[]): any;
   *   flush: () => void;
   *   cancel: () => void;
   * } } DebouncedFunction
   */

  /**
   * Debounce fn, calling it only once if the given time
   * elapsed between calls.
   *
   * Lodash-style the function exposes methods to `#clear`
   * and `#flush` to control internal behavior.
   *
   * @param  {Function} fn
   * @param  {Number} timeout
   *
   * @return {DebouncedFunction} debounced function
   */
  function debounce(fn, timeout) {

    let timer;

    let lastArgs;
    let lastThis;

    let lastNow;

    function fire(force) {

      let now = Date.now();

      let scheduledDiff = force ? 0 : (lastNow + timeout) - now;

      if (scheduledDiff > 0) {
        return schedule(scheduledDiff);
      }

      fn.apply(lastThis, lastArgs);

      clear();
    }

    function schedule(timeout) {
      timer = setTimeout(fire, timeout);
    }

    function clear() {
      if (timer) {
        clearTimeout(timer);
      }

      timer = lastNow = lastArgs = lastThis = undefined;
    }

    function flush() {
      if (timer) {
        fire(true);
      }

      clear();
    }

    /**
     * @type { DebouncedFunction }
     */
    function callback(...args) {
      lastNow = Date.now();

      lastArgs = args;
      lastThis = this;

      // ensure an execution is scheduled
      if (!timer) {
        schedule(timeout);
      }
    }

    callback.flush = flush;
    callback.cancel = clear;

    return callback;
  }

  /**
   * Bind function against target <this>.
   *
   * @param  {Function} fn
   * @param  {Object}   target
   *
   * @return {Function} bound function
   */
  function bind$1(fn, target) {
    return fn.bind(target);
  }

  /**
   * Convenience wrapper for `Object.assign`.
   *
   * @param {Object} target
   * @param {...Object} others
   *
   * @return {Object} the target
   */
  function assign$1(target, ...others) {
    return Object.assign(target, ...others);
  }

  /**
   * Sets a nested property of a given object to the specified value.
   *
   * This mutates the object and returns it.
   *
   * @template T
   *
   * @param {T} target The target of the set operation.
   * @param {(string|number)[]} path The path to the nested value.
   * @param {any} value The value to set.
   *
   * @return {T}
   */
  function set(target, path, value) {

    let currentTarget = target;

    forEach(path, function(key, idx) {

      if (typeof key !== 'number' && typeof key !== 'string') {
        throw new Error('illegal key type: ' + typeof key + '. Key should be of type number or string.');
      }

      if (key === 'constructor') {
        throw new Error('illegal key: constructor');
      }

      if (key === '__proto__') {
        throw new Error('illegal key: __proto__');
      }

      let nextKey = path[idx + 1];
      let nextTarget = currentTarget[key];

      if (isDefined(nextKey) && isNil(nextTarget)) {
        nextTarget = currentTarget[key] = isNaN(+nextKey) ? {} : [];
      }

      if (isUndefined$1(nextKey)) {
        if (isUndefined$1(value)) {
          delete currentTarget[key];
        } else {
          currentTarget[key] = value;
        }
      } else {
        currentTarget = nextTarget;
      }
    });

    return target;
  }

  /**
   * Pick properties from the given target.
   *
   * @template T
   * @template {any[]} V
   *
   * @param {T} target
   * @param {V} properties
   *
   * @return Pick<T, V>
   */
  function pick(target, properties) {

    let result = {};

    let obj = Object(target);

    forEach(properties, function(prop) {

      if (prop in obj) {
        result[prop] = target[prop];
      }
    });

    return result;
  }

  /**
   * Pick all target properties, excluding the given ones.
   *
   * @template T
   * @template {any[]} V
   *
   * @param {T} target
   * @param {V} properties
   *
   * @return {Omit<T, V>} target
   */
  function omit(target, properties) {

    let result = {};

    let obj = Object(target);

    forEach(obj, function(prop, key) {

      if (properties.indexOf(key) === -1) {
        result[key] = prop;
      }
    });

    return result;
  }

  var DEFAULT_RENDER_PRIORITY$1 = 1000;

  /**
   * @typedef {import('../core/Types').ElementLike} Element
   * @typedef {import('../core/Types').ConnectionLike} Connection
   * @typedef {import('../core/Types').ShapeLike} Shape
   *
   * @typedef {import('../core/EventBus').default} EventBus
   */

  /**
   * The base implementation of shape and connection renderers.
   *
   * @param {EventBus} eventBus
   * @param {number} [renderPriority=1000]
   */
  function BaseRenderer(eventBus, renderPriority) {
    var self = this;

    renderPriority = renderPriority || DEFAULT_RENDER_PRIORITY$1;

    eventBus.on([ 'render.shape', 'render.connection' ], renderPriority, function(evt, context) {
      var type = evt.type,
          element = context.element,
          visuals = context.gfx,
          attrs = context.attrs;

      if (self.canRender(element)) {
        if (type === 'render.shape') {
          return self.drawShape(visuals, element, attrs);
        } else {
          return self.drawConnection(visuals, element, attrs);
        }
      }
    });

    eventBus.on([ 'render.getShapePath', 'render.getConnectionPath' ], renderPriority, function(evt, element) {
      if (self.canRender(element)) {
        if (evt.type === 'render.getShapePath') {
          return self.getShapePath(element);
        } else {
          return self.getConnectionPath(element);
        }
      }
    });
  }

  /**
   * Checks whether an element can be rendered.
   *
   * @param {Element} element The element to be rendered.
   *
   * @return {boolean} Whether the element can be rendered.
   */
  BaseRenderer.prototype.canRender = function(element) {};

  /**
   * Draws a shape.
   *
   * @param {SVGElement} visuals The SVG element to draw the shape into.
   * @param {Shape} shape The shape to be drawn.
   *
   * @return {SVGElement} The SVG element of the shape drawn.
   */
  BaseRenderer.prototype.drawShape = function(visuals, shape) {};

  /**
   * Draws a connection.
   *
   * @param {SVGElement} visuals The SVG element to draw the connection into.
   * @param {Connection} connection The connection to be drawn.
   *
   * @return {SVGElement} The SVG element of the connection drawn.
   */
  BaseRenderer.prototype.drawConnection = function(visuals, connection) {};

  /**
   * Gets the SVG path of the graphical representation of a shape.
   *
   * @param {Shape} shape The shape.
   *
   * @return {string} The SVG path of the shape.
   */
  BaseRenderer.prototype.getShapePath = function(shape) {};

  /**
   * Gets the SVG path of the graphical representation of a connection.
   *
   * @param {Connection} connection The connection.
   *
   * @return {string} The SVG path of the connection.
   */
  BaseRenderer.prototype.getConnectionPath = function(connection) {};

  /**
   * @typedef { import('../model/Types').Element } Element
   * @typedef { import('../model/Types').ModdleElement } ModdleElement
   */

  /**
   * Is an element of the given BPMN type?
   *
   * @param  {Element|ModdleElement} element
   * @param  {string} type
   *
   * @return {boolean}
   */
  function is$1(element, type) {
    var bo = getBusinessObject(element);

    return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
  }


  /**
   * Return true if element has any of the given types.
   *
   * @param {Element|ModdleElement} element
   * @param {string[]} types
   *
   * @return {boolean}
   */
  function isAny(element, types) {
    return some(types, function(t) {
      return is$1(element, t);
    });
  }

  /**
   * Return the business object for a given element.
   *
   * @param {Element|ModdleElement} element
   *
   * @return {ModdleElement}
   */
  function getBusinessObject(element) {
    return (element && element.businessObject) || element;
  }

  /**
   * Return the di object for a given element.
   *
   * @param {Element} element
   *
   * @return {ModdleElement}
   */
  function getDi(element) {
    return element && element.di;
  }

  /**
   * @typedef {import('../model/Types').Element} Element
   * @typedef {import('../model/Types').ModdleElement} ModdleElement
   */

  /**
   * @param {Element} element
   * @param {ModdleElement} [di]
   *
   * @return {boolean}
   */
  function isExpanded(element, di) {

    if (is$1(element, 'bpmn:CallActivity')) {
      return false;
    }

    if (is$1(element, 'bpmn:SubProcess')) {
      di = di || getDi(element);

      if (di && is$1(di, 'bpmndi:BPMNPlane')) {
        return true;
      }

      return di && !!di.isExpanded;
    }

    if (is$1(element, 'bpmn:Participant')) {
      return !!getBusinessObject(element).processRef;
    }

    return true;
  }

  /**
   * @param {Element} element
   *
   * @return {boolean}
   */
  function isHorizontal(element) {

    if (!is$1(element, 'bpmn:Participant') && !is$1(element, 'bpmn:Lane')) {
      return undefined;
    }

    var isHorizontal = getDi(element).isHorizontal;

    if (isHorizontal === undefined) {
      return true;
    }

    return isHorizontal;
  }

  /**
   * @param {Element} element
   *
   * @return {boolean}
   */
  function isEventSubProcess(element) {
    return element && !!getBusinessObject(element).triggeredByEvent;
  }

  /**
   * Checks whether a value is an instance of Connection.
   *
   * @param {any} value
   *
   * @return {boolean}
   */
  function isConnection(value) {
    return isObject(value) && has(value, 'waypoints');
  }

  /**
   * @typedef {import('diagram-js/lib/util/Types').Point} Point
   * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
   *
   * @typedef {import('../model/Types').Element} Element
   * @typedef {import('../model/Types').ModdleElement} ModdleElement
   */

  var DEFAULT_LABEL_SIZE$1 = {
    width: 90,
    height: 20
  };

  var FLOW_LABEL_INDENT = 15;


  /**
   * Return true if the given semantic has an external label.
   *
   * @param {Element} semantic
   *
   * @return {boolean}
   */
  function isLabelExternal(semantic) {
    return is$1(semantic, 'bpmn:Event') ||
           is$1(semantic, 'bpmn:Gateway') ||
           is$1(semantic, 'bpmn:DataStoreReference') ||
           is$1(semantic, 'bpmn:DataObjectReference') ||
           is$1(semantic, 'bpmn:DataInput') ||
           is$1(semantic, 'bpmn:DataOutput') ||
           is$1(semantic, 'bpmn:SequenceFlow') ||
           is$1(semantic, 'bpmn:MessageFlow') ||
           is$1(semantic, 'bpmn:Group');
  }

  /**
   * Get the position of a sequence flow label.
   *
   * @param  {Point[]} waypoints
   *
   * @return {Point}
   */
  function getFlowLabelPosition(waypoints) {

    // get the waypoints mid
    var mid = waypoints.length / 2 - 1;

    var first = waypoints[Math.floor(mid)];
    var second = waypoints[Math.ceil(mid + 0.01)];

    // get position
    var position = getWaypointsMid(waypoints);

    // calculate angle
    var angle = Math.atan((second.y - first.y) / (second.x - first.x));

    var x = position.x,
        y = position.y;

    if (Math.abs(angle) < Math.PI / 2) {
      y -= FLOW_LABEL_INDENT;
    } else {
      x += FLOW_LABEL_INDENT;
    }

    return { x: x, y: y };
  }


  /**
   * Get the middle of a number of waypoints.
   *
   * @param  {Point[]} waypoints
   *
   * @return {Point}
   */
  function getWaypointsMid(waypoints) {

    var mid = waypoints.length / 2 - 1;

    var first = waypoints[Math.floor(mid)];
    var second = waypoints[Math.ceil(mid + 0.01)];

    return {
      x: first.x + (second.x - first.x) / 2,
      y: first.y + (second.y - first.y) / 2
    };
  }

  /**
   * Get the middle of the external label of an element.
   *
   * @param {Element} element
   *
   * @return {Point}
   */
  function getExternalLabelMid(element) {

    if (element.waypoints) {
      return getFlowLabelPosition(element.waypoints);
    } else if (is$1(element, 'bpmn:Group')) {
      return {
        x: element.x + element.width / 2,
        y: element.y + DEFAULT_LABEL_SIZE$1.height / 2
      };
    } else {
      return {
        x: element.x + element.width / 2,
        y: element.y + element.height + DEFAULT_LABEL_SIZE$1.height / 2
      };
    }
  }


  /**
   * Return the bounds of an elements label, parsed from the elements DI or
   * generated from its bounds.
   *
   * @param {ModdleElement} di
   * @param {Element} element
   *
   * @return {Rect}
   */
  function getExternalLabelBounds(di, element) {

    var mid,
        size,
        bounds,
        label = di.label;

    if (label && label.bounds) {
      bounds = label.bounds;

      size = {
        width: Math.max(DEFAULT_LABEL_SIZE$1.width, bounds.width),
        height: bounds.height
      };

      mid = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
      };
    } else {

      mid = getExternalLabelMid(element);

      size = DEFAULT_LABEL_SIZE$1;
    }

    return assign$1({
      x: mid.x - size.width / 2,
      y: mid.y - size.height / 2
    }, size);
  }

  /**
   * @param {ModdleElement} semantic
   *
   * @returns {string}
   */
  function getLabelAttr(semantic) {
    if (
      is$1(semantic, 'bpmn:FlowElement') ||
      is$1(semantic, 'bpmn:Participant') ||
      is$1(semantic, 'bpmn:Lane') ||
      is$1(semantic, 'bpmn:SequenceFlow') ||
      is$1(semantic, 'bpmn:MessageFlow') ||
      is$1(semantic, 'bpmn:DataInput') ||
      is$1(semantic, 'bpmn:DataOutput')
    ) {
      return 'name';
    }

    if (is$1(semantic, 'bpmn:TextAnnotation')) {
      return 'text';
    }

    if (is$1(semantic, 'bpmn:Group')) {
      return 'categoryValueRef';
    }
  }

  /**
   * @param {ModdleElement} semantic
   *
   * @returns {string}
   */
  function getCategoryValue(semantic) {
    var categoryValueRef = semantic['categoryValueRef'];

    if (!categoryValueRef) {
      return '';
    }


    return categoryValueRef.value || '';
  }

  /**
   * @param {Element} element
   *
   * @return {string}
   */
  function getLabel(element) {
    var semantic = element.businessObject,
        attr = getLabelAttr(semantic);

    if (attr) {

      if (attr === 'categoryValueRef') {

        return getCategoryValue(semantic);
      }

      return semantic[attr] || '';
    }
  }

  function ensureImported(element, target) {

    if (element.ownerDocument !== target.ownerDocument) {
      try {

        // may fail on webkit
        return target.ownerDocument.importNode(element, true);
      } catch (e) {

        // ignore
      }
    }

    return element;
  }

  /**
   * appendTo utility
   */


  /**
   * Append a node to a target element and return the appended node.
   *
   * @param  {SVGElement} element
   * @param  {SVGElement} target
   *
   * @return {SVGElement} the appended node
   */
  function appendTo(element, target) {
    return target.appendChild(ensureImported(element, target));
  }

  /**
   * append utility
   */


  /**
   * Append a node to an element
   *
   * @param  {SVGElement} element
   * @param  {SVGElement} node
   *
   * @return {SVGElement} the element
   */
  function append(target, node) {
    appendTo(node, target);
    return target;
  }

  /**
   * attribute accessor utility
   */

  var LENGTH_ATTR = 2;

  var CSS_PROPERTIES = {
    'alignment-baseline': 1,
    'baseline-shift': 1,
    'clip': 1,
    'clip-path': 1,
    'clip-rule': 1,
    'color': 1,
    'color-interpolation': 1,
    'color-interpolation-filters': 1,
    'color-profile': 1,
    'color-rendering': 1,
    'cursor': 1,
    'direction': 1,
    'display': 1,
    'dominant-baseline': 1,
    'enable-background': 1,
    'fill': 1,
    'fill-opacity': 1,
    'fill-rule': 1,
    'filter': 1,
    'flood-color': 1,
    'flood-opacity': 1,
    'font': 1,
    'font-family': 1,
    'font-size': LENGTH_ATTR,
    'font-size-adjust': 1,
    'font-stretch': 1,
    'font-style': 1,
    'font-variant': 1,
    'font-weight': 1,
    'glyph-orientation-horizontal': 1,
    'glyph-orientation-vertical': 1,
    'image-rendering': 1,
    'kerning': 1,
    'letter-spacing': 1,
    'lighting-color': 1,
    'marker': 1,
    'marker-end': 1,
    'marker-mid': 1,
    'marker-start': 1,
    'mask': 1,
    'opacity': 1,
    'overflow': 1,
    'pointer-events': 1,
    'shape-rendering': 1,
    'stop-color': 1,
    'stop-opacity': 1,
    'stroke': 1,
    'stroke-dasharray': 1,
    'stroke-dashoffset': 1,
    'stroke-linecap': 1,
    'stroke-linejoin': 1,
    'stroke-miterlimit': 1,
    'stroke-opacity': 1,
    'stroke-width': LENGTH_ATTR,
    'text-anchor': 1,
    'text-decoration': 1,
    'text-rendering': 1,
    'unicode-bidi': 1,
    'visibility': 1,
    'word-spacing': 1,
    'writing-mode': 1
  };


  function getAttribute(node, name) {
    if (CSS_PROPERTIES[name]) {
      return node.style[name];
    } else {
      return node.getAttributeNS(null, name);
    }
  }

  function setAttribute(node, name, value) {
    var hyphenated = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

    var type = CSS_PROPERTIES[hyphenated];

    if (type) {

      // append pixel unit, unless present
      if (type === LENGTH_ATTR && typeof value === 'number') {
        value = String(value) + 'px';
      }

      node.style[hyphenated] = value;
    } else {
      node.setAttributeNS(null, name, value);
    }
  }

  function setAttributes(node, attrs) {

    var names = Object.keys(attrs), i, name;

    for (i = 0, name; (name = names[i]); i++) {
      setAttribute(node, name, attrs[name]);
    }
  }

  /**
   * Gets or sets raw attributes on a node.
   *
   * @param  {SVGElement} node
   * @param  {Object} [attrs]
   * @param  {String} [name]
   * @param  {String} [value]
   *
   * @return {String}
   */
  function attr$1(node, name, value) {
    if (typeof name === 'string') {
      if (value !== undefined) {
        setAttribute(node, name, value);
      } else {
        return getAttribute(node, name);
      }
    } else {
      setAttributes(node, name);
    }

    return node;
  }

  /**
   * Taken from https://github.com/component/classes
   *
   * Without the component bits.
   */

  /**
   * toString reference.
   */

  const toString$1 = Object.prototype.toString;

  /**
    * Wrap `el` in a `ClassList`.
    *
    * @param {Element} el
    * @return {ClassList}
    * @api public
    */

  function classes$1(el) {
    return new ClassList$1(el);
  }

  function ClassList$1(el) {
    if (!el || !el.nodeType) {
      throw new Error('A DOM element reference is required');
    }
    this.el = el;
    this.list = el.classList;
  }

  /**
    * Add class `name` if not already present.
    *
    * @param {String} name
    * @return {ClassList}
    * @api public
    */

  ClassList$1.prototype.add = function(name) {
    this.list.add(name);
    return this;
  };

  /**
    * Remove class `name` when present, or
    * pass a regular expression to remove
    * any which match.
    *
    * @param {String|RegExp} name
    * @return {ClassList}
    * @api public
    */

  ClassList$1.prototype.remove = function(name) {
    if ('[object RegExp]' == toString$1.call(name)) {
      return this.removeMatching(name);
    }

    this.list.remove(name);
    return this;
  };

  /**
    * Remove all classes matching `re`.
    *
    * @param {RegExp} re
    * @return {ClassList}
    * @api private
    */

  ClassList$1.prototype.removeMatching = function(re) {
    const arr = this.array();
    for (let i = 0; i < arr.length; i++) {
      if (re.test(arr[i])) {
        this.remove(arr[i]);
      }
    }
    return this;
  };

  /**
    * Toggle class `name`, can force state via `force`.
    *
    * For browsers that support classList, but do not support `force` yet,
    * the mistake will be detected and corrected.
    *
    * @param {String} name
    * @param {Boolean} force
    * @return {ClassList}
    * @api public
    */

  ClassList$1.prototype.toggle = function(name, force) {
    if ('undefined' !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  };

  /**
    * Return an array of classes.
    *
    * @return {Array}
    * @api public
    */

  ClassList$1.prototype.array = function() {
    return Array.from(this.list);
  };

  /**
    * Check if class `name` is present.
    *
    * @param {String} name
    * @return {ClassList}
    * @api public
    */

  ClassList$1.prototype.has =
   ClassList$1.prototype.contains = function(name) {
     return this.list.contains(name);
   };

  var ns = {
    svg: 'http://www.w3.org/2000/svg'
  };

  /**
   * DOM parsing utility
   */


  var SVG_START = '<svg xmlns="' + ns.svg + '"';

  function parse(svg) {

    var unwrap = false;

    // ensure we import a valid svg document
    if (svg.substring(0, 4) === '<svg') {
      if (svg.indexOf(ns.svg) === -1) {
        svg = SVG_START + svg.substring(4);
      }
    } else {

      // namespace svg
      svg = SVG_START + '>' + svg + '</svg>';
      unwrap = true;
    }

    var parsed = parseDocument(svg);

    if (!unwrap) {
      return parsed;
    }

    var fragment = document.createDocumentFragment();

    var parent = parsed.firstChild;

    while (parent.firstChild) {
      fragment.appendChild(parent.firstChild);
    }

    return fragment;
  }

  function parseDocument(svg) {

    var parser;

    // parse
    parser = new DOMParser();
    parser.async = false;

    return parser.parseFromString(svg, 'text/xml');
  }

  /**
   * Create utility for SVG elements
   */



  /**
   * Create a specific type from name or SVG markup.
   *
   * @param {String} name the name or markup of the element
   * @param {Object} [attrs] attributes to set on the element
   *
   * @returns {SVGElement}
   */
  function create$1(name, attrs) {
    var element;

    name = name.trim();

    if (name.charAt(0) === '<') {
      element = parse(name).firstChild;
      element = document.importNode(element, true);
    } else {
      element = document.createElementNS(ns.svg, name);
    }

    if (attrs) {
      attr$1(element, attrs);
    }

    return element;
  }

  /**
   * Geometry helpers
   */


  // fake node used to instantiate svg geometry elements
  var node = null;

  function getNode() {
    if (node === null) {
      node = create$1('svg');
    }

    return node;
  }

  function extend$1(object, props) {
    var i, k, keys = Object.keys(props);

    for (i = 0; (k = keys[i]); i++) {
      object[k] = props[k];
    }

    return object;
  }

  /**
   * Create matrix via args.
   *
   * @example
   *
   * createMatrix({ a: 1, b: 1 });
   * createMatrix();
   * createMatrix(1, 2, 0, 0, 30, 20);
   *
   * @return {SVGMatrix}
   */
  function createMatrix(a, b, c, d, e, f) {
    var matrix = getNode().createSVGMatrix();

    switch (arguments.length) {
    case 0:
      return matrix;
    case 1:
      return extend$1(matrix, a);
    case 6:
      return extend$1(matrix, {
        a: a,
        b: b,
        c: c,
        d: d,
        e: e,
        f: f
      });
    }
  }

  function createTransform(matrix) {
    {
      return getNode().createSVGTransform();
    }
  }

  /**
   * Serialization util
   */

  var TEXT_ENTITIES = /([&<>]{1})/g;
  var ATTR_ENTITIES = /([&<>\n\r"]{1})/g;

  var ENTITY_REPLACEMENT = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '\''
  };

  function escape$1(str, pattern) {

    function replaceFn(match, entity) {
      return ENTITY_REPLACEMENT[entity] || entity;
    }

    return str.replace(pattern, replaceFn);
  }

  function serialize(node, output) {

    var i, len, attrMap, attrNode, childNodes;

    switch (node.nodeType) {

    // TEXT
    case 3:

      // replace special XML characters
      output.push(escape$1(node.textContent, TEXT_ENTITIES));
      break;

    // ELEMENT
    case 1:
      output.push('<', node.tagName);

      if (node.hasAttributes()) {
        attrMap = node.attributes;
        for (i = 0, len = attrMap.length; i < len; ++i) {
          attrNode = attrMap.item(i);
          output.push(' ', attrNode.name, '="', escape$1(attrNode.value, ATTR_ENTITIES), '"');
        }
      }

      if (node.hasChildNodes()) {
        output.push('>');
        childNodes = node.childNodes;
        for (i = 0, len = childNodes.length; i < len; ++i) {
          serialize(childNodes.item(i), output);
        }
        output.push('</', node.tagName, '>');
      } else {
        output.push('/>');
      }
      break;

    // COMMENT
    case 8:
      output.push('<!--', escape$1(node.nodeValue, TEXT_ENTITIES), '-->');
      break;

    // CDATA
    case 4:
      output.push('<![CDATA[', node.nodeValue, ']]>');
      break;

    default:
      throw new Error('unable to handle node ' + node.nodeType);
    }

    return output;
  }

  function get(element) {
    var child = element.firstChild,
        output = [];

    while (child) {
      serialize(child, output);
      child = child.nextSibling;
    }

    return output.join('');
  }

  function innerSVG(element, svg) {

    {
      return get(element);
    }
  }

  function remove$2(element) {
    var parent = element.parentNode;

    if (parent) {
      parent.removeChild(element);
    }

    return element;
  }

  /**
   * transform accessor utility
   */

  function wrapMatrix(transformList, transform) {
    if (transform instanceof SVGMatrix) {
      return transformList.createSVGTransformFromMatrix(transform);
    }

    return transform;
  }


  function setTransforms(transformList, transforms) {
    var i, t;

    transformList.clear();

    for (i = 0; (t = transforms[i]); i++) {
      transformList.appendItem(wrapMatrix(transformList, t));
    }
  }

  /**
   * Get or set the transforms on the given node.
   *
   * @param {SVGElement} node
   * @param  {SVGTransform|SVGMatrix|Array<SVGTransform|SVGMatrix>} [transforms]
   *
   * @return {SVGTransform} the consolidated transform
   */
  function transform$1(node, transforms) {
    var transformList = node.transform.baseVal;

    if (transforms) {

      if (!Array.isArray(transforms)) {
        transforms = [ transforms ];
      }

      setTransforms(transformList, transforms);
    }

    return transformList.consolidate();
  }

  /**
   * @typedef {(string|number)[]} Component
   *
   * @typedef {import('../util/Types').Point} Point
   */

  /**
   * @param {Component[] | Component[][]} elements
   *
   * @return {string}
   */
  function componentsToPath(elements) {
    return elements.flat().join(',').replace(/,?([A-Za-z]),?/g, '$1');
  }

  /**
   * @param {Point} point
   *
   * @return {Component[]}
   */
  function move(point) {
    return [ 'M', point.x, point.y ];
  }

  /**
   * @param {Point} point
   *
   * @return {Component[]}
   */
  function lineTo(point) {
    return [ 'L', point.x, point.y ];
  }

  /**
   * @param {Point} p1
   * @param {Point} p2
   * @param {Point} p3
   *
   * @return {Component[]}
   */
  function curveTo(p1, p2, p3) {
    return [ 'C', p1.x, p1.y, p2.x, p2.y, p3.x, p3.y ];
  }

  /**
   * @param {Point[]} waypoints
   * @param {number} [cornerRadius]
   * @return {Component[][]}
   */
  function drawPath(waypoints, cornerRadius) {
    const pointCount = waypoints.length;

    const path = [ move(waypoints[0]) ];

    for (let i = 1; i < pointCount; i++) {

      const pointBefore = waypoints[i - 1];
      const point = waypoints[i];
      const pointAfter = waypoints[i + 1];

      if (!pointAfter || !cornerRadius) {
        path.push(lineTo(point));

        continue;
      }

      const effectiveRadius = Math.min(
        cornerRadius,
        vectorLength(point.x - pointBefore.x, point.y - pointBefore.y),
        vectorLength(pointAfter.x - point.x, pointAfter.y - point.y)
      );

      if (!effectiveRadius) {
        path.push(lineTo(point));

        continue;
      }

      const beforePoint = getPointAtLength(point, pointBefore, effectiveRadius);
      const beforePoint2 = getPointAtLength(point, pointBefore, effectiveRadius * .5);

      const afterPoint = getPointAtLength(point, pointAfter, effectiveRadius);
      const afterPoint2 = getPointAtLength(point, pointAfter, effectiveRadius * .5);

      path.push(lineTo(beforePoint));
      path.push(curveTo(beforePoint2, afterPoint2, afterPoint));
    }

    return path;
  }

  function getPointAtLength(start, end, length) {

    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;

    const totalLength = vectorLength(deltaX, deltaY);

    const percent = length / totalLength;

    return {
      x: start.x + deltaX * percent,
      y: start.y + deltaY * percent
    };
  }

  function vectorLength(x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }

  /**
   * @param {Point[]} points
   * @param {number|Object} [attrs]
   * @param {number} [radius]
   *
   * @return {SVGElement}
   */
  function createLine(points, attrs, radius) {

    if (isNumber(attrs)) {
      radius = attrs;
      attrs = null;
    }

    if (!attrs) {
      attrs = {};
    }

    const line = create$1('path', attrs);

    if (isNumber(radius)) {
      line.dataset.cornerRadius = String(radius);
    }

    return updateLine(line, points);
  }

  /**
   * @param {SVGElement} gfx
   * @param {Point[]} points
   *
   * @return {SVGElement}
   */
  function updateLine(gfx, points) {

    const cornerRadius = parseInt(gfx.dataset.cornerRadius, 10) || 0;

    attr$1(gfx, {
      d: componentsToPath(drawPath(points, cornerRadius))
    });

    return gfx;
  }

  var black = 'hsl(225, 10%, 15%)';
  var white = 'white';

  // element utils //////////////////////

  /**
   * Checks if eventDefinition of the given element matches with semantic type.
   *
   * @param {ModdleElement} event
   * @param {string} eventDefinitionType
   *
   * @return {boolean}
   */
  function isTypedEvent(event, eventDefinitionType) {
    return some(event.eventDefinitions, function(definition) {
      return definition.$type === eventDefinitionType;
    });
  }

  /**
   * Check if element is a throw event.
   *
   * @param {ModdleElement} event
   *
   * @return {boolean}
   */
  function isThrowEvent(event) {
    return (event.$type === 'bpmn:IntermediateThrowEvent') || (event.$type === 'bpmn:EndEvent');
  }

  /**
   * Check if element is a throw event.
   *
   * @param {ModdleElement} element
   *
   * @return {boolean}
   */
  function isCollection(element) {
    var dataObject = element.dataObjectRef;

    return element.isCollection || (dataObject && dataObject.isCollection);
  }


  // color access //////////////////////

  /**
   * @param {Element} element
   * @param {string} [defaultColor]
   * @param {string} [overrideColor]
   *
   * @return {string}
   */
  function getFillColor(element, defaultColor, overrideColor) {
    var di = getDi(element);

    return overrideColor || di.get('color:background-color') || di.get('bioc:fill') || defaultColor || white;
  }

  /**
   * @param {Element} element
   * @param {string} [defaultColor]
   * @param {string} [overrideColor]
   *
   * @return {string}
   */
  function getStrokeColor(element, defaultColor, overrideColor) {
    var di = getDi(element);

    return overrideColor || di.get('color:border-color') || di.get('bioc:stroke') || defaultColor || black;
  }

  /**
   * @param {Element} element
   * @param {string} [defaultColor]
   * @param {string} [defaultStrokeColor]
   * @param {string} [overrideColor]
   *
   * @return {string}
   */
  function getLabelColor(element, defaultColor, defaultStrokeColor, overrideColor) {
    var di = getDi(element),
        label = di.get('label');

    return overrideColor || (label && label.get('color:color')) || defaultColor ||
      getStrokeColor(element, defaultStrokeColor);
  }

  // cropping path customizations //////////////////////

  /**
   * @param {ShapeLike} shape
   *
   * @return {string} path
   */
  function getCirclePath(shape) {

    var cx = shape.x + shape.width / 2,
        cy = shape.y + shape.height / 2,
        radius = shape.width / 2;

    var circlePath = [
      [ 'M', cx, cy ],
      [ 'm', 0, -radius ],
      [ 'a', radius, radius, 0, 1, 1, 0, 2 * radius ],
      [ 'a', radius, radius, 0, 1, 1, 0, -2 * radius ],
      [ 'z' ]
    ];

    return componentsToPath(circlePath);
  }

  /**
   * @param {ShapeLike} shape
   * @param {number} [borderRadius]
   *
   * @return {string} path
   */
  function getRoundRectPath(shape, borderRadius) {

    var x = shape.x,
        y = shape.y,
        width = shape.width,
        height = shape.height;

    var roundRectPath = [
      [ 'M', x + borderRadius, y ],
      [ 'l', width - borderRadius * 2, 0 ],
      [ 'a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius ],
      [ 'l', 0, height - borderRadius * 2 ],
      [ 'a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius ],
      [ 'l', borderRadius * 2 - width, 0 ],
      [ 'a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius ],
      [ 'l', 0, borderRadius * 2 - height ],
      [ 'a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius ],
      [ 'z' ]
    ];

    return componentsToPath(roundRectPath);
  }

  /**
   * @param {ShapeLike} shape
   *
   * @return {string} path
   */
  function getDiamondPath(shape) {

    var width = shape.width,
        height = shape.height,
        x = shape.x,
        y = shape.y,
        halfWidth = width / 2,
        halfHeight = height / 2;

    var diamondPath = [
      [ 'M', x + halfWidth, y ],
      [ 'l', halfWidth, halfHeight ],
      [ 'l', -halfWidth, halfHeight ],
      [ 'l', -halfWidth, -halfHeight ],
      [ 'z' ]
    ];

    return componentsToPath(diamondPath);
  }

  /**
   * @param {ShapeLike} shape
   *
   * @return {string} path
   */
  function getRectPath(shape) {
    var x = shape.x,
        y = shape.y,
        width = shape.width,
        height = shape.height;

    var rectPath = [
      [ 'M', x, y ],
      [ 'l', width, 0 ],
      [ 'l', 0, height ],
      [ 'l', -width, 0 ],
      [ 'z' ]
    ];

    return componentsToPath(rectPath);
  }

  /**
   * Get width and height from element or overrides.
   *
   * @param {Dimensions|Rect|ShapeLike} bounds
   * @param {Object} overrides
   *
   * @returns {Dimensions}
   */
  function getBounds(bounds, overrides = {}) {
    return {
      width: getWidth(bounds, overrides),
      height: getHeight(bounds, overrides)
    };
  }

  /**
   * Get width from element or overrides.
   *
   * @param {Dimensions|Rect|ShapeLike} bounds
   * @param {Object} overrides
   *
   * @returns {number}
   */
  function getWidth(bounds, overrides = {}) {
    return has(overrides, 'width') ? overrides.width : bounds.width;
  }

  /**
   * Get height from element or overrides.
   *
   * @param {Dimensions|Rect|ShapeLike} bounds
   * @param {Object} overrides
   *
   * @returns {number}
   */
  function getHeight(bounds, overrides = {}) {
    return has(overrides, 'height') ? overrides.height : bounds.height;
  }

  /* eslint-disable no-multi-assign */

  const wrapMap = {
  	legend: [1, '<fieldset>', '</fieldset>'],
  	tr: [2, '<table><tbody>', '</tbody></table>'],
  	col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  	_default: [0, '', ''],
  };

  wrapMap.td
  = wrapMap.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

  wrapMap.option
  = wrapMap.optgroup = [1, '<select multiple="multiple">', '</select>'];

  wrapMap.thead
  = wrapMap.tbody
  = wrapMap.colgroup
  = wrapMap.caption
  = wrapMap.tfoot = [1, '<table>', '</table>'];

  wrapMap.polyline
  = wrapMap.ellipse
  = wrapMap.polygon
  = wrapMap.circle
  = wrapMap.text
  = wrapMap.line
  = wrapMap.path
  = wrapMap.rect
  = wrapMap.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">', '</svg>'];

  function domify(htmlString, document = globalThis.document) {
  	if (typeof htmlString !== 'string') {
  		throw new TypeError('String expected');
  	}

  	// Handle comment nodes
  	const commentMatch = /^<!--(.*?)-->$/s.exec(htmlString);
  	if (commentMatch) {
  		return document.createComment(commentMatch[1]);
  	}

  	const tagName = /<([\w:]+)/.exec(htmlString)?.[1];

  	if (!tagName) {
  		return document.createTextNode(htmlString);
  	}

  	htmlString = htmlString.trim();

  	// Body support
  	if (tagName === 'body') {
  		const element = document.createElement('html');
  		element.innerHTML = htmlString;
  		const {lastChild} = element;
  		lastChild.remove();
  		return lastChild;
  	}

  	// Wrap map
  	let [depth, prefix, suffix] = Object.hasOwn(wrapMap, tagName) ? wrapMap[tagName] : wrapMap._default;
  	let element = document.createElement('div');
  	element.innerHTML = prefix + htmlString + suffix;
  	while (depth--) {
  		element = element.lastChild;
  	}

  	// One element
  	if (element.firstChild === element.lastChild) {
  		const {firstChild} = element;
  		firstChild.remove();
  		return firstChild;
  	}

  	// Several elements
  	const fragment = document.createDocumentFragment();
  	fragment.append(...element.childNodes);

  	return fragment;
  }

  function _mergeNamespaces$1(n, m) {
    m.forEach(function (e) {
      e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
        if (k !== 'default' && !(k in n)) {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    });
    return Object.freeze(n);
  }

  /**
   * Assigns style attributes in a style-src compliant way.
   *
   * @param {Element} element
   * @param {...Object} styleSources
   *
   * @return {Element} the element
   */
  function assign(element, ...styleSources) {
    const target = element.style;

    forEach(styleSources, function(style) {
      if (!style) {
        return;
      }

      forEach(style, function(value, key) {
        target[key] = value;
      });
    });

    return element;
  }

  /**
   * Set attribute `name` to `val`, or get attr `name`.
   *
   * @param {Element} el
   * @param {String} name
   * @param {String} [val]
   * @api public
   */
  function attr(el, name, val) {

    // get
    if (arguments.length == 2) {
      return el.getAttribute(name);
    }

    // remove
    if (val === null) {
      return el.removeAttribute(name);
    }

    // set
    el.setAttribute(name, val);

    return el;
  }

  /**
   * Taken from https://github.com/component/classes
   *
   * Without the component bits.
   */

  /**
   * toString reference.
   */

  const toString = Object.prototype.toString;

  /**
   * Wrap `el` in a `ClassList`.
   *
   * @param {Element} el
   * @return {ClassList}
   * @api public
   */

  function classes(el) {
    return new ClassList(el);
  }

  /**
   * Initialize a new ClassList for `el`.
   *
   * @param {Element} el
   * @api private
   */

  function ClassList(el) {
    if (!el || !el.nodeType) {
      throw new Error('A DOM element reference is required');
    }
    this.el = el;
    this.list = el.classList;
  }

  /**
   * Add class `name` if not already present.
   *
   * @param {String} name
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.add = function(name) {
    this.list.add(name);
    return this;
  };

  /**
   * Remove class `name` when present, or
   * pass a regular expression to remove
   * any which match.
   *
   * @param {String|RegExp} name
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.remove = function(name) {
    if ('[object RegExp]' == toString.call(name)) {
      return this.removeMatching(name);
    }

    this.list.remove(name);
    return this;
  };

  /**
   * Remove all classes matching `re`.
   *
   * @param {RegExp} re
   * @return {ClassList}
   * @api private
   */

  ClassList.prototype.removeMatching = function(re) {
    const arr = this.array();
    for (let i = 0; i < arr.length; i++) {
      if (re.test(arr[i])) {
        this.remove(arr[i]);
      }
    }
    return this;
  };

  /**
   * Toggle class `name`, can force state via `force`.
   *
   * For browsers that support classList, but do not support `force` yet,
   * the mistake will be detected and corrected.
   *
   * @param {String} name
   * @param {Boolean} force
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.toggle = function(name, force) {
    if ('undefined' !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  };

  /**
   * Return an array of classes.
   *
   * @return {Array}
   * @api public
   */

  ClassList.prototype.array = function() {
    return Array.from(this.list);
  };

  /**
   * Check if class `name` is present.
   *
   * @param {String} name
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.has =
  ClassList.prototype.contains = function(name) {
    return this.list.contains(name);
  };

  /**
   * Clear utility
   */

  /**
   * Removes all children from the given element
   *
   * @param {Element} element
   *
   * @return {Element} the element (for chaining)
   */
  function clear(element) {
    var child;

    while ((child = element.firstChild)) {
      element.removeChild(child);
    }

    return element;
  }

  /**
   * Closest
   *
   * @param {Element} el
   * @param {string} selector
   * @param {boolean} checkYourSelf (optional)
   */
  function closest(element, selector, checkYourSelf) {
    var actualElement = checkYourSelf ? element : element.parentNode;

    return actualElement && typeof actualElement.closest === 'function' && actualElement.closest(selector) || null;
  }

  function getDefaultExportFromCjs$1 (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var componentEvent = {};

  var hasRequiredComponentEvent;

  function requireComponentEvent () {
  	if (hasRequiredComponentEvent) return componentEvent;
  	hasRequiredComponentEvent = 1;
  	var bind, unbind, prefix;

  	function detect () {
  	  bind = window.addEventListener ? 'addEventListener' : 'attachEvent';
  	  unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent';
  	  prefix = bind !== 'addEventListener' ? 'on' : '';
  	}

  	/**
  	 * Bind `el` event `type` to `fn`.
  	 *
  	 * @param {Element} el
  	 * @param {String} type
  	 * @param {Function} fn
  	 * @param {Boolean} capture
  	 * @return {Function}
  	 * @api public
  	 */

  	componentEvent.bind = function(el, type, fn, capture){
  	  if (!bind) detect();
  	  el[bind](prefix + type, fn, capture || false);
  	  return fn;
  	};

  	/**
  	 * Unbind `el` event `type`'s callback `fn`.
  	 *
  	 * @param {Element} el
  	 * @param {String} type
  	 * @param {Function} fn
  	 * @param {Boolean} capture
  	 * @return {Function}
  	 * @api public
  	 */

  	componentEvent.unbind = function(el, type, fn, capture){
  	  if (!unbind) detect();
  	  el[unbind](prefix + type, fn, capture || false);
  	  return fn;
  	};
  	return componentEvent;
  }

  var componentEventExports = requireComponentEvent();
  var index = /*@__PURE__*/getDefaultExportFromCjs$1(componentEventExports);

  var event = /*#__PURE__*/_mergeNamespaces$1({
    __proto__: null,
    default: index
  }, [componentEventExports]);

  /**
   * Module dependencies.
   */


  /**
   * Delegate event `type` to `selector`
   * and invoke `fn(e)`. A callback function
   * is returned which may be passed to `.unbind()`.
   *
   * @param {Element} el
   * @param {String} selector
   * @param {String} type
   * @param {Function} fn
   * @param {Boolean} capture
   * @return {Function}
   * @api public
   */

  // Some events don't bubble, so we want to bind to the capture phase instead
  // when delegating.
  var forceCaptureEvents = [ 'focus', 'blur' ];

  function bind(el, selector, type, fn, capture) {
    if (forceCaptureEvents.indexOf(type) !== -1) {
      capture = true;
    }

    return event.bind(el, type, function(e) {
      var target = e.target || e.srcElement;
      e.delegateTarget = closest(target, selector, true);
      if (e.delegateTarget) {
        fn.call(el, e);
      }
    }, capture);
  }

  /**
   * Unbind event `type`'s callback `fn`.
   *
   * @param {Element} el
   * @param {String} type
   * @param {Function} fn
   * @param {Boolean} capture
   * @api public
   */
  function unbind(el, type, fn, capture) {
    if (forceCaptureEvents.indexOf(type) !== -1) {
      capture = true;
    }

    return event.unbind(el, type, fn, capture);
  }

  var delegate = {
    bind,
    unbind
  };

  function query(selector, el) {
    el = el || document;

    return el.querySelector(selector);
  }

  function all(selector, el) {
    el = el || document;

    return el.querySelectorAll(selector);
  }

  function remove$1(el) {
    el.parentNode && el.parentNode.removeChild(el);
  }

  /**
   * @param {SVGElement} gfx
   * @param {number} x
   * @param {number} y
   * @param {number} [angle]
   * @param {number} [amount]
   */
  function transform(gfx, x, y, angle, amount) {
    var translate = createTransform();
    translate.setTranslate(x, y);

    var rotate = createTransform();
    rotate.setRotate(angle || 0, 0, 0);

    var scale = createTransform();
    scale.setScale(1, 1);

    transform$1(gfx, [ translate, rotate, scale ]);
  }


  /**
   * @param {SVGElement} gfx
   * @param {number} x
   * @param {number} y
   */
  function translate$1(gfx, x, y) {
    var translate = createTransform();
    translate.setTranslate(x, y);

    transform$1(gfx, translate);
  }

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var hat$1 = {exports: {}};

  var hasRequiredHat;

  function requireHat () {
  	if (hasRequiredHat) return hat$1.exports;
  	hasRequiredHat = 1;
  	var hat = hat$1.exports = function (bits, base) {
  	    if (!base) base = 16;
  	    if (bits === undefined) bits = 128;
  	    if (bits <= 0) return '0';
  	    
  	    var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
  	    for (var i = 2; digits === Infinity; i *= 2) {
  	        digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
  	    }
  	    
  	    var rem = digits - Math.floor(digits);
  	    
  	    var res = '';
  	    
  	    for (var i = 0; i < Math.floor(digits); i++) {
  	        var x = Math.floor(Math.random() * base).toString(base);
  	        res = x + res;
  	    }
  	    
  	    if (rem) {
  	        var b = Math.pow(base, rem);
  	        var x = Math.floor(Math.random() * b).toString(base);
  	        res = x + res;
  	    }
  	    
  	    var parsed = parseInt(res, base);
  	    if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
  	        return hat(bits, base)
  	    }
  	    else return res;
  	};

  	hat.rack = function (bits, base, expandBy) {
  	    var fn = function (data) {
  	        var iters = 0;
  	        do {
  	            if (iters ++ > 10) {
  	                if (expandBy) bits += expandBy;
  	                else throw new Error('too many ID collisions, use more bits')
  	            }
  	            
  	            var id = hat(bits, base);
  	        } while (Object.hasOwnProperty.call(hats, id));
  	        
  	        hats[id] = data;
  	        return id;
  	    };
  	    var hats = fn.hats = {};
  	    
  	    fn.get = function (id) {
  	        return fn.hats[id];
  	    };
  	    
  	    fn.set = function (id, value) {
  	        fn.hats[id] = value;
  	        return fn;
  	    };
  	    
  	    fn.bits = bits || 128;
  	    fn.base = base || 16;
  	    return fn;
  	};
  	return hat$1.exports;
  }

  var hatExports = requireHat();
  var hat = /*@__PURE__*/getDefaultExportFromCjs(hatExports);

  /**
   * @typedef { [ number, number ] | [ number, number, number ] } Seed
   */

  /**
   * Create a new id generator / cache instance.
   *
   * You may optionally provide a seed that is used internally.
   *
   * @param {Seed} [seed]
   */
  function Ids(seed) {

    if (!(this instanceof Ids)) {
      return new Ids(seed);
    }

    seed = seed || [ 128, 36, 1 ];
    this._seed = seed.length ? hat.rack(seed[0], seed[1], seed[2]) : seed;
  }

  /**
   * Generate a next id.
   *
   * @param {Object} [element] element to bind the id to
   *
   * @return {string} id
   */
  Ids.prototype.next = function(element) {
    return this._seed(element || true);
  };

  /**
   * Generate a next id with a given prefix.
   *
   * @param {Object} [element] element to bind the id to
   *
   * @return {string} id
   */
  Ids.prototype.nextPrefixed = function(prefix, element) {
    var id;

    do {
      id = prefix + this.next(true);
    } while (this.assigned(id));

    // claim {prefix}{random}
    this.claim(id, element);

    // return
    return id;
  };

  /**
   * Manually claim an existing id.
   *
   * @param {string} id
   * @param {any} [element] element the id is claimed by
   */
  Ids.prototype.claim = function(id, element) {
    this._seed.set(id, element || true);
  };

  /**
   * Returns true if the given id has already been assigned.
   *
   * @param  {string} id
   * @return {boolean}
   */
  Ids.prototype.assigned = function(id) {
    return this._seed.get(id) || false;
  };

  /**
   * Unclaim an id.
   *
   * @param  {string} id the id to unclaim
   */
  Ids.prototype.unclaim = function(id) {
    delete this._seed.hats[id];
  };


  /**
   * Clear all claimed ids.
   */
  Ids.prototype.clear = function() {

    var hats = this._seed.hats,
        id;

    for (id in hats) {
      this.unclaim(id);
    }
  };

  var cancel = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M24.5854 10.4428C24.439 10.2964 24.2015 10.2964 24.0551 10.4428L18.0005 16.4974L11.9459 10.4428C11.7995 10.2963 11.562 10.2963 11.4156 10.4428L10.4433 11.415C10.2969 11.5615 10.2969 11.7989 10.4433 11.9454L16.4979 18L10.4433 24.0546C10.2968 24.201 10.2968 24.4385 10.4433 24.5849L11.4156 25.5572C11.562 25.7037 11.7994 25.7037 11.9459 25.5572L18.0005 19.5026L24.0551 25.5572C24.2016 25.7036 24.439 25.7036 24.5854 25.5572L25.5577 24.5849C25.7042 24.4385 25.7042 24.201 25.5577 24.0546L19.5031 18L25.5577 11.9454C25.7041 11.799 25.7041 11.5615 25.5577 11.4151L24.5854 10.4428ZM22.6409 9.02858C23.5684 8.10109 25.0721 8.10109 25.9996 9.02858L26.9719 10.0009C27.8994 10.9284 27.8994 12.4321 26.9719 13.3596L22.3315 18L26.9719 22.6404C27.8994 23.5679 27.8994 25.0716 26.9719 25.9991L25.9997 26.9714C25.0722 27.8989 23.5684 27.8989 22.6409 26.9714L18.0005 22.331L13.3601 26.9714C12.4326 27.8989 10.9288 27.8989 10.0013 26.9714L9.02908 25.9991C8.10158 25.0717 8.10158 23.5679 9.02908 22.6404L13.6695 18L9.02909 13.3596C8.1016 12.4321 8.1016 10.9283 9.02909 10.0008L10.0014 9.02856C10.9289 8.10107 12.4326 8.10106 13.3601 9.02856L18.0005 13.669L22.6409 9.02858Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var cancelFilled = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M26.2648 25.292C26.8018 24.7551 26.8018 23.8844 26.2648 23.3475L20.9173 18L26.2648 12.6525C26.8018 12.1155 26.8018 11.2449 26.2648 10.708L25.2925 9.7357C24.7555 9.19873 23.8849 9.19873 23.348 9.7357L18.0005 15.0832L12.653 9.73567C12.116 9.1987 11.2454 9.1987 10.7085 9.73567L9.73618 10.7079C9.19921 11.2449 9.19921 12.1155 9.73618 12.6525L15.0837 18L9.73616 23.3475C9.19919 23.8845 9.19919 24.7551 9.73616 25.292L10.7084 26.2643C11.2454 26.8013 12.116 26.8013 12.653 26.2643L18.0005 20.9168L23.348 26.2643C23.885 26.8013 24.7556 26.8013 25.2925 26.2643L26.2648 25.292Z\" fill=\"fuchsia\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M24.5854 10.4428C24.439 10.2964 24.2015 10.2964 24.0551 10.4428L18.0005 16.4974L11.9459 10.4428C11.7994 10.2963 11.562 10.2963 11.4156 10.4428L10.4433 11.4151C10.2968 11.5615 10.2968 11.7989 10.4433 11.9454L16.4979 18L10.4433 24.0546C10.2968 24.2011 10.2968 24.4385 10.4433 24.5849L11.4155 25.5572C11.562 25.7037 11.7994 25.7037 11.9459 25.5572L18.0005 19.5026L24.0551 25.5572C24.2015 25.7036 24.439 25.7036 24.5854 25.5572L25.5577 24.5849C25.7041 24.4385 25.7041 24.201 25.5577 24.0546L19.5031 18L25.5577 11.9454C25.7041 11.799 25.7041 11.5615 25.5577 11.4151L24.5854 10.4428ZM22.6409 9.02859C23.5684 8.1011 25.0721 8.1011 25.9996 9.02859L26.9719 10.0009C27.8994 10.9284 27.8994 12.4321 26.9719 13.3596L22.3315 18L26.9719 22.6404C27.8994 23.5679 27.8994 25.0716 26.9719 25.9991L25.9996 26.9714C25.0721 27.8989 23.5684 27.8989 22.6409 26.9714L18.0005 22.331L13.3601 26.9714C12.4326 27.8989 10.9288 27.8989 10.0013 26.9714L9.02906 25.9992C8.10156 25.0717 8.10156 23.5679 9.02906 22.6404L13.6695 18L9.02907 13.3596C8.10158 12.4321 8.10158 10.9283 9.02907 10.0008L10.0013 9.02857C10.9288 8.10107 12.4326 8.10107 13.3601 9.02857L18.0005 13.669L22.6409 9.02859Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var compensation = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M15.0545 13.1013L8.7865 17.9999L15.0545 22.8986V13.1013ZM17.0545 16.7726V11.0507C17.0545 10.2174 16.0953 9.74967 15.4388 10.2627L6.54677 17.2119C6.03447 17.6123 6.03446 18.3874 6.54675 18.7878L15.4387 25.7372C16.0953 26.2503 17.0545 25.7825 17.0545 24.9493V19.2274L25.3843 25.7372C26.0408 26.2503 27 25.7825 27 24.9493V11.0507C27 10.2175 26.0408 9.74969 25.3843 10.2628L17.0545 16.7726ZM18.732 18L25 13.1014V22.8986L18.732 18Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var compensationFilled = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M17.0545 11.0507C17.0545 10.2174 16.0953 9.74967 15.4388 10.2627L6.54677 17.2119C6.03447 17.6123 6.03446 18.3874 6.54675 18.7878L15.4387 25.7372C16.0953 26.2503 17.0545 25.7825 17.0545 24.9493V19.2274L25.3843 25.7372C26.0408 26.2503 27 25.7825 27 24.9493V11.0507C27 10.2175 26.0408 9.74969 25.3843 10.2628L17.0545 16.7726V11.0507Z\" fill=\"fuchsia\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M15.0545 13.1013L8.7865 17.9999L15.0545 22.8986V13.1013ZM17.0545 16.7726V11.0507C17.0545 10.2174 16.0953 9.74967 15.4388 10.2627L6.54677 17.2119C6.03447 17.6123 6.03446 18.3874 6.54675 18.7878L15.4387 25.7372C16.0953 26.2503 17.0545 25.7825 17.0545 24.9493V19.2274L25.3843 25.7372C26.0408 26.2503 27 25.7825 27 24.9493V11.0507C27 10.2175 26.0408 9.74969 25.3843 10.2628L17.0545 16.7726ZM18.732 18L25 13.1014V22.8986L18.732 18Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var conditional = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M24 10H12V26H24V10ZM12 8C10.8954 8 10 8.89543 10 10V26C10 27.1046 10.8954 28 12 28H24C25.1046 28 26 27.1046 26 26V10C26 8.89543 25.1046 8 24 8H12Z\" fill=\"fuchsia\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M22 14H14V12.5H22V14Z\" fill=\"fuchsia\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M22 17H14V15.5H22V17Z\" fill=\"fuchsia\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M22 20H14V18.5H22V20Z\" fill=\"fuchsia\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M22 23H14V21.5H22V23Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var error$2 = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12.0235 25.4265L16.2438 17.7456L20.7973 22.2991L23.908 10.5064L19.6877 18.1873L15.1342 13.6338L12.0235 25.4265ZM19.2179 14.8891L22.1551 9.54326C22.6416 8.65786 23.712 8.27427 24.6501 8.64914C25.5882 9.02402 26.0995 10.0396 25.8418 11.0165L22.7312 22.8092C22.5486 23.5014 22.0099 24.0433 21.3187 24.2299C20.6275 24.4166 19.8893 24.2195 19.3831 23.7133L16.7136 21.0438L13.7763 26.3896C13.2899 27.275 12.2195 27.6586 11.2814 27.2837C10.3432 26.9089 9.83198 25.8932 10.0896 24.9164L13.2003 13.1237C13.3829 12.4314 13.9216 11.8896 14.6128 11.7029C15.3039 11.5163 16.0421 11.7133 16.5484 12.2196L19.2179 14.8891Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var errorFilled = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M19.3353 15.7136L22.5933 9.78403C22.9582 9.11998 23.761 8.83229 24.4646 9.11344C25.1682 9.3946 25.5516 10.1563 25.3584 10.8889L22.2477 22.6817C22.1107 23.2008 21.7067 23.6072 21.1884 23.7472C20.67 23.8872 20.1163 23.7394 19.7366 23.3597L16.5961 20.2192L13.3381 26.1488C12.9733 26.8129 12.1705 27.1006 11.4669 26.8194C10.7633 26.5383 10.3799 25.7766 10.5731 25.0439L13.6838 13.2512C13.8207 12.732 14.2247 12.3256 14.7431 12.1857C15.2615 12.0457 15.8151 12.1934 16.1948 12.5731L19.3353 15.7136Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var escalation = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M17.9999 18.4342L22.6732 22.6067L17.9999 10.9236L13.3267 22.6067L17.9999 18.4342ZM26.1112 25.8166C26.5035 26.7975 25.3047 27.6375 24.5167 26.9339L17.9999 21.1154L11.4832 26.9339C10.6951 27.6375 9.49631 26.7975 9.88866 25.8166L17.0714 7.85965C17.4067 7.0215 18.5931 7.02151 18.9284 7.85965L26.1112 25.8166Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var escalationFilled = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M24.5167 26.9339C25.3047 27.6375 26.5035 26.7975 26.1112 25.8166L18.9284 7.85965C18.5931 7.02151 17.4067 7.02151 17.0714 7.85965L9.88866 25.8166C9.49631 26.7975 10.6951 27.6375 11.4832 26.9339L17.9999 21.1154L24.5167 26.9339Z\" fill=\"fuchsia\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M17.9999 18.4342L22.6732 22.6067L17.9999 10.9236L13.3267 22.6067L17.9999 18.4342ZM26.1112 25.8166C26.5035 26.7975 25.3047 27.6375 24.5167 26.9339L17.9999 21.1154L11.4832 26.9339C10.6951 27.6375 9.49631 26.7975 9.88866 25.8166L17.0714 7.85965C17.4067 7.02151 18.5931 7.02151 18.9284 7.85965L26.1112 25.8166Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var link = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<mask id=\"path-1-inside-1_61_6001\" fill=\"white\">\r\n<path d=\"M29.6956 18.265C30.1687 17.8655 30.1687 17.1364 29.6956 16.7369L21.0605 9.44516C20.4104 8.89619 19.4154 9.3583 19.4154 10.2092V13.6118H7.99347C7.44118 13.6118 6.99347 14.0595 6.99347 14.6118V20.3901C6.99347 20.9424 7.44118 21.3901 7.99347 21.3901H19.4154V24.7928C19.4154 25.6436 20.4104 26.1058 21.0605 25.5568L29.6956 18.265Z\"/>\r\n</mask>\r\n<path d=\"M29.6956 16.7369L28.4053 18.265V18.265L29.6956 16.7369ZM29.6956 18.265L28.4053 16.7369L28.4053 16.7369L29.6956 18.265ZM21.0605 9.44516L19.7702 10.9732L19.7702 10.9732L21.0605 9.44516ZM19.4154 13.6118V15.6118H21.4154V13.6118H19.4154ZM19.4154 21.3901H21.4154V19.3901H19.4154V21.3901ZM21.0605 25.5568L19.7702 24.0287L19.7702 24.0287L21.0605 25.5568ZM28.4053 18.265C27.9322 17.8655 27.9322 17.1364 28.4053 16.7369L30.986 19.7931C32.4053 18.5946 32.4053 16.4074 30.986 15.2089L28.4053 18.265ZM19.7702 10.9732L28.4053 18.265L30.986 15.2089L22.3509 7.9171L19.7702 10.9732ZM21.4154 10.2092C21.4154 11.0601 20.4203 11.5222 19.7702 10.9732L22.3509 7.9171C20.4006 6.27017 17.4154 7.65651 17.4154 10.2092H21.4154ZM21.4154 13.6118V10.2092H17.4154V13.6118H21.4154ZM7.99347 15.6118H19.4154V11.6118H7.99347V15.6118ZM8.99347 14.6118C8.99347 15.1641 8.54575 15.6118 7.99347 15.6118V11.6118C6.33662 11.6118 4.99347 12.955 4.99347 14.6118H8.99347ZM8.99347 20.3901V14.6118H4.99347V20.3901H8.99347ZM7.99347 19.3901C8.54576 19.3901 8.99347 19.8378 8.99347 20.3901H4.99347C4.99347 22.047 6.33661 23.3901 7.99347 23.3901V19.3901ZM19.4154 19.3901H7.99347V23.3901H19.4154V19.3901ZM21.4154 24.7928V21.3901H17.4154V24.7928H21.4154ZM19.7702 24.0287C20.4203 23.4797 21.4154 23.9419 21.4154 24.7928H17.4154C17.4154 27.3454 20.4006 28.7318 22.3509 27.0849L19.7702 24.0287ZM28.4053 16.7369L19.7702 24.0287L22.3509 27.0849L30.986 19.7931L28.4053 16.7369Z\" fill=\"fuchsia\" mask=\"url(#path-1-inside-1_61_6001)\"/>\r\n</svg>\r\n";

  var linkFilled = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M29.6953 18.265C30.1684 17.8655 30.1684 17.1364 29.6953 16.7369L21.0602 9.44516C20.4101 8.89619 19.4151 9.3583 19.4151 10.2092V13.6118H7.99365C7.44137 13.6118 6.99365 14.0595 6.99365 14.6118V20.3901C6.99365 20.9424 7.44137 21.3901 7.99365 21.3901H19.4151V24.7928C19.4151 25.6436 20.4101 26.1058 21.0602 25.5568L29.6953 18.265Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var messageSvg = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n  <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M24.9851 12H11.0135L17.9993 15.2944L24.9851 12ZM10 13.7333V23H26V13.7326L18.8523 17.1033C18.3122 17.358 17.6864 17.358 17.1462 17.1033L10 13.7333ZM8 12C8 10.8954 8.89543 10 10 10H26C27.1046 10 28 10.8954 28 12V23C28 24.1046 27.1046 25 26 25H10C8.89543 25 8 24.1046 8 23V12Z\" fill=\"fuchsia\"/>\r\n</svg>";

  var messageFilledSvg = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n  <path d=\"M8.76232 10.4291L17.9994 15.2709L27.2375 10.4285C26.8971 10.1601 26.4674 10 26.0002 10H10.0002C9.53281 10 9.10283 10.1604 8.76232 10.4291Z\" fill=\"fuchsia\"/>\r\n  <path d=\"M28.0002 12.2868L18.9279 17.0423C18.3465 17.3471 17.6524 17.3471 17.0709 17.0423L8.00024 12.2877V23C8.00024 24.1046 8.89568 25 10.0002 25H26.0002C27.1048 25 28.0002 24.1046 28.0002 23V12.2868Z\" fill=\"fuchsia\"/>\r\n</svg>";

  var multiple = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M18 8.1875L9.09581 14.9482L12.5319 26H23.4681L26.9042 14.9482L18 8.1875ZM18.7712 6.26186C18.3113 5.91271 17.6887 5.91271 17.2288 6.26186L7.54092 13.6177C7.08108 13.9668 6.88866 14.5857 7.0643 15.1506L10.7647 27.0526C10.9404 27.6175 11.4442 28 12.0126 28H23.9874C24.5558 28 25.0596 27.6175 25.2353 27.0526L28.9357 15.1506C29.1113 14.5857 28.9189 13.9668 28.4591 13.6177L18.7712 6.26186Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var multipleFilled = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M18.7712 6.26186C18.3113 5.91271 17.6887 5.91271 17.2288 6.26186L7.54092 13.6177C7.08108 13.9668 6.88866 14.5857 7.0643 15.1506L10.7647 27.0526C10.9404 27.6175 11.4442 28 12.0126 28H23.9874C24.5558 28 25.0596 27.6175 25.2353 27.0526L28.9357 15.1506C29.1113 14.5857 28.9189 13.9668 28.4591 13.6177L18.7712 6.26186Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var multipleParallel = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M29.0005 17.3125C29.0005 16.5531 28.3849 15.9375 27.6255 15.9375H20.063L20.063 8.375C20.063 7.61561 19.4474 7 18.688 7L17.313 7C16.5536 7 15.938 7.61561 15.938 8.375L15.938 15.9375H8.37549C7.6161 15.9375 7.00049 16.5531 7.00049 17.3125L7.00049 18.6875C7.00049 19.4469 7.6161 20.0625 8.37549 20.0625L15.938 20.0625L15.938 27.625C15.938 28.3844 16.5536 29 17.313 29H18.688C19.4474 29 20.063 28.3844 20.063 27.625L20.063 20.0625H27.6255C28.3849 20.0625 29.0005 19.4469 29.0005 18.6875L29.0005 17.3125Z\" stroke=\"fuchsia\" stroke-width=\"2\"/>\r\n</svg>\r\n";

  var signal = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M16.252 8.1441C17.0142 6.77322 18.9858 6.77321 19.748 8.1441L27.6061 22.2782C28.3472 23.6112 27.3833 25.25 25.8581 25.25H10.1419C8.61667 25.25 7.65276 23.6112 8.39391 22.2782L16.252 8.1441Z\" fill=\"white\" style=\"mix-blend-mode:multiply\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M25.8581 23.25L18 9.11593L10.1419 23.25H25.8581ZM19.748 8.1441C18.9858 6.77321 17.0142 6.77322 16.252 8.1441L8.39391 22.2782C7.65276 23.6112 8.61667 25.25 10.1419 25.25H25.8581C27.3833 25.25 28.3472 23.6112 27.6061 22.2782L19.748 8.1441Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var signalFilled = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M16.252 8.1441C17.0142 6.77322 18.9858 6.77321 19.748 8.1441L27.6061 22.2782C28.3472 23.6112 27.3833 25.25 25.8581 25.25H10.1419C8.61667 25.25 7.65276 23.6112 8.39391 22.2782L16.252 8.1441Z\" fill=\"fuchsia\" style=\"mix-blend-mode:multiply\"/>\r\n</svg>\r\n";

  var timerSvg = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M18 27C22.9706 27 27 22.9706 27 18C27 13.0294 22.9706 9 18 9C13.0294 9 9 13.0294 9 18C9 22.9706 13.0294 27 18 27ZM18 29C24.0751 29 29 24.0751 29 18C29 11.9249 24.0751 7 18 7C11.9249 7 7 11.9249 7 18C7 24.0751 11.9249 29 18 29Z\" fill=\"fuchsia\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M17 17.5858V11H19V17.5858L22.7071 21.2929L21.2929 22.7071L17.5858 19C17.2107 18.6249 17 18.1162 17 17.5858Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var businessRule = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M4 5.5H21C21.2761 5.5 21.5 5.72386 21.5 6V8.5H3.5V6C3.5 5.72386 3.72386 5.5 4 5.5ZM3.5 10V13.5H8V10H3.5ZM9.5 10V13.5H21.5V10H9.5ZM8 15H3.5V18C3.5 18.2761 3.72386 18.5 4 18.5H8V15ZM9.5 18.5V15H21.5V18C21.5 18.2761 21.2761 18.5 21 18.5H9.5ZM2 6C2 4.89543 2.89543 4 4 4H21C22.1046 4 23 4.89543 23 6V18C23 19.1046 22.1046 20 21 20H4C2.89543 20 2 19.1046 2 18V6Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var manual = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M13.9017 6.94506L13.6281 7.25019H21.5C22.7426 7.25019 23.75 8.25755 23.75 9.50019C23.75 9.85685 23.667 10.1941 23.5193 10.4938C24.2497 10.8656 24.75 11.6245 24.75 12.5002C24.75 13.3759 24.2497 14.1348 23.5193 14.5066C23.667 14.8062 23.75 15.1435 23.75 15.5002C23.75 16.7023 22.8073 17.6842 21.6208 17.747C21.7045 17.9825 21.75 18.236 21.75 18.5002C21.75 19.7428 20.7426 20.7502 19.5 20.7502H7C3.82436 20.7502 1.25 18.1758 1.25 15.0002V13.0002C1.25 10.9141 2.36132 9.08835 4.02076 8.08134C4.07871 8.0315 4.13926 7.98424 4.2023 7.93978L10.7064 3.35296C11.8015 2.58069 13.3157 2.84569 14.0834 3.94397C14.7273 4.8651 14.652 6.10834 13.9017 6.94506ZM11.5709 4.5788C11.9869 4.28537 12.5623 4.38606 12.854 4.80335C13.0986 5.15334 13.07 5.62571 12.7849 5.94363L11.423 7.46244L11.4203 7.46545L10.2556 8.75019H21.5C21.9142 8.75019 22.25 9.08598 22.25 9.50019C22.25 9.90874 21.9233 10.241 21.517 10.25H13C12.5858 10.25 12.25 10.5858 12.25 11C12.25 11.4142 12.5858 11.75 13 11.75L22.5 11.7502C22.9142 11.7502 23.25 12.086 23.25 12.5002C23.25 12.9144 22.9142 13.2502 22.5 13.2502L13 13.25C12.5858 13.25 12.25 13.5858 12.25 14C12.25 14.4142 12.5858 14.75 13 14.75H21.5C21.9142 14.75 22.25 15.086 22.25 15.5002C22.25 15.9144 21.9142 16.2502 21.5 16.2502L13 16.25C12.5858 16.25 12.25 16.5858 12.25 17C12.25 17.4142 12.5858 17.75 13 17.75H19.5C19.9142 17.75 20.25 18.086 20.25 18.5002C20.25 18.9144 19.9142 19.2502 19.5 19.2502H7C4.65279 19.2502 2.75 17.3474 2.75 15.0002V13.0002C2.75 11.4399 3.59042 10.075 4.84687 9.33504L4.91619 9.29422L4.97528 9.23962C5.0039 9.21316 5.03444 9.18843 5.06678 9.16562L11.5709 4.5788Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var receive = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M3 7C3 5.89543 3.89543 5 5 5H21C22.1046 5 23 5.89543 23 7V18C23 19.1046 22.1046 20 21 20H5C3.89543 20 3 19.1046 3 18V7ZM5 6.5H21C21.1327 6.5 21.2534 6.55171 21.3429 6.63609L13.1059 10.5205C13.0384 10.5523 12.9602 10.5523 12.8926 10.5205L4.65664 6.63654C4.7462 6.5519 4.86704 6.5 5 6.5ZM4.5 8.2211V18C4.5 18.2761 4.72386 18.5 5 18.5H21C21.2761 18.5 21.5 18.2761 21.5 18V8.22042L13.7457 11.8772C13.273 12.1001 12.7255 12.1001 12.2529 11.8772L4.5 8.2211Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var script = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<mask id=\"path-2-outside-1_61_6770\" maskUnits=\"userSpaceOnUse\" x=\"3\" y=\"3\" width=\"20\" height=\"20\" fill=\"black\">\r\n<rect fill=\"white\" x=\"3\" y=\"3\" width=\"20\" height=\"20\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5.88673 5.125C5.55957 6.00586 5.125 7.40572 5.125 8.5C5.125 9.30484 5.36284 10.2961 5.63403 11.1441C5.76569 11.5558 5.89762 11.9107 5.99627 12.1617C6.04546 12.2869 6.08604 12.3854 6.11371 12.4512C6.12754 12.4841 6.13812 12.5087 6.1449 12.5244L6.15216 12.5411L6.15342 12.544C6.15342 12.544 6.1533 12.5437 5.125 13C5.125 13 4 10.4648 4 8.5C4 7.16443 4.51982 5.5653 4.85276 4.67803C5.00904 4.26156 5.41175 4 5.85657 4H19.145C19.9588 4 20.5207 4.84551 20.278 5.62233C20.0087 6.48441 19.75 7.55779 19.75 8.5C19.75 10.4648 20.875 13 20.875 13C19.8467 13.4563 19.8466 13.456 19.8466 13.456L19.8448 13.4521L19.8414 13.4443L19.8298 13.4177C19.8201 13.3953 19.8065 13.3636 19.7896 13.3233C19.7558 13.2428 19.7084 13.1278 19.6522 12.9847C19.5399 12.6989 19.3906 12.2972 19.241 11.8295C18.9497 10.9187 18.625 9.65994 18.625 8.5C18.625 7.38568 18.9244 6.18249 19.2042 5.28689C19.2153 5.25117 19.211 5.20146 19.1803 5.15675C19.1666 5.13681 19.1542 5.12829 19.1501 5.12597L19.1495 5.12559C19.1495 5.12559 19.1485 5.125 19.145 5.125H5.88673ZM20.1133 20.875H6.85501C6.85149 20.875 6.85055 20.8744 6.85055 20.8744L6.84993 20.874C6.84578 20.8717 6.83337 20.8632 6.81968 20.8433C6.78897 20.7985 6.78467 20.7488 6.79582 20.7131C7.07559 19.8175 7.375 18.6143 7.375 17.5C7.375 16.3401 7.05034 15.0813 6.75903 14.1705C6.60944 13.7028 6.46012 13.3011 6.34783 13.0153C6.29156 12.8722 6.24425 12.7572 6.21039 12.6767C6.19346 12.6364 6.17986 12.6047 6.17017 12.5823L6.15861 12.5557L6.15515 12.5479L6.15402 12.5453L6.15342 12.544C6.15342 12.544 6.1533 12.5437 5.125 13C5.125 13 6.25 15.5352 6.25 17.5C6.25 18.4422 5.99129 19.5156 5.722 20.3777C5.47934 21.1545 6.04117 22 6.85501 22H20.1434C20.5883 22 20.991 21.7384 21.1472 21.322C21.4802 20.4347 22 18.8356 22 17.5C22 15.5352 20.875 13 20.875 13C19.8467 13.4563 19.8466 13.456 19.8466 13.456L19.8478 13.4589L19.8551 13.4756C19.8619 13.4913 19.8725 13.5159 19.8863 13.5488C19.914 13.6146 19.9545 13.7131 20.0037 13.8383C20.1024 14.0893 20.2343 14.4442 20.366 14.8559C20.6372 15.7039 20.875 16.6952 20.875 17.5C20.875 18.5943 20.4404 19.9941 20.1133 20.875Z\"/>\r\n</mask>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5.88673 5.125C5.55957 6.00586 5.125 7.40572 5.125 8.5C5.125 9.30484 5.36284 10.2961 5.63403 11.1441C5.76569 11.5558 5.89762 11.9107 5.99627 12.1617C6.04546 12.2869 6.08604 12.3854 6.11371 12.4512C6.12754 12.4841 6.13812 12.5087 6.1449 12.5244L6.15216 12.5411L6.15342 12.544C6.15342 12.544 6.1533 12.5437 5.125 13C5.125 13 4 10.4648 4 8.5C4 7.16443 4.51982 5.5653 4.85276 4.67803C5.00904 4.26156 5.41175 4 5.85657 4H19.145C19.9588 4 20.5207 4.84551 20.278 5.62233C20.0087 6.48441 19.75 7.55779 19.75 8.5C19.75 10.4648 20.875 13 20.875 13C19.8467 13.4563 19.8466 13.456 19.8466 13.456L19.8448 13.4521L19.8414 13.4443L19.8298 13.4177C19.8201 13.3953 19.8065 13.3636 19.7896 13.3233C19.7558 13.2428 19.7084 13.1278 19.6522 12.9847C19.5399 12.6989 19.3906 12.2972 19.241 11.8295C18.9497 10.9187 18.625 9.65994 18.625 8.5C18.625 7.38568 18.9244 6.18249 19.2042 5.28689C19.2153 5.25117 19.211 5.20146 19.1803 5.15675C19.1666 5.13681 19.1542 5.12829 19.1501 5.12597L19.1495 5.12559C19.1495 5.12559 19.1485 5.125 19.145 5.125H5.88673ZM20.1133 20.875H6.85501C6.85149 20.875 6.85055 20.8744 6.85055 20.8744L6.84993 20.874C6.84578 20.8717 6.83337 20.8632 6.81968 20.8433C6.78897 20.7985 6.78467 20.7488 6.79582 20.7131C7.07559 19.8175 7.375 18.6143 7.375 17.5C7.375 16.3401 7.05034 15.0813 6.75903 14.1705C6.60944 13.7028 6.46012 13.3011 6.34783 13.0153C6.29156 12.8722 6.24425 12.7572 6.21039 12.6767C6.19346 12.6364 6.17986 12.6047 6.17017 12.5823L6.15861 12.5557L6.15515 12.5479L6.15402 12.5453L6.15342 12.544C6.15342 12.544 6.1533 12.5437 5.125 13C5.125 13 6.25 15.5352 6.25 17.5C6.25 18.4422 5.99129 19.5156 5.722 20.3777C5.47934 21.1545 6.04117 22 6.85501 22H20.1434C20.5883 22 20.991 21.7384 21.1472 21.322C21.4802 20.4347 22 18.8356 22 17.5C22 15.5352 20.875 13 20.875 13C19.8467 13.4563 19.8466 13.456 19.8466 13.456L19.8478 13.4589L19.8551 13.4756C19.8619 13.4913 19.8725 13.5159 19.8863 13.5488C19.914 13.6146 19.9545 13.7131 20.0037 13.8383C20.1024 14.0893 20.2343 14.4442 20.366 14.8559C20.6372 15.7039 20.875 16.6952 20.875 17.5C20.875 18.5943 20.4404 19.9941 20.1133 20.875Z\" fill=\"fuchsia\"/>\r\n<path d=\"M5.16556 13.0914C5.67971 12.8633 5.93679 12.7492 6.06534 12.6923C6.12961 12.6638 6.16173 12.6496 6.17775 12.6425C6.18578 12.639 6.18973 12.6372 6.19164 12.6364C6.19262 12.6359 6.19297 12.6358 6.19303 12.6358C6.1931 12.6357 6.19286 12.6358 6.19251 12.636C6.19241 12.636 6.19182 12.6363 6.19104 12.6366C6.19082 12.6367 6.1896 12.6372 6.18803 12.6378C6.18757 12.6379 6.18513 12.6388 6.18195 12.6398C6.17891 12.6406 6.17284 12.642 6.16981 12.6426C6.10596 12.632 6.062 12.5845 6.15342 12.544C6.24484 12.5034 6.20087 12.4559 6.13703 12.4453C6.134 12.4459 6.12792 12.4473 6.12489 12.4481C6.12171 12.4491 6.11926 12.45 6.1188 12.4501C6.11723 12.4507 6.11601 12.4512 6.11579 12.4513C6.115 12.4516 6.11439 12.4519 6.11426 12.4519C6.11385 12.4521 6.11348 12.4523 6.1133 12.4523C6.11286 12.4525 6.1122 12.4528 6.11117 12.4533C6.10906 12.4542 6.10496 12.456 6.09691 12.4596C6.08078 12.4667 6.0486 12.4809 5.98431 12.5094C5.85572 12.5664 5.59859 12.6804 5.08444 12.9086L5.16556 13.0914ZM19.8466 13.456C19.7551 13.4965 19.7968 13.5427 19.8577 13.5554C19.8614 13.5549 19.8687 13.5535 19.8724 13.5526C19.8763 13.5516 19.8793 13.5505 19.8798 13.5503C19.8818 13.5496 19.8833 13.549 19.8835 13.5489C19.8845 13.5485 19.8852 13.5482 19.8854 13.5481C19.8859 13.5479 19.8863 13.5477 19.8865 13.5477C19.887 13.5474 19.8877 13.5471 19.8887 13.5467C19.8909 13.5458 19.895 13.5439 19.903 13.5404C19.9192 13.5333 19.9514 13.519 20.0157 13.4905C20.1443 13.4336 20.4014 13.3196 20.9156 13.0914L20.8344 12.9086C20.3203 13.1367 20.0632 13.2507 19.9347 13.3077C19.8704 13.3362 19.8383 13.3504 19.8223 13.3574C19.8142 13.361 19.8103 13.3627 19.8084 13.3635C19.8079 13.3637 19.8076 13.3639 19.8074 13.364C19.8072 13.3641 19.8071 13.3641 19.8071 13.3641C19.8071 13.3641 19.8072 13.3641 19.8073 13.364C19.8073 13.364 19.8075 13.3639 19.8078 13.3638C19.8079 13.3638 19.8086 13.3635 19.8096 13.3631C19.8099 13.363 19.8113 13.3624 19.8133 13.3617C19.8138 13.3615 19.8168 13.3604 19.8207 13.3594C19.8244 13.3585 19.8317 13.3571 19.8354 13.3566C19.8963 13.3693 19.938 13.4155 19.8466 13.456ZM5.88673 5.125V4.925H5.74767L5.69925 5.05536L5.88673 5.125ZM5.63403 11.1441L5.82453 11.0832L5.63403 11.1441ZM5.99627 12.1617L6.18241 12.0885L5.99627 12.1617ZM6.11371 12.4512L6.29808 12.3737L6.29808 12.3737L6.11371 12.4512ZM6.1449 12.5244L5.96134 12.6038L5.96151 12.6042L6.1449 12.5244ZM6.15216 12.5411L5.96876 12.6209L5.96902 12.6215L6.15216 12.5411ZM6.15342 12.544L5.97028 12.6243L5.97056 12.625L6.15342 12.544ZM5.125 13L4.94219 13.0811L5.125 13ZM4.85276 4.67803L5.04001 4.74829L4.85276 4.67803ZM20.278 5.62233L20.0871 5.5627V5.5627L20.278 5.62233ZM20.875 13L20.6922 13.0811L20.875 13ZM19.8466 13.456L20.0297 13.3756L20.0295 13.3751L19.8466 13.456ZM19.8448 13.4521L19.6618 13.5326L19.6619 13.533L19.8448 13.4521ZM19.8414 13.4443L19.658 13.5241L19.6583 13.5247L19.8414 13.4443ZM19.8298 13.4177L19.6463 13.4971L19.6464 13.4975L19.8298 13.4177ZM19.7896 13.3233L19.6052 13.4008L19.7896 13.3233ZM19.6522 12.9847L19.466 13.0578L19.6522 12.9847ZM19.241 11.8295L19.4315 11.7686V11.7686L19.241 11.8295ZM19.2042 5.28689L19.0133 5.22725L19.0133 5.22726L19.2042 5.28689ZM19.1803 5.15675L19.0155 5.26997L19.0155 5.26997L19.1803 5.15675ZM19.1501 5.12597L19.0469 5.29744L19.0524 5.3005L19.1501 5.12597ZM19.1495 5.12559L19.0425 5.29463L19.0464 5.29698L19.1495 5.12559ZM20.1133 20.875V21.075H20.2523L20.3008 20.9446L20.1133 20.875ZM6.85055 20.8744L6.95747 20.7053L6.95377 20.7031L6.85055 20.8744ZM6.84993 20.874L6.95321 20.7026L6.94761 20.6995L6.84993 20.874ZM6.81968 20.8433L6.98454 20.73L6.98454 20.73L6.81968 20.8433ZM6.79582 20.7131L6.60492 20.6535H6.60492L6.79582 20.7131ZM6.75903 14.1705L6.56854 14.2314H6.56854L6.75903 14.1705ZM6.34783 13.0153L6.53397 12.9422L6.34783 13.0153ZM6.21039 12.6767L6.39476 12.5992L6.21039 12.6767ZM6.17017 12.5823L6.35373 12.5029L6.35356 12.5025L6.17017 12.5823ZM6.15861 12.5557L6.342 12.4759L6.34171 12.4753L6.15861 12.5557ZM6.15515 12.5479L6.33824 12.4674L6.3381 12.4671L6.15515 12.5479ZM6.15402 12.5453L6.33697 12.4645L6.33688 12.4643L6.15402 12.5453ZM5.722 20.3777L5.9129 20.4373L5.722 20.3777ZM21.1472 21.322L20.96 21.2517L21.1472 21.322ZM19.8478 13.4589L20.0312 13.3791L20.031 13.3785L19.8478 13.4589ZM19.8551 13.4756L20.0387 13.3962L20.0385 13.3958L19.8551 13.4756ZM19.8863 13.5488L19.7019 13.6263L19.7019 13.6263L19.8863 13.5488ZM20.0037 13.8383L19.8176 13.9115V13.9115L20.0037 13.8383ZM20.366 14.8559L20.5565 14.795V14.795L20.366 14.8559ZM5.325 8.5C5.325 7.44437 5.74775 6.07362 6.07422 5.19464L5.69925 5.05536C5.37138 5.9381 4.925 7.36708 4.925 8.5H5.325ZM5.82453 11.0832C5.55509 10.2407 5.325 9.27324 5.325 8.5H4.925C4.925 9.33645 5.17058 10.3515 5.44354 11.205L5.82453 11.0832ZM6.18241 12.0885C6.08497 11.8406 5.95459 11.4898 5.82453 11.0832L5.44354 11.205C5.57679 11.6217 5.71026 11.9807 5.81013 12.2348L6.18241 12.0885ZM6.29808 12.3737C6.27096 12.3092 6.23098 12.2121 6.18241 12.0885L5.81013 12.2348C5.85995 12.3616 5.90113 12.4616 5.92935 12.5287L6.29808 12.3737ZM6.32846 12.445C6.32194 12.4299 6.31163 12.4059 6.29808 12.3737L5.92935 12.5287C5.94345 12.5622 5.9543 12.5875 5.96134 12.6038L6.32846 12.445ZM6.33555 12.4613L6.3283 12.4446L5.96151 12.6042L5.96876 12.6209L6.33555 12.4613ZM6.33655 12.4636L6.33529 12.4607L5.96902 12.6215L5.97029 12.6243L6.33655 12.4636ZM5.125 13C5.30781 12.9189 5.30782 12.9189 5.30782 12.9189C5.30781 12.9189 5.30781 12.9189 5.3078 12.9189C5.30778 12.9188 5.30775 12.9187 5.3077 12.9186C5.30759 12.9184 5.30742 12.918 5.30718 12.9174C5.3067 12.9164 5.30595 12.9147 5.30495 12.9124C5.30295 12.9078 5.29992 12.9009 5.29593 12.8916C5.28795 12.8732 5.27613 12.8456 5.26103 12.8097C5.23081 12.7379 5.18747 12.6326 5.13536 12.5C5.0311 12.2347 4.89203 11.8606 4.75299 11.4259C4.47353 10.5521 4.2 9.45083 4.2 8.5H3.8C3.8 9.51396 4.08897 10.6627 4.37201 11.5477C4.51422 11.9924 4.6564 12.3749 4.76308 12.6463C4.81644 12.7821 4.86098 12.8903 4.89229 12.9647C4.90795 13.002 4.92031 13.0308 4.9288 13.0505C4.93305 13.0603 4.93634 13.0678 4.93859 13.0729C4.93972 13.0755 4.94059 13.0775 4.94119 13.0789C4.94149 13.0795 4.94173 13.0801 4.94189 13.0805C4.94198 13.0806 4.94204 13.0808 4.94209 13.0809C4.94212 13.081 4.94214 13.081 4.94215 13.081C4.94217 13.0811 4.94219 13.0811 5.125 13ZM4.2 8.5C4.2 7.20348 4.70775 5.63374 5.04001 4.74829L4.66551 4.60776C4.33188 5.49686 3.8 7.12539 3.8 8.5H4.2ZM5.04001 4.74829C5.1651 4.41495 5.48953 4.2 5.85657 4.2V3.8C5.33397 3.8 4.85298 4.10816 4.66551 4.60776L5.04001 4.74829ZM5.85657 4.2H19.145V3.8H5.85657V4.2ZM19.145 4.2C19.8096 4.2 20.2939 4.90066 20.0871 5.5627L20.4689 5.68196C20.7474 4.79037 20.1081 3.8 19.145 3.8V4.2ZM20.0871 5.5627C19.8159 6.43073 19.55 7.52719 19.55 8.5H19.95C19.95 7.58839 20.2015 6.53808 20.4689 5.68196L20.0871 5.5627ZM19.55 8.5C19.55 9.51396 19.839 10.6627 20.122 11.5477C20.2642 11.9924 20.4064 12.3749 20.5131 12.6463C20.5664 12.7821 20.611 12.8903 20.6423 12.9647C20.658 13.002 20.6703 13.0308 20.6788 13.0505C20.6831 13.0603 20.6863 13.0678 20.6886 13.0729C20.6897 13.0755 20.6906 13.0775 20.6912 13.0789C20.6915 13.0795 20.6917 13.0801 20.6919 13.0805C20.692 13.0806 20.692 13.0808 20.6921 13.0809C20.6921 13.081 20.6921 13.081 20.6922 13.081C20.6922 13.0811 20.6922 13.0811 20.875 13C21.0578 12.9189 21.0578 12.9189 21.0578 12.9189C21.0578 12.9189 21.0578 12.9189 21.0578 12.9189C21.0578 12.9188 21.0577 12.9187 21.0577 12.9186C21.0576 12.9184 21.0574 12.918 21.0572 12.9174C21.0567 12.9164 21.056 12.9147 21.055 12.9124C21.0529 12.9078 21.0499 12.9009 21.0459 12.8916C21.0379 12.8732 21.0261 12.8456 21.011 12.8097C20.9808 12.7379 20.9375 12.6326 20.8854 12.5C20.7811 12.2347 20.642 11.8606 20.503 11.4259C20.2235 10.5521 19.95 9.45083 19.95 8.5H19.55ZM19.6583 13.5247L19.6618 13.5326L20.0279 13.3717L20.0245 13.3638L19.6583 13.5247ZM19.6464 13.4975L19.658 13.5241L20.0248 13.3644L20.0132 13.3379L19.6464 13.4975ZM19.6052 13.4008C19.6225 13.4417 19.6363 13.4741 19.6463 13.4971L20.0134 13.3383C20.004 13.3165 19.9906 13.2854 19.974 13.2458L19.6052 13.4008ZM19.466 13.0578C19.5229 13.2026 19.5708 13.319 19.6052 13.4008L19.974 13.2458C19.9407 13.1666 19.894 13.0531 19.8383 12.9115L19.466 13.0578ZM19.0505 11.8904C19.2017 12.3631 19.3525 12.769 19.466 13.0578L19.8383 12.9115C19.7272 12.6289 19.5795 12.2313 19.4315 11.7686L19.0505 11.8904ZM18.425 8.5C18.425 9.69147 18.7574 10.9739 19.0505 11.8904L19.4315 11.7686C19.142 10.8634 18.825 9.62841 18.825 8.5H18.425ZM19.0133 5.22726C18.7316 6.12887 18.425 7.35511 18.425 8.5H18.825C18.825 7.41624 19.1172 6.23611 19.3951 5.34652L19.0133 5.22726ZM19.0155 5.26997C19.0136 5.2672 19.0114 5.26259 19.0104 5.25613C19.0095 5.25044 19.0091 5.24067 19.0133 5.22725L19.3951 5.34653C19.425 5.25061 19.4097 5.13739 19.3452 5.04352L19.0155 5.26997ZM19.0524 5.3005C19.0397 5.29337 19.0312 5.28657 19.0261 5.28185C19.0204 5.27661 19.0171 5.27237 19.0155 5.26997L19.3452 5.04352C19.3149 4.99937 19.2798 4.9694 19.2477 4.95144L19.0524 5.3005ZM19.0464 5.29698L19.047 5.29736L19.2531 4.95458L19.2525 4.9542L19.0464 5.29698ZM19.145 5.325C19.136 5.325 19.1222 5.32429 19.1055 5.32062C19.097 5.31875 19.0872 5.31598 19.0767 5.31186C19.0713 5.30979 19.0658 5.30736 19.0601 5.30451C19.0572 5.30308 19.0543 5.30154 19.0514 5.29989C19.0499 5.29907 19.0484 5.29821 19.0469 5.29733C19.0462 5.29688 19.0455 5.29643 19.0447 5.29598C19.0443 5.29575 19.044 5.29552 19.0436 5.29529C19.0434 5.29517 19.0432 5.29505 19.043 5.29494C19.0429 5.29488 19.0428 5.29479 19.0428 5.29476C19.0426 5.29467 19.0425 5.29458 19.1495 5.12559C19.2564 4.9566 19.2563 4.95652 19.2561 4.95643C19.2561 4.9564 19.256 4.95631 19.2559 4.95625C19.2557 4.95614 19.2555 4.95602 19.2553 4.9559C19.2549 4.95567 19.2546 4.95544 19.2542 4.95521C19.2534 4.95475 19.2527 4.9543 19.252 4.95386C19.2505 4.95297 19.249 4.95211 19.2475 4.95128C19.2446 4.94962 19.2416 4.94807 19.2387 4.94663C19.233 4.94374 19.2273 4.94126 19.2218 4.93914C19.211 4.93491 19.2007 4.932 19.1915 4.92997C19.1735 4.92601 19.1575 4.925 19.145 4.925V5.325ZM5.88673 5.325H19.145V4.925H5.88673V5.325ZM20.1133 20.675H6.85501V21.075H20.1133V20.675ZM6.85501 20.675C6.86399 20.675 6.87778 20.6757 6.89445 20.6794C6.90295 20.6812 6.91274 20.684 6.92331 20.6881C6.92861 20.6902 6.93416 20.6926 6.93988 20.6955C6.94274 20.6969 6.94564 20.6984 6.94857 20.7001C6.95004 20.7009 6.95151 20.7018 6.95299 20.7026C6.95373 20.7031 6.95447 20.7035 6.95522 20.704C6.95559 20.7042 6.95596 20.7044 6.95633 20.7047C6.95652 20.7048 6.9567 20.7049 6.95689 20.705C6.95698 20.7051 6.95712 20.7052 6.95717 20.7052C6.95731 20.7053 6.95745 20.7054 6.85055 20.8744C6.74365 21.0434 6.74379 21.0435 6.74393 21.0436C6.74397 21.0436 6.74411 21.0437 6.74421 21.0438C6.74439 21.0439 6.74458 21.044 6.74476 21.0441C6.74514 21.0444 6.74551 21.0446 6.74588 21.0448C6.74662 21.0453 6.74737 21.0457 6.74811 21.0462C6.74959 21.0471 6.75107 21.0479 6.75255 21.0487C6.75549 21.0504 6.75842 21.052 6.76131 21.0534C6.76709 21.0563 6.77274 21.0588 6.77819 21.0609C6.78905 21.0651 6.79929 21.068 6.80847 21.07C6.82648 21.074 6.84251 21.075 6.85501 21.075V20.675ZM6.95377 20.7031L6.95315 20.7027L6.7467 21.0453L6.74732 21.0457L6.95377 20.7031ZM6.94761 20.6995C6.96034 20.7066 6.96876 20.7134 6.97389 20.7182C6.97957 20.7234 6.9829 20.7276 6.98454 20.73L6.65481 20.9565C6.68514 21.0006 6.72016 21.0306 6.75225 21.0486L6.94761 20.6995ZM6.98454 20.73C6.98644 20.7328 6.98863 20.7374 6.98964 20.7439C6.99053 20.7496 6.99092 20.7593 6.98673 20.7727L6.60492 20.6535C6.57496 20.7494 6.59035 20.8626 6.65481 20.9565L6.98454 20.73ZM6.98672 20.7727C7.26837 19.8711 7.575 18.6449 7.575 17.5H7.175C7.175 18.5838 6.88281 19.7639 6.60492 20.6535L6.98672 20.7727ZM7.575 17.5C7.575 16.3085 7.24264 15.0261 6.94953 14.1096L6.56854 14.2314C6.85804 15.1366 7.175 16.3716 7.175 17.5H7.575ZM6.94953 14.1096C6.79834 13.6369 6.64747 13.231 6.53397 12.9422L6.16169 13.0885C6.27276 13.3711 6.42054 13.7687 6.56854 14.2314L6.94953 14.1096ZM6.53397 12.9422C6.47707 12.7974 6.42916 12.681 6.39476 12.5992L6.02603 12.7542C6.05933 12.8334 6.10604 12.9469 6.16169 13.0885L6.53397 12.9422ZM6.39476 12.5992C6.37755 12.5583 6.36369 12.5259 6.35373 12.5029L5.98661 12.6617C5.99604 12.6835 6.00937 12.7146 6.02603 12.7542L6.39476 12.5992ZM6.35356 12.5025L6.342 12.4759L5.97522 12.6356L5.98678 12.6621L6.35356 12.5025ZM6.34171 12.4753L6.33824 12.4674L5.97206 12.6283L5.97552 12.6362L6.34171 12.4753ZM6.3381 12.4671L6.33697 12.4645L5.97107 12.6261L5.9722 12.6287L6.3381 12.4671ZM6.33688 12.4643L6.33628 12.4629L5.97056 12.625L5.97116 12.6263L6.33688 12.4643ZM6.45 17.5C6.45 16.486 6.16103 15.3373 5.87799 14.4523C5.73578 14.0076 5.5936 13.6251 5.48692 13.3537C5.43356 13.2179 5.38902 13.1097 5.35771 13.0353C5.34205 12.998 5.32969 12.9692 5.3212 12.9495C5.31695 12.9397 5.31366 12.9322 5.31141 12.9271C5.31028 12.9245 5.30941 12.9225 5.30881 12.9211C5.30851 12.9205 5.30827 12.9199 5.30811 12.9195C5.30802 12.9194 5.30796 12.9192 5.30791 12.9191C5.30788 12.919 5.30786 12.919 5.30784 12.919C5.30783 12.9189 5.30781 12.9189 5.125 13C4.94219 13.0811 4.94218 13.0811 4.94218 13.0811C4.94219 13.0811 4.94219 13.0811 4.9422 13.0811C4.94222 13.0812 4.94225 13.0813 4.9423 13.0814C4.94241 13.0816 4.94258 13.082 4.94282 13.0826C4.9433 13.0836 4.94405 13.0853 4.94505 13.0876C4.94705 13.0922 4.95008 13.0991 4.95407 13.1084C4.96205 13.1268 4.97387 13.1544 4.98897 13.1903C5.01919 13.2621 5.06253 13.3674 5.11464 13.5C5.2189 13.7653 5.35797 14.1394 5.49701 14.5741C5.77647 15.4479 6.05 16.5492 6.05 17.5H6.45ZM5.9129 20.4373C6.18405 19.5693 6.45 18.4728 6.45 17.5H6.05C6.05 18.4116 5.79852 19.4619 5.53109 20.318L5.9129 20.4373ZM6.85501 21.8C6.19042 21.8 5.70609 21.0993 5.9129 20.4373L5.53109 20.318C5.25258 21.2096 5.89193 22.2 6.85501 22.2V21.8ZM20.1434 21.8H6.85501V22.2H20.1434V21.8ZM20.96 21.2517C20.8349 21.585 20.5105 21.8 20.1434 21.8V22.2C20.666 22.2 21.147 21.8918 21.3345 21.3922L20.96 21.2517ZM21.8 17.5C21.8 18.7965 21.2922 20.3663 20.96 21.2517L21.3345 21.3922C21.6681 20.5031 22.2 18.8746 22.2 17.5H21.8ZM20.875 13C20.6922 13.0811 20.6922 13.0811 20.6922 13.0811C20.6922 13.0811 20.6922 13.0811 20.6922 13.0811C20.6922 13.0812 20.6923 13.0813 20.6923 13.0814C20.6924 13.0816 20.6926 13.082 20.6928 13.0826C20.6933 13.0836 20.694 13.0853 20.695 13.0876C20.6971 13.0922 20.7001 13.0991 20.7041 13.1084C20.7121 13.1268 20.7239 13.1544 20.739 13.1903C20.7692 13.2621 20.8125 13.3674 20.8646 13.5C20.9689 13.7653 21.108 14.1394 21.247 14.5741C21.5265 15.4479 21.8 16.5492 21.8 17.5H22.2C22.2 16.486 21.911 15.3373 21.628 14.4523C21.4858 14.0076 21.3436 13.6251 21.2369 13.3537C21.1836 13.2179 21.139 13.1097 21.1077 13.0353C21.092 12.998 21.0797 12.9692 21.0712 12.9495C21.0669 12.9397 21.0637 12.9322 21.0614 12.9271C21.0603 12.9245 21.0594 12.9225 21.0588 12.9211C21.0585 12.9205 21.0583 12.9199 21.0581 12.9195C21.058 12.9194 21.058 12.9192 21.0579 12.9191C21.0579 12.919 21.0579 12.919 21.0578 12.919C21.0578 12.9189 21.0578 12.9189 20.875 13ZM19.6634 13.5364L19.6647 13.5393L20.031 13.3785L20.0297 13.3756L19.6634 13.5364ZM19.6644 13.5387L19.6717 13.5554L20.0385 13.3958L20.0312 13.3791L19.6644 13.5387ZM19.6715 13.555C19.6781 13.5701 19.6884 13.5941 19.7019 13.6263L20.0707 13.4713C20.0565 13.4378 20.0457 13.4125 20.0387 13.3962L19.6715 13.555ZM19.7019 13.6263C19.729 13.6908 19.769 13.7879 19.8176 13.9115L20.1899 13.7652C20.14 13.6384 20.0989 13.5384 20.0707 13.4713L19.7019 13.6263ZM19.8176 13.9115C19.915 14.1594 20.0454 14.5102 20.1755 14.9168L20.5565 14.795C20.4232 14.3783 20.2897 14.0193 20.1899 13.7652L19.8176 13.9115ZM20.1755 14.9168C20.4449 15.7593 20.675 16.7268 20.675 17.5H21.075C21.075 16.6635 20.8294 15.6485 20.5565 14.795L20.1755 14.9168ZM20.675 17.5C20.675 18.5556 20.2523 19.9264 19.9258 20.8054L20.3008 20.9446C20.6286 20.0619 21.075 18.6329 21.075 17.5H20.675ZM19.6619 13.533L19.6636 13.5369L20.0295 13.3751L20.0278 13.3713L19.6619 13.533Z\" fill=\"fuchsia\" mask=\"url(#path-2-outside-1_61_6770)\"/>\r\n<path d=\"M7.375 7.375H16.375V8.69853H7.375V7.375Z\" fill=\"fuchsia\"/>\r\n<path d=\"M7.9375 10.6838H16.9375V12.0074H7.9375V10.6838Z\" fill=\"fuchsia\"/>\r\n<path d=\"M9.0625 13.9926H18.0625V15.3162H9.0625V13.9926Z\" fill=\"fuchsia\"/>\r\n<path d=\"M9.625 17.3015H18.625V18.625H9.625V17.3015Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var send = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M3.76232 6.42905L12.9994 11.2709L22.2375 6.42854C21.8971 6.16015 21.4674 6 21.0002 6H5.00024C4.53281 6 4.10283 6.16035 3.76232 6.42905Z\" fill=\"fuchsia\"/>\r\n<path d=\"M23.0002 8.28684L13.9279 13.0423C13.3465 13.3471 12.6524 13.3471 12.0709 13.0423L3.00024 8.2877V19C3.00024 20.1046 3.89568 21 5.00024 21H21.0002C22.1048 21 23.0002 20.1046 23.0002 19V8.28684Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var service = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<mask id=\"path-2-outside-1_61_6764\" maskUnits=\"userSpaceOnUse\" x=\"1\" y=\"3\" width=\"24\" height=\"21\" fill=\"black\">\r\n<rect fill=\"white\" x=\"1\" y=\"3\" width=\"24\" height=\"21\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M14.4942 18.1187C15.0482 18.4774 15.6995 18.6688 16.3657 18.6688C16.8094 18.6732 17.2494 18.5918 17.6602 18.4292C18.0709 18.2667 18.4441 18.0264 18.7578 17.7224C19.0715 17.4184 19.3195 17.0568 19.4872 16.6587C19.6548 16.2607 19.7389 15.8342 19.7344 15.4043C19.7344 14.7586 19.5368 14.1275 19.1667 13.5906C18.7965 13.0538 18.2704 12.6354 17.6549 12.3883C17.0393 12.1412 16.362 12.0765 15.7086 12.2025C15.0551 12.3285 14.4549 12.6394 13.9837 13.0959C13.5126 13.5525 13.1918 14.1342 13.0618 14.7674C12.9318 15.4007 12.9985 16.0571 13.2535 16.6536C13.5085 17.2501 13.9402 17.76 14.4942 18.1187ZM15.4982 13.38C15.7738 13.273 16.0689 13.2213 16.3657 13.228C16.6626 13.2213 16.9577 13.273 17.2333 13.38C17.5089 13.487 17.7592 13.647 17.9691 13.8505C18.1791 14.0539 18.3442 14.2965 18.4547 14.5636C18.5651 14.8307 18.6184 15.1167 18.6115 15.4043C18.6184 15.6919 18.5651 15.978 18.4547 16.245C18.3442 16.5121 18.1791 16.7547 17.9691 16.9581C17.7592 17.1616 17.5089 17.3217 17.2333 17.4287C16.9577 17.5357 16.6626 17.5874 16.3657 17.5807C16.0689 17.5874 15.7738 17.5357 15.4982 17.4287C15.2226 17.3217 14.9723 17.1616 14.7623 16.9581C14.5524 16.7547 14.3872 16.5121 14.2768 16.245C14.1664 15.978 14.1131 15.6919 14.12 15.4043C14.1131 15.1167 14.1664 14.8307 14.2768 14.5636C14.3872 14.2965 14.5524 14.0539 14.7623 13.8505C14.9723 13.647 15.2226 13.487 15.4982 13.38Z\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8.32587 19.1912H9.54775L8.89854 18.1248L8.30341 18.1248L7.90479 16.1932C7.35369 15.9928 6.84126 15.704 6.38889 15.339L4.45753 15.9484L3.13252 13.772L4.65965 12.4662C4.55584 11.903 4.55584 11.3264 4.65965 10.7632L3.13252 9.41933L4.45753 7.24297L6.38328 7.87412C6.83408 7.50408 7.3493 7.21482 7.90479 7.0199L8.30341 5.06662H10.9534L11.352 6.99813C11.9031 7.19859 12.4156 7.48735 12.8679 7.85235L14.7993 7.24297L15.1438 7.80883L15.0407 7.80882C14.7773 7.80393 14.5204 7.889 14.3151 8.04915C14.1098 8.2093 13.9692 8.43431 13.9179 8.68481L13.6315 10.0559C13.3755 10.1759 13.1279 10.3123 12.8904 10.464L12.772 10.4225C12.683 10.1985 12.5684 9.98363 12.4294 9.78201C12.0592 9.24516 11.5331 8.82674 10.9175 8.57965C10.302 8.33257 9.62468 8.26792 8.97123 8.39388C8.31777 8.51984 7.71753 8.83076 7.24642 9.28731C6.7753 9.74387 6.45447 10.3256 6.32449 10.9588C6.19451 11.5921 6.26122 12.2485 6.51618 12.845C6.77115 13.4415 7.20292 13.9513 7.75689 14.3101C8.31087 14.6688 8.96216 14.8602 9.62842 14.8602C9.76 14.8615 9.89127 14.8553 10.0216 14.8416L9.12873 14.0496C8.99776 13.9383 8.89621 13.7999 8.83074 13.6458C8.80732 13.6376 8.78404 13.629 8.76089 13.62C8.48529 13.513 8.23496 13.353 8.02502 13.1495C7.81509 12.9461 7.64992 12.7035 7.53951 12.4364C7.4291 12.1693 7.37573 11.8833 7.38265 11.5957C7.37573 11.3081 7.4291 11.022 7.53951 10.755C7.64992 10.4879 7.81509 10.2453 8.02502 10.0419C8.23496 9.83841 8.48529 9.67835 8.76089 9.57134C9.03648 9.46434 9.33161 9.41263 9.62842 9.41933C9.92523 9.41263 10.2204 9.46434 10.496 9.57134C10.7356 9.66438 10.9561 9.79753 11.1476 9.96444C10.9671 9.97198 10.7909 10.0216 10.6341 10.1095C10.4636 10.205 10.322 10.3422 10.2236 10.5075L8.89855 12.6839C8.76751 12.902 8.71881 13.1576 8.7608 13.4067C8.8028 13.6559 8.93285 13.8832 9.12873 14.0496L10.1899 14.9908V15.8233L9.12874 16.7373C8.92734 16.9049 8.79371 17.1362 8.75157 17.3902C8.70943 17.6442 8.76149 17.9045 8.89854 18.1248L10.2236 20.3011C10.322 20.4664 10.4636 20.6036 10.6341 20.6991C10.8045 20.7946 10.9979 20.845 11.1949 20.8452C11.3169 20.8461 11.4383 20.8277 11.5542 20.7908L12.9185 20.3446C13.154 20.4963 13.3997 20.6327 13.654 20.7527L13.9403 22.1238C13.9917 22.3743 14.1323 22.5993 14.3376 22.7595C14.5428 22.9196 14.7997 23.0047 15.0632 22.9998H17.7132C17.9767 23.0047 18.2336 22.9196 18.4388 22.7595C18.6441 22.5993 18.7848 22.3743 18.8361 22.1238L19.1224 20.7527C19.3785 20.6327 19.6261 20.4964 19.8635 20.3446L21.2222 20.7908C21.3382 20.8277 21.4595 20.8461 21.5815 20.8452C21.7785 20.845 21.9719 20.7946 22.1423 20.6991C22.3128 20.6036 22.4544 20.4664 22.5528 20.3011L23.8329 18.1248C23.964 17.9066 24.0127 17.651 23.9707 17.4019C23.9287 17.1528 23.7986 16.9255 23.6027 16.7591L22.5416 15.8178V14.9854L23.6196 14.0713C23.8183 13.9016 23.9487 13.6692 23.9877 13.4153C24.0268 13.1615 23.9719 12.9024 23.8329 12.6839L22.5079 10.5075C22.4095 10.3422 22.2679 10.205 22.0974 10.1095C21.9269 10.014 21.7335 9.96361 21.5366 9.96342C21.4146 9.96251 21.2932 9.98089 21.1773 10.0178L19.813 10.464C19.5775 10.3123 19.3317 10.176 19.0775 10.0559L18.7912 8.68481C18.7398 8.43431 18.5992 8.2093 18.3939 8.04915C18.1886 7.889 17.9318 7.80393 17.6683 7.80882L16.4464 7.80883L15.7706 6.69888C15.6721 6.53362 15.5306 6.39636 15.3601 6.30086C15.1896 6.20536 14.9962 6.15499 14.7993 6.15479C14.6773 6.15389 14.5559 6.17227 14.44 6.2092L13.0757 6.65536C12.8401 6.50367 12.5944 6.36734 12.3402 6.24729L12.0539 4.87618C12.0025 4.62569 11.8619 4.40067 11.6566 4.24053C11.4513 4.08038 11.1945 3.99531 10.931 4.0002H8.30341C8.03993 3.99531 7.78306 4.08038 7.57777 4.24053C7.37249 4.40067 7.23187 4.62569 7.18053 4.87618L6.89419 6.24729C6.63814 6.36732 6.39056 6.50364 6.15309 6.65536L4.81685 6.18744C4.69968 6.15785 4.57834 6.14683 4.45753 6.15479C4.26062 6.15499 4.06722 6.20536 3.89674 6.30086C3.72626 6.39636 3.58469 6.53362 3.48623 6.69888L2.16123 8.87524C2.03018 9.09342 1.98148 9.34896 2.02348 9.5981C2.06547 9.84724 2.19554 10.0745 2.39142 10.2409L3.45255 11.1822V12.0146L2.39142 12.9287C2.19001 13.0963 2.05638 13.3276 2.01424 13.5816C1.9721 13.8356 2.02418 14.0958 2.16123 14.3161L3.48623 16.4925C3.58469 16.6578 3.72626 16.795 3.89674 16.8905C4.06722 16.986 4.26062 17.0364 4.45753 17.0366C4.57956 17.0375 4.70092 17.0191 4.81685 16.9822L6.18116 16.536C6.41671 16.6877 6.66241 16.824 6.91665 16.9441L7.20299 18.3152C7.25433 18.5657 7.39495 18.7907 7.60023 18.9508C7.80552 19.111 8.06238 19.1961 8.32587 19.1912ZM19.6109 19.1259L21.5366 19.757L22.8616 17.5807L21.3345 16.2368C21.4383 15.6736 21.4383 15.097 21.3345 14.5338L22.8616 13.228L21.5366 11.0516L19.6053 11.661C19.1529 11.296 18.6405 11.0072 18.0894 10.8068L17.6908 8.87524H15.0407L14.6421 10.8285C14.0866 11.0234 13.5714 11.3127 13.1206 11.6827L11.1949 11.0516L9.86985 13.228L11.397 14.5719C11.2932 15.1351 11.2932 15.7116 11.397 16.2749L9.86985 17.5807L11.1949 19.757L13.1262 19.1476C13.5786 19.5127 14.091 19.8014 14.6421 20.0019L15.0407 21.9334H17.6908L18.0894 19.9801C18.6449 19.7852 19.1601 19.4959 19.6109 19.1259Z\"/>\r\n</mask>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M14.4942 18.1187C15.0482 18.4774 15.6995 18.6688 16.3657 18.6688C16.8094 18.6732 17.2494 18.5918 17.6602 18.4292C18.0709 18.2667 18.4441 18.0264 18.7578 17.7224C19.0715 17.4184 19.3195 17.0568 19.4872 16.6587C19.6548 16.2607 19.7389 15.8342 19.7344 15.4043C19.7344 14.7586 19.5368 14.1275 19.1667 13.5906C18.7965 13.0538 18.2704 12.6354 17.6549 12.3883C17.0393 12.1412 16.362 12.0765 15.7086 12.2025C15.0551 12.3285 14.4549 12.6394 13.9837 13.0959C13.5126 13.5525 13.1918 14.1342 13.0618 14.7674C12.9318 15.4007 12.9985 16.0571 13.2535 16.6536C13.5085 17.2501 13.9402 17.76 14.4942 18.1187ZM15.4982 13.38C15.7738 13.273 16.0689 13.2213 16.3657 13.228C16.6626 13.2213 16.9577 13.273 17.2333 13.38C17.5089 13.487 17.7592 13.647 17.9691 13.8505C18.1791 14.0539 18.3442 14.2965 18.4547 14.5636C18.5651 14.8307 18.6184 15.1167 18.6115 15.4043C18.6184 15.6919 18.5651 15.978 18.4547 16.245C18.3442 16.5121 18.1791 16.7547 17.9691 16.9581C17.7592 17.1616 17.5089 17.3217 17.2333 17.4287C16.9577 17.5357 16.6626 17.5874 16.3657 17.5807C16.0689 17.5874 15.7738 17.5357 15.4982 17.4287C15.2226 17.3217 14.9723 17.1616 14.7623 16.9581C14.5524 16.7547 14.3872 16.5121 14.2768 16.245C14.1664 15.978 14.1131 15.6919 14.12 15.4043C14.1131 15.1167 14.1664 14.8307 14.2768 14.5636C14.3872 14.2965 14.5524 14.0539 14.7623 13.8505C14.9723 13.647 15.2226 13.487 15.4982 13.38Z\" fill=\"fuchsia\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8.32587 19.1912H9.54775L8.89854 18.1248L8.30341 18.1248L7.90479 16.1932C7.35369 15.9928 6.84126 15.704 6.38889 15.339L4.45753 15.9484L3.13252 13.772L4.65965 12.4662C4.55584 11.903 4.55584 11.3264 4.65965 10.7632L3.13252 9.41933L4.45753 7.24297L6.38328 7.87412C6.83408 7.50408 7.3493 7.21482 7.90479 7.0199L8.30341 5.06662H10.9534L11.352 6.99813C11.9031 7.19859 12.4156 7.48735 12.8679 7.85235L14.7993 7.24297L15.1438 7.80883L15.0407 7.80882C14.7773 7.80393 14.5204 7.889 14.3151 8.04915C14.1098 8.2093 13.9692 8.43431 13.9179 8.68481L13.6315 10.0559C13.3755 10.1759 13.1279 10.3123 12.8904 10.464L12.772 10.4225C12.683 10.1985 12.5684 9.98363 12.4294 9.78201C12.0592 9.24516 11.5331 8.82674 10.9175 8.57965C10.302 8.33257 9.62468 8.26792 8.97123 8.39388C8.31777 8.51984 7.71753 8.83076 7.24642 9.28731C6.7753 9.74387 6.45447 10.3256 6.32449 10.9588C6.19451 11.5921 6.26122 12.2485 6.51618 12.845C6.77115 13.4415 7.20292 13.9513 7.75689 14.3101C8.31087 14.6688 8.96216 14.8602 9.62842 14.8602C9.76 14.8615 9.89127 14.8553 10.0216 14.8416L9.12873 14.0496C8.99776 13.9383 8.89621 13.7999 8.83074 13.6458C8.80732 13.6376 8.78404 13.629 8.76089 13.62C8.48529 13.513 8.23496 13.353 8.02502 13.1495C7.81509 12.9461 7.64992 12.7035 7.53951 12.4364C7.4291 12.1693 7.37573 11.8833 7.38265 11.5957C7.37573 11.3081 7.4291 11.022 7.53951 10.755C7.64992 10.4879 7.81509 10.2453 8.02502 10.0419C8.23496 9.83841 8.48529 9.67835 8.76089 9.57134C9.03648 9.46434 9.33161 9.41263 9.62842 9.41933C9.92523 9.41263 10.2204 9.46434 10.496 9.57134C10.7356 9.66438 10.9561 9.79753 11.1476 9.96444C10.9671 9.97198 10.7909 10.0216 10.6341 10.1095C10.4636 10.205 10.322 10.3422 10.2236 10.5075L8.89855 12.6839C8.76751 12.902 8.71881 13.1576 8.7608 13.4067C8.8028 13.6559 8.93285 13.8832 9.12873 14.0496L10.1899 14.9908V15.8233L9.12874 16.7373C8.92734 16.9049 8.79371 17.1362 8.75157 17.3902C8.70943 17.6442 8.76149 17.9045 8.89854 18.1248L10.2236 20.3011C10.322 20.4664 10.4636 20.6036 10.6341 20.6991C10.8045 20.7946 10.9979 20.845 11.1949 20.8452C11.3169 20.8461 11.4383 20.8277 11.5542 20.7908L12.9185 20.3446C13.154 20.4963 13.3997 20.6327 13.654 20.7527L13.9403 22.1238C13.9917 22.3743 14.1323 22.5993 14.3376 22.7595C14.5428 22.9196 14.7997 23.0047 15.0632 22.9998H17.7132C17.9767 23.0047 18.2336 22.9196 18.4388 22.7595C18.6441 22.5993 18.7848 22.3743 18.8361 22.1238L19.1224 20.7527C19.3785 20.6327 19.6261 20.4964 19.8635 20.3446L21.2222 20.7908C21.3382 20.8277 21.4595 20.8461 21.5815 20.8452C21.7785 20.845 21.9719 20.7946 22.1423 20.6991C22.3128 20.6036 22.4544 20.4664 22.5528 20.3011L23.8329 18.1248C23.964 17.9066 24.0127 17.651 23.9707 17.4019C23.9287 17.1528 23.7986 16.9255 23.6027 16.7591L22.5416 15.8178V14.9854L23.6196 14.0713C23.8183 13.9016 23.9487 13.6692 23.9877 13.4153C24.0268 13.1615 23.9719 12.9024 23.8329 12.6839L22.5079 10.5075C22.4095 10.3422 22.2679 10.205 22.0974 10.1095C21.9269 10.014 21.7335 9.96361 21.5366 9.96342C21.4146 9.96251 21.2932 9.98089 21.1773 10.0178L19.813 10.464C19.5775 10.3123 19.3317 10.176 19.0775 10.0559L18.7912 8.68481C18.7398 8.43431 18.5992 8.2093 18.3939 8.04915C18.1886 7.889 17.9318 7.80393 17.6683 7.80882L16.4464 7.80883L15.7706 6.69888C15.6721 6.53362 15.5306 6.39636 15.3601 6.30086C15.1896 6.20536 14.9962 6.15499 14.7993 6.15479C14.6773 6.15389 14.5559 6.17227 14.44 6.2092L13.0757 6.65536C12.8401 6.50367 12.5944 6.36734 12.3402 6.24729L12.0539 4.87618C12.0025 4.62569 11.8619 4.40067 11.6566 4.24053C11.4513 4.08038 11.1945 3.99531 10.931 4.0002H8.30341C8.03993 3.99531 7.78306 4.08038 7.57777 4.24053C7.37249 4.40067 7.23187 4.62569 7.18053 4.87618L6.89419 6.24729C6.63814 6.36732 6.39056 6.50364 6.15309 6.65536L4.81685 6.18744C4.69968 6.15785 4.57834 6.14683 4.45753 6.15479C4.26062 6.15499 4.06722 6.20536 3.89674 6.30086C3.72626 6.39636 3.58469 6.53362 3.48623 6.69888L2.16123 8.87524C2.03018 9.09342 1.98148 9.34896 2.02348 9.5981C2.06547 9.84724 2.19554 10.0745 2.39142 10.2409L3.45255 11.1822V12.0146L2.39142 12.9287C2.19001 13.0963 2.05638 13.3276 2.01424 13.5816C1.9721 13.8356 2.02418 14.0958 2.16123 14.3161L3.48623 16.4925C3.58469 16.6578 3.72626 16.795 3.89674 16.8905C4.06722 16.986 4.26062 17.0364 4.45753 17.0366C4.57956 17.0375 4.70092 17.0191 4.81685 16.9822L6.18116 16.536C6.41671 16.6877 6.66241 16.824 6.91665 16.9441L7.20299 18.3152C7.25433 18.5657 7.39495 18.7907 7.60023 18.9508C7.80552 19.111 8.06238 19.1961 8.32587 19.1912ZM19.6109 19.1259L21.5366 19.757L22.8616 17.5807L21.3345 16.2368C21.4383 15.6736 21.4383 15.097 21.3345 14.5338L22.8616 13.228L21.5366 11.0516L19.6053 11.661C19.1529 11.296 18.6405 11.0072 18.0894 10.8068L17.6908 8.87524H15.0407L14.6421 10.8285C14.0866 11.0234 13.5714 11.3127 13.1206 11.6827L11.1949 11.0516L9.86985 13.228L11.397 14.5719C11.2932 15.1351 11.2932 15.7116 11.397 16.2749L9.86985 17.5807L11.1949 19.757L13.1262 19.1476C13.5786 19.5127 14.091 19.8014 14.6421 20.0019L15.0407 21.9334H17.6908L18.0894 19.9801C18.6449 19.7852 19.1601 19.4959 19.6109 19.1259Z\" fill=\"fuchsia\"/>\r\n<path d=\"M9.54775 19.1912V19.3912H9.90366L9.71858 19.0872L9.54775 19.1912ZM8.32587 19.1912V18.9911L8.32216 18.9912L8.32587 19.1912ZM8.89854 18.1248L9.06937 18.0208L9.06836 18.0192L8.89854 18.1248ZM8.30341 18.1248L8.10754 18.1652L8.14047 18.3247L8.30339 18.3248L8.30341 18.1248ZM7.90479 16.1932L8.10066 16.1528L8.07809 16.0435L7.97315 16.0053L7.90479 16.1932ZM6.38889 15.339L6.51448 15.1834L6.43101 15.116L6.32871 15.1483L6.38889 15.339ZM4.45753 15.9484L4.2867 16.0524L4.36822 16.1863L4.51771 16.1391L4.45753 15.9484ZM3.13252 13.772L3.00255 13.62L2.87318 13.7307L2.96169 13.876L3.13252 13.772ZM4.65965 12.4662L4.78963 12.6182L4.87723 12.5433L4.85634 12.43L4.65965 12.4662ZM4.65965 10.7632L4.85634 10.7995L4.87689 10.688L4.79178 10.6131L4.65965 10.7632ZM3.13252 9.41933L2.96169 9.31533L2.87445 9.45863L3.0004 9.56947L3.13252 9.41933ZM4.45753 7.24297L4.51982 7.05292L4.36915 7.00354L4.2867 7.13897L4.45753 7.24297ZM6.38328 7.87412L6.32099 8.06417L6.42531 8.09836L6.51017 8.02871L6.38328 7.87412ZM7.90479 7.0199L7.97101 7.20862L8.07806 7.17105L8.10075 7.05989L7.90479 7.0199ZM8.30341 5.06662V4.86662H8.14011L8.10745 5.02662L8.30341 5.06662ZM10.9534 5.06662L11.1493 5.02619L11.1164 4.86662H10.9534V5.06662ZM11.352 6.99813L11.1562 7.03856L11.1787 7.14792L11.2837 7.18609L11.352 6.99813ZM12.8679 7.85235L12.7424 8.008L12.8258 8.07536L12.9281 8.04308L12.8679 7.85235ZM14.7993 7.24297L14.9701 7.13897L14.8886 7.00507L14.7391 7.05224L14.7993 7.24297ZM15.1438 7.80883L15.1438 8.00883L15.4997 8.00884L15.3146 7.70482L15.1438 7.80883ZM15.0407 7.80882L15.037 8.00882H15.0407L15.0407 7.80882ZM14.3151 8.04915L14.4381 8.20684H14.4381L14.3151 8.04915ZM13.9179 8.68481L14.1136 8.72569L14.1138 8.72497L13.9179 8.68481ZM13.6315 10.0559L13.7164 10.237L13.8069 10.1946L13.8273 10.0968L13.6315 10.0559ZM12.8904 10.464L12.8243 10.6527L12.9161 10.6849L12.9981 10.6325L12.8904 10.464ZM12.772 10.4225L12.5862 10.4964L12.6199 10.5812L12.706 10.6113L12.772 10.4225ZM12.4294 9.78201L12.2647 9.89554H12.2647L12.4294 9.78201ZM10.9175 8.57965L10.843 8.76526L10.9175 8.57965ZM8.97123 8.39388L9.00908 8.59026L8.97123 8.39388ZM6.51618 12.845L6.70009 12.7664L6.51618 12.845ZM9.62842 14.8602L9.63039 14.6602H9.62842V14.8602ZM10.0216 14.8416L10.0424 15.0405L10.4938 14.9931L10.1543 14.692L10.0216 14.8416ZM9.12873 14.0496L9.26147 13.8999L9.25823 13.8972L9.12873 14.0496ZM8.83074 13.6458L9.0148 13.5676L8.98024 13.4863L8.89688 13.4571L8.83074 13.6458ZM8.76089 13.62L8.83327 13.4336L8.83327 13.4336L8.76089 13.62ZM7.53951 12.4364L7.35468 12.5128L7.53951 12.4364ZM7.38265 11.5957L7.58282 11.6005L7.58259 11.5909L7.38265 11.5957ZM9.62842 9.41933L9.6239 9.61948L9.63293 9.61928L9.62842 9.41933ZM10.496 9.57134L10.5683 9.3849L10.496 9.57134ZM11.1476 9.96444L11.1559 10.1643L11.6572 10.1433L11.279 9.81367L11.1476 9.96444ZM10.6341 10.1095L10.7318 10.284V10.284L10.6341 10.1095ZM10.2236 10.5075L10.3944 10.6115L10.3954 10.6099L10.2236 10.5075ZM8.89855 12.6839L8.72772 12.5799L8.7271 12.5809L8.89855 12.6839ZM10.1899 14.9908H10.3899V14.9009L10.3226 14.8412L10.1899 14.9908ZM10.1899 15.8233L10.3204 15.9748L10.3899 15.9149V15.8233H10.1899ZM9.12874 16.7373L9.25668 16.8911L9.25928 16.8889L9.12874 16.7373ZM8.75157 17.3902L8.55426 17.3575L8.75157 17.3902ZM10.2236 20.3011L10.3954 20.1987L10.3944 20.1971L10.2236 20.3011ZM11.1949 20.8452L11.1963 20.6452L11.1951 20.6452L11.1949 20.8452ZM11.5542 20.7908L11.6149 20.9814L11.6163 20.9809L11.5542 20.7908ZM12.9185 20.3446L13.0268 20.1765L12.9468 20.125L12.8563 20.1545L12.9185 20.3446ZM13.654 20.7527L13.8498 20.7118L13.8294 20.6144L13.7394 20.5719L13.654 20.7527ZM13.9403 22.1238L14.1362 22.0837L14.1361 22.0829L13.9403 22.1238ZM15.0632 22.9998V22.7998L15.0595 22.7998L15.0632 22.9998ZM17.7132 22.9998L17.7169 22.7998H17.7132V22.9998ZM18.8361 22.1238L18.6403 22.0829L18.6402 22.0837L18.8361 22.1238ZM19.1224 20.7527L19.0375 20.5716L18.9471 20.614L18.9267 20.7118L19.1224 20.7527ZM19.8635 20.3446L19.9259 20.1546L19.8358 20.125L19.7559 20.1761L19.8635 20.3446ZM21.2222 20.7908L21.1598 20.9808L21.1615 20.9814L21.2222 20.7908ZM21.5815 20.8452L21.5814 20.6452L21.5801 20.6452L21.5815 20.8452ZM22.1423 20.6991L22.2401 20.8736L22.2401 20.8736L22.1423 20.6991ZM22.5528 20.3011L22.7247 20.4035L22.7252 20.4025L22.5528 20.3011ZM23.8329 18.1248L23.6615 18.0218L23.6605 18.0234L23.8329 18.1248ZM23.6027 16.7591L23.47 16.9087L23.4732 16.9115L23.6027 16.7591ZM22.5416 15.8178H22.3416V15.9078L22.4089 15.9674L22.5416 15.8178ZM22.5416 14.9854L22.4123 14.8328L22.3416 14.8927V14.9854H22.5416ZM23.6196 14.0713L23.7489 14.2238L23.7495 14.2234L23.6196 14.0713ZM23.9877 13.4153L23.7901 13.3849V13.3849L23.9877 13.4153ZM23.8329 12.6839L23.6621 12.7879L23.6642 12.7912L23.8329 12.6839ZM22.5079 10.5075L22.3361 10.6099L22.3371 10.6115L22.5079 10.5075ZM22.0974 10.1095L21.9997 10.284L22.0974 10.1095ZM21.5366 9.96342L21.5351 10.1634L21.5364 10.1634L21.5366 9.96342ZM21.1773 10.0178L21.1166 9.82726L21.1151 9.82773L21.1773 10.0178ZM19.813 10.464L19.7047 10.6321L19.7847 10.6837L19.8752 10.6541L19.813 10.464ZM19.0775 10.0559L18.8817 10.0968L18.9021 10.1943L18.9921 10.2368L19.0775 10.0559ZM18.7912 8.68481L18.5952 8.72496L18.5954 8.72569L18.7912 8.68481ZM18.3939 8.04915L18.2709 8.20684L18.3939 8.04915ZM17.6683 7.80882L17.6683 8.00886L17.672 8.00879L17.6683 7.80882ZM16.4464 7.80883L16.2755 7.91283L16.334 8.00883L16.4464 8.00883L16.4464 7.80883ZM15.7706 6.69888L15.5988 6.80125L15.5998 6.80289L15.7706 6.69888ZM14.7993 6.15479L14.7978 6.35479L14.7991 6.35479L14.7993 6.15479ZM14.44 6.2092L14.3793 6.01864L14.3778 6.01911L14.44 6.2092ZM13.0757 6.65536L12.9674 6.82351L13.0474 6.87503L13.1378 6.84545L13.0757 6.65536ZM12.3402 6.24729L12.1444 6.28817L12.1648 6.38563L12.2548 6.42814L12.3402 6.24729ZM12.0539 4.87618L11.8579 4.91634L11.8581 4.91707L12.0539 4.87618ZM10.931 4.0002V4.20023L10.9347 4.20017L10.931 4.0002ZM8.30341 4.0002L8.2997 4.2002H8.30341V4.0002ZM7.18053 4.87618L7.37631 4.91707L7.37645 4.91634L7.18053 4.87618ZM6.89419 6.24729L6.97908 6.42838L7.06954 6.38598L7.08997 6.28817L6.89419 6.24729ZM6.15309 6.65536L6.08699 6.84412L6.17879 6.87627L6.26077 6.8239L6.15309 6.65536ZM4.81685 6.18744L4.88295 5.99868L4.8745 5.99572L4.86581 5.99353L4.81685 6.18744ZM4.45753 6.15479L4.45773 6.35522L4.47069 6.35436L4.45753 6.15479ZM3.48623 6.69888L3.65707 6.80289L3.65805 6.80125L3.48623 6.69888ZM2.16123 8.87524L1.99039 8.77124L1.98978 8.77226L2.16123 8.87524ZM2.39142 10.2409L2.52417 10.0913L2.52092 10.0885L2.39142 10.2409ZM3.45255 11.1822H3.65255V11.0922L3.58527 11.0326L3.45255 11.1822ZM3.45255 12.0146L3.58308 12.1662L3.65255 12.1063V12.0146H3.45255ZM2.39142 12.9287L2.51936 13.0825L2.52195 13.0802L2.39142 12.9287ZM2.01424 13.5816L1.81694 13.5489L2.01424 13.5816ZM2.16123 14.3161L2.33207 14.2121L2.33105 14.2105L2.16123 14.3161ZM3.48623 16.4925L3.65806 16.3901L3.65706 16.3885L3.48623 16.4925ZM4.45753 17.0366L4.45901 16.8366L4.45773 16.8366L4.45753 17.0366ZM4.81685 16.9822L4.87757 17.1727L4.87902 17.1723L4.81685 16.9822ZM6.18116 16.536L6.28944 16.3679L6.20944 16.3163L6.11899 16.3459L6.18116 16.536ZM6.91665 16.9441L7.11243 16.9032L7.09207 16.8057L7.00205 16.7632L6.91665 16.9441ZM7.20299 18.3152L7.39891 18.275L7.39876 18.2743L7.20299 18.3152ZM21.5366 19.757L21.4743 19.9471L21.625 19.9965L21.7075 19.861L21.5366 19.757ZM19.6109 19.1259L19.6732 18.9358L19.5688 18.9016L19.484 18.9713L19.6109 19.1259ZM22.8616 17.5807L23.0325 17.6847L23.1197 17.5414L22.9938 17.4305L22.8616 17.5807ZM21.3345 16.2368L21.1378 16.2005L21.1173 16.312L21.2024 16.3869L21.3345 16.2368ZM21.3345 14.5338L21.2045 14.3818L21.1169 14.4567L21.1378 14.57L21.3345 14.5338ZM22.8616 13.228L22.9916 13.38L23.121 13.2693L23.0325 13.1239L22.8616 13.228ZM21.5366 11.0516L21.7075 10.9476L21.6259 10.8137L21.4765 10.8609L21.5366 11.0516ZM19.6053 11.661L19.4797 11.8166L19.5632 11.884L19.6654 11.8517L19.6053 11.661ZM18.0894 10.8068L17.8935 10.8472L17.9161 10.9565L18.021 10.9947L18.0894 10.8068ZM17.6908 8.87524L17.8866 8.83482L17.8537 8.67524H17.6908V8.87524ZM15.0407 8.87524V8.67524H14.8774L14.8448 8.83525L15.0407 8.87524ZM14.6421 10.8285L14.7083 11.0172L14.8154 10.9797L14.8381 10.8685L14.6421 10.8285ZM13.1206 11.6827L13.0583 11.8728L13.1626 11.907L13.2475 11.8373L13.1206 11.6827ZM11.1949 11.0516L11.2571 10.8615L11.1065 10.8122L11.024 10.9476L11.1949 11.0516ZM9.86985 13.228L9.69902 13.1239L9.61177 13.2673L9.73772 13.3781L9.86985 13.228ZM11.397 14.5719L11.5937 14.6081L11.6142 14.4966L11.5291 14.4217L11.397 14.5719ZM11.397 16.2749L11.527 16.4269L11.6146 16.352L11.5937 16.2386L11.397 16.2749ZM9.86985 17.5807L9.73987 17.4287L9.6105 17.5393L9.69902 17.6847L9.86985 17.5807ZM11.1949 19.757L11.024 19.861L11.1055 19.9949L11.255 19.9478L11.1949 19.757ZM13.1262 19.1476L13.2518 18.992L13.1683 18.9246L13.066 18.9569L13.1262 19.1476ZM14.6421 20.0019L14.838 19.9614L14.8154 19.8521L14.7105 19.8139L14.6421 20.0019ZM15.0407 21.9334L14.8449 21.9738L14.8778 22.1334H15.0407V21.9334ZM17.6908 21.9334V22.1334H17.8541L17.8867 21.9734L17.6908 21.9334ZM18.0894 19.9801L18.0232 19.7914L17.9161 19.8289L17.8934 19.9401L18.0894 19.9801ZM16.3657 18.6688L16.3677 18.4688H16.3657V18.6688ZM14.4942 18.1187L14.3855 18.2866L14.4942 18.1187ZM17.6602 18.4292L17.5866 18.2433L17.6602 18.4292ZM19.7344 15.4043H19.5344L19.5344 15.4064L19.7344 15.4043ZM19.1667 13.5906L19.002 13.7042L19.1667 13.5906ZM17.6549 12.3883L17.7294 12.2027L17.6549 12.3883ZM15.7086 12.2025L15.6707 12.0061L15.7086 12.2025ZM13.0618 14.7674L13.2577 14.8076L13.0618 14.7674ZM13.2535 16.6536L13.4374 16.575L13.2535 16.6536ZM16.3657 13.228L16.3612 13.4281L16.3703 13.4279L16.3657 13.228ZM17.2333 13.38L17.1609 13.5664L17.2333 13.38ZM18.6115 15.4043L18.4113 15.3995L18.4116 15.4091L18.6115 15.4043ZM18.4547 16.245L18.6395 16.3214L18.4547 16.245ZM17.2333 17.4287L17.1609 17.2422L17.2333 17.4287ZM16.3657 17.5807L16.3703 17.3805L16.3612 17.3807L16.3657 17.5807ZM14.2768 16.245L14.092 16.3214L14.2768 16.245ZM14.12 15.4043L14.3201 15.4091L14.3199 15.3995L14.12 15.4043ZM9.54775 18.9912H8.32587V19.3912H9.54775V18.9912ZM8.72771 18.2288L9.37692 19.2952L9.71858 19.0872L9.06937 18.0208L8.72771 18.2288ZM8.30339 18.3248L8.89851 18.3248L8.89856 17.9248L8.30344 17.9248L8.30339 18.3248ZM7.70892 16.2337L8.10754 18.1652L8.49929 18.0843L8.10066 16.1528L7.70892 16.2337ZM6.2633 15.4947C6.73298 15.8737 7.26479 16.1733 7.83642 16.3812L7.97315 16.0053C7.44259 15.8123 6.94953 15.5344 6.51448 15.1834L6.2633 15.4947ZM4.51771 16.1391L6.44907 15.5298L6.32871 15.1483L4.39735 15.7577L4.51771 16.1391ZM2.96169 13.876L4.2867 16.0524L4.62836 15.8444L3.30335 13.668L2.96169 13.876ZM4.52967 12.3142L3.00255 13.62L3.2625 13.9241L4.78963 12.6182L4.52967 12.3142ZM4.46296 10.727C4.35473 11.3142 4.35473 11.9153 4.46296 12.5025L4.85634 12.43C4.75694 11.8907 4.75694 11.3387 4.85634 10.7995L4.46296 10.727ZM3.0004 9.56947L4.52752 10.9134L4.79178 10.6131L3.26465 9.26919L3.0004 9.56947ZM4.2867 7.13897L2.96169 9.31533L3.30335 9.52334L4.62836 7.34698L4.2867 7.13897ZM6.44557 7.68406L4.51982 7.05292L4.39524 7.43303L6.32099 8.06417L6.44557 7.68406ZM7.83857 6.83118C7.26122 7.03377 6.72543 7.33451 6.25638 7.71953L6.51017 8.02871C6.94273 7.67364 7.43737 7.39587 7.97101 7.20862L7.83857 6.83118ZM8.10745 5.02662L7.70883 6.9799L8.10075 7.05989L8.49937 5.10661L8.10745 5.02662ZM10.9534 4.86662H8.30341V5.26662H10.9534V4.86662ZM11.5479 6.95771L11.1493 5.02619L10.7576 5.10704L11.1562 7.03856L11.5479 6.95771ZM12.9935 7.6967C12.5239 7.31772 11.9921 7.01811 11.4204 6.81018L11.2837 7.18609C11.8142 7.37907 12.3073 7.65697 12.7424 8.008L12.9935 7.6967ZM14.7391 7.05224L12.8078 7.66162L12.9281 8.04308L14.8595 7.4337L14.7391 7.05224ZM15.3146 7.70482L14.9701 7.13897L14.6285 7.34698L14.973 7.91283L15.3146 7.70482ZM15.1438 7.60883L15.0407 7.60882L15.0407 8.00882L15.1438 8.00883L15.1438 7.60883ZM15.0445 7.60886C14.7357 7.60312 14.434 7.70274 14.1921 7.89146L14.4381 8.20684C14.6068 8.07527 14.8188 8.00474 15.037 8.00879L15.0445 7.60886ZM14.1921 7.89146C13.95 8.08028 13.783 8.34663 13.7219 8.64465L14.1138 8.72497C14.1554 8.52199 14.2696 8.33831 14.4381 8.20684L14.1921 7.89146ZM13.7221 8.64392L13.4357 10.015L13.8273 10.0968L14.1136 8.72569L13.7221 8.64392ZM13.5466 9.87482C13.2827 9.99852 13.0275 10.139 12.7827 10.2954L12.9981 10.6325C13.2282 10.4855 13.4682 10.3534 13.7164 10.237L13.5466 9.87482ZM12.9565 10.2752L12.8381 10.2338L12.706 10.6113L12.8243 10.6527L12.9565 10.2752ZM12.2647 9.89554C12.3952 10.0848 12.5027 10.2864 12.5862 10.4964L12.9579 10.3487C12.8633 10.1107 12.7416 9.88247 12.594 9.66848L12.2647 9.89554ZM10.843 8.76526C11.4228 8.99796 11.9173 9.39164 12.2647 9.89554L12.594 9.66848C12.2011 9.09868 11.6434 8.65551 10.9921 8.39405L10.843 8.76526ZM9.00908 8.59026C9.62496 8.47155 10.2633 8.53253 10.843 8.76526L10.9921 8.39405C10.3407 8.1326 9.6244 8.06429 8.93337 8.1975L9.00908 8.59026ZM7.3856 9.43094C7.82837 9.00186 8.39323 8.70898 9.00908 8.59026L8.93337 8.1975C8.24231 8.33071 7.6067 8.65966 7.10723 9.14369L7.3856 9.43094ZM6.5204 10.999C6.64217 10.4058 6.94291 9.85995 7.3856 9.43094L7.10723 9.14369C6.6077 9.62778 6.26677 10.2453 6.12857 10.9186L6.5204 10.999ZM6.70009 12.7664C6.46107 12.2072 6.39865 11.5922 6.5204 10.999L6.12857 10.9186C5.99037 11.5919 6.06136 12.2897 6.33228 12.9236L6.70009 12.7664ZM7.8656 14.1422C7.34439 13.8047 6.93914 13.3256 6.70009 12.7664L6.33228 12.9236C6.60316 13.5573 7.06144 14.098 7.64819 14.4779L7.8656 14.1422ZM9.62842 14.6602C9.00034 14.6602 8.38687 14.4797 7.8656 14.1422L7.64819 14.4779C8.23487 14.8578 8.92398 15.0602 9.62842 15.0602V14.6602ZM10.0007 14.6427C9.87796 14.6556 9.75432 14.6615 9.63039 14.6602L9.62645 15.0602C9.76568 15.0616 9.90458 15.055 10.0424 15.0405L10.0007 14.6427ZM8.99601 14.1992L9.88883 14.9912L10.1543 14.692L9.26145 13.9L8.99601 14.1992ZM8.64667 13.7241C8.7244 13.9069 8.84472 14.0707 8.99923 14.202L9.25823 13.8972C9.1508 13.8059 9.06801 13.6928 9.0148 13.5676L8.64667 13.7241ZM8.6885 13.8065C8.71371 13.8163 8.73908 13.8256 8.76459 13.8346L8.89688 13.4571C8.87556 13.4496 8.85436 13.4418 8.83327 13.4336L8.6885 13.8065ZM7.88584 13.2931C8.11518 13.5154 8.38829 13.6899 8.6885 13.8065L8.83327 13.4336C8.58229 13.3361 8.35474 13.1905 8.16421 13.0059L7.88584 13.2931ZM7.35468 12.5128C7.47567 12.8055 7.65649 13.0709 7.88584 13.2931L8.16421 13.0059C7.97369 12.8213 7.82417 12.6015 7.72434 12.36L7.35468 12.5128ZM7.1827 11.5909C7.17512 11.9065 7.23368 12.2201 7.35468 12.5128L7.72434 12.36C7.62451 12.1185 7.57635 11.8602 7.58259 11.6005L7.1827 11.5909ZM7.35468 10.6786C7.23368 10.9712 7.17512 11.2849 7.1827 11.6005L7.58259 11.5909C7.57635 11.3312 7.62451 11.0729 7.72434 10.8314L7.35468 10.6786ZM7.88584 9.89823C7.65649 10.1205 7.47567 10.3859 7.35468 10.6786L7.72434 10.8314C7.82417 10.5899 7.97369 10.3701 8.16421 10.1855L7.88584 9.89823ZM8.6885 9.3849C8.38829 9.50146 8.11518 9.67598 7.88584 9.89823L8.16421 10.1855C8.35474 10.0008 8.58229 9.85523 8.83327 9.75779L8.6885 9.3849ZM9.63293 9.21938C9.30997 9.21209 8.9887 9.26835 8.6885 9.3849L8.83327 9.75779C9.08426 9.66034 9.35325 9.61317 9.6239 9.61928L9.63293 9.21938ZM10.5683 9.3849C10.2681 9.26835 9.94687 9.21209 9.6239 9.21938L9.63293 9.61928C9.90358 9.61317 10.1726 9.66034 10.4236 9.75779L10.5683 9.3849ZM11.279 9.81367C11.0699 9.63141 10.8294 9.48625 10.5683 9.3849L10.4236 9.75779C10.6418 9.84251 10.8423 9.96365 11.0162 10.1152L11.279 9.81367ZM11.1392 9.76461C10.9277 9.77346 10.7208 9.83167 10.5363 9.935L10.7318 10.284C10.861 10.2116 11.0065 10.1705 11.1559 10.1643L11.1392 9.76461ZM10.5363 9.935C10.3358 10.0473 10.1684 10.2093 10.0517 10.4051L10.3954 10.6099C10.4756 10.4752 10.5914 10.3626 10.7318 10.284L10.5363 9.935ZM10.0527 10.4035L8.72772 12.5799L9.06938 12.7879L10.3944 10.6115L10.0527 10.4035ZM8.7271 12.5809C8.5717 12.8396 8.5136 13.1434 8.56358 13.44L8.95802 13.3735C8.92402 13.1717 8.96331 12.9645 9.07 12.7868L8.7271 12.5809ZM8.56358 13.44C8.61355 13.7364 8.76811 14.0056 8.99923 14.202L9.25823 13.8972C9.0976 13.7607 8.99204 13.5753 8.95802 13.3735L8.56358 13.44ZM8.99602 14.1992L10.0572 15.1404L10.3226 14.8412L9.26144 13.9L8.99602 14.1992ZM10.0593 15.6717L8.99821 16.5858L9.25928 16.8889L10.3204 15.9748L10.0593 15.6717ZM9.00082 16.5836C8.76323 16.7813 8.60441 17.0552 8.55426 17.3575L8.94887 17.4229C8.983 17.2172 9.09144 17.0285 9.25666 16.8911L9.00082 16.5836ZM8.55426 17.3575C8.50411 17.6598 8.56621 17.9692 8.72871 18.2305L9.06836 18.0192C8.95676 17.8398 8.91475 17.6286 8.94887 17.4229L8.55426 17.3575ZM8.72771 18.2288L10.0527 20.4051L10.3944 20.1971L9.06937 18.0208L8.72771 18.2288ZM10.0517 20.4035C10.1684 20.5994 10.3358 20.7613 10.5363 20.8736L10.7318 20.5247C10.5914 20.446 10.4756 20.3334 10.3954 20.1988L10.0517 20.4035ZM10.5363 20.8736C10.7368 20.986 10.9639 21.045 11.1947 21.0452L11.1951 20.6452C11.032 20.645 10.8722 20.6033 10.7318 20.5247L10.5363 20.8736ZM11.1934 21.0452C11.3364 21.0463 11.4788 21.0247 11.6149 20.9814L11.4935 20.6002C11.3977 20.6307 11.2973 20.646 11.1963 20.6452L11.1934 21.0452ZM11.6163 20.9809L12.9806 20.5347L12.8563 20.1545L11.492 20.6007L11.6163 20.9809ZM12.8102 20.5128C13.0531 20.6692 13.3065 20.8098 13.5686 20.9336L13.7394 20.5719C13.493 20.4555 13.2549 20.3234 13.0268 20.1765L12.8102 20.5128ZM13.4582 20.7936L13.7445 22.1647L14.1361 22.0829L13.8498 20.7118L13.4582 20.7936ZM13.7444 22.164C13.8055 22.462 13.9725 22.7283 14.2145 22.9172L14.4606 22.6018C14.292 22.4703 14.1778 22.2866 14.1362 22.0837L13.7444 22.164ZM14.2145 22.9172C14.4564 23.1059 14.7582 23.2055 15.0669 23.1998L15.0595 22.7998C14.8412 22.8039 14.6292 22.7334 14.4606 22.6018L14.2145 22.9172ZM15.0632 23.1998H17.7132V22.7998H15.0632V23.1998ZM17.7095 23.1998C18.0182 23.2055 18.32 23.1059 18.5619 22.9172L18.3158 22.6018C18.1472 22.7334 17.9352 22.8039 17.7169 22.7998L17.7095 23.1998ZM18.5619 22.9172C18.8039 22.7283 18.9709 22.462 19.032 22.164L18.6402 22.0837C18.5986 22.2866 18.4844 22.4703 18.3158 22.6018L18.5619 22.9172ZM19.0319 22.1647L19.3182 20.7936L18.9267 20.7118L18.6403 22.0829L19.0319 22.1647ZM19.2073 20.9338C19.4712 20.8101 19.7264 20.6696 19.9712 20.5132L19.7559 20.1761C19.5257 20.3231 19.2858 20.4553 19.0375 20.5716L19.2073 20.9338ZM19.8011 20.5347L21.1598 20.9808L21.2846 20.6008L19.9259 20.1546L19.8011 20.5347ZM21.1615 20.9814C21.2976 21.0247 21.44 21.0463 21.583 21.0452L21.5801 20.6452C21.4791 20.646 21.3787 20.6307 21.2829 20.6002L21.1615 20.9814ZM21.5817 21.0452C21.8125 21.045 22.0396 20.986 22.2401 20.8736L22.0446 20.5246C21.9042 20.6033 21.7444 20.645 21.5814 20.6452L21.5817 21.0452ZM22.2401 20.8736C22.4406 20.7613 22.608 20.5994 22.7247 20.4035L22.381 20.1988C22.3008 20.3334 22.185 20.446 22.0446 20.5247L22.2401 20.8736ZM22.7252 20.4025L24.0053 18.2262L23.6605 18.0234L22.3805 20.1997L22.7252 20.4025ZM24.0044 18.2277C24.1598 17.969 24.2179 17.6652 24.1679 17.3687L23.7735 17.4351C23.8075 17.6369 23.7682 17.8442 23.6615 18.0218L24.0044 18.2277ZM24.1679 17.3687C24.1179 17.0722 23.9633 16.803 23.7322 16.6067L23.4732 16.9115C23.6339 17.048 23.7395 17.2333 23.7735 17.4351L24.1679 17.3687ZM23.7355 16.6095L22.6743 15.6682L22.4089 15.9674L23.47 16.9087L23.7355 16.6095ZM22.671 15.1379L23.7489 14.2238L23.4902 13.9188L22.4123 14.8328L22.671 15.1379ZM23.7495 14.2234C23.9839 14.0231 24.1389 13.7479 24.1854 13.4457L23.7901 13.3849C23.7584 13.5906 23.6526 13.78 23.4897 13.9192L23.7495 14.2234ZM24.1854 13.4457C24.2319 13.1435 24.1665 12.8355 24.0017 12.5765L23.6642 12.7912C23.7774 12.9692 23.8217 13.1794 23.7901 13.3849L24.1854 13.4457ZM24.0038 12.5799L22.6788 10.4035L22.3371 10.6115L23.6621 12.7879L24.0038 12.5799ZM22.6798 10.4051C22.5631 10.2093 22.3957 10.0473 22.1952 9.935L21.9997 10.284C22.1401 10.3626 22.2559 10.4752 22.3361 10.6099L22.6798 10.4051ZM22.1952 9.935C21.9946 9.82267 21.7676 9.76365 21.5368 9.76342L21.5364 10.1634C21.6995 10.1636 21.8592 10.2053 21.9997 10.284L22.1952 9.935ZM21.5381 9.76342C21.3951 9.76236 21.2527 9.7839 21.1166 9.82727L21.238 10.2084C21.3338 10.1779 21.4342 10.1627 21.5351 10.1634L21.5381 9.76342ZM21.1151 9.82773L19.7508 10.2739L19.8752 10.6541L21.2395 10.2079L21.1151 9.82773ZM19.9213 10.2958C19.6784 10.1394 19.425 9.99883 19.1629 9.87506L18.9921 10.2368C19.2385 10.3531 19.4765 10.4852 19.7047 10.6321L19.9213 10.2958ZM19.2733 10.015L18.987 8.64392L18.5954 8.72569L18.8817 10.0968L19.2733 10.015ZM18.9871 8.64465C18.926 8.34663 18.759 8.08028 18.5169 7.89146L18.2709 8.20684C18.4394 8.33831 18.5536 8.52199 18.5953 8.72496L18.9871 8.64465ZM18.5169 7.89146C18.275 7.70274 17.9733 7.60312 17.6646 7.60886L17.672 8.00879C17.8903 8.00474 18.1023 8.07527 18.2709 8.20684L18.5169 7.89146ZM17.6683 7.60882L16.4464 7.60883L16.4464 8.00883L17.6683 8.00882L17.6683 7.60882ZM15.5998 6.80289L16.2755 7.91283L16.6172 7.70482L15.9414 6.59488L15.5998 6.80289ZM15.2624 6.47535C15.4028 6.554 15.5186 6.6666 15.5988 6.80125L15.9424 6.59652C15.8257 6.40065 15.6584 6.23872 15.4578 6.12637L15.2624 6.47535ZM14.7991 6.35479C14.9621 6.35496 15.1219 6.39668 15.2624 6.47535L15.4578 6.12637C15.2573 6.01405 15.0303 5.95502 14.7995 5.95479L14.7991 6.35479ZM14.5007 6.39976C14.5965 6.36925 14.6968 6.35404 14.7978 6.35479L14.8008 5.9548C14.6577 5.95374 14.5154 5.97528 14.3793 6.01864L14.5007 6.39976ZM13.1378 6.84545L14.5021 6.3993L14.3778 6.01911L13.0135 6.46526L13.1378 6.84545ZM12.2548 6.42814C12.5012 6.54448 12.7392 6.67656 12.9674 6.82351L13.184 6.48721C12.941 6.33077 12.6877 6.19021 12.4256 6.06644L12.2548 6.42814ZM11.8581 4.91707L12.1444 6.28817L12.536 6.2064L12.2496 4.8353L11.8581 4.91707ZM11.5336 4.39822C11.7021 4.52969 11.8163 4.71337 11.8579 4.91634L12.2498 4.83603C12.1887 4.53801 12.0217 4.27166 11.7796 4.08283L11.5336 4.39822ZM10.9347 4.20017C11.1529 4.19611 11.3649 4.26664 11.5336 4.39822L11.7796 4.08283C11.5377 3.89411 11.236 3.7945 10.9273 3.80023L10.9347 4.20017ZM8.30341 4.2002H10.931V3.8002H8.30341V4.2002ZM7.70079 4.39822C7.86945 4.26664 8.08145 4.19611 8.2997 4.20017L8.30713 3.80023C7.99841 3.7945 7.69667 3.89411 7.45476 4.08283L7.70079 4.39822ZM7.37645 4.91634C7.41806 4.71337 7.53227 4.52969 7.70079 4.39822L7.45476 4.08283C7.21271 4.27166 7.04568 4.53801 6.9846 4.83603L7.37645 4.91634ZM7.08997 6.28817L7.3763 4.91707L6.98475 4.8353L6.69842 6.2064L7.08997 6.28817ZM6.26077 6.8239C6.4909 6.67687 6.73086 6.54474 6.97908 6.42838L6.8093 6.0662C6.54542 6.1899 6.29022 6.33041 6.04541 6.48682L6.26077 6.8239ZM4.75075 6.3762L6.08699 6.84412L6.21919 6.4666L4.88295 5.99868L4.75075 6.3762ZM4.47069 6.35436C4.57066 6.34777 4.67104 6.3569 4.76789 6.38135L4.86581 5.99353C4.72832 5.95881 4.58602 5.94589 4.44437 5.95523L4.47069 6.35436ZM3.99448 6.47535C4.13492 6.39668 4.2947 6.35496 4.45773 6.35479L4.45733 5.95479C4.22653 5.95502 3.99952 6.01405 3.799 6.12637L3.99448 6.47535ZM3.65805 6.80125C3.73827 6.6666 3.85408 6.554 3.99448 6.47535L3.799 6.12637C3.59844 6.23872 3.43111 6.40065 3.31441 6.59652L3.65805 6.80125ZM2.33206 8.97925L3.65706 6.80289L3.3154 6.59488L1.9904 8.77124L2.33206 8.97925ZM2.2207 9.56486C2.18669 9.36312 2.22599 9.15584 2.33268 8.97822L1.98978 8.77226C1.83437 9.03099 1.77627 9.33479 1.82626 9.63134L2.2207 9.56486ZM2.52092 10.0885C2.36027 9.952 2.25471 9.76667 2.2207 9.56486L1.82626 9.63134C1.87623 9.92782 2.03082 10.197 2.26192 10.3933L2.52092 10.0885ZM3.58527 11.0326L2.52414 10.0913L2.2587 10.3905L3.31983 11.3318L3.58527 11.0326ZM2.52195 13.0802L3.58308 12.1662L3.32202 11.8631L2.26089 12.7772L2.52195 13.0802ZM2.21154 13.6143C2.24568 13.4086 2.35412 13.2199 2.51934 13.0824L2.2635 12.775C2.02591 12.9727 1.86709 13.2466 1.81694 13.5489L2.21154 13.6143ZM2.33105 14.2105C2.21944 14.0311 2.17742 13.82 2.21154 13.6143L1.81694 13.5489C1.76678 13.8512 1.82891 14.1606 1.9914 14.4218L2.33105 14.2105ZM3.65706 16.3885L2.33206 14.2121L1.9904 14.4201L3.3154 16.5965L3.65706 16.3885ZM3.99448 16.716C3.85408 16.6374 3.73827 16.5248 3.65805 16.3901L3.31441 16.5949C3.43111 16.7907 3.59844 16.9527 3.799 17.065L3.99448 16.716ZM4.45773 16.8366C4.2947 16.8364 4.13492 16.7947 3.99448 16.716L3.799 17.065C3.99952 17.1773 4.22653 17.2364 4.45733 17.2366L4.45773 16.8366ZM4.75614 16.7916C4.66037 16.8221 4.56001 16.8373 4.45901 16.8366L4.45604 17.2366C4.59911 17.2376 4.74147 17.2161 4.87757 17.1727L4.75614 16.7916ZM6.11899 16.3459L4.75469 16.7921L4.87902 17.1723L6.24332 16.7261L6.11899 16.3459ZM7.00205 16.7632C6.75568 16.6469 6.51762 16.5148 6.28944 16.3679L6.07287 16.7042C6.31579 16.8606 6.56914 17.0012 6.83125 17.1249L7.00205 16.7632ZM7.39876 18.2743L7.11243 16.9032L6.72087 16.985L7.00721 18.3561L7.39876 18.2743ZM7.72325 18.7932C7.55472 18.6617 7.44051 18.478 7.39891 18.275L7.00706 18.3553C7.06814 18.6534 7.23517 18.9197 7.47721 19.1085L7.72325 18.7932ZM8.32216 18.9912C8.1039 18.9953 7.89191 18.9247 7.72325 18.7932L7.47721 19.1085C7.71912 19.2973 8.02087 19.3969 8.32958 19.3911L8.32216 18.9912ZM21.5989 19.567L19.6732 18.9358L19.5486 19.3159L21.4743 19.9471L21.5989 19.567ZM22.6908 17.4767L21.3658 19.653L21.7075 19.861L23.0325 17.6847L22.6908 17.4767ZM21.2024 16.3869L22.7295 17.7308L22.9938 17.4305L21.4666 16.0866L21.2024 16.3869ZM21.1378 14.57C21.2372 15.1093 21.2372 15.6613 21.1378 16.2005L21.5312 16.273C21.6394 15.6858 21.6394 15.0847 21.5312 14.4975L21.1378 14.57ZM22.7317 13.0759L21.2045 14.3818L21.4645 14.6858L22.9916 13.38L22.7317 13.0759ZM21.3658 11.1556L22.6908 13.332L23.0325 13.1239L21.7075 10.9476L21.3658 11.1556ZM19.6654 11.8517L21.5968 11.2423L21.4765 10.8609L19.5451 11.4702L19.6654 11.8517ZM18.021 10.9947C18.5516 11.1877 19.0446 11.4656 19.4797 11.8166L19.7309 11.5053C19.2612 11.1263 18.7294 10.8267 18.1577 10.6188L18.021 10.9947ZM17.4949 8.91566L17.8935 10.8472L18.2852 10.7663L17.8866 8.83482L17.4949 8.91566ZM15.0407 9.07524H17.6908V8.67524H15.0407V9.07524ZM14.8381 10.8685L15.2367 8.91523L14.8448 8.83525L14.4462 10.7885L14.8381 10.8685ZM13.2475 11.8373C13.6801 11.4823 14.1747 11.2045 14.7083 11.0172L14.5759 10.6398C13.9985 10.8424 13.4628 11.1431 12.9937 11.5282L13.2475 11.8373ZM11.1326 11.2416L13.0583 11.8728L13.1829 11.4927L11.2571 10.8615L11.1326 11.2416ZM10.0407 13.332L11.3657 11.1556L11.024 10.9476L9.69902 13.1239L10.0407 13.332ZM11.5291 14.4217L10.002 13.0778L9.73772 13.3781L11.2648 14.722L11.5291 14.4217ZM11.5937 16.2386C11.4943 15.6994 11.4943 15.1474 11.5937 14.6081L11.2003 14.5356C11.0921 15.1228 11.0921 15.7239 11.2003 16.3111L11.5937 16.2386ZM9.99983 17.7327L11.527 16.4269L11.267 16.1228L9.73987 17.4287L9.99983 17.7327ZM11.3657 19.653L10.0407 17.4767L9.69902 17.6847L11.024 19.861L11.3657 19.653ZM13.066 18.9569L11.1347 19.5663L11.255 19.9478L13.1864 19.3384L13.066 18.9569ZM14.7105 19.8139C14.1799 19.6209 13.6869 19.343 13.2518 18.992L13.0006 19.3033C13.4703 19.6823 14.0021 19.9819 14.5737 20.1898L14.7105 19.8139ZM15.2366 21.893L14.838 19.9614L14.4462 20.0423L14.8449 21.9738L15.2366 21.893ZM17.6908 21.7334H15.0407V22.1334H17.6908V21.7334ZM17.8934 19.9401L17.4948 21.8934L17.8867 21.9734L18.2853 20.0201L17.8934 19.9401ZM19.484 18.9713C19.0514 19.3264 18.5568 19.6041 18.0232 19.7914L18.1556 20.1688C18.7329 19.9662 19.2687 19.6655 19.7378 19.2805L19.484 18.9713ZM16.3657 18.4688C15.7377 18.4688 15.1242 18.2883 14.6029 17.9508L14.3855 18.2866C14.9722 18.6664 15.6613 18.8688 16.3657 18.8688V18.4688ZM17.5866 18.2433C17.2 18.3962 16.7856 18.473 16.3677 18.4689L16.3638 18.8688C16.8331 18.8735 17.2989 18.7873 17.7338 18.6152L17.5866 18.2433ZM18.6186 17.5788C18.324 17.8643 17.9732 18.0903 17.5866 18.2433L17.7338 18.6152C18.1687 18.4431 18.5642 18.1885 18.897 17.866L18.6186 17.5788ZM19.3028 16.5811C19.1457 16.954 18.9132 17.2933 18.6186 17.5788L18.897 17.866C19.2298 17.5435 19.4932 17.1595 19.6715 16.7364L19.3028 16.5811ZM19.5344 15.4064C19.5386 15.8088 19.46 16.2082 19.3028 16.5811L19.6715 16.7364C19.8497 16.3132 19.9392 15.8596 19.9344 15.4022L19.5344 15.4064ZM19.002 13.7042C19.3494 14.208 19.5344 14.7996 19.5344 15.4043H19.9344C19.9344 14.7177 19.7243 14.047 19.3313 13.4771L19.002 13.7042ZM17.5804 12.5739C18.1601 12.8066 18.6546 13.2003 19.002 13.7042L19.3313 13.4771C18.9385 12.9073 18.3807 12.4641 17.7294 12.2027L17.5804 12.5739ZM15.7464 12.3989C16.3623 12.2802 17.0006 12.3412 17.5804 12.5739L17.7294 12.2027C17.0781 11.9412 16.3617 11.8729 15.6707 12.0061L15.7464 12.3989ZM14.1229 13.2396C14.5657 12.8105 15.1306 12.5176 15.7464 12.3989L15.6707 12.0061C14.9796 12.1393 14.344 12.4683 13.8446 12.9523L14.1229 13.2396ZM13.2577 14.8076C13.3795 14.2144 13.6802 13.6686 14.1229 13.2396L13.8446 12.9523C13.345 13.4364 13.0041 14.054 12.8659 14.7272L13.2577 14.8076ZM13.4374 16.575C13.1984 16.0158 13.136 15.4008 13.2577 14.8076L12.8659 14.7272C12.7277 15.4005 12.7987 16.0984 13.0696 16.7322L13.4374 16.575ZM14.6029 17.9508C14.0817 17.6133 13.6765 17.1343 13.4374 16.575L13.0696 16.7322C13.3405 17.366 13.7988 17.9066 14.3855 18.2866L14.6029 17.9508ZM16.3703 13.028C16.0473 13.0207 15.726 13.077 15.4258 13.1935L15.5706 13.5664C15.8216 13.469 16.0906 13.4218 16.3612 13.4279L16.3703 13.028ZM17.3057 13.1935C17.0055 13.077 16.6842 13.0207 16.3612 13.028L16.3703 13.4279C16.6409 13.4218 16.9099 13.469 17.1609 13.5664L17.3057 13.1935ZM18.1083 13.7069C17.879 13.4846 17.6059 13.3101 17.3057 13.1935L17.1609 13.5664C17.4119 13.6639 17.6394 13.8095 17.83 13.9941L18.1083 13.7069ZM18.6395 14.4872C18.5185 14.1945 18.3377 13.9291 18.1083 13.7069L17.83 13.9941C18.0205 14.1787 18.17 14.3985 18.2698 14.64L18.6395 14.4872ZM18.8115 15.4091C18.819 15.0935 18.7605 14.7799 18.6395 14.4872L18.2698 14.64C18.3697 14.8815 18.4178 15.1398 18.4116 15.3995L18.8115 15.4091ZM18.6395 16.3214C18.7605 16.0288 18.819 15.7151 18.8115 15.3995L18.4116 15.4091C18.4178 15.6688 18.3697 15.9272 18.2698 16.1686L18.6395 16.3214ZM18.1083 17.1018C18.3377 16.8795 18.5185 16.6141 18.6395 16.3214L18.2698 16.1686C18.17 16.4101 18.0205 16.6299 17.83 16.8145L18.1083 17.1018ZM17.3057 17.6151C17.6059 17.4985 17.879 17.324 18.1083 17.1018L17.83 16.8145C17.6394 16.9992 17.4119 17.1448 17.1609 17.2422L17.3057 17.6151ZM16.3612 17.7806C16.6842 17.7879 17.0055 17.7316 17.3057 17.6151L17.1609 17.2422C16.9099 17.3397 16.6409 17.3868 16.3703 17.3807L16.3612 17.7806ZM15.4258 17.6151C15.726 17.7316 16.0473 17.7879 16.3703 17.7806L16.3612 17.3807C16.0906 17.3868 15.8216 17.3397 15.5706 17.2422L15.4258 17.6151ZM14.6232 17.1018C14.8525 17.324 15.1256 17.4985 15.4258 17.6151L15.5706 17.2422C15.3196 17.1448 15.0921 16.9992 14.9015 16.8145L14.6232 17.1018ZM14.092 16.3214C14.213 16.6141 14.3938 16.8795 14.6232 17.1018L14.9015 16.8145C14.711 16.6299 14.5615 16.4101 14.4617 16.1686L14.092 16.3214ZM13.92 15.3995C13.9124 15.7151 13.971 16.0288 14.092 16.3214L14.4617 16.1686C14.3618 15.9272 14.3137 15.6688 14.3199 15.4091L13.92 15.3995ZM14.092 14.4872C13.971 14.7799 13.9124 15.0935 13.92 15.4091L14.3199 15.3995C14.3137 15.1398 14.3618 14.8815 14.4617 14.64L14.092 14.4872ZM14.6232 13.7069C14.3938 13.9291 14.213 14.1945 14.092 14.4872L14.4617 14.64C14.5615 14.3985 14.711 14.1787 14.9015 13.9941L14.6232 13.7069ZM15.4258 13.1935C15.1256 13.3101 14.8525 13.4846 14.6232 13.7069L14.9015 13.9941C15.0921 13.8095 15.3196 13.6639 15.5706 13.5664L15.4258 13.1935ZM9.98987 14.9908V15.8233H10.3899V14.9908H9.98987ZM22.7416 15.8178V14.9854H22.3416V15.8178H22.7416ZM3.65255 12.0146V11.1822H3.25255V12.0146H3.65255Z\" fill=\"fuchsia\" mask=\"url(#path-2-outside-1_61_6764)\"/>\r\n</svg>\r\n";

  var user = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M19.0855 24.1001H20.6601V20.5001C20.6601 17.3539 18.1554 14.8001 15.0619 14.8001H10.9383C7.84476 14.8001 5.34009 17.3539 5.34009 20.5001V24.1001H6.91463V20.5001C6.91463 18.234 8.7178 16.4001 10.9383 16.4001H15.0619C17.2824 16.4001 19.0855 18.234 19.0855 20.5001V24.1001Z\" fill=\"fuchsia\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M13.0001 13.9001C15.714 13.9001 17.911 11.6598 17.911 8.90015C17.911 6.14046 15.714 3.90015 13.0001 3.90015C10.2861 3.90015 8.08918 6.14046 8.08918 8.90015C8.08918 11.6598 10.2861 13.9001 13.0001 13.9001ZM16.3365 8.90015C16.3365 10.7797 14.841 12.3001 13.0001 12.3001C11.1592 12.3001 9.66372 10.7797 9.66372 8.90015C9.66372 7.02064 11.1592 5.50015 13.0001 5.50015C14.841 5.50015 16.3365 7.02064 16.3365 8.90015Z\" fill=\"fuchsia\"/>\r\n<path d=\"M5.34009 24.1001H20.6601\" stroke=\"fuchsia\" stroke-width=\"1.3\"/>\r\n</svg>\r\n";

  var complex = "<svg width=\"35\" height=\"35\" viewBox=\"0 0 35 35\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M7.64623 29.5248C7.13558 30.0354 6.30755 30.0355 5.79687 29.5248L4.87219 28.6001C4.36152 28.0894 4.36155 27.2614 4.8722 26.7507L12.6197 19.0033H1.66304C0.940874 19.0033 0.355347 18.4178 0.355347 17.6956L0.355347 16.3879C0.355347 15.6657 0.940872 15.0802 1.66304 15.0802L12.6199 15.0802L4.87219 7.33251C4.36152 6.82183 4.36155 5.9938 4.8722 5.48315L5.79687 4.55848C6.30752 4.04783 7.13555 4.0478 7.64623 4.55848L15.3938 12.3061V1.34944C15.3938 0.627233 15.9793 0.041748 16.7015 0.041748L18.0092 0.0417487C18.7314 0.0417487 19.3169 0.627233 19.3169 1.34944V12.3061L27.0645 4.55848C27.5751 4.04783 28.4031 4.0478 28.9138 4.55848L29.8385 5.48315C30.3492 5.99383 30.3492 6.82186 29.8385 7.33251L22.0908 15.0802L33.0477 15.0802C33.7698 15.0802 34.3553 15.6657 34.3553 16.3879L34.3553 17.6956C34.3553 18.4178 33.7698 19.0033 33.0477 19.0033H22.091L29.8385 26.7507C30.3492 27.2614 30.3492 28.0895 29.8385 28.6001L28.9138 29.5248C28.4032 30.0354 27.5751 30.0355 27.0645 29.5248L19.3169 21.7772V32.7341C19.3169 33.4563 18.7314 34.0417 18.0092 34.0417H16.7015C15.9793 34.0417 15.3938 33.4563 15.3938 32.7341V21.7772L7.64623 29.5248Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var eventBased = "<svg width=\"23\" height=\"22\" viewBox=\"0 0 23 22\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M11.3554 2.98562L2.44407 9.46011L5.84791 19.9361L16.863 19.9361L20.2668 9.46011L11.3554 2.98562ZM12.1288 1.07539C11.6677 0.740333 11.0432 0.740332 10.582 1.07539L0.866331 8.13427C0.405163 8.46932 0.212192 9.06323 0.388342 9.60536L4.09941 21.0269C4.27556 21.569 4.78077 21.9361 5.3508 21.9361L17.3601 21.9361C17.9301 21.9361 18.4353 21.569 18.6115 21.0269L22.3225 9.60536C22.4987 9.06323 22.3057 8.46933 21.8445 8.13427L12.1288 1.07539Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var eventBasedParallel = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M15 1C15 0.447266 14.5522 0 14 0H12C11.4478 0 11 0.447266 11 1V11H1C0.447754 11 0 11.4473 0 12V14C0 14.3506 0.179688 14.6582 0.452148 14.8369C0.609375 14.9395 0.797852 15 1 15H11V25C11 25.5527 11.4478 26 12 26H14C14.5522 26 15 25.5527 15 25V15H25C25.5522 15 26 14.5527 26 14V12C26 11.4473 25.5522 11 25 11H15V1Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var exclusive = "<svg width=\"27\" height=\"26\" viewBox=\"0 0 27 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M1.79699 25.5248C2.30767 26.0355 3.1357 26.0354 3.64635 25.5248L13.3555 15.8157L23.0646 25.5248C23.5753 26.0355 24.4033 26.0354 24.9139 25.5248L25.8386 24.6001C26.3493 24.0895 26.3493 23.2614 25.8386 22.7507L16.1295 13.0416L25.8386 3.33251C26.3493 2.82186 26.3493 1.99383 25.8386 1.48315L24.9139 0.558476C24.4033 0.0477981 23.5752 0.0478263 23.0646 0.558476L13.3555 10.2676L3.64635 0.558476C3.13567 0.0477981 2.30764 0.0478258 1.79699 0.558476L0.872314 1.48315C0.361664 1.9938 0.361637 2.82183 0.872315 3.33251L10.5814 13.0416L0.872316 22.7507C0.361666 23.2614 0.361637 24.0894 0.872314 24.6001L1.79699 25.5248Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var parallel = "<svg width=\"35\" height=\"35\" viewBox=\"0 0 35 35\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M18.0093 34.0416C18.7315 34.0416 19.317 33.4561 19.317 32.7339V19.0032H33.0478C33.77 19.0032 34.3555 18.4176 34.3555 17.6955V16.3878C34.3555 15.6656 33.77 15.0801 33.0478 15.0801H19.317V1.34932C19.317 0.62715 18.7315 0.041626 18.0093 0.041626H16.7016C15.9794 0.041626 15.3939 0.62715 15.3939 1.34932V15.0801H1.66316C0.940953 15.0801 0.355469 15.6656 0.355469 16.3878V17.6955C0.355469 18.4176 0.940953 19.0032 1.66316 19.0032H15.3939V32.7339C15.3939 33.4561 15.9794 34.0416 16.7016 34.0416H18.0093Z\" fill=\"fuchsia\"/>\r\n</svg>\r\n";

  var adhoc = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M11.6765 11.0226L11.6765 11.0226L11.6777 11.0233C12.1766 11.3021 12.7505 11.745 13.3997 12.3558L13.4 12.356C13.844 12.7705 14.2026 13.0663 14.4739 13.2394L14.4739 13.2394L14.4747 13.2399C14.7599 13.4177 15.0715 13.507 15.4075 13.507C15.9527 13.507 16.3898 13.2927 16.7086 12.8661L16.709 12.8654C16.8748 12.6401 16.9934 12.3653 17.0672 12.044C17.1819 11.5451 17.5646 11.1426 18.0447 11.1426C18.5237 11.1426 18.9091 11.5259 18.8625 11.9853C18.7981 12.6192 18.6514 13.151 18.4252 13.5835L18.4249 13.5842C18.0973 14.2218 17.6676 14.6803 17.1376 14.9663C16.6012 15.2557 16.0369 15.4 15.4434 15.4C14.8493 15.4 14.3099 15.2619 13.8231 14.9868C13.3296 14.7014 12.7555 14.2549 12.1002 13.6442C11.6621 13.2296 11.3032 12.9334 11.0253 12.7601C10.7401 12.5823 10.4285 12.493 10.0925 12.493C9.57853 12.493 9.14988 12.6899 8.81372 13.0801L8.81368 13.0801C8.62562 13.2987 8.49668 13.5935 8.42138 13.9575C8.31814 14.4566 7.93609 14.8574 7.45599 14.8574C6.97665 14.8574 6.59085 14.4738 6.63758 14.014C6.70196 13.3804 6.84869 12.8489 7.07477 12.4165C7.40847 11.7783 7.83843 11.3197 8.3626 11.0336C8.89897 10.7442 9.4632 10.6 10.0566 10.6C10.6505 10.6 11.1897 10.7412 11.6765 11.0226Z\" fill=\"#161616\" stroke=\"white\" stroke-width=\"0.2\"/>\r\n</svg>\r\n";

  var collapsed = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M7.5 6H18.5Q20 6 20 7.5V18.5Q20 20 18.5 20H7.5Q6 20 6 18.5V7.5Q6 6 7.5 6Z\" fill=\"white\" stroke=\"fuchsia\" stroke-width=\"1.5\"/>\r\n<path d=\"M13 9.5V16.5M9.5 13H16.5\" stroke=\"fuchsia\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>\r\n</svg>\r\n";

  var loop = "<svg width=\"28\" height=\"28\" viewBox=\"0 0 28 28\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path d=\"M7.725 12.25C7.725 9.47477 9.97478 7.225 12.75 7.225C15.5252 7.225 17.775 9.47477 17.775 12.25C17.775 12.6504 18.0996 12.975 18.5 12.975C18.9004 12.975 19.225 12.6504 19.225 12.25C19.225 8.67395 16.326 5.775 12.75 5.775C9.17396 5.775 6.275 8.67395 6.275 12.25C6.275 15.826 9.17396 18.725 12.75 18.725H14.4V20.3981C14.4 20.9136 15.0071 21.1891 15.3951 20.8497L15.3293 20.7744L15.3951 20.8497L18.1358 18.4515C18.409 18.2125 18.409 17.7875 18.1358 17.5485L15.3951 15.1503C15.0071 14.8109 14.4 15.0864 14.4 15.6019V17.275H12.75C9.97478 17.275 7.725 15.0252 7.725 12.25Z\" fill=\"#161616\" stroke=\"#161616\" stroke-width=\"0.2\"/>\r\n</svg>";

  var loopParallel = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8.5 6.5C7.94772 6.5 7.5 6.94772 7.5 7.5V18C7.5 18.5523 7.94772 19 8.5 19C9.05228 19 9.5 18.5523 9.5 18V7.5C9.5 6.94772 9.05228 6.5 8.5 6.5ZM12 7.5C12 6.94772 12.4477 6.5 13 6.5C13.5523 6.5 14 6.94772 14 7.5V18C14 18.5523 13.5523 19 13 19C12.4477 19 12 18.5523 12 18V7.5ZM16.5 7.5C16.5 6.94772 16.9477 6.5 17.5 6.5C18.0523 6.5 18.5 6.94772 18.5 7.5V18C18.5 18.5523 18.0523 19 17.5 19C16.9477 19 16.5 18.5523 16.5 18V7.5Z\" fill=\"#161616\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8.5 6.6C8.00294 6.6 7.6 7.00294 7.6 7.5V18C7.6 18.4971 8.00294 18.9 8.5 18.9C8.99706 18.9 9.4 18.4971 9.4 18V7.5C9.4 7.00294 8.99706 6.6 8.5 6.6ZM13 6.6C12.5029 6.6 12.1 7.00294 12.1 7.5V18C12.1 18.4971 12.5029 18.9 13 18.9C13.4971 18.9 13.9 18.4971 13.9 18V7.5C13.9 7.00294 13.4971 6.6 13 6.6ZM17.5 6.6C17.0029 6.6 16.6 7.00294 16.6 7.5V18C16.6 18.4971 17.0029 18.9 17.5 18.9C17.9971 18.9 18.4 18.4971 18.4 18V7.5C18.4 7.00294 17.9971 6.6 17.5 6.6ZM7.5 7.5C7.5 6.94772 7.94772 6.5 8.5 6.5C9.05228 6.5 9.5 6.94772 9.5 7.5V18C9.5 18.5523 9.05228 19 8.5 19C7.94772 19 7.5 18.5523 7.5 18V7.5ZM13 6.5C12.4477 6.5 12 6.94772 12 7.5V18C12 18.5523 12.4477 19 13 19C13.5523 19 14 18.5523 14 18V7.5C14 6.94772 13.5523 6.5 13 6.5ZM17.5 6.5C16.9477 6.5 16.5 6.94772 16.5 7.5V18C16.5 18.5523 16.9477 19 17.5 19C18.0523 19 18.5 18.5523 18.5 18V7.5C18.5 6.94772 18.0523 6.5 17.5 6.5Z\" fill=\"white\"/>\r\n</svg>\r\n";

  var loopSequential = "<svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M19.25 8.25C19.25 7.69772 18.8023 7.25 18.25 7.25L7.75 7.25C7.19771 7.25 6.75 7.69771 6.75 8.25C6.75 8.80228 7.19771 9.25 7.75 9.25L18.25 9.25C18.8023 9.25 19.25 8.80228 19.25 8.25ZM18.25 11.75C18.8023 11.75 19.25 12.1977 19.25 12.75C19.25 13.3023 18.8023 13.75 18.25 13.75L7.75 13.75C7.19771 13.75 6.75 13.3023 6.75 12.75C6.75 12.1977 7.19771 11.75 7.75 11.75L18.25 11.75ZM18.25 16.25C18.8023 16.25 19.25 16.6977 19.25 17.25C19.25 17.8023 18.8023 18.25 18.25 18.25L7.75 18.25C7.19771 18.25 6.75 17.8023 6.75 17.25C6.75 16.6977 7.19771 16.25 7.75 16.25L18.25 16.25Z\" fill=\"#161616\"/>\r\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M19.15 8.25C19.15 7.75294 18.7471 7.35 18.25 7.35L7.75 7.35C7.25294 7.35 6.85 7.75294 6.85 8.25C6.85 8.74706 7.25294 9.15 7.75 9.15L18.25 9.15C18.7471 9.15 19.15 8.74706 19.15 8.25ZM19.15 12.75C19.15 12.2529 18.7471 11.85 18.25 11.85L7.75 11.85C7.25294 11.85 6.85 12.2529 6.85 12.75C6.85 13.2471 7.25294 13.65 7.75 13.65L18.25 13.65C18.7471 13.65 19.15 13.2471 19.15 12.75ZM19.15 17.25C19.15 16.7529 18.7471 16.35 18.25 16.35L7.75 16.35C7.25294 16.35 6.85 16.7529 6.85 17.25C6.85 17.7471 7.25294 18.15 7.75 18.15L18.25 18.15C18.7471 18.15 19.15 17.7471 19.15 17.25ZM18.25 7.25C18.8023 7.25 19.25 7.69772 19.25 8.25C19.25 8.80228 18.8023 9.25 18.25 9.25L7.75 9.25C7.19771 9.25 6.75 8.80228 6.75 8.25C6.75 7.69771 7.19771 7.25 7.75 7.25L18.25 7.25ZM19.25 12.75C19.25 12.1977 18.8023 11.75 18.25 11.75L7.75 11.75C7.19771 11.75 6.75 12.1977 6.75 12.75C6.75 13.3023 7.19771 13.75 7.75 13.75L18.25 13.75C18.8023 13.75 19.25 13.3023 19.25 12.75ZM19.25 17.25C19.25 16.6977 18.8023 16.25 18.25 16.25L7.75 16.25C7.19771 16.25 6.75 16.6977 6.75 17.25C6.75 17.8023 7.19771 18.25 7.75 18.25L18.25 18.25C18.8023 18.25 19.25 17.8023 19.25 17.25Z\" fill=\"white\"/>\r\n</svg>\r\n";

  const DEFAULT_ICON_FILL_COLOR = 'white';
  const DEFAULT_ICON_STROKE_COLOR = 'fuchsia';

  const parser = new DOMParser();

  const svgStrings = {
    'cancel': cancel,
    'cancel-filled': cancelFilled,
    'compensation': compensation,
    'compensation-filled': compensationFilled,
    'conditional': conditional,
    'error': error$2,
    'error-filled': errorFilled,
    'escalation': escalation,
    'escalation-filled': escalationFilled,
    'link': link,
    'link-filled': linkFilled,
    'message': messageSvg,
    'message-filled': messageFilledSvg,
    'multiple': multiple,
    'multiple-filled': multipleFilled,
    'multiple-parallel': multipleParallel,
    'signal': signal,
    'signal-filled': signalFilled,
    'timer': timerSvg,

    'business-rule': businessRule,
    'manual': manual,
    'receive': receive,
    'script': script,
    'send': send,
    'service': service,
    'user': user,

    'complex': complex,
    'event-based': eventBased,
    'event-based-parallel': eventBasedParallel,
    'exclusive': exclusive,
    'parallel': parallel,

    'adhoc': adhoc,
    'collapsed': collapsed,
    'loop': loop,
    'loop-parallel': loopParallel,
    'loop-sequential': loopSequential
  };

  function getSvgWidth(svg) {
    return parseFloat(attr$1(svg, 'width'));
  }

  function getSvgHeight(svg) {
    return parseFloat(attr$1(svg, 'height'));
  }

  /**
   * @param {SVGAElement} svg
   * @param {SVGPathElement} path
   * @param {number} maxWidth Maximum width depending on aspect ratio
   * @param {number} maxHeight Maximum height depending on aspect ratio
   *
   * @returns {string}
   */
  function getScaledPathData(svg, path, maxWidth, maxHeight) {
    const pathData = path.getAttribute('d');

    return pathData.replace(/([0-9-.]+)/g, (match) => {
      return (parseFloat(match) * getScale(svg, maxWidth, maxHeight)).toFixed(2);
    });
  }

  function getScale(svg, maxWidth, maxHeight) {
    const width = getSvgWidth(svg),
          height = getSvgHeight(svg);

    const scaleX = maxWidth / width,
          scaleY = maxHeight / height;

    return Math.min(scaleX, scaleY);
  }

  function parseSvg(svgString) {
    const doc = parser.parseFromString(svgString, 'image/svg+xml');

    return doc.querySelector('svg');
  }

  /**
   * @param {string} path
   * @param {number} width
   * @param {number} height
   *
   * @returns {SVGAElement}
   */
  function getIcon(id, options) {
    const {
      width,
      height,
      box,
      attrs = {}
    } = options;

    const svgString = svgStrings[id];

    if (!svgString) {
      throw new Error(`icon ${id} not found`);
    }

    const svg = parseSvg(svgString);

    const paths = Array.from(svg.querySelectorAll('path'));

    paths.forEach((path) => {
      attr$1(path, {
        d: getScaledPathData(svg, path, width, height)
      });
    });

    const svgWidth = getSvgWidth(svg),
          svgHeight = getSvgHeight(svg);

    const scale = getScale(svg, width, height);

    const translateX = (box.width - svgWidth * scale) / 2 + (box.x || 0),
          translateY = (box.height - svgHeight * scale) / 2 + (box.y || 0);

    const parent = create$1('g', {
      transform: `translate(${ translateX }, ${ translateY })`
    });

    Array.from(svg.children).forEach((child) => {
      if (attrs.fill) {

        if (child.getAttribute('fill') === DEFAULT_ICON_FILL_COLOR) {
          child.setAttribute('fill', attrs.fill);
        } else if (child.getAttribute('stroke') === DEFAULT_ICON_FILL_COLOR) {
          child.setAttribute('stroke', attrs.fill);
        }

      }

      if (attrs.stroke) {

        if (child.getAttribute('fill') === DEFAULT_ICON_STROKE_COLOR) {
          child.setAttribute('fill', attrs.stroke);
        } else if (child.getAttribute('stroke') === DEFAULT_ICON_STROKE_COLOR) {
          child.setAttribute('stroke', attrs.stroke);
        }

      }

      parent.appendChild(child);
    });

    return parent;
  }

  var rendererIds = new Ids();

  var ELEMENT_LABEL_DISTANCE = 10,
      INTERMEDIATE_EVENT_INNER_OUTER_DIST = 4,
      TRANSACTION_INNER_OUTER_DIST = 3,
      PARTICIPANT_STROKE_WIDTH = 1.5,
      PARTICIPANT_BORDER_RADIUS = 2,
      TASK_BORDER_RADIUS = 10,
      GATEWAY_BORDER_RADIUS = 4;

  var DEFAULT_OPACITY = 0.95,
      FULL_OPACITY = 1,
      LOW_OPACITY = 0.25,
      EVENT_ICON_SCALE = 0.85;

  var TASK_ICON_SIZE = 20,
      TASK_ICON_MARGIN_X = 3.5,
      TASK_ICON_MARGIN_Y = 2;

  var TASK_MARKER_SIZE = 24,
      TASK_MARKER_STEP = 20,
      TASK_MARKER_BOTTOM = 2;

  /**
   * @typedef { Partial<{
   *   defaultFillColor: string,
   *   defaultStrokeColor: string,
   *   defaultLabelColor: string
   * }> } BpmnRendererConfig
   *
   * @typedef { Partial<{
   *   fill: string,
   *   stroke: string,
   *   width: string,
   *   height: string
   * }> } Attrs
   */

  /**
   * @typedef { import('../model/Types').Element } Element
   */

  /**
   * A renderer for BPMN elements
   *
   * @param {BpmnRendererConfig} config
   * @param {import('diagram-js/lib/core/EventBus').default} eventBus
   * @param {import('diagram-js/lib/draw/Styles').default} styles
   * @param {import('./PathMap').default} pathMap
   * @param {import('diagram-js/lib/core/Canvas').default} canvas
   * @param {import('./TextRenderer').default} textRenderer
   * @param {number} [priority]
   */
  function BpmnRenderer(
      config, eventBus, styles, pathMap,
      canvas, textRenderer, priority) {

    BaseRenderer.call(this, eventBus, priority);

    var defaultFillColor = config && config.defaultFillColor,
        defaultStrokeColor = config && config.defaultStrokeColor,
        defaultLabelColor = config && config.defaultLabelColor;

    var rendererId = rendererIds.next();

    var markers = {};

    function shapeStyle(attrs) {
      return styles.computeStyle(attrs, {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        stroke: black,
        strokeWidth: 2,
        fill: 'white'
      });
    }

    function lineStyle(attrs) {
      return styles.computeStyle(attrs, [ 'no-fill' ], {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        stroke: black,
        strokeWidth: 2
      });
    }

    function addMarker(id, options) {
      var {
        ref = { x: 0, y: 0 },
        scale = 1,
        element
      } = options;

      var marker = create$1('marker', {
        id: id,
        viewBox: '0 0 20 20',
        refX: ref.x,
        refY: ref.y,
        markerWidth: 20 * scale,
        markerHeight: 20 * scale,
        orient: 'auto'
      });

      append(marker, element);

      var defs = query('defs', canvas._svg);

      if (!defs) {
        defs = create$1('defs');

        append(canvas._svg, defs);
      }

      append(defs, marker);

      markers[id] = marker;
    }

    function colorEscape(str) {

      // only allow characters and numbers
      return str.replace(/[^0-9a-zA-Z]+/g, '_');
    }

    function marker(type, fill, stroke) {
      var id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId;

      if (!markers[id]) {
        createMarker(id, type, fill, stroke);
      }

      return 'url(#' + id + ')';
    }

    function createMarker(id, type, fill, stroke) {

      if (type === 'sequenceflow-end') {
        var sequenceflowEnd = create$1('path', {
          d: 'M 1 5 L 11 10 L 1 15 Z',
          ...shapeStyle({
            fill: stroke,
            stroke: stroke,
            strokeWidth: 1
          })
        });

        addMarker(id, {
          element: sequenceflowEnd,
          ref: { x: 11, y: 10 },
          scale: 0.5
        });
      }

      if (type === 'messageflow-start') {
        var messageflowStart = create$1('circle', {
          cx: 6,
          cy: 6,
          r: 3.5,
          ...shapeStyle({
            fill,
            stroke: stroke,
            strokeWidth: 1,

            // fix for safari / chrome / firefox bug not correctly
            // resetting stroke dash array
            strokeDasharray: [ 10000, 1 ]
          })
        });

        addMarker(id, {
          element: messageflowStart,
          ref: { x: 6, y: 6 }
        });
      }

      if (type === 'messageflow-end') {
        var messageflowEnd = create$1('path', {
          d: 'm 1 5 l 0 -3 l 7 3 l -7 3 z',
          ...shapeStyle({
            fill,
            stroke: stroke,
            strokeWidth: 1,

            // fix for safari / chrome / firefox bug not correctly
            // resetting stroke dash array
            strokeDasharray: [ 10000, 1 ]
          })
        });

        addMarker(id, {
          element: messageflowEnd,
          ref: { x: 8.5, y: 5 }
        });
      }

      if (type === 'association-start') {
        var associationStart = create$1('path', {
          d: 'M 11 5 L 1 10 L 11 15',
          ...lineStyle({
            fill: 'none',
            stroke,
            strokeWidth: 1.5,

            // fix for safari / chrome / firefox bug not correctly
            // resetting stroke dash array
            strokeDasharray: [ 10000, 1 ]
          })
        });

        addMarker(id, {
          element: associationStart,
          ref: { x: 1, y: 10 },
          scale: 0.5
        });
      }

      if (type === 'association-end') {
        var associationEnd = create$1('path', {
          d: 'M 1 5 L 11 10 L 1 15',
          ...lineStyle({
            fill: 'none',
            stroke,
            strokeWidth: 1.5,

            // fix for safari / chrome / firefox bug not correctly
            // resetting stroke dash array
            strokeDasharray: [ 10000, 1 ]
          })
        });

        addMarker(id, {
          element: associationEnd,
          ref: { x: 11, y: 10 },
          scale: 0.5
        });
      }

      if (type === 'conditional-flow-marker') {
        var conditionalFlowMarker = create$1('path', {
          d: 'M 0 10 L 8 6 L 16 10 L 8 14 Z',
          ...shapeStyle({
            fill,
            stroke: stroke
          })
        });

        addMarker(id, {
          element: conditionalFlowMarker,
          ref: { x: -1, y: 10 },
          scale: 0.5
        });
      }

      if (type === 'conditional-default-flow-marker') {
        var defaultFlowMarker = create$1('path', {
          d: 'M 6 4 L 10 16',
          ...shapeStyle({
            stroke: stroke
          })
        });

        addMarker(id, {
          element: defaultFlowMarker,
          ref: { x: 0, y: 10 },
          scale: 0.5
        });
      }
    }

    function drawCircle(parentGfx, width, height, offset, attrs = {}) {

      if (isObject(offset)) {
        attrs = offset;
        offset = 0;
      }

      offset = offset || 0;

      attrs = shapeStyle(attrs);

      var cx = width / 2,
          cy = height / 2;

      var circle = create$1('circle', {
        cx: cx,
        cy: cy,
        r: Math.round((width + height) / 4 - offset),
        ...attrs
      });

      append(parentGfx, circle);

      return circle;
    }

    function drawRect(parentGfx, width, height, r, offset, attrs) {

      if (isObject(offset)) {
        attrs = offset;
        offset = 0;
      }

      offset = offset || 0;

      attrs = shapeStyle(attrs);

      var rect = create$1('rect', {
        x: offset,
        y: offset,
        width: width - offset * 2,
        height: height - offset * 2,
        rx: r,
        ry: r,
        ...attrs
      });

      append(parentGfx, rect);

      return rect;
    }

    function drawRightRoundedRect(parentGfx, width, height, radius, roundTopRight, roundBottomRight, attrs = {}) {
      attrs = shapeStyle(attrs);

      var clampedRadius = Math.max(0, Math.min(radius || 0, width / 2, height / 2));

      var topRightRadius = roundTopRight ? clampedRadius : 0,
          bottomRightRadius = roundBottomRight ? clampedRadius : 0;

      var pathData = [
        'M 0 0',
        'L ' + (width - topRightRadius) + ' 0',
        topRightRadius
          ? 'Q ' + width + ' 0 ' + width + ' ' + topRightRadius
          : 'L ' + width + ' 0',
        'L ' + width + ' ' + (height - bottomRightRadius),
        bottomRightRadius
          ? 'Q ' + width + ' ' + height + ' ' + (width - bottomRightRadius) + ' ' + height
          : 'L ' + width + ' ' + height,
        'L 0 ' + height,
        'Z'
      ].join(' ');

      var path = create$1('path', {
        ...attrs,
        d: pathData
      });

      append(parentGfx, path);

      return path;
    }

    function drawDiamond(parentGfx, width, height, attrs) {

      var {
        borderRadius = 0,
        ...diamondAttrs
      } = attrs || {};

      var x_2 = width / 2;
      var y_2 = height / 2;

      var points = [
        { x: x_2, y: 0 },
        { x: width, y: y_2 },
        { x: x_2, y: height },
        { x: 0, y: y_2 }
      ];

      diamondAttrs = shapeStyle(diamondAttrs);

      if (borderRadius > 0) {
        var roundedCorners = points.map(function(point, index) {
          var previousPoint = points[ (index + points.length - 1) % points.length ];
          var nextPoint = points[ (index + 1) % points.length ];

          var previousDistance = Math.sqrt(Math.pow(previousPoint.x - point.x, 2) + Math.pow(previousPoint.y - point.y, 2));
          var nextDistance = Math.sqrt(Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2));

          var cornerRadius = Math.min(borderRadius, previousDistance / 2, nextDistance / 2);

          var entryDistance = cornerRadius / previousDistance;
          var exitDistance = cornerRadius / nextDistance;

          return {
            point,
            entry: {
              x: point.x + (previousPoint.x - point.x) * entryDistance,
              y: point.y + (previousPoint.y - point.y) * entryDistance
            },
            exit: {
              x: point.x + (nextPoint.x - point.x) * exitDistance,
              y: point.y + (nextPoint.y - point.y) * exitDistance
            }
          };
        });

        var roundedPath = 'M ' + roundedCorners[ 0 ].exit.x + ' ' + roundedCorners[ 0 ].exit.y;

        for (var i = 1; i < roundedCorners.length; i++) {
          var corner = roundedCorners[ i ];

          roundedPath += ' L ' + corner.entry.x + ' ' + corner.entry.y;
          roundedPath += ' Q ' + corner.point.x + ' ' + corner.point.y + ' ' + corner.exit.x + ' ' + corner.exit.y;
        }

        roundedPath += ' L ' + roundedCorners[ 0 ].entry.x + ' ' + roundedCorners[ 0 ].entry.y;
        roundedPath += ' Q ' + roundedCorners[ 0 ].point.x + ' ' + roundedCorners[ 0 ].point.y + ' ' + roundedCorners[ 0 ].exit.x + ' ' + roundedCorners[ 0 ].exit.y;
        roundedPath += ' Z';

        var path = create$1('path', {
          ...diamondAttrs,
          d: roundedPath
        });

        append(parentGfx, path);

        return path;
      }

      var pointsString = points.map(function(point) {
        return point.x + ',' + point.y;
      }).join(' ');

      var polygon = create$1('polygon', {
        ...diamondAttrs,
        points: pointsString
      });

      append(parentGfx, polygon);

      return polygon;
    }

    /**
     * @param {SVGElement} parentGfx
     * @param {Point[]} waypoints
     * @param {any} attrs
     * @param {number} [radius]
     *
     * @return {SVGElement}
     */
    function drawLine(parentGfx, waypoints, attrs, radius) {
      attrs = lineStyle(attrs);

      var line = createLine(waypoints, attrs, radius);

      append(parentGfx, line);

      return line;
    }

    /**
     * @param {SVGElement} parentGfx
     * @param {Point[]} waypoints
     * @param {any} attrs
     *
     * @return {SVGElement}
     */
    function drawConnectionSegments(parentGfx, waypoints, attrs) {
      return drawLine(parentGfx, waypoints, attrs, 5);
    }

    function drawPath(parentGfx, d, attrs) {
      attrs = lineStyle(attrs);

      var path = create$1('path', {
        ...attrs,
        d
      });

      append(parentGfx, path);

      return path;
    }

    function renderer(type) {
      return handlers[type];
    }

    function as(type) {
      return function(parentGfx, element, attrs) {
        return renderer(type)(parentGfx, element, attrs);
      };
    }

    var eventIconRenderers = {
      'bpmn:MessageEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
        var icon = getIcon(isThrowing ? 'message-filled' : 'message', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:TimerEventDefinition': function(parentGfx, element, attrs = {}) {
        var icon = getIcon('timer', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:EscalationEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
        var icon = getIcon(isThrowing ? 'escalation-filled' : 'escalation', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: isThrowing
              ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
              : getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:ConditionalEventDefinition': function(parentGfx, element, attrs = {}) {
        var icon = getIcon('conditional', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:LinkEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
        var icon = getIcon(isThrowing ? 'link-filled' : 'link', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: isThrowing
              ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
              : getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:ErrorEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
        var icon = getIcon(isThrowing ? 'error-filled' : 'error', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: isThrowing
              ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
              : getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:CancelEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
        var icon = getIcon(isThrowing ? 'cancel-filled' : 'cancel', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: isThrowing
              ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
              : getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:CompensateEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
        var icon = getIcon(isThrowing ? 'compensation-filled' : 'compensation', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: isThrowing
              ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
              : getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:SignalEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
        var icon = getIcon(isThrowing ? 'signal-filled' : 'signal', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: isThrowing
              ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
              : getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:MultipleEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
        var icon = getIcon(isThrowing ? 'multiple-filled' : 'multiple', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: isThrowing
              ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
              : getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:ParallelMultipleEventDefinition': function(parentGfx, element, attrs = {}) {
        var icon = getIcon('multiple-parallel', {
          width: element.width * EVENT_ICON_SCALE,
          height: element.height * EVENT_ICON_SCALE,
          box: {
            width: element.width,
            height: element.height
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);
      },
      'bpmn:TerminateEventDefinition': function(parentGfx, element, attrs = {}) {
        var circle = drawCircle(parentGfx, element.width, element.height, 10, {
          fill: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          strokeWidth: 4
        });

        return circle;
      }
    };

    function renderEventIcon(element, parentGfx, attrs = {}) {
      var semantic = getBusinessObject(element),
          isThrowing = isThrowEvent(semantic);

      if (semantic.get('eventDefinitions') && semantic.get('eventDefinitions').length > 1) {
        if (semantic.get('parallelMultiple')) {
          return eventIconRenderers[ 'bpmn:ParallelMultipleEventDefinition' ](parentGfx, element, attrs, isThrowing);
        }
        else {
          return eventIconRenderers[ 'bpmn:MultipleEventDefinition' ](parentGfx, element, attrs, isThrowing);
        }
      }

      if (isTypedEvent(semantic, 'bpmn:MessageEventDefinition')) {
        return eventIconRenderers[ 'bpmn:MessageEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }

      if (isTypedEvent(semantic, 'bpmn:TimerEventDefinition')) {
        return eventIconRenderers[ 'bpmn:TimerEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }

      if (isTypedEvent(semantic, 'bpmn:ConditionalEventDefinition')) {
        return eventIconRenderers[ 'bpmn:ConditionalEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }

      if (isTypedEvent(semantic, 'bpmn:SignalEventDefinition')) {
        return eventIconRenderers[ 'bpmn:SignalEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }

      if (isTypedEvent(semantic, 'bpmn:EscalationEventDefinition')) {
        return eventIconRenderers[ 'bpmn:EscalationEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }

      if (isTypedEvent(semantic, 'bpmn:LinkEventDefinition')) {
        return eventIconRenderers[ 'bpmn:LinkEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }

      if (isTypedEvent(semantic, 'bpmn:ErrorEventDefinition')) {
        return eventIconRenderers[ 'bpmn:ErrorEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }

      if (isTypedEvent(semantic, 'bpmn:CancelEventDefinition')) {
        return eventIconRenderers[ 'bpmn:CancelEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }

      if (isTypedEvent(semantic, 'bpmn:CompensateEventDefinition')) {
        return eventIconRenderers[ 'bpmn:CompensateEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }

      if (isTypedEvent(semantic, 'bpmn:TerminateEventDefinition')) {
        return eventIconRenderers[ 'bpmn:TerminateEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }

      return null;
    }

    // Deterministic marker order (left to right):
    // loop/parallel/sequential, compensation, [subprocess], adhoc
    var MARKER_ORDER = [
      'loop', 'loop-parallel', 'loop-sequential', 'compensation', 'collapsed', 'adhoc'
    ];

    var MARKER_ICON_TO_DATA_MARKER = {
      'collapsed': 'sub-process',
      'loop-parallel': 'parallel',
      'loop-sequential': 'sequential',
      'compensation': 'compensation',
      'loop': 'loop',
      'adhoc': 'adhoc'
    };

    function renderMarkerIcon(parentGfx, element, iconId, x, attrs, dataMarker) {
      var height = getHeight(element, attrs);

      var icon = getIcon(iconId, {
        width: TASK_MARKER_SIZE,
        height: TASK_MARKER_SIZE,
        box: {
          x: x,
          y: height - TASK_MARKER_SIZE - TASK_MARKER_BOTTOM,
          width: TASK_MARKER_SIZE,
          height: TASK_MARKER_SIZE
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      attr$1(icon, { 'data-marker': dataMarker || MARKER_ICON_TO_DATA_MARKER[iconId] || iconId });

      parentGfx.appendChild(icon);
    }

    function renderTaskMarker(type, parentGfx, element, attrs) {
      {
        var width = getWidth(element, attrs);

        renderMarkerIcon(parentGfx, element, 'loop-parallel',
          (width - TASK_MARKER_SIZE) / 2, attrs, 'participant-multiplicity');
      }
    }

    function renderTaskMarkers(parentGfx, element, taskMarkers, attrs = {}) {
      attrs = {
        fill: attrs.fill,
        stroke: attrs.stroke,
        width: getWidth(element, attrs),
        height: getHeight(element, attrs)
      };

      var semantic = getBusinessObject(element);
      var width = getWidth(element, attrs);

      // Collect all active markers as icon IDs
      var activeMarkers = [];

      var loopCharacteristics = semantic.get('loopCharacteristics'),
          isSequential = loopCharacteristics && loopCharacteristics.get('isSequential');

      if (loopCharacteristics) {
        if (isSequential === undefined) {
          activeMarkers.push('loop');
        } else if (isSequential === false) {
          activeMarkers.push('loop-parallel');
        } else if (isSequential === true) {
          activeMarkers.push('loop-sequential');
        }
      }

      if (semantic.get('isForCompensation')) {
        activeMarkers.push('compensation');
      }

      if (taskMarkers && taskMarkers.includes('SubProcessMarker')) {
        activeMarkers.push('collapsed');
      }

      if (is$1(semantic, 'bpmn:AdHocSubProcess')) {
        activeMarkers.push('adhoc');
      }

      if (activeMarkers.length === 0) {
        return;
      }

      // Split markers into left, center (subprocess), and right groups.
      // Subprocess marker MUST always be in the absolute center.
      // Deterministic order: loop/parallel/sequential, compensation go LEFT;
      // adhoc goes RIGHT.
      var LEFT_MARKERS = [ 'loop', 'loop-parallel', 'loop-sequential', 'compensation' ];

      var leftMarkers = [];
      var centerMarker = null;
      var rightMarkers = [];

      // Sort by deterministic order first
      activeMarkers.sort(function(a, b) {
        return MARKER_ORDER.indexOf(a) - MARKER_ORDER.indexOf(b);
      });

      activeMarkers.forEach(function(markerId) {
        if (markerId === 'collapsed') {
          centerMarker = markerId;
        } else if (LEFT_MARKERS.indexOf(markerId) !== -1) {
          leftMarkers.push(markerId);
        } else {
          rightMarkers.push(markerId);
        }
      });

      var centerX = (width - TASK_MARKER_SIZE) / 2;

      if (centerMarker) {

        // Render subprocess marker in the center
        renderMarkerIcon(parentGfx, element, centerMarker, centerX, attrs);

        // Render left markers to the left of center
        leftMarkers.forEach(function(markerId, index) {
          var x = centerX - (index + 1) * TASK_MARKER_STEP;
          renderMarkerIcon(parentGfx, element, markerId, x, attrs);
        });

        // Render right markers to the right of center
        rightMarkers.forEach(function(markerId, index) {
          var x = centerX + (index + 1) * TASK_MARKER_STEP;
          renderMarkerIcon(parentGfx, element, markerId, x, attrs);
        });
      } else {

        // No subprocess marker — center all markers as a group
        var allMarkers = leftMarkers.concat(rightMarkers);
        var totalWidth = TASK_MARKER_SIZE + (allMarkers.length - 1) * TASK_MARKER_STEP;
        var startX = (width - totalWidth) / 2;

        allMarkers.forEach(function(markerId, index) {
          var x = startX + index * TASK_MARKER_STEP;
          renderMarkerIcon(parentGfx, element, markerId, x, attrs);
        });
      }
    }

    function renderLabel(parentGfx, label, attrs = {}) {
      attrs = assign$1({
        size: {
          width: 100
        }
      }, attrs);

      var text = textRenderer.createText(label || '', attrs);

      classes$1(text).add('djs-label');

      append(parentGfx, text);

      return text;
    }

    function renderEmbeddedLabel(parentGfx, element, align, attrs = {}) {
      var semantic = getBusinessObject(element);

      var box = getBounds({
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      }, attrs);

      return renderLabel(parentGfx, semantic.name, {
        align,
        box,
        padding: 7,
        style: {
          fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor, attrs.stroke)
        }
      });
    }

    function renderExternalLabel(parentGfx, element, attrs = {}) {
      var box = {
        width: 90,
        height: 30,
        x: element.width / 2 + element.x,
        y: element.height / 2 + element.y
      };

      return renderLabel(parentGfx, getLabel(element), {
        box: box,
        fitBox: true,
        style: assign$1(
          {},
          textRenderer.getExternalStyle(),
          {
            fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor, attrs.stroke)
          }
        )
      });
    }

    function renderLaneLabel(parentGfx, text, element, attrs = {}) {
      var isHorizontalLane = isHorizontal(element);

      var textBox = renderLabel(parentGfx, text, {
        box: {
          height: 30,
          width: isHorizontalLane ? getHeight(element, attrs) : getWidth(element, attrs),
        },
        align: 'center-middle',
        style: {
          fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor, attrs.stroke)
        }
      });

      if (isHorizontalLane) {
        var top = -1 * getHeight(element, attrs);
        transform(textBox, 0, -top, 270);
      }
    }

    function renderActivity(parentGfx, element, attrs = {}) {
      var {
        width,
        height
      } = getBounds(element, attrs);

      return drawRect(parentGfx, width, height, TASK_BORDER_RADIUS, {
        ...attrs,
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        fillOpacity: DEFAULT_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });
    }

    function renderAssociation(parentGfx, element, attrs = {}) {
      var semantic = getBusinessObject(element);

      var fill = getFillColor(element, defaultFillColor, attrs.fill),
          stroke = getStrokeColor(element, defaultStrokeColor, attrs.stroke);

      if (semantic.get('associationDirection') === 'One' ||
          semantic.get('associationDirection') === 'Both') {
        attrs.markerEnd = marker('association-end', fill, stroke);
      }

      if (semantic.get('associationDirection') === 'Both') {
        attrs.markerStart = marker('association-start', fill, stroke);
      }

      attrs = pickAttrs(attrs, [
        'markerStart',
        'markerEnd'
      ]);

      return drawConnectionSegments(parentGfx, element.waypoints, {
        ...attrs,
        stroke,
        strokeDasharray: '0, 5'
      });
    }

    function renderDataObject(parentGfx, element, attrs = {}) {
      var fill = getFillColor(element, defaultFillColor, attrs.fill),
          stroke = getStrokeColor(element, defaultStrokeColor, attrs.stroke);

      var pathData = pathMap.getScaledPath('DATA_OBJECT_PATH', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.474,
          my: 0.296
        }
      });

      var dataObject = drawPath(parentGfx, pathData, {
        fill,
        fillOpacity: DEFAULT_OPACITY,
        stroke
      });

      var semantic = getBusinessObject(element);

      if (isCollection(semantic)) {
        var collectionPathData = pathMap.getScaledPath('DATA_OBJECT_COLLECTION_PATH', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.33,
            my: (element.height - 18) / element.height
          }
        });

        drawPath(parentGfx, collectionPathData, {
          strokeWidth: 2,
          fill,
          stroke
        });
      }

      return dataObject;
    }

    function renderEvent(parentGfx, element, attrs = {}) {
      var strokeWidth = Number(attrs.strokeWidth) || 2;

      return drawCircle(parentGfx, element.width, element.height, strokeWidth / 2, {
        fillOpacity: DEFAULT_OPACITY,
        ...attrs,
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });
    }

    function renderGateway(parentGfx, element, attrs = {}) {
      return drawDiamond(parentGfx, element.width, element.height, {
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        fillOpacity: DEFAULT_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        borderRadius: GATEWAY_BORDER_RADIUS
      });
    }

    function renderLane(parentGfx, element, attrs = {}) {
      var width = getWidth(element, attrs),
          height = getHeight(element, attrs);

      var semantic = getBusinessObject(element),
          borderRadius = attrs.borderRadius || 0;

      var laneAttrs = {
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        fillOpacity: attrs.fillOpacity || DEFAULT_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        strokeWidth: 1.5
      };

      var lane;

      if (is$1(semantic, 'bpmn:Lane') && isHorizontal(element) && borderRadius > 0) {
        element.parent;
        var laneSet = semantic.$parent;
        var lanes = laneSet && laneSet.get('lanes');

        var isTopLane = lanes && lanes.indexOf(semantic) === 0,
            isBottomLane = lanes && lanes.indexOf(semantic) === lanes.length - 1;

        if (lanes && lanes.length === 1) {
          lane = drawRect(parentGfx, width, height, borderRadius, laneAttrs);
        } else if (isTopLane || isBottomLane) {
          lane = drawRightRoundedRect(parentGfx, width, height, borderRadius, isTopLane, isBottomLane, laneAttrs);
        } else {
          lane = drawRect(parentGfx, width, height, 0, laneAttrs);
        }
      } else {
        lane = drawRect(parentGfx, width, height, borderRadius, laneAttrs);
      }

      if (is$1(semantic, 'bpmn:Lane')) {
        var text = semantic.get('name');

        renderLaneLabel(parentGfx, text, element, attrs);
      }

      return lane;
    }

    function renderSubProcess(parentGfx, element, attrs = {}) {
      var activity = renderActivity(parentGfx, element, attrs);

      if (isEventSubProcess(element)) {
        attr$1(activity, {
          strokeDasharray: '0, 5.5',
          strokeWidth: 2.5
        });
      }

      var expanded = isExpanded(element);

      renderEmbeddedLabel(parentGfx, element, expanded ? 'center-top' : 'center-middle', attrs);

      if (expanded) {
        renderTaskMarkers(parentGfx, element, undefined, attrs);
      } else {
        renderTaskMarkers(parentGfx, element, [ 'SubProcessMarker' ], attrs);
      }

      return activity;
    }

    function renderTask(parentGfx, element, attrs = {}) {
      var activity = renderActivity(parentGfx, element, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle', attrs);

      renderTaskMarkers(parentGfx, element, undefined, attrs);

      return activity;
    }

    var handlers = this.handlers = {
      'bpmn:AdHocSubProcess': function(parentGfx, element, attrs = {}) {
        if (isExpanded(element)) {
          attrs = pickAttrs(attrs, [
            'fill',
            'stroke',
            'width',
            'height'
          ]);
        } else {
          attrs = pickAttrs(attrs, [
            'fill',
            'stroke'
          ]);
        }

        return renderSubProcess(parentGfx, element, attrs);
      },
      'bpmn:Association': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        return renderAssociation(parentGfx, element, attrs);
      },
      'bpmn:BoundaryEvent': function(parentGfx, element, attrs = {}) {
        var { renderIcon = true } = attrs;

        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var semantic = getBusinessObject(element),
            cancelActivity = semantic.get('cancelActivity');

        attrs = {
          strokeWidth: 1.5,
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          fillOpacity: FULL_OPACITY,
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        };

        if (!cancelActivity) {
          attrs.strokeDasharray = '6, 4';
          attrs.strokeDashoffset = '2.75';
          attrs.pathLength = '80';
        }

        var event = renderEvent(parentGfx, element, attrs);

        drawCircle(parentGfx, element.width, element.height, INTERMEDIATE_EVENT_INNER_OUTER_DIST, {
          ...attrs,
          fill: 'none'
        });

        if (renderIcon) {
          renderEventIcon(element, parentGfx, attrs);
        }

        return event;
      },
      'bpmn:BusinessRuleTask': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var task = renderTask(parentGfx, element, attrs);

        var icon = getIcon('business-rule', {
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE,
          box: {
            x: TASK_ICON_MARGIN_X,
            y: TASK_ICON_MARGIN_Y,
            width: TASK_ICON_SIZE,
            height: TASK_ICON_SIZE
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);

        return task;
      },
      'bpmn:CallActivity': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        return renderSubProcess(parentGfx, element, {
          strokeWidth: 5,
          ...attrs
        });
      },
      'bpmn:ComplexGateway': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var gateway = renderGateway(parentGfx, element, attrs);

        var icon = getIcon('complex', {
          width: element.width * 0.5,
          height: element.height * 0.5,
          box: {
            width: element.width,
            height: element.width
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);

        return gateway;
      },
      'bpmn:DataInput': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var arrowPathData = pathMap.getRawPath('DATA_ARROW');

        var dataObject = renderDataObject(parentGfx, element, attrs);

        drawPath(parentGfx, arrowPathData, {
          fill: 'none',
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          strokeWidth: 1
        });

        return dataObject;
      },
      'bpmn:DataInputAssociation': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        return renderAssociation(parentGfx, element, {
          ...attrs,
          markerEnd: marker('association-end', getFillColor(element, defaultFillColor, attrs.fill), getStrokeColor(element, defaultStrokeColor, attrs.stroke))
        });
      },
      'bpmn:DataObject': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        return renderDataObject(parentGfx, element, attrs);
      },
      'bpmn:DataObjectReference': as('bpmn:DataObject'),
      'bpmn:DataOutput': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var arrowPathData = pathMap.getRawPath('DATA_ARROW');

        var dataObject = renderDataObject(parentGfx, element, attrs);

        drawPath(parentGfx, arrowPathData, {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        });

        return dataObject;
      },
      'bpmn:DataOutputAssociation': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        return renderAssociation(parentGfx, element, {
          ...attrs,
          markerEnd: marker('association-end', getFillColor(element, defaultFillColor, attrs.fill), getStrokeColor(element, defaultStrokeColor, attrs.stroke))
        });
      },
      'bpmn:DataStoreReference': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var dataStorePath = pathMap.getScaledPath('DATA_STORE', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0,
            my: 0.133
          }
        });

        return drawPath(parentGfx, dataStorePath, {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          fillOpacity: DEFAULT_OPACITY,
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          strokeWidth: 2
        });
      },
      'bpmn:EndEvent': function(parentGfx, element, attrs = {}) {
        var { renderIcon = true } = attrs;

        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var event = renderEvent(parentGfx, element, {
          ...attrs,
          strokeWidth: 4
        });

        if (renderIcon) {
          renderEventIcon(element, parentGfx, attrs);
        }

        return event;
      },
      'bpmn:EventBasedGateway': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var semantic = getBusinessObject(element);

        var diamond = renderGateway(parentGfx, element, attrs);

        drawCircle(parentGfx, element.width, element.height, element.width * 0.25, {
          fill: getFillColor(element, 'none', attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          strokeWidth: 1.5
        });

        var type = semantic.get('eventGatewayType'),
            instantiate = !!semantic.get('instantiate');

        var icon;

        if (type === 'Parallel') {
          icon = getIcon('event-based-parallel', {
            width: element.width * 0.3,
            height: element.height * 0.3,
            box: {
              width: element.width,
              height: element.width
            },
            attrs: {
              fill: getFillColor(element, defaultFillColor, attrs.fill),
              stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            }
          });
        } else if (type === 'Exclusive') {
          if (!instantiate) {
            drawCircle(parentGfx, element.width, element.height, element.width * 0.3, {
              fill: 'none',
              stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
              strokeWidth: 1.5
            });
          }

          icon = getIcon('event-based', {
            width: element.width * 0.3,
            height: element.height * 0.3,
            box: {
              y: -1,
              width: element.width,
              height: element.width
            },
            attrs: {
              fill: getFillColor(element, defaultFillColor, attrs.fill),
              stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            }
          });
        }

        parentGfx.appendChild(icon);

        return diamond;
      },
      'bpmn:ExclusiveGateway': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var gateway = renderGateway(parentGfx, element, attrs);

        var icon = getIcon('exclusive', {
          width: element.width * 0.4,
          height: element.height * 0.4,
          box: {
            width: element.width,
            height: element.width
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);

        return gateway;
      },
      'bpmn:Gateway': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        return renderGateway(parentGfx, element, attrs);
      },
      'bpmn:Group': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke',
          'width',
          'height'
        ]);

        return drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, {
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          strokeWidth: 1.5,
          strokeDasharray: '10, 6, 0, 6',
          fill: 'none',
          pointerEvents: 'none',
          width: getWidth(element, attrs),
          height: getHeight(element, attrs)
        });
      },
      'bpmn:InclusiveGateway': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var gateway = renderGateway(parentGfx, element, attrs);

        drawCircle(parentGfx, element.width, element.height, 12, {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          strokeWidth: 2
        });

        return gateway;
      },
      'bpmn:IntermediateEvent': function(parentGfx, element, attrs = {}) {
        var { renderIcon = true } = attrs;

        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var outer = renderEvent(parentGfx, element, {
          ...attrs,
          strokeWidth: 1.5
        });

        drawCircle(parentGfx, element.width, element.height, INTERMEDIATE_EVENT_INNER_OUTER_DIST, {
          fill: 'none',
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          strokeWidth: 1.5
        });

        if (renderIcon) {
          renderEventIcon(element, parentGfx, attrs);
        }

        return outer;
      },
      'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),
      'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),
      'bpmn:Lane': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke',
          'width',
          'height'
        ]);

        return renderLane(parentGfx, element, {
          ...attrs,
          fillOpacity: LOW_OPACITY,
          borderRadius: PARTICIPANT_BORDER_RADIUS
        });
      },
      'bpmn:ManualTask': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var task = renderTask(parentGfx, element, attrs);

        var icon = getIcon('manual', {
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE,
          box: {
            x: TASK_ICON_MARGIN_X,
            y: TASK_ICON_MARGIN_Y,
            width: TASK_ICON_SIZE,
            height: TASK_ICON_SIZE
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);

        return task;
      },
      'bpmn:MessageFlow': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var semantic = getBusinessObject(element),
            di = getDi(element);

        var fill = getFillColor(element, defaultFillColor, attrs.fill),
            stroke = getStrokeColor(element, defaultStrokeColor, attrs.stroke);

        var path = drawConnectionSegments(parentGfx, element.waypoints, {
          markerEnd: marker('messageflow-end', fill, stroke),
          markerStart: marker('messageflow-start', fill, stroke),
          stroke,
          strokeDasharray: '10, 11',
          strokeWidth: 1.5
        });

        if (semantic.get('messageRef')) {
          var midPoint = path.getPointAtLength(path.getTotalLength() / 2);

          if (di.get('messageVisibleKind') !== 'initiating') {
            fill = stroke;
            stroke = fill;
          }

          var backgroundIcon = getIcon('message-filled', {
            width: 36,
            height: 36,
            box: {
              x: midPoint.x - 18,
              y: midPoint.y - 18,
              width: 36,
              height: 36
            },
            attrs: {
              fill: 'none',
              stroke: fill
            }
          });

          parentGfx.appendChild(backgroundIcon);

          var icon = getIcon('message', {
            width: 36,
            height: 36,
            box: {
              x: midPoint.x - 18,
              y: midPoint.y - 18,
              width: 36,
              height: 36
            },
            attrs: {
              fill,
              stroke
            }
          });

          parentGfx.appendChild(icon);

          var messageRef = semantic.get('messageRef'),
              name = messageRef.get('name');

          var label = renderLabel(parentGfx, name, {
            align: 'center-top',
            fitBox: true,
            style: {
              fill: stroke
            }
          });

          // TODO(philippfromme): getBBox cannot be used here since the element is
          // not part of the DOM at this point
          var messageBounds = icon.getBBox(),
              labelBounds = label.getBBox();

          var translateX = midPoint.x - labelBounds.width / 2,
              translateY = midPoint.y + messageBounds.height / 2 + ELEMENT_LABEL_DISTANCE;

          transform(label, translateX, translateY, 0);
        }

        return path;
      },
      'bpmn:ParallelGateway': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var gateway = renderGateway(parentGfx, element, attrs);

        var icon = getIcon('parallel', {
          width: element.width * 0.5,
          height: element.height * 0.5,
          box: {
            width: element.width,
            height: element.width
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);

        return gateway;
      },
      'bpmn:Participant': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke',
          'width',
          'height'
        ]);

        var participant = renderLane(parentGfx, element, {
          ...attrs,
          borderRadius: PARTICIPANT_BORDER_RADIUS
        });

        var expandedParticipant = isExpanded(element);
        var horizontalParticipant = isHorizontal(element);

        var semantic = getBusinessObject(element),
            name = semantic.get('name');

        if (expandedParticipant) {
          var waypoints = horizontalParticipant ? [
            {
              x: 30,
              y: 0
            },
            {
              x: 30,
              y: getHeight(element, attrs)
            }
          ] : [
            {
              x: 0,
              y: 30
            },
            {
              x: getWidth(element, attrs),
              y: 30
            }
          ];

          drawLine(parentGfx, waypoints, {
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
            strokeWidth: PARTICIPANT_STROKE_WIDTH
          });

          renderLaneLabel(parentGfx, name, element, attrs);
        } else {
          var bounds = getBounds(element, attrs);

          if (!horizontalParticipant) {
            bounds.height = getWidth(element, attrs);
            bounds.width = getHeight(element, attrs);
          }

          var textBox = renderLabel(parentGfx, name, {
            box: bounds,
            align: 'center-middle',
            style: {
              fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor, attrs.stroke)
            }
          });

          if (!horizontalParticipant) {
            var top = -1 * getHeight(element, attrs);
            transform(textBox, 0, -top, 270);
          }
        }

        if (semantic.get('participantMultiplicity')) {
          renderTaskMarker('ParticipantMultiplicityMarker', parentGfx, element, attrs);
        }

        return participant;
      },
      'bpmn:ReceiveTask' : function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var semantic = getBusinessObject(element);

        var task = renderTask(parentGfx, element, attrs);

        var icon;

        if (semantic.get('instantiate')) {
          drawCircle(parentGfx, TASK_ICON_SIZE + 5, TASK_ICON_SIZE + 5, 4, {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
            strokeWidth: 1.5
          });

          icon = getIcon('receive', {
            width: TASK_ICON_SIZE - 6,
            height: TASK_ICON_SIZE - 6,
            box: {
              x: TASK_ICON_MARGIN_X - 1,
              y: TASK_ICON_MARGIN_Y + 1,
              width: TASK_ICON_SIZE,
              height: TASK_ICON_SIZE
            },
            attrs: {
              fill: getFillColor(element, defaultFillColor, attrs.fill),
              stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            }
          });
        } else {
          icon = getIcon('receive', {
            width: TASK_ICON_SIZE,
            height: TASK_ICON_SIZE,
            box: {
              x: TASK_ICON_MARGIN_X,
              y: TASK_ICON_MARGIN_Y,
              width: TASK_ICON_SIZE,
              height: TASK_ICON_SIZE
            },
            attrs: {
              fill: getFillColor(element, defaultFillColor, attrs.fill),
              stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            }
          });
        }

        parentGfx.appendChild(icon);

        return task;
      },
      'bpmn:ScriptTask': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var task = renderTask(parentGfx, element, attrs);

        var icon = getIcon('script', {
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE,
          box: {
            x: TASK_ICON_MARGIN_X,
            y: TASK_ICON_MARGIN_Y,
            width: TASK_ICON_SIZE,
            height: TASK_ICON_SIZE
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);

        return task;
      },
      'bpmn:SendTask': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var task = renderTask(parentGfx, element, attrs);

        var icon = getIcon('send', {
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE,
          box: {
            x: TASK_ICON_MARGIN_X,
            y: TASK_ICON_MARGIN_Y,
            width: TASK_ICON_SIZE,
            height: TASK_ICON_SIZE
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);

        return task;
      },
      'bpmn:SequenceFlow': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var fill = getFillColor(element, defaultFillColor, attrs.fill),
            stroke = getStrokeColor(element, defaultStrokeColor, attrs.stroke);

        var connection = drawConnectionSegments(parentGfx, element.waypoints, {
          markerEnd: marker('sequenceflow-end', fill, stroke),
          stroke
        });

        var semantic = getBusinessObject(element);

        var { source } = element;

        if (source) {
          var sourceSemantic = getBusinessObject(source);

          // conditional flow marker
          if (semantic.get('conditionExpression') && is$1(sourceSemantic, 'bpmn:Activity')) {
            attr$1(connection, {
              markerStart: marker('conditional-flow-marker', fill, stroke)
            });
          }

          // default marker
          if (sourceSemantic.get('default') && (is$1(sourceSemantic, 'bpmn:Gateway') || is$1(sourceSemantic, 'bpmn:Activity')) &&
              sourceSemantic.get('default') === semantic) {
            attr$1(connection, {
              markerStart: marker('conditional-default-flow-marker', fill, stroke)
            });
          }
        }

        return connection;
      },
      'bpmn:ServiceTask': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var task = renderTask(parentGfx, element, attrs);

        var icon = getIcon('service', {
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE,
          box: {
            x: TASK_ICON_MARGIN_X,
            y: TASK_ICON_MARGIN_Y,
            width: TASK_ICON_SIZE,
            height: TASK_ICON_SIZE
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);

        return task;
      },
      'bpmn:StartEvent': function(parentGfx, element, attrs = {}) {
        var { renderIcon = true } = attrs;

        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var semantic = getBusinessObject(element);

        if (!semantic.get('isInterrupting')) {
          attrs = {
            ...attrs,
            strokeDasharray: '6, 4',
            strokeDashoffset: '2.75',
            pathLength: '80'
          };
        }

        var event = renderEvent(parentGfx, element, attrs);

        if (renderIcon) {
          renderEventIcon(element, parentGfx, attrs);
        }

        return event;
      },
      'bpmn:SubProcess': function(parentGfx, element, attrs = {}) {
        if (isExpanded(element)) {
          attrs = pickAttrs(attrs, [
            'fill',
            'stroke',
            'width',
            'height'
          ]);
        } else {
          attrs = pickAttrs(attrs, [
            'fill',
            'stroke'
          ]);
        }

        return renderSubProcess(parentGfx, element, attrs);
      },
      'bpmn:Task': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        return renderTask(parentGfx, element, attrs);
      },
      'bpmn:TextAnnotation': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke',
          'width',
          'height'
        ]);

        var {
          width,
          height
        } = getBounds(element, attrs);

        var textElement = drawRect(parentGfx, width, height, 0, 0, {
          fill: 'none',
          stroke: 'none'
        });

        var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: width,
          containerHeight: height,
          position: {
            mx: 0.0,
            my: 0.0
          }
        });

        drawPath(parentGfx, textPathData, {
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        });

        var semantic = getBusinessObject(element),
            text = semantic.get('text') || '';

        renderLabel(parentGfx, text, {
          align: 'left-top',
          box: getBounds(element, attrs),
          padding: 7,
          style: {
            fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor, attrs.stroke)
          }
        });

        return textElement;
      },
      'bpmn:Transaction': function(parentGfx, element, attrs = {}) {
        if (isExpanded(element)) {
          attrs = pickAttrs(attrs, [
            'fill',
            'stroke',
            'width',
            'height'
          ]);
        } else {
          attrs = pickAttrs(attrs, [
            'fill',
            'stroke'
          ]);
        }

        var outer = renderSubProcess(parentGfx, element, {
          strokeWidth: 1.5,
          ...attrs
        });

        var innerAttrs = styles.style([ 'no-fill', 'no-events' ], {
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          strokeWidth: 1.5
        });

        var expanded = isExpanded(element);

        if (!expanded) {
          attrs = {};
        }

        drawRect(
          parentGfx,
          getWidth(element, attrs),
          getHeight(element, attrs),
          TASK_BORDER_RADIUS - TRANSACTION_INNER_OUTER_DIST,
          TRANSACTION_INNER_OUTER_DIST,
          innerAttrs
        );

        return outer;
      },
      'bpmn:UserTask': function(parentGfx, element, attrs = {}) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);

        var task = renderTask(parentGfx, element, attrs);

        var icon = getIcon('user', {
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE,
          box: {
            x: TASK_ICON_MARGIN_X - 1, // TODO: fix horizontal alignment of user icon
            y: TASK_ICON_MARGIN_Y - 1, // TODO: fix vertical alignment of user icon
            width: TASK_ICON_SIZE,
            height: TASK_ICON_SIZE
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });

        parentGfx.appendChild(icon);

        return task;
      },
      'label': function(parentGfx, element, attrs = {}) {
        return renderExternalLabel(parentGfx, element, attrs);
      }
    };

    // extension API, use at your own risk
    this._drawPath = drawPath;

    this._renderer = renderer;
  }


  e(BpmnRenderer, BaseRenderer);

  BpmnRenderer.$inject = [
    'config.bpmnRenderer',
    'eventBus',
    'styles',
    'pathMap',
    'canvas',
    'textRenderer'
  ];


  /**
   * @param {Element} element
   *
   * @return {boolean}
   */
  BpmnRenderer.prototype.canRender = function(element) {
    return is$1(element, 'bpmn:BaseElement');
  };

  /**
   * Draw shape into parentGfx.
   *
   * @param {SVGElement} parentGfx
   * @param {Element} element
   * @param {Attrs} [attrs]
   *
   * @return {SVGElement} mainGfx
   */
  BpmnRenderer.prototype.drawShape = function(parentGfx, element, attrs = {}) {
    var { type } = element;

    var handler = this._renderer(type);

    return handler(parentGfx, element, attrs);
  };

  /**
   * Draw connection into parentGfx.
   *
   * @param {SVGElement} parentGfx
   * @param {Element} element
   * @param {Attrs} [attrs]
   *
   * @return {SVGElement} mainGfx
   */
  BpmnRenderer.prototype.drawConnection = function(parentGfx, element, attrs = {}) {
    var { type } = element;

    var handler = this._renderer(type);

    return handler(parentGfx, element, attrs);
  };

  /**
   * Get shape path.
   *
   * @param {Element} element
   *
   * @return {string} path
   */
  BpmnRenderer.prototype.getShapePath = function(element) {
    if (is$1(element, 'bpmn:Event')) {
      return getCirclePath(element);
    }

    if (is$1(element, 'bpmn:Activity')) {
      return getRoundRectPath(element, TASK_BORDER_RADIUS);
    }

    if (is$1(element, 'bpmn:Gateway')) {
      return getDiamondPath(element);
    }

    return getRectPath(element);
  };

  /**
   * Pick attributes if they exist.
   *
   * @param {Object} attrs
   * @param {string[]} keys
   *
   * @returns {Object}
   */
  function pickAttrs(attrs, keys = []) {
    return keys.reduce((pickedAttrs, key) => {
      if (attrs[ key ]) {
        pickedAttrs[ key ] = attrs[ key ];
      }

      return pickedAttrs;
    }, {});
  }

  /**
   * @typedef {import('../util/Types').Dimensions} Dimensions
   *
   * @typedef { {
   *   top: number;
   *   left: number;
   *   right: number;
   *   bottom: number;
   * } } Padding
   *
   * @typedef { number | Partial<Padding> } PaddingConfig
   *
   * @typedef { {
   *   horizontal: 'center' | 'left' | 'right';
   *   vertical: 'top' | 'middle';
   * } } Alignment
   *
   *  @typedef { 'center-middle' | 'center-top' } AlignmentConfig
   *
   * @typedef { Partial<{
   *   align: AlignmentConfig;
   *   style: Record<string, number | string>;
   *   padding: PaddingConfig;
   * }> } BaseTextConfig
   *
   * @typedef { BaseTextConfig & Partial<{
   *   size: Dimensions;
   * }> } TextConfig
   *
   * @typedef { BaseTextConfig & Partial<{
   *   box: Dimensions;
   *   fitBox: boolean;
   * }> } TextLayoutConfig
   *
   *  @typedef { Dimensions & {
   *  text: string;
   * } } LineDescriptor
   */

  var DEFAULT_BOX_PADDING = 0;

  var DEFAULT_LABEL_SIZE = {
    width: 150,
    height: 50
  };


  /**
   * @param {AlignmentConfig} align
   * @return {Alignment}
   */
  function parseAlign(align) {

    var parts = align.split('-');

    return {
      horizontal: parts[0] || 'center',
      vertical: parts[1] || 'top'
    };
  }

  /**
   * @param {PaddingConfig} padding
   *
   * @return {Padding}
   */
  function parsePadding(padding) {

    if (isObject(padding)) {
      return assign$1({ top: 0, left: 0, right: 0, bottom: 0 }, padding);
    } else {
      return {
        top: padding,
        left: padding,
        right: padding,
        bottom: padding
      };
    }
  }

  /** @type {CanvasRenderingContext2D | null} */
  var _canvasContext = null;

  /**
   * @return {CanvasRenderingContext2D | null}
   */
  function getCanvasContext() {
    if (!_canvasContext) {
      _canvasContext = document.createElement('canvas').getContext('2d');
    }

    return _canvasContext;
  }

  /**
   * Build a CSS font string from a style object for use with the canvas
   * measureText API.
   *
   * @param {Record<string, number | string>} style
   *
   * @return {string}
   */
  function buildFont(style) {
    var parts = [];

    if (style.fontStyle) {
      parts.push(style.fontStyle);
    }

    if (style.fontVariant) {
      parts.push(style.fontVariant);
    }

    if (style.fontWeight) {
      parts.push(style.fontWeight);
    }

    if (style.fontStretch) {
      parts.push(style.fontStretch);
    }

    parts.push(buildLength(style.fontSize) || '12px');
    parts.push(style.fontFamily || 'sans-serif');

    return parts.join(' ');
  }

  /**
   * Coerce a CSS length to a string with units, since canvas APIs
   * silently reject unitless lengths and keep the previous value.
   *
   * @param {number | string | undefined} value
   *
   * @return {string | undefined}
   */
  function buildLength(value) {
    if (value == null) {
      return undefined;
    }

    if (typeof value === 'number' || /^-?\d+(\.\d+)?$/.test(value)) {
      return value + 'px';
    }

    return value;
  }

  /**
   * @param {string} text
   * @param {Record<string, number | string>} style
   *
   * @return {import('../util/Types').Dimensions}
   */
  function getTextBBox(text, style) {
    var ctx = getCanvasContext();

    if (!ctx) {
      return { width: 0, height: 0 };
    }

    ctx.font = buildFont(style);

    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = buildLength(style.letterSpacing) || '0px';
    }

    var emptyLine = text === '';

    // strip trailing whitespace so measurement matches the browser's
    // native rendering used by direct editing
    var measurable = emptyLine ? 'dummy' : text.replace(/\s+$/, '');
    var metrics = ctx.measureText(measurable);

    return {
      width: emptyLine ? 0 : metrics.width,
      height: 'fontBoundingBoxAscent' in metrics
        ? metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
        : metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    };
  }


  /**
   * Layout the next line and return the layouted element.
   *
   * Alters the lines passed.
   *
   * @param {string[]} lines
   * @param {number} maxWidth
   * @param {Record<string, number | string>} style
   *
   * @return {LineDescriptor} the line descriptor
   */
  function layoutNext(lines, maxWidth, style) {

    var originalLine = lines.shift(),
        fitLine = originalLine;

    var textBBox;

    for (;;) {
      textBBox = getTextBBox(fitLine, style);

      textBBox.width = fitLine ? textBBox.width : 0;

      // try to fit
      if (fitLine === ' ' || fitLine === '' || textBBox.width < Math.round(maxWidth) || fitLine.length < 2) {
        return fit(lines, fitLine, originalLine, textBBox);
      }

      fitLine = shortenLine(fitLine, textBBox.width, maxWidth);
    }
  }

  /**
   * @param {string[]} lines
   * @param {string} fitLine
   * @param {string} originalLine
   * @param {Dimensions} textBBox
   *
   * @return {LineDescriptor}
   */
  function fit(lines, fitLine, originalLine, textBBox) {
    if (fitLine.length < originalLine.length) {
      var remainder = originalLine.slice(fitLine.length).trim();

      lines.unshift(remainder);
    }

    return {
      width: textBBox.width,
      height: textBBox.height,
      text: fitLine
    };
  }

  var SOFT_BREAK = '\u00AD';


  /**
   * Shortens a line based on spacing and hyphens.
   * Returns the shortened result on success.
   *
   * @param {string} line
   * @param {number} maxLength the maximum characters of the string
   *
   * @return {string} the shortened string
   */
  function semanticShorten(line, maxLength) {

    var parts = line.split(/(\s|-|\u00AD)/g),
        part,
        shortenedParts = [],
        length = 0;

    // try to shorten via break chars
    if (parts.length > 1) {

      while ((part = parts.shift())) {
        if (part.length + length < maxLength) {
          shortenedParts.push(part);
          length += part.length;
        } else {

          // remove previous part, too if hyphen does not fit anymore
          if (part === '-' || part === SOFT_BREAK) {
            shortenedParts.pop();
          }

          break;
        }
      }
    }

    var last = shortenedParts[shortenedParts.length - 1];

    // translate trailing soft break to actual hyphen
    if (last && last === SOFT_BREAK) {
      shortenedParts[shortenedParts.length - 1] = '-';
    }

    return shortenedParts.join('');
  }


  /**
   * @param {string} line
   * @param {number} width
   * @param {number} maxWidth
   *
   * @return {string}
   */
  function shortenLine(line, width, maxWidth) {
    var length = Math.max(line.length * (maxWidth / width), 1);

    // try to shorten semantically (i.e. based on spaces and hyphens)
    var shortenedLine = semanticShorten(line, length);

    if (!shortenedLine) {

      // force shorten by cutting the long word
      shortenedLine = line.slice(0, Math.max(Math.round(length - 1), 1));
    }

    return shortenedLine;
  }


  /**
   * Creates a new label utility
   *
   * @param {TextConfig} [config]
   */
  function Text(config) {

    this._config = assign$1({}, {
      size: DEFAULT_LABEL_SIZE,
      padding: DEFAULT_BOX_PADDING,
      style: {},
      align: 'center-top'
    }, config || {});
  }

  /**
   * Returns the layouted text as an SVG element.
   *
   * @param {string} text
   * @param {TextLayoutConfig} options
   *
   * @return {SVGElement}
   */
  Text.prototype.createText = function(text, options) {
    return this.layoutText(text, options).element;
  };

  /**
   * Returns a labels layouted dimensions.
   *
   * @param {string} text to layout
   * @param {TextLayoutConfig} options
   *
   * @return {Dimensions}
   */
  Text.prototype.getDimensions = function(text, options) {
    return this.layoutText(text, options).dimensions;
  };

  /**
   * Creates and returns a label and its bounding box.
   *
   * @param {string} text the text to render on the label
   * @param {TextLayoutConfig} options
   *
   * @return { {
   *   element: SVGElement,
   *   dimensions: Dimensions
   * } }
   */
  Text.prototype.layoutText = function(text, options) {
    var box = assign$1({}, this._config.size, options.box),
        style = assign$1({}, this._config.style, options.style),
        align = parseAlign(options.align || this._config.align),
        padding = parsePadding(options.padding !== undefined ? options.padding : this._config.padding),
        fitBox = options.fitBox || false;

    var lineHeight = getLineHeight(style);

    // we split text by lines and normalize
    // {soft break} + {line break} => { line break }
    var lines = text.split(/\u00AD?\r?\n/),
        layouted = [];

    var maxWidth = box.width - padding.left - padding.right;

    while (lines.length) {
      layouted.push(layoutNext(lines, maxWidth, style));
    }

    if (align.vertical === 'middle') {
      padding.top = padding.bottom = 0;
    }

    var totalHeight = reduce(layouted, function(sum, line, idx) {
      return sum + (lineHeight || line.height);
    }, 0) + padding.top + padding.bottom;

    var maxLineWidth = reduce(layouted, function(sum, line, idx) {
      return line.width > sum ? line.width : sum;
    }, 0);

    // the y position of the next line
    var y = padding.top;

    if (align.vertical === 'middle') {
      y += (box.height - totalHeight) / 2;
    }

    // magic number initial offset
    y -= (lineHeight || layouted[0].height) / 4;


    var textElement = create$1('text');

    attr$1(textElement, style);

    // layout each line taking into account that parent
    // shape might resize to fit text size
    forEach(layouted, function(line) {

      var x;

      y += (lineHeight || line.height);

      switch (align.horizontal) {
      case 'left':
        x = padding.left;
        break;

      case 'right':
        x = ((fitBox ? maxLineWidth : maxWidth)
          - padding.right - line.width);
        break;

      default:

        // aka center
        x = Math.max((((fitBox ? maxLineWidth : maxWidth)
          - line.width) / 2 + padding.left), 0);
      }

      var tspan = create$1('tspan');
      attr$1(tspan, { x: x, y: y });

      tspan.textContent = line.text;

      append(textElement, tspan);
    });

    var dimensions = {
      width: maxLineWidth,
      height: totalHeight
    };

    return {
      dimensions: dimensions,
      element: textElement
    };
  };


  function getLineHeight(style) {
    if ('fontSize' in style && 'lineHeight' in style) {
      return style.lineHeight * parseInt(style.fontSize, 10);
    }
  }

  /**
   * Returns the surrounding bbox for all elements in
   * the array or the element primitive.
   *
   * @param {Element|Element[]} elements
   * @param {boolean} [stopRecursion=false]
   *
   * @return {Rect}
   */
  function getBBox(elements, stopRecursion) {

    stopRecursion = !!stopRecursion;
    if (!isArray$1(elements)) {
      elements = [ elements ];
    }

    var minX,
        minY,
        maxX,
        maxY;

    forEach(elements, function(element) {

      // If element is a connection the bbox must be computed first
      var bbox = element;
      if (element.waypoints && !stopRecursion) {
        bbox = getBBox(element.waypoints, true);
      }

      var x = bbox.x,
          y = bbox.y,
          height = bbox.height || 0,
          width = bbox.width || 0;

      if (x < minX || minX === undefined) {
        minX = x;
      }
      if (y < minY || minY === undefined) {
        minY = y;
      }

      if ((x + width) > maxX || maxX === undefined) {
        maxX = x + width;
      }
      if ((y + height) > maxY || maxY === undefined) {
        maxY = y + height;
      }
    });

    return {
      x: minX,
      y: minY,
      height: maxY - minY,
      width: maxX - minX
    };
  }

  /**
   * Get the element's type
   *
   * @param {Element} element
   *
   * @return {'connection' | 'shape' | 'root'}
   */
  function getType(element) {

    if ('waypoints' in element) {
      return 'connection';
    }

    if ('x' in element) {
      return 'shape';
    }

    return 'root';
  }

  /**
   * @param {Element} element
   *
   * @return {boolean}
   */
  function isFrameElement$1(element) {
    return !!(element && element.isFrame);
  }

  var TEXT_ANNOTATION_PADDING = 7;

  var DEFAULT_FONT_SIZE = 12;
  var LINE_HEIGHT_RATIO = 1.2;

  var MIN_TEXT_ANNOTATION_HEIGHT = 40;

  /**
   * @typedef { {
   *   fontFamily: string;
   *   fontSize: number;
   *   fontWeight: string;
   *   lineHeight: number;
   * } } TextRendererStyle
   *
   * @typedef { {
   *   defaultStyle?: Partial<TextRendererStyle>;
   *   externalStyle?: Partial<TextRendererStyle>;
   * } } TextRendererConfig
   *
   * @typedef { import('diagram-js/lib/util/Text').TextLayoutConfig } TextLayoutConfig
   *
   * @typedef { import('diagram-js/lib/util/Types').Rect } Rect
   */


  /**
   * Renders text and computes text bounding boxes.
   *
   * @param {TextRendererConfig} [config]
   */
  function TextRenderer(config) {

    var defaultStyle = assign$1({
      fontFamily: 'Arial, sans-serif',
      fontSize: DEFAULT_FONT_SIZE,
      fontWeight: 'normal',
      lineHeight: LINE_HEIGHT_RATIO
    }, config && config.defaultStyle || {});

    var fontSize = parseInt(defaultStyle.fontSize, 10) - 1;

    var externalStyle = assign$1({}, defaultStyle, {
      fontSize: fontSize
    }, config && config.externalStyle || {});

    var textUtil = new Text({
      style: defaultStyle
    });

    /**
     * Get the new bounds of an externally rendered,
     * layouted label.
     *
     * @param {Rect} bounds
     * @param {string} text
     *
     * @return {Rect}
     */
    this.getExternalLabelBounds = function(bounds, text) {

      var box = {
        width: Math.max(bounds.width, DEFAULT_LABEL_SIZE$1.width),
        height: 30
      };

      var dimensions = getTextboxDimensions(text, box, {
        style: externalStyle
      });

      return {
        x: Math.round(bounds.x + bounds.width / 2 - dimensions.width / 2),
        y: bounds.y,
        width: Math.ceil(dimensions.width),
        height: Math.ceil(dimensions.height)
      };

    };

    /**
     * Get the new bounds of text annotation.
     *
     * @param {Rect} bounds
     * @param {string} text
     *
     * @return {Rect}
     */
    this.getTextAnnotationBounds = function(bounds, text) {

      var dimensions = getTextboxDimensions(text, bounds, {
        style: defaultStyle,
        align: 'left-top',
        padding: TEXT_ANNOTATION_PADDING
      });

      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: Math.max(MIN_TEXT_ANNOTATION_HEIGHT, Math.round(dimensions.height))
      };
    };

    /**
     * Get the dimensions of a text element.
     *
     * @param {string} text
     * @param {TextLayoutConfig} [options]
     *
     * @return {import('diagram-js/lib/util/Types').Dimensions}
     */
    this.getDimensions = function(text, options) {
      return textUtil.getDimensions(text, options || {});
    };

    /**
     * Compute dimension of text fitted inside a box.
     *
     * @param {string} text
     * @param {Rect} box
     * @param {TextLayoutConfig} layoutOptions
     *
     * @return {import('diagram-js/lib/util/Types').Dimensions}
     */
    function getTextboxDimensions(text, box, layoutOptions) {
      return textUtil.getDimensions(text, assign$1({ box: box }, layoutOptions));
    }

    /**
     * Create a layouted text element.
     *
     * @param {string} text
     * @param {TextLayoutConfig} [options]
     *
     * @return {SVGElement} rendered text
     */
    this.createText = function(text, options) {
      return textUtil.createText(text, options || {});
    };

    /**
     * Get default text style.
     */
    this.getDefaultStyle = function() {
      return defaultStyle;
    };

    /**
     * Get the external text style.
     */
    this.getExternalStyle = function() {
      return externalStyle;
    };

  }

  TextRenderer.$inject = [
    'config.textRenderer'
  ];

  /**
   * Map containing SVG paths needed by BpmnRenderer
   */
  function PathMap() {

    /**
     * Contains a map of path elements
     *
     * <h1>Path definition</h1>
     * A parameterized path is defined like this:
     * <pre>
     * 'GATEWAY_PARALLEL': {
     *   d: 'm {mx},{my} {e.x0},0 0,{e.x1} {e.x1},0 0,{e.y0} -{e.x1},0 0,{e.y1} ' +
            '-{e.x0},0 0,-{e.y1} -{e.x1},0 0,-{e.y0} {e.x1},0 z',
     *   height: 17.5,
     *   width:  17.5,
     *   heightElements: [2.5, 7.5],
     *   widthElements: [2.5, 7.5]
     * }
     * </pre>
     * <p>It's important to specify a correct <b>height and width</b> for the path as the scaling
     * is based on the ratio between the specified height and width in this object and the
     * height and width that is set as scale target (Note x,y coordinates will be scaled with
     * individual ratios).</p>
     * <p>The '<b>heightElements</b>' and '<b>widthElements</b>' array must contain the values that will be scaled.
     * The scaling is based on the computed ratios.
     * Coordinates on the y axis should be in the <b>heightElement</b>'s array, they will be scaled using
     * the computed ratio coefficient.
     * In the parameterized path the scaled values can be accessed through the 'e' object in {} brackets.
     *   <ul>
     *    <li>The values for the y axis can be accessed in the path string using {e.y0}, {e.y1}, ....</li>
     *    <li>The values for the x axis can be accessed in the path string using {e.x0}, {e.x1}, ....</li>
     *   </ul>
     *   The numbers x0, x1 respectively y0, y1, ... map to the corresponding array index.
     * </p>
     */
    this.pathMap = {
      'EVENT_MESSAGE': {
        d: 'm {mx},{my} l 0,{e.y1} l {e.x1},0 l 0,-{e.y1} z l {e.x0},{e.y0} l {e.x0},-{e.y0}',
        height: 36,
        width:  36,
        heightElements: [ 6, 14 ],
        widthElements: [ 10.5, 21 ]
      },
      'EVENT_SIGNAL': {
        d: 'M {mx},{my} l {e.x0},{e.y0} l -{e.x1},0 Z',
        height: 36,
        width: 36,
        heightElements: [ 18 ],
        widthElements: [ 10, 20 ]
      },
      'EVENT_ESCALATION': {
        d: 'M {mx},{my} l {e.x0},{e.y0} l -{e.x0},-{e.y1} l -{e.x0},{e.y1} Z',
        height: 36,
        width: 36,
        heightElements: [ 20, 7 ],
        widthElements: [ 8 ]
      },
      'EVENT_CONDITIONAL': {
        d: 'M {e.x0},{e.y0} l {e.x1},0 l 0,{e.y2} l -{e.x1},0 Z ' +
           'M {e.x2},{e.y3} l {e.x0},0 ' +
           'M {e.x2},{e.y4} l {e.x0},0 ' +
           'M {e.x2},{e.y5} l {e.x0},0 ' +
           'M {e.x2},{e.y6} l {e.x0},0 ' +
           'M {e.x2},{e.y7} l {e.x0},0 ' +
           'M {e.x2},{e.y8} l {e.x0},0 ',
        height: 36,
        width:  36,
        heightElements: [ 8.5, 14.5, 18, 11.5, 14.5, 17.5, 20.5, 23.5, 26.5 ],
        widthElements:  [ 10.5, 14.5, 12.5 ]
      },
      'EVENT_LINK': {
        d: 'm {mx},{my} 0,{e.y0} -{e.x1},0 0,{e.y1} {e.x1},0 0,{e.y0} {e.x0},-{e.y2} -{e.x0},-{e.y2} z',
        height: 36,
        width: 36,
        heightElements: [ 4.4375, 6.75, 7.8125 ],
        widthElements: [ 9.84375, 13.5 ]
      },
      'EVENT_ERROR': {
        d: 'm {mx},{my} {e.x0},-{e.y0} {e.x1},-{e.y1} {e.x2},{e.y2} {e.x3},-{e.y3} -{e.x4},{e.y4} -{e.x5},-{e.y5} z',
        height: 36,
        width: 36,
        heightElements: [ 0.023, 8.737, 8.151, 16.564, 10.591, 8.714 ],
        widthElements: [ 0.085, 6.672, 6.97, 4.273, 5.337, 6.636 ]
      },
      'EVENT_CANCEL_45': {
        d: 'm {mx},{my} -{e.x1},0 0,{e.x0} {e.x1},0 0,{e.y1} {e.x0},0 ' +
          '0,-{e.y1} {e.x1},0 0,-{e.y0} -{e.x1},0 0,-{e.y1} -{e.x0},0 z',
        height: 36,
        width: 36,
        heightElements: [ 4.75, 8.5 ],
        widthElements: [ 4.75, 8.5 ]
      },
      'EVENT_COMPENSATION': {
        d: 'm {mx},{my} {e.x0},-{e.y0} 0,{e.y1} z m {e.x1},-{e.y2} {e.x2},-{e.y3} 0,{e.y1} -{e.x2},-{e.y3} z',
        height: 36,
        width: 36,
        heightElements: [ 6.5, 13, 0.4, 6.1 ],
        widthElements: [ 9, 9.3, 8.7 ]
      },
      'EVENT_TIMER_WH': {
        d: 'M {mx},{my} l {e.x0},-{e.y0} m -{e.x0},{e.y0} l {e.x1},{e.y1} ',
        height: 36,
        width:  36,
        heightElements: [ 10, 2 ],
        widthElements: [ 3, 7 ]
      },
      'EVENT_TIMER_LINE': {
        d:  'M {mx},{my} ' +
            'm {e.x0},{e.y0} l -{e.x1},{e.y1} ',
        height: 36,
        width:  36,
        heightElements: [ 10, 3 ],
        widthElements: [ 0, 0 ]
      },
      'EVENT_MULTIPLE': {
        d:'m {mx},{my} {e.x1},-{e.y0} {e.x1},{e.y0} -{e.x0},{e.y1} -{e.x2},0 z',
        height: 36,
        width:  36,
        heightElements: [ 6.28099, 12.56199 ],
        widthElements: [ 3.1405, 9.42149, 12.56198 ]
      },
      'EVENT_PARALLEL_MULTIPLE': {
        d:'m {mx},{my} {e.x0},0 0,{e.y1} {e.x1},0 0,{e.y0} -{e.x1},0 0,{e.y1} ' +
          '-{e.x0},0 0,-{e.y1} -{e.x1},0 0,-{e.y0} {e.x1},0 z',
        height: 36,
        width:  36,
        heightElements: [ 2.56228, 7.68683 ],
        widthElements: [ 2.56228, 7.68683 ]
      },
      'GATEWAY_EXCLUSIVE': {
        d:'m {mx},{my} {e.x0},{e.y0} {e.x1},{e.y0} {e.x2},0 {e.x4},{e.y2} ' +
                      '{e.x4},{e.y1} {e.x2},0 {e.x1},{e.y3} {e.x0},{e.y3} ' +
                      '{e.x3},0 {e.x5},{e.y1} {e.x5},{e.y2} {e.x3},0 z',
        height: 17.5,
        width:  17.5,
        heightElements: [ 8.5, 6.5312, -6.5312, -8.5 ],
        widthElements:  [ 6.5, -6.5, 3, -3, 5, -5 ]
      },
      'GATEWAY_PARALLEL': {
        d:'m {mx},{my} 0,{e.y1} -{e.x1},0 0,{e.y0} {e.x1},0 0,{e.y1} {e.x0},0 ' +
          '0,-{e.y1} {e.x1},0 0,-{e.y0} -{e.x1},0 0,-{e.y1} -{e.x0},0 z',
        height: 30,
        width:  30,
        heightElements: [ 5, 12.5 ],
        widthElements: [ 5, 12.5 ]
      },
      'GATEWAY_EVENT_BASED': {
        d:'m {mx},{my} {e.x0},{e.y0} {e.x0},{e.y1} {e.x1},{e.y2} {e.x2},0 z',
        height: 11,
        width:  11,
        heightElements: [ -6, 6, 12, -12 ],
        widthElements: [ 9, -3, -12 ]
      },
      'GATEWAY_COMPLEX': {
        d:'m {mx},{my} 0,{e.y0} -{e.x0},-{e.y1} -{e.x1},{e.y2} {e.x0},{e.y1} -{e.x2},0 0,{e.y3} ' +
          '{e.x2},0  -{e.x0},{e.y1} l {e.x1},{e.y2} {e.x0},-{e.y1} 0,{e.y0} {e.x3},0 0,-{e.y0} {e.x0},{e.y1} ' +
          '{e.x1},-{e.y2} -{e.x0},-{e.y1} {e.x2},0 0,-{e.y3} -{e.x2},0 {e.x0},-{e.y1} -{e.x1},-{e.y2} ' +
          '-{e.x0},{e.y1} 0,-{e.y0} -{e.x3},0 z',
        height: 17.125,
        width:  17.125,
        heightElements: [ 4.875, 3.4375, 2.125, 3 ],
        widthElements: [ 3.4375, 2.125, 4.875, 3 ]
      },
      'DATA_OBJECT_PATH': {
        d:'m 0,0 {e.x1},0 {e.x0},{e.y0} 0,{e.y1} -{e.x2},0 0,-{e.y2} {e.x1},0 0,{e.y0} {e.x0},0',
        height: 61,
        width:  51,
        heightElements: [ 10, 50, 60 ],
        widthElements: [ 10, 40, 50, 60 ]
      },
      'DATA_OBJECT_COLLECTION_PATH': {
        d: 'm{mx},{my} m 2,3 l 0,8 m 4,-8 l 0,8 m 4,-8 l 0,8',
        height: 10,
        width: 10,
        heightElements: [],
        widthElements: []
      },
      'DATA_ARROW': {
        d:'m 5,9 9,0 0,-3 5,5 -5,5 0,-3 -9,0 z',
        height: 61,
        width:  51,
        heightElements: [],
        widthElements: []
      },
      'DATA_STORE': {
        d:'m  {mx},{my} ' +
          'l  0,{e.y2} ' +
          'c  {e.x0},{e.y1} {e.x1},{e.y1}  {e.x2},0 ' +
          'l  0,-{e.y2} ' +
          'c -{e.x0},-{e.y1} -{e.x1},-{e.y1} -{e.x2},0' +
          'c  {e.x0},{e.y1} {e.x1},{e.y1}  {e.x2},0 ' +
          'm  -{e.x2},{e.y0}' +
          'c  {e.x0},{e.y1} {e.x1},{e.y1} {e.x2},0' +
          'm  -{e.x2},{e.y0}' +
          'c  {e.x0},{e.y1} {e.x1},{e.y1}  {e.x2},0',
        height: 61,
        width:  61,
        heightElements: [ 15, 10, 45 ],
        widthElements:  [ 2, 58, 60 ]
      },
      'TEXT_ANNOTATION': {
        d: 'm {mx}, {my} m 10,0 l -10,0 l 0,{e.y0} l 10,0',
        height: 30,
        width: 10,
        heightElements: [ 30 ],
        widthElements: [ 10 ]
      },
      'MARKER_SUB_PROCESS': {
        d: 'm{mx},{my} m 7,3 l 0,8 m -4,-4 l 8,0',
        height: 10,
        width: 10,
        heightElements: [],
        widthElements: []
      },
      'MARKER_PARALLEL': {
        d: 'm{mx},{my} m 2,3 l 0,8 m 4,-8 l 0,8 m 4,-8 l 0,8',
        height: 10,
        width: 10,
        heightElements: [],
        widthElements: []
      },
      'MARKER_SEQUENTIAL': {
        d: 'm{mx},{my} m 1,2 l 8,0 m -8,4 l 8,0 m -8,4 l 8,0',
        height: 10,
        width: 10,
        heightElements: [],
        widthElements: []
      },
      'MARKER_COMPENSATION': {
        d: 'm {mx},{my} 7,-5 0,10 z m 7.1,-0.3 6.9,-4.7 0,10 -6.9,-4.7 z',
        height: 10,
        width: 21,
        heightElements: [],
        widthElements: []
      },
      'MARKER_LOOP': {
        d: 'm {mx},{my} c 3.526979,0 6.386161,-2.829858 6.386161,-6.320661 0,-3.490806 -2.859182,-6.320661 ' +
          '-6.386161,-6.320661 -3.526978,0 -6.38616,2.829855 -6.38616,6.320661 0,1.745402 ' +
          '0.714797,3.325567 1.870463,4.469381 0.577834,0.571908 1.265885,1.034728 2.029916,1.35457 ' +
          'l -0.718163,-3.909793 m 0.718163,3.909793 -3.885211,0.802902',
        height: 13.9,
        width: 13.7,
        heightElements: [],
        widthElements: []
      },
      'MARKER_ADHOC': {
        d: 'm {mx},{my} m 0,2 c 2,-2 4,-2 6,0 c 2,2 4,2 6,0',
        height: 4,
        width: 12,
        heightElements: [],
        widthElements: []
      },
      'TASK_TYPE_SEND': {
        d: 'm {mx},{my} l 0,{e.y1} l {e.x1},0 l 0,-{e.y1} z l {e.x0},{e.y0} l {e.x0},-{e.y0}',
        height: 14,
        width:  21,
        heightElements: [ 6, 14 ],
        widthElements: [ 10.5, 21 ]
      },
      'TASK_TYPE_SCRIPT': {
        d: 'm {mx},{my} c 9.966553,-6.27276 -8.000926,-7.91932 2.968968,-14.938 l -8.802728,0 ' +
          'c -10.969894,7.01868 6.997585,8.66524 -2.968967,14.938 z ' +
          'm -7,-12 l 5,0 ' +
          'm -4.5,3 l 4.5,0 ' +
          'm -3,3 l 5,0' +
          'm -4,3 l 5,0',
        height: 15,
        width:  12.6,
        heightElements: [ 6, 14 ],
        widthElements: [ 10.5, 21 ]
      },
      'TASK_TYPE_USER_1': {
        d: 'm {mx},{my} c 0.909,-0.845 1.594,-2.049 1.594,-3.385 0,-2.554 -1.805,-4.62199999 ' +
          '-4.357,-4.62199999 -2.55199998,0 -4.28799998,2.06799999 -4.28799998,4.62199999 0,1.348 ' +
          '0.974,2.562 1.89599998,3.405 -0.52899998,0.187 -5.669,2.097 -5.794,4.7560005 v 6.718 ' +
          'h 17 v -6.718 c 0,-2.2980005 -5.5279996,-4.5950005 -6.0509996,-4.7760005 z' +
          'm -8,6 l 0,5.5 m 11,0 l 0,-5'
      },
      'TASK_TYPE_USER_2': {
        d: 'm {mx},{my} m 2.162,1.009 c 0,2.4470005 -2.158,4.4310005 -4.821,4.4310005 ' +
          '-2.66499998,0 -4.822,-1.981 -4.822,-4.4310005 '
      },
      'TASK_TYPE_USER_3': {
        d: 'm {mx},{my} m -6.9,-3.80 c 0,0 2.25099998,-2.358 4.27399998,-1.177 2.024,1.181 4.221,1.537 ' +
          '4.124,0.965 -0.098,-0.57 -0.117,-3.79099999 -4.191,-4.13599999 -3.57499998,0.001 ' +
          '-4.20799998,3.36699999 -4.20699998,4.34799999 z'
      },
      'TASK_TYPE_MANUAL': {
        d: 'm {mx},{my} c 0.234,-0.01 5.604,0.008 8.029,0.004 0.808,0 1.271,-0.172 1.417,-0.752 0.227,-0.898 ' +
          '-0.334,-1.314 -1.338,-1.316 -2.467,-0.01 -7.886,-0.004 -8.108,-0.004 -0.014,-0.079 0.016,-0.533 0,-0.61 ' +
          '0.195,-0.042 8.507,0.006 9.616,0.002 0.877,-0.007 1.35,-0.438 1.353,-1.208 0.003,-0.768 -0.479,-1.09 ' +
          '-1.35,-1.091 -2.968,-0.002 -9.619,-0.013 -9.619,-0.013 v -0.591 c 0,0 5.052,-0.016 7.225,-0.016 ' +
          '0.888,-0.002 1.354,-0.416 1.351,-1.193 -0.006,-0.761 -0.492,-1.196 -1.361,-1.196 -3.473,-0.005 ' +
          '-10.86,-0.003 -11.0829995,-0.003 -0.022,-0.047 -0.045,-0.094 -0.069,-0.139 0.3939995,-0.319 ' +
          '2.0409995,-1.626 2.4149995,-2.017 0.469,-0.4870005 0.519,-1.1650005 0.162,-1.6040005 -0.414,-0.511 ' +
          '-0.973,-0.5 -1.48,-0.236 -1.4609995,0.764 -6.5999995,3.6430005 -7.7329995,4.2710005 -0.9,0.499 ' +
          '-1.516,1.253 -1.882,2.19 -0.37000002,0.95 -0.17,2.01 -0.166,2.979 0.004,0.718 -0.27300002,1.345 ' +
          '-0.055,2.063 0.629,2.087 2.425,3.312 4.859,3.318 4.6179995,0.014 9.2379995,-0.139 13.8569995,-0.158 ' +
          '0.755,-0.004 1.171,-0.301 1.182,-1.033 0.012,-0.754 -0.423,-0.969 -1.183,-0.973 -1.778,-0.01 ' +
          '-5.824,-0.004 -6.04,-0.004 10e-4,-0.084 0.003,-0.586 10e-4,-0.67 z'
      },
      'TASK_TYPE_INSTANTIATING_SEND': {
        d: 'm {mx},{my} l 0,8.4 l 12.6,0 l 0,-8.4 z l 6.3,3.6 l 6.3,-3.6'
      },
      'TASK_TYPE_SERVICE': {
        d: 'm {mx},{my} v -1.71335 c 0.352326,-0.0705 0.703932,-0.17838 1.047628,-0.32133 ' +
          '0.344416,-0.14465 0.665822,-0.32133 0.966377,-0.52145 l 1.19431,1.18005 1.567487,-1.57688 ' +
          '-1.195028,-1.18014 c 0.403376,-0.61394 0.683079,-1.29908 0.825447,-2.01824 l 1.622133,-0.01 ' +
          'v -2.2196 l -1.636514,0.01 c -0.07333,-0.35153 -0.178319,-0.70024 -0.323564,-1.04372 ' +
          '-0.145244,-0.34406 -0.321407,-0.6644 -0.522735,-0.96217 l 1.131035,-1.13631 -1.583305,-1.56293 ' +
          '-1.129598,1.13589 c -0.614052,-0.40108 -1.302883,-0.68093 -2.022633,-0.82247 l 0.0093,-1.61852 ' +
          'h -2.241173 l 0.0042,1.63124 c -0.353763,0.0736 -0.705369,0.17977 -1.049785,0.32371 -0.344415,0.14437 ' +
          '-0.665102,0.32092 -0.9635006,0.52046 l -1.1698628,-1.15823 -1.5667691,1.5792 1.1684265,1.15669 ' +
          'c -0.4026573,0.61283 -0.68308,1.29797 -0.8247287,2.01713 l -1.6588041,0.003 v 2.22174 ' +
          'l 1.6724648,-0.006 c 0.073327,0.35077 0.1797598,0.70243 0.3242851,1.04472 0.1452428,0.34448 ' +
          '0.3214064,0.6644 0.5227339,0.96066 l -1.1993431,1.19723 1.5840256,1.56011 1.1964668,-1.19348 ' +
          'c 0.6140517,0.40346 1.3028827,0.68232 2.0233517,0.82331 l 7.19e-4,1.69892 h 2.226848 z ' +
          'm 0.221462,-3.9957 c -1.788948,0.7502 -3.8576,-0.0928 -4.6097055,-1.87438 -0.7521065,-1.78321 ' +
          '0.090598,-3.84627 1.8802645,-4.59604 1.78823,-0.74936 3.856881,0.0929 4.608987,1.87437 ' +
          '0.752106,1.78165 -0.0906,3.84612 -1.879546,4.59605 z'
      },
      'TASK_TYPE_SERVICE_FILL': {
        d: 'm {mx},{my} c -1.788948,0.7502 -3.8576,-0.0928 -4.6097055,-1.87438 -0.7521065,-1.78321 ' +
          '0.090598,-3.84627 1.8802645,-4.59604 1.78823,-0.74936 3.856881,0.0929 4.608987,1.87437 ' +
          '0.752106,1.78165 -0.0906,3.84612 -1.879546,4.59605 z'
      },
      'TASK_TYPE_BUSINESS_RULE_HEADER': {
        d: 'm {mx},{my} 0,4 20,0 0,-4 z'
      },
      'TASK_TYPE_BUSINESS_RULE_MAIN': {
        d: 'm {mx},{my} 0,12 20,0 0,-12 z' +
          'm 0,8 l 20,0 ' +
          'm -13,-4 l 0,8'
      },
      'MESSAGE_FLOW_MARKER': {
        d: 'm {mx},{my} m -10.5 ,-7 l 0,14 l 21,0 l 0,-14 z l 10.5,6 l 10.5,-6'
      }
    };

    /**
     * Return raw path for the given ID.
     *
     * @param {string} pathId
     *
     * @return {string} raw path
     */
    this.getRawPath = function getRawPath(pathId) {
      return this.pathMap[pathId].d;
    };

    /**
     * Scales the path to the given height and width.
     * <h1>Use case</h1>
     * <p>Use case is to scale the content of elements (event, gateways) based
     * on the element bounding box's size.
     * </p>
     * <h1>Why not transform</h1>
     * <p>Scaling a path with transform() will also scale the stroke and IE does not support
     * the option 'non-scaling-stroke' to prevent this.
     * Also there are use cases where only some parts of a path should be
     * scaled.</p>
     *
     * @param {string} pathId The ID of the path.
     * @param {Object} param <p>
     *   Example param object scales the path to 60% size of the container (data.width, data.height).
     *   <pre>
     *   {
     *     xScaleFactor: 0.6,
     *     yScaleFactor:0.6,
     *     containerWidth: data.width,
     *     containerHeight: data.height,
     *     position: {
     *       mx: 0.46,
     *       my: 0.2,
     *     }
     *   }
     *   </pre>
     *   <ul>
     *    <li>targetpathwidth = xScaleFactor * containerWidth</li>
     *    <li>targetpathheight = yScaleFactor * containerHeight</li>
     *    <li>Position is used to set the starting coordinate of the path. M is computed:
      *    <ul>
      *      <li>position.x * containerWidth</li>
      *      <li>position.y * containerHeight</li>
      *    </ul>
      *    Center of the container <pre> position: {
     *       mx: 0.5,
     *       my: 0.5,
     *     }</pre>
     *     Upper left corner of the container
     *     <pre> position: {
     *       mx: 0.0,
     *       my: 0.0,
     *     }</pre>
     *    </li>
     *   </ul>
     * </p>
     *
     * @return {string} scaled path
     */
    this.getScaledPath = function getScaledPath(pathId, param) {
      var rawPath = this.pathMap[pathId];

      // positioning
      // compute the start point of the path
      var mx, my;

      if (param.abspos) {
        mx = param.abspos.x;
        my = param.abspos.y;
      } else {
        mx = param.containerWidth * param.position.mx;
        my = param.containerHeight * param.position.my;
      }

      var coordinates = {}; // map for the scaled coordinates
      if (param.position) {

        // path
        var heightRatio = (param.containerHeight / rawPath.height) * param.yScaleFactor;
        var widthRatio = (param.containerWidth / rawPath.width) * param.xScaleFactor;


        // Apply height ratio
        for (var heightIndex = 0; heightIndex < rawPath.heightElements.length; heightIndex++) {
          coordinates['y' + heightIndex] = rawPath.heightElements[heightIndex] * heightRatio;
        }

        // Apply width ratio
        for (var widthIndex = 0; widthIndex < rawPath.widthElements.length; widthIndex++) {
          coordinates['x' + widthIndex] = rawPath.widthElements[widthIndex] * widthRatio;
        }
      }

      // Apply value to raw path
      var path = format(
        rawPath.d, {
          mx: mx,
          my: my,
          e: coordinates
        }
      );
      return path;
    };
  }

  // helpers //////////////////////

  // copied and adjusted from https://github.com/adobe-webplatform/Snap.svg/blob/master/src/svg.js
  var tokenRegex = /\{([^{}]+)\}/g,
      objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g; // matches .xxxxx or ["xxxxx"] to run over object properties

  function replacer(all, key, obj) {
    var res = obj;
    key.replace(objNotationRegex, function(all, name, quote, quotedName, isFunc) {
      name = name || quotedName;
      if (res) {
        if (name in res) {
          res = res[name];
        }
        typeof res == 'function' && isFunc && (res = res());
      }
    });
    res = (res == null || res == obj ? all : res) + '';

    return res;
  }

  function format(str, obj) {
    return String(str).replace(tokenRegex, function(all, key) {
      return replacer(all, key, obj);
    });
  }

  var DrawModule$1 = {
    __init__: [ 'bpmnRenderer' ],
    bpmnRenderer: [ 'type', BpmnRenderer ],
    textRenderer: [ 'type', TextRenderer ],
    pathMap: [ 'type', PathMap ]
  };

  /**
   * @typedef { {
   *   [key: string]: string;
   * } } TranslateReplacements
   */

  /**
   * A simple translation stub to be used for multi-language support
   * in diagrams. Can be easily replaced with a more sophisticated
   * solution.
   *
   * @example
   *
   * ```javascript
   * // use it inside any diagram component by injecting `translate`.
   *
   * function MyService(translate) {
   *   alert(translate('HELLO {you}', { you: 'You!' }));
   * }
   * ```
   *
   * @param {string} template to interpolate
   * @param {TranslateReplacements} [replacements] a map with substitutes
   *
   * @return {string} the translated string
   */
  function translate(template, replacements) {

    replacements = replacements || {};

    return template.replace(/{([^}]+)}/g, function(_, key) {
      return replacements[key] || '{' + key + '}';
    });
  }

  /**
   * @type { import('didi').ModuleDeclaration }
   */
  var TranslateModule = {
    translate: [ 'value', translate ]
  };

  /**
   * @param {Point} point
   *
   * @returns {Point}
   */
  function roundPoint(point) {

    return {
      x: Math.round(point.x),
      y: Math.round(point.y)
    };
  }


  /**
   * Convert the given bounds to a { top, left, bottom, right } descriptor.
   *
   * @param {Point|Rect} bounds
   *
   * @return {RectTRBL}
   */
  function asTRBL(bounds) {
    return {
      top: bounds.y,
      right: bounds.x + (bounds.width || 0),
      bottom: bounds.y + (bounds.height || 0),
      left: bounds.x
    };
  }


  /**
   * Convert a { top, left, bottom, right } to an objects bounds.
   *
   * @param {RectTRBL} trbl
   *
   * @return {Rect}
   */
  function asBounds(trbl) {
    return {
      x: trbl.left,
      y: trbl.top,
      width: trbl.right - trbl.left,
      height: trbl.bottom - trbl.top
    };
  }


  /**
   * Get the mid of the given bounds or point.
   *
   * @param {Point|Rect} bounds
   *
   * @return {Point}
   */
  function getBoundsMid(bounds) {
    return roundPoint({
      x: bounds.x + (bounds.width || 0) / 2,
      y: bounds.y + (bounds.height || 0) / 2
    });
  }


  /**
   * Get the mid of the given Connection.
   *
   * @param {Connection} connection
   *
   * @return {Point}
   */
  function getConnectionMid(connection) {
    var waypoints = connection.waypoints;

    // calculate total length and length of each segment
    var parts = waypoints.reduce(function(parts, point, index) {

      var lastPoint = waypoints[index - 1];

      if (lastPoint) {
        var lastPart = parts[parts.length - 1];

        var startLength = lastPart && lastPart.endLength || 0;
        var length = distance(lastPoint, point);

        parts.push({
          start: lastPoint,
          end: point,
          startLength: startLength,
          endLength: startLength + length,
          length: length
        });
      }

      return parts;
    }, []);

    var totalLength = parts.reduce(function(length, part) {
      return length + part.length;
    }, 0);

    // find which segement contains middle point
    var midLength = totalLength / 2;

    var i = 0;
    var midSegment = parts[i];

    while (midSegment.endLength < midLength) {
      midSegment = parts[++i];
    }

    // calculate relative position on mid segment
    var segmentProgress = (midLength - midSegment.startLength) / midSegment.length;

    var midPoint = {
      x: midSegment.start.x + (midSegment.end.x - midSegment.start.x) * segmentProgress,
      y: midSegment.start.y + (midSegment.end.y - midSegment.start.y) * segmentProgress
    };

    return midPoint;
  }


  /**
   * Get the mid of the given Element.
   *
   * @param {Element} element
   *
   * @return {Point}
   */
  function getMid(element) {
    if (isConnection(element)) {
      return getConnectionMid(element);
    }

    return getBoundsMid(element);
  }

  // helpers //////////////////////

  function distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  function elementToString(e) {
    if (!e) {
      return '<null>';
    }

    return '<' + e.$type + (e.id ? ' id="' + e.id : '') + '" />';
  }

  /**
   * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
   * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
   * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
   *
   * @typedef {import('../features/modeling/ElementFactory').default} ElementFactory
   * @typedef {import('../draw/TextRenderer').default} TextRenderer
   *
   * @typedef {import('../model/Types').Element} Element
   * @typedef {import('../model/Types').Label} Label
   * @typedef {import('../model/Types').Shape} Shape
   * @typedef {import('../model/Types').Connection} Connection
   * @typedef {import('../model/Types').Root} Root
   * @typedef {import('../model/Types').ModdleElement} ModdleElement
   */

  /**
   * @param {ModdleElement} semantic
   * @param {ModdleElement} di
   * @param {Object} [attrs=null]
   *
   * @return {Object}
   */
  function elementData(semantic, di, attrs) {
    return assign$1({
      id: semantic.id,
      type: semantic.$type,
      businessObject: semantic,
      di: di
    }, attrs);
  }

  function getWaypoints(di, source, target) {

    var waypoints = di.waypoint;

    if (!waypoints || waypoints.length < 2) {
      return [ getMid(source), getMid(target) ];
    }

    return waypoints.map(function(p) {
      return { x: p.x, y: p.y };
    });
  }

  function notYetDrawn(semantic, refSemantic, property) {
    return new Error(
      `element ${ elementToString(refSemantic) } referenced by ${ elementToString(semantic) }#${ property } not yet drawn`
    );
  }


  /**
   * An importer that adds bpmn elements to the canvas
   *
   * @param {EventBus} eventBus
   * @param {Canvas} canvas
   * @param {ElementFactory} elementFactory
   * @param {ElementRegistry} elementRegistry
   * @param {TextRenderer} textRenderer
   */
  function BpmnImporter(
      eventBus, canvas, elementFactory,
      elementRegistry, textRenderer) {

    this._eventBus = eventBus;
    this._canvas = canvas;
    this._elementFactory = elementFactory;
    this._elementRegistry = elementRegistry;
    this._textRenderer = textRenderer;
  }

  BpmnImporter.$inject = [
    'eventBus',
    'canvas',
    'elementFactory',
    'elementRegistry',
    'textRenderer'
  ];


  /**
   * Add a BPMN element (semantic) to the canvas making it a child of the
   * given parent.
   *
   * @param {ModdleElement} semantic
   * @param {ModdleElement} di
   * @param {Shape} parentElement
   *
   * @return {Shape | Root | Connection}
   */
  BpmnImporter.prototype.add = function(semantic, di, parentElement) {
    var element,
        hidden;

    var parentIndex;

    // ROOT ELEMENT
    // handle the special case that we deal with a
    // invisible root element (process, subprocess or collaboration)
    if (is$1(di, 'bpmndi:BPMNPlane')) {

      var attrs = is$1(semantic, 'bpmn:SubProcess')
        ? { id: semantic.id + '_plane' }
        : {};

      // add a virtual element (not being drawn)
      element = this._elementFactory.createRoot(elementData(semantic, di, attrs));

      this._canvas.addRootElement(element);
    }

    // SHAPE
    else if (is$1(di, 'bpmndi:BPMNShape')) {

      var collapsed = !isExpanded(semantic, di),
          isFrame = isFrameElement(semantic);

      hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

      var bounds = di.bounds;

      element = this._elementFactory.createShape(elementData(semantic, di, {
        collapsed: collapsed,
        hidden: hidden,
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
        isFrame: isFrame
      }));

      if (is$1(semantic, 'bpmn:BoundaryEvent')) {
        this._attachBoundary(semantic, element);
      }

      // insert lanes behind other flow nodes (cf. #727)
      if (is$1(semantic, 'bpmn:Lane')) {
        parentIndex = 0;
      }

      if (is$1(semantic, 'bpmn:DataStoreReference')) {

        // check whether data store is inside our outside of its semantic parent
        if (!isPointInsideBBox(parentElement, getMid(bounds))) {
          parentElement = this._canvas.findRoot(parentElement);
        }
      }

      this._canvas.addShape(element, parentElement, parentIndex);
    }

    // CONNECTION
    else if (is$1(di, 'bpmndi:BPMNEdge')) {

      var source = this._getSource(semantic),
          target = this._getTarget(semantic);

      hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

      element = this._elementFactory.createConnection(elementData(semantic, di, {
        hidden: hidden,
        source: source,
        target: target,
        waypoints: getWaypoints(di, source, target)
      }));

      if (is$1(semantic, 'bpmn:DataAssociation')) {

        // render always on top; this ensures DataAssociations
        // are rendered correctly across different "hacks" people
        // love to model such as cross participant / sub process
        // associations
        parentElement = this._canvas.findRoot(parentElement);
      }

      this._canvas.addConnection(element, parentElement, parentIndex);
    } else {
      throw new Error(
        `unknown di ${ elementToString(di) } for element ${ elementToString(semantic) }`
      );
    }

    // (optional) LABEL
    if (isLabelExternal(semantic) && getLabel(element)) {
      this.addLabel(semantic, di, element);
    }

    this._eventBus.fire('bpmnElement.added', { element: element });

    return element;
  };


  /**
   * Attach a boundary element to the given host.
   *
   * @param {ModdleElement} boundarySemantic
   * @param {Shape} boundaryElement
   */
  BpmnImporter.prototype._attachBoundary = function(boundarySemantic, boundaryElement) {
    var hostSemantic = boundarySemantic.attachedToRef;

    if (!hostSemantic) {
      throw new Error(
        `missing ${ elementToString(boundarySemantic) }#attachedToRef`
      );
    }

    var host = this._elementRegistry.get(hostSemantic.id),
        attachers = host && host.attachers;

    if (!host) {
      throw notYetDrawn(boundarySemantic, hostSemantic, 'attachedToRef');
    }

    // wire element.host <> host.attachers
    boundaryElement.host = host;

    if (!attachers) {
      host.attachers = attachers = [];
    }

    if (attachers.indexOf(boundaryElement) === -1) {
      attachers.push(boundaryElement);
    }
  };


  /**
   * Add a label to a given element.
   *
   * @param {ModdleElement} semantic
   * @param {ModdleElement} di
   * @param {Element} element
   *
   * @return {Label}
   */
  BpmnImporter.prototype.addLabel = function(semantic, di, element) {
    var bounds,
        text,
        label;

    bounds = getExternalLabelBounds(di, element);

    text = getLabel(element);

    if (text) {

      // get corrected bounds from actual layouted text
      bounds = this._textRenderer.getExternalLabelBounds(bounds, text);
    }

    label = this._elementFactory.createLabel(elementData(semantic, di, {
      id: semantic.id + '_label',
      labelTarget: element,
      type: 'label',
      hidden: element.hidden || !getLabel(element),
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height)
    }));

    return this._canvas.addShape(label, element.parent);
  };

  /**
   * Get the source or target of the given connection.
   *
   * @param {ModdleElement} semantic
   * @param {'source' | 'target'} side
   *
   * @return {Element}
   */
  BpmnImporter.prototype._getConnectedElement = function(semantic, side) {

    var element,
        refSemantic,
        type = semantic.$type;

    refSemantic = semantic[side + 'Ref'];

    // handle mysterious isMany DataAssociation#sourceRef
    if (side === 'source' && type === 'bpmn:DataInputAssociation') {
      refSemantic = refSemantic && refSemantic[0];
    }

    // fix source / target for DataInputAssociation / DataOutputAssociation
    if (side === 'source' && type === 'bpmn:DataOutputAssociation' ||
        side === 'target' && type === 'bpmn:DataInputAssociation') {

      refSemantic = semantic.$parent;
    }

    element = refSemantic && this._getElement(refSemantic);

    if (element) {
      return element;
    }

    if (refSemantic) {
      throw notYetDrawn(semantic, refSemantic, side + 'Ref');
    } else {
      throw new Error(
        `${ elementToString(semantic) }#${ side } Ref not specified`
      );
    }
  };

  BpmnImporter.prototype._getSource = function(semantic) {
    return this._getConnectedElement(semantic, 'source');
  };

  BpmnImporter.prototype._getTarget = function(semantic) {
    return this._getConnectedElement(semantic, 'target');
  };


  BpmnImporter.prototype._getElement = function(semantic) {
    return this._elementRegistry.get(semantic.id);
  };


  // helpers ////////////////////

  function isPointInsideBBox(bbox, point) {
    var x = point.x,
        y = point.y;

    return x >= bbox.x &&
      x <= bbox.x + bbox.width &&
      y >= bbox.y &&
      y <= bbox.y + bbox.height;
  }

  function isFrameElement(semantic) {
    return is$1(semantic, 'bpmn:Group');
  }

  var ImportModule = {
    __depends__: [
      TranslateModule
    ],
    bpmnImporter: [ 'type', BpmnImporter ]
  };

  var CoreModule$1 = {
    __depends__: [
      DrawModule$1,
      ImportModule
    ]
  };

  /**
   * Util that provides unique IDs.
   *
   * @class
   * @constructor
   *
   * The ids can be customized via a given prefix and contain a random value to avoid collisions.
   *
   * @param {string} [prefix] a prefix to prepend to generated ids (for better readability)
   */
  function IdGenerator(prefix) {

    this._counter = 0;
    this._prefix = (prefix ? prefix + '-' : '') + Math.floor(Math.random() * 1000000000) + '-';
  }

  /**
   * Returns a next unique ID.
   *
   * @return {string} the id
   */
  IdGenerator.prototype.next = function() {
    return this._prefix + (++this._counter);
  };

  // document wide unique overlay ids
  var ids = new IdGenerator('ov');

  var LOW_PRIORITY$2 = 500;

  /**
   * @typedef {import('../../core/Canvas').default} Canvas
   * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
   * @typedef {import('../../core/EventBus').default} EventBus
   *
   * @typedef {import('../../model/Types').Element} Element
   *
   * @typedef { {
   *   minZoom?: number,
   *   maxZoom?: number
   * } } OverlaysConfigShow
   *
   * @typedef { {
   *   min?: number,
   *   max?: number
   * } } OverlaysConfigScale
   *
   * @typedef { {
  *   id: string,
  *   type: string | null,
  *   element: Element | string
  * } & OverlayAttrs } Overlay
  *
   * @typedef { {
   *   html: HTMLElement | string,
   *   position: {
   *     top?: number,
   *     right?: number,
   *     bottom?: number,
   *     left?: number
   *   }
   * } & OverlaysConfigDefault } OverlayAttrs
   *
   * @typedef { {
   *   html: HTMLElement,
   *   element: Element,
   *   overlays: Overlay[]
   * } } OverlayContainer
   *
   * @typedef {{
   *   defaults?: OverlaysConfigDefault
   * }} OverlaysConfig
   *
   * @typedef { {
   *  show?: OverlaysConfigShow,
   *  scale?: OverlaysConfigScale | boolean
   * } } OverlaysConfigDefault
   *
   * @typedef { {
   *   id?: string;
   *   element?: Element | string;
   *   type?: string;
   * } | string } OverlaysFilter
   */

  /**
   * A service that allows users to attach overlays to diagram elements.
   *
   * The overlay service will take care of overlay positioning during updates.
   *
   * @example
   *
   * ```javascript
   * // add a pink badge on the top left of the shape
   *
   * overlays.add(someShape, {
   *   position: {
   *     top: -5,
   *     left: -5
   *   },
   *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
   * });
   *
   * // or add via shape id
   *
   * overlays.add('some-element-id', {
   *   position: {
   *     top: -5,
   *     left: -5
   *   }
   *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
   * });
   *
   * // or add with optional type
   *
   * overlays.add(someShape, 'badge', {
   *   position: {
   *     top: -5,
   *     left: -5
   *   }
   *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
   * });
   * ```
   *
   * ```javascript
   * // remove an overlay
   *
   * var id = overlays.add(...);
   * overlays.remove(id);
   *
   *
   * You may configure overlay defaults during tool by providing a `config` module
   * with `overlays.defaults` as an entry:
   *
   * {
   *   overlays: {
   *     defaults: {
   *       show: {
   *         minZoom: 0.7,
   *         maxZoom: 5.0
   *       },
   *       scale: {
   *         min: 1
   *       }
   *     }
   * }
   * ```
   *
   * @param {OverlaysConfig} config
   * @param {EventBus} eventBus
   * @param {Canvas} canvas
   * @param {ElementRegistry} elementRegistry
   */
  function Overlays(config, eventBus, canvas, elementRegistry) {
    this._eventBus = eventBus;
    this._canvas = canvas;
    this._elementRegistry = elementRegistry;

    this._ids = ids;

    /**
     * @type {OverlaysConfigDefault}
     */
    this._overlayDefaults = assign$1({

      // no show constraints
      show: null,

      // always scale
      scale: true
    }, config && config.defaults);

    /**
     * @type {Record<string, Overlay>}
     */
    this._overlays = {};

    /**
     * @type {OverlayContainer[]}
     */
    this._overlayContainers = [];

    /**
     * @type {HTMLElement}
     */
    this._overlayRoot = createRoot(canvas.getContainer());

    this._init();
  }


  Overlays.$inject = [
    'config.overlays',
    'eventBus',
    'canvas',
    'elementRegistry'
  ];


  /**
   * Returns the overlay with the specified ID or a list of overlays
   * for an element with a given type.
   *
   * @example
   *
   * ```javascript
   * // return the single overlay with the given ID
   * overlays.get('some-id');
   *
   * // return all overlays for the shape
   * overlays.get({ element: someShape });
   *
   * // return all overlays on shape with type 'badge'
   * overlays.get({ element: someShape, type: 'badge' });
   *
   * // shape can also be specified as ID
   * overlays.get({ element: 'element-id', type: 'badge' });
   * ```
   *
   * @param {OverlaysFilter} search The filter to be used to find the overlay(s).
   *
   * @return {Overlay|Overlay[]} The overlay(s).
   */
  Overlays.prototype.get = function(search) {

    if (isString(search)) {
      search = { id: search };
    }

    if (isString(search.element)) {
      search.element = this._elementRegistry.get(search.element);
    }

    if (search.element) {
      var container = this._getOverlayContainer(search.element, true);

      // return a list of overlays when searching by element (+type)
      if (container) {
        return search.type ? filter(container.overlays, matchPattern({ type: search.type })) : container.overlays.slice();
      } else {
        return [];
      }
    } else if (search.type) {
      return filter(this._overlays, matchPattern({ type: search.type }));
    } else {

      // return single element when searching by id
      return search.id ? this._overlays[search.id] : null;
    }
  };

  /**
   * Adds an HTML overlay to an element.
   *
   * @param {Element|string} element The element to add the overlay to.
   * @param {string} [type] An optional type that can be used to filter.
   * @param {OverlayAttrs} overlay The overlay.
   *
   * @return {string} The overlay's ID that can be used to get or remove it.
   */
  Overlays.prototype.add = function(element, type, overlay) {

    if (isObject(type)) {
      overlay = type;
      type = null;
    }

    if (!element.id) {
      element = this._elementRegistry.get(element);
    }

    if (!overlay.position) {
      throw new Error('must specifiy overlay position');
    }

    if (!overlay.html) {
      throw new Error('must specifiy overlay html');
    }

    if (!element) {
      throw new Error('invalid element specified');
    }

    var id = this._ids.next();

    overlay = assign$1({}, this._overlayDefaults, overlay, {
      id: id,
      type: type,
      element: element,
      html: overlay.html
    });

    this._addOverlay(overlay);

    return id;
  };


  /**
   * Remove an overlay with the given ID or all overlays matching the given filter.
   *
   * @see Overlays#get for filter options.
   *
   * @param {OverlaysFilter} filter The filter to be used to find the overlay.
   */
  Overlays.prototype.remove = function(filter) {

    var overlays = this.get(filter) || [];

    if (!isArray$1(overlays)) {
      overlays = [ overlays ];
    }

    var self = this;

    forEach(overlays, function(overlay) {

      var container = self._getOverlayContainer(overlay.element, true);

      if (overlay) {
        remove$1(overlay.html);
        remove$1(overlay.htmlContainer);

        delete overlay.htmlContainer;
        delete overlay.element;

        delete self._overlays[overlay.id];
      }

      if (container) {
        var idx = container.overlays.indexOf(overlay);
        if (idx !== -1) {
          container.overlays.splice(idx, 1);
        }
      }
    });

  };

  /**
   * Checks whether overlays are shown.
   *
   * @return {boolean} Whether overlays are shown.
   */
  Overlays.prototype.isShown = function() {
    return this._overlayRoot.style.display !== 'none';
  };

  /**
   * Show all overlays.
   */
  Overlays.prototype.show = function() {
    setVisible(this._overlayRoot);
  };

  /**
   * Hide all overlays.
   */
  Overlays.prototype.hide = function() {
    setVisible(this._overlayRoot, false);
  };

  /**
   * Remove all overlays and their container.
   */
  Overlays.prototype.clear = function() {
    this._overlays = {};

    this._overlayContainers = [];

    clear(this._overlayRoot);
  };

  Overlays.prototype._updateOverlayContainer = function(container) {
    var element = container.element,
        html = container.html;

    // update container left,top according to the elements x,y coordinates
    // this ensures we can attach child elements relative to this container

    var x = element.x,
        y = element.y;

    if (element.waypoints) {
      var bbox = getBBox(element);
      x = bbox.x;
      y = bbox.y;
    }

    setPosition(html, x, y);

    attr(container.html, 'data-container-id', element.id);
  };


  Overlays.prototype._updateOverlay = function(overlay) {

    var position = overlay.position,
        htmlContainer = overlay.htmlContainer,
        element = overlay.element;

    // update overlay html relative to shape because
    // it is already positioned on the element

    // update relative
    var left = position.left,
        top = position.top;

    if (position.right !== undefined) {

      var width;

      if (element.waypoints) {
        width = getBBox(element).width;
      } else {
        width = element.width;
      }

      left = position.right * -1 + width;
    }

    if (position.bottom !== undefined) {

      var height;

      if (element.waypoints) {
        height = getBBox(element).height;
      } else {
        height = element.height;
      }

      top = position.bottom * -1 + height;
    }

    setPosition(htmlContainer, left || 0, top || 0);
    this._updateOverlayVisibilty(overlay, this._canvas.viewbox());
  };


  Overlays.prototype._createOverlayContainer = function(element) {
    var html = domify('<div class="djs-overlays" />');
    assign(html, { position: 'absolute' });

    this._overlayRoot.appendChild(html);

    var container = {
      html: html,
      element: element,
      overlays: []
    };

    this._updateOverlayContainer(container);

    this._overlayContainers.push(container);

    return container;
  };


  Overlays.prototype._updateRoot = function(viewbox) {
    var scale = viewbox.scale || 1;

    var matrix = 'matrix(' +
    [
      scale,
      0,
      0,
      scale,
      -1 * viewbox.x * scale,
      -1 * viewbox.y * scale
    ].join(',') +
    ')';

    setTransform(this._overlayRoot, matrix);
  };


  Overlays.prototype._getOverlayContainer = function(element, raw) {
    var container = find(this._overlayContainers, function(c) {
      return c.element === element;
    });


    if (!container && !raw) {
      return this._createOverlayContainer(element);
    }

    return container;
  };


  Overlays.prototype._addOverlay = function(overlay) {

    var id = overlay.id,
        element = overlay.element,
        html = overlay.html,
        htmlContainer,
        overlayContainer;

    // unwrap jquery (for those who need it)
    if (html.get && html.constructor.prototype.jquery) {
      html = html.get(0);
    }

    // create proper html elements from
    // overlay HTML strings
    if (isString(html)) {
      html = domify(html);
    }

    overlayContainer = this._getOverlayContainer(element);

    htmlContainer = domify('<div class="djs-overlay" data-overlay-id="' + id + '">');
    assign(htmlContainer, { position: 'absolute' });

    htmlContainer.appendChild(html);

    if (overlay.type) {
      classes(htmlContainer).add('djs-overlay-' + overlay.type);
    }

    var elementRoot = this._canvas.findRoot(element);
    var activeRoot = this._canvas.getRootElement();

    setVisible(htmlContainer, elementRoot === activeRoot);

    overlay.htmlContainer = htmlContainer;

    overlayContainer.overlays.push(overlay);
    overlayContainer.html.appendChild(htmlContainer);

    this._overlays[id] = overlay;

    this._updateOverlay(overlay);
    this._updateOverlayVisibilty(overlay, this._canvas.viewbox());
  };


  Overlays.prototype._updateOverlayVisibilty = function(overlay, viewbox) {
    var show = overlay.show,
        rootElement = this._canvas.findRoot(overlay.element),
        minZoom = show && show.minZoom,
        maxZoom = show && show.maxZoom,
        htmlContainer = overlay.htmlContainer,
        activeRootElement = this._canvas.getRootElement(),
        visible = true;

    if (rootElement !== activeRootElement) {
      visible = false;
    } else if (show) {
      if (
        (isDefined(minZoom) && minZoom > viewbox.scale) ||
        (isDefined(maxZoom) && maxZoom < viewbox.scale)
      ) {
        visible = false;
      }
    }

    setVisible(htmlContainer, visible);

    this._updateOverlayScale(overlay, viewbox);
  };


  Overlays.prototype._updateOverlayScale = function(overlay, viewbox) {
    var shouldScale = overlay.scale,
        minScale,
        maxScale,
        htmlContainer = overlay.htmlContainer;

    var scale, transform = '';

    if (shouldScale !== true) {

      if (shouldScale === false) {
        minScale = 1;
        maxScale = 1;
      } else {
        minScale = shouldScale.min;
        maxScale = shouldScale.max;
      }

      if (isDefined(minScale) && viewbox.scale < minScale) {
        scale = (1 / viewbox.scale || 1) * minScale;
      }

      if (isDefined(maxScale) && viewbox.scale > maxScale) {
        scale = (1 / viewbox.scale || 1) * maxScale;
      }
    }

    if (isDefined(scale)) {
      transform = 'scale(' + scale + ',' + scale + ')';
    }

    setTransform(htmlContainer, transform);
  };


  Overlays.prototype._updateOverlaysVisibilty = function(viewbox) {

    var self = this;

    forEach(this._overlays, function(overlay) {
      self._updateOverlayVisibilty(overlay, viewbox);
    });
  };


  Overlays.prototype._init = function() {

    var eventBus = this._eventBus;

    var self = this;


    // scroll/zoom integration

    function updateViewbox(viewbox) {
      self._updateRoot(viewbox);
      self._updateOverlaysVisibilty(viewbox);

      self.show();
    }

    eventBus.on('canvas.viewbox.changing', function(event) {
      self.hide();
    });

    eventBus.on('canvas.viewbox.changed', function(event) {
      updateViewbox(event.viewbox);
    });


    // remove integration

    eventBus.on([ 'shape.remove', 'connection.remove' ], function(e) {
      var element = e.element;
      var overlays = self.get({ element: element });

      forEach(overlays, function(o) {
        self.remove(o.id);
      });

      var container = self._getOverlayContainer(element);

      if (container) {
        remove$1(container.html);
        var i = self._overlayContainers.indexOf(container);
        if (i !== -1) {
          self._overlayContainers.splice(i, 1);
        }
      }
    });


    // move integration

    eventBus.on('element.changed', LOW_PRIORITY$2, function(e) {
      var element = e.element;

      var container = self._getOverlayContainer(element, true);

      if (container) {
        forEach(container.overlays, function(overlay) {
          self._updateOverlay(overlay);
        });

        self._updateOverlayContainer(container);
      }
    });


    // marker integration, simply add them on the overlays as classes, too.

    eventBus.on('element.marker.update', function(e) {
      var container = self._getOverlayContainer(e.element, true);
      if (container) {
        classes(container.html)[e.add ? 'add' : 'remove'](e.marker);
      }
    });


    eventBus.on('root.set', function() {
      self._updateOverlaysVisibilty(self._canvas.viewbox());
    });

    // clear overlays with diagram

    eventBus.on('diagram.clear', this.clear, this);
  };



  // helpers /////////////////////////////

  function createRoot(parentNode) {
    var root = domify(
      '<div class="djs-overlay-container" />'
    );

    assign(root, {
      position: 'absolute',
      width: 0,
      height: 0
    });

    parentNode.insertBefore(root, parentNode.firstChild);

    return root;
  }

  function setPosition(el, x, y) {
    assign(el, { left: x + 'px', top: y + 'px' });
  }

  /**
   * Set element visible
   *
   * @param {DOMElement} el
   * @param {boolean} [visible=true]
   */
  function setVisible(el, visible) {
    el.style.display = visible === false ? 'none' : '';
  }

  function setTransform(el, transform) {

    el.style['transform-origin'] = 'top left';

    [ '', '-ms-', '-webkit-' ].forEach(function(prefix) {
      el.style[prefix + 'transform'] = transform;
    });
  }

  /**
   * @type { import('didi').ModuleDeclaration }
   */
  var OverlaysModule = {
    __init__: [ 'overlays' ],
    overlays: [ 'type', Overlays ]
  };

  /**
   * @typedef {import('../../core/Canvas').default} Canvas
   * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
   * @typedef {import('../../core/EventBus').default} EventBus
   * @typedef {import('../../core/GraphicsFactory').default} GraphicsFactory
   */

  /**
   * Adds change support to the diagram, including
   *
   * <ul>
   *   <li>redrawing shapes and connections on change</li>
   * </ul>
   *
   * @param {EventBus} eventBus
   * @param {Canvas} canvas
   * @param {ElementRegistry} elementRegistry
   * @param {GraphicsFactory} graphicsFactory
   */
  function ChangeSupport(
      eventBus, canvas, elementRegistry,
      graphicsFactory) {


    // redraw shapes / connections on change

    eventBus.on('element.changed', function(event) {

      var element = event.element;

      // element might have been deleted and replaced by new element with same ID
      // thus check for parent of element except for root element
      if (element.parent || element === canvas.getRootElement()) {
        event.gfx = elementRegistry.getGraphics(element);
      }

      // shape + gfx may have been deleted
      if (!event.gfx) {
        return;
      }

      eventBus.fire(getType(element) + '.changed', event);
    });

    eventBus.on('elements.changed', function(event) {

      var elements = event.elements;

      elements.forEach(function(e) {
        eventBus.fire('element.changed', { element: e });
      });

      graphicsFactory.updateContainments(elements);
    });

    eventBus.on('shape.changed', function(event) {
      graphicsFactory.update('shape', event.element, event.gfx);
    });

    eventBus.on('connection.changed', function(event) {
      graphicsFactory.update('connection', event.element, event.gfx);
    });
  }

  ChangeSupport.$inject = [
    'eventBus',
    'canvas',
    'elementRegistry',
    'graphicsFactory'
  ];

  /**
   * @type { import('didi').ModuleDeclaration }
   */
  var ChangeSupportModule = {
    __init__: [ 'changeSupport' ],
    changeSupport: [ 'type', ChangeSupport ]
  };

  /**
   * @typedef {import('../core/Types').ElementLike} ElementLike
   * @typedef {import('../core/EventBus').default} EventBus
   * @typedef {import('./CommandStack').CommandContext} CommandContext
   *
   * @typedef {string|string[]} Events
   * @typedef { (context: CommandContext) => ElementLike[] | void } HandlerFunction
   * @typedef { (context: CommandContext) => void } ComposeHandlerFunction
   */

  var DEFAULT_PRIORITY$1 = 1000;

  /**
   * A utility that can be used to plug into the command execution for
   * extension and/or validation.
   *
   * @class
   * @constructor
   *
   * @example
   *
   * ```javascript
   * import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
   *
   * class CommandLogger extends CommandInterceptor {
   *   constructor(eventBus) {
   *     super(eventBus);
   *
   *   this.preExecute('shape.create', (event) => {
   *     console.log('commandStack.shape-create.preExecute', event);
   *   });
   * }
   * ```
   *
   * @param {EventBus} eventBus
   */
  function CommandInterceptor(eventBus) {

    /**
     * @type {EventBus}
     */
    this._eventBus = eventBus;
  }

  CommandInterceptor.$inject = [ 'eventBus' ];

  function unwrapEvent(fn, that) {
    return function(event) {
      return fn.call(that || null, event.context, event.command, event);
    };
  }


  /**
   * Intercept a command during one of the phases.
   *
   * @param {Events} [events] command(s) to intercept
   * @param {string} [hook] phase to intercept
   * @param {number} [priority]
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
   * @param {boolean} [unwrap] whether the event should be unwrapped
   * @param {any} [that]
   */
  CommandInterceptor.prototype.on = function(events, hook, priority, handlerFn, unwrap, that) {

    if (isFunction(hook) || isNumber(hook)) {
      that = unwrap;
      unwrap = handlerFn;
      handlerFn = priority;
      priority = hook;
      hook = null;
    }

    if (isFunction(priority)) {
      that = unwrap;
      unwrap = handlerFn;
      handlerFn = priority;
      priority = DEFAULT_PRIORITY$1;
    }

    if (isObject(unwrap)) {
      that = unwrap;
      unwrap = false;
    }

    if (!isFunction(handlerFn)) {
      throw new Error('handlerFn must be a function');
    }

    if (!isArray$1(events)) {
      events = [ events ];
    }

    var eventBus = this._eventBus;

    forEach(events, function(event) {

      // concat commandStack(.event)?(.hook)?
      var fullEvent = [ 'commandStack', event, hook ].filter(function(e) { return e; }).join('.');

      eventBus.on(fullEvent, priority, unwrap ? unwrapEvent(handlerFn, that) : handlerFn, that);
    });
  };

  /**
   * Add a <canExecute> phase of command interceptor.
   *
   * @param {Events} [events] command(s) to intercept
   * @param {number} [priority]
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
   * @param {boolean} [unwrap] whether the event should be unwrapped
   * @param {any} [that]
   */
  CommandInterceptor.prototype.canExecute = createHook('canExecute');

  /**
   * Add a <preExecute> phase of command interceptor.
   *
   * @param {Events} [events] command(s) to intercept
   * @param {number} [priority]
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
   * @param {boolean} [unwrap] whether the event should be unwrapped
   * @param {any} [that]
   */
  CommandInterceptor.prototype.preExecute = createHook('preExecute');

  /**
   * Add a <preExecuted> phase of command interceptor.
   *
   * @param {Events} [events] command(s) to intercept
   * @param {number} [priority]
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
   * @param {boolean} [unwrap] whether the event should be unwrapped
   * @param {any} [that]
   */
  CommandInterceptor.prototype.preExecuted = createHook('preExecuted');

  /**
   * Add a <execute> phase of command interceptor.
   *
   * @param {Events} [events] command(s) to intercept
   * @param {number} [priority]
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
   * @param {boolean} [unwrap] whether the event should be unwrapped
   * @param {any} [that]
   */
  CommandInterceptor.prototype.execute = createHook('execute');

  /**
   * Add a <executed> phase of command interceptor.
   *
   * @param {Events} [events] command(s) to intercept
   * @param {number} [priority]
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
   * @param {boolean} [unwrap] whether the event should be unwrapped
   * @param {any} [that]
   */
  CommandInterceptor.prototype.executed = createHook('executed');

  /**
   * Add a <postExecute> phase of command interceptor.
   *
   * @param {Events} [events] command(s) to intercept
   * @param {number} [priority]
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
   * @param {boolean} [unwrap] whether the event should be unwrapped
   * @param {any} [that]
   */
  CommandInterceptor.prototype.postExecute = createHook('postExecute');

  /**
   * Add a <postExecuted> phase of command interceptor.
   *
   * @param {Events} [events] command(s) to intercept
   * @param {number} [priority]
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
   * @param {boolean} [unwrap] whether the event should be unwrapped
   * @param {any} [that]
   */
  CommandInterceptor.prototype.postExecuted = createHook('postExecuted');

  /**
   * Add a <revert> phase of command interceptor.
   *
   * @param {Events} [events] command(s) to intercept
   * @param {number} [priority]
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
   * @param {boolean} [unwrap] whether the event should be unwrapped
   * @param {any} [that]
   */
  CommandInterceptor.prototype.revert = createHook('revert');

  /**
   * Add a <reverted> phase of command interceptor.
   *
   * @param {Events} [events] command(s) to intercept
   * @param {number} [priority]
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
   * @param {boolean} [unwrap] whether the event should be unwrapped
   * @param {any} [that]
   */
  CommandInterceptor.prototype.reverted = createHook('reverted');

  /*
   * Add prototype methods for each phase of command execution (e.g. execute,
   * revert).
   *
   * @param {string} hook
   *
   * @return { (
   *   events?: Events,
   *   priority?: number,
   *   handlerFn: ComposeHandlerFunction|HandlerFunction,
   *   unwrap?: boolean
   * ) => any }
   */
  function createHook(hook) {

    /**
     * @this {CommandInterceptor}
     *
     * @param {Events} [events]
     * @param {number} [priority]
     * @param {ComposeHandlerFunction|HandlerFunction} handlerFn
     * @param {boolean} [unwrap]
     * @param {any} [that]
     */
    const hookFn = function(events, priority, handlerFn, unwrap, that) {

      if (isFunction(events) || isNumber(events)) {
        that = unwrap;
        unwrap = handlerFn;
        handlerFn = priority;
        priority = events;
        events = null;
      }

      this.on(events, hook, priority, handlerFn, unwrap, that);
    };

    return hookFn;
  }

  /**
   * @typedef {import('didi').Injector} Injector
   *
   * @typedef {import('../../core/Canvas').default} Canvas
   */

  /**
   * A modeling behavior that ensures we set the correct root element
   * as we undo and redo commands.
   *
   * @param {Canvas} canvas
   * @param {Injector} injector
   */
  function RootElementsBehavior(canvas, injector) {

    injector.invoke(CommandInterceptor, this);

    this.executed(function(event) {
      var context = event.context;

      if (context.rootElement) {
        canvas.setRootElement(context.rootElement);
      } else {
        context.rootElement = canvas.getRootElement();
      }
    });

    this.revert(function(event) {
      var context = event.context;

      if (context.rootElement) {
        canvas.setRootElement(context.rootElement);
      }
    });
  }

  e(RootElementsBehavior, CommandInterceptor);

  RootElementsBehavior.$inject = [ 'canvas', 'injector' ];

  /**
   * @type { import('didi').ModuleDeclaration }
   */
  var RootElementsModule = {
    __init__: [ 'rootElementsBehavior' ],
    rootElementsBehavior: [ 'type', RootElementsBehavior ]
  };

  /**
   * @param {string} str
   *
   * @return {string}
   */

  var HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
  };

  /**
   * @param {string} str
   *
   * @return {string}
   */
  function escapeHTML(str) {
    str = '' + str;

    return str && str.replace(/[&<>"']/g, function(match) {
      return HTML_ESCAPE_MAP[match];
    });
  }

  /**
   * @typedef {import('../model/Types').Element} Element
   * @typedef {import('../model/Types').ModdleElement} ModdleElement
   */

  var planeSuffix = '_plane';

  /**
   * Get plane ID for a primary shape.
   *
   * @param  {Element|ModdleElement} element
   *
   * @return {string}
   */
  function getPlaneIdFromShape(element) {
    var id = element.id;

    if (is$1(element, 'bpmn:SubProcess')) {
      return addPlaneSuffix(id);
    }

    return id;
  }

  function addPlaneSuffix(id) {
    return id + planeSuffix;
  }

  /**
   * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
   * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
   * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
   *
   * @typedef {import('../../model/Types').Element} Element
   * @typedef {import('../../model/Types').Shape} Shape
   */

  var OPEN_CLASS = 'bjs-breadcrumbs-shown';


  /**
   * Adds overlays that allow switching planes on collapsed subprocesses.
   *
   * @param {EventBus} eventBus
   * @param {ElementRegistry} elementRegistry
   * @param {Canvas} canvas
   */
  function DrilldownBreadcrumbs(eventBus, elementRegistry, canvas) {
    var breadcrumbs = domify('<ul class="bjs-breadcrumbs"></ul>');
    var container = canvas.getContainer();
    var containerClasses = classes(container);
    container.appendChild(breadcrumbs);

    var businessObjectParents = [];

    // update breadcrumbs if name or ID of the primary shape changes
    eventBus.on('element.changed', function(event) {
      var shape = event.element,
          businessObject = getBusinessObject(shape);

      var isPresent = find(businessObjectParents, function(element) {
        return element === businessObject;
      });

      if (!isPresent) {
        return;
      }

      updateBreadcrumbs();
    });

    /**
     * Updates the displayed breadcrumbs. If no element is provided, only the
     * labels are updated.
     *
     * @param {Element} [element]
     */
    function updateBreadcrumbs(element) {
      if (element) {
        businessObjectParents = getBusinessObjectParentChain(element);
      }

      var path = businessObjectParents.flatMap(function(parent) {
        var parentPlane =
          canvas.findRoot(getPlaneIdFromShape(parent)) ||
          canvas.findRoot(parent.id);

        // when the root is a collaboration, the process does not have a
        // corresponding element in the elementRegisty. Instead, we search
        // for the corresponding participant
        if (!parentPlane && is$1(parent, 'bpmn:Process')) {
          var participant = elementRegistry.find(function(element) {
            var businessObject = getBusinessObject(element);

            return businessObject && businessObject.get('processRef') === parent;
          });

          parentPlane = participant && canvas.findRoot(participant.id);
        }

        if (!parentPlane) {
          return [];
        }

        var title = escapeHTML(parent.name || parent.id);
        var link = domify('<li><span class="bjs-crumb"><a title="' + title + '">' + title + '</a></span></li>');

        link.addEventListener('click', function() {
          canvas.setRootElement(parentPlane);
        });

        return link;
      });

      breadcrumbs.innerHTML = '';

      // show breadcrumbs and expose state to .djs-container
      var visible = path.length > 1;

      containerClasses.toggle(OPEN_CLASS, visible);

      path.forEach(function(element) {
        breadcrumbs.appendChild(element);
      });
    }

    eventBus.on('root.set', function(event) {
      updateBreadcrumbs(event.element);
    });

  }

  DrilldownBreadcrumbs.$inject = [ 'eventBus', 'elementRegistry', 'canvas' ];


  // helpers //////////

  /**
   * Returns the parents for the element using the business object chain,
   * starting with the root element.
   *
   * @param {Shape} child
   *
   * @return {Shape}
   */
  function getBusinessObjectParentChain(child) {
    var businessObject = getBusinessObject(child);

    var parents = [];

    for (var element = businessObject; element; element = element.$parent) {
      if (is$1(element, 'bpmn:SubProcess') || is$1(element, 'bpmn:Process')) {
        parents.push(element);
      }
    }

    return parents.reverse();
  }

  /**
   * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
   * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
   */

  /**
   * Move collapsed subprocesses into view when drilling down.
   *
   * Zoom and scroll are saved in a session.
   *
   * @param {EventBus} eventBus
   * @param {Canvas} canvas
   */
  function DrilldownCentering(eventBus, canvas) {

    var currentRoot = null;
    var positionMap = new Map();

    eventBus.on('root.set', function(event) {
      var newRoot = event.element;
      var currentViewbox = canvas.viewbox();
      var storedViewbox = positionMap.get(newRoot);

      positionMap.set(currentRoot, {
        x: currentViewbox.x,
        y: currentViewbox.y,
        zoom: currentViewbox.scale
      });

      currentRoot = newRoot;

      // Keep viewbox when replacing root elements
      if (!is$1(newRoot, 'bpmn:SubProcess') && !storedViewbox) {
        return;
      }

      storedViewbox = storedViewbox || { x: 0, y: 0, zoom: 1 };

      var dx = (currentViewbox.x - storedViewbox.x) * currentViewbox.scale,
          dy = (currentViewbox.y - storedViewbox.y) * currentViewbox.scale;

      if (dx !== 0 || dy !== 0) {
        canvas.scroll({
          dx: dx,
          dy: dy
        });
      }

      if (storedViewbox.zoom !== currentViewbox.scale) {
        canvas.zoom(storedViewbox.zoom, { x: 0, y: 0 });
      }
    });

    eventBus.on('diagram.clear', function() {
      positionMap.clear();
      currentRoot = null;
    });

  }

  DrilldownCentering.$inject = [ 'eventBus', 'canvas' ];


  /**
   * ES5 Map implementation. Works.
   */
  function Map() {

    this._entries = [];

    this.set = function(key, value) {

      var found = false;

      for (var k in this._entries) {
        if (this._entries[k][0] === key) {
          this._entries[k][1] = value;

          found = true;

          break;
        }
      }

      if (!found) {
        this._entries.push([ key, value ]);
      }
    };

    this.get = function(key) {

      for (var k in this._entries) {
        if (this._entries[k][0] === key) {
          return this._entries[k][1];
        }
      }

      return null;
    };

    this.clear = function() {
      this._entries.length = 0;
    };

    this.remove = function(key) {

      var idx = -1;

      for (var k in this._entries) {
        if (this._entries[k][0] === key) {
          idx = k;

          break;
        }
      }

      if (idx !== -1) {
        this._entries.splice(idx, 1);
      }
    };
  }

  /**
   * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
   * @typedef {import('../../model/Types').Moddle} Moddle
   *
   * @typedef {import('../../model/Types').Element} Element
   * @typedef {import('../../model/Types').Shape} Shape
   *
   * @typedef {import('diagram-js/lib/core/Canvas').CanvasPlane} CanvasPlane
   *
   * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
   */

  var DEFAULT_POSITION = {
    x: 180,
    y: 160
  };

  /**
   * Hook into `import.render.start` and create new planes for diagrams with
   * collapsed subprocesses and all DI elements on the same plane.
   *
   * @param {EventBus} eventBus
   * @param {Moddle} moddle
   */
  function SubprocessCompatibility(eventBus, moddle) {
    this._eventBus = eventBus;
    this._moddle = moddle;

    var self = this;

    eventBus.on('import.render.start', 1500, function(e, context) {
      self._handleImport(context.definitions);
    });
  }

  /**
   * @param {ModdleElement} definitions
   */
  SubprocessCompatibility.prototype._handleImport = function(definitions) {
    if (!definitions.diagrams) {
      return;
    }

    var self = this;
    this._definitions = definitions;
    this._processToDiagramMap = {};

    definitions.diagrams.forEach(function(diagram) {
      if (!diagram.plane || !diagram.plane.bpmnElement) {
        return;
      }

      self._processToDiagramMap[diagram.plane.bpmnElement.id] = diagram;
    });

    var newDiagrams = definitions.diagrams
      .filter(diagram => diagram.plane)
      .flatMap(diagram => self._createNewDiagrams(diagram.plane));

    newDiagrams.forEach(function(diagram) {
      self._movePlaneElementsToOrigin(diagram.plane);
    });
  };


  /**
   * Moves all DI elements from collapsed subprocesses to a new plane.
   *
   * @param {CanvasPlane} plane
   *
   * @return {ModdleElement[]} new diagrams created for the collapsed subprocesses
   */
  SubprocessCompatibility.prototype._createNewDiagrams = function(plane) {
    var self = this;

    var collapsedElements = [];
    var elementsToMove = [];

    plane.get('planeElement').forEach(function(diElement) {
      var businessObject = diElement.bpmnElement;

      if (!businessObject) {
        return;
      }

      var parent = businessObject.$parent;

      if (is$1(businessObject, 'bpmn:SubProcess') && !diElement.isExpanded) {
        collapsedElements.push(businessObject);
      }

      if (shouldMoveToPlane(businessObject, plane)) {

        // don't change the array while we iterate over it
        elementsToMove.push({ diElement: diElement, parent: parent });
      }
    });

    var newDiagrams = [];

    // create new planes for all collapsed subprocesses, even when they are empty
    collapsedElements.forEach(function(element) {
      if (!self._processToDiagramMap[ element.id ]) {
        var diagram = self._createDiagram(element);

        self._processToDiagramMap[element.id] = diagram;

        newDiagrams.push(diagram);
      }
    });

    elementsToMove.forEach(function(element) {
      var diElement = element.diElement;
      var parent = element.parent;

      // parent is expanded, get nearest collapsed parent
      while (parent && collapsedElements.indexOf(parent) === -1) {
        parent = parent.$parent;
      }

      // false positive, all parents are expanded
      if (!parent) {
        return;
      }

      var diagram = self._processToDiagramMap[ parent.id ];

      self._moveToDiPlane(diElement, diagram.plane);
    });

    return newDiagrams;
  };

  /**
   * @param {CanvasPlane} plane
   */
  SubprocessCompatibility.prototype._movePlaneElementsToOrigin = function(plane) {
    var elements = plane.get('planeElement');

    // get bounding box of all elements
    var planeBounds = getPlaneBounds(plane);

    var offset = {
      x: planeBounds.x - DEFAULT_POSITION.x,
      y: planeBounds.y - DEFAULT_POSITION.y
    };

    elements.forEach(function(diElement) {
      if (diElement.waypoint) {
        diElement.waypoint.forEach(function(waypoint) {
          waypoint.x = waypoint.x - offset.x;
          waypoint.y = waypoint.y - offset.y;
        });
      } else if (diElement.bounds) {
        diElement.bounds.x = diElement.bounds.x - offset.x;
        diElement.bounds.y = diElement.bounds.y - offset.y;
      }
    });
  };

  /**
   * @param {ModdleElement} diElement
   * @param {CanvasPlane} newPlane
   */
  SubprocessCompatibility.prototype._moveToDiPlane = function(diElement, newPlane) {
    var containingDiagram = findRootDiagram(diElement);

    // remove DI from old Plane and add it to the new one
    var parentPlaneElement = containingDiagram.plane.get('planeElement');

    parentPlaneElement.splice(parentPlaneElement.indexOf(diElement), 1);

    newPlane.get('planeElement').push(diElement);
  };

  /**
   * @param {ModdleElement} businessObject
   *
   * @return {ModdleElement}
   */
  SubprocessCompatibility.prototype._createDiagram = function(businessObject) {
    var plane = this._moddle.create('bpmndi:BPMNPlane', {
      bpmnElement: businessObject
    });

    var diagram = this._moddle.create('bpmndi:BPMNDiagram', {
      plane: plane
    });

    plane.$parent = diagram;

    plane.bpmnElement = businessObject;

    diagram.$parent = this._definitions;

    this._definitions.diagrams.push(diagram);

    return diagram;
  };

  SubprocessCompatibility.$inject = [ 'eventBus', 'moddle' ];


  // helpers //////////

  function findRootDiagram(element) {
    if (is$1(element, 'bpmndi:BPMNDiagram')) {
      return element;
    } else {
      return findRootDiagram(element.$parent);
    }
  }

  /**
   * @param {CanvasPlane} plane
   *
   * @return {Rect}
   */
  function getPlaneBounds(plane) {
    var planeTrbl = {
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity,
      left: Infinity
    };

    plane.planeElement.forEach(function(element) {
      if (!element.bounds) {
        return;
      }

      var trbl = asTRBL(element.bounds);

      planeTrbl.top = Math.min(trbl.top, planeTrbl.top);
      planeTrbl.left = Math.min(trbl.left, planeTrbl.left);
    });

    return asBounds(planeTrbl);
  }

  /**
   * @param {ModdleElement} businessObject
   * @param {CanvasPlane} plane
   *
   * @return {boolean}
   */
  function shouldMoveToPlane(businessObject, plane) {
    var parent = businessObject.$parent;

    // don't move elements that are already on the plane
    if (!is$1(parent, 'bpmn:SubProcess') || parent === plane.bpmnElement) {
      return false;
    }

    // dataAssociations are children of the subprocess but rendered on process level
    // cf. https://github.com/bpmn-io/bpmn-js/issues/1619
    if (isAny(businessObject, [ 'bpmn:DataInputAssociation', 'bpmn:DataOutputAssociation' ])) {
      return false;
    }

    return true;
  }

  /**
   * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
   * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
   * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
   * @typedef {import('diagram-js/lib/features/overlays/Overlays').default} Overlays
   * @typedef {import('diagram-js/lib/i18n/translate/translate').default} Translate
   *
   * @typedef {import('../../model/Types').Element} Element
   * @typedef {import('../../model/Types').Parent} Parent
   * @typedef {import('../../model/Types').Shape} Shape
   */

  var LOW_PRIORITY$1 = 250;
  var ARROW_DOWN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.81801948,3.50735931 L10.4996894,9.1896894 L10.5,4 L12,4 L12,12 L4,12 L4,10.5 L9.6896894,10.4996894 L3.75735931,4.56801948 C3.46446609,4.27512627 3.46446609,3.80025253 3.75735931,3.50735931 C4.05025253,3.21446609 4.52512627,3.21446609 4.81801948,3.50735931 Z"/></svg>';

  var EMPTY_MARKER = 'bjs-drilldown-empty';

  /**
   * @param {Canvas} canvas
   * @param {EventBus} eventBus
   * @param {ElementRegistry} elementRegistry
   * @param {Overlays} overlays
   * @param {Translate} translate
   */
  function DrilldownOverlayBehavior(
      canvas, eventBus, elementRegistry, overlays, translate
  ) {
    CommandInterceptor.call(this, eventBus);

    this._canvas = canvas;
    this._eventBus = eventBus;
    this._elementRegistry = elementRegistry;
    this._overlays = overlays;
    this._translate = translate;

    var self = this;

    this.executed('shape.toggleCollapse', LOW_PRIORITY$1, function(context) {
      var shape = context.shape;

      // Add overlay to the collapsed shape
      if (self._canDrillDown(shape)) {
        self._addOverlay(shape);
      } else {
        self._removeOverlay(shape);
      }
    }, true);


    this.reverted('shape.toggleCollapse', LOW_PRIORITY$1, function(context) {
      var shape = context.shape;

      // Add overlay to the collapsed shape
      if (self._canDrillDown(shape)) {
        self._addOverlay(shape);
      } else {
        self._removeOverlay(shape);
      }
    }, true);


    this.executed([ 'shape.create', 'shape.move', 'shape.delete' ], LOW_PRIORITY$1,
      function(context) {
        var oldParent = context.oldParent,
            newParent = context.newParent || context.parent,
            shape = context.shape;

        // Add overlay to the collapsed shape
        if (self._canDrillDown(shape)) {
          self._addOverlay(shape);
        }

        self._updateDrilldownOverlay(oldParent);
        self._updateDrilldownOverlay(newParent);
        self._updateDrilldownOverlay(shape);
      }, true);


    this.reverted([ 'shape.create', 'shape.move', 'shape.delete' ], LOW_PRIORITY$1,
      function(context) {
        var oldParent = context.oldParent,
            newParent = context.newParent || context.parent,
            shape = context.shape;

        // Add overlay to the collapsed shape
        if (self._canDrillDown(shape)) {
          self._addOverlay(shape);
        }

        self._updateDrilldownOverlay(oldParent);
        self._updateDrilldownOverlay(newParent);
        self._updateDrilldownOverlay(shape);
      }, true);


    eventBus.on('import.render.complete', function() {
      elementRegistry.filter(function(e) {
        return self._canDrillDown(e);
      }).map(function(el) {
        self._addOverlay(el);
      });
    });

  }

  e(DrilldownOverlayBehavior, CommandInterceptor);

  /**
   * @param {Shape} shape
   */
  DrilldownOverlayBehavior.prototype._updateDrilldownOverlay = function(shape) {
    var canvas = this._canvas;

    if (!shape) {
      return;
    }

    var root = canvas.findRoot(shape);

    if (root) {
      this._updateOverlayVisibility(root);
    }
  };

  /**
   * @param {Element} element
   *
   * @return {boolean}
   */
  DrilldownOverlayBehavior.prototype._canDrillDown = function(element) {
    var canvas = this._canvas;

    return is$1(element, 'bpmn:SubProcess') && canvas.findRoot(getPlaneIdFromShape(element));
  };

  /**
   * Update the visibility of the drilldown overlay. If the plane has no elements,
   * the drilldown will only be shown when the element is selected.
   *
   * @param {Parent} element The collapsed root or shape.
   */
  DrilldownOverlayBehavior.prototype._updateOverlayVisibility = function(element) {
    var overlays = this._overlays;

    var businessObject = getBusinessObject(element);

    var overlay = overlays.get({ element: businessObject.id, type: 'drilldown' })[0];

    if (!overlay) {
      return;
    }

    var hasFlowElements = businessObject
      && businessObject.get('flowElements')
      && businessObject.get('flowElements').length;

    classes(overlay.html).toggle(EMPTY_MARKER, !hasFlowElements);
  };

  /**
   * Add a drilldown button to the given element assuming the plane has the same
   * ID as the element.
   *
   * @param {Shape} element The collapsed shape.
   */
  DrilldownOverlayBehavior.prototype._addOverlay = function(element) {
    var canvas = this._canvas,
        overlays = this._overlays,
        bo = getBusinessObject(element);

    var existingOverlays = overlays.get({ element: element, type: 'drilldown' });

    if (existingOverlays.length) {
      this._removeOverlay(element);
    }

    var button = domify('<button type="button" class="bjs-drilldown">' + ARROW_DOWN_SVG + '</button>'),
        elementName = bo.get('name') || bo.get('id'),
        title = this._translate('Open {element}', { element: elementName });
    button.setAttribute('title', title);

    button.addEventListener('click', function() {
      canvas.setRootElement(canvas.findRoot(getPlaneIdFromShape(element)));
    });

    overlays.add(element, 'drilldown', {
      position: {
        bottom: -7,
        right: -8
      },
      html: button
    });

    this._updateOverlayVisibility(element);
  };

  DrilldownOverlayBehavior.prototype._removeOverlay = function(element) {
    var overlays = this._overlays;

    overlays.remove({
      element: element,
      type: 'drilldown'
    });
  };

  DrilldownOverlayBehavior.$inject = [
    'canvas',
    'eventBus',
    'elementRegistry',
    'overlays',
    'translate'
  ];

  var DrilldownModdule = {
    __depends__: [ OverlaysModule, ChangeSupportModule, RootElementsModule ],
    __init__: [ 'drilldownBreadcrumbs', 'drilldownOverlayBehavior', 'drilldownCentering', 'subprocessCompatibility' ],
    drilldownBreadcrumbs: [ 'type', DrilldownBreadcrumbs ],
    drilldownCentering: [ 'type', DrilldownCentering ],
    drilldownOverlayBehavior: [ 'type', DrilldownOverlayBehavior ],
    subprocessCompatibility: [ 'type', SubprocessCompatibility ]
  };

  /**
   * @typedef {import('../util/Types').Point} Point
   */


  /**
   * @param {import('../core/EventBus').Event} event
   *
   * @return {Event}
   */
  function getOriginal(event) {
    return event.originalEvent || event.srcEvent;
  }

  /**
   * @param {MouseEvent} event
   * @param {string} button
   *
   * @return {boolean}
   */
  function isButton(event, button) {
    return (getOriginal(event) || event).button === button;
  }

  /**
   * @param {MouseEvent} event
   *
   * @return {boolean}
   */
  function isPrimaryButton(event) {

    // button === 0 -> left áka primary mouse button
    return isButton(event, 0);
  }

  /**
   * @param {MouseEvent} event
   *
   * @return {boolean}
   */
  function isAuxiliaryButton(event) {

    // button === 1 -> auxiliary áka wheel button
    return isButton(event, 1);
  }

  /**
   * @param {MouseEvent} event
   *
   * @return {boolean}
   */
  function hasSecondaryModifier(event) {
    var originalEvent = getOriginal(event) || event;

    return isPrimaryButton(event) && originalEvent.shiftKey;
  }

  /**
   * @typedef {import('../../model/Types').Element} Element
   *
   * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
   * @typedef {import('../../core/EventBus').default} EventBus
   * @typedef {import('../../draw/Styles').default} Styles
   *
   * @typedef {import('../../util/Types').Point} Point
   */

  function allowAll(event) { return true; }

  function allowPrimaryAndAuxiliary(event) {
    return isPrimaryButton(event) || isAuxiliaryButton(event);
  }

  var LOW_PRIORITY = 500;


  /**
   * A plugin that provides interaction events for diagram elements.
   *
   * It emits the following events:
   *
   *   * element.click
   *   * element.contextmenu
   *   * element.dblclick
   *   * element.hover
   *   * element.mousedown
   *   * element.mousemove
   *   * element.mouseup
   *   * element.out
   *
   * Each event is a tuple { element, gfx, originalEvent }.
   *
   * Canceling the event via Event#preventDefault()
   * prevents the original DOM operation.
   *
   * @param {EventBus} eventBus
   * @param {ElementRegistry} elementRegistry
   * @param {Styles} styles
   */
  function InteractionEvents(eventBus, elementRegistry, styles) {

    var self = this;

    /**
     * Fire an interaction event.
     *
     * @param {string} type local event name, e.g. element.click.
     * @param {MouseEvent|TouchEvent} event native event
     * @param {Element} [element] the diagram element to emit the event on;
     *                                   defaults to the event target
     */
    function fire(type, event, element) {

      if (isIgnored(type, event)) {
        return;
      }

      var target, gfx, returnValue;

      if (!element) {
        target = event.delegateTarget || event.target;

        if (target) {
          gfx = target;
          element = elementRegistry.get(gfx);
        }
      } else {
        gfx = elementRegistry.getGraphics(element);
      }

      if (!gfx || !element) {
        return;
      }

      returnValue = eventBus.fire(type, {
        element: element,
        gfx: gfx,
        originalEvent: event
      });

      if (returnValue === false) {
        event.stopPropagation();
        event.preventDefault();
      }
    }

    // TODO(nikku): document this
    var handlers = {};

    function mouseHandler(localEventName) {
      return handlers[localEventName];
    }

    function isIgnored(localEventName, event) {

      var filter = ignoredFilters[localEventName] || isPrimaryButton;

      // only react on left mouse button interactions
      // except for interaction events that are enabled
      // for secundary mouse button
      return !filter(event);
    }

    var bindings = {
      click: 'element.click',
      contextmenu: 'element.contextmenu',
      dblclick: 'element.dblclick',
      mousedown: 'element.mousedown',
      mousemove: 'element.mousemove',
      mouseover: 'element.hover',
      mouseout: 'element.out',
      mouseup: 'element.mouseup',
    };

    var ignoredFilters = {
      'element.contextmenu': allowAll,
      'element.mousedown': allowPrimaryAndAuxiliary,
      'element.mouseup': allowPrimaryAndAuxiliary,
      'element.click': allowPrimaryAndAuxiliary,
      'element.dblclick': allowPrimaryAndAuxiliary
    };


    // manual event trigger //////////

    /**
     * Trigger an interaction event (based on a native dom event)
     * on the target shape or connection.
     *
     * @param {string} eventName the name of the triggered DOM event
     * @param {MouseEvent|TouchEvent} event
     * @param {Element} targetElement
     */
    function triggerMouseEvent(eventName, event, targetElement) {

      // i.e. element.mousedown...
      var localEventName = bindings[eventName];

      if (!localEventName) {
        throw new Error('unmapped DOM event name <' + eventName + '>');
      }

      return fire(localEventName, event, targetElement);
    }


    var ELEMENT_SELECTOR = 'svg, .djs-element';

    // event handling ///////

    function registerEvent(node, event, localEvent, ignoredFilter) {

      var handler = handlers[localEvent] = function(event) {
        fire(localEvent, event);
      };

      if (ignoredFilter) {
        ignoredFilters[localEvent] = ignoredFilter;
      }

      handler.$delegate = delegate.bind(node, ELEMENT_SELECTOR, event, handler);
    }

    function unregisterEvent(node, event, localEvent) {

      var handler = mouseHandler(localEvent);

      if (!handler) {
        return;
      }

      delegate.unbind(node, event, handler.$delegate);
    }

    function registerEvents(svg) {
      forEach(bindings, function(val, key) {
        registerEvent(svg, key, val);
      });
    }

    function unregisterEvents(svg) {
      forEach(bindings, function(val, key) {
        unregisterEvent(svg, key, val);
      });
    }

    eventBus.on('canvas.destroy', function(event) {
      unregisterEvents(event.svg);
    });

    eventBus.on('canvas.init', function(event) {
      registerEvents(event.svg);
    });


    // hit box updating ////////////////

    eventBus.on([ 'shape.added', 'connection.added' ], function(event) {
      var element = event.element,
          gfx = event.gfx;

      eventBus.fire('interactionEvents.createHit', { element: element, gfx: gfx });
    });

    // Update djs-hit on change.
    // A low priortity is necessary, because djs-hit of labels has to be updated
    // after the label bounds have been updated in the renderer.
    eventBus.on([
      'shape.changed',
      'connection.changed'
    ], LOW_PRIORITY, function(event) {

      var element = event.element,
          gfx = event.gfx;

      eventBus.fire('interactionEvents.updateHit', { element: element, gfx: gfx });
    });

    eventBus.on('interactionEvents.createHit', LOW_PRIORITY, function(event) {
      var element = event.element,
          gfx = event.gfx;

      self.createDefaultHit(element, gfx);
    });

    eventBus.on('interactionEvents.updateHit', function(event) {
      var element = event.element,
          gfx = event.gfx;

      self.updateDefaultHit(element, gfx);
    });


    // hit styles ////////////

    var STROKE_HIT_STYLE = createHitStyle('djs-hit djs-hit-stroke');

    var CLICK_STROKE_HIT_STYLE = createHitStyle('djs-hit djs-hit-click-stroke');

    var ALL_HIT_STYLE = createHitStyle('djs-hit djs-hit-all');

    var NO_MOVE_HIT_STYLE = createHitStyle('djs-hit djs-hit-no-move');

    var HIT_TYPES = {
      'all': ALL_HIT_STYLE,
      'click-stroke': CLICK_STROKE_HIT_STYLE,
      'stroke': STROKE_HIT_STYLE,
      'no-move': NO_MOVE_HIT_STYLE
    };

    function createHitStyle(classNames, attrs) {

      attrs = assign$1({
        stroke: 'white',
        strokeWidth: 15
      }, attrs || {});

      return styles.cls(classNames, [ 'no-fill', 'no-border' ], attrs);
    }


    // style helpers ///////////////

    function applyStyle(hit, type) {

      var attrs = HIT_TYPES[type];

      if (!attrs) {
        throw new Error('invalid hit type <' + type + '>');
      }

      attr$1(hit, attrs);

      return hit;
    }

    function appendHit(gfx, hit) {
      append(gfx, hit);
    }


    // API

    /**
     * Remove hints on the given graphics.
     *
     * @param {SVGElement} gfx
     */
    this.removeHits = function(gfx) {
      var hits = all('.djs-hit', gfx);

      forEach(hits, remove$2);
    };

    /**
     * Create default hit for the given element.
     *
     * @param {Element} element
     * @param {SVGElement} gfx
     *
     * @return {SVGElement} created hit
     */
    this.createDefaultHit = function(element, gfx) {
      var waypoints = element.waypoints,
          isFrame = element.isFrame,
          boxType;

      if (waypoints) {
        return this.createWaypointsHit(gfx, waypoints);
      } else {

        boxType = isFrame ? 'stroke' : 'all';

        return this.createBoxHit(gfx, boxType, {
          width: element.width,
          height: element.height
        });
      }
    };

    /**
     * Create hits for the given waypoints.
     *
     * @param {SVGElement} gfx
     * @param {Point[]} waypoints
     *
     * @return {SVGElement}
     */
    this.createWaypointsHit = function(gfx, waypoints) {

      var hit = createLine(waypoints);

      applyStyle(hit, 'stroke');

      appendHit(gfx, hit);

      return hit;
    };

    /**
     * Create hits for a box.
     *
     * @param {SVGElement} gfx
     * @param {string} type
     * @param {Object} attrs
     *
     * @return {SVGElement}
     */
    this.createBoxHit = function(gfx, type, attrs) {

      attrs = assign$1({
        x: 0,
        y: 0
      }, attrs);

      var hit = create$1('rect');

      applyStyle(hit, type);

      attr$1(hit, attrs);

      appendHit(gfx, hit);

      return hit;
    };

    /**
     * Update default hit of the element.
     *
     * @param {Element} element
     * @param {SVGElement} gfx
     *
     * @return {SVGElement} updated hit
     */
    this.updateDefaultHit = function(element, gfx) {

      var hit = query('.djs-hit', gfx);

      if (!hit) {
        return;
      }

      if (element.waypoints) {
        updateLine(hit, element.waypoints);
      } else {
        attr$1(hit, {
          width: element.width,
          height: element.height
        });
      }

      return hit;
    };

    this.fire = fire;

    this.triggerMouseEvent = triggerMouseEvent;

    this.mouseHandler = mouseHandler;

    this.registerEvent = registerEvent;
    this.unregisterEvent = unregisterEvent;
  }


  InteractionEvents.$inject = [
    'eventBus',
    'elementRegistry',
    'styles'
  ];


  /**
   * An event indicating that the mouse hovered over an element
   *
   * @event element.hover
   *
   * @type {Object}
   * @property {Element} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the mouse has left an element
   *
   * @event element.out
   *
   * @type {Object}
   * @property {Element} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the mouse has clicked an element
   *
   * @event element.click
   *
   * @type {Object}
   * @property {Element} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the mouse has double clicked an element
   *
   * @event element.dblclick
   *
   * @type {Object}
   * @property {Element} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the mouse has gone down on an element.
   *
   * @event element.mousedown
   *
   * @type {Object}
   * @property {Element} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the mouse has gone up on an element.
   *
   * @event element.mouseup
   *
   * @type {Object}
   * @property {Element} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the context menu action is triggered
   * via mouse or touch controls.
   *
   * @event element.contextmenu
   *
   * @type {Object}
   * @property {Element} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * @type { import('didi').ModuleDeclaration }
   */
  var InteractionEventsModule = {
    __init__: [ 'interactionEvents' ],
    interactionEvents: [ 'type', InteractionEvents ]
  };

  /**
   * @typedef {import('../../core/Canvas').default} Canvas
   * @typedef {import('../../core/EventBus').default} EventBus
   */

  /**
   * A service that offers the current selection in a diagram.
   * Offers the api to control the selection, too.
   *
   * @param {EventBus} eventBus
   * @param {Canvas} canvas
   */
  function Selection(eventBus, canvas) {

    this._eventBus = eventBus;
    this._canvas = canvas;

    /**
     * @type {Object[]}
     */
    this._selectedElements = [];

    var self = this;

    eventBus.on([ 'shape.remove', 'connection.remove' ], function(e) {
      var element = e.element;
      self.deselect(element);
    });

    eventBus.on([ 'diagram.clear', 'root.set' ], function(e) {
      self.select(null);
    });
  }

  Selection.$inject = [ 'eventBus', 'canvas' ];

  /**
   * Deselect an element.
   *
   * @param {Object} element The element to deselect.
   */
  Selection.prototype.deselect = function(element) {
    var selectedElements = this._selectedElements;

    var idx = selectedElements.indexOf(element);

    if (idx !== -1) {
      var oldSelection = selectedElements.slice();

      selectedElements.splice(idx, 1);

      this._eventBus.fire('selection.changed', { oldSelection: oldSelection, newSelection: selectedElements });
    }
  };

  /**
   * Get the selected elements.
   *
   * @return {Object[]} The selected elements.
   */
  Selection.prototype.get = function() {
    return this._selectedElements;
  };

  /**
   * Check whether an element is selected.
   *
   * @param {Object} element The element.
   *
   * @return {boolean} Whether the element is selected.
   */
  Selection.prototype.isSelected = function(element) {
    return this._selectedElements.indexOf(element) !== -1;
  };


  /**
   * Select one or many elements.
   *
   * @param {Object|Object[]} elements The element(s) to select.
   * @param {boolean} [add] Whether to add the element(s) to the selected elements.
   * Defaults to `false`.
   */
  Selection.prototype.select = function(elements, add) {
    var selectedElements = this._selectedElements,
        oldSelection = selectedElements.slice();

    if (!isArray$1(elements)) {
      elements = elements ? [ elements ] : [];
    }

    var canvas = this._canvas;

    var rootElement = canvas.getRootElement();

    elements = elements.filter(function(element) {
      var elementRoot = canvas.findRoot(element);

      return rootElement === elementRoot;
    });

    // selection may be cleared by passing an empty array or null
    // to the method
    if (add) {
      forEach(elements, function(element) {
        if (selectedElements.indexOf(element) !== -1) {

          // already selected
          return;
        } else {
          selectedElements.push(element);
        }
      });
    } else {
      this._selectedElements = selectedElements = elements.slice();
    }

    this._eventBus.fire('selection.changed', { oldSelection: oldSelection, newSelection: selectedElements });
  };

  /**
   * @typedef {import('../../core/Canvas').default} Canvas
   * @typedef {import('../../core/EventBus').default} EventBus
   */

  var MARKER_HOVER = 'hover',
      MARKER_SELECTED = 'selected';

  /**
   * A plugin that adds a visible selection UI to shapes and connections
   * by appending the <code>hover</code> and <code>selected</code> classes to them.
   *
   * @class
   *
   * Makes elements selectable, too.
   *
   * @param {Canvas} canvas
   * @param {EventBus} eventBus
   */
  function SelectionVisuals(canvas, eventBus) {
    this._canvas = canvas;

    function addMarker(e, cls) {
      canvas.addMarker(e, cls);
    }

    function removeMarker(e, cls) {
      canvas.removeMarker(e, cls);
    }

    eventBus.on('element.hover', function(event) {
      addMarker(event.element, MARKER_HOVER);
    });

    eventBus.on('element.out', function(event) {
      removeMarker(event.element, MARKER_HOVER);
    });

    eventBus.on('selection.changed', function(event) {

      function deselect(s) {
        removeMarker(s, MARKER_SELECTED);
      }

      function select(s) {
        addMarker(s, MARKER_SELECTED);
      }

      var oldSelection = event.oldSelection,
          newSelection = event.newSelection;

      forEach(oldSelection, function(e) {
        if (newSelection.indexOf(e) === -1) {
          deselect(e);
        }
      });

      forEach(newSelection, function(e) {
        if (oldSelection.indexOf(e) === -1) {
          select(e);
        }
      });
    });
  }

  SelectionVisuals.$inject = [
    'canvas',
    'eventBus'
  ];

  /**
   * @typedef {import('../../core/Canvas').default} Canvas
   * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
   * @typedef {import('../../core/EventBus').default} EventBus
   * @typedef {import('./Selection').default} Selection
   */

  /**
   * @param {EventBus} eventBus
   * @param {Selection} selection
   * @param {Canvas} canvas
   * @param {ElementRegistry} elementRegistry
   */
  function SelectionBehavior(eventBus, selection, canvas, elementRegistry) {

    // Select elements on create
    eventBus.on('create.end', 500, function(event) {
      var context = event.context,
          canExecute = context.canExecute,
          elements = context.elements,
          hints = context.hints || {},
          autoSelect = hints.autoSelect;

      if (canExecute) {
        if (autoSelect === false) {

          // Select no elements
          return;
        }

        if (isArray$1(autoSelect)) {
          selection.select(autoSelect);
        } else {

          // Select all elements by default
          selection.select(elements.filter(isShown));
        }
      }
    });

    // Select connection targets on connect
    eventBus.on('connect.end', 500, function(event) {
      var context = event.context,
          connection = context.connection;

      if (connection) {
        selection.select(connection);
      }
    });

    // Select shapes on move
    eventBus.on('shape.move.end', 500, function(event) {
      var previousSelection = event.previousSelection || [];

      var shape = elementRegistry.get(event.context.shape.id);

      // Always select main shape on move
      var isSelected = find(previousSelection, function(selectedShape) {
        return shape.id === selectedShape.id;
      });

      if (!isSelected) {
        selection.select(shape);
      }
    });

    // Select elements on click
    eventBus.on('element.click', function(event) {

      if (!isPrimaryButton(event)) {
        return;
      }

      var element = event.element;

      if (element === canvas.getRootElement()) {
        element = null;
      }

      var isSelected = selection.isSelected(element),
          isMultiSelect = selection.get().length > 1;

      // Add to selection if SHIFT pressed
      var add = hasSecondaryModifier(event);

      if (isSelected && isMultiSelect) {
        if (add) {

          // Deselect element
          return selection.deselect(element);
        } else {

          // Select element only
          return selection.select(element);
        }
      } else if (!isSelected) {

        // Select element
        selection.select(element, add);
      } else {

        // Deselect element
        selection.deselect(element);
      }
    });
  }

  SelectionBehavior.$inject = [
    'eventBus',
    'selection',
    'canvas',
    'elementRegistry'
  ];


  function isShown(element) {
    return !element.hidden;
  }

  /**
   * @type { import('didi').ModuleDeclaration }
   */
  var SelectionModule = {
    __init__: [ 'selectionVisuals', 'selectionBehavior' ],
    __depends__: [
      InteractionEventsModule,
    ],
    selection: [ 'type', Selection ],
    selectionVisuals: [ 'type', SelectionVisuals ],
    selectionBehavior: [ 'type', SelectionBehavior ]
  };

  const CLASS_PATTERN = /^class[ {]/;


  /**
   * @param {function} fn
   *
   * @return {boolean}
   */
  function isClass(fn) {
    return CLASS_PATTERN.test(fn.toString());
  }

  /**
   * @param {any} obj
   *
   * @return {boolean}
   */
  function isArray(obj) {
    return Array.isArray(obj);
  }

  /**
   * @param {any} obj
   * @param {string} prop
   *
   * @return {boolean}
   */
  function hasOwnProp(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  /**
   * @typedef {import('./index.js').InjectAnnotated } InjectAnnotated
   */

  /**
   * @template T
   *
   * @params {[...string[], T] | ...string[], T} args
   *
   * @return {T & InjectAnnotated}
   */
  function annotate(...args) {

    if (args.length === 1 && isArray(args[0])) {
      args = args[0];
    }

    args = [ ...args ];

    const fn = args.pop();

    fn.$inject = args;

    return fn;
  }


  // Current limitations:
  // - can't put into "function arg" comments
  // function /* (no parenthesis like this) */ (){}
  // function abc( /* xx (no parenthesis like this) */ a, b) {}
  //
  // Just put the comment before function or inside:
  // /* (((this is fine))) */ function(a, b) {}
  // function abc(a) { /* (((this is fine))) */}
  //
  // - can't reliably auto-annotate constructor; we'll match the
  // first constructor(...) pattern found which may be the one
  // of a nested class, too.

  const CONSTRUCTOR_ARGS = /constructor\s*[^(]*\(\s*([^)]*)\)/m;
  const FN_ARGS = /^(?:async\s+)?(?:function\s*[^(]*)?(?:\(\s*([^)]*)\)|(\w+))/m;
  const FN_ARG = /\/\*([^*]*)\*\//m;

  /**
   * @param {unknown} fn
   *
   * @return {string[]}
   */
  function parseAnnotations(fn) {

    if (typeof fn !== 'function') {
      throw new Error(`Cannot annotate "${fn}". Expected a function!`);
    }

    const match = fn.toString().match(isClass(fn) ? CONSTRUCTOR_ARGS : FN_ARGS);

    // may parse class without constructor
    if (!match) {
      return [];
    }

    const args = match[1] || match[2];

    return args && args.split(',').map(arg => {
      const argMatch = arg.match(FN_ARG);
      return (argMatch && argMatch[1] || arg).trim();
    }) || [];
  }

  /**
   * @typedef { import('./index.js').ModuleDeclaration } ModuleDeclaration
   * @typedef { import('./index.js').ModuleDefinition } ModuleDefinition
   * @typedef { import('./index.js').InjectorContext } InjectorContext
   *
   * @typedef { import('./index.js').TypedDeclaration<any, any> } TypedDeclaration
   */

  /**
   * Create a new injector with the given modules.
   *
   * @param {ModuleDefinition[]} modules
   * @param {InjectorContext} [_parent]
   */
  function Injector(modules, _parent) {

    const parent = _parent || /** @type InjectorContext */ ({
      get: function(name, strict) {
        currentlyResolving.push(name);

        if (strict === false) {
          return null;
        } else {
          throw error(`No provider for "${ name }"!`);
        }
      }
    });

    const currentlyResolving = [];
    const providers = this._providers = Object.create(parent._providers || null);
    const instances = this._instances = Object.create(null);

    const self = instances.injector = this;

    const error = function(msg) {
      const stack = currentlyResolving.join(' -> ');
      currentlyResolving.length = 0;
      return new Error(stack ? `${ msg } (Resolving: ${ stack })` : msg);
    };

    /**
     * Return a named service.
     *
     * @param {string} name
     * @param {boolean} [strict=true] if false, resolve missing services to null
     *
     * @return {any}
     */
    function get(name, strict) {
      if (!providers[name] && name.includes('.')) {

        const parts = name.split('.');
        let pivot = get(/** @type { string } */ (parts.shift()));

        while (parts.length) {
          pivot = pivot[/** @type { string } */ (parts.shift())];
        }

        return pivot;
      }

      if (hasOwnProp(instances, name)) {
        return instances[name];
      }

      if (hasOwnProp(providers, name)) {
        if (currentlyResolving.indexOf(name) !== -1) {
          currentlyResolving.push(name);
          throw error('Cannot resolve circular dependency!');
        }

        currentlyResolving.push(name);
        instances[name] = providers[name][0](providers[name][1]);
        currentlyResolving.pop();

        return instances[name];
      }

      return parent.get(name, strict);
    }

    function fnDef(fn, locals) {

      if (typeof locals === 'undefined') {
        locals = {};
      }

      if (typeof fn !== 'function') {
        if (isArray(fn)) {
          fn = annotate(fn.slice());
        } else {
          throw error(`Cannot invoke "${ fn }". Expected a function!`);
        }
      }

      /**
       * @type {string[]}
       */
      const inject = fn.$inject || parseAnnotations(fn);
      const dependencies = inject.map(dep => {
        if (hasOwnProp(locals, dep)) {
          return locals[dep];
        } else {
          return get(dep);
        }
      });

      return {
        fn: fn,
        dependencies
      };
    }

    /**
     * Instantiate the given type, injecting dependencies.
     *
     * @template T
     *
     * @param { Function | [...string[], Function ]} type
     *
     * @return T
     */
    function instantiate(type) {
      const {
        fn,
        dependencies
      } = fnDef(type);

      // instantiate var args constructor
      const Constructor = Function.prototype.bind.call(fn, null, ...dependencies);

      return new Constructor();
    }

    /**
     * Invoke the given function, injecting dependencies. Return the result.
     *
     * @template T
     *
     * @param { Function | [...string[], Function ]} func
     * @param { Object } [context]
     * @param { Object } [locals]
     *
     * @return {T} invocation result
     */
    function invoke(func, context, locals) {
      const {
        fn,
        dependencies
      } = fnDef(func, locals);

      return fn.apply(context, dependencies);
    }

    /**
     * @param {Injector} childInjector
     *
     * @return {Function}
     */
    function createPrivateInjectorFactory(childInjector) {
      return annotate(key => childInjector.get(key));
    }

    /**
     * @param {ModuleDefinition[]} modules
     * @param {string[]} [forceNewInstances]
     *
     * @return {Injector}
     */
    function createChild(modules, forceNewInstances) {
      if (forceNewInstances && forceNewInstances.length) {
        const fromParentModule = Object.create(null);
        const matchedScopes = Object.create(null);

        const privateInjectorsCache = [];
        const privateChildInjectors = [];
        const privateChildFactories = [];

        let provider;
        let cacheIdx;
        let privateChildInjector;
        let privateChildInjectorFactory;

        for (let name in providers) {
          provider = providers[name];

          if (forceNewInstances.indexOf(name) !== -1) {
            if (provider[2] === 'private') {
              cacheIdx = privateInjectorsCache.indexOf(provider[3]);
              if (cacheIdx === -1) {
                privateChildInjector = provider[3].createChild([], forceNewInstances);
                privateChildInjectorFactory = createPrivateInjectorFactory(privateChildInjector);
                privateInjectorsCache.push(provider[3]);
                privateChildInjectors.push(privateChildInjector);
                privateChildFactories.push(privateChildInjectorFactory);
                fromParentModule[name] = [ privateChildInjectorFactory, name, 'private', privateChildInjector ];
              } else {
                fromParentModule[name] = [ privateChildFactories[cacheIdx], name, 'private', privateChildInjectors[cacheIdx] ];
              }
            } else {
              fromParentModule[name] = [ provider[2], provider[1] ];
            }
            matchedScopes[name] = true;
          }

          if ((provider[2] === 'factory' || provider[2] === 'type') && provider[1].$scope) {
            /* jshint -W083 */
            forceNewInstances.forEach(scope => {
              if (provider[1].$scope.indexOf(scope) !== -1) {
                fromParentModule[name] = [ provider[2], provider[1] ];
                matchedScopes[scope] = true;
              }
            });
          }
        }

        forceNewInstances.forEach(scope => {
          if (!matchedScopes[scope]) {
            throw new Error('No provider for "' + scope + '". Cannot use provider from the parent!');
          }
        });

        modules.unshift(fromParentModule);
      }

      return new Injector(modules, self);
    }

    const factoryMap = {
      factory: invoke,
      type: instantiate,
      value: function(value) {
        return value;
      }
    };

    /**
     * @param {ModuleDefinition} moduleDefinition
     * @param {Injector} injector
     */
    function createInitializer(moduleDefinition, injector) {

      const initializers = moduleDefinition.__init__ || [];

      return function() {
        initializers.forEach(initializer => {

          // eagerly resolve component (fn or string)
          if (typeof initializer === 'string') {
            injector.get(initializer);
          } else {
            injector.invoke(initializer);
          }
        });
      };
    }

    /**
     * @param {ModuleDefinition} moduleDefinition
     */
    function loadModule(moduleDefinition) {

      const moduleExports = moduleDefinition.__exports__;

      // private module
      if (moduleExports) {
        const nestedModules = moduleDefinition.__modules__;

        const clonedModule = Object.keys(moduleDefinition).reduce((clonedModule, key) => {

          if (key !== '__exports__' && key !== '__modules__' && key !== '__init__' && key !== '__depends__') {
            clonedModule[key] = moduleDefinition[key];
          }

          return clonedModule;
        }, Object.create(null));

        const childModules = (nestedModules || []).concat(clonedModule);

        const privateInjector = createChild(childModules);
        const getFromPrivateInjector = annotate(function(key) {
          return privateInjector.get(key);
        });

        moduleExports.forEach(function(key) {
          providers[key] = [ getFromPrivateInjector, key, 'private', privateInjector ];
        });

        // ensure child injector initializes
        const initializers = (moduleDefinition.__init__ || []).slice();

        initializers.unshift(function() {
          privateInjector.init();
        });

        moduleDefinition = Object.assign({}, moduleDefinition, {
          __init__: initializers
        });

        return createInitializer(moduleDefinition, privateInjector);
      }

      // normal module
      Object.keys(moduleDefinition).forEach(function(key) {

        if (key === '__init__' || key === '__depends__') {
          return;
        }

        const typeDeclaration = /** @type { TypedDeclaration } */ (
          moduleDefinition[key]
        );

        if (typeDeclaration[2] === 'private') {
          providers[key] = typeDeclaration;
          return;
        }

        const type = typeDeclaration[0];
        const value = typeDeclaration[1];

        providers[key] = [ factoryMap[type], arrayUnwrap(type, value), type ];
      });

      return createInitializer(moduleDefinition, self);
    }

    /**
     * @param {ModuleDefinition[]} moduleDefinitions
     * @param {ModuleDefinition} moduleDefinition
     *
     * @return {ModuleDefinition[]}
     */
    function resolveDependencies(moduleDefinitions, moduleDefinition) {

      if (moduleDefinitions.indexOf(moduleDefinition) !== -1) {
        return moduleDefinitions;
      }

      moduleDefinitions = (moduleDefinition.__depends__ || []).reduce(resolveDependencies, moduleDefinitions);

      if (moduleDefinitions.indexOf(moduleDefinition) !== -1) {
        return moduleDefinitions;
      }

      return moduleDefinitions.concat(moduleDefinition);
    }

    /**
     * @param {ModuleDefinition[]} moduleDefinitions
     *
     * @return { () => void } initializerFn
     */
    function bootstrap(moduleDefinitions) {

      const initializers = moduleDefinitions
        .reduce(resolveDependencies, [])
        .map(loadModule);

      let initialized = false;

      return function() {

        if (initialized) {
          return;
        }

        initialized = true;

        initializers.forEach(initializer => initializer());
      };
    }

    // public API
    this.get = get;
    this.invoke = invoke;
    this.instantiate = instantiate;
    this.createChild = createChild;

    // setup
    this.init = bootstrap(modules);
  }


  // helpers ///////////////

  function arrayUnwrap(type, value) {
    if (type !== 'value' && isArray(value)) {
      value = annotate(value.slice());
    }

    return value;
  }

  /**
   * @typedef {import('../core/EventBus').default} EventBus
   * @typedef {import('./Styles').default} Styles
   */

  // apply default renderer with lowest possible priority
  // so that it only kicks in if noone else could render
  var DEFAULT_RENDER_PRIORITY = 1;

  /**
   * The default renderer used for shapes and connections.
   *
   * @param {EventBus} eventBus
   * @param {Styles} styles
   */
  function DefaultRenderer(eventBus, styles) {

    BaseRenderer.call(this, eventBus, DEFAULT_RENDER_PRIORITY);

    this.CONNECTION_STYLE = styles.style([ 'no-fill' ], { strokeWidth: 5, stroke: 'fuchsia' });
    this.SHAPE_STYLE = styles.style({ fill: 'white', stroke: 'fuchsia', strokeWidth: 2 });
    this.FRAME_STYLE = styles.style([ 'no-fill' ], { stroke: 'fuchsia', strokeDasharray: 4, strokeWidth: 2 });
  }

  e(DefaultRenderer, BaseRenderer);


  /**
   * @private
   */
  DefaultRenderer.prototype.canRender = function() {
    return true;
  };

  /**
   * @private
   */
  DefaultRenderer.prototype.drawShape = function drawShape(visuals, element, attrs) {
    var rect = create$1('rect');

    attr$1(rect, {
      x: 0,
      y: 0,
      width: element.width || 0,
      height: element.height || 0
    });

    if (isFrameElement$1(element)) {
      attr$1(rect, assign$1({}, this.FRAME_STYLE, attrs || {}));
    } else {
      attr$1(rect, assign$1({}, this.SHAPE_STYLE, attrs || {}));
    }

    append(visuals, rect);

    return rect;
  };

  /**
   * @private
   */
  DefaultRenderer.prototype.drawConnection = function drawConnection(visuals, connection, attrs) {

    var line = createLine(connection.waypoints, assign$1({}, this.CONNECTION_STYLE, attrs || {}));
    append(visuals, line);

    return line;
  };

  /**
   * @private
   */
  DefaultRenderer.prototype.getShapePath = function getShapePath(shape) {

    var x = shape.x,
        y = shape.y,
        width = shape.width,
        height = shape.height;

    var shapePath = [
      [ 'M', x, y ],
      [ 'l', width, 0 ],
      [ 'l', 0, height ],
      [ 'l', -width, 0 ],
      [ 'z' ]
    ];

    return componentsToPath(shapePath);
  };

  /**
   * @private
   */
  DefaultRenderer.prototype.getConnectionPath = function getConnectionPath(connection) {
    var waypoints = connection.waypoints;

    var idx, point, connectionPath = [];

    for (idx = 0; (point = waypoints[idx]); idx++) {

      // take invisible docking into account
      // when creating the path
      point = point.original || point;

      connectionPath.push([ idx === 0 ? 'M' : 'L', point.x, point.y ]);
    }

    return componentsToPath(connectionPath);
  };

  DefaultRenderer.$inject = [ 'eventBus', 'styles' ];

  /**
   * A component that manages shape styles
   */
  function Styles() {

    var defaultTraits = {

      'no-fill': {
        fill: 'none'
      },
      'no-border': {
        strokeOpacity: 0.0
      },
      'no-events': {
        pointerEvents: 'none'
      }
    };

    var self = this;

    /**
     * Builds a style definition from a className, a list of traits and an object
     * of additional attributes.
     *
     * @param {string} className
     * @param {string[]} [traits]
     * @param {Object} [additionalAttrs]
     *
     * @return {Object} the style definition
     */
    this.cls = function(className, traits, additionalAttrs) {
      var attrs = this.style(traits, additionalAttrs);

      return assign$1(attrs, { 'class': className });
    };

    /**
     * Builds a style definition from a list of traits and an object of additional
     * attributes.
     *
     * @param {string[]} [traits]
     * @param {Object} additionalAttrs
     *
     * @return {Object} the style definition
     */
    this.style = function(traits, additionalAttrs) {

      if (!isArray$1(traits) && !additionalAttrs) {
        additionalAttrs = traits;
        traits = [];
      }

      var attrs = reduce(traits, function(attrs, t) {
        return assign$1(attrs, defaultTraits[t] || {});
      }, {});

      return additionalAttrs ? assign$1(attrs, additionalAttrs) : attrs;
    };


    /**
     * Computes a style definition from a list of traits and an object of
     * additional attributes, with custom style definition object.
     *
     * @param {Object} custom
     * @param {string[]} [traits]
     * @param {Object} defaultStyles
     *
     * @return {Object} the style definition
     */
    this.computeStyle = function(custom, traits, defaultStyles) {
      if (!isArray$1(traits)) {
        defaultStyles = traits;
        traits = [];
      }

      return self.style(traits || [], assign$1({}, defaultStyles, custom || {}));
    };
  }

  /**
   * @type { import('didi').ModuleDeclaration }
   */
  var DrawModule = {
    __init__: [ 'defaultRenderer' ],
    defaultRenderer: [ 'type', DefaultRenderer ],
    styles: [ 'type', Styles ]
  };

  /**
   * Failsafe remove an element from a collection
   *
   * @param {Array<Object>} [collection]
   * @param {Object} [element]
   *
   * @return {number} the previous index of the element
   */
  function remove(collection, element) {

    if (!collection || !element) {
      return -1;
    }

    var idx = collection.indexOf(element);

    if (idx !== -1) {
      collection.splice(idx, 1);
    }

    return idx;
  }

  /**
   * Fail save add an element to the given connection, ensuring
   * it does not yet exist.
   *
   * @param {Array<Object>} collection
   * @param {Object} element
   * @param {number} [idx]
   */
  function add(collection, element, idx) {

    if (!collection || !element) {
      return;
    }

    if (typeof idx !== 'number') {
      idx = -1;
    }

    var currentIdx = collection.indexOf(element);

    if (currentIdx !== -1) {

      if (currentIdx === idx) {

        // nothing to do, position has not changed
        return;
      } else {

        if (idx !== -1) {

          // remove from current position
          collection.splice(currentIdx, 1);
        } else {

          // already exists in collection
          return;
        }
      }
    }

    if (idx !== -1) {

      // insert at specified position
      collection.splice(idx, 0, element);
    } else {

      // push to end
      collection.push(element);
    }
  }

  /**
   * @typedef {import('./Types').ConnectionLike} ConnectionLike
   * @typedef {import('./Types').RootLike} RootLike
   * @typedef {import('./Types').ParentLike } ParentLike
   * @typedef {import('./Types').ShapeLike} ShapeLike
   *
   * @typedef { {
   *   container?: HTMLElement;
   *   deferUpdate?: boolean;
   *   width?: number;
   *   height?: number;
   *   autoFocus?: boolean;
   * } } CanvasConfig
   * @typedef { {
   *   group: SVGElement;
   *   index: number;
   *   visible: boolean;
   * } } CanvasLayer
   * @typedef { {
   *   [key: string]: CanvasLayer;
   * } } CanvasLayers
   * @typedef { {
   *   rootElement: ShapeLike;
   *   layer: CanvasLayer;
   * } } CanvasPlane
   * @typedef { {
   *   scale: number;
   *   inner: Rect;
   *   outer: Dimensions;
   * } & Rect } CanvasViewbox
   *
   * @typedef {import('./ElementRegistry').default} ElementRegistry
   * @typedef {import('./EventBus').default} EventBus
   * @typedef {import('./GraphicsFactory').default} GraphicsFactory
   *
   * @typedef {import('../util/Types').Dimensions} Dimensions
   * @typedef {import('../util/Types').Point} Point
   * @typedef {import('../util/Types').Rect} Rect
   * @typedef {import('../util/Types').RectTRBL} RectTRBL
   * @typedef {import('../util/Types').ScrollDelta} ScrollDelta
   */

  function round(number, resolution) {
    return Math.round(number * resolution) / resolution;
  }

  function ensurePx(number) {
    return isNumber(number) ? number + 'px' : number;
  }

  function findRoot(element) {
    while (element.parent) {
      element = element.parent;
    }

    return element;
  }

  /**
   * Creates a HTML container element for a SVG element with
   * the given configuration
   *
   * @param {CanvasConfig} options
   *
   * @return {HTMLElement} the container element
   */
  function createContainer(options) {

    options = assign$1({}, { width: '100%', height: '100%' }, options);

    const container = options.container || document.body;

    // create a <div> around the svg element with the respective size
    // this way we can always get the correct container size
    // (this is impossible for <svg> elements at the moment)
    const parent = document.createElement('div');
    parent.setAttribute('class', 'djs-container djs-parent');

    assign(parent, {
      position: 'relative',
      overflow: 'hidden',
      width: ensurePx(options.width),
      height: ensurePx(options.height)
    });

    container.appendChild(parent);

    return parent;
  }

  function createGroup(parent, cls, childIndex) {
    const group = create$1('g');
    classes$1(group).add(cls);

    const index = childIndex !== undefined ? childIndex : parent.childNodes.length - 1;

    // must ensure second argument is node or _null_
    // cf. https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
    parent.insertBefore(group, parent.childNodes[index] || null);

    return group;
  }

  const BASE_LAYER = 'base';

  // render plane contents behind utility layers
  const PLANE_LAYER_INDEX = 0;
  const UTILITY_LAYER_INDEX = 1;


  const REQUIRED_MODEL_ATTRS = {
    shape: [ 'x', 'y', 'width', 'height' ],
    connection: [ 'waypoints' ]
  };

  /**
   * The main drawing canvas.
   *
   * @class
   * @constructor
   *
   * @emits Canvas#canvas.init
   *
   * @param {CanvasConfig|null} config
   * @param {EventBus} eventBus
   * @param {GraphicsFactory} graphicsFactory
   * @param {ElementRegistry} elementRegistry
   */
  function Canvas(config, eventBus, graphicsFactory, elementRegistry) {
    this._eventBus = eventBus;
    this._elementRegistry = elementRegistry;
    this._graphicsFactory = graphicsFactory;

    /**
     * @type {number}
     */
    this._rootsIdx = 0;

    /**
     * @type {CanvasLayers}
     */
    this._layers = {};

    /**
     * @type {CanvasPlane[]}
     */
    this._planes = [];

    /**
     * @type {RootLike|null}
     */
    this._rootElement = null;

    /**
     * @type {boolean}
     */
    this._focused = false;

    this._init(config || {});
  }

  Canvas.$inject = [
    'config.canvas',
    'eventBus',
    'graphicsFactory',
    'elementRegistry'
  ];

  /**
   * Creates a <svg> element that is wrapped into a <div>.
   * This way we are always able to correctly figure out the size of the svg element
   * by querying the parent node.

   * (It is not possible to get the size of a svg element cross browser @ 2014-04-01)

   * <div class="djs-container" style="width: {desired-width}, height: {desired-height}">
   *   <svg width="100%" height="100%">
   *    ...
   *   </svg>
   * </div>
   *
   * @param {CanvasConfig} config
   */
  Canvas.prototype._init = function(config) {
    const eventBus = this._eventBus;

    // html container
    const container = this._container = createContainer(config);

    const svg = this._svg = create$1('svg');

    attr$1(svg, {
      width: '100%',
      height: '100%'
    });

    attr(svg, 'tabindex', 0);

    config.autoFocus && eventBus.on('element.hover', () => {
      this.restoreFocus();
    });

    eventBus.on('element.mousedown', 500, (event) => {
      this.focus();
    });

    svg.addEventListener('focusin', () => {
      this._setFocused(true);
    });

    svg.addEventListener('focusout', () => {
      this._setFocused(false);
    });

    svg.addEventListener('mouseover', () => {
      this._eventBus.fire('canvas.mouseover');
    });

    svg.addEventListener('mouseout', () => {
      this._eventBus.fire('canvas.mouseout');
    });

    append(container, svg);

    const viewport = this._viewport = createGroup(svg, 'viewport');

    // debounce canvas.viewbox.changed events when deferUpdate is set
    // to help with potential performance issues
    if (config.deferUpdate) {
      this._viewboxChanged = debounce(bind$1(this._viewboxChanged, this), 300);
    }

    eventBus.on('diagram.init', () => {

      /**
       * An event indicating that the canvas is ready to be drawn on.
       *
       * @memberOf Canvas
       *
       * @event canvas.init
       *
       * @type {Object}
       * @property {SVGElement} svg the created svg element
       * @property {SVGElement} viewport the direct parent of diagram elements and shapes
       */
      eventBus.fire('canvas.init', {
        svg: svg,
        viewport: viewport
      });

    });

    // reset viewbox on shape changes to
    // recompute the viewbox
    eventBus.on([
      'shape.added',
      'connection.added',
      'shape.removed',
      'connection.removed',
      'elements.changed',
      'root.set'
    ], () => {
      delete this._cachedViewbox;
    });

    eventBus.on('diagram.destroy', 500, this._destroy, this);
    eventBus.on('diagram.clear', 500, this._clear, this);
  };

  Canvas.prototype._destroy = function() {
    this._eventBus.fire('canvas.destroy', {
      svg: this._svg,
      viewport: this._viewport
    });

    const parent = this._container.parentNode;

    if (parent) {
      parent.removeChild(this._container);
    }

    delete this._svg;
    delete this._container;
    delete this._layers;
    delete this._planes;
    delete this._rootElement;
    delete this._viewport;
  };

  Canvas.prototype._setFocused = function(focused) {

    if (focused == this._focused) {
      return;
    }

    this._focused = focused;

    this._eventBus.fire('canvas.focus.changed', { focused });
  };

  Canvas.prototype._clear = function() {

    const allElements = this._elementRegistry.getAll();

    // remove all elements
    allElements.forEach(element => {
      const type = getType(element);

      if (type === 'root') {
        this.removeRootElement(element);
      } else {
        this._removeElement(element, type);
      }
    });

    // remove all planes
    this._planes = [];
    this._rootElement = null;

    // force recomputation of view box
    delete this._cachedViewbox;
  };

  /**
   * Sets focus on the canvas SVG element.
   */
  Canvas.prototype.focus = function() {
    this._svg.focus({ preventScroll: true });

    this._setFocused(true);
  };

  /**
  * Sets focus on the canvas SVG element if `document.body` is currently focused.
  */
  Canvas.prototype.restoreFocus = function() {
    if (document.activeElement === document.body) {
      this.focus();
    }
  };

  /**
  * Returns true if the canvas is focused.
  *
  * @return {boolean}
  */
  Canvas.prototype.isFocused = function() {
    return this._focused;
  };

  /**
   * Returns the default layer on which
   * all elements are drawn.
   *
   * @return {SVGElement}  The SVG element of the layer.
   */
  Canvas.prototype.getDefaultLayer = function() {
    return this.getLayer(BASE_LAYER, PLANE_LAYER_INDEX);
  };

  /**
   * Returns a layer that is used to draw elements
   * or annotations on it.
   *
   * Non-existing layers retrieved through this method
   * will be created. During creation, the optional index
   * may be used to create layers below or above existing layers.
   * A layer with a certain index is always created above all
   * existing layers with the same index.
   *
   * @param {string} name The name of the layer.
   * @param {number} [index] The index of the layer.
   *
   * @return {SVGElement} The SVG element of the layer.
   */
  Canvas.prototype.getLayer = function(name, index) {

    if (!name) {
      throw new Error('must specify a name');
    }

    let layer = this._layers[name];

    if (!layer) {
      layer = this._layers[name] = this._createLayer(name, index);
    }

    // throw an error if layer creation / retrival is
    // requested on different index
    if (typeof index !== 'undefined' && layer.index !== index) {
      throw new Error('layer <' + name + '> already created at index <' + index + '>');
    }

    return layer.group;
  };

  /**
   * For a given index, return the number of layers that have a higher index and
   * are visible.
   *
   * This is used to determine the node a layer should be inserted at.
   *
   * @param {number} index
   *
   * @return {number}
   */
  Canvas.prototype._getChildIndex = function(index) {
    return reduce(this._layers, function(childIndex, layer) {
      if (layer.visible && index >= layer.index) {
        childIndex++;
      }

      return childIndex;
    }, 0);
  };

  /**
   * Creates a given layer and returns it.
   *
   * @param {string} name
   * @param {number} [index=0]
   *
   * @return {CanvasLayer}
   */
  Canvas.prototype._createLayer = function(name, index) {

    if (typeof index === 'undefined') {
      index = UTILITY_LAYER_INDEX;
    }

    const childIndex = this._getChildIndex(index);

    return {
      group: createGroup(this._viewport, 'layer-' + name, childIndex),
      index: index,
      visible: true
    };
  };


  /**
   * Shows a given layer.
   *
   * @param {string} name The name of the layer.
   *
   * @return {SVGElement} The SVG element of the layer.
   */
  Canvas.prototype.showLayer = function(name) {

    if (!name) {
      throw new Error('must specify a name');
    }

    const layer = this._layers[name];

    if (!layer) {
      throw new Error('layer <' + name + '> does not exist');
    }

    const viewport = this._viewport;
    const group = layer.group;
    const index = layer.index;

    if (layer.visible) {
      return group;
    }

    const childIndex = this._getChildIndex(index);

    viewport.insertBefore(group, viewport.childNodes[childIndex] || null);

    layer.visible = true;

    return group;
  };

  /**
   * Hides a given layer.
   *
   * @param {string} name The name of the layer.
   *
   * @return {SVGElement} The SVG element of the layer.
   */
  Canvas.prototype.hideLayer = function(name) {

    if (!name) {
      throw new Error('must specify a name');
    }

    const layer = this._layers[name];

    if (!layer) {
      throw new Error('layer <' + name + '> does not exist');
    }

    const group = layer.group;

    if (!layer.visible) {
      return group;
    }

    remove$2(group);

    layer.visible = false;

    return group;
  };


  Canvas.prototype._removeLayer = function(name) {

    const layer = this._layers[name];

    if (layer) {
      delete this._layers[name];

      remove$2(layer.group);
    }
  };

  /**
   * Returns the currently active layer. Can be null.
   *
   * @return {CanvasLayer|null} The active layer of `null`.
   */
  Canvas.prototype.getActiveLayer = function() {
    const plane = this._findPlaneForRoot(this.getRootElement());

    if (!plane) {
      return null;
    }

    return plane.layer;
  };


  /**
   * Returns the plane which contains the given element.
   *
   * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
   *
   * @return {RootLike|undefined} The root of the element.
   */
  Canvas.prototype.findRoot = function(element) {
    if (typeof element === 'string') {
      element = this._elementRegistry.get(element);
    }

    if (!element) {
      return;
    }

    const plane = this._findPlaneForRoot(
      findRoot(element)
    ) || {};

    return plane.rootElement;
  };

  /**
   * Return a list of all root elements on the diagram.
   *
   * @return {(RootLike)[]} The list of root elements.
   */
  Canvas.prototype.getRootElements = function() {
    return this._planes.map(function(plane) {
      return plane.rootElement;
    });
  };

  Canvas.prototype._findPlaneForRoot = function(rootElement) {
    return find(this._planes, function(plane) {
      return plane.rootElement === rootElement;
    });
  };


  /**
   * Returns the html element that encloses the
   * drawing canvas.
   *
   * @return {HTMLElement} The HTML element of the container.
   */
  Canvas.prototype.getContainer = function() {
    return this._container;
  };


  // markers //////////////////////

  Canvas.prototype._updateMarker = function(element, marker, add) {
    let container;

    if (!element.id) {
      element = this._elementRegistry.get(element);
    }

    element.markers = element.markers || new Set();

    // we need to access all
    container = this._elementRegistry._elements[element.id];

    if (!container) {
      return;
    }

    forEach([ container.gfx, container.secondaryGfx ], function(gfx) {
      if (gfx) {

        // invoke either addClass or removeClass based on mode
        if (add) {
          element.markers.add(marker);
          classes$1(gfx).add(marker);
        } else {
          element.markers.delete(marker);
          classes$1(gfx).remove(marker);
        }
      }
    });

    /**
     * An event indicating that a marker has been updated for an element
     *
     * @event element.marker.update
     * @type {Object}
     * @property {Element} element the shape
     * @property {SVGElement} gfx the graphical representation of the shape
     * @property {string} marker
     * @property {boolean} add true if the marker was added, false if it got removed
     */
    this._eventBus.fire('element.marker.update', { element: element, gfx: container.gfx, marker: marker, add: !!add });
  };


  /**
   * Adds a marker to an element (basically a css class).
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @example
   *
   * ```javascript
   * canvas.addMarker('foo', 'some-marker');
   *
   * const fooGfx = canvas.getGraphics('foo');
   *
   * fooGfx; // <g class="... some-marker"> ... </g>
   * ```
   *
   * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
   * @param {string} marker The marker.
   */
  Canvas.prototype.addMarker = function(element, marker) {
    this._updateMarker(element, marker, true);
  };


  /**
   * Remove a marker from an element.
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
   * @param {string} marker The marker.
   */
  Canvas.prototype.removeMarker = function(element, marker) {
    this._updateMarker(element, marker, false);
  };

  /**
   * Check whether an element has a given marker.
   *
   * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
   * @param {string} marker The marker.
   */
  Canvas.prototype.hasMarker = function(element, marker) {
    if (!element.id) {
      element = this._elementRegistry.get(element);
    }

    if (!element.markers) {
      return false;
    }

    return element.markers.has(marker);
  };

  /**
   * Toggles a marker on an element.
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
   * @param {string} marker The marker.
   */
  Canvas.prototype.toggleMarker = function(element, marker) {
    if (this.hasMarker(element, marker)) {
      this.removeMarker(element, marker);
    } else {
      this.addMarker(element, marker);
    }
  };

  /**
   * Returns the current root element.
   *
   * Supports two different modes for handling root elements:
   *
   * 1. if no root element has been added before, an implicit root will be added
   * and returned. This is used in applications that don't require explicit
   * root elements.
   *
   * 2. when root elements have been added before calling `getRootElement`,
   * root elements can be null. This is used for applications that want to manage
   * root elements themselves.
   *
   * @return {RootLike} The current root element.
   */
  Canvas.prototype.getRootElement = function() {
    const rootElement = this._rootElement;

    // can return null if root elements are present but none was set yet
    if (rootElement || this._planes.length) {
      return rootElement;
    }

    return this.setRootElement(this.addRootElement(null));
  };

  /**
   * Adds a given root element and returns it.
   *
   * @param {RootLike} [rootElement] The root element to be added.
   *
   * @return {RootLike} The added root element or an implicit root element.
   */
  Canvas.prototype.addRootElement = function(rootElement) {
    const idx = this._rootsIdx++;

    if (!rootElement) {
      rootElement = {
        id: '__implicitroot_' + idx,
        children: [],
        isImplicit: true
      };
    }

    const layerName = rootElement.layer = 'root-' + idx;

    this._ensureValid('root', rootElement);

    const layer = this.getLayer(layerName, PLANE_LAYER_INDEX);

    this.hideLayer(layerName);

    this._addRoot(rootElement, layer);

    this._planes.push({
      rootElement: rootElement,
      layer: layer
    });

    return rootElement;
  };

  /**
   * Removes a given root element and returns it.
   *
   * @param {RootLike|string} rootElement element or element ID
   *
   * @return {RootLike|undefined} removed element
   */
  Canvas.prototype.removeRootElement = function(rootElement) {

    if (typeof rootElement === 'string') {
      rootElement = this._elementRegistry.get(rootElement);
    }

    const plane = this._findPlaneForRoot(rootElement);

    if (!plane) {
      return;
    }

    // hook up life-cycle events
    this._removeRoot(rootElement);

    // clean up layer
    this._removeLayer(rootElement.layer);

    // clean up plane
    this._planes = this._planes.filter(function(plane) {
      return plane.rootElement !== rootElement;
    });

    // clean up active root
    if (this._rootElement === rootElement) {
      this._rootElement = null;
    }

    return rootElement;
  };


  /**
   * Sets a given element as the new root element for the canvas
   * and returns the new root element.
   *
   * @param {RootLike} rootElement The root element to be set.
   *
   * @return {RootLike} The set root element.
   */
  Canvas.prototype.setRootElement = function(rootElement) {

    if (rootElement === this._rootElement) {
      return rootElement;
    }

    let plane;

    if (!rootElement) {
      throw new Error('rootElement required');
    }

    plane = this._findPlaneForRoot(rootElement);

    // give set add semantics for backwards compatibility
    if (!plane) {
      rootElement = this.addRootElement(rootElement);
    }

    this._setRoot(rootElement);

    return rootElement;
  };


  Canvas.prototype._removeRoot = function(element) {
    const elementRegistry = this._elementRegistry,
          eventBus = this._eventBus;

    // simulate element remove event sequence
    eventBus.fire('root.remove', { element: element });
    eventBus.fire('root.removed', { element: element });

    elementRegistry.remove(element);
  };


  Canvas.prototype._addRoot = function(element, gfx) {
    const elementRegistry = this._elementRegistry,
          eventBus = this._eventBus;

    // resemble element add event sequence
    eventBus.fire('root.add', { element: element });

    elementRegistry.add(element, gfx);

    eventBus.fire('root.added', { element: element, gfx: gfx });
  };


  Canvas.prototype._setRoot = function(rootElement, layer) {

    const currentRoot = this._rootElement;

    if (currentRoot) {

      // un-associate previous root element <svg>
      this._elementRegistry.updateGraphics(currentRoot, null, true);

      // hide previous layer
      this.hideLayer(currentRoot.layer);
    }

    if (rootElement) {

      if (!layer) {
        layer = this._findPlaneForRoot(rootElement).layer;
      }

      // associate element with <svg>
      this._elementRegistry.updateGraphics(rootElement, this._svg, true);

      // show root layer
      this.showLayer(rootElement.layer);
    }

    this._rootElement = rootElement;

    this._eventBus.fire('root.set', { element: rootElement });
  };

  Canvas.prototype._ensureValid = function(type, element) {
    if (!element.id) {
      throw new Error('element must have an id');
    }

    if (this._elementRegistry.get(element.id)) {
      throw new Error('element <' + element.id + '> already exists');
    }

    const requiredAttrs = REQUIRED_MODEL_ATTRS[type];

    const valid = every(requiredAttrs, function(attr) {
      return typeof element[attr] !== 'undefined';
    });

    if (!valid) {
      throw new Error(
        'must supply { ' + requiredAttrs.join(', ') + ' } with ' + type);
    }
  };

  Canvas.prototype._setParent = function(element, parent, parentIndex) {
    add(parent.children, element, parentIndex);
    element.parent = parent;
  };

  /**
   * Adds an element to the canvas.
   *
   * This wires the parent <-> child relationship between the element and
   * a explicitly specified parent or an implicit root element.
   *
   * During add it emits the events
   *
   *  * <{type}.add> (element, parent)
   *  * <{type}.added> (element, gfx)
   *
   * Extensions may hook into these events to perform their magic.
   *
   * @param {string} type
   * @param {ConnectionLike|ShapeLike} element
   * @param {ShapeLike} [parent]
   * @param {number} [parentIndex]
   *
   * @return {ConnectionLike|ShapeLike} The added element.
   */
  Canvas.prototype._addElement = function(type, element, parent, parentIndex) {

    parent = parent || this.getRootElement();

    const eventBus = this._eventBus,
          graphicsFactory = this._graphicsFactory;

    this._ensureValid(type, element);

    eventBus.fire(type + '.add', { element: element, parent: parent });

    this._setParent(element, parent, parentIndex);

    // create graphics
    const gfx = graphicsFactory.create(type, element, parentIndex);

    this._elementRegistry.add(element, gfx);

    // update its visual
    graphicsFactory.update(type, element, gfx);

    eventBus.fire(type + '.added', { element: element, gfx: gfx });

    return element;
  };

  /**
   * Adds a shape to the canvas.
   *
   * @param {ShapeLike} shape The shape to be added
   * @param {ParentLike} [parent] The shape's parent.
   * @param {number} [parentIndex] The index at which to add the shape to the parent's children.
   *
   * @return {ShapeLike} The added shape.
   */
  Canvas.prototype.addShape = function(shape, parent, parentIndex) {
    return this._addElement('shape', shape, parent, parentIndex);
  };

  /**
   * Adds a connection to the canvas.
   *
   * @param {ConnectionLike} connection The connection to be added.
   * @param {ParentLike} [parent] The connection's parent.
   * @param {number} [parentIndex] The index at which to add the connection to the parent's children.
   *
   * @return {ConnectionLike} The added connection.
   */
  Canvas.prototype.addConnection = function(connection, parent, parentIndex) {
    return this._addElement('connection', connection, parent, parentIndex);
  };


  /**
   * Internal remove element
   */
  Canvas.prototype._removeElement = function(element, type) {

    const elementRegistry = this._elementRegistry,
          graphicsFactory = this._graphicsFactory,
          eventBus = this._eventBus;

    element = elementRegistry.get(element.id || element);

    if (!element) {

      // element was removed already
      return;
    }

    eventBus.fire(type + '.remove', { element: element });

    graphicsFactory.remove(element);

    // unset parent <-> child relationship
    remove(element.parent && element.parent.children, element);
    element.parent = null;

    eventBus.fire(type + '.removed', { element: element });

    elementRegistry.remove(element);

    return element;
  };


  /**
   * Removes a shape from the canvas.
   *
   * @fires ShapeRemoveEvent
   * @fires ShapeRemovedEvent
   *
   * @param {ShapeLike|string} shape The shape or its ID.
   *
   * @return {ShapeLike} The removed shape.
   */
  Canvas.prototype.removeShape = function(shape) {

    /**
     * An event indicating that a shape is about to be removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event ShapeRemoveEvent
     * @type {Object}
     * @property {ShapeLike} element The shape.
     * @property {SVGElement} gfx The graphical element.
     */

    /**
     * An event indicating that a shape has been removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event ShapeRemovedEvent
     * @type {Object}
     * @property {ShapeLike} element The shape.
     * @property {SVGElement} gfx The graphical element.
     */
    return this._removeElement(shape, 'shape');
  };


  /**
   * Removes a connection from the canvas.
   *
   * @fires ConnectionRemoveEvent
   * @fires ConnectionRemovedEvent
   *
   * @param {ConnectionLike|string} connection The connection or its ID.
   *
   * @return {ConnectionLike} The removed connection.
   */
  Canvas.prototype.removeConnection = function(connection) {

    /**
     * An event indicating that a connection is about to be removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event ConnectionRemoveEvent
     * @type {Object}
     * @property {ConnectionLike} element The connection.
     * @property {SVGElement} gfx The graphical element.
     */

    /**
     * An event indicating that a connection has been removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event ConnectionRemovedEvent
     * @type {Object}
     * @property {ConnectionLike} element The connection.
     * @property {SVGElement} gfx The graphical element.
     */
    return this._removeElement(connection, 'connection');
  };


  /**
   * Returns the graphical element of an element.
   *
   * @param {ShapeLike|ConnectionLike|string} element The element or its ID.
   * @param {boolean} [secondary=false] Whether to return the secondary graphical element.
   *
   * @return {SVGElement} The graphical element.
   */
  Canvas.prototype.getGraphics = function(element, secondary) {
    return this._elementRegistry.getGraphics(element, secondary);
  };


  /**
   * Perform a viewbox update via a given change function.
   *
   * @param {Function} changeFn
   */
  Canvas.prototype._changeViewbox = function(changeFn) {

    // notify others of the upcoming viewbox change
    this._eventBus.fire('canvas.viewbox.changing');

    // perform actual change
    changeFn.apply(this);

    // reset the cached viewbox so that
    // a new get operation on viewbox or zoom
    // triggers a viewbox re-computation
    this._cachedViewbox = null;

    // notify others of the change; this step
    // may or may not be debounced
    this._viewboxChanged();
  };

  Canvas.prototype._viewboxChanged = function() {
    this._eventBus.fire('canvas.viewbox.changed', { viewbox: this.viewbox() });
  };


  /**
   * Gets or sets the view box of the canvas, i.e. the
   * area that is currently displayed.
   *
   * The getter may return a cached viewbox (if it is currently
   * changing). To force a recomputation, pass `false` as the first argument.
   *
   * @example
   *
   * ```javascript
   * canvas.viewbox({ x: 100, y: 100, width: 500, height: 500 })
   *
   * // sets the visible area of the diagram to (100|100) -> (600|100)
   * // and and scales it according to the diagram width
   *
   * const viewbox = canvas.viewbox(); // pass `false` to force recomputing the box.
   *
   * console.log(viewbox);
   * // {
   * //   inner: Dimensions,
   * //   outer: Dimensions,
   * //   scale,
   * //   x, y,
   * //   width, height
   * // }
   *
   * // if the current diagram is zoomed and scrolled, you may reset it to the
   * // default zoom via this method, too:
   *
   * const zoomedAndScrolledViewbox = canvas.viewbox();
   *
   * canvas.viewbox({
   *   x: 0,
   *   y: 0,
   *   width: zoomedAndScrolledViewbox.outer.width,
   *   height: zoomedAndScrolledViewbox.outer.height
   * });
   * ```
   *
   * @param {Rect} [box] The viewbox to be set.
   *
   * @return {CanvasViewbox} The set viewbox.
   */
  Canvas.prototype.viewbox = function(box) {

    if (box === undefined && this._cachedViewbox) {
      return structuredClone(this._cachedViewbox);
    }

    const viewport = this._viewport,
          outerBox = this.getSize();
    let innerBox,
        matrix,
        activeLayer,
        transform,
        scale,
        x, y;

    if (!box) {

      // compute the inner box based on the
      // diagrams active layer. This allows us to exclude
      // external components, such as overlays

      activeLayer = this._rootElement ? this.getActiveLayer() : null;
      innerBox = activeLayer && activeLayer.getBBox() || {};

      transform = transform$1(viewport);
      matrix = transform ? transform.matrix : createMatrix();
      scale = round(matrix.a, 1000);

      x = round(-matrix.e || 0, 1000);
      y = round(-matrix.f || 0, 1000);

      box = this._cachedViewbox = {
        x: x ? x / scale : 0,
        y: y ? y / scale : 0,
        width: outerBox.width / scale,
        height: outerBox.height / scale,
        scale: scale,
        inner: {
          width: innerBox.width || 0,
          height: innerBox.height || 0,
          x: innerBox.x || 0,
          y: innerBox.y || 0
        },
        outer: outerBox
      };

      return box;
    } else {

      this._changeViewbox(function() {
        scale = Math.min(outerBox.width / box.width, outerBox.height / box.height);

        const matrix = this._svg.createSVGMatrix()
          .scale(scale)
          .translate(-box.x, -box.y);

        transform$1(viewport, matrix);
      });
    }

    return box;
  };


  /**
   * Gets or sets the scroll of the canvas.
   *
   * @param {ScrollDelta} [delta] The scroll to be set.
   *
   * @return {Point}
   */
  Canvas.prototype.scroll = function(delta) {

    const node = this._viewport;
    let matrix = node.getCTM();

    if (delta) {
      this._changeViewbox(function() {
        delta = assign$1({ dx: 0, dy: 0 }, delta || {});

        matrix = this._svg.createSVGMatrix().translate(delta.dx, delta.dy).multiply(matrix);

        setCTM(node, matrix);
      });
    }

    return { x: matrix.e, y: matrix.f };
  };

  /**
   * Scrolls the viewbox to contain the given element.
   * Optionally specify a padding to be applied to the edges.
   *
   * @param {ShapeLike|ConnectionLike|string} element The element to scroll to or its ID.
   * @param {RectTRBL|number} [padding=100] The padding to be applied. Can also specify top, bottom, left and right.
   */
  Canvas.prototype.scrollToElement = function(element, padding) {
    let defaultPadding = 100;

    if (typeof element === 'string') {
      element = this._elementRegistry.get(element);
    }

    // set to correct rootElement
    const rootElement = this.findRoot(element);

    if (rootElement !== this.getRootElement()) {
      this.setRootElement(rootElement);
    }

    // element is rootElement, do not change viewport
    if (rootElement === element) {
      return;
    }

    if (!padding) {
      padding = {};
    }
    if (typeof padding === 'number') {
      defaultPadding = padding;
    }

    padding = {
      top: padding.top || defaultPadding,
      right: padding.right || defaultPadding,
      bottom: padding.bottom || defaultPadding,
      left: padding.left || defaultPadding
    };

    const elementBounds = getBBox(element),
          elementTrbl = asTRBL(elementBounds),
          viewboxBounds = this.viewbox(),
          zoom = this.zoom();
    let dx, dy;

    // shrink viewboxBounds with padding
    viewboxBounds.y += padding.top / zoom;
    viewboxBounds.x += padding.left / zoom;
    viewboxBounds.width -= (padding.right + padding.left) / zoom;
    viewboxBounds.height -= (padding.bottom + padding.top) / zoom;

    const viewboxTrbl = asTRBL(viewboxBounds);

    const canFit = elementBounds.width < viewboxBounds.width && elementBounds.height < viewboxBounds.height;

    if (!canFit) {

      // top-left when element can't fit
      dx = elementBounds.x - viewboxBounds.x;
      dy = elementBounds.y - viewboxBounds.y;

    } else {

      const dRight = Math.max(0, elementTrbl.right - viewboxTrbl.right),
            dLeft = Math.min(0, elementTrbl.left - viewboxTrbl.left),
            dBottom = Math.max(0, elementTrbl.bottom - viewboxTrbl.bottom),
            dTop = Math.min(0, elementTrbl.top - viewboxTrbl.top);

      dx = dRight || dLeft;
      dy = dBottom || dTop;

    }

    this.scroll({ dx: -dx * zoom, dy: -dy * zoom });
  };

  /**
   * Gets or sets the current zoom of the canvas, optionally zooming to the
   * specified position.
   *
   * The getter may return a cached zoom level. Call it with `false` as the first
   * argument to force recomputation of the current level.
   *
   * @param {number|'fit-viewport'} [newScale] The new zoom level, either a number,
   * i.e. 0.9, or `fit-viewport` to adjust the size to fit the current viewport.
   * @param {Point} [center] The reference point { x: ..., y: ...} to zoom to.
   *
   * @return {number} The set zoom level.
   */
  Canvas.prototype.zoom = function(newScale, center) {

    if (!newScale) {
      return this.viewbox(newScale).scale;
    }

    if (newScale === 'fit-viewport') {
      return this._fitViewport(center);
    }

    let outer,
        matrix;

    this._changeViewbox(function() {

      if (typeof center !== 'object') {
        outer = this.viewbox().outer;

        center = {
          x: outer.width / 2,
          y: outer.height / 2
        };
      }

      matrix = this._setZoom(newScale, center);
    });

    return round(matrix.a, 1000);
  };

  function setCTM(node, m) {
    const mstr = 'matrix(' + m.a + ',' + m.b + ',' + m.c + ',' + m.d + ',' + m.e + ',' + m.f + ')';
    node.setAttribute('transform', mstr);
  }

  Canvas.prototype._fitViewport = function(center) {

    const vbox = this.viewbox(),
          outer = vbox.outer,
          inner = vbox.inner;
    let newScale,
        newViewbox;

    // display the complete diagram without zooming in.
    // instead of relying on internal zoom, we perform a
    // hard reset on the canvas viewbox to realize this
    //
    // if diagram does not need to be zoomed in, we focus it around
    // the diagram origin instead

    if (inner.x >= 0 &&
        inner.y >= 0 &&
        inner.x + inner.width <= outer.width &&
        inner.y + inner.height <= outer.height &&
        !center) {

      newViewbox = {
        x: 0,
        y: 0,
        width: Math.max(inner.width + inner.x, outer.width),
        height: Math.max(inner.height + inner.y, outer.height)
      };
    } else {

      newScale = Math.min(1, outer.width / inner.width, outer.height / inner.height);
      newViewbox = {
        x: inner.x + (center ? inner.width / 2 - outer.width / newScale / 2 : 0),
        y: inner.y + (center ? inner.height / 2 - outer.height / newScale / 2 : 0),
        width: outer.width / newScale,
        height: outer.height / newScale
      };
    }

    this.viewbox(newViewbox);

    return this.viewbox(false).scale;
  };


  Canvas.prototype._setZoom = function(scale, center) {

    const svg = this._svg,
          viewport = this._viewport;

    const matrix = svg.createSVGMatrix();
    const point = svg.createSVGPoint();

    let centerPoint,
        originalPoint,
        currentMatrix,
        scaleMatrix,
        newMatrix;

    currentMatrix = viewport.getCTM();

    const currentScale = currentMatrix.a;

    if (center) {
      centerPoint = assign$1(point, center);

      // revert applied viewport transformations
      originalPoint = centerPoint.matrixTransform(currentMatrix.inverse());

      // create scale matrix
      scaleMatrix = matrix
        .translate(originalPoint.x, originalPoint.y)
        .scale(1 / currentScale * scale)
        .translate(-originalPoint.x, -originalPoint.y);

      newMatrix = currentMatrix.multiply(scaleMatrix);
    } else {
      newMatrix = matrix.scale(scale);
    }

    setCTM(this._viewport, newMatrix);

    return newMatrix;
  };


  /**
   * Returns the size of the canvas.
   *
   * @return {Dimensions} The size of the canvas.
   */
  Canvas.prototype.getSize = function() {
    return {
      width: this._container.clientWidth,
      height: this._container.clientHeight
    };
  };


  /**
   * Returns the absolute bounding box of an element.
   *
   * The absolute bounding box may be used to display overlays in the callers
   * (browser) coordinate system rather than the zoomed in/out canvas coordinates.
   *
   * @param {ShapeLike|ConnectionLike} element The element.
   *
   * @return {Rect} The element's absolute bounding box.
   */
  Canvas.prototype.getAbsoluteBBox = function(element) {
    const vbox = this.viewbox();
    let bbox;

    // connection
    // use svg bbox
    if (element.waypoints) {
      const gfx = this.getGraphics(element);

      bbox = gfx.getBBox();
    }

    // shapes
    // use data
    else {
      bbox = element;
    }

    const x = bbox.x * vbox.scale - vbox.x * vbox.scale;
    const y = bbox.y * vbox.scale - vbox.y * vbox.scale;

    const width = bbox.width * vbox.scale;
    const height = bbox.height * vbox.scale;

    return {
      x: x,
      y: y,
      width: width,
      height: height
    };
  };

  /**
   * Fires an event so other modules can react to the canvas resizing.
   */
  Canvas.prototype.resized = function() {

    // force recomputation of view box
    delete this._cachedViewbox;

    this._eventBus.fire('canvas.resized');
  };

  var ELEMENT_ID = 'data-element-id';

  /**
   * @typedef {import('./Types').ElementLike} ElementLike
   *
   * @typedef {import('./EventBus').default} EventBus
   *
   * @typedef { (element: ElementLike, gfx: SVGElement) => boolean|any } ElementRegistryFilterCallback
   * @typedef { (element: ElementLike, gfx: SVGElement) => any } ElementRegistryForEachCallback
   */

  /**
   * A registry that keeps track of all shapes in the diagram.
   *
   * @class
   * @constructor
   *
   * @param {EventBus} eventBus
   */
  function ElementRegistry(eventBus) {

    /**
     * @type { {
     *   [id: string]: {
     *     element: ElementLike;
     *     gfx?: SVGElement;
     *     secondaryGfx?: SVGElement;
     *   }
     * } }
     */
    this._elements = {};

    this._eventBus = eventBus;
  }

  ElementRegistry.$inject = [ 'eventBus' ];

  /**
   * Add an element and its graphical representation(s) to the registry.
   *
   * @param {ElementLike} element The element to be added.
   * @param {SVGElement} gfx The primary graphical representation.
   * @param {SVGElement} [secondaryGfx] The secondary graphical representation.
   */
  ElementRegistry.prototype.add = function(element, gfx, secondaryGfx) {

    var id = element.id;

    this._validateId(id);

    // associate dom node with element
    attr$1(gfx, ELEMENT_ID, id);

    if (secondaryGfx) {
      attr$1(secondaryGfx, ELEMENT_ID, id);
    }

    this._elements[id] = { element: element, gfx: gfx, secondaryGfx: secondaryGfx };
  };

  /**
   * Remove an element from the registry.
   *
   * @param {ElementLike|string} element
   */
  ElementRegistry.prototype.remove = function(element) {
    var elements = this._elements,
        id = element.id || element,
        container = id && elements[id];

    if (container) {

      // unset element id on gfx
      attr$1(container.gfx, ELEMENT_ID, '');

      if (container.secondaryGfx) {
        attr$1(container.secondaryGfx, ELEMENT_ID, '');
      }

      delete elements[id];
    }
  };

  /**
   * Update an elements ID.
   *
   * @param {ElementLike|string} element The element or its ID.
   * @param {string} newId The new ID.
   */
  ElementRegistry.prototype.updateId = function(element, newId) {

    this._validateId(newId);

    if (typeof element === 'string') {
      element = this.get(element);
    }

    this._eventBus.fire('element.updateId', {
      element: element,
      newId: newId
    });

    var gfx = this.getGraphics(element),
        secondaryGfx = this.getGraphics(element, true);

    this.remove(element);

    element.id = newId;

    this.add(element, gfx, secondaryGfx);
  };

  /**
   * Update the graphical representation of an element.
   *
   * @param {ElementLike|string} filter The element or its ID.
   * @param {SVGElement} gfx The new graphical representation.
   * @param {boolean} [secondary=false] Whether to update the secondary graphical representation.
   */
  ElementRegistry.prototype.updateGraphics = function(filter, gfx, secondary) {
    var id = filter.id || filter;

    var container = this._elements[id];

    if (secondary) {
      container.secondaryGfx = gfx;
    } else {
      container.gfx = gfx;
    }

    if (gfx) {
      attr$1(gfx, ELEMENT_ID, id);
    }

    return gfx;
  };

  /**
   * Get the element with the given ID or graphical representation.
   *
   * @example
   *
   * ```javascript
   * elementRegistry.get('SomeElementId_1');
   *
   * elementRegistry.get(gfx);
   * ```
   *
   * @param {string|SVGElement} filter The elements ID or graphical representation.
   *
   * @return {ElementLike|undefined} The element.
   */
  ElementRegistry.prototype.get = function(filter) {
    var id;

    if (typeof filter === 'string') {
      id = filter;
    } else {
      id = filter && attr$1(filter, ELEMENT_ID);
    }

    var container = this._elements[id];
    return container && container.element;
  };

  /**
   * Return all elements that match a given filter function.
   *
   * @param {ElementRegistryFilterCallback} fn The filter function.
   *
   * @return {ElementLike[]} The matching elements.
   */
  ElementRegistry.prototype.filter = function(fn) {

    var filtered = [];

    this.forEach(function(element, gfx) {
      if (fn(element, gfx)) {
        filtered.push(element);
      }
    });

    return filtered;
  };

  /**
   * Return the first element that matches the given filter function.
   *
   * @param {ElementRegistryFilterCallback} fn The filter function.
   *
   * @return {ElementLike|undefined} The matching element.
   */
  ElementRegistry.prototype.find = function(fn) {
    var map = this._elements,
        keys = Object.keys(map);

    for (var i = 0; i < keys.length; i++) {
      var id = keys[i],
          container = map[id],
          element = container.element,
          gfx = container.gfx;

      if (fn(element, gfx)) {
        return element;
      }
    }
  };

  /**
   * Get all elements.
   *
   * @return {ElementLike[]} All elements.
   */
  ElementRegistry.prototype.getAll = function() {
    return this.filter(function(e) { return e; });
  };

  /**
   * Execute a given function for each element.
   *
   * @param {ElementRegistryForEachCallback} fn The function to execute.
   */
  ElementRegistry.prototype.forEach = function(fn) {

    var map = this._elements;

    Object.keys(map).forEach(function(id) {
      var container = map[id],
          element = container.element,
          gfx = container.gfx;

      return fn(element, gfx);
    });
  };

  /**
   * Return the graphical representation of an element.
   *
   * @example
   *
   * ```javascript
   * elementRegistry.getGraphics('SomeElementId_1');
   *
   * elementRegistry.getGraphics(rootElement); // <g ...>
   *
   * elementRegistry.getGraphics(rootElement, true); // <svg ...>
   * ```
   *
   * @param {ElementLike|string} filter The element or its ID.
   * @param {boolean} [secondary=false] Whether to return the secondary graphical representation.
   *
   * @return {SVGElement} The graphical representation.
   */
  ElementRegistry.prototype.getGraphics = function(filter, secondary) {
    var id = filter.id || filter;

    var container = this._elements[id];
    return container && (secondary ? container.secondaryGfx : container.gfx);
  };

  /**
   * Validate an ID and throw an error if invalid.
   *
   * @param {string} id
   *
   * @throws {Error} Error indicating that the ID is invalid or already assigned.
   */
  ElementRegistry.prototype._validateId = function(id) {
    if (!id) {
      throw new Error('element must have an id');
    }

    if (this._elements[id]) {
      throw new Error('element with id ' + id + ' already added');
    }
  };

  /**
   * Extends a collection with {@link Refs} aware methods
   *
   * @param {Array<Object>} collection
   * @param {Refs} refs instance
   * @param {Object} property represented by the collection
   * @param {Object} target object the collection is attached to
   *
   * @return {RefsCollection<Object>} the extended array
   */
  function extend(collection, refs, property, target) {
    var inverseProperty = property.inverse;

    /**
     * Removes the given element from the array and returns it.
     *
     * @method RefsCollection#remove
     *
     * @param {Object} element the element to remove
     */
    Object.defineProperty(collection, 'remove', {
      value: function (element) {
        var idx = this.indexOf(element);
        if (idx !== -1) {
          this.splice(idx, 1);

          // unset inverse
          refs.unset(element, inverseProperty, target);
        }
        return element;
      }
    });

    /**
     * Returns true if the collection contains the given element
     *
     * @method RefsCollection#contains
     *
     * @param {Object} element the element to check for
     */
    Object.defineProperty(collection, 'contains', {
      value: function (element) {
        return this.indexOf(element) !== -1;
      }
    });

    /**
     * Adds an element to the array, unless it exists already (set semantics).
     *
     * @method RefsCollection#add
     *
     * @param {Object} element the element to add
     * @param {Number} optional index to add element to
     *                 (possibly moving other elements around)
     */
    Object.defineProperty(collection, 'add', {
      value: function (element, idx) {
        var currentIdx = this.indexOf(element);
        if (typeof idx === 'undefined') {
          if (currentIdx !== -1) {
            // element already in collection (!)
            return;
          }

          // add to end of array, as no idx is specified
          idx = this.length;
        }

        // handle already in collection
        if (currentIdx !== -1) {
          // remove element from currentIdx
          this.splice(currentIdx, 1);
        }

        // add element at idx
        this.splice(idx, 0, element);
        if (currentIdx === -1) {
          // set inverse, unless element was
          // in collection already
          refs.set(element, inverseProperty, target);
        }
      }
    });

    // a simple marker, identifying this element
    // as being a refs collection
    Object.defineProperty(collection, '__refs_collection', {
      value: true
    });
    return collection;
  }

  /**
   * Checks if a given collection is extended
   *
   * @param {Array<Object>} collection
   *
   * @return {boolean}
   */
  function isExtended(collection) {
    return collection.__refs_collection === true;
  }

  function hasOwnProperty$1(e, property) {
    return Object.prototype.hasOwnProperty.call(e, property.name || property);
  }
  function defineCollectionProperty(ref, property, target) {
    var collection = extend(target[property.name] || [], ref, property, target);
    Object.defineProperty(target, property.name, {
      enumerable: property.enumerable,
      value: collection
    });
    if (collection.length) {
      collection.forEach(function (o) {
        ref.set(o, property.inverse, target);
      });
    }
  }
  function defineProperty$1(ref, property, target) {
    var inverseProperty = property.inverse;
    var _value = target[property.name];
    Object.defineProperty(target, property.name, {
      configurable: property.configurable,
      enumerable: property.enumerable,
      get: function () {
        return _value;
      },
      set: function (value) {
        // return if we already performed all changes
        if (value === _value) {
          return;
        }
        var old = _value;

        // temporary set null
        _value = null;
        if (old) {
          ref.unset(old, inverseProperty, target);
        }

        // set new value
        _value = value;

        // set inverse value
        ref.set(_value, inverseProperty, target);
      }
    });
  }

  /**
   * Creates a new references object defining two inversly related
   * attribute descriptors a and b.
   *
   * <p>
   *   When bound to an object using {@link Refs#bind} the references
   *   get activated and ensure that add and remove operations are applied
   *   reversely, too.
   * </p>
   *
   * <p>
   *   For attributes represented as collections {@link Refs} provides the
   *   {@link RefsCollection#add}, {@link RefsCollection#remove} and {@link RefsCollection#contains} extensions
   *   that must be used to properly hook into the inverse change mechanism.
   * </p>
   *
   * @class Refs
   *
   * @classdesc A bi-directional reference between two attributes.
   *
   * @param {Refs.AttributeDescriptor} a property descriptor
   * @param {Refs.AttributeDescriptor} b property descriptor
   *
   * @example
   *
   * var refs = Refs({ name: 'wheels', collection: true, enumerable: true }, { name: 'car' });
   *
   * var car = { name: 'toyota' };
   * var wheels = [{ pos: 'front-left' }, { pos: 'front-right' }];
   *
   * refs.bind(car, 'wheels');
   *
   * car.wheels // []
   * car.wheels.add(wheels[0]);
   * car.wheels.add(wheels[1]);
   *
   * car.wheels // [{ pos: 'front-left' }, { pos: 'front-right' }]
   *
   * wheels[0].car // { name: 'toyota' };
   * car.wheels.remove(wheels[0]);
   *
   * wheels[0].car // undefined
   */
  function Refs(a, b) {
    if (!(this instanceof Refs)) {
      return new Refs(a, b);
    }

    // link
    a.inverse = b;
    b.inverse = a;
    this.props = {};
    this.props[a.name] = a;
    this.props[b.name] = b;
  }

  /**
   * Binds one side of a bi-directional reference to a
   * target object.
   *
   * @memberOf Refs
   *
   * @param  {Object} target
   * @param  {String} property
   */
  Refs.prototype.bind = function (target, property) {
    if (typeof property === 'string') {
      if (!this.props[property]) {
        throw new Error('no property <' + property + '> in ref');
      }
      property = this.props[property];
    }
    if (property.collection) {
      defineCollectionProperty(this, property, target);
    } else {
      defineProperty$1(this, property, target);
    }
  };
  Refs.prototype.ensureRefsCollection = function (target, property) {
    var collection = target[property.name];
    if (!isExtended(collection)) {
      defineCollectionProperty(this, property, target);
    }
    return collection;
  };
  Refs.prototype.ensureBound = function (target, property) {
    if (!hasOwnProperty$1(target, property)) {
      this.bind(target, property);
    }
  };
  Refs.prototype.unset = function (target, property, value) {
    if (target) {
      this.ensureBound(target, property);
      if (property.collection) {
        this.ensureRefsCollection(target, property).remove(value);
      } else {
        target[property.name] = undefined;
      }
    }
  };
  Refs.prototype.set = function (target, property, value) {
    if (target) {
      this.ensureBound(target, property);
      if (property.collection) {
        this.ensureRefsCollection(target, property).add(value);
      } else {
        target[property.name] = value;
      }
    }
  };

  var parentRefs = new Refs({ name: 'children', enumerable: true, collection: true }, { name: 'parent' }),
      labelRefs = new Refs({ name: 'labels', enumerable: true, collection: true }, { name: 'labelTarget' }),
      attacherRefs = new Refs({ name: 'attachers', collection: true }, { name: 'host' }),
      outgoingRefs = new Refs({ name: 'outgoing', collection: true }, { name: 'source' }),
      incomingRefs = new Refs({ name: 'incoming', collection: true }, { name: 'target' });

  /**
   * @typedef {import('./Types').Element} Element
   * @typedef {import('./Types').Shape} Shape
   * @typedef {import('./Types').Root} Root
   * @typedef {import('./Types').Label} Label
   * @typedef {import('./Types').Connection} Connection
   */

  /**
   * The basic graphical representation
   *
   * @class
   * @constructor
   */
  function ElementImpl() {

    /**
     * The object that backs up the shape
     *
     * @name Element#businessObject
     * @type Object
     */
    Object.defineProperty(this, 'businessObject', {
      writable: true
    });


    /**
     * Single label support, will mapped to multi label array
     *
     * @name Element#label
     * @type Object
     */
    Object.defineProperty(this, 'label', {
      get: function() {
        return this.labels[0];
      },
      set: function(newLabel) {

        var label = this.label,
            labels = this.labels;

        if (!newLabel && label) {
          labels.remove(label);
        } else {
          labels.add(newLabel, 0);
        }
      }
    });

    /**
     * The parent shape
     *
     * @name Element#parent
     * @type Shape
     */
    parentRefs.bind(this, 'parent');

    /**
     * The list of labels
     *
     * @name Element#labels
     * @type Label
     */
    labelRefs.bind(this, 'labels');

    /**
     * The list of outgoing connections
     *
     * @name Element#outgoing
     * @type Array<Connection>
     */
    outgoingRefs.bind(this, 'outgoing');

    /**
     * The list of incoming connections
     *
     * @name Element#incoming
     * @type Array<Connection>
     */
    incomingRefs.bind(this, 'incoming');
  }


  /**
   * A graphical object
   *
   * @class
   * @constructor
   *
   * @extends ElementImpl
   */
  function ShapeImpl() {
    ElementImpl.call(this);

    /**
     * Indicates frame shapes
     *
     * @name ShapeImpl#isFrame
     * @type boolean
     */

    /**
     * The list of children
     *
     * @name ShapeImpl#children
     * @type Element[]
     */
    parentRefs.bind(this, 'children');

    /**
     * @name ShapeImpl#host
     * @type Shape
     */
    attacherRefs.bind(this, 'host');

    /**
     * @name ShapeImpl#attachers
     * @type Shape
     */
    attacherRefs.bind(this, 'attachers');
  }

  e(ShapeImpl, ElementImpl);


  /**
   * A root graphical object
   *
   * @class
   * @constructor
   *
   * @extends ElementImpl
   */
  function RootImpl() {
    ElementImpl.call(this);

    /**
     * The list of children
     *
     * @name RootImpl#children
     * @type Element[]
     */
    parentRefs.bind(this, 'children');
  }

  e(RootImpl, ShapeImpl);


  /**
   * A label for an element
   *
   * @class
   * @constructor
   *
   * @extends ShapeImpl
   */
  function LabelImpl() {
    ShapeImpl.call(this);

    /**
     * The labeled element
     *
     * @name LabelImpl#labelTarget
     * @type Element
     */
    labelRefs.bind(this, 'labelTarget');
  }

  e(LabelImpl, ShapeImpl);


  /**
   * A connection between two elements
   *
   * @class
   * @constructor
   *
   * @extends ElementImpl
   */
  function ConnectionImpl() {
    ElementImpl.call(this);

    /**
     * The element this connection originates from
     *
     * @name ConnectionImpl#source
     * @type Element
     */
    outgoingRefs.bind(this, 'source');

    /**
     * The element this connection points to
     *
     * @name ConnectionImpl#target
     * @type Element
     */
    incomingRefs.bind(this, 'target');
  }

  e(ConnectionImpl, ElementImpl);


  var types$6 = {
    connection: ConnectionImpl,
    shape: ShapeImpl,
    label: LabelImpl,
    root: RootImpl
  };

  /**
   * Creates a root element.
   *
   * @overlord
   *
   * @example
   *
   * ```javascript
   * import * as Model from 'diagram-js/lib/model';
   *
   * const root = Model.create('root', {
   *   x: 100,
   *   y: 100,
   *   width: 100,
   *   height: 100
   * });
   * ```
   *
   * @param {'root'} type
   * @param {any} [attrs]
   *
   * @return {Root}
   */

  /**
   * Creates a connection.
   *
   * @overlord
   *
   * @example
   *
   * ```javascript
   * import * as Model from 'diagram-js/lib/model';
   *
   * const connection = Model.create('connection', {
   *   waypoints: [
   *     { x: 100, y: 100 },
   *     { x: 200, y: 100 }
   *   ]
   * });
   * ```
   *
   * @param {'connection'} type
   * @param {any} [attrs]
   *
   * @return {Connection}
   */

  /**
   * Creates a shape.
   *
   * @overlord
   *
   * @example
   *
   * ```javascript
   * import * as Model from 'diagram-js/lib/model';
   *
   * const shape = Model.create('shape', {
   *   x: 100,
   *   y: 100,
   *   width: 100,
   *   height: 100
   * });
   * ```
   *
   * @param {'shape'} type
   * @param {any} [attrs]
   *
   * @return {Shape}
   */

  /**
   * Creates a label.
   *
   * @example
   *
   * ```javascript
   * import * as Model from 'diagram-js/lib/model';
   *
   * const label = Model.create('label', {
   *   x: 100,
   *   y: 100,
   *   width: 100,
   *   height: 100,
   *   labelTarget: shape
   * });
   * ```
   *
   * @param {'label'} type
   * @param {Object} [attrs]
   *
   * @return {Label}
   */
  function create(type, attrs) {
    var Type = types$6[type];
    if (!Type) {
      throw new Error('unknown type: <' + type + '>');
    }
    return assign$1(new Type(), attrs);
  }

  /**
   * @typedef {import('../model/Types').Element} Element
   * @typedef {import('../model/Types').Connection} Connection
   * @typedef {import('../model/Types').Label} Label
   * @typedef {import('../model/Types').Root} Root
   * @typedef {import('../model/Types').Shape} Shape
   */

  /**
   * A factory for model elements.
   *
   * @template {Connection} [T=Connection]
   * @template {Label} [U=Label]
   * @template {Root} [V=Root]
   * @template {Shape} [W=Shape]
   */
  function ElementFactory() {
    this._uid = 12;
  }

  /**
   * Create a root element.
   *
   * @param {Partial<Root>} [attrs]
   *
   * @return {V} The created root element.
   */
  ElementFactory.prototype.createRoot = function(attrs) {
    return this.create('root', attrs);
  };

  /**
   * Create a label.
   *
   * @param {Partial<Label>} [attrs]
   *
   * @return {U} The created label.
   */
  ElementFactory.prototype.createLabel = function(attrs) {
    return this.create('label', attrs);
  };

  /**
   * Create a shape.
   *
   * @param {Partial<Shape>} [attrs]
   *
   * @return {W} The created shape.
   */
  ElementFactory.prototype.createShape = function(attrs) {
    return this.create('shape', attrs);
  };

  /**
   * Create a connection.
   *
   * @param {Partial<Connection>} [attrs]
   *
   * @return {T} The created connection.
   */
  ElementFactory.prototype.createConnection = function(attrs) {
    return this.create('connection', attrs);
  };

  /**
   * Create a root element.
   *
   * @overlord
   * @param {'root'} type
   * @param {Partial<Root>} [attrs]
   * @return {V}
   */
  /**
   * Create a shape.
   *
   * @overlord
   * @param {'shape'} type
   * @param {Partial<Shape>} [attrs]
   * @return {W}
   */
  /**
   * Create a connection.
   *
   * @overlord
   * @param {'connection'} type
   * @param {Partial<Connection>} [attrs]
   * @return {T}
   */
  /**
   * Create a label.
   *
   * @param {'label'} type
   * @param {Partial<Label>} [attrs]
   * @return {U}
   */
  ElementFactory.prototype.create = function(type, attrs) {

    attrs = assign$1({}, attrs || {});

    if (!attrs.id) {
      attrs.id = type + '_' + (this._uid++);
    }

    return create(type, attrs);
  };

  var FN_REF = '__fn';

  var DEFAULT_PRIORITY = 1000;

  var slice = Array.prototype.slice;

  /**
   * @typedef { {
   *   stopPropagation(): void;
   *   preventDefault(): void;
   *   cancelBubble: boolean;
   *   defaultPrevented: boolean;
   *   returnValue: any;
   * } } Event
   */

  /**
   * @template E
   *
   * @typedef { (event: E & Event, ...any) => any } EventBusEventCallback
   */

  /**
   * @typedef { {
   *  priority: number;
   *  next: EventBusListener | null;
   *  callback: EventBusEventCallback<any>;
   * } } EventBusListener
   */

  /**
   * A general purpose event bus.
   *
   * This component is used to communicate across a diagram instance.
   * Other parts of a diagram can use it to listen to and broadcast events.
   *
   *
   * ## Registering for Events
   *
   * The event bus provides the {@link EventBus#on} and {@link EventBus#once}
   * methods to register for events. {@link EventBus#off} can be used to
   * remove event registrations. Listeners receive an instance of {@link Event}
   * as the first argument. It allows them to hook into the event execution.
   *
   * ```javascript
   *
   * // listen for event
   * eventBus.on('foo', function(event) {
   *
   *   // access event type
   *   event.type; // 'foo'
   *
   *   // stop propagation to other listeners
   *   event.stopPropagation();
   *
   *   // prevent event default
   *   event.preventDefault();
   * });
   *
   * // listen for event with custom payload
   * eventBus.on('bar', function(event, payload) {
   *   console.log(payload);
   * });
   *
   * // listen for event returning value
   * eventBus.on('foobar', function(event) {
   *
   *   // stop event propagation + prevent default
   *   return false;
   *
   *   // stop event propagation + return custom result
   *   return {
   *     complex: 'listening result'
   *   };
   * });
   *
   *
   * // listen with custom priority (default=1000, higher is better)
   * eventBus.on('priorityfoo', 1500, function(event) {
   *   console.log('invoked first!');
   * });
   *
   *
   * // listen for event and pass the context (`this`)
   * eventBus.on('foobar', function(event) {
   *   this.foo();
   * }, this);
   * ```
   *
   *
   * ## Emitting Events
   *
   * Events can be emitted via the event bus using {@link EventBus#fire}.
   *
   * ```javascript
   *
   * // false indicates that the default action
   * // was prevented by listeners
   * if (eventBus.fire('foo') === false) {
   *   console.log('default has been prevented!');
   * };
   *
   *
   * // custom args + return value listener
   * eventBus.on('sum', function(event, a, b) {
   *   return a + b;
   * });
   *
   * // you can pass custom arguments + retrieve result values.
   * var sum = eventBus.fire('sum', 1, 2);
   * console.log(sum); // 3
   * ```
   *
   * @template [EventMap=null]
   */
  function EventBus() {

    /**
     * @type { Record<string, EventBusListener> }
     */
    this._listeners = {};

    // cleanup on destroy on lowest priority to allow
    // message passing until the bitter end
    this.on('diagram.destroy', 1, this._destroy, this);
  }

  /**
   * @overlord
   *
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to {@link EventBus#fire}.
   *
   * Returning false from a listener will prevent the events default action
   * (if any is specified). To stop an event from being processed further in
   * other listeners execute {@link Event#stopPropagation}.
   *
   * Returning anything but `undefined` from a listener will stop the listener propagation.
   *
   * @template T
   *
   * @param {string|string[]} events to subscribe to
   * @param {number} [priority=1000] listen priority
   * @param {EventBusEventCallback<T>} callback
   * @param {any} [that] callback context
   */
  /**
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to {@link EventBus#fire}.
   *
   * Returning false from a listener will prevent the events default action
   * (if any is specified). To stop an event from being processed further in
   * other listeners execute {@link Event#stopPropagation}.
   *
   * Returning anything but `undefined` from a listener will stop the listener propagation.
   *
   * @template {keyof EventMap} EventName
   *
   * @param {EventName} events to subscribe to
   * @param {number} [priority=1000] listen priority
   * @param {EventBusEventCallback<EventMap[EventName]>} callback
   * @param {any} [that] callback context
   */
  EventBus.prototype.on = function(events, priority, callback, that) {

    events = isArray$1(events) ? events : [ events ];

    if (isFunction(priority)) {
      that = callback;
      callback = priority;
      priority = DEFAULT_PRIORITY;
    }

    if (!isNumber(priority)) {
      throw new Error('priority must be a number');
    }

    var actualCallback = callback;

    if (that) {
      actualCallback = bind$1(callback, that);

      // make sure we remember and are able to remove
      // bound callbacks via {@link #off} using the original
      // callback
      actualCallback[FN_REF] = callback[FN_REF] || callback;
    }

    var self = this;

    events.forEach(function(e) {
      self._addListener(e, {
        priority: priority,
        callback: actualCallback,
        next: null
      });
    });
  };

  /**
   * @overlord
   *
   * Register an event listener that is called only once.
   *
   * @template T
   *
   * @param {string|string[]} events to subscribe to
   * @param {number} [priority=1000] the listen priority
   * @param {EventBusEventCallback<T>} callback
   * @param {any} [that] callback context
   */
  /**
   * Register an event listener that is called only once.
   *
   * @template {keyof EventMap} EventName
   *
   * @param {EventName} events to subscribe to
   * @param {number} [priority=1000] listen priority
   * @param {EventBusEventCallback<EventMap[EventName]>} callback
   * @param {any} [that] callback context
   */
  EventBus.prototype.once = function(events, priority, callback, that) {
    var self = this;

    if (isFunction(priority)) {
      that = callback;
      callback = priority;
      priority = DEFAULT_PRIORITY;
    }

    if (!isNumber(priority)) {
      throw new Error('priority must be a number');
    }

    function wrappedCallback() {
      wrappedCallback.__isTomb = true;

      var result = callback.apply(that, arguments);

      self.off(events, wrappedCallback);

      return result;
    }

    // make sure we remember and are able to remove
    // bound callbacks via {@link #off} using the original
    // callback
    wrappedCallback[FN_REF] = callback;

    this.on(events, priority, wrappedCallback);
  };


  /**
   * Removes event listeners by event and callback.
   *
   * If no callback is given, all listeners for a given event name are being removed.
   *
   * @param {string|string[]} events
   * @param {EventBusEventCallback<unknown>} [callback]
   */
  EventBus.prototype.off = function(events, callback) {

    events = isArray$1(events) ? events : [ events ];

    var self = this;

    events.forEach(function(event) {
      self._removeListener(event, callback);
    });

  };


  /**
   * Create an event recognized be the event bus.
   *
   * @param {Object} data Event data.
   *
   * @return {Event} An event that will be recognized by the event bus.
   */
  EventBus.prototype.createEvent = function(data) {
    var event = new InternalEvent();

    event.init(data);

    return event;
  };


  /**
   * Fires an event.
   *
   * @example
   *
   * ```javascript
   * // fire event by name
   * events.fire('foo');
   *
   * // fire event object with nested type
   * var event = { type: 'foo' };
   * events.fire(event);
   *
   * // fire event with explicit type
   * var event = { x: 10, y: 20 };
   * events.fire('element.moved', event);
   *
   * // pass additional arguments to the event
   * events.on('foo', function(event, bar) {
   *   alert(bar);
   * });
   *
   * events.fire({ type: 'foo' }, 'I am bar!');
   * ```
   *
   * @param {string} [type] event type
   * @param {Object} [data] event or event data
   * @param {...any} [args] additional arguments the callback will be called with.
   *
   * @return {any} The return value. Will be set to `false` if the default was prevented.
   */
  EventBus.prototype.fire = function(type, data) {
    var event,
        firstListener,
        returnValue,
        args;

    args = slice.call(arguments);

    if (typeof type === 'object') {
      data = type;
      type = data.type;
    }

    if (!type) {
      throw new Error('no event type specified');
    }

    firstListener = this._listeners[type];

    if (!firstListener) {
      return;
    }

    // we make sure we fire instances of our home made
    // events here. We wrap them only once, though
    if (data instanceof InternalEvent) {

      // we are fine, we alread have an event
      event = data;
    } else {
      event = this.createEvent(data);
    }

    // ensure we pass the event as the first parameter
    args[0] = event;

    // original event type (in case we delegate)
    var originalType = event.type;

    // update event type before delegation
    if (type !== originalType) {
      event.type = type;
    }

    try {
      returnValue = this._invokeListeners(event, args, firstListener);
    } finally {

      // reset event type after delegation
      if (type !== originalType) {
        event.type = originalType;
      }
    }

    // set the return value to false if the event default
    // got prevented and no other return value exists
    if (returnValue === undefined && event.defaultPrevented) {
      returnValue = false;
    }

    return returnValue;
  };

  /**
   * Handle an error by firing an event.
   *
   * @param {Error} error The error to be handled.
   *
   * @return {boolean} Whether the error was handled.
   */
  EventBus.prototype.handleError = function(error) {
    return this.fire('error', { error: error }) === false;
  };


  EventBus.prototype._destroy = function() {
    this._listeners = {};
  };

  /**
   * @param {Event} event
   * @param {any[]} args
   * @param {EventBusListener} listener
   *
   * @return {any}
   */
  EventBus.prototype._invokeListeners = function(event, args, listener) {

    var returnValue;

    while (listener) {

      // handle stopped propagation
      if (event.cancelBubble) {
        break;
      }

      returnValue = this._invokeListener(event, args, listener);

      listener = listener.next;
    }

    return returnValue;
  };

  /**
   * @param {Event} event
   * @param {any[]} args
   * @param {EventBusListener} listener
   *
   * @return {any}
   */
  EventBus.prototype._invokeListener = function(event, args, listener) {

    var returnValue;

    if (listener.callback.__isTomb) {
      return returnValue;
    }

    try {

      // returning false prevents the default action
      returnValue = invokeFunction(listener.callback, args);

      // stop propagation on return value
      if (returnValue !== undefined) {
        event.returnValue = returnValue;
        event.stopPropagation();
      }

      // prevent default on return false
      if (returnValue === false) {
        event.preventDefault();
      }
    } catch (error) {
      if (!this.handleError(error)) {
        console.error('unhandled error in event listener', error);

        throw error;
      }
    }

    return returnValue;
  };

  /**
   * Add new listener with a certain priority to the list
   * of listeners (for the given event).
   *
   * The semantics of listener registration / listener execution are
   * first register, first serve: New listeners will always be inserted
   * after existing listeners with the same priority.
   *
   * Example: Inserting two listeners with priority 1000 and 1300
   *
   *    * before: [ 1500, 1500, 1000, 1000 ]
   *    * after: [ 1500, 1500, (new=1300), 1000, 1000, (new=1000) ]
   *
   * @param {string} event
   * @param {EventBusListener} newListener
   */
  EventBus.prototype._addListener = function(event, newListener) {

    var listener = this._getListeners(event),
        previousListener;

    // no prior listeners
    if (!listener) {
      this._setListeners(event, newListener);

      return;
    }

    // ensure we order listeners by priority from
    // 0 (high) to n > 0 (low)
    while (listener) {

      if (listener.priority < newListener.priority) {

        newListener.next = listener;

        if (previousListener) {
          previousListener.next = newListener;
        } else {
          this._setListeners(event, newListener);
        }

        return;
      }

      previousListener = listener;
      listener = listener.next;
    }

    // add new listener to back
    previousListener.next = newListener;
  };


  /**
   * @param {string} name
   *
   * @return {EventBusListener}
   */
  EventBus.prototype._getListeners = function(name) {
    return this._listeners[name];
  };

  /**
   * @param {string} name
   * @param {EventBusListener} listener
   */
  EventBus.prototype._setListeners = function(name, listener) {
    this._listeners[name] = listener;
  };

  EventBus.prototype._removeListener = function(event, callback) {

    var listener = this._getListeners(event),
        nextListener,
        previousListener,
        listenerCallback;

    if (!callback) {

      // clear listeners
      this._setListeners(event, null);

      return;
    }

    while (listener) {

      nextListener = listener.next;

      listenerCallback = listener.callback;

      if (listenerCallback === callback || listenerCallback[FN_REF] === callback) {
        if (previousListener) {
          previousListener.next = nextListener;
        } else {

          // new first listener
          this._setListeners(event, nextListener);
        }
      }

      previousListener = listener;
      listener = nextListener;
    }
  };

  /**
   * A event that is emitted via the event bus.
   */
  function InternalEvent() { }

  InternalEvent.prototype.stopPropagation = function() {
    this.cancelBubble = true;
  };

  InternalEvent.prototype.preventDefault = function() {
    this.defaultPrevented = true;
  };

  InternalEvent.prototype.init = function(data) {
    assign$1(this, data || {});
  };


  /**
   * Invoke function. Be fast...
   *
   * @param {Function} fn
   * @param {any[]} args
   *
   * @return {any}
   */
  function invokeFunction(fn, args) {
    return fn.apply(null, args);
  }

  /**
   * SVGs for elements are generated by the {@link GraphicsFactory}.
   *
   * This utility gives quick access to the important semantic
   * parts of an element.
   */

  /**
   * Returns the visual part of a diagram element.
   *
   * @param {SVGElement} gfx
   *
   * @return {SVGElement}
   */
  function getVisual(gfx) {
    return gfx.childNodes[0];
  }

  /**
   * Returns the children for a given diagram element.
   *
   * @param {SVGElement} gfx
   * @return {SVGElement}
   */
  function getChildren(gfx) {
    return gfx.parentNode.childNodes[1];
  }

  /**
   * @typedef {import('./Types').ConnectionLike} ConnectionLike
   * @typedef {import('./Types').ElementLike} ElementLike
   * @typedef {import('./Types').ShapeLike} ShapeLike
   *
   * @typedef {import('./ElementRegistry').default} ElementRegistry
   * @typedef {import('./EventBus').default} EventBus
   */

  /**
   * A factory that creates graphical elements.
   *
   * @param {EventBus} eventBus
   * @param {ElementRegistry} elementRegistry
   */
  function GraphicsFactory(eventBus, elementRegistry) {
    this._eventBus = eventBus;
    this._elementRegistry = elementRegistry;
  }

  GraphicsFactory.$inject = [ 'eventBus' , 'elementRegistry' ];

  /**
   * @param { { parent?: any } } element
   * @return {SVGElement}
   */
  GraphicsFactory.prototype._getChildrenContainer = function(element) {

    var gfx = this._elementRegistry.getGraphics(element);

    var childrenGfx;

    // root element
    if (!element.parent) {
      childrenGfx = gfx;
    } else {
      childrenGfx = getChildren(gfx);
      if (!childrenGfx) {
        childrenGfx = create$1('g');
        classes$1(childrenGfx).add('djs-children');

        append(gfx.parentNode, childrenGfx);
      }
    }

    return childrenGfx;
  };

  /**
   * Clears the graphical representation of the element and returns the
   * cleared visual (the <g class="djs-visual" /> element).
   */
  GraphicsFactory.prototype._clear = function(gfx) {
    var visual = getVisual(gfx);

    clear(visual);

    return visual;
  };

  /**
   * Creates a gfx container for shapes and connections
   *
   * The layout is as follows:
   *
   * <g class="djs-group">
   *
   *   <!-- the gfx -->
   *   <g class="djs-element djs-(shape|connection|frame)">
   *     <g class="djs-visual">
   *       <!-- the renderer draws in here -->
   *     </g>
   *
   *     <!-- extensions (overlays, click box, ...) goes here
   *   </g>
   *
   *   <!-- the gfx child nodes -->
   *   <g class="djs-children"></g>
   * </g>
   *
   * @param {string} type the type of the element, i.e. shape | connection
   * @param {SVGElement} childrenGfx
   * @param {number} [parentIndex] position to create container in parent
   * @param {boolean} [isFrame] is frame element
   *
   * @return {SVGElement}
   */
  GraphicsFactory.prototype._createContainer = function(
      type, childrenGfx, parentIndex, isFrame
  ) {
    var outerGfx = create$1('g');
    classes$1(outerGfx).add('djs-group');

    // insert node at position
    if (typeof parentIndex !== 'undefined') {
      prependTo(outerGfx, childrenGfx, childrenGfx.childNodes[parentIndex]);
    } else {
      append(childrenGfx, outerGfx);
    }

    var gfx = create$1('g');
    classes$1(gfx).add('djs-element');
    classes$1(gfx).add('djs-' + type);

    if (isFrame) {
      classes$1(gfx).add('djs-frame');
    }

    append(outerGfx, gfx);

    // create visual
    var visual = create$1('g');
    classes$1(visual).add('djs-visual');

    append(gfx, visual);

    return gfx;
  };

  /**
   * Create a graphical element.
   *
   * @param { 'shape' | 'connection' | 'label' | 'root' } type The type of the element.
   * @param {ElementLike} element The element.
   * @param {number} [parentIndex] The index at which to add the graphical element to its parent's children.
   *
   * @return {SVGElement} The graphical element.
   */
  GraphicsFactory.prototype.create = function(type, element, parentIndex) {
    var childrenGfx = this._getChildrenContainer(element.parent);
    return this._createContainer(type, childrenGfx, parentIndex, isFrameElement$1(element));
  };

  /**
   * Update the containments of the given elements.
   *
   * @param {ElementLike[]} elements The elements.
   */
  GraphicsFactory.prototype.updateContainments = function(elements) {

    var self = this,
        elementRegistry = this._elementRegistry,
        parents;

    parents = reduce(elements, function(map, e) {

      if (e.parent) {
        map[e.parent.id] = e.parent;
      }

      return map;
    }, {});

    // update all parents of changed and reorganized their children
    // in the correct order (as indicated in our model)
    forEach(parents, function(parent) {

      var children = parent.children;

      if (!children) {
        return;
      }

      var childrenGfx = self._getChildrenContainer(parent);

      forEach(children.slice().reverse(), function(child) {
        var childGfx = elementRegistry.getGraphics(child);

        prependTo(childGfx.parentNode, childrenGfx);
      });
    });
  };

  /**
   * Draw a shape.
   *
   * @param {SVGElement} visual The graphical element.
   * @param {ShapeLike} element The shape.
   * @param {Object} attrs Optional attributes.
   *
   * @return {SVGElement}
   */
  GraphicsFactory.prototype.drawShape = function(visual, element, attrs = {}) {
    var eventBus = this._eventBus;

    return eventBus.fire('render.shape', { gfx: visual, element, attrs });
  };

  /**
   * Get the path of a shape.
   *
   * @param {ShapeLike} element The shape.
   *
   * @return {string} The path of the shape.
   */
  GraphicsFactory.prototype.getShapePath = function(element) {
    var eventBus = this._eventBus;

    return eventBus.fire('render.getShapePath', element);
  };

  /**
   * Draw a connection.
   *
   * @param {SVGElement} visual The graphical element.
   * @param {ConnectionLike} element The connection.
   * @param {Object} attrs Optional attributes.
   *
   * @return {SVGElement}
   */
  GraphicsFactory.prototype.drawConnection = function(visual, element, attrs = {}) {
    var eventBus = this._eventBus;

    return eventBus.fire('render.connection', { gfx: visual, element, attrs });
  };

  /**
   * Get the path of a connection.
   *
   * @param {ConnectionLike} connection The connection.
   *
   * @return {string} The path of the connection.
   */
  GraphicsFactory.prototype.getConnectionPath = function(connection) {
    var eventBus = this._eventBus;

    return eventBus.fire('render.getConnectionPath', connection);
  };

  /**
   * Update an elements graphical representation.
   *
   * @param {'shape'|'connection'} type
   * @param {ElementLike} element
   * @param {SVGElement} gfx
   */
  GraphicsFactory.prototype.update = function(type, element, gfx) {

    // do NOT update root element
    if (!element.parent) {
      return;
    }

    var visual = this._clear(gfx);

    // redraw
    if (type === 'shape') {
      this.drawShape(visual, element);

      // update positioning
      translate$1(gfx, element.x, element.y);
    } else if (type === 'connection') {
      this.drawConnection(visual, element);
    } else {
      throw new Error('unknown type: ' + type);
    }

    if (element.hidden) {
      attr$1(gfx, 'display', 'none');
    } else {
      attr$1(gfx, 'display', 'block');
    }
  };

  /**
   * Remove a graphical element.
   *
   * @param {ElementLike} element The element.
   */
  GraphicsFactory.prototype.remove = function(element) {
    var gfx = this._elementRegistry.getGraphics(element);

    // remove
    remove$2(gfx.parentNode);
  };


  // helpers //////////

  function prependTo(newNode, parentNode, siblingNode) {
    var node = siblingNode || parentNode.firstChild;

    // do not prepend node to itself to prevent IE from crashing
    // https://github.com/bpmn-io/bpmn-js/issues/746
    if (newNode === node) {
      return;
    }

    parentNode.insertBefore(newNode, node);
  }

  /**
   * @type { import('didi').ModuleDeclaration }
   */
  var CoreModule = {
    __depends__: [ DrawModule ],
    __init__: [ 'canvas' ],
    canvas: [ 'type', Canvas ],
    elementRegistry: [ 'type', ElementRegistry ],
    elementFactory: [ 'type', ElementFactory ],
    eventBus: [ 'type', EventBus ],
    graphicsFactory: [ 'type', GraphicsFactory ]
  };

  /**
   * @typedef {import('didi').InjectionContext} InjectionContext
   * @typedef {import('didi').LocalsMap} LocalsMap
   * @typedef {import('didi').ModuleDeclaration} ModuleDeclaration
   *
   * @typedef { {
   *   modules?: ModuleDeclaration[];
   * } & Record<string, any> } DiagramOptions
   */

  /**
   * @template T
   * @typedef {import('didi').FactoryFunction<T>} FactoryFunction
   */

  /**
   * @template T
   * @typedef {import('didi').ArrayFunc<T>} ArrayFunc
   */

  /**
   * Bootstrap an injector from a list of modules, instantiating a number of default components
   *
   * @param {ModuleDeclaration[]} modules
   *
   * @return {Injector} a injector to use to access the components
   */
  function bootstrap(modules) {
    var injector = new Injector(modules);

    injector.init();

    return injector;
  }

  /**
   * Creates an injector from passed options.
   *
   * @template ServiceMap
   * @param {DiagramOptions} [options]
   *
   * @return {Injector<ServiceMap>}
   */
  function createInjector(options) {

    options = options || {};

    /**
     * @type { ModuleDeclaration }
     */
    var configModule = {
      'config': [ 'value', options ]
    };

    var modules = [ configModule, CoreModule ].concat(options.modules || []);

    return bootstrap(modules);
  }


  /**
   * The main diagram-js entry point that bootstraps the diagram with the given
   * configuration.
   *
   * To register extensions with the diagram, pass them as Array<Module> to the constructor.
   *
   * @class
   * @constructor
   * @template [ServiceMap=null]
   *
   * @example Creating a plug-in that logs whenever a shape is added to the canvas.
   *
   * ```javascript
   * // plug-in implementation
   * function MyLoggingPlugin(eventBus) {
   *   eventBus.on('shape.added', function(event) {
   *     console.log('shape ', event.shape, ' was added to the diagram');
   *   });
   * }
   *
   * // export as module
   * export default {
   *   __init__: [ 'myLoggingPlugin' ],
   *     myLoggingPlugin: [ 'type', MyLoggingPlugin ]
   * };
   * ```
   *
   * Use the plug-in in a Diagram instance:
   *
   * ```javascript
   * import MyLoggingModule from 'path-to-my-logging-plugin';
   *
   * var diagram = new Diagram({
   *   modules: [
   *     MyLoggingModule
   *   ]
   * });
   *
   * diagram.invoke([ 'canvas', function(canvas) {
   *   // add shape to drawing canvas
   *   canvas.addShape({ x: 10, y: 10 });
   * });
   *
   * // 'shape ... was added to the diagram' logged to console
   * ```
   *
   * @param {DiagramOptions} [options]
   * @param {Injector<ServiceMap>} [injector] An (optional) injector to bootstrap the diagram with.
   */
  function Diagram(options, injector) {

    /**
     * @type {Injector<ServiceMap>}
     */
    this._injector = injector || createInjector(options);

    // init

    /**
     * An event indicating that all plug-ins are loaded.
     *
     * Use this event to fire other events to interested plug-ins
     *
     * @memberOf Diagram
     *
     * @event diagram.init
     *
     * @example
     *
     * ```javascript
     * eventBus.on('diagram.init', function() {
     *   eventBus.fire('my-custom-event', { foo: 'BAR' });
     * });
     * ```
     *
     * @type {Object}
     */
    this.get('eventBus').fire('diagram.init');
  }

  /**
   * @overlord
   *
   * Resolves a diagram service.
   *
   * @template T
   *
   * @param {string} name The name of the service to get.
   *
   * @return {T}
   */
  /**
   * @overlord
   *
   * Resolves a diagram service.
   *
   * @template T
   *
   * @param {string} name The name of the service to get.
   * @param {true} strict If false, resolve missing services to null.
   *
   * @return {T}
   */
  /**
   * @overlord
   *
   * Resolves a diagram service.
   *
   * @template T
   *
   * @param {string} name The name of the service to get.
   * @param {boolean} strict If false, resolve missing services to null.
   *
   * @return {T|null}
   */
  /**
   * Resolves a diagram service.
   *
   * @template {keyof ServiceMap} Name
   *
   * @param {Name} name The name of the service to get.
   *
   * @return {ServiceMap[Name]}
   */
  Diagram.prototype.get = function(name, strict) {
    return this._injector.get(name, strict);
  };

  /**
   * @overlord
   *
   * Invoke the given function, injecting dependencies. Return the result.
   *
   * @template T
   *
   * @param {FactoryFunction<T>} func
   * @param {InjectionContext} [context]
   * @param {LocalsMap} [locals]
   *
   * @return {T}
   */
  /**
   * Invoke the given function, injecting dependencies provided in
   * array notation. Return the result.
   *
   * @template T
   *
   * @param {ArrayFunc<T>} func function to be invoked
   * @param {InjectionContext} [context] context of the invocation
   * @param {LocalsMap} [locals] locals provided
   *
   * @return {T}
   */
  Diagram.prototype.invoke = function(func, context, locals) {
    return this._injector.invoke(func, context, locals);
  };

  /**
   * Destroys the diagram
   */
  Diagram.prototype.destroy = function() {
    this.get('eventBus').fire('diagram.destroy');
  };

  /**
   * Clear the diagram, removing all contents.
   */
  Diagram.prototype.clear = function() {
    this.get('eventBus').fire('diagram.clear');
  };

  /**
   * Moddle base element.
   */
  function Base() { }

  Base.prototype.get = function(name) {
    return this.$model.properties.get(this, name);
  };

  Base.prototype.set = function(name, value) {
    this.$model.properties.set(this, name, value);
  };

  /**
   * A model element factory.
   *
   * @param {Moddle} model
   * @param {Properties} properties
   */
  function Factory(model, properties) {
    this.model = model;
    this.properties = properties;
  }


  Factory.prototype.createType = function(descriptor) {

    var model = this.model;

    var props = this.properties,
        prototype = Object.create(Base.prototype);

    // initialize default values
    forEach(descriptor.properties, function(p) {
      if (!p.isMany && p.default !== undefined) {
        prototype[p.name] = p.default;
      }
    });

    props.defineModel(prototype, model);
    props.defineDescriptor(prototype, descriptor);

    var name = descriptor.ns.name;

    /**
     * The new type constructor
     */
    function ModdleElement(attrs) {
      props.define(this, '$type', { value: name, enumerable: true });
      props.define(this, '$attrs', { value: {} });
      props.define(this, '$parent', { writable: true });

      forEach(attrs, bind$1(function(val, key) {
        this.set(key, val);
      }, this));
    }

    ModdleElement.prototype = prototype;

    ModdleElement.hasType = prototype.$instanceOf = this.model.hasType;

    // static links
    props.defineModel(ModdleElement, model);
    props.defineDescriptor(ModdleElement, descriptor);

    return ModdleElement;
  };

  /**
   * Built-in moddle types
   */
  var BUILTINS = {
    String: true,
    Boolean: true,
    Integer: true,
    Real: true,
    Element: true
  };

  /**
   * Converters for built in types from string representations
   */
  var TYPE_CONVERTERS = {
    String: function(s) { return s; },
    Boolean: function(s) { return s === 'true'; },
    Integer: function(s) { return parseInt(s, 10); },
    Real: function(s) { return parseFloat(s); }
  };

  /**
   * Convert a type to its real representation
   */
  function coerceType(type, value) {

    var converter = TYPE_CONVERTERS[type];

    if (converter) {
      return converter(value);
    } else {
      return value;
    }
  }

  /**
   * Return whether the given type is built-in
   */
  function isBuiltIn(type) {
    return !!BUILTINS[type];
  }

  /**
   * Return whether the given type is simple
   */
  function isSimple(type) {
    return !!TYPE_CONVERTERS[type];
  }

  /**
   * Parses a namespaced attribute name of the form (ns:)localName to an object,
   * given a default prefix to assume in case no explicit namespace is given.
   *
   * @param {String} name
   * @param {String} [defaultPrefix] the default prefix to take, if none is present.
   *
   * @return {Object} the parsed name
   */
  function parseName(name, defaultPrefix) {
    var parts = name.split(/:/),
        localName, prefix;

    // no prefix (i.e. only local name)
    if (parts.length === 1) {
      localName = name;
      prefix = defaultPrefix;
    }

    // prefix + local name
    else if (parts.length === 2) {
      localName = parts[1];
      prefix = parts[0];
    }

    else {
      throw new Error('expected <prefix:localName> or <localName>, got ' + name);
    }

    name = (prefix ? prefix + ':' : '') + localName;

    return {
      name: name,
      prefix: prefix,
      localName: localName
    };
  }

  /**
   * A utility to build element descriptors.
   */
  function DescriptorBuilder(nameNs) {
    this.ns = nameNs;
    this.name = nameNs.name;
    this.allTypes = [];
    this.allTypesByName = {};
    this.properties = [];
    this.propertiesByName = {};
  }


  DescriptorBuilder.prototype.build = function() {
    return pick(this, [
      'ns',
      'name',
      'allTypes',
      'allTypesByName',
      'properties',
      'propertiesByName',
      'bodyProperty',
      'idProperty'
    ]);
  };

  /**
   * Add property at given index.
   *
   * @param {Object} p
   * @param {Number} [idx]
   * @param {Boolean} [validate=true]
   */
  DescriptorBuilder.prototype.addProperty = function(p, idx, validate) {

    if (typeof idx === 'boolean') {
      validate = idx;
      idx = undefined;
    }

    this.addNamedProperty(p, validate !== false);

    var properties = this.properties;

    if (idx !== undefined) {
      properties.splice(idx, 0, p);
    } else {
      properties.push(p);
    }
  };


  DescriptorBuilder.prototype.replaceProperty = function(oldProperty, newProperty, replace) {
    var oldNameNs = oldProperty.ns;

    var props = this.properties,
        propertiesByName = this.propertiesByName,
        rename = oldProperty.name !== newProperty.name;

    if (oldProperty.isId) {
      if (!newProperty.isId) {
        throw new Error(
          'property <' + newProperty.ns.name + '> must be id property ' +
          'to refine <' + oldProperty.ns.name + '>');
      }

      this.setIdProperty(newProperty, false);
    }

    if (oldProperty.isBody) {

      if (!newProperty.isBody) {
        throw new Error(
          'property <' + newProperty.ns.name + '> must be body property ' +
          'to refine <' + oldProperty.ns.name + '>');
      }

      // TODO: Check compatibility
      this.setBodyProperty(newProperty, false);
    }

    // validate existence and get location of old property
    var idx = props.indexOf(oldProperty);
    if (idx === -1) {
      throw new Error('property <' + oldNameNs.name + '> not found in property list');
    }

    // remove old property
    props.splice(idx, 1);

    // replacing the named property is intentional
    //
    //  * validate only if this is a "rename" operation
    //  * add at specific index unless we "replace"
    //
    this.addProperty(newProperty, replace ? undefined : idx, rename);

    // make new property available under old name
    propertiesByName[oldNameNs.name] = propertiesByName[oldNameNs.localName] = newProperty;
  };


  DescriptorBuilder.prototype.redefineProperty = function(p, targetPropertyName, replace) {

    var nsPrefix = p.ns.prefix;
    var parts = targetPropertyName.split('#');

    var name = parseName(parts[0], nsPrefix);
    var attrName = parseName(parts[1], name.prefix).name;

    var redefinedProperty = this.propertiesByName[attrName];
    if (!redefinedProperty) {
      throw new Error('refined property <' + attrName + '> not found');
    } else {
      this.replaceProperty(redefinedProperty, p, replace);
    }

    delete p.redefines;
  };

  DescriptorBuilder.prototype.addNamedProperty = function(p, validate) {
    var ns = p.ns,
        propsByName = this.propertiesByName;

    if (validate) {
      this.assertNotDefined(p, ns.name);
      this.assertNotDefined(p, ns.localName);
    }

    propsByName[ns.name] = propsByName[ns.localName] = p;
  };

  DescriptorBuilder.prototype.removeNamedProperty = function(p) {
    var ns = p.ns,
        propsByName = this.propertiesByName;

    delete propsByName[ns.name];
    delete propsByName[ns.localName];
  };

  DescriptorBuilder.prototype.setBodyProperty = function(p, validate) {

    if (validate && this.bodyProperty) {
      throw new Error(
        'body property defined multiple times ' +
        '(<' + this.bodyProperty.ns.name + '>, <' + p.ns.name + '>)');
    }

    this.bodyProperty = p;
  };

  DescriptorBuilder.prototype.setIdProperty = function(p, validate) {

    if (validate && this.idProperty) {
      throw new Error(
        'id property defined multiple times ' +
        '(<' + this.idProperty.ns.name + '>, <' + p.ns.name + '>)');
    }

    this.idProperty = p;
  };

  DescriptorBuilder.prototype.assertNotTrait = function(typeDescriptor) {

    const _extends = typeDescriptor.extends || [];

    if (_extends.length) {
      throw new Error(
        `cannot create <${ typeDescriptor.name }> extending <${ typeDescriptor.extends }>`
      );
    }
  };

  DescriptorBuilder.prototype.assertNotDefined = function(p, name) {
    var propertyName = p.name,
        definedProperty = this.propertiesByName[propertyName];

    if (definedProperty) {
      throw new Error(
        'property <' + propertyName + '> already defined; ' +
        'override of <' + definedProperty.definedBy.ns.name + '#' + definedProperty.ns.name + '> by ' +
        '<' + p.definedBy.ns.name + '#' + p.ns.name + '> not allowed without redefines');
    }
  };

  DescriptorBuilder.prototype.hasProperty = function(name) {
    return this.propertiesByName[name];
  };

  DescriptorBuilder.prototype.addTrait = function(t, inherited) {

    if (inherited) {
      this.assertNotTrait(t);
    }

    var typesByName = this.allTypesByName,
        types = this.allTypes;

    var typeName = t.name;

    if (typeName in typesByName) {
      return;
    }

    forEach(t.properties, bind$1(function(p) {

      // clone property to allow extensions
      p = assign$1({}, p, {
        name: p.ns.localName,
        inherited: inherited
      });

      Object.defineProperty(p, 'definedBy', {
        value: t
      });

      var replaces = p.replaces,
          redefines = p.redefines;

      // add replace/redefine support
      if (replaces || redefines) {
        this.redefineProperty(p, replaces || redefines, replaces);
      } else {
        if (p.isBody) {
          this.setBodyProperty(p);
        }
        if (p.isId) {
          this.setIdProperty(p);
        }
        this.addProperty(p);
      }
    }, this));

    types.push(t);
    typesByName[typeName] = t;
  };

  /**
   * A registry of Moddle packages.
   *
   * @param {Array<Package>} packages
   * @param {Properties} properties
   */
  function Registry(packages, properties) {
    this.packageMap = {};
    this.typeMap = {};

    this.packages = [];

    this.properties = properties;

    forEach(packages, bind$1(this.registerPackage, this));
  }


  Registry.prototype.getPackage = function(uriOrPrefix) {
    return this.packageMap[uriOrPrefix];
  };

  Registry.prototype.getPackages = function() {
    return this.packages;
  };


  Registry.prototype.registerPackage = function(pkg) {

    // copy package
    pkg = assign$1({}, pkg);

    var pkgMap = this.packageMap;

    ensureAvailable(pkgMap, pkg, 'prefix');
    ensureAvailable(pkgMap, pkg, 'uri');

    // register types
    forEach(pkg.types, bind$1(function(descriptor) {
      this.registerType(descriptor, pkg);
    }, this));

    pkgMap[pkg.uri] = pkgMap[pkg.prefix] = pkg;
    this.packages.push(pkg);
  };


  /**
   * Register a type from a specific package with us
   */
  Registry.prototype.registerType = function(type, pkg) {

    type = assign$1({}, type, {
      superClass: (type.superClass || []).slice(),
      extends: (type.extends || []).slice(),
      properties: (type.properties || []).slice(),
      meta: assign$1((type.meta || {}))
    });

    var ns = parseName(type.name, pkg.prefix),
        name = ns.name,
        propertiesByName = {};

    // parse properties
    forEach(type.properties, bind$1(function(p) {

      // namespace property names
      var propertyNs = parseName(p.name, ns.prefix),
          propertyName = propertyNs.name;

      // namespace property types
      if (!isBuiltIn(p.type)) {
        p.type = parseName(p.type, propertyNs.prefix).name;
      }

      assign$1(p, {
        ns: propertyNs,
        name: propertyName
      });

      propertiesByName[propertyName] = p;
    }, this));

    // update ns + name
    assign$1(type, {
      ns: ns,
      name: name,
      propertiesByName: propertiesByName
    });

    forEach(type.extends, bind$1(function(extendsName) {
      var extendsNameNs = parseName(extendsName, ns.prefix);

      var extended = this.typeMap[extendsNameNs.name];

      extended.traits = extended.traits || [];
      extended.traits.push(name);
    }, this));

    // link to package
    this.definePackage(type, pkg);

    // register
    this.typeMap[name] = type;
  };


  /**
   * Traverse the type hierarchy from bottom to top,
   * calling iterator with (type, inherited) for all elements in
   * the inheritance chain.
   *
   * @param {Object} nsName
   * @param {Function} iterator
   * @param {Boolean} [trait=false]
   */
  Registry.prototype.mapTypes = function(nsName, iterator, trait) {

    var type = isBuiltIn(nsName.name) ? { name: nsName.name } : this.typeMap[nsName.name];

    var self = this;

    /**
     * Traverse the selected super type or trait
     *
     * @param {String} cls
     * @param {Boolean} [trait=false]
     */
    function traverse(cls, trait) {
      var parentNs = parseName(cls, isBuiltIn(cls) ? '' : nsName.prefix);
      self.mapTypes(parentNs, iterator, trait);
    }

    /**
     * Traverse the selected trait.
     *
     * @param {String} cls
     */
    function traverseTrait(cls) {
      return traverse(cls, true);
    }

    /**
     * Traverse the selected super type
     *
     * @param {String} cls
     */
    function traverseSuper(cls) {
      return traverse(cls, false);
    }

    if (!type) {
      throw new Error('unknown type <' + nsName.name + '>');
    }

    forEach(type.superClass, trait ? traverseTrait : traverseSuper);

    // call iterator with (type, inherited=!trait)
    iterator(type, !trait);

    forEach(type.traits, traverseTrait);
  };


  /**
   * Returns the effective descriptor for a type.
   *
   * @param  {String} type the namespaced name (ns:localName) of the type
   *
   * @return {Descriptor} the resulting effective descriptor
   */
  Registry.prototype.getEffectiveDescriptor = function(name) {

    var nsName = parseName(name);

    var builder = new DescriptorBuilder(nsName);

    this.mapTypes(nsName, function(type, inherited) {
      builder.addTrait(type, inherited);
    });

    var descriptor = builder.build();

    // define package link
    this.definePackage(descriptor, descriptor.allTypes[descriptor.allTypes.length - 1].$pkg);

    return descriptor;
  };


  Registry.prototype.definePackage = function(target, pkg) {
    this.properties.define(target, '$pkg', { value: pkg });
  };



  // helpers ////////////////////////////

  function ensureAvailable(packageMap, pkg, identifierKey) {

    var value = pkg[identifierKey];

    if (value in packageMap) {
      throw new Error('package with ' + identifierKey + ' <' + value + '> already defined');
    }
  }

  /**
   * A utility that gets and sets properties of model elements.
   *
   * @param {Model} model
   */
  function Properties(model) {
    this.model = model;
  }


  /**
   * Sets a named property on the target element.
   * If the value is undefined, the property gets deleted.
   *
   * @param {Object} target
   * @param {String} name
   * @param {Object} value
   */
  Properties.prototype.set = function(target, name, value) {

    if (!isString(name) || !name.length) {
      throw new TypeError('property name must be a non-empty string');
    }

    var property = this.getProperty(target, name);

    var propertyName = property && property.name;

    if (isUndefined(value)) {

      // unset the property, if the specified value is undefined;
      // delete from $attrs (for extensions) or the target itself
      if (property) {
        delete target[propertyName];
      } else {
        delete target.$attrs[stripGlobal(name)];
      }
    } else {

      // set the property, defining well defined properties on the fly
      // or simply updating them in target.$attrs (for extensions)
      if (property) {
        if (propertyName in target) {
          target[propertyName] = value;
        } else {
          defineProperty(target, property, value);
        }
      } else {
        target.$attrs[stripGlobal(name)] = value;
      }
    }
  };

  /**
   * Returns the named property of the given element
   *
   * @param  {Object} target
   * @param  {String} name
   *
   * @return {Object}
   */
  Properties.prototype.get = function(target, name) {

    var property = this.getProperty(target, name);

    if (!property) {
      return target.$attrs[stripGlobal(name)];
    }

    var propertyName = property.name;

    // check if access to collection property and lazily initialize it
    if (!target[propertyName] && property.isMany) {
      defineProperty(target, property, []);
    }

    return target[propertyName];
  };


  /**
   * Define a property on the target element
   *
   * @param  {Object} target
   * @param  {String} name
   * @param  {Object} options
   */
  Properties.prototype.define = function(target, name, options) {

    if (!options.writable) {

      var value = options.value;

      // use getters for read-only variables to support ES6 proxies
      // cf. https://github.com/bpmn-io/internal-docs/issues/386
      options = assign$1({}, options, {
        get: function() { return value; }
      });

      delete options.value;
    }

    Object.defineProperty(target, name, options);
  };


  /**
   * Define the descriptor for an element
   */
  Properties.prototype.defineDescriptor = function(target, descriptor) {
    this.define(target, '$descriptor', { value: descriptor });
  };

  /**
   * Define the model for an element
   */
  Properties.prototype.defineModel = function(target, model) {
    this.define(target, '$model', { value: model });
  };

  /**
   * Return property with the given name on the element.
   *
   * @param {any} target
   * @param {string} name
   *
   * @return {object | null} property
   */
  Properties.prototype.getProperty = function(target, name) {

    var model = this.model;

    var property = model.getPropertyDescriptor(target, name);

    if (property) {
      return property;
    }

    if (name.includes(':')) {
      return null;
    }

    const strict = model.config.strict;

    if (typeof strict !== 'undefined') {
      const error = new TypeError(`unknown property <${ name }> on <${ target.$type }>`);

      if (strict) {
        throw error;
      } else {

        typeof console !== 'undefined' && console.warn(error);
      }
    }

    return null;
  };

  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  function defineProperty(target, property, value) {
    Object.defineProperty(target, property.name, {
      enumerable: !property.isReference,
      writable: true,
      value: value,
      configurable: true
    });
  }

  function stripGlobal(name) {
    return name.replace(/^:/, '');
  }

  // Moddle implementation /////////////////////////////////////////////////

  /**
   * @class Moddle
   *
   * A model that can be used to create elements of a specific type.
   *
   * @example
   *
   * var Moddle = require('moddle');
   *
   * var pkg = {
   *   name: 'mypackage',
   *   prefix: 'my',
   *   types: [
   *     { name: 'Root' }
   *   ]
   * };
   *
   * var moddle = new Moddle([pkg]);
   *
   * @param {Array<Package>} packages the packages to contain
   *
   * @param { { strict?: boolean } } [config] moddle configuration
   */
  function Moddle(packages, config = {}) {

    this.properties = new Properties(this);

    this.factory = new Factory(this, this.properties);
    this.registry = new Registry(packages, this.properties);

    this.typeCache = {};

    this.config = config;
  }


  /**
   * Create an instance of the specified type.
   *
   * @method Moddle#create
   *
   * @example
   *
   * var foo = moddle.create('my:Foo');
   * var bar = moddle.create('my:Bar', { id: 'BAR_1' });
   *
   * @param  {String|Object} descriptor the type descriptor or name know to the model
   * @param  {Object} attrs   a number of attributes to initialize the model instance with
   * @return {Object}         model instance
   */
  Moddle.prototype.create = function(descriptor, attrs) {
    var Type = this.getType(descriptor);

    if (!Type) {
      throw new Error('unknown type <' + descriptor + '>');
    }

    return new Type(attrs);
  };


  /**
   * Returns the type representing a given descriptor
   *
   * @method Moddle#getType
   *
   * @example
   *
   * var Foo = moddle.getType('my:Foo');
   * var foo = new Foo({ 'id' : 'FOO_1' });
   *
   * @param  {String|Object} descriptor the type descriptor or name know to the model
   * @return {Object}         the type representing the descriptor
   */
  Moddle.prototype.getType = function(descriptor) {

    var cache = this.typeCache;

    var name = isString(descriptor) ? descriptor : descriptor.ns.name;

    var type = cache[name];

    if (!type) {
      descriptor = this.registry.getEffectiveDescriptor(name);
      type = cache[name] = this.factory.createType(descriptor);
    }

    return type;
  };


  /**
   * Creates an any-element type to be used within model instances.
   *
   * This can be used to create custom elements that lie outside the meta-model.
   * The created element contains all the meta-data required to serialize it
   * as part of meta-model elements.
   *
   * @method Moddle#createAny
   *
   * @example
   *
   * var foo = moddle.createAny('vendor:Foo', 'http://vendor', {
   *   value: 'bar'
   * });
   *
   * var container = moddle.create('my:Container', 'http://my', {
   *   any: [ foo ]
   * });
   *
   * // go ahead and serialize the stuff
   *
   *
   * @param  {String} name  the name of the element
   * @param  {String} nsUri the namespace uri of the element
   * @param  {Object} [properties] a map of properties to initialize the instance with
   * @return {Object} the any type instance
   */
  Moddle.prototype.createAny = function(name, nsUri, properties) {

    var nameNs = parseName(name);

    var element = {
      $type: name,
      $instanceOf: function(type) {
        return type === this.$type;
      },
      get: function(key) {
        return this[key];
      },
      set: function(key, value) {
        set(this, [ key ], value);
      }
    };

    var descriptor = {
      name: name,
      isGeneric: true,
      ns: {
        prefix: nameNs.prefix,
        localName: nameNs.localName,
        uri: nsUri
      }
    };

    this.properties.defineDescriptor(element, descriptor);
    this.properties.defineModel(element, this);
    this.properties.define(element, 'get', { enumerable: false, writable: true });
    this.properties.define(element, 'set', { enumerable: false, writable: true });
    this.properties.define(element, '$parent', { enumerable: false, writable: true });
    this.properties.define(element, '$instanceOf', { enumerable: false, writable: true });

    forEach(properties, function(a, key) {
      if (isObject(a) && a.value !== undefined) {
        element[a.name] = a.value;
      } else {
        element[key] = a;
      }
    });

    return element;
  };

  /**
   * Returns a registered package by uri or prefix
   *
   * @return {Object} the package
   */
  Moddle.prototype.getPackage = function(uriOrPrefix) {
    return this.registry.getPackage(uriOrPrefix);
  };

  /**
   * Returns a snapshot of all known packages
   *
   * @return {Object} the package
   */
  Moddle.prototype.getPackages = function() {
    return this.registry.getPackages();
  };

  /**
   * Returns the descriptor for an element
   */
  Moddle.prototype.getElementDescriptor = function(element) {
    return element.$descriptor;
  };

  /**
   * Returns true if the given descriptor or instance
   * represents the given type.
   *
   * May be applied to this, if element is omitted.
   */
  Moddle.prototype.hasType = function(element, type) {
    if (type === undefined) {
      type = element;
      element = this;
    }

    var descriptor = element.$model.getElementDescriptor(element);

    return (type in descriptor.allTypesByName);
  };

  /**
   * Returns the descriptor of an elements named property
   */
  Moddle.prototype.getPropertyDescriptor = function(element, property) {
    return this.getElementDescriptor(element).propertiesByName[property];
  };

  /**
   * Returns a mapped type's descriptor
   */
  Moddle.prototype.getTypeDescriptor = function(type) {
    return this.registry.typeMap[type];
  };

  var fromCharCode = String.fromCharCode;

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  var ENTITY_PATTERN = /&#(\d+);|&#x([0-9a-f]+);|&(\w+);/ig;

  var ENTITY_MAPPING = {
    'amp': '&',
    'apos': '\'',
    'gt': '>',
    'lt': '<',
    'quot': '"'
  };

  // map UPPERCASE variants of supported special chars
  Object.keys(ENTITY_MAPPING).forEach(function(k) {
    ENTITY_MAPPING[k.toUpperCase()] = ENTITY_MAPPING[k];
  });


  function replaceEntities(_, d, x, z) {

    // reserved names, i.e. &nbsp;
    if (z) {
      if (hasOwnProperty.call(ENTITY_MAPPING, z)) {
        return ENTITY_MAPPING[z];
      } else {

        // fall back to original value
        return '&' + z + ';';
      }
    }

    // decimal encoded char
    if (d) {
      return fromCharCode(d);
    }

    // hex encoded char
    return fromCharCode(parseInt(x, 16));
  }


  /**
   * A basic entity decoder that can decode a minimal
   * sub-set of reserved names (&amp;) as well as
   * hex (&#xaaf;) and decimal (&#1231;) encoded characters.
   *
   * @param {string} s
   *
   * @return {string} decoded string
   */
  function decodeEntities(s) {
    if (s.length > 3 && s.indexOf('&') !== -1) {
      return s.replace(ENTITY_PATTERN, replaceEntities);
    }

    return s;
  }

  var NON_WHITESPACE_OUTSIDE_ROOT_NODE = 'non-whitespace outside of root node';

  function error$1(msg) {
    return new Error(msg);
  }

  function missingNamespaceForPrefix(prefix) {
    return 'missing namespace for prefix <' + prefix + '>';
  }

  function getter(getFn) {
    return {
      'get': getFn,
      'enumerable': true
    };
  }

  function cloneNsMatrix(nsMatrix) {
    var clone = {}, key;
    for (key in nsMatrix) {
      clone[key] = nsMatrix[key];
    }
    return clone;
  }

  function uriPrefix(prefix) {
    return prefix + '$uri';
  }

  function buildNsMatrix(nsUriToPrefix) {
    var nsMatrix = {},
        uri,
        prefix;

    for (uri in nsUriToPrefix) {
      prefix = nsUriToPrefix[uri];
      nsMatrix[prefix] = prefix;
      nsMatrix[uriPrefix(prefix)] = uri;
    }

    return nsMatrix;
  }

  function noopGetContext() {
    return { line: 0, column: 0 };
  }

  function throwFunc(err) {
    throw err;
  }

  /**
   * Creates a new parser with the given options.
   *
   * @constructor
   *
   * @param  {!Object<string, ?>=} options
   */
  function Parser(options) {

    if (!this) {
      return new Parser(options);
    }

    var proxy = options && options['proxy'];

    var onText,
        onOpenTag,
        onCloseTag,
        onCDATA,
        onError = throwFunc,
        onWarning,
        onComment,
        onQuestion,
        onAttention;

    var getContext = noopGetContext;

    /**
     * Do we need to parse the current elements attributes for namespaces?
     *
     * @type {boolean}
     */
    var maybeNS = false;

    /**
     * Do we process namespaces at all?
     *
     * @type {boolean}
     */
    var isNamespace = false;

    /**
     * The caught error returned on parse end
     *
     * @type {Error}
     */
    var returnError = null;

    /**
     * Should we stop parsing?
     *
     * @type {boolean}
     */
    var parseStop = false;

    /**
     * A map of { uri: prefix } used by the parser.
     *
     * This map will ensure we can normalize prefixes during processing;
     * for each uri, only one prefix will be exposed to the handlers.
     *
     * @type {!Object<string, string>}}
     */
    var nsUriToPrefix;

    /**
     * Handle parse error.
     *
     * @param  {string|Error} err
     */
    function handleError(err) {
      if (!(err instanceof Error)) {
        err = error$1(err);
      }

      returnError = err;

      onError(err, getContext);
    }

    /**
     * Handle parse error.
     *
     * @param  {string|Error} err
     */
    function handleWarning(err) {

      if (!onWarning) {
        return;
      }

      if (!(err instanceof Error)) {
        err = error$1(err);
      }

      onWarning(err, getContext);
    }

    /**
     * Register parse listener.
     *
     * @param  {string}   name
     * @param  {Function} cb
     *
     * @return {Parser}
     */
    this['on'] = function(name, cb) {

      if (typeof cb !== 'function') {
        throw error$1('required args <name, cb>');
      }

      switch (name) {
      case 'openTag': onOpenTag = cb; break;
      case 'text': onText = cb; break;
      case 'closeTag': onCloseTag = cb; break;
      case 'error': onError = cb; break;
      case 'warn': onWarning = cb; break;
      case 'cdata': onCDATA = cb; break;
      case 'attention': onAttention = cb; break; // <!XXXXX zzzz="eeee">
      case 'question': onQuestion = cb; break; // <? ....  ?>
      case 'comment': onComment = cb; break;
      default:
        throw error$1('unsupported event: ' + name);
      }

      return this;
    };

    /**
     * Set the namespace to prefix mapping.
     *
     * @example
     *
     * parser.ns({
     *   'http://foo': 'foo',
     *   'http://bar': 'bar'
     * });
     *
     * @param  {!Object<string, string>} nsMap
     *
     * @return {Parser}
     */
    this['ns'] = function(nsMap) {

      if (typeof nsMap === 'undefined') {
        nsMap = {};
      }

      if (typeof nsMap !== 'object') {
        throw error$1('required args <nsMap={}>');
      }

      var _nsUriToPrefix = {}, k;

      for (k in nsMap) {
        _nsUriToPrefix[k] = nsMap[k];
      }

      isNamespace = true;
      nsUriToPrefix = _nsUriToPrefix;

      return this;
    };

    /**
     * Parse xml string.
     *
     * @param  {string} xml
     *
     * @return {Error} returnError, if not thrown
     */
    this['parse'] = function(xml) {
      if (typeof xml !== 'string') {
        throw error$1('required args <xml=string>');
      }

      returnError = null;

      parse(xml);

      getContext = noopGetContext;
      parseStop = false;

      return returnError;
    };

    /**
     * Stop parsing.
     */
    this['stop'] = function() {
      parseStop = true;
    };

    /**
     * Parse string, invoking configured listeners on element.
     *
     * @param  {string} xml
     */
    function parse(xml) {
      var nsMatrixStack = isNamespace ? [] : null,
          nsMatrix = isNamespace ? buildNsMatrix(nsUriToPrefix) : null,
          _nsMatrix,
          nodeStack = [],
          anonymousNsCount = 0,
          tagStart = false,
          tagEnd = false,
          i = 0, j = 0,
          x, y, q, w, v,
          xmlns,
          elementName,
          _elementName,
          elementProxy
          ;

      var attrsString = '',
          attrsStart = 0,
          cachedAttrs // false = parsed with errors, null = needs parsing
          ;

      /**
       * Parse attributes on demand and returns the parsed attributes.
       *
       * Return semantics: (1) `false` on attribute parse error,
       * (2) object hash on extracted attrs.
       *
       * @return {boolean|Object}
       */
      function getAttrs() {
        if (cachedAttrs !== null) {
          return cachedAttrs;
        }

        var nsUri,
            nsUriPrefix,
            nsName,
            defaultAlias = isNamespace && nsMatrix['xmlns'],
            attrList = isNamespace && maybeNS ? [] : null,
            i = attrsStart,
            s = attrsString,
            l = s.length,
            hasNewMatrix,
            newalias,
            value,
            alias,
            name,
            attrs = {},
            seenAttrs = {},
            skipAttr,
            w,
            j;

        parseAttr:
        for (; i < l; i++) {
          skipAttr = false;
          w = s.charCodeAt(i);

          if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE={ \f\n\r\t\v}
            continue;
          }

          // wait for non whitespace character
          if (w < 65 || w > 122 || (w > 90 && w < 97)) {
            if (w !== 95 && w !== 58) { // char 95"_" 58":"
              handleWarning('illegal first char attribute name');
              skipAttr = true;
            }
          }

          // parse attribute name
          for (j = i + 1; j < l; j++) {
            w = s.charCodeAt(j);

            if (
              w > 96 && w < 123 ||
              w > 64 && w < 91 ||
              w > 47 && w < 59 ||
              w === 46 || // '.'
              w === 45 || // '-'
              w === 95 // '_'
            ) {
              continue;
            }

            // unexpected whitespace
            if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE
              handleWarning('missing attribute value');
              i = j;

              continue parseAttr;
            }

            // expected "="
            if (w === 61) { // "=" == 61
              break;
            }

            handleWarning('illegal attribute name char');
            skipAttr = true;
          }

          name = s.substring(i, j);

          if (name === 'xmlns:xmlns') {
            handleWarning('illegal declaration of xmlns');
            skipAttr = true;
          }

          w = s.charCodeAt(j + 1);

          if (w === 34) { // '"'
            j = s.indexOf('"', i = j + 2);

            if (j === -1) {
              j = s.indexOf('\'', i);

              if (j !== -1) {
                handleWarning('attribute value quote missmatch');
                skipAttr = true;
              }
            }

          } else if (w === 39) { // "'"
            j = s.indexOf('\'', i = j + 2);

            if (j === -1) {
              j = s.indexOf('"', i);

              if (j !== -1) {
                handleWarning('attribute value quote missmatch');
                skipAttr = true;
              }
            }

          } else {
            handleWarning('missing attribute value quotes');
            skipAttr = true;

            // skip to next space
            for (j = j + 1; j < l; j++) {
              w = s.charCodeAt(j + 1);

              if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE
                break;
              }
            }

          }

          if (j === -1) {
            handleWarning('missing closing quotes');

            j = l;
            skipAttr = true;
          }

          if (!skipAttr) {
            value = s.substring(i, j);
          }

          i = j;

          // ensure SPACE follows attribute
          // skip illegal content otherwise
          // example a="b"c
          for (; j + 1 < l; j++) {
            w = s.charCodeAt(j + 1);

            if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE
              break;
            }

            // FIRST ILLEGAL CHAR
            if (i === j) {
              handleWarning('illegal character after attribute end');
              skipAttr = true;
            }
          }

          // advance cursor to next attribute
          i = j + 1;

          if (skipAttr) {
            continue parseAttr;
          }

          // check attribute re-declaration
          if (name in seenAttrs) {
            handleWarning('attribute <' + name + '> already defined');
            continue;
          }

          seenAttrs[name] = true;

          if (!isNamespace) {
            attrs[name] = value;
            continue;
          }

          // try to extract namespace information
          if (maybeNS) {
            newalias = (
              name === 'xmlns'
                ? 'xmlns'
                : (name.charCodeAt(0) === 120 && name.substr(0, 6) === 'xmlns:')
                  ? name.substr(6)
                  : null
            );

            // handle xmlns(:alias) assignment
            if (newalias !== null) {
              nsUri = decodeEntities(value);
              nsUriPrefix = uriPrefix(newalias);

              alias = nsUriToPrefix[nsUri];

              if (!alias) {

                // no prefix defined or prefix collision
                if (
                  (newalias === 'xmlns') ||
                  (nsUriPrefix in nsMatrix && nsMatrix[nsUriPrefix] !== nsUri)
                ) {

                  // alocate free ns prefix
                  do {
                    alias = 'ns' + (anonymousNsCount++);
                  } while (typeof nsMatrix[alias] !== 'undefined');
                } else {
                  alias = newalias;
                }

                nsUriToPrefix[nsUri] = alias;
              }

              if (nsMatrix[newalias] !== alias) {
                if (!hasNewMatrix) {
                  nsMatrix = cloneNsMatrix(nsMatrix);
                  hasNewMatrix = true;
                }

                nsMatrix[newalias] = alias;
                if (newalias === 'xmlns') {
                  nsMatrix[uriPrefix(alias)] = nsUri;
                  defaultAlias = alias;
                }

                nsMatrix[nsUriPrefix] = nsUri;
              }

              // expose xmlns(:asd)="..." in attributes
              attrs[name] = value;
              continue;
            }

            // collect attributes until all namespace
            // declarations are processed
            attrList.push(name, value);
            continue;

          } /** end if (maybeNs) */

          // handle attributes on element without
          // namespace declarations
          w = name.indexOf(':');
          if (w === -1) {
            attrs[name] = value;
            continue;
          }

          // normalize ns attribute name
          if (!(nsName = nsMatrix[name.substring(0, w)])) {
            handleWarning(missingNamespaceForPrefix(name.substring(0, w)));
            continue;
          }

          name = defaultAlias === nsName
            ? name.substr(w + 1)
            : nsName + name.substr(w);

          // end: normalize ns attribute name

          attrs[name] = value;
        }


        // handle deferred, possibly namespaced attributes
        if (maybeNS) {

          // normalize captured attributes
          for (i = 0, l = attrList.length; i < l; i++) {

            name = attrList[i++];
            value = attrList[i];

            w = name.indexOf(':');

            if (w !== -1) {

              // normalize ns attribute name
              if (!(nsName = nsMatrix[name.substring(0, w)])) {
                handleWarning(missingNamespaceForPrefix(name.substring(0, w)));
                continue;
              }

              name = defaultAlias === nsName
                ? name.substr(w + 1)
                : nsName + name.substr(w);

              // end: normalize ns attribute name
            }

            attrs[name] = value;
          }

          // end: normalize captured attributes
        }

        return cachedAttrs = attrs;
      }

      /**
       * Extract the parse context { line, column, part }
       * from the current parser position.
       *
       * @return {Object} parse context
       */
      function getParseContext() {
        var splitsRe = /(\r\n|\r|\n)/g;

        var line = 0;
        var column = 0;
        var startOfLine = 0;
        var endOfLine = j;
        var match;
        var data;

        while (i >= startOfLine) {

          match = splitsRe.exec(xml);

          if (!match) {
            break;
          }

          // end of line = (break idx + break chars)
          endOfLine = match[0].length + match.index;

          if (endOfLine > i) {
            break;
          }

          // advance to next line
          line += 1;

          startOfLine = endOfLine;
        }

        // EOF errors
        if (i == -1) {
          column = endOfLine;
          data = xml.substring(j);
        } else

          // start errors
          if (j === 0) {
            data = xml.substring(j, i);
          }

          // other errors
          else {
            column = i - startOfLine;
            data = (j == -1 ? xml.substring(i) : xml.substring(i, j + 1));
          }

        return {
          'data': data,
          'line': line,
          'column': column
        };
      }

      getContext = getParseContext;


      if (proxy) {
        elementProxy = Object.create({}, {
          'name': getter(function() {
            return elementName;
          }),
          'originalName': getter(function() {
            return _elementName;
          }),
          'attrs': getter(getAttrs),
          'ns': getter(function() {
            return nsMatrix;
          })
        });
      }

      // actual parse logic
      while (j !== -1) {

        if (xml.charCodeAt(j) === 60) { // "<"
          i = j;
        } else {
          i = xml.indexOf('<', j);
        }

        // parse end
        if (i === -1) {
          if (nodeStack.length) {
            return handleError('unexpected end of file');
          }

          if (j === 0) {
            return handleError('missing start tag');
          }

          if (j < xml.length) {
            if (xml.substring(j).trim()) {
              handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);
            }
          }

          return;
        }

        // parse text
        if (j !== i) {

          if (nodeStack.length) {
            if (onText) {
              onText(xml.substring(j, i), decodeEntities, getContext);

              if (parseStop) {
                return;
              }
            }
          } else {
            if (xml.substring(j, i).trim()) {
              handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);

              if (parseStop) {
                return;
              }
            }
          }
        }

        w = xml.charCodeAt(i + 1);

        // parse comments + CDATA
        if (w === 33) { // "!"
          q = xml.charCodeAt(i + 2);

          // CDATA section
          if (q === 91 && xml.substr(i + 3, 6) === 'CDATA[') { // 91 == "["
            j = xml.indexOf(']]>', i);
            if (j === -1) {
              return handleError('unclosed cdata');
            }

            if (onCDATA) {
              onCDATA(xml.substring(i + 9, j), getContext);
              if (parseStop) {
                return;
              }
            }

            j += 3;
            continue;
          }

          // comment
          if (q === 45 && xml.charCodeAt(i + 3) === 45) { // 45 == "-"
            j = xml.indexOf('-->', i);
            if (j === -1) {
              return handleError('unclosed comment');
            }


            if (onComment) {
              onComment(xml.substring(i + 4, j), decodeEntities, getContext);
              if (parseStop) {
                return;
              }
            }

            j += 3;
            continue;
          }
        }

        // parse question <? ... ?>
        if (w === 63) { // "?"
          j = xml.indexOf('?>', i);
          if (j === -1) {
            return handleError('unclosed question');
          }

          if (onQuestion) {
            onQuestion(xml.substring(i, j + 2), getContext);
            if (parseStop) {
              return;
            }
          }

          j += 2;
          continue;
        }

        // find matching closing tag for attention or standard tags
        // for that we must skip through attribute values
        // (enclosed in single or double quotes)
        for (x = i + 1; ; x++) {
          v = xml.charCodeAt(x);
          if (isNaN(v)) {
            j = -1;
            return handleError('unclosed tag');
          }

          // [10] AttValue ::= '"' ([^<&"] | Reference)* '"' | "'" ([^<&'] | Reference)* "'"
          // skips the quoted string
          // (double quotes) does not appear in a literal enclosed by (double quotes)
          // (single quote) does not appear in a literal enclosed by (single quote)
          if (v === 34) { //  '"'
            q = xml.indexOf('"', x + 1);
            x = q !== -1 ? q : x;
          } else if (v === 39) { // "'"
            q = xml.indexOf("'", x + 1);
            x = q !== -1 ? q : x;
          } else if (v === 62) { // '>'
            j = x;
            break;
          }
        }


        // parse attention <! ...>
        // previously comment and CDATA have already been parsed
        if (w === 33) { // "!"

          if (onAttention) {
            onAttention(xml.substring(i, j + 1), decodeEntities, getContext);
            if (parseStop) {
              return;
            }
          }

          j += 1;
          continue;
        }

        // don't process attributes;
        // there are none
        cachedAttrs = {};

        // if (xml.charCodeAt(i+1) === 47) { // </...
        if (w === 47) { // </...
          tagStart = false;
          tagEnd = true;

          if (!nodeStack.length) {
            return handleError('missing open tag');
          }

          // verify open <-> close tag match
          x = elementName = nodeStack.pop();
          q = i + 2 + x.length;

          if (xml.substring(i + 2, q) !== x) {
            return handleError('closing tag mismatch');
          }

          // verify chars in close tag
          for (; q < j; q++) {
            w = xml.charCodeAt(q);

            if (w === 32 || (w > 8 && w < 14)) { // \f\n\r\t\v space
              continue;
            }

            return handleError('close tag');
          }

        } else {
          if (xml.charCodeAt(j - 1) === 47) { // .../>
            x = elementName = xml.substring(i + 1, j - 1);

            tagStart = true;
            tagEnd = true;

          } else {
            x = elementName = xml.substring(i + 1, j);

            tagStart = true;
            tagEnd = false;
          }

          if (!(w > 96 && w < 123 || w > 64 && w < 91 || w === 95 || w === 58)) { // char 95"_" 58":"
            return handleError('illegal first char nodeName');
          }

          for (q = 1, y = x.length; q < y; q++) {
            w = x.charCodeAt(q);

            if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95 || w == 46) {
              continue;
            }

            if (w === 32 || (w < 14 && w > 8)) { // \f\n\r\t\v space
              elementName = x.substring(0, q);

              // maybe there are attributes
              cachedAttrs = null;
              break;
            }

            return handleError('invalid nodeName');
          }

          if (!tagEnd) {
            nodeStack.push(elementName);
          }
        }

        if (isNamespace) {

          _nsMatrix = nsMatrix;

          if (tagStart) {

            // remember old namespace
            // unless we're self-closing
            if (!tagEnd) {
              nsMatrixStack.push(_nsMatrix);
            }

            if (cachedAttrs === null) {

              // quick check, whether there may be namespace
              // declarations on the node; if that is the case
              // we need to eagerly parse the node attributes
              if ((maybeNS = x.indexOf('xmlns', q) !== -1)) {
                attrsStart = q;
                attrsString = x;

                getAttrs();

                maybeNS = false;
              }
            }
          }

          _elementName = elementName;

          w = elementName.indexOf(':');
          if (w !== -1) {
            xmlns = nsMatrix[elementName.substring(0, w)];

            // prefix given; namespace must exist
            if (!xmlns) {
              return handleError('missing namespace on <' + _elementName + '>');
            }

            elementName = elementName.substr(w + 1);
          } else {
            xmlns = nsMatrix['xmlns'];

            // if no default namespace is defined,
            // we'll import the element as anonymous.
            //
            // it is up to users to correct that to the document defined
            // targetNamespace, or whatever their undersanding of the
            // XML spec mandates.
          }

          // adjust namespace prefixs as configured
          if (xmlns) {
            elementName = xmlns + ':' + elementName;
          }

        }

        if (tagStart) {
          attrsStart = q;
          attrsString = x;

          if (onOpenTag) {
            if (proxy) {
              onOpenTag(elementProxy, decodeEntities, tagEnd, getContext);
            } else {
              onOpenTag(elementName, getAttrs, decodeEntities, tagEnd, getContext);
            }

            if (parseStop) {
              return;
            }
          }

        }

        if (tagEnd) {

          if (onCloseTag) {
            onCloseTag(proxy ? elementProxy : elementName, decodeEntities, tagStart, getContext);

            if (parseStop) {
              return;
            }
          }

          // restore old namespace
          if (isNamespace) {
            if (!tagStart) {
              nsMatrix = nsMatrixStack.pop();
            } else {
              nsMatrix = _nsMatrix;
            }
          }
        }

        j += 1;
      }
    } /** end parse */

  }

  function hasLowerCaseAlias(pkg) {
    return pkg.xml && pkg.xml.tagAlias === 'lowerCase';
  }

  var DEFAULT_NS_MAP = {
    'xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xml': 'http://www.w3.org/XML/1998/namespace'
  };

  var SERIALIZE_PROPERTY = 'property';

  function getSerialization(element) {
    return element.xml && element.xml.serialize;
  }

  function getSerializationType(element) {
    const type = getSerialization(element);

    return type !== SERIALIZE_PROPERTY && (type || null);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function aliasToName(aliasNs, pkg) {

    if (!hasLowerCaseAlias(pkg)) {
      return aliasNs.name;
    }

    return aliasNs.prefix + ':' + capitalize(aliasNs.localName);
  }

  /**
   * Un-prefix a potentially prefixed type name.
   *
   * @param {NsName} nameNs
   * @param {Object} [pkg]
   *
   * @return {string}
   */
  function prefixedToName(nameNs, pkg) {

    var name = nameNs.name,
        localName = nameNs.localName;

    var typePrefix = pkg && pkg.xml && pkg.xml.typePrefix;

    if (typePrefix && localName.indexOf(typePrefix) === 0) {
      return nameNs.prefix + ':' + localName.slice(typePrefix.length);
    } else {
      return name;
    }
  }

  function normalizeTypeName(name, nsMap, model) {

    // normalize against actual NS
    const nameNs = parseName(name, nsMap.xmlns);

    const normalizedName = `${ nsMap[nameNs.prefix] || nameNs.prefix }:${ nameNs.localName }`;

    const normalizedNameNs = parseName(normalizedName);

    // determine actual type name, based on package-defined prefix
    var pkg = model.getPackage(normalizedNameNs.prefix);

    return prefixedToName(normalizedNameNs, pkg);
  }

  function error(message) {
    return new Error(message);
  }

  /**
   * Get the moddle descriptor for a given instance or type.
   *
   * @param  {ModdleElement|Function} element
   *
   * @return {Object} the moddle descriptor
   */
  function getModdleDescriptor(element) {
    return element.$descriptor;
  }


  /**
   * A parse context.
   *
   * @class
   *
   * @param {Object} options
   * @param {ElementHandler} options.rootHandler the root handler for parsing a document
   * @param {boolean} [options.lax=false] whether or not to ignore invalid elements
   */
  function Context(options) {

    /**
     * @property {ElementHandler} rootHandler
     */

    /**
     * @property {Boolean} lax
     */

    assign$1(this, options);

    this.elementsById = {};
    this.references = [];
    this.warnings = [];

    /**
     * Add an unresolved reference.
     *
     * @param {Object} reference
     */
    this.addReference = function(reference) {
      this.references.push(reference);
    };

    /**
     * Add a processed element.
     *
     * @param {ModdleElement} element
     */
    this.addElement = function(element) {

      if (!element) {
        throw error('expected element');
      }

      var elementsById = this.elementsById;

      var descriptor = getModdleDescriptor(element);

      var idProperty = descriptor.idProperty,
          id;

      if (idProperty) {
        id = element.get(idProperty.name);

        if (id) {

          // for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
          if (!/^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i.test(id)) {
            throw new Error('illegal ID <' + id + '>');
          }

          if (elementsById[id]) {
            throw error('duplicate ID <' + id + '>');
          }

          elementsById[id] = element;
        }
      }
    };

    /**
     * Add an import warning.
     *
     * @param {Object} warning
     * @param {String} warning.message
     * @param {Error} [warning.error]
     */
    this.addWarning = function(warning) {
      this.warnings.push(warning);
    };
  }

  function BaseHandler() {}

  BaseHandler.prototype.handleEnd = function() {};
  BaseHandler.prototype.handleText = function() {};
  BaseHandler.prototype.handleNode = function() {};


  /**
   * A simple pass through handler that does nothing except for
   * ignoring all input it receives.
   *
   * This is used to ignore unknown elements and
   * attributes.
   */
  function NoopHandler() { }

  NoopHandler.prototype = Object.create(BaseHandler.prototype);

  NoopHandler.prototype.handleNode = function() {
    return this;
  };

  function BodyHandler() {}

  BodyHandler.prototype = Object.create(BaseHandler.prototype);

  BodyHandler.prototype.handleText = function(text) {
    this.body = (this.body || '') + text;
  };

  function ReferenceHandler(property, context) {
    this.property = property;
    this.context = context;
  }

  ReferenceHandler.prototype = Object.create(BodyHandler.prototype);

  ReferenceHandler.prototype.handleNode = function(node) {

    if (this.element) {
      throw error('expected no sub nodes');
    } else {
      this.element = this.createReference(node);
    }

    return this;
  };

  ReferenceHandler.prototype.handleEnd = function() {
    this.element.id = this.body;
  };

  ReferenceHandler.prototype.createReference = function(node) {
    return {
      property: this.property.ns.name,
      id: ''
    };
  };

  function ValueHandler(propertyDesc, element) {
    this.element = element;
    this.propertyDesc = propertyDesc;
  }

  ValueHandler.prototype = Object.create(BodyHandler.prototype);

  ValueHandler.prototype.handleEnd = function() {

    var value = this.body || '',
        element = this.element,
        propertyDesc = this.propertyDesc;

    value = coerceType(propertyDesc.type, value);

    if (propertyDesc.isMany) {
      element.get(propertyDesc.name).push(value);
    } else {
      element.set(propertyDesc.name, value);
    }
  };


  function BaseElementHandler() {}

  BaseElementHandler.prototype = Object.create(BodyHandler.prototype);

  BaseElementHandler.prototype.handleNode = function(node) {
    var parser = this,
        element = this.element;

    if (!element) {
      element = this.element = this.createElement(node);

      this.context.addElement(element);
    } else {
      parser = this.handleChild(node);
    }

    return parser;
  };

  /**
   * @class Reader.ElementHandler
   *
   */
  function ElementHandler(model, typeName, context) {
    this.model = model;
    this.type = model.getType(typeName);
    this.context = context;
  }

  ElementHandler.prototype = Object.create(BaseElementHandler.prototype);

  ElementHandler.prototype.addReference = function(reference) {
    this.context.addReference(reference);
  };

  ElementHandler.prototype.handleText = function(text) {

    var element = this.element,
        descriptor = getModdleDescriptor(element),
        bodyProperty = descriptor.bodyProperty;

    if (!bodyProperty) {
      throw error('unexpected body text <' + text + '>');
    }

    BodyHandler.prototype.handleText.call(this, text);
  };

  ElementHandler.prototype.handleEnd = function() {

    var value = this.body,
        element = this.element,
        descriptor = getModdleDescriptor(element),
        bodyProperty = descriptor.bodyProperty;

    if (bodyProperty && value !== undefined) {
      value = coerceType(bodyProperty.type, value);
      element.set(bodyProperty.name, value);
    }
  };

  /**
   * Create an instance of the model from the given node.
   *
   * @param  {Element} node the xml node
   */
  ElementHandler.prototype.createElement = function(node) {
    var attributes = node.attributes,
        Type = this.type,
        descriptor = getModdleDescriptor(Type),
        context = this.context,
        instance = new Type({}),
        model = this.model,
        propNameNs;

    forEach(attributes, function(value, name) {

      var prop = descriptor.propertiesByName[name],
          values;

      if (prop && prop.isReference) {

        if (!prop.isMany) {
          context.addReference({
            element: instance,
            property: prop.ns.name,
            id: value
          });
        } else {

          // IDREFS: parse references as whitespace-separated list
          values = value.split(' ');

          forEach(values, function(v) {
            context.addReference({
              element: instance,
              property: prop.ns.name,
              id: v
            });
          });
        }

      } else {
        if (prop) {
          value = coerceType(prop.type, value);
        } else if (name === 'xmlns') {
          name = ':' + name;
        } else {
          propNameNs = parseName(name, descriptor.ns.prefix);

          // check whether attribute is defined in a well-known namespace
          // if that is the case we emit a warning to indicate potential misuse
          if (model.getPackage(propNameNs.prefix)) {

            context.addWarning({
              message: 'unknown attribute <' + name + '>',
              element: instance,
              property: name,
              value: value
            });
          }
        }

        instance.set(name, value);
      }
    });

    return instance;
  };

  ElementHandler.prototype.getPropertyForNode = function(node) {

    var name = node.name;
    var nameNs = parseName(name);

    var type = this.type,
        model = this.model,
        descriptor = getModdleDescriptor(type);

    var propertyName = nameNs.name,
        property = descriptor.propertiesByName[propertyName];

    // search for properties by name first

    if (property && !property.isAttr) {

      const serializationType = getSerializationType(property);

      if (serializationType) {
        const elementTypeName = node.attributes[serializationType];

        // type is optional, if it does not exists the
        // default type is assumed
        if (elementTypeName) {

          // convert the prefix used to the mapped form, but also
          // take possible type prefixes from XML
          // into account, i.e.: xsi:type="t{ActualType}",
          const normalizedTypeName = normalizeTypeName(elementTypeName, node.ns, model);

          const elementType = model.getType(normalizedTypeName);

          return assign$1({}, property, {
            effectiveType: getModdleDescriptor(elementType).name
          });
        }
      }

      // search for properties by name first
      return property;
    }

    var pkg = model.getPackage(nameNs.prefix);

    if (pkg) {
      const elementTypeName = aliasToName(nameNs, pkg);
      const elementType = model.getType(elementTypeName);

      // search for collection members later
      property = find(descriptor.properties, function(p) {
        return !p.isVirtual && !p.isReference && !p.isAttribute && elementType.hasType(p.type);
      });

      if (property) {
        return assign$1({}, property, {
          effectiveType: getModdleDescriptor(elementType).name
        });
      }
    } else {

      // parse unknown element (maybe extension)
      property = find(descriptor.properties, function(p) {
        return !p.isReference && !p.isAttribute && p.type === 'Element';
      });

      if (property) {
        return property;
      }
    }

    throw error('unrecognized element <' + nameNs.name + '>');
  };

  ElementHandler.prototype.toString = function() {
    return 'ElementDescriptor[' + getModdleDescriptor(this.type).name + ']';
  };

  ElementHandler.prototype.valueHandler = function(propertyDesc, element) {
    return new ValueHandler(propertyDesc, element);
  };

  ElementHandler.prototype.referenceHandler = function(propertyDesc) {
    return new ReferenceHandler(propertyDesc, this.context);
  };

  ElementHandler.prototype.handler = function(type) {
    if (type === 'Element') {
      return new GenericElementHandler(this.model, type, this.context);
    } else {
      return new ElementHandler(this.model, type, this.context);
    }
  };

  /**
   * Handle the child element parsing
   *
   * @param  {Element} node the xml node
   */
  ElementHandler.prototype.handleChild = function(node) {
    var propertyDesc, type, element, childHandler;

    propertyDesc = this.getPropertyForNode(node);
    element = this.element;

    type = propertyDesc.effectiveType || propertyDesc.type;

    if (isSimple(type)) {
      return this.valueHandler(propertyDesc, element);
    }

    if (propertyDesc.isReference) {
      childHandler = this.referenceHandler(propertyDesc).handleNode(node);
    } else {
      childHandler = this.handler(type).handleNode(node);
    }

    var newElement = childHandler.element;

    // child handles may decide to skip elements
    // by not returning anything
    if (newElement !== undefined) {

      if (propertyDesc.isMany) {
        element.get(propertyDesc.name).push(newElement);
      } else {
        element.set(propertyDesc.name, newElement);
      }

      if (propertyDesc.isReference) {
        assign$1(newElement, {
          element: element
        });

        this.context.addReference(newElement);
      } else {

        // establish child -> parent relationship
        newElement.$parent = element;
      }
    }

    return childHandler;
  };

  /**
   * An element handler that performs special validation
   * to ensure the node it gets initialized with matches
   * the handlers type (namespace wise).
   *
   * @param {Moddle} model
   * @param {String} typeName
   * @param {Context} context
   */
  function RootElementHandler(model, typeName, context) {
    ElementHandler.call(this, model, typeName, context);
  }

  RootElementHandler.prototype = Object.create(ElementHandler.prototype);

  RootElementHandler.prototype.createElement = function(node) {

    var name = node.name,
        nameNs = parseName(name),
        model = this.model,
        type = this.type,
        pkg = model.getPackage(nameNs.prefix),
        typeName = pkg && aliasToName(nameNs, pkg) || name;

    // verify the correct namespace if we parse
    // the first element in the handler tree
    //
    // this ensures we don't mistakenly import wrong namespace elements
    if (!type.hasType(typeName)) {
      throw error('unexpected element <' + node.originalName + '>');
    }

    return ElementHandler.prototype.createElement.call(this, node);
  };


  function GenericElementHandler(model, typeName, context) {
    this.model = model;
    this.context = context;
  }

  GenericElementHandler.prototype = Object.create(BaseElementHandler.prototype);

  GenericElementHandler.prototype.createElement = function(node) {

    var name = node.name,
        ns = parseName(name),
        prefix = ns.prefix,
        uri = node.ns[prefix + '$uri'],
        attributes = node.attributes;

    return this.model.createAny(name, uri, attributes);
  };

  GenericElementHandler.prototype.handleChild = function(node) {

    var handler = new GenericElementHandler(this.model, 'Element', this.context).handleNode(node),
        element = this.element;

    var newElement = handler.element,
        children;

    if (newElement !== undefined) {
      children = element.$children = element.$children || [];
      children.push(newElement);

      // establish child -> parent relationship
      newElement.$parent = element;
    }

    return handler;
  };

  GenericElementHandler.prototype.handleEnd = function() {
    if (this.body) {
      this.element.$body = this.body;
    }
  };

  /**
   * A reader for a meta-model
   *
   * @param {Object} options
   * @param {Model} options.model used to read xml files
   * @param {Boolean} options.lax whether to make parse errors warnings
   */
  function Reader(options) {

    if (options instanceof Moddle) {
      options = {
        model: options
      };
    }

    assign$1(this, { lax: false }, options);
  }

  /**
   * The fromXML result.
   *
   * @typedef {Object} ParseResult
   *
   * @property {ModdleElement} rootElement
   * @property {Array<Object>} references
   * @property {Array<Error>} warnings
   * @property {Object} elementsById - a mapping containing each ID -> ModdleElement
   */

  /**
   * The fromXML result.
   *
   * @typedef {Error} ParseError
   *
   * @property {Array<Error>} warnings
   */

  /**
   * Parse the given XML into a moddle document tree.
   *
   * @param {String} xml
   * @param {ElementHandler|Object} options or rootHandler
   *
   * @returns {Promise<ParseResult, ParseError>}
   */
  Reader.prototype.fromXML = function(xml, options, done) {

    var rootHandler = options.rootHandler;

    if (options instanceof ElementHandler) {

      // root handler passed via (xml, { rootHandler: ElementHandler }, ...)
      rootHandler = options;
      options = {};
    } else {
      if (typeof options === 'string') {

        // rootHandler passed via (xml, 'someString', ...)
        rootHandler = this.handler(options);
        options = {};
      } else if (typeof rootHandler === 'string') {

        // rootHandler passed via (xml, { rootHandler: 'someString' }, ...)
        rootHandler = this.handler(rootHandler);
      }
    }

    var model = this.model,
        lax = this.lax;

    var context = new Context(assign$1({}, options, { rootHandler: rootHandler })),
        parser = new Parser({ proxy: true }),
        stack = createStack();

    rootHandler.context = context;

    // push root handler
    stack.push(rootHandler);


    /**
     * Handle error.
     *
     * @param  {Error} err
     * @param  {Function} getContext
     * @param  {boolean} lax
     *
     * @return {boolean} true if handled
     */
    function handleError(err, getContext, lax) {

      var ctx = getContext();

      var line = ctx.line,
          column = ctx.column,
          data = ctx.data;

      // we receive the full context data here,
      // for elements trim down the information
      // to the tag name, only
      if (data.charAt(0) === '<' && data.indexOf(' ') !== -1) {
        data = data.slice(0, data.indexOf(' ')) + '>';
      }

      var message =
        'unparsable content ' + (data ? data + ' ' : '') + 'detected\n\t' +
          'line: ' + line + '\n\t' +
          'column: ' + column + '\n\t' +
          'nested error: ' + err.message;

      if (lax) {
        context.addWarning({
          message: message,
          error: err
        });

        return true;
      } else {
        throw error(message);
      }
    }

    function handleWarning(err, getContext) {

      // just like handling errors in <lax=true> mode
      return handleError(err, getContext, true);
    }

    /**
     * Resolve collected references on parse end.
     */
    function resolveReferences() {

      var elementsById = context.elementsById;
      var references = context.references;

      var i, r;

      for (i = 0; (r = references[i]); i++) {
        var element = r.element;
        var reference = elementsById[r.id];
        var property = getModdleDescriptor(element).propertiesByName[r.property];

        if (!reference) {
          context.addWarning({
            message: 'unresolved reference <' + r.id + '>',
            element: r.element,
            property: r.property,
            value: r.id
          });
        }

        if (property.isMany) {
          var collection = element.get(property.name),
              idx = collection.indexOf(r);

          // we replace an existing place holder (idx != -1) or
          // append to the collection instead
          if (idx === -1) {
            idx = collection.length;
          }

          if (!reference) {

            // remove unresolvable reference
            collection.splice(idx, 1);
          } else {

            // add or update reference in collection
            collection[idx] = reference;
          }
        } else {
          element.set(property.name, reference);
        }
      }
    }

    function handleClose() {
      stack.pop().handleEnd();
    }

    var PREAMBLE_START_PATTERN = /^<\?xml /i;

    var ENCODING_PATTERN = / encoding="([^"]+)"/i;

    var UTF_8_PATTERN = /^utf-8$/i;

    function handleQuestion(question) {

      if (!PREAMBLE_START_PATTERN.test(question)) {
        return;
      }

      var match = ENCODING_PATTERN.exec(question);
      var encoding = match && match[1];

      if (!encoding || UTF_8_PATTERN.test(encoding)) {
        return;
      }

      context.addWarning({
        message:
          'unsupported document encoding <' + encoding + '>, ' +
          'falling back to UTF-8'
      });
    }

    function handleOpen(node, getContext) {
      var handler = stack.peek();

      try {
        stack.push(handler.handleNode(node));
      } catch (err) {

        if (handleError(err, getContext, lax)) {
          stack.push(new NoopHandler());
        }
      }
    }

    function handleCData(text, getContext) {

      try {
        stack.peek().handleText(text);
      } catch (err) {
        handleWarning(err, getContext);
      }
    }

    function handleText(text, getContext) {

      // strip whitespace only nodes, i.e. before
      // <!CDATA[ ... ]> sections and in between tags

      if (!text.trim()) {
        return;
      }

      handleCData(text, getContext);
    }

    var uriMap = model.getPackages().reduce(function(uriMap, p) {
      uriMap[p.uri] = p.prefix;

      return uriMap;
    }, Object.entries(DEFAULT_NS_MAP).reduce(function(map, [ prefix, url ]) {
      map[url] = prefix;

      return map;
    }, model.config && model.config.nsMap || {}));

    parser
      .ns(uriMap)
      .on('openTag', function(obj, decodeStr, selfClosing, getContext) {

        // gracefully handle unparsable attributes (attrs=false)
        var attrs = obj.attrs || {};

        var decodedAttrs = Object.keys(attrs).reduce(function(d, key) {
          var value = decodeStr(attrs[key]);

          d[key] = value;

          return d;
        }, {});

        var node = {
          name: obj.name,
          originalName: obj.originalName,
          attributes: decodedAttrs,
          ns: obj.ns
        };

        handleOpen(node, getContext);
      })
      .on('question', handleQuestion)
      .on('closeTag', handleClose)
      .on('cdata', handleCData)
      .on('text', function(text, decodeEntities, getContext) {
        handleText(decodeEntities(text), getContext);
      })
      .on('error', handleError)
      .on('warn', handleWarning);

    // async XML parsing to make sure the execution environment
    // (node or brower) is kept responsive and that certain optimization
    // strategies can kick in.
    return new Promise(function(resolve, reject) {

      var err;

      try {
        parser.parse(xml);

        resolveReferences();
      } catch (e) {
        err = e;
      }

      var rootElement = rootHandler.element;

      if (!err && !rootElement) {
        err = error('failed to parse document as <' + rootHandler.type.$descriptor.name + '>');
      }

      var warnings = context.warnings;
      var references = context.references;
      var elementsById = context.elementsById;

      if (err) {
        err.warnings = warnings;

        return reject(err);
      } else {
        return resolve({
          rootElement: rootElement,
          elementsById: elementsById,
          references: references,
          warnings: warnings
        });
      }
    });
  };

  Reader.prototype.handler = function(name) {
    return new RootElementHandler(this.model, name);
  };


  // helpers //////////////////////////

  function createStack() {
    var stack = [];

    Object.defineProperty(stack, 'peek', {
      value: function() {
        return this[this.length - 1];
      }
    });

    return stack;
  }

  var XML_PREAMBLE = '<?xml version="1.0" encoding="UTF-8"?>\n';

  var ESCAPE_ATTR_CHARS = /<|>|'|"|&|\n\r|\n/g;
  var ESCAPE_CHARS = /<|>|&/g;


  function Namespaces(parent) {

    this.prefixMap = {};
    this.uriMap = {};
    this.used = {};

    this.wellknown = [];
    this.custom = [];
    this.parent = parent;

    this.defaultPrefixMap = parent && parent.defaultPrefixMap || {};
  }

  Namespaces.prototype.mapDefaultPrefixes = function(defaultPrefixMap) {
    this.defaultPrefixMap = defaultPrefixMap;
  };

  Namespaces.prototype.defaultUriByPrefix = function(prefix) {
    return this.defaultPrefixMap[prefix];
  };

  Namespaces.prototype.byUri = function(uri) {
    return this.uriMap[uri] || (
      this.parent && this.parent.byUri(uri)
    );
  };

  Namespaces.prototype.add = function(ns, isWellknown) {

    this.uriMap[ns.uri] = ns;

    if (isWellknown) {
      this.wellknown.push(ns);
    } else {
      this.custom.push(ns);
    }

    this.mapPrefix(ns.prefix, ns.uri);
  };

  Namespaces.prototype.uriByPrefix = function(prefix) {
    return this.prefixMap[prefix || 'xmlns'] || (
      this.parent && this.parent.uriByPrefix(prefix)
    );
  };

  Namespaces.prototype.mapPrefix = function(prefix, uri) {
    this.prefixMap[prefix || 'xmlns'] = uri;
  };

  Namespaces.prototype.getNSKey = function(ns) {
    return (ns.prefix !== undefined) ? (ns.uri + '|' + ns.prefix) : ns.uri;
  };

  Namespaces.prototype.logUsed = function(ns) {

    var uri = ns.uri;
    var nsKey = this.getNSKey(ns);

    this.used[nsKey] = this.byUri(uri);

    // Inform parent recursively about the usage of this NS
    if (this.parent) {
      this.parent.logUsed(ns);
    }
  };

  Namespaces.prototype.getUsed = function(ns) {

    var allNs = [].concat(this.wellknown, this.custom);

    return allNs.filter(ns => {
      var nsKey = this.getNSKey(ns);

      return this.used[nsKey];
    });
  };


  function lower(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }

  function nameToAlias(name, pkg) {
    if (hasLowerCaseAlias(pkg)) {
      return lower(name);
    } else {
      return name;
    }
  }

  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }

  function nsName(ns) {
    if (isString(ns)) {
      return ns;
    } else {
      return (ns.prefix ? ns.prefix + ':' : '') + ns.localName;
    }
  }

  function getNsAttrs(namespaces) {

    return namespaces.getUsed().filter(function(ns) {

      // do not serialize built in <xml> namespace
      return ns.prefix !== 'xml';
    }).map(function(ns) {
      var name = 'xmlns' + (ns.prefix ? ':' + ns.prefix : '');
      return { name: name, value: ns.uri };
    });

  }

  function getElementNs(ns, descriptor) {
    if (descriptor.isGeneric) {
      return assign$1({ localName: descriptor.ns.localName }, ns);
    } else {
      return assign$1({ localName: nameToAlias(descriptor.ns.localName, descriptor.$pkg) }, ns);
    }
  }

  function getPropertyNs(ns, descriptor) {
    return assign$1({ localName: descriptor.ns.localName }, ns);
  }

  function getSerializableProperties(element) {
    var descriptor = element.$descriptor;

    return filter(descriptor.properties, function(p) {
      var name = p.name;

      if (p.isVirtual) {
        return false;
      }

      // do not serialize defaults
      if (!has(element, name)) {
        return false;
      }

      var value = element[name];

      // do not serialize default equals
      if (value === p.default) {
        return false;
      }

      // do not serialize null properties
      if (value === null) {
        return false;
      }

      return p.isMany ? value.length : true;
    });
  }

  var ESCAPE_ATTR_MAP = {
    '\n': '#10',
    '\n\r': '#10',
    '"': '#34',
    '\'': '#39',
    '<': '#60',
    '>': '#62',
    '&': '#38'
  };

  var ESCAPE_MAP = {
    '<': 'lt',
    '>': 'gt',
    '&': 'amp'
  };

  function escape(str, charPattern, replaceMap) {

    // ensure we are handling strings here
    str = isString(str) ? str : '' + str;

    return str.replace(charPattern, function(s) {
      return '&' + replaceMap[s] + ';';
    });
  }

  /**
   * Escape a string attribute to not contain any bad values (line breaks, '"', ...)
   *
   * @param {String} str the string to escape
   * @return {String} the escaped string
   */
  function escapeAttr(str) {
    return escape(str, ESCAPE_ATTR_CHARS, ESCAPE_ATTR_MAP);
  }

  function escapeBody(str) {
    return escape(str, ESCAPE_CHARS, ESCAPE_MAP);
  }

  function filterAttributes(props) {
    return filter(props, function(p) { return p.isAttr; });
  }

  function filterContained(props) {
    return filter(props, function(p) { return !p.isAttr; });
  }


  function ReferenceSerializer(tagName) {
    this.tagName = tagName;
  }

  ReferenceSerializer.prototype.build = function(element) {
    this.element = element;
    return this;
  };

  ReferenceSerializer.prototype.serializeTo = function(writer) {
    writer
      .appendIndent()
      .append('<' + this.tagName + '>' + this.element.id + '</' + this.tagName + '>')
      .appendNewLine();
  };

  function BodySerializer() {}

  BodySerializer.prototype.serializeValue =
  BodySerializer.prototype.serializeTo = function(writer) {
    writer.append(
      this.escape
        ? escapeBody(this.value)
        : this.value
    );
  };

  BodySerializer.prototype.build = function(prop, value) {
    this.value = value;

    if (prop.type === 'String' && value.search(ESCAPE_CHARS) !== -1) {
      this.escape = true;
    }

    return this;
  };

  function ValueSerializer(tagName) {
    this.tagName = tagName;
  }

  inherits(ValueSerializer, BodySerializer);

  ValueSerializer.prototype.serializeTo = function(writer) {

    writer
      .appendIndent()
      .append('<' + this.tagName + '>');

    this.serializeValue(writer);

    writer
      .append('</' + this.tagName + '>')
      .appendNewLine();
  };

  function ElementSerializer(parent, propertyDescriptor) {
    this.body = [];
    this.attrs = [];

    this.parent = parent;
    this.propertyDescriptor = propertyDescriptor;
  }

  ElementSerializer.prototype.build = function(element) {
    this.element = element;

    var elementDescriptor = element.$descriptor,
        propertyDescriptor = this.propertyDescriptor;

    var otherAttrs,
        properties;

    var isGeneric = elementDescriptor.isGeneric;

    if (isGeneric) {
      otherAttrs = this.parseGenericNsAttributes(element);
    } else {
      otherAttrs = this.parseNsAttributes(element);
    }

    if (propertyDescriptor) {
      this.ns = this.nsPropertyTagName(propertyDescriptor);
    } else {
      this.ns = this.nsTagName(elementDescriptor);
    }

    // compute tag name
    this.tagName = this.addTagName(this.ns);

    if (isGeneric) {
      this.parseGenericContainments(element);
    } else {
      properties = getSerializableProperties(element);

      this.parseAttributes(filterAttributes(properties));
      this.parseContainments(filterContained(properties));
    }

    this.parseGenericAttributes(element, otherAttrs);

    return this;
  };

  ElementSerializer.prototype.nsTagName = function(descriptor) {
    var effectiveNs = this.logNamespaceUsed(descriptor.ns);
    return getElementNs(effectiveNs, descriptor);
  };

  ElementSerializer.prototype.nsPropertyTagName = function(descriptor) {
    var effectiveNs = this.logNamespaceUsed(descriptor.ns);
    return getPropertyNs(effectiveNs, descriptor);
  };

  ElementSerializer.prototype.isLocalNs = function(ns) {
    return ns.uri === this.ns.uri;
  };

  /**
   * Get the actual ns attribute name for the given element.
   *
   * @param {Object} element
   * @param {Boolean} [element.inherited=false]
   *
   * @return {Object} nsName
   */
  ElementSerializer.prototype.nsAttributeName = function(element) {

    var ns;

    if (isString(element)) {
      ns = parseName(element);
    } else {
      ns = element.ns;
    }

    // return just local name for inherited attributes
    if (element.inherited) {
      return { localName: ns.localName };
    }

    // parse + log effective ns
    var effectiveNs = this.logNamespaceUsed(ns);

    // LOG ACTUAL namespace use
    this.getNamespaces().logUsed(effectiveNs);

    // strip prefix if same namespace like parent
    if (this.isLocalNs(effectiveNs)) {
      return { localName: ns.localName };
    } else {
      return assign$1({ localName: ns.localName }, effectiveNs);
    }
  };

  ElementSerializer.prototype.parseGenericNsAttributes = function(element) {

    return Object.entries(element).filter(
      ([ key, value ]) => !key.startsWith('$') && this.parseNsAttribute(element, key, value)
    ).map(
      ([ key, value ]) => ({ name: key, value: value })
    );
  };

  ElementSerializer.prototype.parseGenericContainments = function(element) {
    var body = element.$body;

    if (body) {
      this.body.push(new BodySerializer().build({ type: 'String' }, body));
    }

    var children = element.$children;

    if (children) {
      forEach(children, child => {
        this.body.push(new ElementSerializer(this).build(child));
      });
    }
  };

  ElementSerializer.prototype.parseNsAttribute = function(element, name, value) {
    var model = element.$model;

    var nameNs = parseName(name);

    var ns;

    // parse xmlns:foo="http://foo.bar"
    if (nameNs.prefix === 'xmlns') {
      ns = { prefix: nameNs.localName, uri: value };
    }

    // parse xmlns="http://foo.bar"
    if (!nameNs.prefix && nameNs.localName === 'xmlns') {
      ns = { uri: value };
    }

    if (!ns) {
      return {
        name: name,
        value: value
      };
    }

    if (model && model.getPackage(value)) {

      // register well known namespace
      this.logNamespace(ns, true, true);
    } else {

      // log custom namespace directly as used
      var actualNs = this.logNamespaceUsed(ns, true);

      this.getNamespaces().logUsed(actualNs);
    }
  };


  /**
   * Parse namespaces and return a list of left over generic attributes
   *
   * @param  {Object} element
   * @return {Array<Object>}
   */
  ElementSerializer.prototype.parseNsAttributes = function(element) {
    var self = this;

    var genericAttrs = element.$attrs;

    var attributes = [];

    // parse namespace attributes first
    // and log them. push non namespace attributes to a list
    // and process them later
    forEach(genericAttrs, function(value, name) {

      var nonNsAttr = self.parseNsAttribute(element, name, value);

      if (nonNsAttr) {
        attributes.push(nonNsAttr);
      }
    });

    return attributes;
  };

  ElementSerializer.prototype.parseGenericAttributes = function(element, attributes) {

    var self = this;

    forEach(attributes, function(attr) {

      try {
        self.addAttribute(self.nsAttributeName(attr.name), attr.value);
      } catch (e) {

        // eslint-disable-next-line no-undef
        typeof console !== 'undefined' && console.warn(
          `missing namespace information for <${
          attr.name
        }=${ attr.value }> on`, element, e
        );
      }
    });
  };

  ElementSerializer.prototype.parseContainments = function(properties) {

    var self = this,
        body = this.body,
        element = this.element;

    forEach(properties, function(p) {
      var value = element.get(p.name),
          isReference = p.isReference,
          isMany = p.isMany;

      if (!isMany) {
        value = [ value ];
      }

      if (p.isBody) {
        body.push(new BodySerializer().build(p, value[0]));
      } else if (isSimple(p.type)) {
        forEach(value, function(v) {
          body.push(new ValueSerializer(self.addTagName(self.nsPropertyTagName(p))).build(p, v));
        });
      } else if (isReference) {
        forEach(value, function(v) {
          body.push(new ReferenceSerializer(self.addTagName(self.nsPropertyTagName(p))).build(v));
        });
      } else {

        // allow serialization via type
        // rather than element name
        var serialization = getSerialization(p);

        forEach(value, function(v) {
          var serializer;

          if (serialization) {
            if (serialization === SERIALIZE_PROPERTY) {
              serializer = new ElementSerializer(self, p);
            } else {
              serializer = new TypeSerializer(self, p, serialization);
            }
          } else {
            serializer = new ElementSerializer(self);
          }

          body.push(serializer.build(v));
        });
      }
    });
  };

  ElementSerializer.prototype.getNamespaces = function(local) {

    var namespaces = this.namespaces,
        parent = this.parent,
        parentNamespaces;

    if (!namespaces) {
      parentNamespaces = parent && parent.getNamespaces();

      if (local || !parentNamespaces) {
        this.namespaces = namespaces = new Namespaces(parentNamespaces);
      } else {
        namespaces = parentNamespaces;
      }
    }

    return namespaces;
  };

  ElementSerializer.prototype.logNamespace = function(ns, wellknown, local) {
    var namespaces = this.getNamespaces(local);

    var nsUri = ns.uri,
        nsPrefix = ns.prefix;

    var existing = namespaces.byUri(nsUri);

    if (!existing || local) {
      namespaces.add(ns, wellknown);
    }

    namespaces.mapPrefix(nsPrefix, nsUri);

    return ns;
  };

  ElementSerializer.prototype.logNamespaceUsed = function(ns, local) {
    var namespaces = this.getNamespaces(local);

    // ns may be
    //
    //   * prefix only
    //   * prefix:uri
    //   * localName only

    var prefix = ns.prefix,
        uri = ns.uri,
        newPrefix, idx,
        wellknownUri;

    // handle anonymous namespaces (elementForm=unqualified), cf. #23
    if (!prefix && !uri) {
      return { localName: ns.localName };
    }

    wellknownUri = namespaces.defaultUriByPrefix(prefix);

    uri = uri || wellknownUri || namespaces.uriByPrefix(prefix);

    if (!uri) {
      throw new Error('no namespace uri given for prefix <' + prefix + '>');
    }

    ns = namespaces.byUri(uri);

    // register new default prefix <xmlns> in local scope
    if (!ns && !prefix) {
      ns = this.logNamespace({ uri }, wellknownUri === uri, true);
    }

    if (!ns) {
      newPrefix = prefix;
      idx = 1;

      // find a prefix that is not mapped yet
      while (namespaces.uriByPrefix(newPrefix)) {
        newPrefix = prefix + '_' + idx++;
      }

      ns = this.logNamespace({ prefix: newPrefix, uri: uri }, wellknownUri === uri);
    }

    if (prefix) {
      namespaces.mapPrefix(prefix, uri);
    }

    return ns;
  };

  ElementSerializer.prototype.parseAttributes = function(properties) {
    var self = this,
        element = this.element;

    forEach(properties, function(p) {

      var value = element.get(p.name);

      if (p.isReference) {

        if (!p.isMany) {
          value = value.id;
        } else {
          var values = [];
          forEach(value, function(v) {
            values.push(v.id);
          });

          // IDREFS is a whitespace-separated list of references.
          value = values.join(' ');
        }

      }

      self.addAttribute(self.nsAttributeName(p), value);
    });
  };

  ElementSerializer.prototype.addTagName = function(nsTagName) {
    var actualNs = this.logNamespaceUsed(nsTagName);

    this.getNamespaces().logUsed(actualNs);

    return nsName(nsTagName);
  };

  ElementSerializer.prototype.addAttribute = function(name, value) {
    var attrs = this.attrs;

    if (isString(value)) {
      value = escapeAttr(value);
    }

    // de-duplicate attributes
    // https://github.com/bpmn-io/moddle-xml/issues/66
    var idx = findIndex(attrs, function(element) {
      return (
        element.name.localName === name.localName &&
        element.name.uri === name.uri &&
        element.name.prefix === name.prefix
      );
    });

    var attr = { name: name, value: value };

    if (idx !== -1) {
      attrs.splice(idx, 1, attr);
    } else {
      attrs.push(attr);
    }
  };

  ElementSerializer.prototype.serializeAttributes = function(writer) {
    var attrs = this.attrs,
        namespaces = this.namespaces;

    if (namespaces) {
      attrs = getNsAttrs(namespaces).concat(attrs);
    }

    forEach(attrs, function(a) {
      writer
        .append(' ')
        .append(nsName(a.name)).append('="').append(a.value).append('"');
    });
  };

  ElementSerializer.prototype.serializeTo = function(writer) {
    var firstBody = this.body[0],
        indent = firstBody && firstBody.constructor !== BodySerializer;

    writer
      .appendIndent()
      .append('<' + this.tagName);

    this.serializeAttributes(writer);

    writer.append(firstBody ? '>' : ' />');

    if (firstBody) {

      if (indent) {
        writer
          .appendNewLine()
          .indent();
      }

      forEach(this.body, function(b) {
        b.serializeTo(writer);
      });

      if (indent) {
        writer
          .unindent()
          .appendIndent();
      }

      writer.append('</' + this.tagName + '>');
    }

    writer.appendNewLine();
  };

  /**
   * A serializer for types that handles serialization of data types
   */
  function TypeSerializer(parent, propertyDescriptor, serialization) {
    ElementSerializer.call(this, parent, propertyDescriptor);

    this.serialization = serialization;
  }

  inherits(TypeSerializer, ElementSerializer);

  TypeSerializer.prototype.parseNsAttributes = function(element) {

    // extracted attributes with serialization attribute
    // <type=typeName> stripped; it may be later
    var attributes = ElementSerializer.prototype.parseNsAttributes.call(this, element).filter(
      attr => attr.name !== this.serialization
    );

    var descriptor = element.$descriptor;

    // only serialize <type=typeName> if necessary
    if (descriptor.name === this.propertyDescriptor.type) {
      return attributes;
    }

    var typeNs = this.typeNs = this.nsTagName(descriptor);
    this.getNamespaces().logUsed(this.typeNs);

    // add xsi:type attribute to represent the elements
    // actual type

    var pkg = element.$model.getPackage(typeNs.uri),
        typePrefix = (pkg.xml && pkg.xml.typePrefix) || '';

    this.addAttribute(
      this.nsAttributeName(this.serialization),
      (typeNs.prefix ? typeNs.prefix + ':' : '') + typePrefix + descriptor.ns.localName
    );

    return attributes;
  };

  TypeSerializer.prototype.isLocalNs = function(ns) {
    return ns.uri === (this.typeNs || this.ns).uri;
  };

  function SavingWriter() {
    this.value = '';

    this.write = function(str) {
      this.value += str;
    };
  }

  function FormatingWriter(out, format) {

    var indent = [ '' ];

    this.append = function(str) {
      out.write(str);

      return this;
    };

    this.appendNewLine = function() {
      if (format) {
        out.write('\n');
      }

      return this;
    };

    this.appendIndent = function() {
      if (format) {
        out.write(indent.join('  '));
      }

      return this;
    };

    this.indent = function() {
      indent.push('');
      return this;
    };

    this.unindent = function() {
      indent.pop();
      return this;
    };
  }

  /**
   * A writer for meta-model backed document trees
   *
   * @param {Object} options output options to pass into the writer
   */
  function Writer(options) {

    options = assign$1({ format: false, preamble: true }, options || {});

    function toXML(tree, writer) {
      var internalWriter = writer || new SavingWriter();
      var formatingWriter = new FormatingWriter(internalWriter, options.format);

      if (options.preamble) {
        formatingWriter.append(XML_PREAMBLE);
      }

      var serializer = new ElementSerializer();

      var model = tree.$model;

      serializer.getNamespaces().mapDefaultPrefixes(getDefaultPrefixMappings(model));

      serializer.build(tree).serializeTo(formatingWriter);

      if (!writer) {
        return internalWriter.value;
      }
    }

    return {
      toXML: toXML
    };
  }


  // helpers ///////////

  /**
   * @param {Moddle} model
   *
   * @return { Record<string, string> } map from prefix to URI
   */
  function getDefaultPrefixMappings(model) {

    const nsMap = model.config && model.config.nsMap || {};

    const prefixMap = {};

    // { prefix -> uri }
    for (const prefix in DEFAULT_NS_MAP) {
      prefixMap[prefix] = DEFAULT_NS_MAP[prefix];
    }

    // { uri -> prefix }
    for (const uri in nsMap) {
      const prefix = nsMap[uri];

      prefixMap[prefix] = uri;
    }

    for (const pkg of model.getPackages()) {
      prefixMap[pkg.prefix] = pkg.uri;
    }

    return prefixMap;
  }

  /**
   * A sub class of {@link Moddle} with support for import and export of BPMN 2.0 xml files.
   *
   * @class BpmnModdle
   * @extends Moddle
   *
   * @param {Object|Array} packages to use for instantiating the model
   * @param {Object} [options] additional options to pass over
   */
  function BpmnModdle(packages, options) {
    Moddle.call(this, packages, options);
  }

  BpmnModdle.prototype = Object.create(Moddle.prototype);

  /**
   * The fromXML result.
   *
   * @typedef {Object} ParseResult
   *
   * @property {ModdleElement} rootElement
   * @property {Array<Object>} references
   * @property {Array<Error>} warnings
   * @property {Object} elementsById - a mapping containing each ID -> ModdleElement
   */

  /**
   * The fromXML error.
   *
   * @typedef {Error} ParseError
   *
   * @property {Array<Error>} warnings
   */

  /**
   * Instantiates a BPMN model tree from a given xml string.
   *
   * @param {String}   xmlStr
   * @param {String}   [typeName='bpmn:Definitions'] name of the root element
   * @param {Object}   [options]  options to pass to the underlying reader
   *
   * @returns {Promise<ParseResult, ParseError>}
   */
  BpmnModdle.prototype.fromXML = function(xmlStr, typeName, options) {

    if (!isString(typeName)) {
      options = typeName;
      typeName = 'bpmn:Definitions';
    }

    var reader = new Reader(assign$1({ model: this, lax: true }, options));
    var rootHandler = reader.handler(typeName);

    return reader.fromXML(xmlStr, rootHandler);
  };


  /**
   * The toXML result.
   *
   * @typedef {Object} SerializationResult
   *
   * @property {String} xml
   */

  /**
   * Serializes a BPMN 2.0 object tree to XML.
   *
   * @param {String}   element    the root element, typically an instance of `bpmn:Definitions`
   * @param {Object}   [options]  to pass to the underlying writer
   *
   * @returns {Promise<SerializationResult, Error>}
   */
  BpmnModdle.prototype.toXML = function(element, options) {

    var writer = new Writer(options);

    return new Promise(function(resolve, reject) {
      try {
        var result = writer.toXML(element);

        return resolve({
          xml: result
        });
      } catch (err) {
        return reject(err);
      }
    });
  };

  var name$5 = "BPMN20";
  var uri$5 = "http://www.omg.org/spec/BPMN/20100524/MODEL";
  var prefix$5 = "bpmn";
  var associations$5 = [
  ];
  var types$5 = [
  	{
  		name: "Interface",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "operations",
  				type: "Operation",
  				isMany: true
  			},
  			{
  				name: "implementationRef",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Operation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "inMessageRef",
  				type: "Message",
  				isReference: true
  			},
  			{
  				name: "outMessageRef",
  				type: "Message",
  				isReference: true
  			},
  			{
  				name: "errorRef",
  				type: "Error",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "implementationRef",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "EndPoint",
  		superClass: [
  			"RootElement"
  		]
  	},
  	{
  		name: "Auditing",
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "GlobalTask",
  		superClass: [
  			"CallableElement"
  		],
  		properties: [
  			{
  				name: "resources",
  				type: "ResourceRole",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "Monitoring",
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "Performer",
  		superClass: [
  			"ResourceRole"
  		]
  	},
  	{
  		name: "Process",
  		superClass: [
  			"FlowElementsContainer",
  			"CallableElement"
  		],
  		properties: [
  			{
  				name: "processType",
  				type: "ProcessType",
  				isAttr: true
  			},
  			{
  				name: "isClosed",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "auditing",
  				type: "Auditing"
  			},
  			{
  				name: "monitoring",
  				type: "Monitoring"
  			},
  			{
  				name: "properties",
  				type: "Property",
  				isMany: true
  			},
  			{
  				name: "laneSets",
  				isMany: true,
  				replaces: "FlowElementsContainer#laneSets",
  				type: "LaneSet"
  			},
  			{
  				name: "flowElements",
  				isMany: true,
  				replaces: "FlowElementsContainer#flowElements",
  				type: "FlowElement"
  			},
  			{
  				name: "artifacts",
  				type: "Artifact",
  				isMany: true
  			},
  			{
  				name: "resources",
  				type: "ResourceRole",
  				isMany: true
  			},
  			{
  				name: "correlationSubscriptions",
  				type: "CorrelationSubscription",
  				isMany: true
  			},
  			{
  				name: "supports",
  				type: "Process",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "definitionalCollaborationRef",
  				type: "Collaboration",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "isExecutable",
  				isAttr: true,
  				type: "Boolean"
  			}
  		]
  	},
  	{
  		name: "LaneSet",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "lanes",
  				type: "Lane",
  				isMany: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Lane",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "partitionElementRef",
  				type: "BaseElement",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "partitionElement",
  				type: "BaseElement"
  			},
  			{
  				name: "flowNodeRef",
  				type: "FlowNode",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "childLaneSet",
  				type: "LaneSet",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		]
  	},
  	{
  		name: "GlobalManualTask",
  		superClass: [
  			"GlobalTask"
  		]
  	},
  	{
  		name: "ManualTask",
  		superClass: [
  			"Task"
  		]
  	},
  	{
  		name: "UserTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "renderings",
  				type: "Rendering",
  				isMany: true
  			},
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Rendering",
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "HumanPerformer",
  		superClass: [
  			"Performer"
  		]
  	},
  	{
  		name: "PotentialOwner",
  		superClass: [
  			"HumanPerformer"
  		]
  	},
  	{
  		name: "GlobalUserTask",
  		superClass: [
  			"GlobalTask"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "renderings",
  				type: "Rendering",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "Gateway",
  		isAbstract: true,
  		superClass: [
  			"FlowNode"
  		],
  		properties: [
  			{
  				name: "gatewayDirection",
  				type: "GatewayDirection",
  				"default": "Unspecified",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "EventBasedGateway",
  		superClass: [
  			"Gateway"
  		],
  		properties: [
  			{
  				name: "instantiate",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "eventGatewayType",
  				type: "EventBasedGatewayType",
  				isAttr: true,
  				"default": "Exclusive"
  			}
  		]
  	},
  	{
  		name: "ComplexGateway",
  		superClass: [
  			"Gateway"
  		],
  		properties: [
  			{
  				name: "activationCondition",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "default",
  				type: "SequenceFlow",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ExclusiveGateway",
  		superClass: [
  			"Gateway"
  		],
  		properties: [
  			{
  				name: "default",
  				type: "SequenceFlow",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "InclusiveGateway",
  		superClass: [
  			"Gateway"
  		],
  		properties: [
  			{
  				name: "default",
  				type: "SequenceFlow",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ParallelGateway",
  		superClass: [
  			"Gateway"
  		]
  	},
  	{
  		name: "RootElement",
  		isAbstract: true,
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "Relationship",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "type",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "direction",
  				type: "RelationshipDirection",
  				isAttr: true
  			},
  			{
  				name: "source",
  				isMany: true,
  				isReference: true,
  				type: "Element"
  			},
  			{
  				name: "target",
  				isMany: true,
  				isReference: true,
  				type: "Element"
  			}
  		]
  	},
  	{
  		name: "BaseElement",
  		isAbstract: true,
  		properties: [
  			{
  				name: "id",
  				isAttr: true,
  				type: "String",
  				isId: true
  			},
  			{
  				name: "documentation",
  				type: "Documentation",
  				isMany: true
  			},
  			{
  				name: "extensionDefinitions",
  				type: "ExtensionDefinition",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "extensionElements",
  				type: "ExtensionElements"
  			}
  		]
  	},
  	{
  		name: "Extension",
  		properties: [
  			{
  				name: "mustUnderstand",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "definition",
  				type: "ExtensionDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ExtensionDefinition",
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "extensionAttributeDefinitions",
  				type: "ExtensionAttributeDefinition",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "ExtensionAttributeDefinition",
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "type",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isReference",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "extensionDefinition",
  				type: "ExtensionDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ExtensionElements",
  		properties: [
  			{
  				name: "valueRef",
  				isAttr: true,
  				isReference: true,
  				type: "Element"
  			},
  			{
  				name: "values",
  				type: "Element",
  				isMany: true
  			},
  			{
  				name: "extensionAttributeDefinition",
  				type: "ExtensionAttributeDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Documentation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "text",
  				type: "String",
  				isBody: true
  			},
  			{
  				name: "textFormat",
  				"default": "text/plain",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Event",
  		isAbstract: true,
  		superClass: [
  			"FlowNode",
  			"InteractionNode"
  		],
  		properties: [
  			{
  				name: "properties",
  				type: "Property",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "IntermediateCatchEvent",
  		superClass: [
  			"CatchEvent"
  		]
  	},
  	{
  		name: "IntermediateThrowEvent",
  		superClass: [
  			"ThrowEvent"
  		]
  	},
  	{
  		name: "EndEvent",
  		superClass: [
  			"ThrowEvent"
  		]
  	},
  	{
  		name: "StartEvent",
  		superClass: [
  			"CatchEvent"
  		],
  		properties: [
  			{
  				name: "isInterrupting",
  				"default": true,
  				isAttr: true,
  				type: "Boolean"
  			}
  		]
  	},
  	{
  		name: "ThrowEvent",
  		isAbstract: true,
  		superClass: [
  			"Event"
  		],
  		properties: [
  			{
  				name: "dataInputs",
  				type: "DataInput",
  				isMany: true
  			},
  			{
  				name: "dataInputAssociations",
  				type: "DataInputAssociation",
  				isMany: true
  			},
  			{
  				name: "inputSet",
  				type: "InputSet"
  			},
  			{
  				name: "eventDefinitions",
  				type: "EventDefinition",
  				isMany: true
  			},
  			{
  				name: "eventDefinitionRef",
  				type: "EventDefinition",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CatchEvent",
  		isAbstract: true,
  		superClass: [
  			"Event"
  		],
  		properties: [
  			{
  				name: "parallelMultiple",
  				isAttr: true,
  				type: "Boolean",
  				"default": false
  			},
  			{
  				name: "dataOutputs",
  				type: "DataOutput",
  				isMany: true
  			},
  			{
  				name: "dataOutputAssociations",
  				type: "DataOutputAssociation",
  				isMany: true
  			},
  			{
  				name: "outputSet",
  				type: "OutputSet"
  			},
  			{
  				name: "eventDefinitions",
  				type: "EventDefinition",
  				isMany: true
  			},
  			{
  				name: "eventDefinitionRef",
  				type: "EventDefinition",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "BoundaryEvent",
  		superClass: [
  			"CatchEvent"
  		],
  		properties: [
  			{
  				name: "cancelActivity",
  				"default": true,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "attachedToRef",
  				type: "Activity",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "EventDefinition",
  		isAbstract: true,
  		superClass: [
  			"RootElement"
  		]
  	},
  	{
  		name: "CancelEventDefinition",
  		superClass: [
  			"EventDefinition"
  		]
  	},
  	{
  		name: "ErrorEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "errorRef",
  				type: "Error",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "TerminateEventDefinition",
  		superClass: [
  			"EventDefinition"
  		]
  	},
  	{
  		name: "EscalationEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "escalationRef",
  				type: "Escalation",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Escalation",
  		properties: [
  			{
  				name: "structureRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "escalationCode",
  				isAttr: true,
  				type: "String"
  			}
  		],
  		superClass: [
  			"RootElement"
  		]
  	},
  	{
  		name: "CompensateEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "waitForCompletion",
  				isAttr: true,
  				type: "Boolean",
  				"default": true
  			},
  			{
  				name: "activityRef",
  				type: "Activity",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "TimerEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "timeDate",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "timeCycle",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "timeDuration",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		]
  	},
  	{
  		name: "LinkEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "target",
  				type: "LinkEventDefinition",
  				isReference: true
  			},
  			{
  				name: "source",
  				type: "LinkEventDefinition",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "MessageEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "messageRef",
  				type: "Message",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "operationRef",
  				type: "Operation",
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ConditionalEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "condition",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		]
  	},
  	{
  		name: "SignalEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "signalRef",
  				type: "Signal",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Signal",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "structureRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ImplicitThrowEvent",
  		superClass: [
  			"ThrowEvent"
  		]
  	},
  	{
  		name: "DataState",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ItemAwareElement",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "itemSubjectRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "dataState",
  				type: "DataState"
  			}
  		]
  	},
  	{
  		name: "DataAssociation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "sourceRef",
  				type: "ItemAwareElement",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "targetRef",
  				type: "ItemAwareElement",
  				isReference: true
  			},
  			{
  				name: "transformation",
  				type: "FormalExpression",
  				xml: {
  					serialize: "property"
  				}
  			},
  			{
  				name: "assignment",
  				type: "Assignment",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "DataInput",
  		superClass: [
  			"ItemAwareElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isCollection",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "inputSetRef",
  				type: "InputSet",
  				isMany: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "inputSetWithOptional",
  				type: "InputSet",
  				isMany: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "inputSetWithWhileExecuting",
  				type: "InputSet",
  				isMany: true,
  				isVirtual: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "DataOutput",
  		superClass: [
  			"ItemAwareElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isCollection",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "outputSetRef",
  				type: "OutputSet",
  				isMany: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "outputSetWithOptional",
  				type: "OutputSet",
  				isMany: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "outputSetWithWhileExecuting",
  				type: "OutputSet",
  				isMany: true,
  				isVirtual: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "InputSet",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "dataInputRefs",
  				type: "DataInput",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "optionalInputRefs",
  				type: "DataInput",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "whileExecutingInputRefs",
  				type: "DataInput",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "outputSetRefs",
  				type: "OutputSet",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "OutputSet",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "dataOutputRefs",
  				type: "DataOutput",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "inputSetRefs",
  				type: "InputSet",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "optionalOutputRefs",
  				type: "DataOutput",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "whileExecutingOutputRefs",
  				type: "DataOutput",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Property",
  		superClass: [
  			"ItemAwareElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "DataInputAssociation",
  		superClass: [
  			"DataAssociation"
  		]
  	},
  	{
  		name: "DataOutputAssociation",
  		superClass: [
  			"DataAssociation"
  		]
  	},
  	{
  		name: "InputOutputSpecification",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "dataInputs",
  				type: "DataInput",
  				isMany: true
  			},
  			{
  				name: "dataOutputs",
  				type: "DataOutput",
  				isMany: true
  			},
  			{
  				name: "inputSets",
  				type: "InputSet",
  				isMany: true
  			},
  			{
  				name: "outputSets",
  				type: "OutputSet",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "DataObject",
  		superClass: [
  			"FlowElement",
  			"ItemAwareElement"
  		],
  		properties: [
  			{
  				name: "isCollection",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			}
  		]
  	},
  	{
  		name: "InputOutputBinding",
  		properties: [
  			{
  				name: "inputDataRef",
  				type: "InputSet",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "outputDataRef",
  				type: "OutputSet",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "operationRef",
  				type: "Operation",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Assignment",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "from",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "to",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		]
  	},
  	{
  		name: "DataStore",
  		superClass: [
  			"RootElement",
  			"ItemAwareElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "capacity",
  				isAttr: true,
  				type: "Integer"
  			},
  			{
  				name: "isUnlimited",
  				"default": true,
  				isAttr: true,
  				type: "Boolean"
  			}
  		]
  	},
  	{
  		name: "DataStoreReference",
  		superClass: [
  			"ItemAwareElement",
  			"FlowElement"
  		],
  		properties: [
  			{
  				name: "dataStoreRef",
  				type: "DataStore",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "DataObjectReference",
  		superClass: [
  			"ItemAwareElement",
  			"FlowElement"
  		],
  		properties: [
  			{
  				name: "dataObjectRef",
  				type: "DataObject",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ConversationLink",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "sourceRef",
  				type: "InteractionNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "targetRef",
  				type: "InteractionNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ConversationAssociation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "innerConversationNodeRef",
  				type: "ConversationNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "outerConversationNodeRef",
  				type: "ConversationNode",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CallConversation",
  		superClass: [
  			"ConversationNode"
  		],
  		properties: [
  			{
  				name: "calledCollaborationRef",
  				type: "Collaboration",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "participantAssociations",
  				type: "ParticipantAssociation",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "Conversation",
  		superClass: [
  			"ConversationNode"
  		]
  	},
  	{
  		name: "SubConversation",
  		superClass: [
  			"ConversationNode"
  		],
  		properties: [
  			{
  				name: "conversationNodes",
  				type: "ConversationNode",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "ConversationNode",
  		isAbstract: true,
  		superClass: [
  			"InteractionNode",
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "participantRef",
  				type: "Participant",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "messageFlowRefs",
  				type: "MessageFlow",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "correlationKeys",
  				type: "CorrelationKey",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "GlobalConversation",
  		superClass: [
  			"Collaboration"
  		]
  	},
  	{
  		name: "PartnerEntity",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "participantRef",
  				type: "Participant",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "PartnerRole",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "participantRef",
  				type: "Participant",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CorrelationProperty",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "correlationPropertyRetrievalExpression",
  				type: "CorrelationPropertyRetrievalExpression",
  				isMany: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "type",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Error",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "structureRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "errorCode",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "CorrelationKey",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "correlationPropertyRef",
  				type: "CorrelationProperty",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Expression",
  		superClass: [
  			"BaseElement"
  		],
  		isAbstract: false,
  		properties: [
  			{
  				name: "body",
  				isBody: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "FormalExpression",
  		superClass: [
  			"Expression"
  		],
  		properties: [
  			{
  				name: "language",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "evaluatesToTypeRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Message",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "itemRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ItemDefinition",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "itemKind",
  				type: "ItemKind",
  				isAttr: true
  			},
  			{
  				name: "structureRef",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isCollection",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "import",
  				type: "Import",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "FlowElement",
  		isAbstract: true,
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "auditing",
  				type: "Auditing"
  			},
  			{
  				name: "monitoring",
  				type: "Monitoring"
  			},
  			{
  				name: "categoryValueRef",
  				type: "CategoryValue",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "SequenceFlow",
  		superClass: [
  			"FlowElement"
  		],
  		properties: [
  			{
  				name: "isImmediate",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "conditionExpression",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "sourceRef",
  				type: "FlowNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "targetRef",
  				type: "FlowNode",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "FlowElementsContainer",
  		isAbstract: true,
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "laneSets",
  				type: "LaneSet",
  				isMany: true
  			},
  			{
  				name: "flowElements",
  				type: "FlowElement",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "CallableElement",
  		isAbstract: true,
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "ioSpecification",
  				type: "InputOutputSpecification",
  				xml: {
  					serialize: "property"
  				}
  			},
  			{
  				name: "supportedInterfaceRef",
  				type: "Interface",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "ioBinding",
  				type: "InputOutputBinding",
  				isMany: true,
  				xml: {
  					serialize: "property"
  				}
  			}
  		]
  	},
  	{
  		name: "FlowNode",
  		isAbstract: true,
  		superClass: [
  			"FlowElement"
  		],
  		properties: [
  			{
  				name: "incoming",
  				type: "SequenceFlow",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "outgoing",
  				type: "SequenceFlow",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "lanes",
  				type: "Lane",
  				isMany: true,
  				isVirtual: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CorrelationPropertyRetrievalExpression",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "messagePath",
  				type: "FormalExpression"
  			},
  			{
  				name: "messageRef",
  				type: "Message",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CorrelationPropertyBinding",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "dataPath",
  				type: "FormalExpression"
  			},
  			{
  				name: "correlationPropertyRef",
  				type: "CorrelationProperty",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Resource",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "resourceParameters",
  				type: "ResourceParameter",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "ResourceParameter",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isRequired",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "type",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CorrelationSubscription",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "correlationKeyRef",
  				type: "CorrelationKey",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "correlationPropertyBinding",
  				type: "CorrelationPropertyBinding",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "MessageFlow",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "sourceRef",
  				type: "InteractionNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "targetRef",
  				type: "InteractionNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "messageRef",
  				type: "Message",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "MessageFlowAssociation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "innerMessageFlowRef",
  				type: "MessageFlow",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "outerMessageFlowRef",
  				type: "MessageFlow",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "InteractionNode",
  		isAbstract: true,
  		properties: [
  			{
  				name: "incomingConversationLinks",
  				type: "ConversationLink",
  				isMany: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "outgoingConversationLinks",
  				type: "ConversationLink",
  				isMany: true,
  				isVirtual: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Participant",
  		superClass: [
  			"InteractionNode",
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "interfaceRef",
  				type: "Interface",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "participantMultiplicity",
  				type: "ParticipantMultiplicity"
  			},
  			{
  				name: "endPointRefs",
  				type: "EndPoint",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "processRef",
  				type: "Process",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ParticipantAssociation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "innerParticipantRef",
  				type: "Participant",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "outerParticipantRef",
  				type: "Participant",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ParticipantMultiplicity",
  		properties: [
  			{
  				name: "minimum",
  				"default": 0,
  				isAttr: true,
  				type: "Integer"
  			},
  			{
  				name: "maximum",
  				"default": 1,
  				isAttr: true,
  				type: "Integer"
  			}
  		],
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "Collaboration",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isClosed",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "participants",
  				type: "Participant",
  				isMany: true
  			},
  			{
  				name: "messageFlows",
  				type: "MessageFlow",
  				isMany: true
  			},
  			{
  				name: "artifacts",
  				type: "Artifact",
  				isMany: true
  			},
  			{
  				name: "conversations",
  				type: "ConversationNode",
  				isMany: true
  			},
  			{
  				name: "conversationAssociations",
  				type: "ConversationAssociation"
  			},
  			{
  				name: "participantAssociations",
  				type: "ParticipantAssociation",
  				isMany: true
  			},
  			{
  				name: "messageFlowAssociations",
  				type: "MessageFlowAssociation",
  				isMany: true
  			},
  			{
  				name: "correlationKeys",
  				type: "CorrelationKey",
  				isMany: true
  			},
  			{
  				name: "choreographyRef",
  				type: "Choreography",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "conversationLinks",
  				type: "ConversationLink",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "ChoreographyActivity",
  		isAbstract: true,
  		superClass: [
  			"FlowNode"
  		],
  		properties: [
  			{
  				name: "participantRef",
  				type: "Participant",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "initiatingParticipantRef",
  				type: "Participant",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "correlationKeys",
  				type: "CorrelationKey",
  				isMany: true
  			},
  			{
  				name: "loopType",
  				type: "ChoreographyLoopType",
  				"default": "None",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "CallChoreography",
  		superClass: [
  			"ChoreographyActivity"
  		],
  		properties: [
  			{
  				name: "calledChoreographyRef",
  				type: "Choreography",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "participantAssociations",
  				type: "ParticipantAssociation",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "SubChoreography",
  		superClass: [
  			"ChoreographyActivity",
  			"FlowElementsContainer"
  		],
  		properties: [
  			{
  				name: "artifacts",
  				type: "Artifact",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "ChoreographyTask",
  		superClass: [
  			"ChoreographyActivity"
  		],
  		properties: [
  			{
  				name: "messageFlowRef",
  				type: "MessageFlow",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Choreography",
  		superClass: [
  			"Collaboration",
  			"FlowElementsContainer"
  		]
  	},
  	{
  		name: "GlobalChoreographyTask",
  		superClass: [
  			"Choreography"
  		],
  		properties: [
  			{
  				name: "initiatingParticipantRef",
  				type: "Participant",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "TextAnnotation",
  		superClass: [
  			"Artifact"
  		],
  		properties: [
  			{
  				name: "text",
  				type: "String"
  			},
  			{
  				name: "textFormat",
  				"default": "text/plain",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Group",
  		superClass: [
  			"Artifact"
  		],
  		properties: [
  			{
  				name: "categoryValueRef",
  				type: "CategoryValue",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Association",
  		superClass: [
  			"Artifact"
  		],
  		properties: [
  			{
  				name: "associationDirection",
  				type: "AssociationDirection",
  				isAttr: true
  			},
  			{
  				name: "sourceRef",
  				type: "BaseElement",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "targetRef",
  				type: "BaseElement",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Category",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "categoryValue",
  				type: "CategoryValue",
  				isMany: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Artifact",
  		isAbstract: true,
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "CategoryValue",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "categorizedFlowElements",
  				type: "FlowElement",
  				isMany: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "value",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Activity",
  		isAbstract: true,
  		superClass: [
  			"FlowNode"
  		],
  		properties: [
  			{
  				name: "isForCompensation",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "default",
  				type: "SequenceFlow",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "ioSpecification",
  				type: "InputOutputSpecification",
  				xml: {
  					serialize: "property"
  				}
  			},
  			{
  				name: "boundaryEventRefs",
  				type: "BoundaryEvent",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "properties",
  				type: "Property",
  				isMany: true
  			},
  			{
  				name: "dataInputAssociations",
  				type: "DataInputAssociation",
  				isMany: true
  			},
  			{
  				name: "dataOutputAssociations",
  				type: "DataOutputAssociation",
  				isMany: true
  			},
  			{
  				name: "startQuantity",
  				"default": 1,
  				isAttr: true,
  				type: "Integer"
  			},
  			{
  				name: "resources",
  				type: "ResourceRole",
  				isMany: true
  			},
  			{
  				name: "completionQuantity",
  				"default": 1,
  				isAttr: true,
  				type: "Integer"
  			},
  			{
  				name: "loopCharacteristics",
  				type: "LoopCharacteristics"
  			}
  		]
  	},
  	{
  		name: "ServiceTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "operationRef",
  				type: "Operation",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "SubProcess",
  		superClass: [
  			"Activity",
  			"FlowElementsContainer",
  			"InteractionNode"
  		],
  		properties: [
  			{
  				name: "triggeredByEvent",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "artifacts",
  				type: "Artifact",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "LoopCharacteristics",
  		isAbstract: true,
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "MultiInstanceLoopCharacteristics",
  		superClass: [
  			"LoopCharacteristics"
  		],
  		properties: [
  			{
  				name: "isSequential",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "behavior",
  				type: "MultiInstanceBehavior",
  				"default": "All",
  				isAttr: true
  			},
  			{
  				name: "loopCardinality",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "loopDataInputRef",
  				type: "ItemAwareElement",
  				isReference: true
  			},
  			{
  				name: "loopDataOutputRef",
  				type: "ItemAwareElement",
  				isReference: true
  			},
  			{
  				name: "inputDataItem",
  				type: "DataInput",
  				xml: {
  					serialize: "property"
  				}
  			},
  			{
  				name: "outputDataItem",
  				type: "DataOutput",
  				xml: {
  					serialize: "property"
  				}
  			},
  			{
  				name: "complexBehaviorDefinition",
  				type: "ComplexBehaviorDefinition",
  				isMany: true
  			},
  			{
  				name: "completionCondition",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "oneBehaviorEventRef",
  				type: "EventDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "noneBehaviorEventRef",
  				type: "EventDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "StandardLoopCharacteristics",
  		superClass: [
  			"LoopCharacteristics"
  		],
  		properties: [
  			{
  				name: "testBefore",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "loopCondition",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "loopMaximum",
  				type: "Integer",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "CallActivity",
  		superClass: [
  			"Activity",
  			"InteractionNode"
  		],
  		properties: [
  			{
  				name: "calledElement",
  				type: "String",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "Task",
  		superClass: [
  			"Activity",
  			"InteractionNode"
  		]
  	},
  	{
  		name: "SendTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "operationRef",
  				type: "Operation",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "messageRef",
  				type: "Message",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ReceiveTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "instantiate",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "operationRef",
  				type: "Operation",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "messageRef",
  				type: "Message",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ScriptTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "scriptFormat",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "script",
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "BusinessRuleTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "AdHocSubProcess",
  		superClass: [
  			"SubProcess"
  		],
  		properties: [
  			{
  				name: "completionCondition",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "ordering",
  				type: "AdHocOrdering",
  				isAttr: true
  			},
  			{
  				name: "cancelRemainingInstances",
  				"default": true,
  				isAttr: true,
  				type: "Boolean"
  			}
  		]
  	},
  	{
  		name: "Transaction",
  		superClass: [
  			"SubProcess"
  		],
  		properties: [
  			{
  				name: "protocol",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "method",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "GlobalScriptTask",
  		superClass: [
  			"GlobalTask"
  		],
  		properties: [
  			{
  				name: "scriptLanguage",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "script",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "GlobalBusinessRuleTask",
  		superClass: [
  			"GlobalTask"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ComplexBehaviorDefinition",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "condition",
  				type: "FormalExpression"
  			},
  			{
  				name: "event",
  				type: "ImplicitThrowEvent"
  			}
  		]
  	},
  	{
  		name: "ResourceRole",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "resourceRef",
  				type: "Resource",
  				isReference: true
  			},
  			{
  				name: "resourceParameterBindings",
  				type: "ResourceParameterBinding",
  				isMany: true
  			},
  			{
  				name: "resourceAssignmentExpression",
  				type: "ResourceAssignmentExpression"
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ResourceParameterBinding",
  		properties: [
  			{
  				name: "expression",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "parameterRef",
  				type: "ResourceParameter",
  				isAttr: true,
  				isReference: true
  			}
  		],
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "ResourceAssignmentExpression",
  		properties: [
  			{
  				name: "expression",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		],
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "Import",
  		properties: [
  			{
  				name: "importType",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "location",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "namespace",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Definitions",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "targetNamespace",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "expressionLanguage",
  				"default": "http://www.w3.org/1999/XPath",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "typeLanguage",
  				"default": "http://www.w3.org/2001/XMLSchema",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "imports",
  				type: "Import",
  				isMany: true
  			},
  			{
  				name: "extensions",
  				type: "Extension",
  				isMany: true
  			},
  			{
  				name: "rootElements",
  				type: "RootElement",
  				isMany: true
  			},
  			{
  				name: "diagrams",
  				isMany: true,
  				type: "bpmndi:BPMNDiagram"
  			},
  			{
  				name: "exporter",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "relationships",
  				type: "Relationship",
  				isMany: true
  			},
  			{
  				name: "exporterVersion",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	}
  ];
  var enumerations$3 = [
  	{
  		name: "ProcessType",
  		literalValues: [
  			{
  				name: "None"
  			},
  			{
  				name: "Public"
  			},
  			{
  				name: "Private"
  			}
  		]
  	},
  	{
  		name: "GatewayDirection",
  		literalValues: [
  			{
  				name: "Unspecified"
  			},
  			{
  				name: "Converging"
  			},
  			{
  				name: "Diverging"
  			},
  			{
  				name: "Mixed"
  			}
  		]
  	},
  	{
  		name: "EventBasedGatewayType",
  		literalValues: [
  			{
  				name: "Parallel"
  			},
  			{
  				name: "Exclusive"
  			}
  		]
  	},
  	{
  		name: "RelationshipDirection",
  		literalValues: [
  			{
  				name: "None"
  			},
  			{
  				name: "Forward"
  			},
  			{
  				name: "Backward"
  			},
  			{
  				name: "Both"
  			}
  		]
  	},
  	{
  		name: "ItemKind",
  		literalValues: [
  			{
  				name: "Physical"
  			},
  			{
  				name: "Information"
  			}
  		]
  	},
  	{
  		name: "ChoreographyLoopType",
  		literalValues: [
  			{
  				name: "None"
  			},
  			{
  				name: "Standard"
  			},
  			{
  				name: "MultiInstanceSequential"
  			},
  			{
  				name: "MultiInstanceParallel"
  			}
  		]
  	},
  	{
  		name: "AssociationDirection",
  		literalValues: [
  			{
  				name: "None"
  			},
  			{
  				name: "One"
  			},
  			{
  				name: "Both"
  			}
  		]
  	},
  	{
  		name: "MultiInstanceBehavior",
  		literalValues: [
  			{
  				name: "None"
  			},
  			{
  				name: "One"
  			},
  			{
  				name: "All"
  			},
  			{
  				name: "Complex"
  			}
  		]
  	},
  	{
  		name: "AdHocOrdering",
  		literalValues: [
  			{
  				name: "Parallel"
  			},
  			{
  				name: "Sequential"
  			}
  		]
  	}
  ];
  var xml$1 = {
  	tagAlias: "lowerCase",
  	typePrefix: "t"
  };
  var BpmnPackage = {
  	name: name$5,
  	uri: uri$5,
  	prefix: prefix$5,
  	associations: associations$5,
  	types: types$5,
  	enumerations: enumerations$3,
  	xml: xml$1
  };

  var name$4 = "BPMNDI";
  var uri$4 = "http://www.omg.org/spec/BPMN/20100524/DI";
  var prefix$4 = "bpmndi";
  var types$4 = [
  	{
  		name: "BPMNDiagram",
  		properties: [
  			{
  				name: "plane",
  				type: "BPMNPlane",
  				redefines: "di:Diagram#rootElement"
  			},
  			{
  				name: "labelStyle",
  				type: "BPMNLabelStyle",
  				isMany: true
  			}
  		],
  		superClass: [
  			"di:Diagram"
  		]
  	},
  	{
  		name: "BPMNPlane",
  		properties: [
  			{
  				name: "bpmnElement",
  				isAttr: true,
  				isReference: true,
  				type: "bpmn:BaseElement",
  				redefines: "di:DiagramElement#modelElement"
  			}
  		],
  		superClass: [
  			"di:Plane"
  		]
  	},
  	{
  		name: "BPMNShape",
  		properties: [
  			{
  				name: "bpmnElement",
  				isAttr: true,
  				isReference: true,
  				type: "bpmn:BaseElement",
  				redefines: "di:DiagramElement#modelElement"
  			},
  			{
  				name: "isHorizontal",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "isExpanded",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "isMarkerVisible",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "label",
  				type: "BPMNLabel"
  			},
  			{
  				name: "isMessageVisible",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "participantBandKind",
  				type: "ParticipantBandKind",
  				isAttr: true
  			},
  			{
  				name: "choreographyActivityShape",
  				type: "BPMNShape",
  				isAttr: true,
  				isReference: true
  			}
  		],
  		superClass: [
  			"di:LabeledShape"
  		]
  	},
  	{
  		name: "BPMNEdge",
  		properties: [
  			{
  				name: "label",
  				type: "BPMNLabel"
  			},
  			{
  				name: "bpmnElement",
  				isAttr: true,
  				isReference: true,
  				type: "bpmn:BaseElement",
  				redefines: "di:DiagramElement#modelElement"
  			},
  			{
  				name: "sourceElement",
  				isAttr: true,
  				isReference: true,
  				type: "di:DiagramElement",
  				redefines: "di:Edge#source"
  			},
  			{
  				name: "targetElement",
  				isAttr: true,
  				isReference: true,
  				type: "di:DiagramElement",
  				redefines: "di:Edge#target"
  			},
  			{
  				name: "messageVisibleKind",
  				type: "MessageVisibleKind",
  				isAttr: true,
  				"default": "initiating"
  			}
  		],
  		superClass: [
  			"di:LabeledEdge"
  		]
  	},
  	{
  		name: "BPMNLabel",
  		properties: [
  			{
  				name: "labelStyle",
  				type: "BPMNLabelStyle",
  				isAttr: true,
  				isReference: true,
  				redefines: "di:DiagramElement#style"
  			}
  		],
  		superClass: [
  			"di:Label"
  		]
  	},
  	{
  		name: "BPMNLabelStyle",
  		properties: [
  			{
  				name: "font",
  				type: "dc:Font"
  			}
  		],
  		superClass: [
  			"di:Style"
  		]
  	}
  ];
  var enumerations$2 = [
  	{
  		name: "ParticipantBandKind",
  		literalValues: [
  			{
  				name: "top_initiating"
  			},
  			{
  				name: "middle_initiating"
  			},
  			{
  				name: "bottom_initiating"
  			},
  			{
  				name: "top_non_initiating"
  			},
  			{
  				name: "middle_non_initiating"
  			},
  			{
  				name: "bottom_non_initiating"
  			}
  		]
  	},
  	{
  		name: "MessageVisibleKind",
  		literalValues: [
  			{
  				name: "initiating"
  			},
  			{
  				name: "non_initiating"
  			}
  		]
  	}
  ];
  var associations$4 = [
  ];
  var BpmnDiPackage = {
  	name: name$4,
  	uri: uri$4,
  	prefix: prefix$4,
  	types: types$4,
  	enumerations: enumerations$2,
  	associations: associations$4
  };

  var name$3 = "DC";
  var uri$3 = "http://www.omg.org/spec/DD/20100524/DC";
  var prefix$3 = "dc";
  var types$3 = [
  	{
  		name: "Boolean"
  	},
  	{
  		name: "Integer"
  	},
  	{
  		name: "Real"
  	},
  	{
  		name: "String"
  	},
  	{
  		name: "Font",
  		properties: [
  			{
  				name: "name",
  				type: "String",
  				isAttr: true
  			},
  			{
  				name: "size",
  				type: "Real",
  				isAttr: true
  			},
  			{
  				name: "isBold",
  				type: "Boolean",
  				isAttr: true
  			},
  			{
  				name: "isItalic",
  				type: "Boolean",
  				isAttr: true
  			},
  			{
  				name: "isUnderline",
  				type: "Boolean",
  				isAttr: true
  			},
  			{
  				name: "isStrikeThrough",
  				type: "Boolean",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "Point",
  		properties: [
  			{
  				name: "x",
  				type: "Real",
  				"default": "0",
  				isAttr: true
  			},
  			{
  				name: "y",
  				type: "Real",
  				"default": "0",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "Bounds",
  		properties: [
  			{
  				name: "x",
  				type: "Real",
  				"default": "0",
  				isAttr: true
  			},
  			{
  				name: "y",
  				type: "Real",
  				"default": "0",
  				isAttr: true
  			},
  			{
  				name: "width",
  				type: "Real",
  				isAttr: true
  			},
  			{
  				name: "height",
  				type: "Real",
  				isAttr: true
  			}
  		]
  	}
  ];
  var associations$3 = [
  ];
  var DcPackage = {
  	name: name$3,
  	uri: uri$3,
  	prefix: prefix$3,
  	types: types$3,
  	associations: associations$3
  };

  var name$2 = "DI";
  var uri$2 = "http://www.omg.org/spec/DD/20100524/DI";
  var prefix$2 = "di";
  var types$2 = [
  	{
  		name: "DiagramElement",
  		isAbstract: true,
  		properties: [
  			{
  				name: "id",
  				isAttr: true,
  				isId: true,
  				type: "String"
  			},
  			{
  				name: "extension",
  				type: "Extension"
  			},
  			{
  				name: "owningDiagram",
  				type: "Diagram",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "owningElement",
  				type: "DiagramElement",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "modelElement",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true,
  				type: "Element"
  			},
  			{
  				name: "style",
  				type: "Style",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "ownedElement",
  				type: "DiagramElement",
  				isReadOnly: true,
  				isMany: true,
  				isVirtual: true
  			}
  		]
  	},
  	{
  		name: "Node",
  		isAbstract: true,
  		superClass: [
  			"DiagramElement"
  		]
  	},
  	{
  		name: "Edge",
  		isAbstract: true,
  		superClass: [
  			"DiagramElement"
  		],
  		properties: [
  			{
  				name: "source",
  				type: "DiagramElement",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "target",
  				type: "DiagramElement",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "waypoint",
  				isUnique: false,
  				isMany: true,
  				type: "dc:Point",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		]
  	},
  	{
  		name: "Diagram",
  		isAbstract: true,
  		properties: [
  			{
  				name: "id",
  				isAttr: true,
  				isId: true,
  				type: "String"
  			},
  			{
  				name: "rootElement",
  				type: "DiagramElement",
  				isReadOnly: true,
  				isVirtual: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "documentation",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "resolution",
  				isAttr: true,
  				type: "Real"
  			},
  			{
  				name: "ownedStyle",
  				type: "Style",
  				isReadOnly: true,
  				isMany: true,
  				isVirtual: true
  			}
  		]
  	},
  	{
  		name: "Shape",
  		isAbstract: true,
  		superClass: [
  			"Node"
  		],
  		properties: [
  			{
  				name: "bounds",
  				type: "dc:Bounds"
  			}
  		]
  	},
  	{
  		name: "Plane",
  		isAbstract: true,
  		superClass: [
  			"Node"
  		],
  		properties: [
  			{
  				name: "planeElement",
  				type: "DiagramElement",
  				subsettedProperty: "DiagramElement-ownedElement",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "LabeledEdge",
  		isAbstract: true,
  		superClass: [
  			"Edge"
  		],
  		properties: [
  			{
  				name: "ownedLabel",
  				type: "Label",
  				isReadOnly: true,
  				subsettedProperty: "DiagramElement-ownedElement",
  				isMany: true,
  				isVirtual: true
  			}
  		]
  	},
  	{
  		name: "LabeledShape",
  		isAbstract: true,
  		superClass: [
  			"Shape"
  		],
  		properties: [
  			{
  				name: "ownedLabel",
  				type: "Label",
  				isReadOnly: true,
  				subsettedProperty: "DiagramElement-ownedElement",
  				isMany: true,
  				isVirtual: true
  			}
  		]
  	},
  	{
  		name: "Label",
  		isAbstract: true,
  		superClass: [
  			"Node"
  		],
  		properties: [
  			{
  				name: "bounds",
  				type: "dc:Bounds"
  			}
  		]
  	},
  	{
  		name: "Style",
  		isAbstract: true,
  		properties: [
  			{
  				name: "id",
  				isAttr: true,
  				isId: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Extension",
  		properties: [
  			{
  				name: "values",
  				isMany: true,
  				type: "Element"
  			}
  		]
  	}
  ];
  var associations$2 = [
  ];
  var xml = {
  	tagAlias: "lowerCase"
  };
  var DiPackage = {
  	name: name$2,
  	uri: uri$2,
  	prefix: prefix$2,
  	types: types$2,
  	associations: associations$2,
  	xml: xml
  };

  var name$1 = "bpmn.io colors for BPMN";
  var uri$1 = "http://bpmn.io/schema/bpmn/biocolor/1.0";
  var prefix$1 = "bioc";
  var types$1 = [
  	{
  		name: "ColoredShape",
  		"extends": [
  			"bpmndi:BPMNShape"
  		],
  		properties: [
  			{
  				name: "stroke",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "fill",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ColoredEdge",
  		"extends": [
  			"bpmndi:BPMNEdge"
  		],
  		properties: [
  			{
  				name: "stroke",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "fill",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	}
  ];
  var enumerations$1 = [
  ];
  var associations$1 = [
  ];
  var BiocPackage = {
  	name: name$1,
  	uri: uri$1,
  	prefix: prefix$1,
  	types: types$1,
  	enumerations: enumerations$1,
  	associations: associations$1
  };

  var name = "BPMN in Color";
  var uri = "http://www.omg.org/spec/BPMN/non-normative/color/1.0";
  var prefix = "color";
  var types = [
  	{
  		name: "ColoredLabel",
  		"extends": [
  			"bpmndi:BPMNLabel"
  		],
  		properties: [
  			{
  				name: "color",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ColoredShape",
  		"extends": [
  			"bpmndi:BPMNShape"
  		],
  		properties: [
  			{
  				name: "background-color",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "border-color",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ColoredEdge",
  		"extends": [
  			"bpmndi:BPMNEdge"
  		],
  		properties: [
  			{
  				name: "border-color",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	}
  ];
  var enumerations = [
  ];
  var associations = [
  ];
  var BpmnInColorPackage = {
  	name: name,
  	uri: uri,
  	prefix: prefix,
  	types: types,
  	enumerations: enumerations,
  	associations: associations
  };

  const packages = {
    bpmn: BpmnPackage,
    bpmndi: BpmnDiPackage,
    dc: DcPackage,
    di: DiPackage,
    bioc: BiocPackage,
    color: BpmnInColorPackage
  };

  function SimpleBpmnModdle(additionalPackages, options) {
    const pks = assign$1({}, packages, additionalPackages);

    return new BpmnModdle(pks, options);
  }

  /**
   * @typedef {import('../model/Types').ModdleElement} ModdleElement
   */


  // TODO(nikku): remove with future bpmn-js version

  var DI_ERROR_MESSAGE = 'Tried to access di from the businessObject. The di is available through the diagram element only. For more information, see https://github.com/bpmn-io/bpmn-js/issues/1472';

  /**
   * @private
   *
   * @param {ModdleElement} businessObject
   */
  function ensureCompatDiRef(businessObject) {

    // bpmnElement can have multiple independent DIs
    if (!has(businessObject, 'di')) {
      Object.defineProperty(businessObject, 'di', {
        enumerable: false,
        get: function() {
          throw new Error(DI_ERROR_MESSAGE);
        }
      });
    }
  }

  /**
   * @typedef {import('../model/Types').ModdleElement} ModdleElement
   */

  /**
   * Returns true if an element is of the given meta-model type.
   *
   * @param {ModdleElement} element
   * @param {string} type
   *
   * @return {boolean}
   */
  function is(element, type) {
    return element.$instanceOf(type);
  }


  /**
   * Find a suitable display candidate for definitions where the DI does not
   * correctly specify one.
   *
   * @param {ModdleElement} definitions
   *
   * @return {ModdleElement}
   */
  function findDisplayCandidate(definitions) {
    return find(definitions.rootElements, function(e) {
      return is(e, 'bpmn:Process') || is(e, 'bpmn:Collaboration');
    });
  }

  /**
   * @param {Record<'element' | 'root' | 'error', Function>} handler
   */
  function BpmnTreeWalker(handler) {

    // list of containers already walked
    var handledElements = {};

    // list of elements to handle deferred to ensure
    // prerequisites are drawn
    var deferred = [];

    var diMap = {};

    // Helpers //////////////////////

    function contextual(fn, ctx) {
      return function(e) {
        fn(e, ctx);
      };
    }

    function handled(element) {
      handledElements[element.id] = element;
    }

    function isHandled(element) {
      return handledElements[element.id];
    }

    function visit(element, ctx) {

      var gfx = element.gfx;

      // avoid multiple rendering of elements
      if (gfx) {
        throw new Error(
          `already rendered ${ elementToString(element) }`
        );
      }

      // call handler
      return handler.element(element, diMap[element.id], ctx);
    }

    function visitRoot(element, diagram) {
      return handler.root(element, diMap[element.id], diagram);
    }

    function visitIfDi(element, ctx) {

      try {
        var gfx = diMap[element.id] && visit(element, ctx);

        handled(element);

        return gfx;
      } catch (error) {
        logError(error.message, { element, error });

        console.error(`failed to import ${ elementToString(element) }`, error);
      }
    }

    function logError(message, context) {
      handler.error(message, context);
    }

    // DI handling //////////////////////

    var registerDi = this.registerDi = function registerDi(di) {
      var bpmnElement = di.bpmnElement;

      if (bpmnElement) {
        if (diMap[bpmnElement.id]) {
          logError(
            `multiple DI elements defined for ${ elementToString(bpmnElement) }`,
            { element: bpmnElement }
          );
        } else {
          diMap[bpmnElement.id] = di;

          ensureCompatDiRef(bpmnElement);
        }
      } else {
        logError(
          `no bpmnElement referenced in ${ elementToString(di) }`,
          { element: di }
        );
      }
    };

    function handleDiagram(diagram) {
      handlePlane(diagram.plane);
    }

    function handlePlane(plane) {
      registerDi(plane);

      forEach(plane.planeElement, handlePlaneElement);
    }

    function handlePlaneElement(planeElement) {
      registerDi(planeElement);
    }


    // Semantic handling //////////////////////

    /**
     * Handle definitions and return the rendered diagram (if any).
     *
     * @param {ModdleElement} definitions to walk and import
     * @param {ModdleElement} [diagram] specific diagram to import and display
     *
     * @throws {Error} if no diagram to display could be found
     */
    this.handleDefinitions = function handleDefinitions(definitions, diagram) {

      // make sure we walk the correct bpmnElement

      var diagrams = definitions.diagrams;

      if (diagram && diagrams.indexOf(diagram) === -1) {
        throw new Error('diagram not part of <bpmn:Definitions />');
      }

      if (!diagram && diagrams && diagrams.length) {
        diagram = diagrams[0];
      }

      // no diagram -> nothing to import
      if (!diagram) {
        throw new Error('no diagram to display');
      }

      // load DI from selected diagram only
      diMap = {};
      handleDiagram(diagram);


      var plane = diagram.plane;

      if (!plane) {
        throw new Error(
          `no plane for ${ elementToString(diagram) }`
        );
      }

      var rootElement = plane.bpmnElement;

      // ensure we default to a suitable display candidate (process or collaboration),
      // even if non is specified in DI
      if (!rootElement) {
        rootElement = findDisplayCandidate(definitions);

        if (!rootElement) {
          throw new Error('no process or collaboration to display');
        } else {

          logError(
            `correcting missing bpmnElement on ${ elementToString(plane) } to ${ elementToString(rootElement) }`
          );

          // correct DI on the fly
          plane.bpmnElement = rootElement;
          registerDi(plane);
        }
      }


      var ctx = visitRoot(rootElement, plane);

      if (is(rootElement, 'bpmn:Process') || is(rootElement, 'bpmn:SubProcess')) {
        handleProcess(rootElement, ctx);
      } else if (is(rootElement, 'bpmn:Collaboration')) {
        handleCollaboration(rootElement, ctx);

        // force drawing of everything not yet drawn that is part of the target DI
        handleUnhandledProcesses(definitions.rootElements, ctx);
      } else {
        throw new Error(
          `unsupported bpmnElement for ${ elementToString(plane) }: ${ elementToString(rootElement) }`
        );
      }

      // handle all deferred elements
      handleDeferred(deferred);
    };

    var handleDeferred = this.handleDeferred = function handleDeferred() {

      var fn;

      // drain deferred until empty
      while (deferred.length) {
        fn = deferred.shift();

        fn();
      }
    };

    function handleProcess(process, context) {
      handleFlowElementsContainer(process, context);
      handleIoSpecification(process.ioSpecification, context);

      handleArtifacts(process.artifacts, context);

      // log process handled
      handled(process);
    }

    function handleUnhandledProcesses(rootElements, ctx) {

      // walk through all processes that have not yet been drawn and draw them
      // if they contain lanes with DI information.
      // we do this to pass the free-floating lane test cases in the MIWG test suite
      var processes = filter(rootElements, function(e) {
        return !isHandled(e) && is(e, 'bpmn:Process') && e.laneSets;
      });

      processes.forEach(contextual(handleProcess, ctx));
    }

    function handleMessageFlow(messageFlow, context) {
      visitIfDi(messageFlow, context);
    }

    function handleMessageFlows(messageFlows, context) {
      forEach(messageFlows, contextual(handleMessageFlow, context));
    }

    function handleDataAssociation(association, context) {
      visitIfDi(association, context);
    }

    function handleDataInput(dataInput, context) {
      visitIfDi(dataInput, context);
    }

    function handleDataOutput(dataOutput, context) {
      visitIfDi(dataOutput, context);
    }

    function handleArtifact(artifact, context) {

      // bpmn:TextAnnotation
      // bpmn:Group
      // bpmn:Association

      visitIfDi(artifact, context);
    }

    function handleArtifacts(artifacts, context) {

      forEach(artifacts, function(e) {
        if (is(e, 'bpmn:Association')) {
          deferred.push(function() {
            handleArtifact(e, context);
          });
        } else {
          handleArtifact(e, context);
        }
      });
    }

    function handleIoSpecification(ioSpecification, context) {

      if (!ioSpecification) {
        return;
      }

      forEach(ioSpecification.dataInputs, contextual(handleDataInput, context));
      forEach(ioSpecification.dataOutputs, contextual(handleDataOutput, context));
    }

    var handleSubProcess = this.handleSubProcess = function handleSubProcess(subProcess, context) {
      handleFlowElementsContainer(subProcess, context);
      handleArtifacts(subProcess.artifacts, context);
    };

    function handleFlowNode(flowNode, context) {
      var childCtx = visitIfDi(flowNode, context);

      if (is(flowNode, 'bpmn:SubProcess')) {
        handleSubProcess(flowNode, childCtx || context);
      }

      if (is(flowNode, 'bpmn:Activity')) {
        handleIoSpecification(flowNode.ioSpecification, context);
      }

      // defer handling of associations
      // affected types:
      //
      //   * bpmn:Activity
      //   * bpmn:ThrowEvent
      //   * bpmn:CatchEvent
      //
      deferred.push(function() {
        forEach(flowNode.dataInputAssociations, contextual(handleDataAssociation, context));
        forEach(flowNode.dataOutputAssociations, contextual(handleDataAssociation, context));
      });
    }

    function handleSequenceFlow(sequenceFlow, context) {
      visitIfDi(sequenceFlow, context);
    }

    function handleDataElement(dataObject, context) {
      visitIfDi(dataObject, context);
    }

    function handleLane(lane, context) {

      deferred.push(function() {

        var newContext = visitIfDi(lane, context);

        if (lane.childLaneSet) {
          handleLaneSet(lane.childLaneSet, newContext || context);
        }

        wireFlowNodeRefs(lane);
      });
    }

    function handleLaneSet(laneSet, context) {
      forEach(laneSet.lanes, contextual(handleLane, context));
    }

    function handleLaneSets(laneSets, context) {
      forEach(laneSets, contextual(handleLaneSet, context));
    }

    function handleFlowElementsContainer(container, context) {
      handleFlowElements(container.flowElements, context);

      if (container.laneSets) {
        handleLaneSets(container.laneSets, context);
      }
    }

    function handleFlowElements(flowElements, context) {
      forEach(flowElements, function(flowElement) {
        if (is(flowElement, 'bpmn:SequenceFlow')) {
          deferred.push(function() {
            handleSequenceFlow(flowElement, context);
          });
        } else if (is(flowElement, 'bpmn:BoundaryEvent')) {
          deferred.unshift(function() {
            handleFlowNode(flowElement, context);
          });
        } else if (is(flowElement, 'bpmn:FlowNode')) {
          handleFlowNode(flowElement, context);
        } else if (is(flowElement, 'bpmn:DataObject')) ; else if (is(flowElement, 'bpmn:DataStoreReference')) {
          handleDataElement(flowElement, context);
        } else if (is(flowElement, 'bpmn:DataObjectReference')) {
          handleDataElement(flowElement, context);
        } else {
          logError(
            `unrecognized flowElement ${ elementToString(flowElement) } in context ${ elementToString(context && context.businessObject) }`,
            {
              element: flowElement,
              context
            }
          );
        }
      });
    }

    function handleParticipant(participant, context) {
      var newCtx = visitIfDi(participant, context);

      var process = participant.processRef;
      if (process) {
        handleProcess(process, newCtx || context);
      }
    }

    function handleCollaboration(collaboration, context) {

      forEach(collaboration.participants, contextual(handleParticipant, context));

      deferred.push(function() {
        handleMessageFlows(collaboration.messageFlows, context);
      });

      handleArtifacts(collaboration.artifacts, context);
    }


    function wireFlowNodeRefs(lane) {

      // wire the virtual flowNodeRefs <-> relationship
      forEach(lane.flowNodeRef, function(flowNode) {
        var lanes = flowNode.get('lanes');

        if (lanes) {
          lanes.push(lane);
        }
      });
    }
  }

  /**
   * @typedef {import('../model/Types').ModdleElement} ModdleElement
   *
   * @typedef { {
   *   warnings: string[];
   * } } ImportBPMNDiagramResult
   *
   * @typedef {ImportBPMNDiagramResult & Error} ImportBPMNDiagramError
   */

  /**
   * Import the definitions into a diagram.
   *
   * Errors and warnings are reported through the specified callback.
   *
   * @param {ModdleElement} diagram
   * @param {ModdleElement} definitions
   * @param {ModdleElement} [bpmnDiagram] The diagram to be rendered (if not
   * provided, the first one will be rendered).
   *
   * @return {Promise<ImportBPMNDiagramResult>}
   */
  function importBpmnDiagram(diagram, definitions, bpmnDiagram) {

    var importer,
        eventBus,
        canvas;

    var error,
        warnings = [];

    /**
     * Walk the diagram semantically, importing (=drawing)
     * all elements you encounter.
     *
     * @param {ModdleElement} definitions
     * @param {ModdleElement} bpmnDiagram
     */
    function render(definitions, bpmnDiagram) {

      var visitor = {

        root: function(element, di) {
          return importer.add(element, di);
        },

        element: function(element, di, parentShape) {
          return importer.add(element, di, parentShape);
        },

        error: function(message, context) {
          warnings.push({ message: message, context: context });
        }
      };

      var walker = new BpmnTreeWalker(visitor);


      bpmnDiagram = bpmnDiagram || (definitions.diagrams && definitions.diagrams[0]);

      var diagramsToImport = getDiagramsToImport(definitions, bpmnDiagram);

      if (!diagramsToImport) {
        throw new Error('no diagram to display');
      }

      // traverse BPMN 2.0 document model,
      // starting at definitions
      forEach(diagramsToImport, function(diagram) {
        walker.handleDefinitions(definitions, diagram);
      });

      var rootId = bpmnDiagram.plane.bpmnElement.id;

      // we do need to account for different ways we create root elements
      // each nested imported <root> do have the `_plane` suffix, while
      // the root <root> is found under the business object ID
      canvas.setRootElement(
        canvas.findRoot(rootId + '_plane') || canvas.findRoot(rootId)
      );
    }

    return new Promise(function(resolve, reject) {
      try {
        importer = diagram.get('bpmnImporter');
        eventBus = diagram.get('eventBus');
        canvas = diagram.get('canvas');

        eventBus.fire('import.render.start', { definitions: definitions });

        render(definitions, bpmnDiagram);

        eventBus.fire('import.render.complete', {
          error: error,
          warnings: warnings
        });

        return resolve({ warnings: warnings });
      } catch (e) {

        e.warnings = warnings;
        return reject(e);
      }
    });
  }

  /**
   * Returns all diagrams in the same hierarchy as the requested diagram.
   * Includes all parent and sub process diagrams.
   *
   * @param {ModdleElement} definitions
   * @param {ModdleElement} bpmnDiagram
   *
   * @return {ModdleElement[]}
   */
  function getDiagramsToImport(definitions, bpmnDiagram) {
    if (!bpmnDiagram || !bpmnDiagram.plane) {
      return;
    }

    var bpmnElement = bpmnDiagram.plane.bpmnElement,
        rootElement = bpmnElement;

    if (!is$1(bpmnElement, 'bpmn:Process') && !is$1(bpmnElement, 'bpmn:Collaboration')) {
      rootElement = findRootProcess(bpmnElement);
    }

    // in case the process is part of a collaboration, the plane references the
    // collaboration, not the process
    var collaboration;

    if (is$1(rootElement, 'bpmn:Collaboration')) {
      collaboration = rootElement;
    } else {
      collaboration = find(definitions.rootElements, function(element) {
        if (!is$1(element, 'bpmn:Collaboration')) {
          return;
        }

        return find(element.participants, function(participant) {
          return participant.processRef === rootElement;
        });
      });
    }

    var rootElements = [ rootElement ];

    // all collaboration processes can contain sub-diagrams
    if (collaboration) {
      rootElements = map(collaboration.participants, function(participant) {
        return participant.processRef;
      });

      rootElements.push(collaboration);
    }

    var allChildren = selfAndAllFlowElements(rootElements);

    // if we have multiple diagrams referencing the same element, we
    // use the first in the file
    var diagramsToImport = [ bpmnDiagram ];
    var handledElements = [ bpmnElement ];

    forEach(definitions.diagrams, function(diagram) {

      if (!diagram.plane) {
        return;
      }

      var businessObject = diagram.plane.bpmnElement;

      if (
        allChildren.indexOf(businessObject) !== -1 &&
        handledElements.indexOf(businessObject) === -1
      ) {
        diagramsToImport.push(diagram);
        handledElements.push(businessObject);
      }
    });


    return diagramsToImport;
  }

  function selfAndAllFlowElements(elements) {
    var result = [];

    forEach(elements, function(element) {
      if (!element) {
        return;
      }

      result.push(element);

      result = result.concat(selfAndAllFlowElements(element.flowElements));
    });

    return result;
  }

  function findRootProcess(element) {
    var parent = element;

    while (parent) {
      if (is$1(parent, 'bpmn:Process')) {
        return parent;
      }

      parent = parent.$parent;
    }
  }

  /**
   * This file must not be changed or exchanged.
   *
   * @see http://bpmn.io/license for more information.
   */



  // inlined ../../resources/logo.svg
  var BPMNIO_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.02 5.57" width="53" height="21"><path fill="currentColor" d="M1.88.92v.14c0 .41-.13.68-.4.8.33.14.46.44.46.86v.33c0 .61-.33.95-.95.95H0V0h.95c.65 0 .93.3.93.92zM.63.57v1.06h.24c.24 0 .38-.1.38-.43V.98c0-.28-.1-.4-.32-.4zm0 1.63v1.22h.36c.2 0 .32-.1.32-.39v-.35c0-.37-.12-.48-.4-.48H.63zM4.18.99v.52c0 .64-.31.98-.94.98h-.3V4h-.62V0h.92c.63 0 .94.35.94.99zM2.94.57v1.35h.3c.2 0 .3-.09.3-.37v-.6c0-.29-.1-.38-.3-.38h-.3zm2.89 2.27L6.25 0h.88v4h-.6V1.12L6.1 3.99h-.6l-.46-2.82v2.82h-.55V0h.87zM8.14 1.1V4h-.56V0h.79L9 2.4V0h.56v4h-.64zm2.49 2.29v.6h-.6v-.6zM12.12 1c0-.63.33-1 .95-1 .61 0 .95.37.95 1v2.04c0 .64-.34 1-.95 1-.62 0-.95-.37-.95-1zm.62 2.08c0 .28.13.39.33.39s.32-.1.32-.4V.98c0-.29-.12-.4-.32-.4s-.33.11-.33.4z"/><path fill="currentColor" d="M0 4.53h14.02v1.04H0zM11.08 0h.63v.62h-.63zm.63 4V1h-.63v2.98z"/></svg>';

  var BPMNIO_IMG = BPMNIO_LOGO_SVG;

  var LOGO_STYLES = {
    verticalAlign: 'middle'
  };

  var LINK_STYLES = {
    'color': '#404040'
  };

  var LIGHTBOX_STYLES = {
    'zIndex': '1001',
    'position': 'fixed',
    'top': '0',
    'left': '0',
    'right': '0',
    'bottom': '0'
  };

  var BACKDROP_STYLES = {
    'width': '100%',
    'height': '100%',
    'background': 'rgba(40,40,40,0.2)'
  };

  var NOTICE_STYLES = {
    'position': 'absolute',
    'left': '50%',
    'top': '40%',
    'transform': 'translate(-50%)',
    'width': '260px',
    'padding': '10px',
    'background': 'white',
    'boxShadow': '0 1px 4px rgba(0,0,0,0.3)',
    'fontFamily': 'Helvetica, Arial, sans-serif',
    'fontSize': '14px',
    'display': 'flex',
    'lineHeight': '1.3'
  };

  var LIGHTBOX_MARKUP =
    '<div class="bjs-powered-by-lightbox">' +
      '<div class="backdrop"></div>' +
      '<div class="notice">' +
        '<a href="https://bpmn.io" target="_blank" rel="noopener" class="link">' +
          BPMNIO_IMG +
        '</a>' +
        '<span>' +
          'Web-based tooling for BPMN, DMN and forms ' +
          'powered by <a href="https://bpmn.io" target="_blank" rel="noopener">bpmn.io</a>.' +
        '</span>' +
      '</div>' +
    '</div>';


  var lightbox;

  function createLightbox() {
    lightbox = domify(LIGHTBOX_MARKUP);

    assign(lightbox, LIGHTBOX_STYLES);
    assign(query('svg', lightbox), LOGO_STYLES);
    assign(query('.backdrop', lightbox), BACKDROP_STYLES);
    assign(query('.notice', lightbox), NOTICE_STYLES);
    assign(query('.link', lightbox), LINK_STYLES, {
      'margin': '15px 20px 15px 10px',
      'alignSelf': 'center'
    });
  }

  function open() {

    if (!lightbox) {
      createLightbox();

      delegate.bind(lightbox, '.backdrop', 'click', function(event) {
        document.body.removeChild(lightbox);
      });
    }

    document.body.appendChild(lightbox);
  }

  /**
   * The code in the <project-logo></project-logo> area
   * must not be changed.
   *
   * @see http://bpmn.io/license for more information.
   */

  /**
   * @template T
   *
   * @typedef { import('diagram-js/lib/core/EventBus').default<T> } EventBus
   */

  /**
   * @template T
   *
   * @typedef {import('diagram-js/lib/core/EventBus').EventBusEventCallback<T>} EventBusEventCallback
   */

  /**
   * @typedef {import('didi').ModuleDeclaration} ModuleDeclaration
   *
   * @typedef {import('./model/Types').Moddle} Moddle
   * @typedef {import('./model/Types').ModdleElement} ModdleElement
   * @typedef {import('./model/Types').ModdleExtension} ModdleExtension
   *
   * @typedef { {
   *   width?: number|string;
   *   height?: number|string;
   *   position?: string;
   *   container?: string|HTMLElement;
   *   moddleExtensions?: ModdleExtensions;
   *   additionalModules?: ModuleDeclaration[];
   * } & Record<string, any> } BaseViewerOptions
   *
   * @typedef {Record<string, ModdleElement>} ModdleElementsById
   *
   * @typedef { {
   *   [key: string]: ModdleExtension;
   * } } ModdleExtensions
   *
   * @typedef { {
   *   warnings: string[];
   * } } ImportXMLResult
   *
   * @typedef {ImportXMLResult & Error} ImportXMLError
   *
   * @typedef {ImportXMLResult} ImportDefinitionsResult
   *
   * @typedef {ImportXMLError} ImportDefinitionsError
   *
   * @typedef {ImportXMLResult} OpenResult
   *
   * @typedef {ImportXMLError} OpenError
   *
   * @typedef { {
   *   format?: boolean;
   *   preamble?: boolean;
   * } } SaveXMLOptions
   *
   * @typedef { {
   *   xml?: string;
   *   error?: Error;
   * } } SaveXMLResult
   *
   * @typedef { {
   *   svg: string;
   * } } SaveSVGResult
   *
   * @typedef { {
   *   xml: string;
   * } } ImportParseStartEvent
   *
   * @typedef { {
   *   error?: ImportXMLError;
   *   definitions?: ModdleElement;
   *   elementsById?: ModdleElementsById;
   *   references?: ModdleElement[];
   *   warnings: string[];
   * } } ImportParseCompleteEvent
   *
   * @typedef { {
   *   error?: ImportXMLError;
   *   warnings: string[];
   * } } ImportDoneEvent
   *
   * @typedef { {
   *   definitions: ModdleElement;
   * } } SaveXMLStartEvent
   *
   * @typedef {SaveXMLResult} SaveXMLDoneEvent
   *
   * @typedef { {
   *   error?: Error;
   *   svg: string;
   * } } SaveSVGDoneEvent
   */

  /**
   * @template Type
   *
   * @typedef { Type extends { eventBus: EventBus<infer X> } ? X : never } EventMap
   */

  /**
   * A base viewer for BPMN 2.0 diagrams.
   *
   * Have a look at {@link bpmn-js/lib/Viewer}, {@link bpmn-js/lib/NavigatedViewer} or {@link bpmn-js/lib/Modeler} for
   * bundles that include actual features.
   *
   * @template [ServiceMap=null]
   *
   * @extends Diagram<ServiceMap>
   *
   * @param {BaseViewerOptions} [options] The options to configure the viewer.
   */
  function BaseViewer(options) {

    /**
     * @type {BaseViewerOptions}
     */
    options = assign$1({}, DEFAULT_OPTIONS, options);

    /**
     * @type {Moddle}
     */
    this._moddle = this._createModdle(options);

    /**
     * @type {HTMLElement}
     */
    this._container = this._createContainer(options);

    this._init(this._container, this._moddle, options);

    /* <project-logo> */

    addProjectLogo(this._container);

    /* </project-logo> */
  }

  e(BaseViewer, Diagram);

  /**
   * Parse and render a BPMN 2.0 diagram.
   *
   * Once finished the viewer reports back the result to the
   * provided callback function with (err, warnings).
   *
   * ## Life-Cycle Events
   *
   * During import the viewer will fire life-cycle events:
   *
   *   * import.parse.start (about to read model from XML)
   *   * import.parse.complete (model read; may have worked or not)
   *   * import.render.start (graphical import start)
   *   * import.render.complete (graphical import finished)
   *   * import.done (everything done)
   *
   * You can use these events to hook into the life-cycle.
   *
   * @throws {ImportXMLError} An error thrown during the import of the XML.
   *
   * @fires BaseViewer#ImportParseStartEvent
   * @fires BaseViewer#ImportParseCompleteEvent
   * @fires Importer#ImportRenderStartEvent
   * @fires Importer#ImportRenderCompleteEvent
   * @fires BaseViewer#ImportDoneEvent
   *
   * @param {string} xml The BPMN 2.0 XML to be imported.
   * @param {ModdleElement|string} [bpmnDiagram] The optional diagram or Id of the BPMN diagram to open.
   *
   * @return {Promise<ImportXMLResult>} A promise resolving with warnings that were produced during the import.
   */
  BaseViewer.prototype.importXML = async function importXML(xml, bpmnDiagram) {

    const self = this;

    function ParseCompleteEvent(data) {
      return self.get('eventBus').createEvent(data);
    }

    let aggregatedWarnings = [];
    try {

      // hook in pre-parse listeners +
      // allow xml manipulation

      /**
       * A `import.parse.start` event.
       *
       * @event BaseViewer#ImportParseStartEvent
       * @type {ImportParseStartEvent}
       */
      xml = this._emit('import.parse.start', { xml: xml }) || xml;

      let parseResult;
      try {
        parseResult = await this._moddle.fromXML(xml, 'bpmn:Definitions');
      } catch (error) {
        this._emit('import.parse.complete', {
          error
        });

        throw error;
      }

      let definitions = parseResult.rootElement;
      const references = parseResult.references;
      const parseWarnings = parseResult.warnings;
      const elementsById = parseResult.elementsById;

      aggregatedWarnings = aggregatedWarnings.concat(parseWarnings);

      // hook in post parse listeners +
      // allow definitions manipulation

      /**
       * A `import.parse.complete` event.
       *
       * @event BaseViewer#ImportParseCompleteEvent
       * @type {ImportParseCompleteEvent}
       */
      definitions = this._emit('import.parse.complete', ParseCompleteEvent({
        error: null,
        definitions: definitions,
        elementsById: elementsById,
        references: references,
        warnings: aggregatedWarnings
      })) || definitions;

      const importResult = await this.importDefinitions(definitions, bpmnDiagram);

      aggregatedWarnings = aggregatedWarnings.concat(importResult.warnings);

      /**
       * A `import.parse.complete` event.
       *
       * @event BaseViewer#ImportDoneEvent
       * @type {ImportDoneEvent}
       */
      this._emit('import.done', { error: null, warnings: aggregatedWarnings });

      return { warnings: aggregatedWarnings };
    } catch (err) {
      let error = err;
      aggregatedWarnings = aggregatedWarnings.concat(error.warnings || []);
      addWarningsToError(error, aggregatedWarnings);

      error = checkValidationError(error);

      this._emit('import.done', { error, warnings: error.warnings });

      throw error;
    }
  };


  /**
   * Import parsed definitions and render a BPMN 2.0 diagram.
   *
   * Once finished the viewer reports back the result to the
   * provided callback function with (err, warnings).
   *
   * ## Life-Cycle Events
   *
   * During import the viewer will fire life-cycle events:
   *
   *   * import.render.start (graphical import start)
   *   * import.render.complete (graphical import finished)
   *
   * You can use these events to hook into the life-cycle.
   *
   * @throws {ImportDefinitionsError} An error thrown during the import of the definitions.
   *
   * @param {ModdleElement} definitions The definitions.
   * @param {ModdleElement|string} [bpmnDiagram] The optional diagram or ID of the BPMN diagram to open.
   *
   * @return {Promise<ImportDefinitionsResult>} A promise resolving with warnings that were produced during the import.
   */
  BaseViewer.prototype.importDefinitions = async function importDefinitions(definitions, bpmnDiagram) {
    this._setDefinitions(definitions);
    const result = await this.open(bpmnDiagram);

    return { warnings: result.warnings };
  };


  /**
   * Open diagram of previously imported XML.
   *
   * Once finished the viewer reports back the result to the
   * provided callback function with (err, warnings).
   *
   * ## Life-Cycle Events
   *
   * During switch the viewer will fire life-cycle events:
   *
   *   * import.render.start (graphical import start)
   *   * import.render.complete (graphical import finished)
   *
   * You can use these events to hook into the life-cycle.
   *
   * @throws {OpenError} An error thrown during opening.
   *
   * @param {ModdleElement|string} bpmnDiagramOrId The diagram or Id of the BPMN diagram to open.
   *
   * @return {Promise<OpenResult>} A promise resolving with warnings that were produced during opening.
   */
  BaseViewer.prototype.open = async function open(bpmnDiagramOrId) {

    const definitions = this._definitions;
    let bpmnDiagram = bpmnDiagramOrId;

    if (!definitions) {
      const error = new Error('no XML imported');
      addWarningsToError(error, []);

      throw error;
    }

    if (typeof bpmnDiagramOrId === 'string') {
      bpmnDiagram = findBPMNDiagram(definitions, bpmnDiagramOrId);

      if (!bpmnDiagram) {
        const error = new Error('BPMNDiagram <' + bpmnDiagramOrId + '> not found');
        addWarningsToError(error, []);

        throw error;
      }
    }

    // clear existing rendered diagram
    // catch synchronous exceptions during #clear()
    try {
      this.clear();
    } catch (error) {
      addWarningsToError(error, []);

      throw error;
    }

    // perform graphical import
    const { warnings } = await importBpmnDiagram(this, definitions, bpmnDiagram);

    return { warnings };
  };

  /**
   * Export the currently displayed BPMN 2.0 diagram as
   * a BPMN 2.0 XML document.
   *
   * ## Life-Cycle Events
   *
   * During XML saving the viewer will fire life-cycle events:
   *
   *   * saveXML.start (before serialization)
   *   * saveXML.serialized (after xml generation)
   *   * saveXML.done (everything done)
   *
   * You can use these events to hook into the life-cycle.
   *
   * @throws {Error} An error thrown during export.
   *
   * @fires BaseViewer#SaveXMLStart
   * @fires BaseViewer#SaveXMLDone
   *
   * @param {SaveXMLOptions} [options] The options.
   *
   * @return {Promise<SaveXMLResult>} A promise resolving with the XML.
   */
  BaseViewer.prototype.saveXML = async function saveXML(options) {

    options = options || {};

    let definitions = this._definitions,
        error, xml;

    try {
      if (!definitions) {
        throw new Error('no definitions loaded');
      }

      // allow to fiddle around with definitions

      /**
       * A `saveXML.start` event.
       *
       * @event BaseViewer#SaveXMLStartEvent
       * @type {SaveXMLStartEvent}
       */
      definitions = this._emit('saveXML.start', {
        definitions
      }) || definitions;

      const result = await this._moddle.toXML(definitions, options);
      xml = result.xml;

      xml = this._emit('saveXML.serialized', {
        xml
      }) || xml;
    } catch (err) {
      error = err;
    }

    const result = error ? { error } : { xml };

    /**
     * A `saveXML.done` event.
     *
     * @event BaseViewer#SaveXMLDoneEvent
     * @type {SaveXMLDoneEvent}
     */
    this._emit('saveXML.done', result);

    if (error) {
      throw error;
    }

    return result;
  };


  /**
   * Export the currently displayed BPMN 2.0 diagram as
   * an SVG image.
   *
   * ## Life-Cycle Events
   *
   * During SVG saving the viewer will fire life-cycle events:
   *
   *   * saveSVG.start (before serialization)
   *   * saveSVG.done (everything done)
   *
   * You can use these events to hook into the life-cycle.
   *
   * @throws {Error} An error thrown during export.
   *
   * @fires BaseViewer#SaveSVGDone
   *
   * @return {Promise<SaveSVGResult>} A promise resolving with the SVG.
   */
  BaseViewer.prototype.saveSVG = async function saveSVG() {
    this._emit('saveSVG.start');

    let svg, err;

    try {
      const canvas = this.get('canvas');

      const contentNode = canvas.getActiveLayer(),
            defsNode = query(':scope > defs', canvas._svg);

      const contents = innerSVG(contentNode),
            defs = defsNode ? '<defs>' + innerSVG(defsNode) + '</defs>' : '';

      const bbox = contentNode.getBBox();

      svg =
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<!-- created with bpmn-js / http://bpmn.io -->\n' +
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
        'width="' + bbox.width + '" height="' + bbox.height + '" ' +
        'viewBox="' + bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height + '" version="1.1">' +
        defs + contents +
        '</svg>';
    } catch (e) {
      err = e;
    }

    /**
     * A `saveSVG.done` event.
     *
     * @event BaseViewer#SaveSVGDoneEvent
     * @type {SaveSVGDoneEvent}
     */
    this._emit('saveSVG.done', {
      error: err,
      svg: svg
    });

    if (err) {
      throw err;
    }

    return { svg };
  };

  BaseViewer.prototype._setDefinitions = function(definitions) {
    this._definitions = definitions;
  };

  /**
   * Return modules to instantiate with.
   *
   * @return {ModuleDeclaration[]} The modules.
   */
  BaseViewer.prototype.getModules = function() {
    return this._modules;
  };

  /**
   * Remove all drawn elements from the viewer.
   *
   * After calling this method the viewer can still be reused for opening another
   * diagram.
   */
  BaseViewer.prototype.clear = function() {
    if (!this.getDefinitions()) {

      // no diagram to clear
      return;
    }

    // remove drawn elements
    Diagram.prototype.clear.call(this);
  };

  /**
   * Destroy the viewer instance and remove all its remainders from the document
   * tree.
   */
  BaseViewer.prototype.destroy = function() {

    // diagram destroy
    Diagram.prototype.destroy.call(this);

    // dom detach
    remove$1(this._container);
  };

  /**
   * @overlord
   *
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to {@link EventBus#fire}.
   *
   * Returning false from a listener will prevent the events default action
   * (if any is specified). To stop an event from being processed further in
   * other listeners execute {@link Event#stopPropagation}.
   *
   * Returning anything but `undefined` from a listener will stop the listener propagation.
   *
   * @template {keyof EventMap<ServiceMap>} EventName
   *
   * @param {EventName} events to subscribe to
   * @param {number} [priority=1000] listen priority
   * @param {EventBusEventCallback<(EventMap<ServiceMap>)[EventName]>} callback
   * @param {any} [that] callback context
   */
  /**
   * @overlord
   *
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to {@link EventBus#fire}.
   *
   * Returning false from a listener will prevent the events default action
   * (if any is specified). To stop an event from being processed further in
   * other listeners execute {@link Event#stopPropagation}.
   *
   * Returning anything but `undefined` from a listener will stop the listener propagation.
   *
   * @template T
   *
   * @param {string|string[]} events The event(s) to listen to.
   * @param {number} [priority] The priority with which to listen.
   * @param {EventBusEventCallback<T>} callback The callback.
   * @param {any} [that] Value of `this` the callback will be called with.
   */
  /**
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to {@link EventBus#fire}.
   *
   * Returning false from a listener will prevent the events default action
   * (if any is specified). To stop an event from being processed further in
   * other listeners execute {@link Event#stopPropagation}.
   *
   * Returning anything but `undefined` from a listener will stop the listener propagation.
   *
   * @param {string|string[]} events The event(s) to listen to.
   * @param {number} [priority] The priority with which to listen.
   * @param {Function} callback The callback.
   * @param {any} [that] Value of `this` the callback will be called with.
   */
  BaseViewer.prototype.on = function(events, priority, callback, that) {
    return this.get('eventBus').on(events, priority, callback, that);
  };

  /**
   * Remove an event listener.
   *
   * @param {string|string[]} events The event(s).
   * @param {Function} [callback] The callback.
   */
  BaseViewer.prototype.off = function(events, callback) {
    this.get('eventBus').off(events, callback);
  };

  /**
   * Attach the viewer to an HTML element.
   *
   * @param {HTMLElement} parentNode The parent node to attach to.
   */
  BaseViewer.prototype.attachTo = function(parentNode) {

    if (!parentNode) {
      throw new Error('parentNode required');
    }

    // ensure we detach from the
    // previous, old parent
    this.detach();

    // unwrap jQuery if provided
    if (parentNode.get && parentNode.constructor.prototype.jquery) {
      parentNode = parentNode.get(0);
    }

    if (typeof parentNode === 'string') {
      parentNode = query(parentNode);
    }

    parentNode.appendChild(this._container);

    this._emit('attach', {});

    this.get('canvas').resized();
  };

  /**
   * Get the definitions model element.
   *
   * @return {ModdleElement} The definitions model element.
   */
  BaseViewer.prototype.getDefinitions = function() {
    return this._definitions;
  };

  /**
   * Detach the viewer.
   *
   * @fires BaseViewer#DetachEvent
   */
  BaseViewer.prototype.detach = function() {

    const container = this._container,
          parentNode = container.parentNode;

    if (!parentNode) {
      return;
    }

    /**
     * A `detach` event.
     *
     * @event BaseViewer#DetachEvent
     * @type {Object}
     */
    this._emit('detach', {});

    parentNode.removeChild(container);
  };

  BaseViewer.prototype._init = function(container, moddle, options) {

    const baseModules = options.modules || this.getModules(options),
          additionalModules = options.additionalModules || [],
          staticModules = [
            {
              bpmnjs: [ 'value', this ],
              moddle: [ 'value', moddle ]
            }
          ];

    const diagramModules = [].concat(staticModules, baseModules, additionalModules);

    const diagramOptions = assign$1(omit(options, [ 'additionalModules' ]), {
      canvas: assign$1({}, options.canvas, { container: container }),
      modules: diagramModules
    });

    // invoke diagram constructor
    Diagram.call(this, diagramOptions);

    if (options && options.container) {
      this.attachTo(options.container);
    }
  };

  /**
   * Emit an event on the underlying {@link EventBus}
   *
   * @param  {string} type
   * @param  {Object} event
   *
   * @return {Object} The return value after calling all event listeners.
   */
  BaseViewer.prototype._emit = function(type, event) {
    return this.get('eventBus').fire(type, event);
  };

  /**
   * @param {BaseViewerOptions} options
   *
   * @return {HTMLElement}
   */
  BaseViewer.prototype._createContainer = function(options) {

    const container = domify('<div class="bjs-container"></div>');

    assign(container, {
      width: ensureUnit(options.width),
      height: ensureUnit(options.height),
      position: options.position
    });

    return container;
  };

  /**
   * @param {BaseViewerOptions} options
   *
   * @return {Moddle}
   */
  BaseViewer.prototype._createModdle = function(options) {
    const moddleOptions = assign$1({}, this._moddleExtensions, options.moddleExtensions);

    return new SimpleBpmnModdle(moddleOptions);
  };

  BaseViewer.prototype._modules = [];

  // helpers ///////////////

  function addWarningsToError(err, warningsAry) {
    err.warnings = warningsAry;
    return err;
  }

  function checkValidationError(err) {

    // check if we can help the user by indicating wrong BPMN 2.0 xml
    // (in case he or the exporting tool did not get that right)

    const pattern = /unparsable content <([^>]+)> detected([\s\S]*)$/;
    const match = pattern.exec(err.message);

    if (match) {
      err.message =
        'unparsable content <' + match[1] + '> detected; ' +
        'this may indicate an invalid BPMN 2.0 diagram file' + match[2];
    }

    return err;
  }

  const DEFAULT_OPTIONS = {
    width: '100%',
    height: '100%',
    position: 'relative'
  };


  /**
   * Ensure the passed argument is a proper unit (defaulting to px)
   */
  function ensureUnit(val) {
    return val + (isNumber(val) ? 'px' : '');
  }


  /**
   * Find BPMNDiagram in definitions by ID
   *
   * @param {ModdleElement<Definitions>} definitions
   * @param {string} diagramId
   *
   * @return {ModdleElement<BPMNDiagram>|null}
   */
  function findBPMNDiagram(definitions, diagramId) {
    if (!diagramId) {
      return null;
    }

    return find(definitions.diagrams, function(element) {
      return element.id === diagramId;
    }) || null;
  }

  /**
   * Adds the project logo to the diagram container as
   * required by the bpmn.io license.
   *
   * @see http://bpmn.io/license
   *
   * @param {Element} container
   */
  function addProjectLogo(container) {
    const img = BPMNIO_IMG;

    const linkMarkup =
      '<a href="http://bpmn.io" ' +
      'target="_blank" ' +
      'class="bjs-powered-by" ' +
      'title="Powered by bpmn.io" ' +
      '>' +
      img +
      '</a>';

    const linkElement = domify(linkMarkup);

    assign(query('svg', linkElement), LOGO_STYLES);
    assign(linkElement, LINK_STYLES, {
      position: 'absolute',
      bottom: '15px',
      right: '15px',
      zIndex: '100'
    });

    container.appendChild(linkElement);

    event.bind(linkElement, 'click', function(event) {
      open();

      event.preventDefault();
    });
  }

  /* </project-logo> */

  /**
   * @typedef { import('./BaseViewer').BaseViewerOptions } BaseViewerOptions
   */

  /**
   * A viewer for BPMN 2.0 diagrams.
   *
   * Have a look at {@link bpmn-js/lib/NavigatedViewer} or {@link bpmn-js/lib/Modeler} for bundles that include
   * additional features.
   *
   *
   * ## Extending the Viewer
   *
   * In order to extend the viewer pass extension modules to bootstrap via the
   * `additionalModules` option. An extension module is an object that exposes
   * named services.
   *
   * The following example depicts the integration of a simple
   * logging component that integrates with interaction events:
   *
   *
   * ```javascript
   *
   * // logging component
   * function InteractionLogger(eventBus) {
   *   eventBus.on('element.hover', function(event) {
   *     console.log()
   *   })
   * }
   *
   * InteractionLogger.$inject = [ 'eventBus' ]; // minification save
   *
   * // extension module
   * var extensionModule = {
   *   __init__: [ 'interactionLogger' ],
   *   interactionLogger: [ 'type', InteractionLogger ]
   * };
   *
   * // extend the viewer
   * var bpmnViewer = new Viewer({ additionalModules: [ extensionModule ] });
   * bpmnViewer.importXML(...);
   * ```
   *
   * @template [ServiceMap=null]
   *
   * @extends BaseViewer<ServiceMap>
   *
   * @param {BaseViewerOptions} [options] The options to configure the viewer.
   */
  function Viewer(options) {
    BaseViewer.call(this, options);
  }

  e(Viewer, BaseViewer);

  // modules the viewer is composed of
  Viewer.prototype._modules = [
    CoreModule$1,
    DrilldownModdule,
    OverlaysModule,
    SelectionModule,
    TranslateModule
  ];

  // default moddle extensions the viewer is composed of
  Viewer.prototype._moddleExtensions = {};

  return Viewer;

}));
