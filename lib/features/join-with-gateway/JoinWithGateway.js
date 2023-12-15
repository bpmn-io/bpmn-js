import { JoinWithGatewayHandler } from './JoinWithGatewayHandler';

export class JoinWithGateway {

  /**
   * @param {import('diagram-js/lib/command/CommandStack').default} commandStack
   * @param {import('diagram-js/lib/features/context-pad/ContextPad').default} contextPad
   */
  constructor(commandStack, contextPad) {
    this._commandStack = commandStack;

    commandStack.registerHandler('shapes.joinWithGateway', JoinWithGatewayHandler);
    contextPad.registerProvider(this);
  }

  join(shapes) {
    this._commandStack.execute('shapes.joinWithGateway', { shapes });
  }

  preview(shapes) {}

  getMultiElementContextPadEntries(elements) {
    return {
      'join-with-gateway': {
        group: 'connect',
        className: 'bpmn-icon-gateway-none',
        title: 'Join with gateway',
        action: {
          click: this._handleClick.bind(this)
        }
      }
    };
  }

  _handleClick(_, elements) {
    this.join(elements);
  }
}

JoinWithGateway.$inject = [ 'commandStack', 'contextPad' ];
