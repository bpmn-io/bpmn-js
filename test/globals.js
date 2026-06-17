import { use as chaiUse } from 'chai';
import sinonChai from 'sinon-chai';
import ChaiMatch from 'chai-match';
import BoundsMatchers from './matchers/BoundsMatchers.js';
import ConnectionMatchers from './matchers/ConnectionMatchers.js';
import JSONMatcher from './matchers/JSONMatcher.js';

chaiUse(sinonChai);
chaiUse(ChaiMatch);
chaiUse(BoundsMatchers);
chaiUse(ConnectionMatchers);
chaiUse(JSONMatcher);