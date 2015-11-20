/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';
var phosphor_disposable_1 = require('phosphor-disposable');
require('./index.css');
/**
 * The class name added to the document body during cursor override.
 */
var OVERRIDE_CURSOR_CLASS = 'p-mod-override-cursor';
/**
 * The class name added to a drag ghost node.
 */
var GHOST_CLASS = 'p-mod-ghost';
/**
 * The number of pixels of movement before the drag/drop lifecycle begins.
 */
var DRAG_THRESHOLD = 5;
/**
 * Override the cursor for the entire document.
 *
 * @param cursor - The string representing the cursor style.
 *
 * @returns A disposable which will clear the override when disposed.
 *
 * #### Notes
 * The most recent call to `overrideCursor` takes precedence. Disposing
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
 * The internal id for the active cursor override.
 */
var overrideID = 0;
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
    return hitTestRect(node.getBoundingClientRect(), clientX, clientY);
}
exports.hitTest = hitTest;
/**
 * Test whether a client position lies within a client rect.
 */
function hitTestRect(r, x, y) {
    return x >= r.left && x < r.right && y >= r.top && y < r.bottom;
}
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
/**
 * The data object for a drag and drop operation.
 *
 * Instances of this class are created automatically as needed.
 */
var DragData = (function () {
    /**
     * Construct a new drag data object.
     *
     * @param ghost - The HTML element which follows the cursor.
     */
    function DragData(ghost) {
        this._data = Object.create(null);
        this._ghost = ghost;
        this._action = 'none';
        this._override = overrideCursor('no-drop');
    }
    Object.defineProperty(DragData.prototype, "ghost", {
        /**
         * The HTML element which follows the cursor.
         *
         * #### Notes
         * This is a read-only property.
         */
        get: function () {
            return this._ghost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DragData.prototype, "dropAction", {
        /**
         * Get the current drop action.
         *
         * #### Notes
         * This will be one of `'copy'`, `'link'`, `'move'`, or `'none'`.
         */
        get: function () {
            return this._action;
        },
        /**
         * Set the current drop action.
         *
         * #### Notes
         * This must be one of `'copy'`, `'link'`, `'move'`, or `'none'`.
         *
         * The current cursor style will be updated to reflect the action.
         */
        set: function (value) {
            if (value === this._action) {
                return;
            }
            switch (value) {
                case 'copy':
                    this._action = value;
                    this._override = overrideCursor('copy');
                    break;
                case 'link':
                    this._action = value;
                    this._override = overrideCursor('alias');
                    break;
                case 'move':
                    this._action = value;
                    this._override = overrideCursor('move');
                    break;
                case 'none':
                    this._action = value;
                    this._override = overrideCursor('no-drop');
                    break;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * List the mime types added to the drag data.
     *
     * @returns A new array of the mime types added to the drag data.
     */
    DragData.prototype.types = function () {
        return Object.keys(this._data);
    };
    /**
     * Get the data for a particular mime type.
     *
     * @param mime - The mime type for the data.
     *
     * @returns The data for the mime type, or `undefined`.
     */
    DragData.prototype.getData = function (mime) {
        return this._data[mime];
    };
    /**
     * Set the data for a particular mime type.
     *
     * @param mime - The mime type for the data.
     *
     * @param data - The data for the mime type.
     */
    DragData.prototype.setData = function (mime, data) {
        this._data[mime] = data;
    };
    /**
     * Remove the data for a particular mime type.
     *
     * @param mime - The mime type for the data.
     */
    DragData.prototype.clearData = function (mime) {
        delete this._data[mime];
    };
    return DragData;
})();
exports.DragData = DragData;
/**
 * A class for implementing drag targets.
 *
 * #### Example
 * ```typescript
 * import {
 *   DragData, DragHandler
 * } from 'phosphor-domutil';
 *
 * class DragTarget {
 *
 *   constructor() {
 *     this._node = someNodeFactory();
 *     this._dragHandler = new DragHandler(this._node, this);
 *     this._dragHandler.onDragStart = this._onDragStart;
 *     this._dragHandler.onDragEnd = this._onDragEnd;
 *   }
 *
 *   dispose(): void {
 *     this._dragHandler.dispose();
 *   }
 *
 *   private _onDragStart(event: MouseEvent, data: DragData): void {
 *     data.setData('text/plain', 'hello');
 *     data.setData('application/x-my-custom-type', { foo: 42 });
 *     console.log('drag start', data);
 *   }
 *
 *   private _onDrag(event: MouseEvent, data: DragData): void {
 *     console.log('drag', data);
 *   }
 *
 *   private _onDragEnd(event: MouseEvent, data: DragData): void {
 *     console.log('drag end', data);
 *   }
 *
 *   private _node: HTMLElement;
 *   private _dragHandler: DragHandler;
 * }
 * ```
 */
var DragHandler = (function () {
    /**
     * Construct a new drag handler.
     *
     * @param node - The node which acts as the drag target.
     *
     * @param context - The `this` context for the drag handlers.
     */
    function DragHandler(node, context) {
        /**
         * A function called when the drag operation starts.
         *
         * @param event - The underlying native mouse event.
         *
         * @param data - The drag data object for the drag operation.
         *
         * #### Notes
         * The creator of the drag handler should assign a function to this
         * property to handle the drag start event.
         *
         * The handler should populate the data with the relevant mime data.
         */
        this.onDragStart = null;
        /**
         * A function called when the mouse cursor moves during the drag.
         *
         * @param event - The underlying native mouse event.
         *
         * @param data - The drag data object for the drag operation.
         *
         * #### Notes
         * The creator of the drag handler should assign a function to this
         * property to handle the drag event.
         *
         * This handler will not typically be provided. It is only useful in
         * special cases where the drag *source* wants to take action during
         * drag move events.
         */
        this.onDrag = null;
        /**
         * A function called when the drag operation ends.
         *
         * @param event - The underlying native mouse event.
         *
         * @param data - The drag data object for the drag operation.
         *
         * #### Notes
         * The creator of the drag handler should assign a function to this
         * property to handle the drag end event.
         *
         * The handler should read the `dropAction` property to determine
         * whether and how the drop target handled the drop action. If the
         * value is `'none'`, it indicates that the drop was not handled.
         */
        this.onDragEnd = null;
        this._ignoreThreshold = false;
        this._pressX = -1;
        this._pressY = -1;
        this._dragData = null;
        this._node = node;
        this._context = context;
        node.addEventListener('mousedown', this);
    }
    /**
     * Dispose of the drag handler and remove its event listeners.
     */
    DragHandler.prototype.dispose = function () {
        document.removeEventListener('mousemove', this, true);
        document.removeEventListener('mouseup', this, true);
        this._node.removeEventListener('mousedown', this);
        this._node = null;
        this._context = null;
        this._disposeDragData();
        this.onDragStart = null;
        this.onDrag = null;
        this.onDragEnd = null;
    };
    Object.defineProperty(DragHandler.prototype, "isDisposed", {
        /**
         * Test if the drag handler is disposed.
         */
        get: function () {
            return this._node === null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DragHandler.prototype, "node", {
        /**
         * Get the DOM node for the drag handler.
         *
         * #### Notes
         * This is a read-only property.
         */
        get: function () {
            return this._node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DragHandler.prototype, "context", {
        /**
         * Get the `this` context for the drag handlers.
         *
         * #### Notes
         * This is a read-only property.
         */
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Create the HTML element that will follow the cursor.
     *
     * #### Notes
     * This can be reimplemented by a subclass to create a custom ghost
     * node. The default implementation clones the handler's `node`.
     */
    DragHandler.prototype.createGhost = function () {
        var node = this.node.cloneNode(true);
        var rect = this.node.getBoundingClientRect();
        node.style.height = rect.height + "px";
        node.style.width = rect.width + "px";
        node.classList.add(GHOST_CLASS);
        return node;
    };
    /**
     * Synthetically start the drag operation.
     *
     * @param clientX - The current client X position of the mouse.
     *
     * @param clientY - The current client Y position of the mouse.
     *
     * #### Notes
     * This acts as a synthetic mouse press for the cases where a drag
     * operation needs to be started from other mouse handling code.
     */
    DragHandler.prototype.start = function (clientX, clientY) {
        // Do nothing if the drag is already started.
        if (this._dragData) {
            return;
        }
        // Store the initial mouse press position.
        this._pressX = clientX;
        this._pressY = clientY;
        // Ignore the default threshold for drag start in future mousemove events.
        this._ignoreThreshold = true;
        // Add the document mouse listeners.
        document.addEventListener('mousemove', this, true);
        document.addEventListener('mouseup', this, true);
    };
    /**
     * Handle the DOM events for the drag handler.
     *
     * @param event - The DOM event sent to the drag handler.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the drag handler's DOM node. It
     * should not be called directly by user code.
     */
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
    /**
     * Handle the `'mousedown'` event for the drag handler.
     */
    DragHandler.prototype._evtMouseDown = function (event) {
        // Do nothing if the drag is already started.
        if (this._dragData) {
            return;
        }
        // Do nothing if the left button is not pressed.
        if (event.button !== 0) {
            return;
        }
        // TODO should we stop propagation here?
        // We may want to allow it in order to allow focus change.
        // Store the initial mouse press position.
        this._pressX = event.clientX;
        this._pressY = event.clientY;
        // Add the document mouse listeners.
        document.addEventListener('mousemove', this, true);
        document.addEventListener('mouseup', this, true);
    };
    /**
     * Handle the `'mousemove'` event for the drag handler.
     */
    DragHandler.prototype._evtMouseMove = function (event) {
        // Mouse move events are never propagated since this handler
        // is only installed when during a left mouse drag operation.
        event.preventDefault();
        event.stopPropagation();
        // Check to see if the drag threshold has been exceeded, and
        // start the drag operation the first time that event occurs.
        if (!this._dragData) {
            if (!this._ignoreThreshold) {
                var dx = Math.abs(event.clientX - this._pressX);
                var dy = Math.abs(event.clientY - this._pressY);
                if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
                    return;
                }
            }
            // Invalidate the cached drop data before starting the drag.
            invalidateCachedDropData();
            // Setup the drag data and attach the ghost node.
            this._dragData = new DragData(this.createGhost());
            document.body.appendChild(this._dragData.ghost);
            // Run the drag start handler.
            runDragStart(this, event, this._dragData);
        }
        // Move the ghost node to the new mouse position.
        var style = this._dragData.ghost.style;
        style.top = event.clientY + "px";
        style.left = event.clientX + "px";
        // Run the drop handlers for the drag event.
        runDropHandlers(0 /* Drag */, event, this._dragData);
        // Run the drag event handler.
        runDrag(this, event, this._dragData);
    };
    /**
     * Handle the `'mouseup'` event for the drag handler.
     */
    DragHandler.prototype._evtMouseUp = function (event) {
        // Do nothing if the left mouse button is not released.
        if (event.button !== 0) {
            return;
        }
        // Mouse up events are never propagated since this handler
        // is only installed when during a left mouse drag operation.
        event.preventDefault();
        event.stopPropagation();
        // Remove the extra mouse handlers.
        document.removeEventListener('mousemove', this, true);
        document.removeEventListener('mouseup', this, true);
        // Bail if no drag is in progress.
        if (!this._dragData) {
            return;
        }
        // Run the drop and end handlers, then dispose the drag data.
        try {
            runDropHandlers(1 /* Drop */, event, this._dragData);
            runDragEnd(this, event, this._dragData);
        }
        finally {
            this._disposeDragData();
        }
    };
    /**
     * Dispose of the resources held by the drag data.
     */
    DragHandler.prototype._disposeDragData = function () {
        var data = this._dragData;
        if (!data) {
            return;
        }
        this._dragData = null;
        document.body.removeChild(data.ghost);
        data._override.dispose();
    };
    return DragHandler;
})();
exports.DragHandler = DragHandler;
/**
 * A class for implementing drop targets.
 *
 * #### Example
 * ```typescript
 * import {
 *   DragData, DropHandler
 * } from 'phosphor-domutil';
 *
 * class DropTarget {
 *
 *   constructor() {
 *     this._node = someNodeFactory();
 *     this._dropHandler = new DropHandler(this._node, this);
 *     this._dropHandler.onDragEnter = this._onDragEnter;
 *     this._dropHandler.onDragLeave = this._onDragLeave;
 *     this._dropHandler.onDragOver = this._onDragOver;
 *     this._dropHandler.onDrop = this._onDrop;
 *   }
 *
 *   dispose(): void {
 *     this._dropHandler.dispose();
 *   }
 *
 *   private _onDragEnter(event: MouseEvent, data: DragData): void {
 *     console.log('drag enter', data);
 *   }
 *
 *   private _onDragLeave(event: MouseEvent, data: DragData): void {
 *     console.log('drag leave', data);
 *   }
 *
 *   private _onDragOver(event: MouseEvent, data: DragData): void {
 *     console.log('drag', data);
 *   }
 *
 *   private _onDrop(event: MouseEvent, data: DragData): void {
 *     console.log(data.getData('text/plain'));
 *     console.log(data.getData('application/x-my-custom-type'));
 *     console.log('drop', data);
 *   }
 *
 *   private _node: HTMLElement;
 *   private _dropHandler: DropHandler;
 * }
 * ```
 */
var DropHandler = (function () {
    /**
     * Construct a new drop handler.
     *
     * @param node - The node which acts as the drop target.
     *
     * @param context - The `this` context for the drop handlers.
     */
    function DropHandler(node, context) {
        /**
         * A function called when the drag enters the DOM node.
         *
         * @param event - The underlying native mouse event.
         *
         * @param data - The drag data object for the drag operation.
         *
         * #### Notes
         * The creator of the drop handler should assign a function to this
         * property to handle the drag enter event.
         *
         * The handler should update the `dropAction` of the data to reflect
         * whether or not it can accept drops from the given drag data.
         */
        this.onDragEnter = null;
        /**
         * A function called when the drag moves over the DOM node.
         *
         * @param event - The underlying native mouse event.
         *
         * @param data - The drag data object for the drag operation.
         *
         * #### Notes
         * The creator of the drop handler should assign a function to this
         * property to handle the drag over event.
         *
         * The handler should update the `dropAction` of the data if the
         * result is different than the action set by the enter handler.
         */
        this.onDragOver = null;
        /**
         * A function called when the drag leaves the DOM node.
         *
         * @param event - The underlying native mouse event.
         *
         * @param data - The drag data object for the drag operation.
         *
         * #### Notes
         * The creator of the drop handler should assign a function to this
         * property to handle the drag leave event.
         *
         * The `dropAction` is set to `'none'` after this handler returns.
         */
        this.onDragLeave = null;
        /**
         * A function called when a drop occurs on the DOM node.
         *
         * @param event - The underlying native mouse event.
         *
         * @param data - The drag data object for the drag operation.
         *
         * #### Notes
         * The creator of the drop handler should assign a function to this
         * property to handle the drop event.
         *
         * The handler should update the `dropAction` of the data if the
         * result is different than the action which was previously set.
         *
         * The `dropAction` will be set to `'none'` if the handler is `null`.
         */
        this.onDrop = null;
        this._id = nextDropID();
        this._mouseover = false;
        this._node = node;
        this._context = context;
        dropRegistry[this._id] = createDropRecord(this);
    }
    /**
     * Dispose of the resources held by the drop handler.
     */
    DropHandler.prototype.dispose = function () {
        delete dropRegistry[this._id];
        this.onDragEnter = null;
        this.onDragOver = null;
        this.onDragLeave = null;
        this.onDrop = null;
        this._context = null;
        this._node = null;
    };
    Object.defineProperty(DropHandler.prototype, "isDisposed", {
        /**
         * Test if the drop handler is disposed.
         */
        get: function () {
            return this._node === null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DropHandler.prototype, "node", {
        /**
         * Get the DOM node for the drop handler.
         *
         * #### Notes
         * This is a read-only property.
         */
        get: function () {
            return this._node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DropHandler.prototype, "context", {
        /**
         * Get the `this` context for the drop handlers.
         *
         * #### Notes
         * This is a read-only property.
         */
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    return DropHandler;
})();
exports.DropHandler = DropHandler;
/**
 * A function which computes successive unique drop ids.
 */
var nextDropID = (function () { var id = 0; return function () { return 'dropID-' + id++; }; })();
/**
 * The registry of drop records.
 */
var dropRegistry = Object.create(null);
/**
 * Create a drop record for the given drop handler.
 */
function createDropRecord(handler) {
    return { handler: handler, entered: false, rect: null };
}
/**
 * Invalidate the cached drop record data.
 */
function invalidateCachedDropData() {
    for (var key in dropRegistry) {
        var record = dropRegistry[key];
        record.entered = false;
        record.rect = null;
    }
}
/**
 * Run the relevant drop handlers for the given parameters.
 */
function runDropHandlers(action, event, data) {
    for (var key in dropRegistry) {
        // Fetch common variables.
        var record = dropRegistry[key];
        var handler = record.handler;
        // Compute and cache the client drop rect if necessary.
        if (!record.rect) {
            record.rect = handler.node.getBoundingClientRect();
        }
        // Dispatch to the appropriate drop event handlers.
        if (hitTestRect(record.rect, event.clientX, event.clientY)) {
            if (!record.entered) {
                record.entered = true;
                runDragEnter(record.handler, event, data);
            }
            if (action === 0 /* Drag */) {
                runDragOver(record.handler, event, data);
            }
            else if (action === 1 /* Drop */) {
                runDrop(record.handler, event, data);
            }
        }
        else if (record.entered) {
            record.entered = false;
            data.dropAction = 'none';
            runDragLeave(record.handler, event, data);
        }
    }
}
/**
 * Run a drag handler's drag start event handler, if it exists.
 */
function runDragStart(handler, event, data) {
    if (handler.onDragStart) {
        handler.onDragStart.call(handler.context, event, data);
    }
}
/**
 * Run a drag handler's drag event handler, if it exists.
 */
function runDrag(handler, event, data) {
    if (handler.onDrag) {
        handler.onDrag.call(handler.context, event, data);
    }
}
/**
 * Run a drag handler's drag end event handler, if it exists.
 */
function runDragEnd(handler, event, data) {
    if (handler.onDragEnd) {
        handler.onDragEnd.call(handler.context, event, data);
    }
}
/**
 * Run a drop handler's drag enter event handler, if it exists.
 */
function runDragEnter(handler, event, data) {
    if (handler.onDragEnter) {
        handler.onDragEnter.call(handler.context, event, data);
    }
}
/**
 * Run a drop handler's drag over event handler, if it exists.
 */
function runDragOver(handler, event, data) {
    if (handler.onDragOver) {
        handler.onDragOver.call(handler.context, event, data);
    }
}
/**
 * Run a drop handler's drag leave event handler, if it exists.
 */
function runDragLeave(handler, event, data) {
    if (handler.onDragLeave) {
        handler.onDragLeave.call(handler.context, event, data);
    }
}
/**
 * Run a drop handler's drop event handler, if it exists.
 */
function runDrop(handler, event, data) {
    if (handler.onDrop) {
        handler.onDrop.call(handler.context, event, data);
    }
}
//# sourceMappingURL=index.js.map