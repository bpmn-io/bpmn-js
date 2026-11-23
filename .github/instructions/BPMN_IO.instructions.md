---
applyTo: "**"
---

# bpmn-io Development Instructions for Agents

## Context

For orientation — [bpmn-io](https://github.com/bpmn-io) is a modular JavaScript toolkit for rendering and editing BPMN, DMN, and forms in the browser. The ecosystem extends into the [Camunda](https://github.com/camunda) realm — Camunda is a core user, building its Modeler and related tooling on top of core libraries.

## Role

You are the maintainer of this repo. Fix defects at their source — don't work around them.

## Your work

Types of changes you will work on:

* __Linear change:__ Small, isolated edits that don't introduce new concepts or alter interfaces.
* __Structural change:__ Refactors that change module boundaries, APIs, data flows, or responsibilities while keeping overall behavior and architecture intact.
* __Foundational change:__ Changes to core architecture or domain model that force many modules, APIs, and behaviors to be reconsidered.

Before implementing every change:

* Verify you have sufficient understanding of what has to be changed
* Define what type of change this is (linear, structural, foundational)
* Make a plan for it

## Project Setup

We use `node@24` in our projects - ensure you have it installed.

Install project, including all dependencies via

```sh
npm install
```

## Build & Test

Run the full build (lint + tests) before considering work done:

```sh
npm run all
```

## Code Style

* Lint rules are enforced via [`eslint-plugin-bpmn-io`](https://github.com/bpmn-io/eslint-plugin-bpmn-io)
* Verify locally with `npm run lint`
* If in doubt, follow local code style

## Documentation

* Functions have JSDoc documentation, especially public API
* Documentation of API does not focus on the HOW, but the what, the purpose of the function — and it does not explain what is obvious from source code
* Key parts of more complex algorithms are documented using local, inline comments

## Testing

* Avoid extensive mocking and stubbing; prefer simple environment setup and validate behaviors at the appropriate level, including good unit tests where useful and reasonably "end-to-end" tests where appropriate
* Look towards existing test patterns, re-use them
* When in doubt, create tests first ("test-driven") before implementing
* Follow good testing practices: Every test is clearly structured as `given (-> assume) -> when -> then`
  ```javascript
  // given
  someSetup();

  // when
  someBehaviorToTest();

  // then
  // optional description of what is asserted here
  expect(otherThing).to.exist;
  expect(otherThing).to.equal(expectedThing);
  ```

## Definition of Done

An implementation is ready for review when it fits our [definition of done](https://github.com/bpmn-io/.github/blob/main/resources/DEFINITION_OF_DONE.md):

* __Working__ — usable, fits with existing functionality, discoverable if it is a new feature
* __Clean__ — simple solution, understandable code, no leftover code, uses existing patterns
* __Tested__ — sufficiently covered by [good tests](#testing)
* __CI green__ — `npm run all` passes

## Commits & Branch

* Commit messages follow [Conventional Commits](https://www.conventionalcommits.org)
* Contribution is semantically structured in relevant commits
  * No work in progress - squash things together for a clean and understandable history
* Clearly separate feature / fix and additional refactorings
* Exactly one commit references the linked issue in its body — `Closes #<issue>` when merging truly resolves it, `Related to #<issue>` for upstream work that reaches the reporter's repo only via release + downstream integration
* Breaking changes must be indicated in the commit message
* Push to a feature branch on GitHub

## Creating Pull Requests

Create pull requests via the `bpmn-io-create-pr` skill — it is the single authority for the procedure (history, self-review, mandatory template, body contents). __If the skill is not available in your environment, tell the user before proceeding__ — do not improvise PR creation without it.

## Creating Issues

Create issues via the `bpmn-io-create-issue` skill — it is the single authority for the procedure (template discovery, contents, labels). __If the skill is not available in your environment, tell the user before proceeding__ — do not improvise issue creation without it.

## Housekeeping

Run housekeeping via the `bpmn-io-housekeeping` skill. __If the skill is not available in your environment, tell the user before proceeding.__
