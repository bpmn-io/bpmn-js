import { groupBy, isFunction } from 'min-dash';

import replaceOptions from '../replace/ReplaceOptions';
import { isTargetDifferent } from '../replace/BpmnReplace';

export default class FilterMenuProvider {
  constructor(popupMenu, selection) {
    this._selection = selection;

    popupMenu.registerProvider('bpmn-filter', this);
  }

  getPopupMenuEntries(targets) {
    const grouped = groupBy(targets, 'type');

    const entries = {};

    Object.keys(grouped).forEach((type) => {
      const replaceOption = findOption(grouped[type][0]);

      if (!replaceOption) {
        console.log('No replace option found for', type);

        return;
      }

      const label = isFunction(replaceOption.label) ? replaceOption.label(grouped[type][0]) : replaceOption.label;

      const entry = {
        label: `${ label } (${ grouped[type].length })`,
        className: replaceOption.className,
        action: () => {
          this._selection.select(grouped[type]);
        }
      };

      entries[type] = entry;
    });

    // sort alphabetically
    return Object.keys(entries).sort().reduce((obj, key) => {
      obj[key] = entries[key];

      return obj;
    }, {});
  }
}

FilterMenuProvider.$inject = [ 'popupMenu', 'selection' ];

function findOption(element) {
  return replaceOptions.find((option) => {

    // TODO: make sequence flows work
    if (!option.target || !option.target.type) return false;

    // if (element.type === 'bpmn:StartEvent' && option.target.type === 'bpmn:StartEvent') debugger

    const foo = !isTargetDifferent(element, option.target);

    return foo;
  });
}