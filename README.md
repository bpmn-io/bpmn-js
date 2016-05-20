> The project is still in an early stage. Documentation may be missing and [examples](https://github.com/bpmn-io/bpmn-js-examples) may be broken.

# bpmn-js - BPMN 2.0 for the web

[![Build Status](https://travis-ci.org/bpmn-io/bpmn-js.svg?branch=master)](https://travis-ci.org/bpmn-io/bpmn-js)

[bpmn-js](https://github.com/bpmn-io/bpmn-js) is a BPMN 2.0 diagram rendering toolkit and web modeler.

[![bpmn-js in action](https://raw.githubusercontent.com/bpmn-io/bpmn-js/master/resources/screencast.gif)](http://demo.bpmn.io/s/start)


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


## Installation

Fetch [bpmn-js prebuilt](https://github.com/bpmn-io/bower-bpmn-js) or install it via [npm](https://www.npmjs.com/package/bpmn-js).


#### Fetch Prebuilt

The [bower-bpmn-js](https://github.com/bpmn-io/bower-bpmn-js) repository contains pre-built bundles of bpmn-js. 

Download them directly _or_ fetch them with [Bower](http://bower.io/):

```
bower install bpmn-js
```

Checkout the [example project](https://github.com/bpmn-io/bpmn-js-examples/tree/master/simple-bower) to get started.


#### Install via npm

Fetch the library via npm to get fine grained access to the parts you need:

```
npm install --save bpmn-js
```

Make sure you use [browserify](http://browserify.org) or the like to bundle your project and bpmn-js for the browser.

Checkout the [example project](https://github.com/bpmn-io/bpmn-js-examples/tree/master/simple-commonjs) to learn more.


## Resources

*   [Demo](http://demo.bpmn.io)
*   [Issues](https://github.com/bpmn-io/bpmn-js/issues)
*   [Examples](https://github.com/bpmn-io/bpmn-js-examples)
*   [Forum](https://forum.bpmn.io)


## Building the Project

Perform the following steps to build the library, including running all tests:

```
cd bpmn-js
npm install
grunt
```

When building the latest development snapshot you may need to perform [additional project setup](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/SETUP.md).


## Related

bpmn-js builds on top of a few additional powerful tools:

* [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle): Read / write support for BPMN 2.0 XML in the browsers
* [diagram-js](https://github.com/bpmn-io/diagram-js): Diagram rendering and editing toolkit


## License

Use under the terms of the [bpmn.io license](http://bpmn.io/license).
