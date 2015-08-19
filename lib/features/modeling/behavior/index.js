module.exports = {
  __init__: [
    'appendBehavior',
    'createBoundaryEventBehavior',
    'createOnFlowBehavior',
    'createParticipantBehavior',
    'modelingFeedback',
    'moveStartEventBehavior',
    'removeParticipantBehavior',
    'replaceConnectionBehavior'
  ],
  appendBehavior: [ 'type', require('./AppendBehavior') ],
  createBoundaryEventBehavior: [ 'type', require('./CreateBoundaryEventBehavior') ],
  createOnFlowBehavior: [ 'type', require('./CreateOnFlowBehavior') ],
  createParticipantBehavior: [ 'type', require('./CreateParticipantBehavior') ],
  modelingFeedback: [ 'type', require('./ModelingFeedback') ],
  moveStartEventBehavior: [ 'type', require('./MoveStartEventBehavior') ],
  removeParticipantBehavior: [ 'type', require('./RemoveParticipantBehavior') ],
  replaceConnectionBehavior: [ 'type', require('./ReplaceConnectionBehavior') ]
};
