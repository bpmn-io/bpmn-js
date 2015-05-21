module.exports = {
  __init__: [
    'appendBehavior',
    'createBehavior',
    'createOnFlowBehavior',
    'dropBehavior',
    'removeBehavior',
    'modelingFeedback'
  ],
  appendBehavior: [ 'type', require('./AppendBehavior') ],
  dropBehavior: [ 'type', require('./DropBehavior') ],
  createBehavior: [ 'type', require('./CreateBehavior') ],
  createOnFlowBehavior: [ 'type', require('./CreateOnFlowBehavior') ],
  removeBehavior: [ 'type', require('./RemoveBehavior') ],
  modelingFeedback: [ 'type', require('./ModelingFeedback') ]
};