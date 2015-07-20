module.exports = {
  __init__: [
    'appendBehavior',
    'createBehavior',
    'createOnFlowBehavior',
    'replaceConnectionBehavior',
    'removeBehavior',
    'modelingFeedback'
  ],
  appendBehavior: [ 'type', require('./AppendBehavior') ],
  createBehavior: [ 'type', require('./CreateBehavior') ],
  replaceConnectionBehavior: [ 'type', require('./ReplaceConnectionBehavior') ],
  createOnFlowBehavior: [ 'type', require('./CreateOnFlowBehavior') ],
  removeBehavior: [ 'type', require('./RemoveBehavior') ],
  modelingFeedback: [ 'type', require('./ModelingFeedback') ]
};
