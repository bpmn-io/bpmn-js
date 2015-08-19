module.exports = {
  __init__: [
    'appendBehavior',
    'createParticipantBehavior',
    'createBoundaryEventBehavior',
    'createOnFlowBehavior',
    'replaceConnectionBehavior',
    'removeParticipantBehavior',
    'modelingFeedback',
    'moveStartEventBehavior'

  ],
  appendBehavior: [ 'type', require('./AppendBehavior') ],
  createParticipantBehavior: [ 'type', require('./CreateParticipantBehavior') ],
  createBoundaryEventBehavior: [ 'type', require('./CreateBoundaryEventBehavior') ],
  createOnFlowBehavior: [ 'type', require('./CreateOnFlowBehavior') ],
  replaceConnectionBehavior: [ 'type', require('./ReplaceConnectionBehavior') ],
  removeParticipantBehavior: [ 'type', require('./RemoveParticipantBehavior') ],
  modelingFeedback: [ 'type', require('./ModelingFeedback') ],
  moveStartEventBehavior: [ 'type', require('./MoveStartEventBehavior') ]
};
