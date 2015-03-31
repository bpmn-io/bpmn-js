module.exports = {
  __init__: [ 'appendBehavior', 'dropBehavior', 'createBehavior', 'removeBehavior' ],
  appendBehavior: [ 'type', require('./AppendBehavior') ],
  createBehavior: [ 'type', require('./CreateBehavior') ],
  removeBehavior: [ 'type', require('./RemoveBehavior') ],
  dropBehavior: [ 'type', require('./DropBehavior') ]
};