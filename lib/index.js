/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';
var phosphor_disposable_1 = require('phosphor-disposable');
var phosphor_properties_1 = require('phosphor-properties');
require('./index.css');
/**
 * The class name added to the document body during cursor override.
 */
var OVERRIDE_CURSOR_CLASS = 'p-mod-override-cursor';
/**
 * The id for the active cursor override.
 */
var overrideID = 0;
/**
 * Override the cursor for the entire document.
 *
 * @param cursor - The string representing the cursor style.
 *
 * @returns A disposable which will clear the override when disposed.
 *
 * #### Notes
 * The most recent call to `overrideCursor` takes precendence. Disposing
 * an old override is a no-op and will not effect the current override.
 *
 * #### Example
 * ```typescript
 * import { overrideCursor } from 'phosphor-domutil';
 *
 * // force the cursor to be 'wait' for the entire document
 * let override = overrideCursor('wait');
 *
 * // clear the override by disposing the return value
 * override.dispose();
 * ```
 */
function overrideCursor(cursor) {
    var id = ++overrideID;
    var body = document.body;
    body.style.cursor = cursor;
    body.classList.add(OVERRIDE_CURSOR_CLASS);
    return new phosphor_disposable_1.DisposableDelegate(function () {
        if (id === overrideID) {
            body.style.cursor = '';
            body.classList.remove(OVERRIDE_CURSOR_CLASS);
        }
    });
}
exports.overrideCursor = overrideCursor;
/**
 * Test whether a client position lies within a node.
 *
 * @param node - The DOM node of interest.
 *
 * @param clientX - The client X coordinate of interest.
 *
 * @param clientY - The client Y coordinate of interest.
 *
 * @returns `true` if the node covers the position, `false` otherwise.
 *
 * #### Example
 * ```typescript
 * import { hitTest } from 'phosphor-domutil';
 *
 * let div = document.createElement('div');
 * div.style.position = 'absolute';
 * div.style.left = '0px';
 * div.style.top = '0px';
 * div.style.width = '100px';
 * div.style.height = '100px';
 * document.body.appendChild(div);
 *
 * hitTest(div, 50, 50);   // true
 * hitTest(div, 150, 150); // false
 * ```
 */
function hitTest(node, clientX, clientY) {
    var rect = node.getBoundingClientRect();
    return (clientX >= rect.left &&
        clientX < rect.right &&
        clientY >= rect.top &&
        clientY < rect.bottom);
}
exports.hitTest = hitTest;
/**
 * Test whether a client rect contains the given client position.
 */
function hitTestRect(r, x, y) {
    return x >= r.left && y >= r.top && x < r.right && y < r.bottom;
}
exports.hitTestRect = hitTestRect;
/**
 * Compute the box sizing for a DOM node.
 *
 * @param node - The DOM node for which to compute the box sizing.
 *
 * @returns The box sizing data for the specified DOM node.
 *
 * #### Example
 * ```typescript
 * import { boxSizing } from 'phosphor-domutil';
 *
 * let div = document.createElement('div');
 * div.style.borderTop = 'solid 10px black';
 * document.body.appendChild(div);
 *
 * let sizing = boxSizing(div);
 * sizing.borderTop;    // 10
 * sizing.paddingLeft;  // 0
 * // etc...
 * ```
 */
function boxSizing(node) {
    var cstyle = window.getComputedStyle(node);
    var bt = parseInt(cstyle.borderTopWidth, 10) || 0;
    var bl = parseInt(cstyle.borderLeftWidth, 10) || 0;
    var br = parseInt(cstyle.borderRightWidth, 10) || 0;
    var bb = parseInt(cstyle.borderBottomWidth, 10) || 0;
    var pt = parseInt(cstyle.paddingTop, 10) || 0;
    var pl = parseInt(cstyle.paddingLeft, 10) || 0;
    var pr = parseInt(cstyle.paddingRight, 10) || 0;
    var pb = parseInt(cstyle.paddingBottom, 10) || 0;
    var hs = bl + pl + pr + br;
    var vs = bt + pt + pb + bb;
    return {
        borderTop: bt,
        borderLeft: bl,
        borderRight: br,
        borderBottom: bb,
        paddingTop: pt,
        paddingLeft: pl,
        paddingRight: pr,
        paddingBottom: pb,
        horizontalSum: hs,
        verticalSum: vs,
    };
}
exports.boxSizing = boxSizing;
/**
 * Compute the size limits for a DOM node.
 *
 * @param node - The node for which to compute the size limits.
 *
 * @returns The size limit data for the specified DOM node.
 *
 * #### Example
 * ```typescript
 * import { sizeLimits } from 'phosphor-domutil';
 *
 * let div = document.createElement('div');
 * div.style.minWidth = '90px';
 * document.body.appendChild(div);
 *
 * let limits = sizeLimits(div);
 * limits.minWidth;   // 90
 * limits.maxHeight;  // Infinity
 * // etc...
 * ```
 */
function sizeLimits(node) {
    var cstyle = window.getComputedStyle(node);
    return {
        minWidth: parseInt(cstyle.minWidth, 10) || 0,
        minHeight: parseInt(cstyle.minHeight, 10) || 0,
        maxWidth: parseInt(cstyle.maxWidth, 10) || Infinity,
        maxHeight: parseInt(cstyle.maxHeight, 10) || Infinity,
    };
}
exports.sizeLimits = sizeLimits;
var DroppableHandler = (function () {
    function DroppableHandler(widget) {
        this._widget = null;
        this._widget = widget;
        DroppableHandler.register(this);
    }
    DroppableHandler.register = function (handler) {
        var id = ++DroppableHandler.id;
        DroppableHandler.idProperty.set(handler, id);
        DroppableHandler.droppables[id] = {
            entered: false,
            handler: handler,
            rect: null
        };
    };
    DroppableHandler.deregister = function (handler) {
        var id = DroppableHandler.idProperty.get(handler);
        if (DroppableHandler.droppables[id]) {
            delete DroppableHandler.droppables[id];
        }
    };
    DroppableHandler.drag = function (event, data) {
        var x = event.clientX;
        var y = event.clientY;
        Object.keys(DroppableHandler.droppables).forEach(function (key) {
            // Multiple drop targets might match. This requires thought.
            var droppable = DroppableHandler.droppables[key];
            var widget = droppable.handler._widget;
            // Cache the bounding rectangle when the drag begins.
            if (!droppable.rect) {
                droppable.rect = droppable.handler._widget.node.getBoundingClientRect();
            }
            if (hitTestRect(droppable.rect, x, y)) {
                if (!droppable.entered) {
                    droppable.entered = true;
                    droppable.handler.onDragEnter.call(widget, event, data);
                }
                droppable.handler.onDrag.call(widget, event, data);
            }
            else if (droppable.entered) {
                droppable.entered = false;
                droppable.handler.onDragLeave.call(widget, event, data);
            }
        });
    };
    DroppableHandler.drop = function (event, data) {
        var x = event.clientX;
        var y = event.clientY;
        Object.keys(DroppableHandler.droppables).forEach(function (key) {
            // Multiple drop targets might match. This requires thought.
            var droppable = DroppableHandler.droppables[key];
            var widget = droppable.handler._widget;
            if (!droppable.rect) {
                droppable.rect = widget.node.getBoundingClientRect();
            }
            if (hitTestRect(droppable.rect, x, y)) {
                if (!droppable.entered) {
                    droppable.entered = true;
                    droppable.handler.onDragEnter.call(widget, event, data);
                }
                droppable.handler.onDrop.call(widget, event, data);
            }
            else if (droppable.entered) {
                droppable.entered = false;
                droppable.handler.onDragLeave.call(widget, event, data);
            }
        });
    };
    DroppableHandler.prototype.dispose = function () {
        DroppableHandler.deregister(this);
        this._widget = null;
    };
    Object.defineProperty(DroppableHandler.prototype, "isDisposed", {
        get: function () {
            return this._widget === null;
        },
        enumerable: true,
        configurable: true
    });
    DroppableHandler.prototype.onDragEnter = function (event, dragData) { };
    DroppableHandler.prototype.onDrag = function (event, dragData) { };
    DroppableHandler.prototype.onDragLeave = function (event, dragData) { };
    DroppableHandler.prototype.onDrop = function (event, dragData) { };
    DroppableHandler.id = 0;
    DroppableHandler.idProperty = new phosphor_properties_1.Property({
        name: 'id',
        value: null
    });
    DroppableHandler.droppables = Object.create(null);
    return DroppableHandler;
})();
exports.DroppableHandler = DroppableHandler;
var DragHandler = (function () {
    function DragHandler(widget) {
        this.autostart = true;
        this.dragThreshold = 5;
        this._dragData = null;
        this._widget = widget;
        widget.node.addEventListener('mousemove', this);
    }
    DragHandler.prototype.dispose = function () {
        this._widget.node.removeEventListener('mousemove', this);
        this._widget = null;
    };
    Object.defineProperty(DragHandler.prototype, "isDisposed", {
        get: function () {
            return this._widget === null;
        },
        enumerable: true,
        configurable: true
    });
    DragHandler.prototype.ghost = function () {
        var widget = this._widget;
        var node = widget.node.cloneNode(true);
        var rect = widget.node.getBoundingClientRect();
        node.style.height = rect.height + "px";
        node.style.width = rect.width + "px";
        node.style.opacity = '0.75';
        return node;
    };
    DragHandler.prototype.handleEvent = function (event) {
        switch (event.type) {
            case 'mousedown':
                this._evtMouseDown(event);
                break;
            case 'mousemove':
                this._evtMouseMove(event);
                break;
            case 'mouseup':
                this._evtMouseUp(event);
                break;
        }
    };
    DragHandler.prototype.onDragStart = function (event, dragData) { };
    DragHandler.prototype.onDragEnd = function (event, dragData) { };
    DragHandler.prototype.startDrag = function (event) {
        if (this._dragData.started) {
            return;
        }
        this._dragData.started = true;
        this._dragData.ghost = this.ghost();
        this._dragData.ghost.style.position = 'absolute';
        document.body.appendChild(this._dragData.ghost);
        this.onDragStart(event, this._dragData);
    };
    DragHandler.prototype._evtMouseDown = function (event) {
        if (event.button !== 0) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        document.addEventListener('mousemove', this, true);
        document.addEventListener('mouseup', this, true);
        this._dragData = {
            started: false,
            ghost: null,
            payload: Object.create(null),
            startX: event.clientX,
            startY: event.clientY
        };
    };
    DragHandler.prototype._evtMouseMove = function (event) {
        if (!this._dragData.started) {
            if (!this.autostart) {
                return;
            }
            var dx = Math.abs(event.clientX - this._dragData.startX);
            var dy = Math.abs(event.clientY - this._dragData.startY);
            if (Math.sqrt(dx * dx + dy * dy) >= this.dragThreshold) {
                this.startDrag(event);
            }
            else {
                return;
            }
        }
        // 10px is arbitary, this might require configuration.
        this._dragData.ghost.style.top = (event.clientY - 10) + "px";
        this._dragData.ghost.style.left = (event.clientX - 10) + "px";
        DroppableHandler.drag(event, this._dragData);
    };
    DragHandler.prototype._evtMouseUp = function (event) {
        document.removeEventListener('mousemove', this, true);
        document.removeEventListener('mouseup', this, true);
        if (this._dragData.started) {
            if (this._dragData.ghost) {
                document.body.removeChild(this._dragData.ghost);
            }
            DroppableHandler.drop(event, this._dragData);
            this.onDragEnd(event, this._dragData);
        }
        this._dragData = null;
    };
    return DragHandler;
})();
exports.DragHandler = DragHandler;
//# sourceMappingURL=index.js.map