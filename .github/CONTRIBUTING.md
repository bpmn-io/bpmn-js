# How to Contribute

Great to see you! Help us out by [filing bugs or feature requests](#working-with-issues), assisting others in our [forums](https://forum.bpmn.io/) or by [contributing improvements](#contributing-improvements).


## Table of Contents

* [Working with Issues](#working-with-issues)
    * [Creating an Issue](#creating-an-issue)
    * [Helping out](#helping-out)
* [Contributing Improvements](#contributing-improvements)
    * [Setting up the Project locally](#setting-up-the-project-locally)
    * [Discussing Code Changes](#discussing-code-changes)
    * [Creating a Pull Request](#creating-a-pull-request)


## Working with Issues

We use our [issue tracker](https://github.com/bpmn-io/bpmn-js/issues) for project communication, discussion and planning.


### Helping out

* Share your perspective on issues
* Be helpful and respect others when commenting


## Contributing Improvements

Learn how to setup the project locally, make changes and contribute bug fixes and new features through pull requests.

### Setting up the Project

The project development runs on top of the [diagram-js](https://github.com/bpmn-io/diagram-js) master branch. The following code snippet sets up both libraries linking diagram-js to bpmn-js.

```plain
mkdir bpmn.io
cd bpmn.io

git clone git@github.com:bpmn-io/diagram-js.git
(cd diagram-js && npm i)

git clone git@github.com:bpmn-io/bpmn-js.git
(cd bpmn-js && npm install && npm link ../diagram-js)

// Run the test suite
npm test

// Running the test suite with every file change
TEST_BROWSERS=(Chrome|Firefox|IE) npm run dev
```

For details consult our in depth [setup guide](https://github.com/bpmn-io/bpmn-js/blob/master/docs/project/SETUP.md).


### Discussing Code Changes

Create a [pull request](#creating-a-pull-request) if you would like to have an in-depth discussion about some piece of code.


### Code Style

In addition to our automatically enforced [lint rules](https://github.com/bpmn-io/eslint-plugin-bpmn-io), please adhere to the following conventions:

* Use modules (`import` / `export (default)`)
* __Do NOT__ use ES language constructs (`class`, `const`, ...) in sources

__Rationale:__ People should be able to consume parts of the library with an ES module aware bundler such as [Webpack](https://webpack.js.org/) or [Rollup](https://rollupjs.org) without the need to use a transpiler such as [Babel](https://babeljs.io/).


### Creating a Pull Request

We use pull requests for feature additions and bug fixes. If you are not yet familiar on how to create a pull request, [read this great guide](https://gun.io/blog/how-to-github-fork-branch-and-pull-request).

Some things that make it easier for us to accept your pull requests

* The code adheres to our conventions
    * spaces instead of tabs
    * single-quotes
    * ...
* The code is tested
* The `npm run all` build passes (executes tests + linting)
* The work is combined into a single commit
* The commit messages adhere to the [conventional commits guidelines](https://www.conventionalcommits.org)


We'd be glad to assist you if you do not get these things right in the first place.


:heart: from the bpmn.io team.
