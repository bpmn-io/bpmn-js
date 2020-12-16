# Project Setup

This document describes the necessary steps to setup a `bpmn-js` development environment.


## TLDR;

On Linux, OS X or Windows? [git](http://git-scm.com/), [NodeJS](nodejs.org) and [npm](https://www.npmjs.org/doc/cli/npm.html) ready? Check out the [setup script section](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/SETUP.md#setup-via-script) below.


## Manual Steps

Make sure you have [git](http://git-scm.com/), [NodeJS](nodejs.org) and [npm](https://www.npmjs.org/doc/cli/npm.html)  installed before you continue.


### Get Project + Dependencies

The following projects from the [bpmn-io](https://github.com/bpmn-io) project on GitHub

* [bpmn-js](https://github.com/bpmn-io/bpmn-js)
* [diagram-js](https://github.com/bpmn-io/diagram-js)
* [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle)

and clone them into a common directory via

```
git clone git@github.com:bpmn-io/bpmn-js.git
git clone git@github.com:bpmn-io/diagram-js.git
git clone git@github.com:bpmn-io/bpmn-moddle.git
```

### Link Projects

[Link dependent projects](https://docs.npmjs.com/cli/link) between each other to pick up changes immediately.

```
.
├─bpmn-js
│   └─node_modules
│       ├─diagram-js <link>
│       └─bpmn-moddle <link>
├─diagram-js
├─bpmn-moddle
```

#### On OS X, Linux

Use [npm-link](https://docs.npmjs.com/cli/link) or `ln -s <target> <link>`.

#### On Windows

Use `mklink /d <link> <target>` [(docs)](http://technet.microsoft.com/en-us/library/cc753194.aspx).

### Install Dependencies

Execute `npm install` on each of the projects to grab their dependencies.


### Verify Things are O.K.

Execute `npm run all` on each project. Things should be fine.


### Setup via Script

The whole setup can be automated through setup scripts for [Linux/OS X](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/setup.sh) and [Windows](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/setup.bat).


### Running a single modeler instance

To test changes that you might have made in [bpmn-js](https://github.com/bpmn-io/bpmn-js) or in any of the libraries it depends on,
you can run a single test that will instantiate a modeler with all the core modules.

* Open the [file testing the modeler](https://github.com/bpmn-io/bpmn-js/blob/master/test/spec/ModelerSpec.js#L49)
* Change
    ```javascript
    it('should import simple process', function() {
    ```
    to
    ```javascript
    it.only('should import simple process', function() {
    ```
    (This ensures only this single test is run)

* Execute `npm run dev`
* Open your browser to <localhost:9876/debug.html>
* Interact with the modeler and see your changes reflected