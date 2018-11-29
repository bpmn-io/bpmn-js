import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';


/**
 * BPMN specific create data object behavior
 */
export default function DataObjectBehavior(bpmnFactory, eventBus, modeling) {
  CommandInterceptor.call(this, eventBus);

  this.preExecute('shape.create', function(event) {

    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:DataObjectReference') && shape.type !== 'label') {

      // create a DataObject every time a DataObjectReference is created
      var dataObject = bpmnFactory.create('bpmn:DataObject');

      // set the reference to the DataObject
      shape.businessObject.dataObjectRef = dataObject;
    }
  });

  function updateDataObject(dataObjectReference, name) {
    if (!name) {
      return;
    }

    var dataObjectReferenceBo = getBusinessObject(dataObjectReference);

    var properties = getPropertiesFromName(name);

    var dataObjectName, dataStateName;

    if (properties) {
      dataObjectName = properties.dataObjectName;
      dataStateName = properties.dataStateName;
    } else {
      dataObjectName = name;
      dataStateName = '';
    }

    var dataObjectReferenceDataState = dataObjectReferenceBo.dataState;

    if (dataObjectReferenceDataState) {
      dataObjectReferenceDataState = {
        name: dataStateName
      };
    } else {
      dataObjectReferenceDataState = bpmnFactory.create('bpmn:DataState', {
        name: dataStateName
      });
    }

    modeling.updateProperties(dataObjectReference, {
      dataObjectRef: {
        name: dataObjectName
      },
      dataState: dataObjectReferenceDataState,
    });
  }

  this.postExecute('element.updateLabel', function(event) {
    var context = event.context,
        element = context.element.labelTarget || context.element,
        newLabel = context.newLabel;

    if (!is(element, 'bpmn:DataObjectReference')) {
      return;
    }

    updateDataObject(element, newLabel);
  });

  this.postExecute('element.updateProperties', function(event) {
    var context = event.context,
        element = context.element.labelTarget || context.element,
        properties = context.properties;

    if (!is(element, 'bpmn:DataObjectReference')) {
      return;
    }

    if ('name' in properties) {
      updateDataObject(element, properties.name);
    }
  });

}

DataObjectBehavior.$inject = [
  'bpmnFactory',
  'eventBus',
  'modeling'
];

inherits(DataObjectBehavior, CommandInterceptor);

// helpers //////////

function getPropertiesFromName(name) {
  var matches = name.match(/(.*)(\[[^[\]]+\])$/);

  if (!matches || !matches.length) {
    return;
  }

  var dataObjectName = matches[1].trim(),
      dataStateName = matches[2].slice(1, -1).trim();

  return {
    dataObjectName: dataObjectName,
    dataStateName: dataStateName
  };
}