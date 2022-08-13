import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';


/**
 * Creates a new bpmn:CategoryValue inside a new bpmn:Category
 *
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement} categoryValue.
 */
export function createCategory(bpmnFactory) {
  return bpmnFactory.create('bpmn:Category');
}

/**
 * Creates a new bpmn:CategoryValue inside a new bpmn:Category
 *
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement} categoryValue.
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
 * @return {ModdleElement} categoryValue
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
 * @return {ModdleElement} categoryValue
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
 * @param {ModdleElement} definitions
 *
 * @return {ModdleElement} categoryValue
 */
export function unlinkCategory(category) {
  var definitions = category.$parent;

  if (definitions) {
    collectionRemove(definitions.get('rootElements'), category);
    category.$parent = null;
  }

  return category;
}