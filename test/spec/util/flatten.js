module.exports = function(array) {
  return [].concat.apply([], array);
};