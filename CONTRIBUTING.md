# How to contribute

We love you to contribute to this project by filing bugs, helping others on the [issue tracker](https://github.com/bpmn-io/bpmn-js/issues), by contributing features/bug fixes through pull requests or by helping out in our [forums](https://forum.bpmn.io/).


## Creating issues

We use our [issue tracker](https://github.com/bpmn-io/bpmn-js/issues) for project communication.
When using the issue tracker:

* Be descriptive when creating an issue (what, where, when and how does a problem pop up)?
* Attach steps to reproduce (if applicable)
* Attach code samples, configuration options or stack traces that may indicate a problem
* Be helpful and respect others when commenting

Create a pull request if you would like to have an in-depth discussion about some piece of code.


## Setting up the project locally

The project development runs on top of the [diagram-js](https://github.com/bpmn-io/diagram-js) master branch. The following code snippet sets up both libraries linking diagram-js to bpmn-js.
    
    mkdir bpmn.io
    cd bpmn.io

    git clone git@github.com:bpmn-io/diagram-js.git
    (cd diagram-js && npm i)

    git clone git@github.com:bpmn-io/bpmn-js.git
    (cd bpmn-js && npm install && npm link ../diagram-js)
    
    // Run the test suite
    grunt
    
    // Running the test suite with every file change
    TEST_BROWSERS=(Chrome|Firefox|IE) grunt auto-test


## Creating pull requests

We use pull requests for feature discussion and bug fixes. If you are not yet familiar on how to create a pull request, [read this great guide](https://gun.io/blog/how-to-github-fork-branch-and-pull-request).

Some things that make it easier for us to accept your pull requests

* The code adheres to our conventions
    * spaces instead of tabs
    * single-quotes
    * ...
* The code is tested
* The `grunt` build passes (executes tests + linting)
* The work is combined into a single commit
* The commit messages adhere to our [guideline](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y)


We'd be glad to assist you if you do not get these things right in the first place.
