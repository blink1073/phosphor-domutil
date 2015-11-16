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
 * The id for drop handle instances.
 */
var dropHandlerID = 0;
/**
 * The registry that holds data for drop handlers and allows for data passing.
 */
var dropHandlerRegistry = Object.create(null);
/**
 * A handler that provides a simple interface to make a widget a drop target.
 *
 * #### Example
 * ```typescript
 * import { DropHandler, IDragDropData } from 'phosphor-domutil';
 * import { Widget } from 'phosphor-widget';
 *
 * class DroppableWidget extends Widget {
 *   constructor() {
 *     super();
 *     this._dropHandler = new DropHandler(this);
 *     this._dropHandler.onDragEnter = this._onDragEnter;
 *     this._dropHandler.onDragLeave = this._onDragLeave;
 *     this._dropHandler.onDrag = this._onDrag;
 *     this._dropHandler.onDrop = this._onDrop;
 *   }
 *   dispose(): void {
 *     this._dropHandler.dispose();
 *     super.dispose();
 *   }
 *   private _onDragEnter(event: MouseEvent, dragData: IDragDropData): void {
 *     console.log('drag enter', dragData);
 *   }
 *   private _onDragLeave(event: MouseEvent, dragData: IDragDropData): void {
 *     console.log('drag leave', dragData);
 *   }
 *   private _onDrag(event: MouseEvent, dragData: IDragDropData): void {
 *     console.log('drag', dragData);
 *   }
 *   private _onDrop(event: MouseEvent, dragData: IDragDropData): void {
 *     console.log('drop', dragData);
 *   }
 *   private _dropHandler: DropHandler;
 * }
 * ```
 */
var DropHandler = (function () {
    /**
     * Construct a new drop handler.
     *
     * @param widget - The widget to associate with the drop handler.
     */
    function DropHandler(widget) {
        this._widget = null;
        this._widget = widget;
        DropHandler.register(this);
    }
    /**
     * Add a drop handler instance to the registry.
     *
     * @param handler - The drop handler being registered.
     *
     * #### Notes
     * This method should not need to be used by any clients of this library.
     */
    DropHandler.register = function (handler) {
        var id = ++dropHandlerID;
        DropHandler.idProperty.set(handler, id);
        dropHandlerRegistry[id] = {
            entered: false,
            handler: handler,
            rect: null
        };
    };
    /**
     * Remove a drop handler instance from the registry.
     *
     * @param handler - The drop handler being deregistered.
     *
     * #### Notes
     * This method should not need to be used by any clients of this library.
     */
    DropHandler.deregister = function (handler) {
        var id = DropHandler.idProperty.get(handler);
        if (dropHandlerRegistry[id]) {
            delete dropHandlerRegistry[id];
        }
    };
    /**
     * Deploy a drag event to the relevant drop handlers.
     *
     * @param action - The event type being deployed (either `'drag'` or
     * `'drop'`).
     *
     * @param event - The native mouse event that underlies the operation.
     *
     * @param dragData - A reference to the drag/drop context used to pass data
     * between the different stages of the drag and drop life cycle.
     *
     * #### Notes
     * This method should not need to be used by any clients of this library.
     */
    DropHandler.deploy = function (action, event, dragData) {
        var x = event.clientX;
        var y = event.clientY;
        Object.keys(dropHandlerRegistry).forEach(function (key) {
            // Multiple drop targets might match. For now, all of them will be fired,
            // but in the future, this behavior might change.
            var droppable = dropHandlerRegistry[key];
            var widget = droppable.handler._widget;
            // At the beginning of a drag, cache the bounding rectangle.
            if (!droppable.rect) {
                droppable.rect = widget.node.getBoundingClientRect();
            }
            var _a = droppable.rect, left = _a.left, top = _a.top, right = _a.right, bottom = _a.bottom;
            if (x >= left && y >= top && x < right && y < bottom) {
                if (!droppable.entered) {
                    droppable.entered = true;
                    droppable.handler.onDragEnter.call(widget, event, dragData);
                }
                switch (action) {
                    case 'drag':
                        droppable.handler.onDrag.call(widget, event, dragData);
                        break;
                    case 'drop':
                        droppable.handler.onDrop.call(widget, event, dragData);
                        break;
                }
            }
            else if (droppable.entered) {
                droppable.entered = false;
                droppable.handler.onDragLeave.call(widget, event, dragData);
            }
        });
    };
    /**
     * Dispose of the reference to a drop handler in the registry.
     */
    DropHandler.prototype.dispose = function () {
        DropHandler.deregister(this);
        this._widget = null;
    };
    Object.defineProperty(DropHandler.prototype, "isDisposed", {
        /**
         * Check if a drop handler is disposed.
         */
        get: function () {
            return this._widget === null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Handle the drag enter event.
     *
     * @param event - The native mouse event that underlies the drag operation.
     *
     * @param dragData - A reference to the drag/drop context used to pass data
     * between the different stages of the drag and drop life cycle.
     *
     * #### Notes
     * This method should be overwritten per drop handler instance if a widget
     * wants to listen for it.
     */
    DropHandler.prototype.onDragEnter = function (event, dragData) { };
    /**
     * Handle the drag event.
     *
     * @param event - The native mouse event that underlies the drag operation.
     *
     * @param dragData - A reference to the drag/drop context used to pass data
     * between the different stages of the drag and drop life cycle.
     *
     * #### Notes
     * This method should be overwritten per drop handler instance if a widget
     * wants to listen for it.
     */
    DropHandler.prototype.onDrag = function (event, dragData) { };
    /**
     * Handle the drag leave event.
     *
     * @param event - The native mouse event that underlies the drag operation.
     *
     * @param dragData - A reference to the drag/drop context used to pass data
     * between the different stages of the drag and drop life cycle.
     *
     * #### Notes
     * This method should be overwritten per drop handler instance if a widget
     * wants to listen for it.
     */
    DropHandler.prototype.onDragLeave = function (event, dragData) { };
    /**
     * Handle the drop event.
     *
     * @param event - The native mouse event that underlies the drop operation.
     *
     * @param dragData - A reference to the drag/drop context used to pass data
     * between the different stages of the drag and drop life cycle.
     *
     * #### Notes
     * This method should be overwritten per drop handler instance if a widget
     * wants to listen for it.
     */
    DropHandler.prototype.onDrop = function (event, dragData) { };
    /**
     * The property descriptor for the `id` attached property.
     */
    DropHandler.idProperty = new phosphor_properties_1.Property({
        name: 'id',
        value: null
    });
    return DropHandler;
})();
exports.DropHandler = DropHandler;
/**
 * A handler that provides a simple interface to make a widget draggable.
 *
 * #### Example
 * ```typescript
 * import { DragHandler, IDragDropData } from 'phosphor-domutil';
 * import { Widget } from 'phosphor-widget';
 *
 * class DraggableWidget extends Widget {
 *   constructor() {
 *     super();
 *     this._payload = () => { return new Widget(); };
 *     this._dragHandler = new DragHandler(this);
 *     this._dragHandler.onDragStart = this._onDragStart;
 *     this._dragHandler.onDragEnd = this._onDragEnd;
 *   }
 *   dispose(): void {
 *     this._dragHandler.dispose();
 *     super.dispose();
 *   }
 *   private _onDragStart(event: MouseEvent, dragData: IDragDropData): void {
 *     dragData.payload['application/x-phosphor-example'] = this._payload;
 *     console.log('drag start', dragData);
 *   }
 *   private _onDragEnd(event: MouseEvent, dragData: IDragDropData): void {
 *     console.log('drag end', dragData);
 *   }
 *   private _dragHandler: DragHandler = null;
 *   private _payload: () => Widget = null;
 * }
 * ```
 */
var DragHandler = (function () {
    /**
     * Construct a new drag handler.
     *
     * @param widget - The widget to associate with the drop handler.
     */
    function DragHandler(widget) {
        /**
         * Flag to determine if a drag handler will automatically catch drag events.
         *
         * #### Notes
         * If set to `false`, dragging will not automatically begin once the
         * `threshold` has been crossed. The `startDrag` method will need to be
         * invoked in order to inform the drag handler that a drag operation has
         * started.
         *
         * **See also:** [[startDrag]]
         */
        this.autostart = true;
        /**
         * The default dragging threshold in pixels.
         */
        this.dragThreshold = 5;
        this._dragData = null;
        this._widget = widget;
        widget.node.addEventListener('mousedown', this);
    }
    /**
     * Dispose of the resources the drag handler created.
     */
    DragHandler.prototype.dispose = function () {
        this._widget.node.removeEventListener('mousedown', this);
        this._widget = null;
    };
    Object.defineProperty(DragHandler.prototype, "isDisposed", {
        /**
         * Check if a drag handler is disposed.
         */
        get: function () {
            return this._widget === null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Create an HTML element that will follow the cursor in drag/drop operations.
     */
    DragHandler.prototype.ghost = function () {
        var widget = this._widget;
        var node = widget.node.cloneNode(true);
        var rect = widget.node.getBoundingClientRect();
        node.style.height = rect.height + "px";
        node.style.width = rect.width + "px";
        node.style.opacity = '0.75';
        return node;
    };
    /**
     * Handle the DOM events for the drag handler.
     *
     * @param event - The DOM event sent to the drag handler.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the drag handler's parent widget's DOM
     * node. It should not be called directly by user code.
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
     * Handle the drag start event.
     *
     * @param event - The native mouse event that underlies the drag operation.
     *
     * @param dragData - A reference to the drag/drop context used to pass data
     * between the different stages of the drag and drop life cycle.
     *
     * #### Notes
     * This method should be overwritten per drop handler instance if a widget
     * wants to listen for it.
     */
    DragHandler.prototype.onDragStart = function (event, dragData) { };
    /**
     * Handle the drag end event.
     *
     * @param event - The native mouse event that underlies the drag operation.
     *
     * @param dragData - A reference to the drag/drop context used to pass data
     * between the different stages of the drag and drop life cycle.
     *
     * #### Notes
     * This method should be overwritten per drop handler instance if a widget
     * wants to listen for it.
     */
    DragHandler.prototype.onDragEnd = function (event, dragData) { };
    /**
     * Start a drag operation manually.
     *
     * @param event - The native mouse event that underlies the drag operation.
     *
     * #### Notes
     * This method only needs to be used if the `autostart` flag for a drag
     * handler has been set to `false`.
     *
     * **See also:** [[autostart]]
     */
    DragHandler.prototype.startDrag = function (event) {
        if (this._dragData.started) {
            return;
        }
        this._dragData.started = true;
        this._dragData.ghost = this.ghost();
        this._dragData.ghost.style.position = 'absolute';
        document.body.appendChild(this._dragData.ghost);
        this.onDragStart.call(this._widget, event, this._dragData);
    };
    /**
     * Handle the `'mousedown'` event for the drag handler.
     */
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
    /**
     * Handle the `'mousemove'` event for the drag handler.
     */
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
        this._dragData.ghost.style.top = (event.clientY - 10) + "px";
        this._dragData.ghost.style.left = (event.clientX - 10) + "px";
        DropHandler.deploy('drag', event, this._dragData);
    };
    /**
     * Handle the `'mouseup'` event for the drag handler.
     */
    DragHandler.prototype._evtMouseUp = function (event) {
        document.removeEventListener('mousemove', this, true);
        document.removeEventListener('mouseup', this, true);
        if (this._dragData.started) {
            if (this._dragData.ghost) {
                document.body.removeChild(this._dragData.ghost);
            }
            DropHandler.deploy('drop', event, this._dragData);
            this.onDragEnd.call(this._widget, event, this._dragData);
        }
        this._dragData = null;
    };
    return DragHandler;
})();
exports.DragHandler = DragHandler;
//# sourceMappingURL=index.js.map