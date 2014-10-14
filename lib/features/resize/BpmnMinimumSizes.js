module.exports = {
  'bpmn:Task': {
    'height': 40,
    'width':  40
  },
  'bpmn:SubProcess': {
    'resolver': function(element) {

      var isExpanded = element.businessObject.di.isExpanded;

      if (isExpanded) {
        return {
          'height': 100,
          'width':  100
        };
      } else {
        return {
          'height': 40,
          'width':  40
        };
      }
    }
  }
};
