export class JoinWithGatewayContextPadProvider {

  /**
   * @param {import('./JoinWithGateway').JoinWithGateway} joinWithGateway
   */
  constructor(joinWithGateway) {
    this._joinWithGateway = joinWithGateway;

    this._handleClick = this._handleClick.bind(this);
  }

  getMultiElementContextPadEntries(elements) {
    return {
      'join-with-gateway': {
        group: 'connect',
        className: 'bpmn-icon-gateway-none',
        title: 'Join with gateway',
        action: {
          click: this._handleClick
        }
      }
    };
  }

  _handleClick(_, elements) {
    this._joinWithGateway.join(elements);
  }
}
