module.exports = {
  __init__: [
    'appendBehavior',
    'createBehavior',
    'dropBehavior',
    'removeBehavior',
    'modelingFeedback'
  ],
  appendBehavior: [ 'type', require('./AppendBehavior') ],
  dropBehavior: [ 'type', require('./DropBehavior') ],
  createBehavior: [ 'type', require('./CreateBehavior') ],
  removeBehavior: [ 'type', require('./RemoveBehavior') ],
  modelingFeedback: [ 'type', require('./ModelingFeedback') ]
};