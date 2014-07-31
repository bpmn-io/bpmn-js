'use strict';

var _ = require('lodash');


/* jshint -W101 */

var images = {
  EVENT: 'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANNJREFUeNq0VIsNwiAQpV3AbuAIOAobMBsTwAZ0AxyhTgBOcN5TmlSsWiy+5CXA3Xs5PkdHROKf0EzPpII+x56AYrpi7ch0zJPWWiilxDAM90BKSTjnhDEG0zNTMS+zUWkSpZQUQqB3QAw5yM2aF6OAhBgjfQNyslkojbDvj5WsVZbPTS+NPJ8J1QIaaJdGZK2tNoLmsTMSPQ8OcJpvpwZLTb+2+AtgdMVgmqZqMd5WWdGIx1aLrBnLlmhy/c0e5O4W2dS0IC5ja9Pu+0ZafWw3AQYAuebLigXf9OoAAAAASUVORK5CYII=',
  GATEWAY: 'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAG1JREFUeNqs1MsJACEMBFC1gfR/sqSUlEXZFVEzcWEG5vrAT5LNLFFyAdW32AigKiLWirAI6oiq9iIMQQP5gjAP2pAIO0EugrAVChEPm6Fr5IQ1oyRW2EejXjb1+akfkjoi1KH9tUYya7E9AgwA8H6jTs2UBDgAAAAASUVORK5CYII=',
  TASK: 'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALBJREFUeNpi/P//PwM1ABMDlQALiGBkZARR/ECcAMQCROr9AMQLgPgjyFeMYAJi0Hl+fn4DICDKlAsXLjB8/PjxApBpCA4eaBjFA/H/8+fP/ycWgNSC9ID0IhtUb29v/59UANID0gsyAx7YDg4OJAcwsh6qxdqoQSQYBEpgpIIDBw6AKAUwh1oJEiOLgNIGoWzy4MEDhg0bNqBkEWSDYJk2gAhfPQCFBkamHVSxBhBgAH1c5Gm2siu5AAAAAElFTkSuQmCC',
  TRASH: 'iVBORw0KGgoAAAANSUhEUgAAABIAAAATCAYAAACdkl3yAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQtJREFUeNqsVNENgyAQBeM/3aCM4AZlBDagG3QFR3AENygbYCeoTlBG0AksR8QgAbGNl7xEAu+9O84Dz/OMTgkQSogJ2I7gGuUHQnDoZvAw+CSEnosJnCMxIZIg7uHt+KWX5cWg/veKsCsLY+xK44toLrSBNPwJFmWweSeE1FVV7SqM44iGYYBPZvCKdU0YoTkXSil3Ryu/CNOdJpsp4pwjKeVms2kai1gUqfShvL7vty5a27KOCI2OEAsQZoyhruvsck9o8IVS7r5ptjRwDkvbEy5S7Y0FtNwz0DmhDg5SSlH4PwkhfCN9qDQQClvdtu1Pz4g6OLAPnx/Omps3emDW4KKmlX/WC/kVYACiNOUTeEjwagAAAABJRU5ErkJggg=='
};

/* jshint +W101 */


/**
 * A provider for BPMN 2.0 elements context pad
 *
 * @param {ContextPad} contextPad
 */
function ContextPadProvider(contextPad, directEditing, bpmnModeling, selection) {

  contextPad.registerProvider(this);

  this._selection = selection;
  this._directEditing = directEditing;
  this._bpmnModeling = bpmnModeling;
}

ContextPadProvider.$inject = [ 'contextPad', 'directEditing', 'bpmnModeling', 'selection' ];


ContextPadProvider.prototype.getContextPadEntries = function(element) {

  var directEditing = this._directEditing,
      bpmnModeling = this._bpmnModeling,
      selection = this._selection;

  var actions = {};

  if (element.type === 'label') {
    return actions;
  }

  var bpmnElement = element.businessObject;

  function append(element, type) {
    var target = bpmnModeling.appendFlowNode(element, null, type);

    selection.select(target);
    directEditing.activate(target);
  }

  if (bpmnElement.$instanceOf('bpmn:FlowNode') &&
      !bpmnElement.$instanceOf('bpmn:EndEvent')) {

    _.extend(actions, {
      'action.model-event': {
        imageUrl: 'data:image/png;base64,' + images.EVENT,
        action: function(e) {
          append(element, 'bpmn:EndEvent');
        }
      },
      'action.model-gateway': {
        imageUrl: 'data:image/png;base64,' + images.GATEWAY,
        action: function(e) {
          append(element, 'bpmn:Gateway');
        }
      },
      'action.model-task': {
        imageUrl: 'data:image/png;base64,' + images.TASK,
        action: function(e) {
          append(element, 'bpmn:Task');
        }
      }
    });

  }

  /*
  _.extend(actions,  {
    'action.delete': {
      imageUrl: 'data:image/png;base64,' + images.TRASH,
      action: function(e) {
        console.log('action.delete', e);
      }
    }
  });
  */

  return actions;
};


module.exports = ContextPadProvider;