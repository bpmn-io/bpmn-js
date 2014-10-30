> The project is in an early development stage.
> For the time being, please refer to our [comprehensive test suite](https://github.com/bpmn-io/diagram-js/tree/master/test/spec) or [bpmn-js](https://github.com/bpmn-io/bpmn-js) for usage examples.


# diagram-js

[diagram-js](https://github.com/bpmn-io/diagram-js) is a toolbox for displaying and modifying diagrams on the web.


## Development

To get the development setup ready execute

```
npm install
```


### Building the Project

Execute `grunt auto-test` to run the test suite in watch mode.
Expose an environment variable `TEST_BROWSERS=(Chrome|Firefox|IE)` to execute the tests in a non-headless browser.


### Package

Execute `grunt` to lint and test the project and to generate (preliminary) documentation.

We do not generate any build artifacts. Instead required parts of the library are intended to be bundled by modelers / viewers built on top of it.
