module.exports = {
  __init__: [ 'dropBehavior', 'appendBehavior' ],
  dropBehavior: [ 'type', require('./Drop') ],
  appendBehavior: [ 'type', require('./Append') ]
};