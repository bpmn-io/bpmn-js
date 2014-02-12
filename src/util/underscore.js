var util = require('util');

var toString = Object.prototype.toString;

/**
 * Utilities taken from AngularJS v1.2.1 | MIT
 */

/**
 * @name modeler.util.forEach
 * @function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key)`, where `value`
 * is the value of an object property or an array element and `key` is the object property key or
 * array element index. Specifying a `context` for the function is optional.
 *
   <pre>
     var values = {name: 'misko', gender: 'male'};
     var log = [];
     util.forEach(values, function(value, key){
       this.push(key + ': ' + value);
     }, log);
     expect(log).toEqual(['name: misko', 'gender:male']);
   </pre>
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */
function forEach(obj, iterator, context) {
  var key;
  if (obj) {
    if (isFunction(obj)){
      for (key in obj) {
        if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
      obj.forEach(iterator, context);
    } else if (isArrayLike(obj)) {
      for (key = 0; key < obj.length; key++)
        iterator.call(context, obj[key], key);
    } else {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key);
        }
      }
    }
  }
  return obj;
}


/**
 * @name modeler.util.extend
 * @function
 *
 * @description
 * Extends the destination object `dst` by copying all of the properties from the `src` object(s)
 * to `dst`. You can specify multiple `src` objects.
 *
 * @param {Object} dst Destination object.
 * @param {...Object} src Source object(s).
 * @returns {Object} Reference to `dst`.
 */
function extend(dst) {
  forEach(arguments, function(obj){
    if (obj !== dst) {
      forEach(obj, function(value, key){
        dst[key] = value;
      });
    }
  });

  return dst;
}


/**
 * @name modeler.util.noop
 * @function
 *
 * @description
 * A function that performs no operations. This function can be useful when writing code in the
 * functional style.
   <pre>
     function foo(callback) {
       var result = calculateResult();
       (callback || util.noop)(result);
     }
   </pre>
 */
function noop() {}
noop.$inject = [];


/**
 * @name modeler.util.identity
 * @function
 *
 * @description
 * A function that returns its first argument. This function is useful when writing code in the
 * functional style.
 *
   <pre>
     function transformer(transformationFn, value) {
       return (transformationFn || util.identity)(value);
     };
   </pre>
 */
function identity($) {return $;}
identity.$inject = [];


function valueFn(value) {return function() {return value;};}


/**
 * @name modeler.util.isUndefined
 * @function
 *
 * @description
 * Determines if a reference is undefined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is undefined.
 */
function isUndefined(value){return typeof value == 'undefined';}


/**
 * @name modeler.util.isDefined
 * @function
 *
 * @description
 * Determines if a reference is defined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is defined.
 */
function isDefined(value){return typeof value != 'undefined';}


/**
 * @name modeler.util.isObject
 * @function
 *
 * @description
 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
 * considered to be objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 */
function isObject(value){return value != null && typeof value == 'object';}


/**
 * @name modeler.util.isString
 * @function
 *
 * @description
 * Determines if a reference is a `String`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `String`.
 */
function isString(value){return typeof value == 'string';}


/**
 * @name modeler.util.isNumber
 * @function
 *
 * @description
 * Determines if a reference is a `Number`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Number`.
 */
function isNumber(value){return typeof value == 'number';}


/**
 * @name modeler.util.isDate
 * @function
 *
 * @description
 * Determines if a value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
function isDate(value){
  return toString.apply(value) == '[object Date]';
}


/**
 * @name modeler.util.isArray
 * @function
 *
 * @description
 * Determines if a reference is an `Array`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
function isArray(value) {
  return toString.apply(value) == '[object Array]';
}


/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj) {
  if (obj == null) {
    return false;
  }

  var length = obj.length;

  if (obj.nodeType === 1 && length) {
    return true;
  }

  return isString(obj) || isArray(obj) || length === 0 ||
         typeof length === 'number' && length > 0 && (length - 1) in obj;
}


/**
 * @name modeler.util.isFunction
 * @function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value){return typeof value == 'function';}


/**
 * @name modeler.util.asyncFn
 *
 * Returns a function that executes asynchronously after it has been invoked
 *  
 * @param  {Function} fn to execute
 * @param  {Number} timeout (optional) delay until the fn is executed
 */
function asyncFn(fn, timeout) {
  return function() {
    var args = Array.prototype.slice.call(arguments),
        self = this;
    
    timeout = timeout || 0;
    setTimeout(function() {
      fn.apply(self, args);
    }, timeout);
  };
}


/**
 * @name modeler.util.async
 *
 * Asynchronously executes the given function
 * 
 * @param  {Function} fn to execute
 * @param  {Number} timeout (optional) delay until the fn is executed
 */
function async(fn, timeout) {
  var args = Array.prototype.slice.call(arguments),
      self = this;
  
  timeout = timeout || 0;
  setTimeout(function() {
    fn.apply(self, args);
  }, timeout);
}


/**
 * @name modeler.util.debounce
 *
 * Debounce a function call, making it callable multiple times
 * before it gets executed once when a timeout occures.
 * 
 * @param  {Function} fn that is being debounced
 * @param  {Number} timeout that has to elapse before fn is actually called
 * @return {Function} the debounced function
 */
function debounce(fn, timeout) {
  var timer;

  return function() {
    var args = Array.prototype.slice.call(arguments),
        self = this;
    
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(function() {
      timer = null;
      fn.apply(self, args);
    }, timeout);
  };
}


/**
 * module exports
 */
module.exports.extend = extend;
module.exports.inherits = util.inherits;
module.exports.forEach = forEach;
module.exports.isFunction = isFunction;
module.exports.isArray = isArray;
module.exports.isString = isString;
module.exports.isObject = isObject;
module.exports.async = async;
module.exports.asyncFn = asyncFn;
module.exports.debounce = debounce;