# bpmn-js - BPMN 2.0 for the web

bpmn-js is the BPMN 2.0 diagram modeling and rendering toolkit that powers [bpmn.io](http://bpmn.io).


> bpmn-js is in an alpha stage, expect documentation to be missing and examples to be broken.


## Usage

Get the library via [npm](http://npmjs.org)

```
npm install --save bpmn-js
```

Use it in your project

```javascript
var BpmnViewer = require('bpmn-js').Viewer;

var xml; // my BPMN 2.0 xml
var viewer = new BpmnViewer({ container: 'body' });

viewer.importXML(xml, function(err) {

  if (err) {
    console.log('error rendering', err);
  } else {
    console.log('rendered');
  }
});
```

Make sure to bundle the project for the browser, e.g. by using [browserify](http://browserify.org).


## Resources

*   [Demo](http://demo.bpmn.io)
*   [Issues](https://github.com/bpmn-io/bpmn-js/issues)
*   [Examples](https://github.com/bpmn-io/bpmn-js-examples)


## Building the Project

As long as the project is in alpha stage, you must make sure you setup the whole development environment, including a number of [project dependencies](https://github.com/bpmn-io) according to [our development setup](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/SETUP.md).


## License

Use under the terms of the [bpmn-js license](http://bpmn.io/license).