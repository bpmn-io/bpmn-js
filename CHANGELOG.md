# Changelog

All notable changes to [bpmn-js](https://github.com/bpmn-io/bpmn-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

### Breaking Changes

* `CHORE`: update to [`diagram-js@2.1.1`](https://github.com/bpmn-io/diagram-js/blob/master/CHANGELOG.md#211)

## 1.3.3

* `CHORE`: update to [`bpmn-moddle@5.1.5`](https://github.com/bpmn-io/bpmn-moddle/blob/master/CHANGELOG.md#515)

## 1.3.2

* `FIX`: correctly serialize extension attributes on `bpmn:Expression`

## 1.3.1

* `FIX`: correctly auto-place from boundary events attached to host edges ([#788](https://github.com/bpmn-io/bpmn-js/issues/788))

## 1.3.0

* `FEAT`: expose additional `BpmnTreeWalker` APIs for advanced import use-cases
* `CHORE`: bump diagram-js and object-refs version

## 1.2.1

* `FIX`: correct side-effects config to not include `*.css` files

## 1.2.0

* `FEAT`: add initial snapping when creating associations
* `CHORE`: update to `diagram-js@1.3.0`
* `FIX`: allow message flows between collapsed pools
* `FIX`: complete direct editing on popup menu use
* `FIX`: focus label editing box on element creation

## 1.1.1

* `FIX`: escape `data-element-id` in CSS selectors

## 1.1.0

* `FEAT`: show gateway icon on context pad without marker ([`15dfab6b`](https://github.com/bpmn-io/bpmn-js/commit/15dfab6b5b12dd184acf070f2ab3ad205d1b245c))

## 1.0.4

* `FIX`: properly wire `$parent` on copy + paste
* `FIX`: improve boundary event rendering to correct SVG to image conversion

## 1.0.3

* `FIX`: re-expose `TestHelper#bootstrapBpmnJS` util

## 1.0.2

* `FIX`: correct library default export

## 1.0.1

_Republished 1.0.0 with CHANGELOG entries._

## 1.0.0

### Breaking Changes

* `CHORE`: convert code base to ES modules. You must now configure a module transpiler such as Babel or Webpack to handle ES module imports and exports
* `CHORE`: update utility toolbelt

## 0.31.0

* `FEAT`: encode entities in body properties during XML export
* `CHORE`: bump to [`bpmn-moddle@4.0.0`](https://github.com/bpmn-io/bpmn-moddle/releases/tag/v4.0.0)
* `CHORE`: bump utility version

## 0.30.0

* `CHORE`: bump to [`diagram-js@0.31.0`](https://github.com/bpmn-io/diagram-js/releases/tag/v0.31.0)

## ...

Check `git log` for earlier history.