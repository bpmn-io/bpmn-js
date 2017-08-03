# diagram-js

[![Build Status](https://travis-ci.org/bpmn-io/diagram-js.svg?branch=master)](https://travis-ci.org/bpmn-io/diagram-js)

A toolbox for displaying and modifying diagrams on the web.


## Hacking the Project

To get the development setup ready execute

```
npm install
```


### Testing

Execute `grunt auto-test` to run the test suite in watch mode.

Expose an environment variable `TEST_BROWSERS=(Chrome|Firefox|IE)` to execute the tests in a non-headless browser.


### Package

Execute `grunt` to lint and test the project and to generate (preliminary) documentation.

We do not generate any build artifacts. Required parts of the library should be bundled by modelers / viewers as needed instead.


### Example

You can find an example app build with diagram-js [here](/example).


## License

MIT