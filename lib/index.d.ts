import { IDisposable } from 'phosphor-disposable';
import { Property } from 'phosphor-properties';
import { Widget } from 'phosphor-widget';
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
export declare function hitTest(node: HTMLElement, clientX: number, clientY: number): boolean;
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
export interface IDragDropData {
    started: boolean;
    ghost: HTMLElement;
    override?: IDisposable;
    payload: {
        [mime: string]: any;
    };
    startX: number;
    startY: number;
}
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
export declare class DropHandler implements IDisposable {
    /**
     * The property descriptor for the `id` attached property.
     */
    static idProperty: Property<DropHandler, number>;
    /**
     * Add a drop handler instance to the registry.
     * #### Notes
     * This method should not need to be used by any clients of this library.
     */
    static register(handler: DropHandler): void;
    /**
     * Remove a drop handler instance from the registry.
     * #### Notes
     * This method should not need to be used by any clients of this library.
     */
    static deregister(handler: DropHandler): void;
    /**
     * Deploy a drag event to the relevant drop handlers.
     */
    static deploy(action: string, event: MouseEvent, dragData: IDragDropData): void;
    constructor(widget: Widget);
    dispose(): void;
    isDisposed: boolean;
    onDragEnter(event: MouseEvent, dragData: IDragDropData): void;
    onDrag(event: MouseEvent, dragData: IDragDropData): void;
    onDragLeave(event: MouseEvent, dragData: IDragDropData): void;
    onDrop(event: MouseEvent, dragData: IDragDropData): void;
    private _widget;
}
/**
 * A handler that provides a simple interface to make a widget draggable.
 *
 * #### Example
 * ```typescript
 * import { DragHandler, IDragDropData } from 'phosphor-domutil';
 * import { Widget } from 'phosphor-widget';
 *
 * class DraggableWidget extends Widget {
 *   constructor(label: string, factory: () => Widget) {
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
export declare class DragHandler implements IDisposable {
    autostart: boolean;
    dragThreshold: number;
    constructor(widget: Widget);
    dispose(): void;
    isDisposed: boolean;
    ghost(): HTMLElement;
    handleEvent(event: Event): void;
    onDragStart(event: MouseEvent, dragData: IDragDropData): void;
    onDragEnd(event: MouseEvent, dragData: IDragDropData): void;
    startDrag(event: MouseEvent): void;
    private _evtMouseDown(event);
    private _evtMouseMove(event);
    private _evtMouseUp(event);
    private _dragData;
    private _widget;
}
