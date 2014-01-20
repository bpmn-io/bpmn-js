# diagram.js

`diagram.js` is a toolbox for displaying and modifying diagrams on the web.


## Setup

`npm install`
`bower install`


## Grunt Tasks

There are a number of grunt tasks available to develop, test and build the system for deployment.

#### Development

*   `auto-test` - starts the test environment in watch mode and continuously reexecutes tests on changes
*   `auto-build` - starts in watch mode and continuously packages the environment for production


#### Packaging

Simply execute `grunt`.

Building the library includes testing, packaging and generating documentation. The final artifacts will be generated to `doc/` (documentation) and `build/` (modules) respectively.
