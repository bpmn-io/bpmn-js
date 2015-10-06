module.exports = {
  __init__: [
    'appendBehavior',
    'createBoundaryEventBehavior',
    'createDataObjectBehavior',
    'createLaneBehavior',
    'createOnFlowBehavior',
    'createParticipantBehavior',
    'modelingFeedback',
    'replaceElementBehaviour',
    'removeParticipantBehavior',
    'replaceConnectionBehavior'
  ],
  appendBehavior: [ 'type', require('./AppendBehavior') ],
  createBoundaryEventBehavior: [ 'type', require('./CreateBoundaryEventBehavior') ],
  createDataObjectBehavior: [ 'type', require('./CreateDataObjectBehavior') ],
  createLaneBehavior: [ 'type', require('./CreateLaneBehavior') ],
  createOnFlowBehavior: [ 'type', require('./CreateOnFlowBehavior') ],
  createParticipantBehavior: [ 'type', require('./CreateParticipantBehavior') ],
  modelingFeedback: [ 'type', require('./ModelingFeedback') ],
  replaceElementBehaviour: [ 'type', require('./ReplaceElementBehaviour') ],
  removeParticipantBehavior: [ 'type', require('./RemoveParticipantBehavior') ],
  replaceConnectionBehavior: [ 'type', require('./ReplaceConnectionBehavior') ]
};
