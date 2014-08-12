# Commit Messages

Contributors should adhere to our [commit message guidelines](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit?pli=1).

The goal is to achive better readability of the projects commit log and eventually use the log as a low level change tracker.

```plain
feat(context-pad): add delete button
fix(modeling): assign valid semantic ids
fix(Viewer): correctly fire imported event
fix(core): handle missing BPMNPlane during import
```

It is important for [semantic versioning](http://semver.org/) during releases and for project change tracking.


## General Syntax

```plain
<what>(<component>): <present-tense-description>

<longer-description>

Closes #<issue-number>

[BREAKING CHANGE:

* migration notes ]
```


## Hints

Consider the following hints when writing commit messages

* Classify what you did

   * `fix` commit fixes a bug, patches the project
   * `feat` commit adds a feature, increases the minor version
   * `docs` commit improves or adds documentation
   * `refactor` commit cleans up mess in a non-api-breaking manner

* State the module your change applies to

   * `viewer` commit changes viewer code
   * `context-pad` commit alters context pad
   * `modeling/BpmnFactory` commit fixes a specific bug in the `BpmnFactory` (use in rare important cases only)
   * use lower case for modules, camelCase for files (according to file names)

* beware of public api (everything that has been blogged about on [bpmn.io](http://bpmn.io/blog))

  * mark breaking public api via `BREAKING CHANGE: ...`

* try not to swallow bug fixes (`fix`) in feature commits (`feat`). People may wait for a fixes forever.


## Examples

```plain
feat(modeler): add create diagram option

This commit adds the ability to create a new diagram in the modeler via

Modeler#createDiagram(done)

Related to #12
```


```plain
fix(modeling): generate valid semantic ids

IDs in XML documents must not start with a number as per XML spec.

This commit changes our id generation behavior to use semantic ids that
are prefixed with the elements type (never starts with a number):

Before: asdas123se8as
Now: StartEvent_asdas123se8as

Closes #108
```
