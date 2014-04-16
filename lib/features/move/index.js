var diagramModule = require('../../di').defaultModule;

require('./MoveEvents');
require('./MoveVisuals');

function Move() {}

diagramModule.type('move', [ 'moveEvents', 'moveVisuals', Move ]);

module.exports = Move;