import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

/**
 * @typedef {import('../../BpmnFactory').default} BpmnFactory
 *
 * @typedef {import('../../../model/Types').ModdleElement} ModdleElement
 */

/**
 * Creates a new bpmn:CategoryValue inside a new bpmn:Category
 *
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
export function createCategory(bpmnFactory) {
  return bpmnFactory.create('bpmn:Category');
}

/**
 * Creates a new bpmn:CategoryValue inside a new bpmn:Category
 *
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
export function createCategoryValue(bpmnFactory) {
  return bpmnFactory.create('bpmn:CategoryValue');
}

/**
 * Adds category value to definitions
 *
 * @param {ModdleElement} categoryValue
 * @param {ModdleElement} category
 * @param {ModdleElement} definitions
 *
 * @return {ModdleElement}
 */
export function linkCategoryValue(categoryValue, category, definitions) {
  collectionAdd(category.get('categoryValue'), categoryValue);
  categoryValue.$parent = category;

  collectionAdd(definitions.get('rootElements'), category);
  category.$parent = definitions;

  return categoryValue;
}

/**
 * Unlink category value from parent
 *
 * @param {ModdleElement} categoryValue
 *
 * @return {ModdleElement}
 */
export function unlinkCategoryValue(categoryValue) {
  var category = categoryValue.$parent;

  if (category) {
    collectionRemove(category.get('categoryValue'), categoryValue);
    categoryValue.$parent = null;
  }

  return categoryValue;
}

/**
 * Unlink category from parent
 *
 * @param {ModdleElement} category
 *
 * @return {ModdleElement}
 */
export function unlinkCategory(category) {
  var definitions = category.$parent;

  if (definitions) {
    collectionRemove(definitions.get('rootElements'), category);
    category.$parent = null;
  }

  return category;
}