# Changelog

All notable changes to [bpmn-js](https://github.com/bpmn-io/bpmn-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 12.0.0

* `FEAT`: move `create-append-anything` to [external module](https://github.com/bpmn-io/bpmn-js-create-append-anything) ([#1873](https://github.com/bpmn-io/bpmn-js/pull/1873), [#1862](https://github.com/bpmn-io/bpmn-js/issues/1862))
* `CHORE`: use `diagram-js@11.11.0` built-in selection after replace feature ([#1857](https://github.com/bpmn-io/bpmn-js/pull/1857))
* `DEPS`: update to `diagram-js@11.12.0`

### Breaking Changes

* The create/append anything features moved to an [external module](https://github.com/bpmn-io/bpmn-js-create-append-anything). Include it to restore the `v11` create/append behavior.

## 11.5.0

* `FEAT`: add root elements to definitions when provided via `modeling#update(Moddle)Properties`

## 11.4.1

* `FIX`: correct redo triggering on international keyboard layouts ([#1842](https://github.com/bpmn-io/bpmn-js/issues/1842))

## 11.4.0

* `FEAT`: translate append menu entry labels and groups ([#1810](https://github.com/bpmn-io/bpmn-js/pull/1810))
* `FEAT`: activate direct editing on participant creation ([#1845](https://github.com/bpmn-io/bpmn-js/pull/1845))
* `FIX`: dragging append menu entries creates element connection ([#1843](https://github.com/bpmn-io/bpmn-js/pull/1843))
* `FIX`: append shortcut triggers create menu if append not allowed ([#1840](https://github.com/bpmn-io/bpmn-js/issues/1840))
* `FIX`: restore marker rendering workaround ([`9c6e475`](https://github.com/bpmn-io/bpmn-js/commit/9c6e475681dd6b6a418b2fbc1dac19a9df360953))

## 11.3.1

_Republish of `v11.3.0`._

## 11.3.0

* `FEAT`: feature `service` and `user` tasks more prominently in replace menu ([#1836](https://github.com/bpmn-io/bpmn-js/pull/1836))
* `FEAT`: hide rare items initially from create/append menus ([#1836](https://github.com/bpmn-io/bpmn-js/pull/1836))
* `FEAT`: retrieve instantiation modules with context ([#1835](https://github.com/bpmn-io/bpmn-js/pull/1835))
* `DEPS`: update to `diagram-js@11.9.0`

## 11.2.0

_Adds create/append anything._

* `FEAT`: append menu available via context pad ([#1802](https://github.com/bpmn-io/bpmn-js/pull/1802), [#1809](https://github.com/bpmn-io/bpmn-js/pull/1809), [#1815](https://github.com/bpmn-io/bpmn-js/pull/1815), [#1818](https://github.com/bpmn-io/bpmn-js/pull/1818), [#1831](https://github.com/bpmn-io/bpmn-js/pull/1831))
* `FEAT`: create menu available via palette ([#1811](https://github.com/bpmn-io/bpmn-js/pull/1811), [#1809](https://github.com/bpmn-io/bpmn-js/pull/1809), [#1817](https://github.com/bpmn-io/bpmn-js/pull/1817))
* `FEAT`: simplify connection-multi icon ([#1822](https://github.com/bpmn-io/bpmn-js/pull/1822))
* `FEAT`: join paths `round` by default ([1827](https://github.com/bpmn-io/bpmn-js/pull/1827))
* `FEAT`: improved BPMN symbol rendering ([#1830](https://github.com/bpmn-io/bpmn-js/pull/1830))
* `FEAT`: round connection corners ([#1828](https://github.com/bpmn-io/bpmn-js/pull/1828))
* `FEAT`: improve visibility of popup menu ([#1812](https://github.com/bpmn-io/bpmn-js/issues/1812))
* `FIX`: missing special attributes in `bpmnElementFactory` ([#1807](https://github.com/bpmn-io/bpmn-js/pull/1807))
* `FIX`: handle `bpmn:DataObjectReference` without data object in replace menu ([#1823](https://github.com/bpmn-io/bpmn-js/pull/1823))
* `DEPS`: update to `diagram-js@11.8.0`

## 11.1.1

* `FIX`: correct popup menu display in fullscreen ([#1795](https://github.com/bpmn-io/bpmn-js/issues/1795))
* `DEPS`: update to `diagram-js@11.4.3`

## 11.1.0

* `FEAT`: add replace element keyboard binding ([#1785](https://github.com/bpmn-io/bpmn-js/pull/1785))
* `FEAT`: add `replaceElement` editor action ([#1785](https://github.com/bpmn-io/bpmn-js/pull/1785))
* `DEPS`: update to `diagram-js@11.4.1`

## 11.0.5

* `DEPS`: update to `diagram-js@11.3.0`

## 11.0.4

* `DEPS`: update to `diagram-js@11.2.0`

## 11.0.3

_Re-release of `v11.0.2`._

## 11.0.2

* `FIX`: correct test for replace options ([#1787](https://github.com/bpmn-io/bpmn-js/pull/1787))

## 11.0.1

* `DEPS`: update to `diagram-js@11.1.1`

## 11.0.0

_Reworks popup menu UI._

* `FEAT`: integrate new popup menu UI ([#1776](https://github.com/bpmn-io/bpmn-js/pull/1776))
* `DEPS`: update to `diagram-js@11.1.0` ([#1776](https://github.com/bpmn-io/bpmn-js/pull/1776))

### Breaking Changes

* New popup menu UI introduced with `diagram-js@11`. See [`diagram-js` breaking changes and migration guide](https://github.com/bpmn-io/diagram-js/blob/develop/CHANGELOG.md#breaking-changes).
* Keyboard-related features no longer use `KeyboardEvent#keyCode`. Use a polyfill (e.g. [keyboardevent-key-polyfill](https://www.npmjs.com/package/keyboardevent-key-polyfill)) if you need to support old browsers.

## 10.3.0

* `FEAT`: add BPMN specific space tool ([#1344](https://github.com/bpmn-io/bpmn-js/pull/1344))
* `FIX`: do not resize `bpmn:TextAnnotation` when using space tool ([#1344](https://github.com/bpmn-io/bpmn-js/pull/1344))
* `FIX`: correct attachers left hanging when using space tool ([#1344](https://github.com/bpmn-io/bpmn-js/pull/1344))
* `FIX`: stick labels to label targets when using space tool ([#1344](https://github.com/bpmn-io/bpmn-js/pull/1344), [#1302](https://github.com/bpmn-io/bpmn-js/issues/1302))
* `DEPS`: update to `diagram-js@10`

## 10.2.1

* `FIX`: correct preserving of outgoing connections on event-based gateway morph ([#1738](https://github.com/bpmn-io/bpmn-js/issues/1738))

## 10.2.0

* `DEPS`: update to `bpmn-moddle@8`

## 10.1.0

* `DEPS`: update to `diagram-js@9.1.0`

## 10.0.0

_Updates the library target to ES2018._

* `FEAT`: use ES2018 syntax ([#1737](https://github.com/bpmn-io/bpmn-js/pull/1737))

### Breaking Changes

* Migrated to ES2018 syntax. [Read the blog post with details and a migration guide](https://bpmn.io/blog/posts/2022-migration-to-es2018.html).

## 9.4.1

* `FIX`: ignore elements which cannot be colored ([#1734](https://github.com/bpmn-io/bpmn-js/pull/1734))

## 9.4.0

* `FEAT`: allow clipboard to be serialized ([#1707](https://github.com/bpmn-io/bpmn-js/pull/1707))
* `FEAT`: allow cloning of elements ([#1707](https://github.com/bpmn-io/bpmn-js/pull/1707))
* `FEAT`: copy groups in a safe manner ([#1707](https://github.com/bpmn-io/bpmn-js/pull/1707))
* `FIX`: make clipboard contents immutable ([#1707](https://github.com/bpmn-io/bpmn-js/pull/1707))
* `FIX`: do not alter inputs passed to `ElementFactory#create` ([#1711](https://github.com/bpmn-io/bpmn-js/pull/1711))
* `FIX`: prevent bogus meta-data to be attached on paste ([#1707](https://github.com/bpmn-io/bpmn-js/pull/1707))
* `FIX`: only claim existing IDs ([#1707](https://github.com/bpmn-io/bpmn-js/pull/1707))
* `FIX`: prevent double paste on label creation ([#1707](https://github.com/bpmn-io/bpmn-js/pull/1707))
* `FIX`: move labels when collapsing sub-process ([#1695](https://github.com/bpmn-io/bpmn-js/issues/1695))
* `FIX`: assign default size when expanding element ([#1687](https://github.com/bpmn-io/bpmn-js/issues/1687))
* `FIX`: render sequence flows always on top ([#1716](https://github.com/bpmn-io/bpmn-js/issues/1716))
* `DEPS`: update to `diagram-js@8.9.0`
* `DEPS`: update to `bpmn-moddle@7.1.3`

## 9.3.2

* `FIX`: prevent unnecessary scrollbar ([#1692](https://github.com/bpmn-io/bpmn-js/issues/1692))
* `FIX`: check for replacement using actual target ([#1699](https://github.com/bpmn-io/bpmn-js/pull/1699))
* `DEPS`: update to `diagram-js@8.7.1`

## 9.3.1

* `FIX`: properly size icons for distribute/align menu ([#1694](https://github.com/bpmn-io/bpmn-js/pull/1694))

## 9.3.0

* `FEAT`: add aligment and distribution menu ([#1680](https://github.com/bpmn-io/bpmn-js/issues/1680), [#1691](https://github.com/bpmn-io/bpmn-js/issues/1691))
* `DEPS`: update to `diagram-js@8.7.0`

## 9.2.2

* `FIX`: correctly toggle loop characteristics ([#1673](https://github.com/bpmn-io/bpmn-js/issues/1673))

## 9.2.1

* `FIX`: cancel direct editing before shape deletion ([#1677](https://github.com/bpmn-io/bpmn-js/issues/1677))

## 9.2.0

* `FEAT`: rework select and hover interaction on the diagram ([#1616](https://github.com/bpmn-io/bpmn-js/issues/1616), [#640](https://github.com/bpmn-io/diagram-js/pull/640), [#643](https://github.com/bpmn-io/diagram-js/pull/643))
* `FEAT`: rework diagram interaction handles ([#640](https://github.com/bpmn-io/diagram-js/pull/640))
* `FEAT`: clearly distinguish select and hover states ([#1616](https://github.com/bpmn-io/bpmn-js/issues/1616))
* `FEAT`: allow text annotation on sequence flows ([#1652](https://github.com/bpmn-io/bpmn-js/pull/1652))
* `FEAT`: add multi-element context pad ([#1525](https://github.com/bpmn-io/bpmn-js/pull/1525))
* `FEAT`: change default color to off black ([#1656](https://github.com/bpmn-io/bpmn-js/pull/1656))
* `FEAT`: select connection after connect ([#644](https://github.com/bpmn-io/diagram-js/pull/644))
* `FIX`: copy elements with `string` extension properties ([#1518](https://github.com/bpmn-io/bpmn-js/issues/1518))
* `FIX`: cancel direct editing before shape deletion ([#1664](https://github.com/bpmn-io/bpmn-js/issues/1664))
* `FIX`: remove connection on source connection deletion ([#1663](https://github.com/bpmn-io/bpmn-js/issues/1663))
* `FIX`: set correct label color when batch coloring elements ([#1653](https://github.com/bpmn-io/bpmn-js/issues/1653))
* `FIX`: always reconnect labels and associations ([#1659](https://github.com/bpmn-io/bpmn-js/pull/1659))
* `FIX`: correct connection drop highlighting
* `DEPS`: replace `inherits` with `inherits-browser`
* `DEPS`: bump to `diagram-js@8.5.0`

## 9.1.0

* `FEAT`: allow to select participant and subprocess via click on body ([#1646](https://github.com/bpmn-io/bpmn-js/pull/1646))
* `FIX`: comply with strict style-src CSP ([#1625](https://github.com/bpmn-io/bpmn-js/issues/1625))
* `FIX`: complete direct editing when selection changes ([#1648](https://github.com/bpmn-io/bpmn-js/pull/1648))
* `DEPS`: update to `diagram-js@8.3.0`
* `DEPS`: update to `min-dom@3.2.0`

## 9.0.4

* `FIX`: remove `label` property on empty label ([#1637](https://github.com/bpmn-io/bpmn-js/issues/1637))
* `FIX`: create drilldown overlays on `viewer.open` ([`574a67438`](https://github.com/bpmn-io/bpmn-js/commit/574a674381d6449b509396b6d17c4ca94674ea1c))
* `FIX`: render data association inside collapsed sub-processes ([#1619](https://github.com/bpmn-io/bpmn-js/issues/1619))
* `FIX`: preserve multi-instance properties when toggling between parallel and sequential ([#1581](https://github.com/bpmn-io/bpmn-js/issues/1581))
* `FIX`: correct hanging sequence flow label after collapsing sub-process ([#1617](https://github.com/bpmn-io/bpmn-js/issues/1617))
* `FIX`: correct start event not added to newly created sub-process ([#1631](https://github.com/bpmn-io/bpmn-js/issues/1631))

## 9.0.3

* `FIX`: submit direct editing result on drilldown ([#1609](https://github.com/bpmn-io/bpmn-js/issues/1609))
* `DEPS`: bump to `diagram-js@8.2.0` ([2bac149](https://github.com/bpmn-io/bpmn-js/commit/2bac1495058601fec203c134b41efe5600e5fc97))

## 9.0.2

* `FIX`: support modeling of groups in collapsed subporcesses ([#1606](https://github.com/bpmn-io/bpmn-js/issues/1606))
* `FIX`: override default padding of breadcrumb element ([#1608](https://github.com/bpmn-io/bpmn-js/pull/1608))

## 9.0.1

* `FIX`: use ES5 everywhere ([#1605](https://github.com/bpmn-io/bpmn-js/pull/1605))
* `FIX`: support DIs without associated business object ([#1605](https://github.com/bpmn-io/bpmn-js/pull/1605))
* `DEPS`: bump to `diagram-js@8.1.2` ([bdf9cf3](https://github.com/bpmn-io/bpmn-js/commit/bdf9cf3e752254a4c8172031d8a493955a9fca9c))

## 9.0.0

* `FEAT`: support drilldown and modeling of collapsed subprocesses ([#1443](https://github.com/bpmn-io/bpmn-js/issues/1443))
* `FEAT`: update embedded label bounds when shape is moved ([#1586](https://github.com/bpmn-io/bpmn-js/pull/1586))
* `FIX`: create di for embedded labels ([#1579](https://github.com/bpmn-io/bpmn-js/pull/1579))
* `CHORE`: expose `BpmnRenderer` extension points ([#1585](https://github.com/bpmn-io/bpmn-js/pull/1585))
* `DEPS`: bump to `diagram-js@8.1.1`

### Breaking Changes

* Reworked the link of elements to bpmn DIs. You must access the `di` directly from the diagram element instead of the `businessObject` [#1472](https://github.com/bpmn-io/bpmn-js/issues/1472).
* Reworked `viewer.open` behavior for single planes ([#1576](https://github.com/bpmn-io/bpmn-js/pull/1576)).
* Reworked import and `BpmnFactory` APIs [#1472](https://github.com/bpmn-io/bpmn-js/issues/1472).
* Added `bpmn-js.css`, which is required to display drilldown overlays correctly.

## 8.10.0

* `CHORE`: provide `ModelUtil#isAny` utility ([#1604](https://github.com/bpmn-io/bpmn-js/pull/1604))
* `CHORE`: provide `ModelUtil#getDi` utility ([#1604](https://github.com/bpmn-io/bpmn-js/pull/1604))

## 8.9.1

* `FIX`: re-use process for redo of first participant ([#1439](https://github.com/bpmn-io/bpmn-js/issues/1439))
* `FIX`: ensure IDs are claimed when used ([#1555](https://github.com/bpmn-io/bpmn-js/issues/1555))
* `FIX`: prevent morphing data stores outside participants ([#1508](https://github.com/bpmn-io/bpmn-js/issues/1508))

## 8.9.0

* `FEAT`: select newly created sub-process ([`6214772b`](https://github.com/bpmn-io/bpmn-js/commit/6214772b8519cb82f61c4867b16c112bc6344922))
* `FEAT`: select newly created group for immediate resizing ([`56eb34cc`](https://github.com/bpmn-io/bpmn-js/commit/56eb34cc826ca0dc8ee788575a504d5fda301292))
* `FEAT`: simplify color scheme
* `FIX`: set label color on `bpmndi:BPMNLabel#color` ([#1543](https://github.com/bpmn-io/bpmn-js/pull/1543))
* `FIX`: don't create illegal `bpmndi:BPMNEdge#waypoints` property ([#1544](https://github.com/bpmn-io/bpmn-js/issues/1544))
* `FIX`: correct direct editing on touch devices
* `DEPS`: update to `diagram-js@7.8.2`

## 8.8.3

* `FIX`: correct resize handles hidden behind element ([#1520](https://github.com/bpmn-io/bpmn-js/issues/1520))
* `FIX`: handle close to source or target drop on flow ([#1541](https://github.com/bpmn-io/bpmn-js/issues/1541))
* `CHORE`: bump to `diagram-js@7.6.3`

## 8.8.2

* `FIX`: properly re-use ID of a copied element if available ([#1503](https://github.com/bpmn-io/bpmn-js/pull/1509))

## 8.8.1

* `FIX`: re-use ID of a copied element if available ([#1503](https://github.com/bpmn-io/bpmn-js/pull/1503))
* `CHORE`: unbuild circular dependency with `ResizeUtil` ([#1500](https://github.com/bpmn-io/bpmn-js/pull/1500))

## 8.8.0

* `FEAT`: give `keyboard` fine-grained control over which events to handle ([#1493](https://github.com/bpmn-io/bpmn-js/issues/1493))
* `FIX`: correct keyboard shortcuts not working in direct editing mode ([#1493](https://github.com/bpmn-io/bpmn-js/issues/1493))
* `DEPS`: update to `diagram-js@7.15`

## 8.7.3

* `FIX`: convert file to `ES6` module ([#1478](https://github.com/bpmn-io/bpmn-js/pull/1478))

## 8.7.2

* `CHORE`: improve error recovery in ordering provider
* `DEPS`: update build dependencies

## 8.7.1

* `FIX`: allow connecting `bpmn:MessageFlow` to `bpmn:CallActivity` ([#1467](https://github.com/bpmn-io/bpmn-js/issues/1467))
* `DEPS`: update to `bpmn-moddle@7.1.2`

## 8.7.0

* `FEAT`: support BPMN in Color ([#1453](https://github.com/bpmn-io/bpmn-js/pull/1453))
* `DEPS`: update to `bpmn-moddle@7.1.1`

## 8.6.2

* `DEPS`: update diagram-js-direct-editing to v1.6.3

## 8.6.1

* `FIX`: serialize `bpmn:DataStoreReference` correctly in case if first participant is an empty pool ([#1456](https://github.com/bpmn-io/bpmn-js/issues/1456))

## 8.6.0

* `FEAT`: support Promise in `inject` test helper ([#1450](https://github.com/bpmn-io/bpmn-js/pull/1450))
* `DEPS`: update to `hosted-git@2.8.9` ([#1447](https://github.com/bpmn-io/bpmn-js/pull/1447))

## 8.5.0

* `FEAT`: reconnect message flows when participant is collapsed ([#1432](https://github.com/bpmn-io/bpmn-js/pull/1432))
* `FEAT`: replace elements on create ([#1340](https://github.com/bpmn-io/bpmn-js/issues/1340))
* `FEAT`: show message name on message flow ([#777](https://github.com/bpmn-io/bpmn-js/issues/777))
* `FEAT`: ensure auto-placed elements are visible
* `FIX`: fix reversed connection preview ([#1431](https://github.com/bpmn-io/bpmn-js/issues/1431))
* `FIX`: copy root element references on replace ([#1430](https://github.com/bpmn-io/bpmn-js/issues/1431))
* `DEPS`: update to `diagram-js@7.3.0`

## 8.4.0

* `FIX`: disallow inserting multiple elements on a sequence flow ([#1440](https://github.com/bpmn-io/bpmn-js/issues/1440))

## 8.3.1

* `FIX`: correctly serialize `xml` attributes on `Any` elements
* `DEPS`: update bump to `bpmn-moddle@7.0.5`

## 8.3.0

* `FEAT`: enable connection tool for text annotations ([#1428](https://github.com/bpmn-io/bpmn-js/pull/1428))

## 8.2.2

* `FIX`: always emit `saveXML.done`
* `FIX`: correct path intersections not being detected in certain cases
* `CHORE`: bump to `diagram-js@7.2.3`

## 8.2.1

* `FIX`: prevent bendpoint hover error ([#1387](https://github.com/bpmn-io/bpmn-js/issues/1387))

## 8.2.0

* `FIX`: correct label colors on connect / hover ([#1380](https://github.com/bpmn-io/bpmn-js/issues/1380))
* `FIX`: correct new parent indicator when leaving lane ([#1413](https://github.com/bpmn-io/bpmn-js/issues/1413))
* `CHORE`: update to `diagram-js@7.2.0`

## 8.1.0

* `TEST`: simplify markup created by built-in test helpers

## 8.0.1

* `FIX`: activate, not toggle global connect tool on palette click
* `FIX`: only allow cancel boundary events on transactions
* `CHORE`: add `npm start` script for demo purposes

## 8.0.0

* `FEAT`: improve replace label for collapsed pools ([`8faee2bd`](https://github.com/bpmn-io/bpmn-js/commit/8faee2bde9a74b75b4b6bb9b003507652e75c9c5))
* `FEAT`: allow participant multiplicity marker to be toggled ([#533](https://github.com/bpmn-io/bpmn-js/issues/533))
* `FEAT`: support soft breaks / discretionary hyphens in labels ([#1383](https://github.com/bpmn-io/bpmn-js/issues/1383))
* `FEAT`: improve tool activation via keyboard shortcuts or editor actions
* `FEAT`: allow components to react to auxiliary mouse button interactions
* `FEAT`: move canvas on auxiliary button mouse down
* `CHORE`: bump to `diagram-js@7`

### Breaking Changes

* Auxiliary mouse button events will now be passed as `element.*` mouse events to components. You must filter your event listeners to prevent reactions to these events ([`1063f7c1`](https://github.com/bpmn-io/diagram-js/commit/1063f7c18474096d3d7c9e400ce82a1bf762a157)).

## 7.5.0

* `FEAT`: update translatable strings ([#1364](https://github.com/bpmn-io/bpmn-js/pull/1364))
* `FEAT`: add collection marker to DataObjectReference ([#381](https://github.com/bpmn-io/bpmn-js/issues/381))
* `FEAT`: provide generic command for updating moddle properties ([#1376](https://github.com/bpmn-io/bpmn-js/pull/1376))
* `FEAT`: add switch between DataStoreReference and DataObjectReference in replace menu ([#1372](https://github.com/bpmn-io/bpmn-js/issues/1372))
* `FIX`: align collection and parallel instance markers style ([#1371](https://github.com/bpmn-io/bpmn-js/issues/1371))

## 7.4.2

* `FIX`: correctly emit out `element.event` after drop-on-flow ([#1366](https://github.com/bpmn-io/bpmn-js/issues/1366))

## 7.4.1

* `FIX`: correct keyboard zoom in key on international keyboard shortcuts ([#1362](https://github.com/bpmn-io/bpmn-js/issues/1362))

## 7.4.0

* `CHORE`: bump to `diagram-js@6.8.0`
* `CHORE`: migrate to `travis-ci.com`

## 7.3.1

* `CHORE`: bump to `diagram-js@6.7.1`

## 7.3.0

* `FEAT`: disallow typed start events inside non-event based sub processes ([#831](https://github.com/bpmn-io/bpmn-js/issues/831))
* `CHORE`: bump to `diagram-js@6.7.0`

## 7.2.1

* `FIX`: disallow boundary events as message flow targets ([#1300](https://github.com/bpmn-io/bpmn-js/issues/1300))

## 7.2.0

_Republish of `v7.1.0`._

## 7.1.0

* `FEAT`: allow annotating groups ([#1327](https://github.com/bpmn-io/bpmn-js/issues/1327))

## 7.0.1

* `FIX`: roundtrip default `xml` namespace ([#1319](https://github.com/bpmn-io/bpmn-js/issues/1319))
* `CHORE`: bump to `bpmn-moddle@7.0.3`

## 7.0.0

* `FEAT`: make import and export APIs awaitable ([#812](https://github.com/bpmn-io/bpmn-js/issues/812))
* `FEAT`: update watermark ([#1281](https://github.com/bpmn-io/bpmn-js/pull/1281))
* `CHORE`: deprecated `import.parse.complete` context payload ([`157aec6e`](https://github.com/bpmn-io/bpmn-js/commit/157aec6e))
* `CHORE`: clarify license terms ([`bc98a637`](https://github.com/bpmn-io/bpmn-js/commit/bc98a63712f6ac5c66d39f59bf93e296e59ad1e0))
* `CHORE`: bump to `bpmn-moddle@7.0.1`

### Breaking Changes

* The toolkit now requires the ES6 `Promise` to be present. To support IE11 you must polyfill it.

## 6.5.1

* `FIX`: correct namespaces being removed on diagram export ([#1310](https://github.com/bpmn-io/bpmn-js/issues/1310))
* `CHORE`: bump to `bpmn-moddle@6.0.6`

## 6.5.0

* `FEAT`: prefer straight layout for sub-process connections ([#1309](https://github.com/bpmn-io/bpmn-js/pull/1309))
* `FEAT`: move common auto-place feature to diagram-js, add BPMN-specific auto-place feature ([#1284](https://github.com/bpmn-io/bpmn-js/pull/1284))
* `CHORE`: make bpmn-font a development dependency ([`63045bdf`](https://github.com/bpmn-io/bpmn-js/commit/63045bdfa87b9f1989a2a7a509facbeb4616acda))
* `CHORE`: bump to `diagram-js@6.6.1`

## 6.4.2

* `CHORE`: bump to `bpmn-moddle@6.0.5`

## 6.4.1

* `FIX`: parse `>` in attribute names and body tag
* `CHORE`: bump to `bpmn-moddle@6.0.4`

## 6.4.0

* `FEAT`: serialize link events with an empty name ([#1296](https://github.com/bpmn-io/bpmn-js/issues/1296))

## 6.3.5

* `FIX`: correct accidental resizing of label target ([#1294](https://github.com/bpmn-io/bpmn-js/issues/1294))

## 6.3.4

* `FIX`: export BPMNDI in correct order ([#985](https://github.com/bpmn-io/bpmn-js/issues/985))

## 6.3.3

* `FIX`: resize empty text annotations
* `CHORE`: bump `min-dom` version
* `CHORE`: bump to `diagram-js@6.4.1`

## 6.3.2

* `FIX`: correctly move flows when adding lane ([#1287](https://github.com/bpmn-io/bpmn-js/pull/1287))
* `FIX`: restore semantic IDs for non flow nodes ([#1285](https://github.com/bpmn-io/bpmn-js/issues/1285))

## 6.3.1

* `FIX`: prevent editor crash in some strict execution environments ([#1283](https://github.com/bpmn-io/bpmn-js/pull/1283))

## 6.3.0

* `FEAT`: generate more generic IDs for new elements ([`035bb0c1`](https://github.com/bpmn-io/bpmn-js/commit/035bb0c1fd01adbaab8a340cb1075aa57736540d))
* `FEAT`: copy referenced root elements (message, signal, ...) ([`dc5a566e`](https://github.com/bpmn-io/bpmn-js/commit/dc5a566e107bc156505a40de3331b3832afc4b8d))
* `FEAT`: ensure minimum size when resizing elements with space tool ([`7ee304f4`](https://github.com/bpmn-io/bpmn-js/commit/7ee304f424d1c9db46633523165d25ca1fabba1b))
* `FIX`: correct interaction events inside `bpmn:Group` elements ([#1278](https://github.com/bpmn-io/bpmn-js/issues/1278))
* `FIX`: correct copy and paste of collapsed sub-processes ([#1270](https://github.com/bpmn-io/bpmn-js/issues/1270))
* `FIX`: correct various space tool related issues ([#1019](https://github.com/bpmn-io/bpmn-js/issues/1019), [#878](https://github.com/bpmn-io/bpmn-js/issues/878))
* `CHORE`: rework space tool
* `CHORE`: update to `diagram-js@6.4.0`

## 6.2.1

* `FIX`: correct serialization of `DataAssociation#assignment`
* `CHORE`: update to `bpmn-moddle@6.0.2`

## 6.2.0

* `FIX`: keep non-duplicate outgoing connection when dropping on flows ([#1263](https://github.com/bpmn-io/bpmn-js/issues/1263))
* `FIX`: properly reconnect message flows when collapsing participant
* `CHORE`: update to `diagram-js@6.3.0`
* `CHORE`: update to `bpmn-moddle@6.0.1`

## 6.1.2

* `FIX`: translate _Append ReceiveTask_
* `FIX`: allow associations where data associations are allowed, too ([`4a675b37`](https://github.com/bpmn-io/bpmn-js/commit/4a675b378027532db413186ea292daeac087285b))
* `FIX`: correct origin snapping on multi-element create ([`27fec8bd`](https://github.com/bpmn-io/bpmn-js/commit/27fec8bdf1c6236e7ca09b5721b74b1b45b45d39))
* `CHORE`: update to `diagram-js@6.2.2`

## 6.1.1

_Republish of `v6.1.0`._

## 6.1.0

* `FEAT`: copy signals, escalations and errors ([#1245](https://github.com/bpmn-io/bpmn-js/pull/1245))
* `FEAT`: provide base viewer / modeler distributions ([`bb94b206`](https://github.com/bpmn-io/bpmn-js/commit/bb94b206a7c9ab3b80e283d6513600a9591c437d))
* `FEAT`: add horizontal and vertical resize handles
* `FEAT`: improve connection cropping (bump to `path-intersection@2`)
* `FIX`: correctly mark elements as changed on `{shape|connection}.create` undo
* `FIX`: do not open replace menu after multi create ([#1255](https://github.com/bpmn-io/bpmn-js/pull/1255))
* `CHORE`: update to `diagram-js@6.2.0`

## 6.0.7

* `FIX`: disable waypoints-cropping after pasting connections ([`9f8a724e`](https://github.com/bpmn-io/bpmn-js/commit/9f8a724e9a3ff66bfce14e06ab38066189111a95))

## 6.0.6

* `FIX`: create nested lanes in the correct parent again ([#1256](https://github.com/bpmn-io/bpmn-js/issues/1256), [#1253](https://github.com/bpmn-io/bpmn-js/issues/1253), [#1254](https://github.com/bpmn-io/bpmn-js/issues/1254))

## 6.0.5

* `FIX`: only update `Lane#flownNodeRefs` once during paste ([`4455c3fc`](https://github.com/bpmn-io/bpmn-js/commit/4455c3fc35290e51220566fb6539a1efc4d3612f))
* `FIX`: do not adjust labels on paste ([`b2b607f5`](https://github.com/bpmn-io/bpmn-js/commit/b2b607f5582d3409c789d831a0896aaa55949899))
* `FIX`: do not snap connection waypoints on paste ([`d769e6dd`](https://github.com/bpmn-io/bpmn-js/commit/d769e6ddb0cb2dc8befb2e7b31682925089ba8f1))

## 6.0.4

* `FIX`: correctly fix hover on cleanup ([#1247](https://github.com/bpmn-io/bpmn-js/pull/1247))

## 6.0.3

* `FIX`: render colored BPMN groups ([#1246](https://github.com/bpmn-io/bpmn-js/pull/1246))
* `CHORE`: bump to `diagram-js@6.0.2`

## 6.0.2

* `CHORE`: bump `diagram-js-direct-editing` dependency

## 6.0.1

* `CHORE`: bump to `diagram-js@6.0.1`

## 6.0.0

* `FEAT`: rework (re-)connecting of shapes ([#427](https://github.com/bpmn-io/bpmn-js/pull/1230))

### Breaking Changes

Connecting and re-connecting shapes got reworked via [#427](https://github.com/bpmn-io/bpmn-js/pull/1230):

* The rules `connection.reconnectStart` and `connection.reconnectEnd` got replaced with `connection.reconnect` rule
* `BpmnLayouter#layoutConnection` waypoints can be specified via hint

## 5.1.2

* `FIX`: account for label pasting in label behavior ([#1227](https://github.com/bpmn-io/bpmn-js/issues/1227))

## 5.1.1

* `FIX`: re-select only existing elements when dragging is finished ([#1225](https://github.com/bpmn-io/bpmn-js/issues/1225))
* `FIX`: correctly hide nested children of a collapsed shape
* `CHORE`: bump to [`diagram-js@5.1.1`](https://github.com/bpmn-io/diagram-js/blob/develop/CHANGELOG.md#511)

## 5.1.0

* `FEAT`: adjust label position post creation ([`41c6af18`](https://github.com/bpmn-io/bpmn-js/commit/41c6af183014626a0f84e0bda0f8e39018f9151e))
* `FEAT`: copy and paste boundary events ([`2e27d743`](https://github.com/bpmn-io/bpmn-js/commit/2e27d7430642439e30806941d0df43018ca729eb))
* `FIX`: ordering after moving boundary events between hosts ([#1207](https://github.com/bpmn-io/bpmn-js/issues/1207))
* `FIX`: do not remove sequence flow condition on type change ([`b2900786`](https://github.com/bpmn-io/bpmn-js/commit/b290078600ae4e45e7c72bd37919732e3f8fcbea))
* `FIX`: do not remove default sequence flow on type change ([`37bcd070`](https://github.com/bpmn-io/bpmn-js/commit/37bcd070e8406a43a7316893c6b68debeaae5e26))
* `FIX`: do not duplicate flow node references ([`168a1493`](https://github.com/bpmn-io/bpmn-js/commit/168a1493b26c3059d2440a70f7aa5991745b51e5))
* `FIX`: ignore labels that are being created in adaptive label positioning ([`44cceb5d`](https://github.com/bpmn-io/bpmn-js/commit/44cceb5da287a0ad01d9389f475284c88eda7f7b))

## 5.0.5

* `FIX`: snap connections to task mid ([`86c61b0`](https://github.com/bpmn-io/bpmn-js/commit/86c61b0c0d6dcf776adda94b6d72b621644c2abe))
* `FIX`: snap connections to sub process mid ([`83e9f05`](https://github.com/bpmn-io/bpmn-js/commit/83e9f05efab6fbe57100e11d0443291a561bdfe4))
* `FIX`: complete direct editing when auto place starts ([`dcf440b`](https://github.com/bpmn-io/bpmn-js/commit/dcf440b07684339bdb52ba97cd1c83f9eb234044))
* `FIX`: do not clear diagram if no diagram to clear ([#1181](https://github.com/bpmn-io/bpmn-js/issues/1181))
* `FIX`: copy boundary events attachments ([#1190](https://github.com/bpmn-io/bpmn-js/issues/1190))
* `FIX`: do not copy generic properties ([`a74d83`](https://github.com/bpmn-io/bpmn-js/commit/a74d838dc78aceddf88e07231cf85a4cf9e0dd95))

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
