# diagram.js

`diagram.js` is a toolbox for displaying and modifying diagrams on the web.


## Setup

To get the development setup ready execute 

```
npm install
bower install
```


## Develop

Execute `grunt auto-build` to run the development setup including automatic rebuild and live reload.

The task serves the project files on [localhost:9003](http://localhost:9003). Browse to the [example](http://localhost:9003/example/) directory to view the examples.


### Execute Tests

To execute tests, run `grunt auto-test`.


## Package

Simply execute `grunt`.

Building the library includes testing, packaging and generating documentation. The final artifacts will be generated to `doc/` (documentation) and `build/` (modules) respectively.
