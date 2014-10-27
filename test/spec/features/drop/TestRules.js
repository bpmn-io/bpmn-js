var BaseRules  = require('../../../../lib/features/rules/Rules');


function TestRules(config, eventBus) {
}

TestRules.prototype = Object.create(BaseRules.prototype);

TestRules.$inject = ['config', 'eventBus' ];

module.exports = TestRules;


TestRules.prototype.can = function(p1, p2, indicator) {

  return p2.source[0].id === 'shape1';
};
