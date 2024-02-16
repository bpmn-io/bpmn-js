# How to Contribute

Great to see you! Help us out by [filing bugs or feature requests](#work-with-issues), assisting others [in our forums](https://forum.bpmn.io/), or [contributing improvements](#contribute-improvements).


## Table of Contents

* [Work with Issues](#work-with-issues)
    * [Create an Issue](#Create-an-issue)
    * [Help Out](#help-out)
* [Contribute Improvements](#contribute-improvements)
    * [Setup the Project](#Setup-the-project)
    * [Build and Run the Project](#build-and-run-the-project)
    * [Discuss Code Changes](#discuss-code-changes)
    * [Adhere to the Code Style](#adhere-to-the-code-style)
    * [Adhere to the Unit Test Style](#adhere-to-the-unit-test-style)
    * [Create a Pull Request](#create-a-pull-request)


## Work with Issues

We use our [issue tracker](https://github.com/bpmn-io/bpmn-js/issues) for project communication, discussion, and planning.

### Create an Issue

File bug reports or feature requests via [our issue tracker](https://github.com/bpmn-io/bpmn-js/issues/new/choose). Please mind the existing issue templates. These guide you and ensure you provide the details needed for us to follow up on your issue.

### Help Out

* Share your perspective on issues
* Be helpful and respect others when commenting


## Contribute Improvements

Learn how to set up the project locally, make changes, and contribute bug fixes and new features through pull requests.

### Setup the Project

The project development runs on top of the [diagram-js](https://github.com/bpmn-io/diagram-js) `develop` branch. The following code snippet sets up both libraries linking diagram-js to bpmn-js.

```sh
mkdir bpmn.io
cd bpmn.io

git clone git@github.com:bpmn-io/diagram-js.git -b develop
(cd diagram-js && npm i)

git clone git@github.com:bpmn-io/bpmn-js.git
(cd bpmn-js && npm install && npm link ../diagram-js)
```

For details consult our in depth [setup guide](../docs/project/SETUP.md).


### Build and Run the Project

Spin up a single modeler instance for local inspection:

```sh
npm start
```

Spin up the development environment, re-run tests with every file change:

```sh
npm run dev
```

You may also run against different browsers:

```sh
TEST_BROWSERS=Firefox npm run dev
```

Build, lint, and test the project, just as the CI does.

```sh
npm run all
```


### Discuss Code Changes

Create a [pull request](#create-a-pull-request) if you would like to have an in-depth discussion about some piece of code.

### Adhere to the Unit Test Style

In order to retrieve a sign-off for your contribution, it needs to be sufficiently and well tested. Please structure your unit tests into **given**, **when** and **then** ([ModelerSpec example](https://github.com/bpmn-io/bpmn-js/blob/develop/test/spec/ModelerSpec.js#L116), [ResizeBehaviorSpec example](https://github.com/bpmn-io/bpmn-js/blob/develop/test/spec/features/modeling/behavior/ResizeBehaviorSpec.js#L38)). To increase overall readability and understandability please also leave two empty lines before `describe(...)`, `it(...)` or *setup* blocks on the same indentation level ([ModelerSpec example](https://github.com/bpmn-io/bpmn-js/blob/develop/test/spec/ModelerSpec.js#L49), [ResizeBehaviorSpec example](https://github.com/bpmn-io/bpmn-js/blob/develop/test/spec/features/modeling/behavior/ResizeBehaviorSpec.js#L36)).

### Create a Pull Request

We use pull requests for feature additions and bug fixes. If you are not yet familiar with pull requests, [read this excellent guide](https://gun.io/blog/how-to-github-fork-branch-and-pull-request).

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


---

Thanks for your interest in our library.

:heart: from the bpmn.io team.
