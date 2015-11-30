> The project is still in an early stage. Documentation may be missing and examples may be broken.

# bpmn-js - BPMN 2.0 for the web

[![Build Status](https://travis-ci.org/bpmn-io/bpmn-js.svg?branch=master)](https://travis-ci.org/bpmn-io/bpmn-js)

[bpmn-js](https://github.com/bpmn-io/bpmn-js) is the BPMN 2.0 diagram modeling and rendering toolkit that powers [bpmn.io](http://bpmn.io).


## Usage

> No need for additional setup: Try out our [seed project](https://github.com/bpmn-io/bpmn-js-seed) or use the [pre-packaged version](https://github.com/bpmn-io/bower-bpmn-js) of the library.

Get the library via [npm](http://npmjs.org) or [Bower](http://bower.io/) and use it in your web applications to display [BPMN 2.0 diagrams](http://www.bpmn.org/).


```javascript
var BpmnViewer = require('bpmn-js');

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


## Install bpmn-js

### via bower

```
bower install bpmn-js
```

Make sure to include the library + all dependencies into the website.

Checkout an [example project](https://github.com/bpmn-io/bpmn-js-examples/tree/master/simple-bower) that shows how to use the library in web applications.


### via npm

```
npm install --save bpmn-js
```

Make sure you use [browserify](http://browserify.org) or the like to bundle your project and bpmn-js for the browser.

Checkout an [example project](https://github.com/bpmn-io/bpmn-js-examples/tree/master/simple-commonjs) that shows how to use bpmn-js in node-style web applications.


## Resources

*   [Demo](http://demo.bpmn.io)
*   [Issues](https://github.com/bpmn-io/bpmn-js/issues)
*   [Examples](https://github.com/bpmn-io/bpmn-js-examples)
*   [Forum](https://forum.bpmn.io)


## Tools

bpmn-js builds on top of a few additional powerful tools

* [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle): Read / write support for BPMN 2.0 XML in the browsers
* [diagram-js](https://github.com/bpmn-io/diagram-js): Diagram rendering and editing toolkit


## Building the Project

As long as the project is in alpha stage, you must make sure you setup the whole development environment, including a number of [project dependencies](https://github.com/bpmn-io) according to [our development setup](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/SETUP.md).


## License

Use under the terms of the [bpmn.io license](http://bpmn.io/license).
