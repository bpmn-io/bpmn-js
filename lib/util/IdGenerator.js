function IdGenerator(prefix) {

  var current = 0;

  function next() {
    return (prefix || '') + current++;
  }

  return {
    next: next
  };
}

module.exports = IdGenerator;