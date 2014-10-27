module.exports = {
  __depends__: [
    require('../selection'),
    require('../rules')
  ],
  connect: [ 'type', require('./Connect') ]
};
