import { JoinWithGatewayHandler } from './JoinWithGatewayHandler';

export class JoinWithGateway {

  /**
   * @param {import('diagram-js/lib/command/CommandStack').default} commandStack
   */
  constructor(commandStack) {
    this._commandStack = commandStack;

    commandStack.registerHandler('shapes.joinWithGateway', JoinWithGatewayHandler);
  }

  join(shapes) {
    this._commandStack.execute('shapes.joinWithGateway', { shapes });
  }

  preview(shapes) {}
}

JoinWithGateway.$inject = [ 'commandStack' ];
