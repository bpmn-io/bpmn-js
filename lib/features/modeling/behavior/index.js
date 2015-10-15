module.exports = {
  __init__: [
    'appendBehavior',
    'createBoundaryEventBehavior',
    'createDataObjectBehavior',
    'deleteLaneBehavior',
    'createOnFlowBehavior',
    'createParticipantBehavior',
    'modelingFeedback',
    'removeParticipantBehavior',
    'replaceConnectionBehavior',
    'replaceElementBehaviour',
    'resizeLaneBehavior',
    'updateFlowNodeRefsBehavior'
  ],
  appendBehavior: [ 'type', require('./AppendBehavior') ],
  createBoundaryEventBehavior: [ 'type', require('./CreateBoundaryEventBehavior') ],
  createDataObjectBehavior: [ 'type', require('./CreateDataObjectBehavior') ],
  deleteLaneBehavior: [ 'type', require('./DeleteLaneBehavior') ],
  createOnFlowBehavior: [ 'type', require('./CreateOnFlowBehavior') ],
  createParticipantBehavior: [ 'type', require('./CreateParticipantBehavior') ],
  modelingFeedback: [ 'type', require('./ModelingFeedback') ],
  removeParticipantBehavior: [ 'type', require('./RemoveParticipantBehavior') ],
  replaceConnectionBehavior: [ 'type', require('./ReplaceConnectionBehavior') ],
  replaceElementBehaviour: [ 'type', require('./ReplaceElementBehaviour') ],
  resizeLaneBehavior: [ 'type', require('./ResizeLaneBehavior') ],
  updateFlowNodeRefsBehavior: [ 'type', require('./UpdateFlowNodeRefsBehavior') ]
};
