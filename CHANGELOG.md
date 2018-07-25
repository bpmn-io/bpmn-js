# Changelog

All notable changes to [bpmn-js](https://github.com/bpmn-io/bpmn-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 2.4.1

* `FIX`: make viewer IE 9 compatible
* `FIX`: prevent duplicate connections after drop on flow ([#774](https://github.com/bpmn-io/bpmn-js/issues/774))
* `FIX`: fix rules not preventing redundant loop ([#836](https://github.com/bpmn-io/bpmn-js/issues/836))

## 2.4.0

* `FEAT`: improve layouting of boundary event to host loops ([#467](https://github.com/bpmn-io/bpmn-js/issues/467))
* `FEAT`: allow circular activity to activity loops ([#824](https://github.com/bpmn-io/bpmn-js/issues/824))
* `FEAT`: create label on appropriate free position ([#825](https://github.com/bpmn-io/bpmn-js/issues/825))
* `CHORE`: bump to `diagram-js@2.5.0`
* `FIX`: repair label position not being adapted on host move

## 2.3.1

* `FIX`: revert to `Arial` as the default rendering font ([#819](https://github.com/bpmn-io/bpmn-js/issues/819))
* `FIX`: keep event definitions when switching from interrupting to non-interrupting boundary event ([#799](https://github.com/bpmn-io/bpmn-js/issues/799))

## 2.3.0

* `CHORE`: update to `diagram-js@2.4.0`

## 2.2.1

* `FIX`: correct updating of multiple data stores ([`300e7010`](https://github.com/bpmn-io/bpmn-js/commit/300e7010c4e1862394d147988dc4c4bcc09b07bc))

## 2.2.0

* `FEAT`: emit export events ([#813](https://github.com/bpmn-io/bpmn-js/issues/813))
* `FEAT`: unset businessObject name if empty ([`6c081d85`](https://github.com/bpmn-io/bpmn-js/commit/6c081d854fa8a4e87eb7cdd1744be37c78652667))
* `FEAT`: resize text annotation on text change ([`100f3fb2`](https://github.com/bpmn-io/bpmn-js/commit/100f3fb2ee6373cd4b7ad0b76e520a1afb70887e))
* `FIX`: apply data store behavior in collaboration only ([`5cc28d5d`](https://github.com/bpmn-io/bpmn-js/commit/5cc28d5d5571287a798b189aed75095f1fd0189e))
* `FIX`: create/update labels when updating element name via `Modeling#updateProperties` ([`4a0f6da8`](https://github.com/bpmn-io/bpmn-js/commit/4a0f6da814c45268e8a324e73a53479bd2435bbe))

## 2.1.0

* `FEAT`: support specifying `lineHeight` for text rendering ([#256](https://github.com/bpmn-io/diagram-js/pull/256))
* `FEAT`: `bpmn:LaneSet` elements get an ID assigned on creation
* `FEAT`: external labels can be deleted, clearing the elements name ([#791](https://github.com/bpmn-io/bpmn-js/pull/791))
* `FEAT`: add ability to override default element colors ([#713](https://github.com/bpmn-io/bpmn-js/issues/713))
* `FEAT`: add ability to override font family and size of rendered labels ([`4bb270f1`](https://github.com/bpmn-io/bpmn-js/commit/4bb270f19279db40f9cc3c179e09ee3a9a114e7c))

## 2.0.1

_Republish of `v2.0.0` due to registry error._

## 2.0.0

### Breaking Changes

* `CHORE`: update to [`diagram-js@2.0.0`](https://github.com/bpmn-io/diagram-js/blob/master/CHANGELOG.md#200)

## Other Improvements

* `FEAT`: allow data store to be modeled between participants ([#483](https://github.com/bpmn-io/bpmn-js/issues/483))
* `FIX`: correctly handle missing `bpmndi:Label` bounds during model updating ([#794](https://github.com/bpmn-io/bpmn-js/issues/794))

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