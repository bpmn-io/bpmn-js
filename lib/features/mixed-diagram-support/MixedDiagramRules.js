import {
  assign,
  forEach
} from 'min-dash';

import inherits from 'inherits';

import {
  is
} from '../../util/ModelUtil';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

var HIGH_PRIORITY = 2000;


export default function MixedDiagramRules(eventBus, mixedDiagramSupport, rules) {
  RuleProvider.call(this, eventBus);

  this._mixedDiagramSupport = mixedDiagramSupport;
  this._rules = rules;

  var self = this,
      ruleNames = [
        'elements.move',
        'elements.create',
        'shape.create'
      ];

  forEach(ruleNames, function(ruleName) {
    self.addRule(ruleName, HIGH_PRIORITY, function(context) {
      return self._allowed.call(self, ruleName, context);
    });
  });
}

MixedDiagramRules.$inject = [
  'eventBus',
  'mixedDiagramSupport',
  'rules'
];

inherits(MixedDiagramRules, RuleProvider);

MixedDiagramRules.prototype._allowed = function(ruleName, context) {
  var target = context.target,
      topLevelProcess = this._mixedDiagramSupport.getTopLevelProcess();

  if (!topLevelProcess) {
    return;
  }

  if (!is(target, 'bpmn:Collaboration')) {
    return;
  }

  return this._rules.allowed(ruleName, assign({}, context, { target: topLevelProcess }));
};
