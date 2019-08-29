# Changelog

All notable changes to [bpmn-js](https://github.com/bpmn-io/bpmn-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 5.0.4

* `FIX`: correct sequence flow layout after drop on flow ([#1178](https://github.com/bpmn-io/bpmn-js/issues/1178))

## 5.0.3

_Republish of `v5.0.2`._

## 5.0.2

* `FIX`: allow reconnecting to loops ([#1121](https://github.com/bpmn-io/bpmn-js/issues/1121))
* `CHORE`: bump to `diagram-js@5.0.1`

## 5.0.1

* `FIX`: import boundary event associations ([#1170](https://github.com/bpmn-io/bpmn-js/issues/1170))

## 5.0.0

* `FEAT`: add two-step copy and paste ([#1137](https://github.com/bpmn-io/bpmn-js/pull/1137))
* `FEAT` add `elements.create` rule for creating multiple elements ([#1137](https://github.com/bpmn-io/bpmn-js/pull/1137))
* `FEAT`: make containers draggable via their borders / labels only ([#1097](https://github.com/bpmn-io/bpmn-js/pull/1097), [#957](https://github.com/bpmn-io/bpmn-js/issues/957))
* `FEAT`: allow copied elements to be filtered ([#888](https://github.com/bpmn-io/bpmn-js/issues/888))
* `FIX`: prevent accidental dragging of participants and sub-processes ([#1097](https://github.com/bpmn-io/bpmn-js/pull/1097), [#957](https://github.com/bpmn-io/bpmn-js/issues/957))
* `FIX`: keep labels during pool extraction ([#921](https://github.com/bpmn-io/bpmn-js/issues/921))
* `FIX`: duplicate `bpmn:CategoryValue` when copying groups ([#1055](https://github.com/bpmn-io/bpmn-js/issues/1055))
* `FIX`: translate group creation entry in palette ([#1146](https://github.com/bpmn-io/bpmn-js/issues/1146))
* `CHORE`: use `element.copyProperty` event to copy category value when copying group ([`12bedca5`](https://github.com/bpmn-io/bpmn-js/pull/1137/commits/12bedca5ba2a05791591e53f554dc2310f6c1a6f))
* `CHORE`: bump to `diagram-js@5`

### Breaking Changes

Copy and paste as well as create is completely reworked:

* `CopyPaste`: remove `ModelCloneHelper` in favor of `ModdleCopy` service, remove `property.clone` event, add `moddleCopy.canCopyProperties`, `moddleCopy.canCopyProperty` and `moddleCopy.canSetCopiedProperty` event
* `BpmnRules`: removed `elements.paste` rule in favor of `elements.create` rule
* `BpmnRules`: removed `element.paste` rule
* `ElementFactory`: use `attrs.di` property instead of `attrs.colors` for fill and stroke when creating element through `ElementFactory#createBpmnElement`
* To prevent additional behavior on create after paste you should check for the `createElementsBehavior` hint, cf. [`bf180321`](https://github.com/bpmn-io/bpmn-js/commit/bf180321a3a40428c3f87b639b87cc3fc578066e#diff-2f0de25761fb7459e88071f83fd845c5R22)

## 4.0.4

* `FIX`: creating `bpmn:Participant` on single `bpmn:Group` throwing error ([#1133](https://github.com/bpmn-io/bpmn-js/issues/1133))
* `CHORE`: bump to `diagram-js@4.0.3`

## 4.0.3

* `FIX`: prevent dropping on labels and `bpmn:Group` elements ([#1131](https://github.com/bpmn-io/bpmn-js/pull/1131))

## 4.0.2

* `FIX`: correct element positioning update ([#1129](https://github.com/bpmn-io/bpmn-js/issues/1129))
* `CHORE`: bump to `diagram-js@4.0.2`

## 4.0.1

* `FIX`: prevent adding lane from crashing IE ([#746](https://github.com/bpmn-io/bpmn-js/issues/746))
* `FIX`: correct inverse space tool visuals ([#1105](https://github.com/bpmn-io/bpmn-js/issues/1105))
* `CHORE`: update `diagram-js-direct-editing` to prevent install warning
* `CHORE`: update to `diagram-js@4.0.1`

## 4.0.0

* `FEAT`: add top, right, bottom, left snapping with container elements ([#1108](https://github.com/bpmn-io/bpmn-js/pull/1108))
* `FEAT`: add grid snapping ([#987](https://github.com/bpmn-io/bpmn-js/pull/987))
* `FEAT`: allow modeling of groups ([#343](https://github.com/bpmn-io/bpmn-js/issues/343))
* `FEAT`: improve modeling rules behind event-based gateways ([#1006](https://github.com/bpmn-io/bpmn-js/pull/1006))
* `FEAT`: adjust default collapsed pool to standard height ([`5affe2570`](https://github.com/bpmn-io/bpmn-js/commit/5affe25705082937beace6b4a568f176a0527baf))
* `FEAT`: add connection previews ([#743](https://github.com/bpmn-io/bpmn-js/issues/743))
* `FEAT`: create expanded sub-process with start event included ([#1039](https://github.com/bpmn-io/bpmn-js/pull/1039))
* `FEAT`: improve automatic label adjustment for boundary events ([#1064](https://github.com/bpmn-io/bpmn-js/pull/1064))
* `FEAT`: improve creation of initial participant ([#1046](https://github.com/bpmn-io/bpmn-js/pull/1046))
* `FEAT`: improve boundary to host loop layout ([#1070](https://github.com/bpmn-io/bpmn-js/pull/1070))
* `FEAT`: make connection segment move the primary connection drag behavior
* `FEAT`: allow label and group movement everywhere ([#1080](https://github.com/bpmn-io/bpmn-js/pull/1080))
* `FEAT`: improve message flow to participant connection in the presence of lanes ([#950](https://github.com/bpmn-io/bpmn-js/issues/950))
* `FEAT`: allow detaching of boundary and attaching of intermediate events ([#1045](https://github.com/bpmn-io/bpmn-js/issues/1045))
* `FEAT`: simplify requested palette and context pad translations ([#1027](https://github.com/bpmn-io/bpmn-js/pull/1027))
* `FEAT`: simplify participant dragging in the presence of nested lanes ([`fdb299dc`](https://github.com/bpmn-io/bpmn-js/commit/fdb299dc888a7dcdb3f7674b6ed2a857864df457))
* `FEAT`: correctly render all kinds of multiple events ([#1091](https://github.com/bpmn-io/bpmn-js/pull/1091))
* `CHORE`: validate BPMN 2.0 XML ids as QNames ([`92c03679a`](https://github.com/bpmn-io/bpmn-js/commit/92c03679a4fd3c92a1c5ce3c97f7d366e2a5753a))
* `FIX`: correctly handle flow reconnection + type replacement ([#896](https://github.com/bpmn-io/bpmn-js/issues/896), [#1008](https://github.com/bpmn-io/bpmn-js/issues/1008))

### Breaking Changes

* `CHORE`: bump to [`diagram-js@4.0.0`](https://github.com/bpmn-io/diagram-js/blob/master/CHANGELOG.md#400)

## 3.5.0

* `FEAT`: restore `Viewer#importDefinitions` and make it public API ([#1112](https://github.com/bpmn-io/bpmn-js/pull/1112))

## 3.4.3

* `FIX`: prevent HTML injection in search ([diagram-js#362](https://github.com/bpmn-io/diagram-js/pull/362))

## 2.5.4

* `FIX`: prevent HTML injection in search ([diagram-js#362](https://github.com/bpmn-io/diagram-js/pull/362))
* `CHORE`: bump to `diagram-js@2.6.2`

## 3.4.2

* `FIX`: do not evaluate pasted text as HTML ([#1073](https://github.com/bpmn-io/bpmn-js/issues/1073))

## 2.5.3

* `FIX`: do not evaluate pasted text as HTML ([#1073](https://github.com/bpmn-io/bpmn-js/issues/1073))

## 3.4.1

_Republish of `v3.4.0` without `.git` folder._

## 3.4.0

* `FIX`: properly render colored connection markers ([#981](https://github.com/bpmn-io/bpmn-js/issues/981))
* `FEAT`: add ability to open different DI diagrams ([#87](https://github.com/bpmn-io/bpmn-js/issues/87))
* `FIX`: correctly layout straight boundary to target connections ([#891](https://github.com/bpmn-io/bpmn-js/issues/891))
* `FEAT`: resize participant to standard size on collapse ([#975](https://github.com/bpmn-io/bpmn-js/pull/975))
* `FEAT`: consistently layout connection on reconnect start and end ([#971](https://github.com/bpmn-io/bpmn-js/pull/971))
* `FEAT`: layout connection on element removal ([#989](https://github.com/bpmn-io/bpmn-js/issues/989))
* `FIX`: properly crop sequence flow ends on undo/redo ([#940](https://github.com/bpmn-io/bpmn-js/issues/940))
* `CHORE`: bump to [`diagram-js@3.3.0`](https://github.com/bpmn-io/diagram-js/blob/master/CHANGELOG.md#330)

## 3.3.1

* `FIX`: ignore unchanged direct editing completion
* `CHORE`: update to `diagram-js-direct-editing@1.4.2`

## 3.3.0

* `FEAT`: display `DataInput` / `DataOutput` labels ([`89719de3b`](https://github.com/bpmn-io/bpmn-js/commit/89719de3be50d9270227fd04216f7f19f0d018a2))
* `FEAT`: support basic `DataInput` / `DataOutput` move ([#962](https://github.com/bpmn-io/bpmn-js/pull/962))
* `FIX`: properly handle `DataInput` / `DataOutput` move ([#961](https://github.com/bpmn-io/bpmn-js/issues/961))

## 3.2.3

* `FIX`: update to `diagram-js-direct-editing@1.4.1` to trim trailing/leading whitespace in task names ([#763](https://github.com/bpmn-io/bpmn-js/issues/763))

## 3.2.2

* `FIX`: gracefully handle missing waypoints ([`45486f2`](https://github.com/bpmn-io/bpmn-js/commit/45486f2afe7f42fcac31be9ca477a7c94babe7d8))

## 3.2.1

* `FIX`: bump to `diagram-js@3.1.3` / `tiny-svg@2.2.1` to work around MS Edge bug ([`ed798a15`](https://github.com/bpmn-io/bpmn-js/commit/ed798a152539a613dbc9de9d61231ebbfb50987a))

## 3.2.0

* `FEAT`: set isHorizontal=true for new and updated participant/lane DIs ([#934](https://github.com/bpmn-io/bpmn-js/issues/934))

## 3.1.1

* `CHORE`: update to `diagram-js@3.1.1`

## 3.1.0

* `CHORE`: update to `diagram-js@3.1`

## 3.0.4

* `FIX`: render labels always on top ([#920](https://github.com/bpmn-io/bpmn-js/pull/920))

## 3.0.3

* `FIX`: do not join incoming/outgoing flows other than sequence flows on element deletion ([#917](https://github.com/bpmn-io/bpmn-js/issues/917))

## 3.0.2

* `FIX`: correct IE 11 delete keybinding ([#904](https://github.com/bpmn-io/bpmn-js/issues/904))

## 3.0.1

* `FIX`: restore copy-paste behavior

## 3.0.0

* `FEAT`: improve context pad tooltip titles for `EventBasedGateway` ([`350a5ab`](https://github.com/bpmn-io/bpmn-js/commit/350a5ab75ed675991599faff9615e4bbe184d491))
* `FEAT`: display group names ([#844](https://github.com/bpmn-io/bpmn-js/issues/844))
* `FEAT`: add ability to move selection with keyboard arrows ([#376](https://github.com/bpmn-io/bpmn-js/issues/376))
* `FEAT`: support `SHIFT` modifier to move elements / canvas with keyboard arrows at accelerated speed
* `FEAT`: require `Ctrl/Cmd` to be pressed as a modifier key to move the canvas via keyboard errors
* `FEAT`: auto-expand elements when children resize ([#786](https://github.com/bpmn-io/bpmn-js/issues/786))
* `CHORE`: bind editor actions and keyboard shortcuts for explicitly added features only ([#887](https://github.com/bpmn-io/bpmn-js/pull/887))
* `CHORE`: update to [`diagram-js@3.0.0`](https://github.com/bpmn-io/diagram-js/blob/master/CHANGELOG.md#300)
* `FIX`: disallow attaching of `BoundaryEvent` to a `ReceiveTask` following an `EventBasedGateway` ([#874](https://github.com/bpmn-io/bpmn-js/issues/874))
* `FIX`: fix date in license ([#882](https://github.com/bpmn-io/bpmn-js/pull/882))

### Breaking Changes

* `BpmnGlobalConnect` provider got removed. Use `connection.start` rule to customize whether connection should allowed to be started ([#565](https://github.com/bpmn-io/bpmn-js/issues/565), [#870](https://github.com/bpmn-io/bpmn-js/issues/870))
* `EditorActions` / `Keyboard` do not pull in features implicitly anymore. If you roll your own editor, include features you would like to ship with manually to provide the respective actions / keyboard bindings ([`645265ad`](https://github.com/bpmn-io/bpmn-js/commit/645265ad7e4a47e80657c671068a027752d7504f))
* Moving the canvas with keyboard arrows now requires the `Ctrl/Cmd` modifiers to be pressed.

## 2.5.2

* `FIX`: correct horizontal embedded label padding

## 2.5.1

* `FIX`: prevent error to be thrown on lane move ([#855](https://github.com/bpmn-io/bpmn-js/issues/855))

## 2.5.0

* `FEAT`: snap message flows to `bpmn:Event` center during connect ([#850](https://github.com/bpmn-io/bpmn-js/issues/850))
* `CHORE`: bump to `diagram-js@2.6.0`
* `FIX`: allow label movement over message flow ([#849](https://github.com/bpmn-io/bpmn-js/issues/849))

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

* `FEAT`: allow data store to be modeled between participants ([#483](https://github.com/bpmn-io/bpmn-js/issues/483))
* `CHORE`: update to [`diagram-js@2.0.0`](https://github.com/bpmn-io/diagram-js/blob/master/CHANGELOG.md#200)
* `FIX`: correctly handle missing `bpmndi:Label` bounds during model updating ([#794](https://github.com/bpmn-io/bpmn-js/issues/794))

### Breaking Changes

* The `PopupMenu` API got rewritten, cf. [`b1852e1d`](https://github.com/bpmn-io/diagram-js/pull/254/commits/b1852e1d71f67bd36ae1eb02748d2d0cbf124625)

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

* `CHORE`: convert code base to ES modules
* `CHORE`: update utility toolbelt

### Breaking Changes

* You must now configure a module transpiler such as Babel or Webpack to handle ES module imports and exports.

## 0.31.0

* `FEAT`: encode entities in body properties during XML export
* `CHORE`: bump to [`bpmn-moddle@4.0.0`](https://github.com/bpmn-io/bpmn-moddle/releases/tag/v4.0.0)
* `CHORE`: bump utility version

## 0.30.0

* `CHORE`: bump to [`diagram-js@0.31.0`](https://github.com/bpmn-io/diagram-js/releases/tag/v0.31.0)

## ...

Check `git log` for earlier history.
