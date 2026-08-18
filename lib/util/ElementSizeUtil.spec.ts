import {
  DEFAULT_EVENT_SIZE,
  DEFAULT_TASK_SIZE,
  getDefaultSize
} from './ElementSizeUtil';

import { Element } from '../model/Types';

const taskWidth: number = DEFAULT_TASK_SIZE.width;

const eventHeight: number = DEFAULT_EVENT_SIZE.height;

// element with a resolvable DI => di is optional
const subProcess = {
  type: 'bpmn:SubProcess'
} as Element;

const size = getDefaultSize(subProcess);

// moddle element => di must be provided
const subProcessBo = {
  $type: 'bpmn:SubProcess'
};

const sizeWithDi = getDefaultSize(subProcessBo, {
  isExpanded: true
});

const width: number = size.width;

const height: number = sizeWithDi.height;
