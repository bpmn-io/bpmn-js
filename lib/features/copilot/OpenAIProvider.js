import { OpenAI } from 'langchain/llms/openai';

import {
  getBusinessObject,
  is
} from '../../util/ModelUtil';

const model = new OpenAI({

  // modelName: 'text-davinchi-003',
  maxTokens: 2000,

  // eslint-disable-next-line no-undef
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.9,
  verbose: true,
});

export default class OpenAIProvider {
  constructor(autoPlace, connectionPreview, copilot, elementFactory, eventBus, layouter, rules) {
    this._autoPlace = autoPlace;
    this._connectionPreview = connectionPreview;
    this._eventBus = eventBus;
    this._layouter = layouter;
    this._rules = rules;

    copilot.setProvider(this);

    this._elementFactory = elementFactory;
  }

  async createSuggestion(element) {
    if (!is(element, 'bpmn:FlowNode')) {
      return null;
    }

    const suggestedNextElement = await suggestNextElement(element);

    if (!suggestedNextElement) {
      return null;
    }

    const {
      name,
      type
    } = suggestedNextElement;

    const nextElement = this._elementFactory.createShape({
      type
    });

    nextElement.businessObject.set('name', name);

    console.log('nextElement', nextElement);

    const position = this._eventBus.fire('autoPlace', {
      source: element,
      shape: nextElement
    });

    if (!position) {
      throw new Error('no position');
    }

    nextElement.x = position.x - nextElement.width / 2;
    nextElement.y = position.y - nextElement.height / 2;

    const connectionCreateAllowed = this._rules.allowed('connection.create', {
      source: element,
      target: nextElement,
      hints: {
        targetParent: element.parent
      }
    });

    let connection = null;

    if (connectionCreateAllowed) {
      connection = this._elementFactory.createConnection(connectionCreateAllowed);

      connection.waypoints = this._layouter.layoutConnection(connection, {
        source: element,
        target: nextElement
      });
    }

    return {
      connection,
      connectionSource: connectionCreateAllowed ? element : null,
      connectionTarget: connectionCreateAllowed ? nextElement : null,
      elements: [ nextElement ],
      position: null,
      target: element.parent
    };
  }
}

OpenAIProvider.$inject = [
  'autoPlace',
  'connectionPreview',
  'copilot',
  'elementFactory',
  'eventBus',
  'layouter',
  'rules'
];

async function suggestNextElement(element) {
  const prompt = [
    'BPMN Process:',
    ...getEdges(element),
    'Selected element:',
    getName(element),
    'Suggested next element name and type (e.g., Do work[bpmn:Task]):'
  ].join('\n');

  console.log('prompt', prompt);

  const response = await model.call(prompt);

  console.log('response', response);

  try {
    const [ _, name, type ] = /(.*)\[(.*)\]/.exec(response);

    console.log('name', name);
    console.log('type', type);

    return {
      type,
      name
    };
  } catch (error) {
    return null;
  }
}

function getEdges(element, edges = [], visitedSequenceFlows = []) {
  element = getBusinessObject(element);

  const incoming = element.get('incoming');

  if (!incoming) {
    return edges;
  }

  incoming
    .filter(
      (incoming) =>
        is(incoming, 'bpmn:SequenceFlow') &&
        !visitedSequenceFlows.includes(incoming)
    )
    .forEach((sequenceFlow) => {
      visitedSequenceFlows.push(sequenceFlow);

      const edge = getEdge(sequenceFlow);

      edges.push(edge, ...getEdges(sequenceFlow.get('sourceRef')));
    });

  return edges;
}

function getEdge(sequenceFlow) {
  const name = getName(sequenceFlow, true);

  const source = sequenceFlow.get('sourceRef'),
        target = sequenceFlow.get('targetRef');

  return name
    ? `${getName(source)}[${source.$type}] -- ${name} --> ${getName(target)}[${
      target.$type
    }]`
    : `${getName(source)}[${source.$type}] --> ${getName(target)}[${
      target.$type
    }]`;
}

function getName(element, strict = false) {
  const businessObject = getBusinessObject(element);

  let name = businessObject.get('name');

  if (!name && !strict) {
    name = businessObject.get('id');
  }

  return name;
}