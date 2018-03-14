var isObject = require('min-dash').isObject;
var forEach = require('min-dash').forEach;

module.exports = function merge(target) {
  var sources = [].slice.call(arguments, 1);
  if (!sources.length) return target;
  var source = sources.shift();

  if (isObject(target) && isObject(source)) {
    forEach(source, function(val, key) {
      if (isObject(val) && isObject(target[key])) {
        merge(target[key], val);
      } else {
        target[key] = val;
      }
    });
  }

  return merge.apply(this, [target].concat(sources));
};