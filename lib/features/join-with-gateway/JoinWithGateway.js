import { JoinWithGatewayContextPadProvider } from './JoinWithGatewayContextPadProvider';
import { JoinWithGatewayHandler } from './JoinWithGatewayHandler';

export class JoinWithGateway {

  /**
   * @param {import('diagram-js/lib/command/CommandStack').default} commandStack
   * @param {import('didi').Injector} injector
   */
  constructor(commandStack, injector) {
    this._commandStack = commandStack;

    commandStack.registerHandler('shapes.joinWithGateway', JoinWithGatewayHandler);

    const contextPad = injector.get('contextPad', false);

    if (contextPad) {
      contextPad.registerProvider(new JoinWithGatewayContextPadProvider(this));
    }
  }

  join(shapes) {
    this._commandStack.execute('shapes.joinWithGateway', { shapes });
  }

  preview(shapes) {}
}

JoinWithGateway.$inject = [ 'commandStack', 'injector' ];
