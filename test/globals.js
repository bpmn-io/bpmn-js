import { use as chaiUse } from 'chai';
import sinonChai from 'sinon-chai';
import ChaiMatch from 'chai-match';
import BoundsMatchers from './matchers/BoundsMatchers';
import ConnectionMatchers from './matchers/ConnectionMatchers';
import JSONMatcher from './matchers/JSONMatcher';

chaiUse(sinonChai);
chaiUse(ChaiMatch);
chaiUse(BoundsMatchers);
chaiUse(ConnectionMatchers);
chaiUse(JSONMatcher);