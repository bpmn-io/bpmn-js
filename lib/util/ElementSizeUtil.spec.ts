import {
  DEFAULT_EVENT_SIZE,
  DEFAULT_TASK_SIZE,
  getDefaultSize
} from './ElementSizeUtil';

const taskWidth: number = DEFAULT_TASK_SIZE.width;

const eventHeight: number = DEFAULT_EVENT_SIZE.height;

const subProcess = {
  $type: 'bpmn:SubProcess'
};

const size = getDefaultSize(subProcess);

const sizeWithDi = getDefaultSize(subProcess, {
  isExpanded: true
});

const width: number = size.width;

const height: number = sizeWithDi.height;
