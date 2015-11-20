import { IDisposable } from 'phosphor-disposable';
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
export declare function overrideCursor(cursor: string): IDisposable;
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
export declare function hitTest(node: Element, clientX: number, clientY: number): boolean;
/**
 * The box sizing (border and padding) for a a DOM node.
 */
export interface IBoxSizing {
    /**
     * The top border width, in pixels.
     */
    borderTop: number;
    /**
     * The left border width, in pixels.
     */
    borderLeft: number;
    /**
     * The right border width, in pixels.
     */
    borderRight: number;
    /**
     * The bottom border width, in pixels.
     */
    borderBottom: number;
    /**
     * The top padding width, in pixels.
     */
    paddingTop: number;
    /**
     * The left padding width, in pixels.
     */
    paddingLeft: number;
    /**
     * The right padding width, in pixels.
     */
    paddingRight: number;
    /**
     * The bottom padding width, in pixels.
     */
    paddingBottom: number;
    /**
     * The sum of horizontal border and padding.
     */
    horizontalSum: number;
    /**
     * The sum of vertical border and padding.
     */
    verticalSum: number;
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
export declare function boxSizing(node: HTMLElement): IBoxSizing;
/**
 * The size limits for a DOM node.
 */
export interface ISizeLimits {
    /**
     * The minimum width, in pixels.
     */
    minWidth: number;
    /**
     * The minimum height, in pixels.
     */
    minHeight: number;
    /**
     * The maximum width, in pixels.
     */
    maxWidth: number;
    /**
     * The maximum height, in pixels.
     */
    maxHeight: number;
}
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
export declare function sizeLimits(node: HTMLElement): ISizeLimits;
/**
 * The data object for a drag and drop operation.
 *
 * Instances of this class are created automatically as needed.
 */
export declare class DragData {
    /**
     * Construct a new drag data object.
     *
     * @param ghost - The HTML element which follows the cursor.
     */
    constructor(ghost: HTMLElement);
    /**
     * The HTML element which follows the cursor.
     *
     * #### Notes
     * This is a read-only property.
     */
    ghost: HTMLElement;
    /**
     * Get the current drop action.
     *
     * #### Notes
     * This will be one of `'copy'`, `'link'`, `'move'`, or `'none'`.
     */
    /**
     * Set the current drop action.
     *
     * #### Notes
     * This must be one of `'copy'`, `'link'`, `'move'`, or `'none'`.
     *
     * The current cursor style will be updated to reflect the action.
     */
    dropAction: string;
    /**
     * List the mime types added to the drag data.
     *
     * @returns A new array of the mime types added to the drag data.
     */
    types(): string[];
    /**
     * Get the data for a particular mime type.
     *
     * @param mime - The mime type for the data.
     *
     * @returns The data for the mime type, or `undefined`.
     */
    getData(mime: string): any;
    /**
     * Set the data for a particular mime type.
     *
     * @param mime - The mime type for the data.
     *
     * @param data - The data for the mime type.
     */
    setData(mime: string, data: any): void;
    /**
     * Remove the data for a particular mime type.
     *
     * @param mime - The mime type for the data.
     */
    clearData(mime: string): void;
    private _action;
    private _ghost;
    private _override;
    private _data;
}
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
export declare class DragHandler implements IDisposable {
    /**
     * Construct a new drag handler.
     *
     * @param node - The node which acts as the drag target.
     *
     * @param context - The `this` context for the drag handlers.
     */
    constructor(node: HTMLElement, context?: any);
    /**
     * Dispose of the drag handler and remove its event listeners.
     */
    dispose(): void;
    /**
     * Test if the drag handler is disposed.
     */
    isDisposed: boolean;
    /**
     * Get the DOM node for the drag handler.
     *
     * #### Notes
     * This is a read-only property.
     */
    node: HTMLElement;
    /**
     * Get the `this` context for the drag handlers.
     *
     * #### Notes
     * This is a read-only property.
     */
    context: any;
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
    onDragStart: (event: MouseEvent, data: DragData) => void;
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
    onDrag: (event: MouseEvent, data: DragData) => void;
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
    onDragEnd: (event: MouseEvent, data: DragData) => void;
    /**
     * Create the HTML element that will follow the cursor.
     *
     * #### Notes
     * This can be reimplemented by a subclass to create a custom ghost
     * node. The default implementation clones the handler's `node`.
     */
    createGhost(): HTMLElement;
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
    start(clientX: number, clientY: number): void;
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
    handleEvent(event: Event): void;
    /**
     * Handle the `'mousedown'` event for the drag handler.
     */
    private _evtMouseDown(event);
    /**
     * Handle the `'mousemove'` event for the drag handler.
     */
    private _evtMouseMove(event);
    /**
     * Handle the `'mouseup'` event for the drag handler.
     */
    private _evtMouseUp(event);
    /**
     * Dispose of the resources held by the drag data.
     */
    private _disposeDragData();
    private _ignoreThreshold;
    private _pressX;
    private _pressY;
    private _context;
    private _node;
    private _dragData;
}
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
export declare class DropHandler implements IDisposable {
    /**
     * Construct a new drop handler.
     *
     * @param node - The node which acts as the drop target.
     *
     * @param context - The `this` context for the drop handlers.
     */
    constructor(node: HTMLElement, context?: any);
    /**
     * Dispose of the resources held by the drop handler.
     */
    dispose(): void;
    /**
     * Test if the drop handler is disposed.
     */
    isDisposed: boolean;
    /**
     * Get the DOM node for the drop handler.
     *
     * #### Notes
     * This is a read-only property.
     */
    node: HTMLElement;
    /**
     * Get the `this` context for the drop handlers.
     *
     * #### Notes
     * This is a read-only property.
     */
    context: any;
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
    onDragEnter: (event: MouseEvent, data: DragData) => void;
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
    onDragOver: (event: MouseEvent, data: DragData) => void;
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
    onDragLeave: (event: MouseEvent, data: DragData) => void;
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
    onDrop: (event: MouseEvent, data: DragData) => void;
    private _context;
    private _node;
    private _id;
    private _mouseover;
}
