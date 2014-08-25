# Project Setup

This document describes the necessary steps to setup a `bpmn-js` development environment.


## TLDR;

On Linux/Unix? [git](http://git-scm.com/), [NodeJS](nodejs.org) and [npm](https://www.npmjs.org/doc/cli/npm.html) ready? Check out the [setup script section](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/SETUP.md#setup-via-script) below.


## Manual Steps

Make sure you have [git](http://git-scm.com/), [NodeJS](nodejs.org) and [npm](https://www.npmjs.org/doc/cli/npm.html) installed before you continue.


### Get Project + Dependencies

The following projects from the [bpmn-io](https://github.com/bpmn-io) project on GitHub

* [bpmn-js](https://github.com/bpmn-io/bpmn-js)
* [diagram-js](https://github.com/bpmn-io/bpmn-js)
* [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle)
* [moddle](https://github.com/bpmn-io/bpmn-js)
* [moddle-xml](https://github.com/bpmn-io/bpmn-js)

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

Execute `grunt` on any of the projects. Things should be nice.


## Setup via Script

The whole setup can be automated through setup scripts for [Linux](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/setup.sh) and [Windows](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/SETUP.bat). 

```bash
#!/bin/bash

base=`pwd`

echo cloning repositories

git clone git@github.com:bpmn-io/diagram-js.git > /dev/null
git clone git@github.com:bpmn-io/diagram-js-direct-editing.git > /dev/null
git clone git@github.com:bpmn-io/moddle.git > /dev/null
git clone git@github.com:bpmn-io/moddle-xml.git > /dev/null
git clone git@github.com:bpmn-io/bpmn-js.git > /dev/null
git clone git@github.com:bpmn-io/bpmn-moddle.git > /dev/null
git clone git@github.com:bpmn-io/ids.git > /dev/null

echo done.

echo setup diagram-js

cd $base/diagram-js
npm install > /dev/null


echo setup moddle

cd $base/moddle
npm install > /dev/null


echo setup moddle-xml

cd $base/moddle-xml
mkdir node_modules
ln -s $base/moddle node_modules/moddle
npm install > /dev/null


echo setup bpmn-moddle

cd $base/bpmn-moddle
mkdir node_modules
ln -s $base/moddle node_modules/moddle
ln -s $base/moddle-xml node_modules/moddle-xml
npm install > /dev/null

echo setup diagram-js-direct-editing

cd $base/diagram-js-direct-editing
mkdir node_modules
ln -s $base/diagram-js node_modules/diagram-js
npm install > /dev/null

echo setup ids

cd $base/ids
npm install > /dev/null

echo setup bpmn-js

cd $base/bpmn-js
mkdir node_modules
ln -s $base/moddle node_modules/moddle
ln -s $base/bpmn-moddle node_modules/bpmn-moddle
ln -s $base/diagram-js node_modules/diagram-js
ln -s $base/diagram-js-direct-editing node_modules/diagram-js-direct-editing
ln -s $base/ids node_modules/ids
npm install > /dev/null

echo all done.
```
