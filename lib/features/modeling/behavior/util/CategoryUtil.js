import {
  add as collectionAdd
} from 'diagram-js/lib/util/Collections';

import {
  getBusinessObject
} from '../../../../util/ModelUtil';

/**
 * Creates a new bpmn:CategoryValue inside a new bpmn:Category
 *
 * @param {ModdleElement} definitions
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement} categoryValue.
 */
export function createCategoryValue(definitions, bpmnFactory) {
  var categoryValue = bpmnFactory.create('bpmn:CategoryValue'),
      category = bpmnFactory.create('bpmn:Category', {
        categoryValue: [ categoryValue ]
      });

  // add to correct place
  collectionAdd(definitions.get('rootElements'), category);
  getBusinessObject(category).$parent = definitions;
  getBusinessObject(categoryValue).$parent = category;

  return categoryValue;

}