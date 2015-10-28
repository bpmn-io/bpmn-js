/**
   * The code in the <project-logo></project-logo> area
   * must not be changed, see http://bpmn.io/license for more information
   *
   * <project-logo>
   */

'use strict';

var domify = require('min-dom/lib/domify');

function fade(el, ms, callback, out) {
    var frames = 50,
        computedOpacity = window.getComputedStyle(el).opacity,
        elementOpacity = el.style.opacity,
        targetOpacity,
        stepOpacity;
    
    if (out) {
        var currentOpacity = !computedOpacity ? 1 : parseFloat(computedOpacity);
        targetOpacity = 0;
        stepOpacity = -(currentOpacity / frames);
        el.style.opacity = currentOpacity;
    }
    else {
        targetOpacity = !computedOpacity ? 1 : parseFloat(computedOpacity);
        stepOpacity = targetOpacity / frames;
        el.style.opacity = 0;
    }

    var outInterval = setInterval(function () {
        var frameOpacity = parseFloat(el.style.opacity) + stepOpacity;
        el.style.opacity = frameOpacity;

        if ((out && frameOpacity <= targetOpacity) || (!out && frameOpacity >= targetOpacity)) {
            if (typeof callback === "function") {
                callback();
            }
            el.style.opacity = elementOpacity;
            clearInterval(outInterval);
        }
    }, ms / frames);
}

function fadeIn(el, ms, callback) {
    fade(el, ms, callback, false);
}

function fadeOut(el, ms, callback) {
    fade(el, ms, callback, true);
}

function getOverlayMarkup() {
    return '<div class="bjs-powered-by-lightbox-overlay" style="display: none; z-index: 101"></div>';
}

function getLightboxMarkup() {
    /* jshint -W101 */

    // inlined ../resources/bpmnjs-inverted.png
    var logoData = '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';

    /* jshint +W101 */

    var lightboxMarkup =
        '<div class="bjs-powered-by-lightbox" style="display: none; z-index: 102;">' +
          '<div class="bjs-powered-by-lightbox-container">' +
            '<div class="bjs-powered-by-lightbox-header">' +
              '<a class="bjs-powered-by-lightbox-close"></a>' +
            '</div>' +
            '<div class="bjs-powered-by-lightbox-body">' +
              '<a href="http://bpmn.io" ' +
                 'target="_blank" ' +
                 'title="Powered by bpmn.io">' +
                  '<img src="data:image/png;base64,'+ logoData +'">' +
              '</a>' +
              '<p>' +
                'Powered by ' +
                  '<a href="http://bpmn.io" ' +
                     'title="Powered by bpmn.io" ' +
                     'target="_blank">bpmn.io</a>' +
              '</p>' +
              '<p>A BPMN 2.0 rendering toolkit and web modeler.</p>' +
              '<p>' +
                'Built with passion as part of ' +
                '<a href="http://camunda.org" ' +
                   'title="Camunda BPMN" ' +
                   'target="_blank">' +
                   'Camunda BPMN' +
                '</a>' +
              '</p>' +
            '</div>' +
          '</div>' +
        '</div>';

    return lightboxMarkup;
}

function getStylesheetMarkup() {
    var css = 
        '.bjs-powered-by-lightbox-overlay {' +
            'position: fixed;' +
            'top: 0;' +
            'left: 0;' +
            'width: 100%;' +
            'height: 100%;' +
            'background-color: black;' +
            'opacity: 0.8;' +
        '}' +
        '.bjs-powered-by-lightbox {' +
            'position: fixed;' +
            'top: 30%;' +
            'width: 100%;' +
        '}' +
        '.bjs-powered-by-lightbox-container {' +
            'width: 40%;' +
            'min-width: 200px;' +
            'max-width: 400px;' +
            'margin-left: auto;' +
            'margin-right: auto;' +
            'background-color: #52b415;' +
            'border-radius: 7px;' +
            'color: #fff;' +
            'font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;' +
            'font-size: 16px;' +
        '}' +
        '.bjs-powered-by-lightbox-header {' +
            'position: relative;' +
            'padding: 7px;' +
            'font-weight: bold;' +
            'font-size: 14px;' +
        '}' +
        '.bjs-powered-by-lightbox-header > .bjs-powered-by-lightbox-close {' +
            'position: absolute;' +
            'right: 7px;' +
            'top: 0em;' +
            'font-weight: bold;' +
            'font-size: 28px;' +
            'cursor: pointer;' +
            'color: #fff;' +
        '}' +
        '.bjs-powered-by-lightbox-header > .bjs-powered-by-lightbox-close:before {' +
            'content: "\u00D7";' +
        '}' +
        '.bjs-powered-by-lightbox-body {' +
            'padding: 7px;' +
            'text-align: center;' +
        '}' +
        '.bjs-powered-by-lightbox-body p {' +
            'line-height: 1.4;' +
        '}' +
        '.bjs-powered-by-lightbox-body a {' +
            'color: #fff;' +
            'text-decoration: none;' +
        '}' +
        '.bjs-powered-by-lightbox-body a:hover {' +
            'text-decoration: underline;' +
        '}';

    return '<style>' + css + '</style>';
}

function addProjectLightbox(container, linkElement) {
    var overlayElement = domify(getOverlayMarkup());
    var lightboxElement = domify(getLightboxMarkup());

    container.appendChild(overlayElement);
    container.appendChild(lightboxElement);
    container.appendChild(domify(getStylesheetMarkup()));

    function openLightbox() {
        var closeOnKeyDown;

        function close() {
            document.removeEventListener("keydown", closeOnKeyDown, false);

            fadeOut(lightboxElement, 200, function () {
               lightboxElement.style.display = "none";

               fadeOut(overlayElement, 200, function () {
                   overlayElement.style.display = "none";
               });
            });
        }

        closeOnKeyDown = function (evt) {
            var KEYCODE_ESC = 27;

            if (evt.keyCode == KEYCODE_ESC) {
                close();

                evt.preventDefault();
                evt.stopPropagation();
            }
        };

        lightboxElement.querySelector(".bjs-powered-by-lightbox-close").onclick = function (evt) {
            close();
            evt.preventDefault();
            evt.stopPropagation();
        };

        lightboxElement.onclick = function (evt) {
            if (evt.target === lightboxElement) {
                close();
                evt.preventDefault();
                evt.stopPropagation();
            }
        };
        overlayElement.onclick = function (evt) {
            if (evt.target === overlayElement) {
                close();
                evt.preventDefault();
                evt.stopPropagation();
            }
        };

        document.addEventListener("keydown", closeOnKeyDown, false);

        overlayElement.style.display = "block";
        lightboxElement.style.display = "block";

        fadeIn(overlayElement, 200);
        fadeIn(lightboxElement, 200);
    }

    linkElement.onclick = function (evt) {
        openLightbox();
        evt.preventDefault();
        evt.stopPropagation();
    };
}

function addProjectLogo(container, option) {
    /* jshint -W101 */

    // inlined ../resources/bpmnjs.png
    var logoData = 'iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAMAAADypuvZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADBQTFRFiMte9PrwldFwfcZPqtqN0+zEyOe1XLgjvuKncsJAZ70y6fXh3vDT////UrQV////G2zN+AAAABB0Uk5T////////////////////AOAjXRkAAAHDSURBVHjavJZJkoUgDEBJmAX8979tM8u3E6x20VlYJfFFMoL4vBDxATxZcakIOJTWSmxvKWVIkJ8jHvlRv1F2LFrVISCZI+tCtQx+XfewgVTfyY3plPiQEAzI3zWy+kR6NBhFBYeBuscJLOUuA2WVLpCjVIaFzrNQZArxAZKUQm6gsj37L9Cb7dnIBUKxENaaMJQqMpDXvSL+ktxdGRm2IsKgJGGPg7atwUG5CcFUEuSv+CwQqizTrvDTNXdMU2bMiDWZd8d7QIySWVRsb2vBBioxOFt4OinPBapL+neAb5KL5IJ8szOza2/DYoipUCx+CjO0Bpsv0V6mktNZ+k8rlABlWG0FrOpKYVo8DT3dBeLEjUBAj7moDogVii7nSS9QzZnFcOVBp1g2PyBQ3Vr5aIapN91VJy33HTJLC1iX2FY6F8gRdaAeIEfVONgtFCzZTmoLEdOjBDfsIOA6128gw3eu1shAajdZNAORxuQDJN5A5PbEG6gNIu24QJD5iNyRMZIr6bsHbCtCU/OaOaSvgkUyDMdDa1BXGf5HJ1To+/Ym6mCKT02Y+/Sa126ZKyd3jxhzpc1r8zVL6YM1Qy/kR4ABAFJ6iQUnivhAAAAAAElFTkSuQmCC';

    /* jshint +W101 */

    var linkMarkup =
        '<a href="http://bpmn.io" ' +
           'target="_blank" ' +
           'class="bjs-powered-by" ' +
           'title="Powered by bpmn.io" ' +
           'style="position: absolute; bottom: 15px; right: 15px; z-index: 100">' +
            '<img src="data:image/png;base64,' + logoData + '">' +
        '</a>';

    var linkElement = domify(linkMarkup);

    container.appendChild(linkElement);

    if (option === 'lightbox') {
        addProjectLightbox(container, linkElement);
    }
}

module.exports = addProjectLogo;

/* </project-logo> */
