'use strict';

var _ = require('lodash');


/* jshint -W101 */

var images = {
  EVENT_END: 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEbSURBVDiNtZUxisMwEEWfnDKQwqdIGXAjUJlrLVssi2+im1jgxpAyre6QlMlPYStoN7Z3Dc6HKWz4j5nxl2wkMSdjzAbYD49nSbdZg6SXAnZADTTABdBQl+FdDexGvSOwIxAzyFRF4Pjbb/KRjTFfwAdgAKy1OOeoqgqArusIIdC27XNA4FvS58vIQ2d3QGVZynuvKXnvVZZl6vSed5rvLCZYjHESlhRjzKEx7TQB67Sbuc7GOs12WufABpC19t+wJGttAjaSKIacHQCcc7MRG1PmORhjNgV9aLfA82suUebZAvtiMeEPFcAZuEKfs6XKPFfgXKg/myeAEMJiYOY5Sbq9LTbrBlsrHr33XQ5a6fpa/YL9MfKYlv4CHqE/UXeUBA2YAAAAAElFTkSuQmCC',
  GATEWAY: 'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAG1JREFUeNqs1MsJACEMBFC1gfR/sqSUlEXZFVEzcWEG5vrAT5LNLFFyAdW32AigKiLWirAI6oiq9iIMQQP5gjAP2pAIO0EugrAVChEPm6Fr5IQ1oyRW2EejXjb1+akfkjoi1KH9tUYya7E9AgwA8H6jTs2UBDgAAAAASUVORK5CYII=',
  TASK: 'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALBJREFUeNpi/P//PwM1ABMDlQALiGBkZARR/ECcAMQCROr9AMQLgPgjyFeMYAJi0Hl+fn4DICDKlAsXLjB8/PjxApBpCA4eaBjFA/H/8+fP/ycWgNSC9ID0IhtUb29v/59UANID0gsyAx7YDg4OJAcwsh6qxdqoQSQYBEpgpIIDBw6AKAUwh1oJEiOLgNIGoWzy4MEDhg0bNqBkEWSDYJk2gAhfPQCFBkamHVSxBhBgAH1c5Gm2siu5AAAAAElFTkSuQmCC',
  INTER_THROW_EVENT: 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAIaSURBVDiNtZUxayJBGIbfmULW2bBgM43FQKrDWhckV6UQjsXfcKCVx/WLveAP8LjO4n6BhRxWKwgnwjA/IKRIt82tEDGoa5P3ijPBHCSRI3mrKb734Ru+d74RJPGahBACAHhCsXiuRggRFYvFT57nXWw2mw8A4Pv+VZ7n891uNyH58ySgEEIHQfCjVCp9bLfbfhiGolqtAgCcc7DWcjgcbm5vb3+t1+vPJH8f++U/sIZS6rrT6Vw6586klGIwGKBSqaBSqWAwGEBKKZxzZ51O51IpdS2EaDzpiCQOXWql1Go2mzFJEhpj2Gq1OBqNmKYp0zTlaDRiq9WiMYZJknA2m1EptQKgHzkPhyAIJnEc75MkYblc5nQ65XOaTqcsl8tMkoRxHO+DIJg8AQKIjDF3WZbRGPMi7BhqjOHBcwcgIvl3KEqpb91u94uUUtzc3GA4HL6WDgBAu93G+fk57u/v2e/3v2+3268SADzPuwjDUCwWCzSbzZNgANBsNrFYLBCGofA87+JxuIVCYbdcLqm1Zpqmr173QWmaUmvN5XLJQqGwAyDkCw38lyRJ+r5/5ZxDrVaDtfZks7UWtVoNzjn4vn9FkhIA8jyfW2tZr9cxHo9PBo7HY9TrdVhrmef5HMDbx+Z9gs33eHoHaEMptYrjeJ9lGXu9HqMootaaWmtGUcRer8csyxjH8f4Aaxwz3nx9vf+CfQZ+8hfwB0gOaoHM8UT6AAAAAElFTkSuQmCC',
  TEXT_ANNOTATION: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAC9SURBVCiR3dMxSoNREATgbyQWIoJpRPAQprITbD2BlXgBDyF4FMEDeAFzCwstLSwsvICOVdBfYkxSOvCKnd2Zt/Pgpa1lkWSKA7zPuNHS6i8ct32ZFRtrGAzwDwyWesQkm5isZZBkD2NczusvjJBkhBuM2l6stEGSMxzhtO3Hr7e0HRxs4Q672PnRm2L/OzfYIMk5nnDV9m1RvEGEJGOc4BmvbR+XEcNGkgm2cdj2fhUxBLe4bvvw5/Cc3/gJD3ZM3d0apsIAAAAASUVORK5CYII=',
  TRASH: 'iVBORw0KGgoAAAANSUhEUgAAABIAAAATCAYAAACdkl3yAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQtJREFUeNqsVNENgyAQBeM/3aCM4AZlBDagG3QFR3AENygbYCeoTlBG0AksR8QgAbGNl7xEAu+9O84Dz/OMTgkQSogJ2I7gGuUHQnDoZvAw+CSEnosJnCMxIZIg7uHt+KWX5cWg/veKsCsLY+xK44toLrSBNPwJFmWweSeE1FVV7SqM44iGYYBPZvCKdU0YoTkXSil3Ryu/CNOdJpsp4pwjKeVms2kai1gUqfShvL7vty5a27KOCI2OEAsQZoyhruvsck9o8IVS7r5ptjRwDkvbEy5S7Y0FtNwz0DmhDg5SSlH4PwkhfCN9qDQQClvdtu1Pz4g6OLAPnx/Omps3emDW4KKmlX/WC/kVYACiNOUTeEjwagAAAABJRU5ErkJggg==',
  CONNECT: 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADwSURBVDiNzdQxLwRBFADg7+ESnURHRIgoNBqtqPwHP0CikCiIX3A/SKeho9BcIqEREUGUSu4ajGYle26d3b0tTPKaN+99eTOZTKSUNLnGGtX+HRgR6xHRHhmMiLWI6OAcV32bKaXSgVWcoIeEx4GaktAKjvGGjwzrYbMSiBkc4RXvGfQdl0U9f93hCyYRGM/luzgo7Chx3Amc4TM3XefX+hLgMp5xnU3WxUYtEEt4wjZaOMXF0J4h2AIesJPLtbBYGcQ87rFb5Z0WgpjDHfaqYgMgZnGL/TpYH4gp3OCwLvYTnMbWKFhKSWRYY6vxD/YLVqFRD/AxuKIAAAAASUVORK5CYII='
};

/* jshint +W101 */


/**
 * A provider for BPMN 2.0 elements context pad
 *
 * @param {ContextPad} contextPad
 */
function ContextPadProvider(contextPad, directEditing, modeling, selection, connect) {

  contextPad.registerProvider(this);

  this._selection = selection;
  this._directEditing = directEditing;
  this._modeling = modeling;

  this._connect = connect;
}

ContextPadProvider.$inject = [ 'contextPad', 'directEditing', 'modeling', 'selection', 'connect' ];


ContextPadProvider.prototype.getContextPadEntries = function(element) {

  var directEditing = this._directEditing,
      modeling = this._modeling,
      selection = this._selection,
      connect = this._connect;

  var actions = {};

  if (element.type === 'label') {
    return actions;
  }

  var bpmnElement = element.businessObject;

  function startConnect(event, element) {
    connect.start(event, element, null);

    event.preventDefault();
  }

  function append(element, type) {

    var target;

    if (type === 'bpmn:TextAnnotation') {
      target = modeling.appendTextAnnotation(element, type);
    } else {
      target = modeling.appendFlowNode(element, type);
    }

    selection.select(target);
    directEditing.activate(target);
  }

  if (bpmnElement.$instanceOf('bpmn:FlowNode') &&
      !bpmnElement.$instanceOf('bpmn:EndEvent')) {

    _.extend(actions, {
      'action.model-event': {
        group: 'model',
        imageUrl: 'data:image/png;base64,' + images.EVENT_END,
        action: function(event, element) {
          append(element, 'bpmn:EndEvent');
        }
      },
      'action.model-gateway': {
        group: 'model',
        imageUrl: 'data:image/png;base64,' + images.GATEWAY,
        action: function(e) {
          append(element, 'bpmn:ExclusiveGateway');
        }
      },
      'action.model-task': {
        group: 'model',
        imageUrl: 'data:image/png;base64,' + images.TASK,
        action: function() {
          append(element, 'bpmn:Task');
        }
      },
      'action.model-intermediate-event': {
        group: 'model',
        imageUrl: 'data:image/png;base64,' + images.INTER_THROW_EVENT,
        action: function() {
          append(element, 'bpmn:IntermediateThrowEvent');
        }
      },
      'action.model-text-Annotation': {
        group: 'model',
        imageUrl: 'data:image/png;base64,' + images.TEXT_ANNOTATION,
        action: function() {
          append(element, 'bpmn:TextAnnotation');
        }
      },
      'action.connect': {
        group: 'connect',
        imageUrl: 'data:image/png;base64,' + images.CONNECT,
        action: {
          click: startConnect,
          dragstart: startConnect
        }
      }
    });

  }

  _.extend(actions, {
    'action.delete': {
      group: 'edit',
      imageUrl: 'data:image/png;base64,' + images.TRASH,
      action: function(e) {
        modeling.removeShape(element);
      }
    }
  });

  return actions;
};


module.exports = ContextPadProvider;
