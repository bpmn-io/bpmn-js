module.exports = {
  __init__: [ 'defaultRenderer' ],
  defaultRenderer: [ 'type', require('./DefaultRenderer') ],
  styles: [ 'type', require('./Styles') ]
};
