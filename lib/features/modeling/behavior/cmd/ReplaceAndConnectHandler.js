export default function ReplaceAndConnectHandler(bpmnReplace, modeling) {
  this._bpmnReplace = bpmnReplace;
  this._modeling = modeling;
}

ReplaceAndConnectHandler.prototype.preExecute = function(context) {
  var source = context.source,
      target = context.target,
      replace = context.replace || {};

  if (replace.source) {
    source = this._bpmnReplace.replaceElement(source, replace.source);
  }

  if (replace.target) {
    target = this._bpmnReplace.replaceElement(target, replace.target);
  }

  this._modeling.connect(source, target);
};

ReplaceAndConnectHandler.$inject = [
  'bpmnReplace',
  'modeling'
];