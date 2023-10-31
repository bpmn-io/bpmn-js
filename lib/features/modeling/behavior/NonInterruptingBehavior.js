import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import inherits from 'inherits-browser';

import { canBeNonInterrupting, getInterruptingProperty } from './util/NonInterruptingUtil';
import { getBusinessObject } from '../../../util/ModelUtil';

export default function NonInterruptingBehavior(injector, modeling) {
  injector.invoke(CommandInterceptor, this);

  this.postExecuted('shape.replace', function(event) {
    const oldShape = event.context.oldShape;
    const newShape = event.context.newShape;
    const hints = event.context.hints;

    if (!canBeNonInterrupting(newShape)) {
      return;
    }

    const property = getInterruptingProperty(newShape);
    const isExplicitChange = hints.targetElement && hints.targetElement[property] !== undefined;

    if (isExplicitChange) {
      return;
    }

    const isOldInterrupting = getBusinessObject(oldShape).get(property);
    const isNewInterruptingDefault = getBusinessObject(newShape).get(property);

    if (isOldInterrupting === isNewInterruptingDefault) {
      return;
    }

    modeling.updateProperties(newShape, {
      [property]: isOldInterrupting
    });
  });
}

NonInterruptingBehavior.$inject = [ 'injector', 'modeling' ];

inherits(NonInterruptingBehavior, CommandInterceptor);
