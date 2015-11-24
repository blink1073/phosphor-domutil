/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  DisposableDelegate, IDisposable
} from 'phosphor-disposable';

import './index.css';


/**
 * The class name added to the document body during cursor override.
 */
const OVERRIDE_CURSOR_CLASS = 'p-mod-override-cursor';

/**
 * The class name added to a drag ghost node.
 */
const GHOST_CLASS = 'p-mod-ghost';

/**
 * The number of pixels of movement before the drag/drop lifecycle begins.
 */
const DRAG_THRESHOLD = 5;


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
export
function overrideCursor(cursor: string): IDisposable {
  let id = ++overrideID;
  let body = document.body;
  body.style.cursor = cursor;
  body.classList.add(OVERRIDE_CURSOR_CLASS);
  return new DisposableDelegate(() => {
    if (id === overrideID) {
      body.style.cursor = '';
      body.classList.remove(OVERRIDE_CURSOR_CLASS);
    }
  });
}


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
export
function hitTest(node: Element, clientX: number, clientY: number): boolean {
  return hitTestRect(node.getBoundingClientRect(), clientX, clientY);
}


/**
 * Test whether a client position lies within a client rect.
 */
function hitTestRect(r: ClientRect, x: number, y: number): boolean {
  return x >= r.left && x < r.right && y >= r.top && y < r.bottom;
}


/**
 * The box sizing (border and padding) for a a DOM node.
 */
export
interface IBoxSizing {
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
export
function boxSizing(node: HTMLElement): IBoxSizing {
  let cstyle = window.getComputedStyle(node);
  let bt = parseInt(cstyle.borderTopWidth, 10) || 0;
  let bl = parseInt(cstyle.borderLeftWidth, 10) || 0;
  let br = parseInt(cstyle.borderRightWidth, 10) || 0;
  let bb = parseInt(cstyle.borderBottomWidth, 10) || 0;
  let pt = parseInt(cstyle.paddingTop, 10) || 0;
  let pl = parseInt(cstyle.paddingLeft, 10) || 0;
  let pr = parseInt(cstyle.paddingRight, 10) || 0;
  let pb = parseInt(cstyle.paddingBottom, 10) || 0;
  let hs = bl + pl + pr + br;
  let vs = bt + pt + pb + bb;
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


/**
 * The size limits for a DOM node.
 */
export
interface ISizeLimits {
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
export
function sizeLimits(node: HTMLElement): ISizeLimits {
  let cstyle = window.getComputedStyle(node);
  return {
    minWidth: parseInt(cstyle.minWidth, 10) || 0,
    minHeight: parseInt(cstyle.minHeight, 10) || 0,
    maxWidth: parseInt(cstyle.maxWidth, 10) || Infinity,
    maxHeight: parseInt(cstyle.maxHeight, 10) || Infinity,
  }
}


/**
 * The data object for a drag and drop operation.
 *
 * Instances of this class are created automatically as needed.
 */
export
class DragData {
  /**
   * Construct a new drag data object.
   *
   * @param ghost - The HTML element which follows the cursor.
   */
  constructor(ghost: HTMLElement) {
    this._ghost = ghost;
    this._action = 'none';
    this._override = overrideCursor('no-drop');
  }

  /**
   * The HTML element which follows the cursor.
   *
   * #### Notes
   * This is a read-only property.
   */
  get ghost(): HTMLElement {
    return this._ghost;
  }

  /**
   * Get the current drop action.
   *
   * #### Notes
   * This will be one of `'copy'`, `'link'`, `'move'`, or `'none'`.
   */
  get dropAction(): string {
    return this._action;
  }

  /**
   * Set the current drop action.
   *
   * #### Notes
   * This must be one of `'copy'`, `'link'`, `'move'`, or `'none'`.
   *
   * The current cursor style will be updated to reflect the action.
   */
  set dropAction(value: string) {
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
  }

  /**
   * List the mime types added to the drag data.
   *
   * @returns A new array of the mime types added to the drag data.
   */
  types(): string[] {
    return Object.keys(this._data);
  }

  /**
   * Get the data for a particular mime type.
   *
   * @param mime - The mime type for the data.
   *
   * @returns The data for the mime type, or `undefined`.
   */
  getData(mime: string): any {
    return this._data[mime];
  }

  /**
   * Set the data for a particular mime type.
   *
   * @param mime - The mime type for the data.
   *
   * @param data - The data for the mime type.
   */
  setData(mime: string, data: any): void {
    this._data[mime] = data;
  }

  /**
   * Remove the data for a particular mime type.
   *
   * @param mime - The mime type for the data.
   */
  clearData(mime: string): void {
    delete this._data[mime];
  }

  // friend class DragHandler
  private _action: string;
  private _ghost: HTMLElement;
  private _override: IDisposable;
  private _data: any = Object.create(null);
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
export
class DragHandler implements IDisposable {
  /**
   * Construct a new drag handler.
   *
   * @param node - The node which acts as the drag target.
   *
   * @param context - The `this` context for the drag handlers.
   */
  constructor(node: HTMLElement, context?: any) {
    this._node = node;
    this._context = context;
    node.addEventListener('mousedown', this);
  }

  /**
   * Dispose of the drag handler and remove its event listeners.
   */
  dispose(): void {
    document.removeEventListener('mousemove', this, true);
    document.removeEventListener('mouseup', this, true);
    this._node.removeEventListener('mousedown', this);
    this._node = null;
    this._context = null;
    this._disposeDragData();
    this.onDragStart = null;
    this.onDrag = null;
    this.onDragEnd = null;
  }

  /**
   * Test if the drag handler is disposed.
   */
  get isDisposed(): boolean {
    return this._node === null;
  }

  /**
   * Get the DOM node for the drag handler.
   *
   * #### Notes
   * This is a read-only property.
   */
  get node(): HTMLElement {
    return this._node;
  }

  /**
   * Get the `this` context for the drag handlers.
   *
   * #### Notes
   * This is a read-only property.
   */
  get context(): any {
    return this._context;
  }

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
  onDragStart: (event: MouseEvent, data: DragData) => void = null;

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
  onDrag: (event: MouseEvent, data: DragData) => void = null;

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
  onDragEnd: (event: MouseEvent, data: DragData) => void = null;

  /**
   * Create the HTML element that will follow the cursor.
   *
   * #### Notes
   * This can be reimplemented by a subclass to create a custom ghost
   * node. The default implementation clones the handler's `node`.
   */
  createGhost(): HTMLElement {
    let node = this.node.cloneNode(true) as HTMLElement;
    let rect = this.node.getBoundingClientRect();
    node.style.height = `${rect.height}px`;
    node.style.width = `${rect.width}px`;
    node.classList.add(GHOST_CLASS);
    return node;
  }

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
  start(clientX: number, clientY: number): void {
    // Do nothing if the drag is already started.
    if (this._dragData) {
      return;
    }

    // Store the initial mouse press position.
    this._pressX = clientX;
    this._pressY = clientY;

    // Ignore the threshold for future mousemove events.
    this._ignoreThreshold = true;

    // Add the document mouse listeners.
    document.addEventListener('mousemove', this, true);
    document.addEventListener('mouseup', this, true);
  }

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
  handleEvent(event: Event): void {
    switch (event.type) {
    case 'mousedown':
      this._evtMouseDown(event as MouseEvent);
      break;
    case 'mousemove':
      this._evtMouseMove(event as MouseEvent);
      break;
    case 'mouseup':
      this._evtMouseUp(event as MouseEvent);
      break;
    }
  }

  /**
   * Handle the `'mousedown'` event for the drag handler.
   */
  private _evtMouseDown(event: MouseEvent): void {
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
  }

  /**
   * Handle the `'mousemove'` event for the drag handler.
   */
  private _evtMouseMove(event: MouseEvent): void {
    // Mouse move events are never propagated since this handler
    // is only installed when during a left mouse drag operation.
    event.preventDefault();
    event.stopPropagation();

    // Check to see if the drag threshold has been exceeded, and
    // start the drag operation the first time that event occurs.
    if (!this._dragData) {
      if (!this._ignoreThreshold) {
        let dx = Math.abs(event.clientX - this._pressX);
        let dy = Math.abs(event.clientY - this._pressY);
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
    let style = this._dragData.ghost.style;
    style.top = `${event.clientY}px`;
    style.left = `${event.clientX}px`;

    // Run the drop handlers for the drag event.
    runDropHandlers(DropHandlerAction.Drag, event, this._dragData);

    // Run the drag event handler.
    runDrag(this, event, this._dragData);
  }

  /**
   * Handle the `'mouseup'` event for the drag handler.
   */
  private _evtMouseUp(event: MouseEvent): void {
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
      runDropHandlers(DropHandlerAction.Drop, event, this._dragData);
      runDragEnd(this, event, this._dragData);
    } finally {
      this._disposeDragData();
    }
  }

  /**
   * Dispose of the resources held by the drag data.
   */
  private _disposeDragData(): void {
    let data = this._dragData;
    if (!data) {
      return;
    }
    this._dragData = null;
    document.body.removeChild(data.ghost);
    (data as any)._override.dispose();
  }

  private _pressX = -1;
  private _pressY = -1;
  private _context: any;
  private _node: HTMLElement;
  private _ignoreThreshold = false;
  private _dragData: DragData = null;
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
export
class DropHandler implements IDisposable {
  /**
   * Construct a new drop handler.
   *
   * @param node - The node which acts as the drop target.
   *
   * @param context - The `this` context for the drop handlers.
   */
  constructor(node: HTMLElement, context?: any) {
    this._node = node;
    this._context = context;
    dropRegistry[this._id] = createDropRecord(this);
  }

  /**
   * Dispose of the resources held by the drop handler.
   */
  dispose(): void {
    delete dropRegistry[this._id];
    this.onDragEnter = null;
    this.onDragOver = null;
    this.onDragLeave = null;
    this.onDrop = null;
    this._context = null;
    this._node = null;
  }

  /**
   * Test if the drop handler is disposed.
   */
  get isDisposed(): boolean {
    return this._node === null;
  }

  /**
   * Get the DOM node for the drop handler.
   *
   * #### Notes
   * This is a read-only property.
   */
  get node(): HTMLElement {
    return this._node;
  }

  /**
   * Get the `this` context for the drop handlers.
   *
   * #### Notes
   * This is a read-only property.
   */
  get context(): any {
    return this._context;
  }

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
  onDragEnter: (event: MouseEvent, data: DragData) => void = null;

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
  onDragOver: (event: MouseEvent, data: DragData) => void = null;

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
  onDragLeave: (event: MouseEvent, data: DragData) => void = null;

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
  onDrop: (event: MouseEvent, data: DragData) => void = null;

  private _context: any;
  private _node: HTMLElement;
  private _id = nextDropID();
}


/**
 * A data record for a drop handler registration.
 */
interface IDropRecord {
  /**
   * The drop handler for the record.
   */
  handler: DropHandler;

  /**
   * Whether the mouse has entered the drop target.
   */
  entered: boolean;

  /**
   * The cached client rect for the handler.
   */
  rect: ClientRect;
}


/**
 * A function which computes successive unique drop ids.
 */
var nextDropID = (() => { let id = 0; return () => 'dropID-' + id++; })();

/**
 * The registry of drop records.
 */
var dropRegistry: { [id: string]: IDropRecord } = Object.create(null);

/**
 * An enum of the semantic drop handler actions.
 */
const enum DropHandlerAction { Drag, Drop }


/**
 * Create a drop record for the given drop handler.
 */
function createDropRecord(handler: DropHandler): IDropRecord {
  return { handler, entered: false, rect: null };
}


/**
 * Invalidate the cached drop record data.
 */
function invalidateCachedDropData(): void {
  for (let key in dropRegistry) {
    let record = dropRegistry[key];
    record.entered = false;
    record.rect = null;
  }
}


/**
 * Run the relevant drop handlers for the given parameters.
 */
function runDropHandlers(action: DropHandlerAction, event: MouseEvent, data: DragData): void {
  for (let key in dropRegistry) {
    // Fetch common variables.
    let record = dropRegistry[key];
    let handler = record.handler;

    // Compute and cache the client drop rect if necessary.
    if (!record.rect) {
      record.rect = handler.node.getBoundingClientRect();
    }

    // Skip all un-entered records
    if (!record.entered) {
      continue;
    }

    // Dispatch all drag leave events first.
    if (!hitTestRect(record.rect, event.clientX, event.clientY)) {
      record.entered = false;
      runDragLeave(record.handler, event, data);
    }
  }
  for (let key in dropRegistry) {
    // Fetch common variables.
    let record = dropRegistry[key];
    let handler = record.handler;

    // Dispatch all other drag events.
    if (hitTestRect(record.rect, event.clientX, event.clientY)) {
        if (!record.entered) {
          record.entered = true;
          runDragEnter(record.handler, event, data);
        }
        if (action === DropHandlerAction.Drag) {
          runDragOver(record.handler, event, data);
        } else if (action === DropHandlerAction.Drop) {
          runDrop(record.handler, event, data);
        }
    }
  }
}


/**
 * Run a drag handler's drag start event handler, if it exists.
 */
function runDragStart(handler: DragHandler, event: MouseEvent, data: DragData): void {
  if (handler.onDragStart) {
    handler.onDragStart.call(handler.context, event, data);
  }
}


/**
 * Run a drag handler's drag event handler, if it exists.
 */
function runDrag(handler: DragHandler, event: MouseEvent, data: DragData): void {
  if (handler.onDrag) {
    handler.onDrag.call(handler.context, event, data);
  }
}


/**
 * Run a drag handler's drag end event handler, if it exists.
 */
function runDragEnd(handler: DragHandler, event: MouseEvent, data: DragData): void {
  if (handler.onDragEnd) {
    handler.onDragEnd.call(handler.context, event, data);
  }
}


/**
 * Run a drop handler's drag enter event handler, if it exists.
 */
function runDragEnter(handler: DropHandler, event: MouseEvent, data: DragData): void {
  if (handler.onDragEnter) {
    handler.onDragEnter.call(handler.context, event, data);
  }
}


/**
 * Run a drop handler's drag over event handler, if it exists.
 */
function runDragOver(handler: DropHandler, event: MouseEvent, data: DragData): void {
  if (handler.onDragOver) {
    handler.onDragOver.call(handler.context, event, data);
  }
}


/**
 * Run a drop handler's drag leave event handler, if it exists.
 */
function runDragLeave(handler: DropHandler, event: MouseEvent, data: DragData): void {
  if (handler.onDragLeave) {
    handler.onDragLeave.call(handler.context, event, data);
  }
  data.dropAction = 'none';
}


/**
 * Run a drop handler's drop event handler, if it exists.
 */
function runDrop(handler: DropHandler, event: MouseEvent, data: DragData): void {
  if (handler.onDrop) {
    handler.onDrop.call(handler.context, event, data);
  } else {
    data.dropAction = 'none';
  }
}
