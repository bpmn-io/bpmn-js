/**
 * This file must not be changed or exchanged.
 *
 * @see http://bpmn.io/license for more information.
 */

import {
  domify,
  delegate as domDelegate
} from 'min-dom';


// inlined ../../resources/logo.svg
var BPMNIO_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960"><path fill="#fff" d="M960 60v839c0 33-27 61-60 61H60c-33 0-60-27-60-60V60C0 27 27 0 60 0h839c34 0 61 27 61 60z"/><path fill="#52b415" d="M217 548a205 205 0 0 0-144 58 202 202 0 0 0-4 286 202 202 0 0 0 285 3 200 200 0 0 0 48-219 203 203 0 0 0-185-128zM752 6a206 206 0 0 0-192 285 206 206 0 0 0 269 111 207 207 0 0 0 111-260A204 204 0 0 0 752 6zM62 0A62 62 0 0 0 0 62v398l60 46a259 259 0 0 1 89-36c5-28 10-57 14-85l99 2 12 85a246 246 0 0 1 88 38l70-52 69 71-52 68c17 30 29 58 35 90l86 14-2 100-86 12a240 240 0 0 1-38 89l43 58h413c37 0 60-27 60-61V407a220 220 0 0 1-44 40l21 85-93 39-45-76a258 258 0 0 1-98 1l-45 76-94-39 22-85a298 298 0 0 1-70-69l-86 22-38-94 76-45a258 258 0 0 1-1-98l-76-45 40-94 85 22a271 271 0 0 1 41-47z"/></svg>';

var BPMNIO_LOGO_URL = 'data:image/svg+xml,' + encodeURIComponent(BPMNIO_LOGO_SVG);

export var BPMNIO_IMG = '<img width="52" height="52" src="' + BPMNIO_LOGO_URL + '" />';

function css(attrs) {
  return attrs.join(';');
}

var LIGHTBOX_STYLES = css([
  'z-index: 1001',
  'position: fixed',
  'top: 0',
  'left: 0',
  'right: 0',
  'bottom: 0'
]);

var BACKDROP_STYLES = css([
  'width: 100%',
  'height: 100%',
  'background: rgba(0,0,0,0.2)'
]);

var NOTICE_STYLES = css([
  'position: absolute',
  'left: 50%',
  'top: 40%',
  'margin: 0 -130px',
  'width: 260px',
  'padding: 10px',
  'background: white',
  'border: solid 1px #AAA',
  'border-radius: 3px',
  'font-family: Helvetica, Arial, sans-serif',
  'font-size: 14px',
  'line-height: 1.2em'
]);

var LIGHTBOX_MARKUP =
  '<div class="bjs-powered-by-lightbox" style="' + LIGHTBOX_STYLES + '">' +
    '<div class="backdrop" style="' + BACKDROP_STYLES + '"></div>' +
    '<div class="notice" style="' + NOTICE_STYLES + '">' +
      '<a href="http://bpmn.io" target="_blank" style="float: left; margin-right: 10px">' +
        BPMNIO_IMG +
      '</a>' +
      'Web-based tooling for BPMN, DMN and CMMN diagrams ' +
      'powered by <a href="http://bpmn.io" target="_blank">bpmn.io</a>.' +
    '</div>' +
  '</div>';


var lightbox;

export function open() {

  if (!lightbox) {
    lightbox = domify(LIGHTBOX_MARKUP);

    domDelegate.bind(lightbox, '.backdrop', 'click', function(event) {
      document.body.removeChild(lightbox);
    });
  }

  document.body.appendChild(lightbox);
}