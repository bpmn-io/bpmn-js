module.exports = {
  __init__: [ 'appendBehavior', 'dropBehavior' ],
  appendBehavior: [ 'type', require('./AppendBehavior') ],
  dropBehavior: [ 'type', require('./DropBehavior') ]
};