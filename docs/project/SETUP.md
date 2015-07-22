# Project Setup

This document describes the necessary steps to setup a `bpmn-js` development environment.


## TLDR;

On Linux/Unix? [git](http://git-scm.com/), [NodeJS](nodejs.org) and [npm](https://www.npmjs.org/doc/cli/npm.html) ready? Check out the [setup script section](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/SETUP.md#setup-via-script) below.


## Manual Steps

Make sure you have [git](http://git-scm.com/), [NodeJS](nodejs.org) and [npm](https://www.npmjs.org/doc/cli/npm.html) installed before you continue.


### Get Project + Dependencies

The following projects from the [bpmn-io](https://github.com/bpmn-io) project on GitHub

* [bpmn-js](https://github.com/bpmn-io/bpmn-js)
* [diagram-js](https://github.com/bpmn-io/diagram-js)
* [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle)
* [moddle](https://github.com/bpmn-io/moddle)
* [moddle-xml](https://github.com/bpmn-io/moddle-xml)

and clone them into a common directory via

```
git clone git@github.com:bpmn-io/PROJECT_NAME.git
```


### Link Projects

[Link dependent projects](http://blog.nodejs.org/2011/04/06/npm-1-0-link/) between each other to pick up changes immediately.

```
.
├─bpmn-js
│   └─node_modules
│       ├─diagram-js <link>
│       ├─moddle <link>
│       └─bpmn-moddle <link>
├─bpmn-moddle
│   └─node_modules
│       ├─moddle <link>
│       └─moddle-xml <link>
├─diagram-js
├─moddle
└─moddle-xml
    └─node_modules
        └─moddle <link>
```

#### On Linux

Use [npm-link](https://www.npmjs.org/doc/link.html) or `ln -s <target> <link>`.

#### On Windows

Use `mklink /d <link> <target>` [(docs)](http://technet.microsoft.com/en-us/library/cc753194.aspx).


### Install Dependencies

Execute `npm install` on each of the projects to grab their dependencies.


### Verify Things are O.K.

Execute `grunt` on each project. Things should be fine.


## Setup via Script

The whole setup can be automated through setup scripts for [Linux](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/setup.sh) and [Windows](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/setup.bat).
