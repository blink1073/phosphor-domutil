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

import {
  Property
} from 'phosphor-properties';

import './index.css';


/**
 * The class name added to the document body during cursor override.
 */
const OVERRIDE_CURSOR_CLASS = 'p-mod-override-cursor';


/**
 * The id for the active cursor override.
 */
let overrideID = 0;


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
function hitTest(node: HTMLElement, clientX: number, clientY: number): boolean {
  let rect = node.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX < rect.right &&
    clientY >= rect.top &&
    clientY < rect.bottom
  );
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


export
interface IDragDropData {
  /**
   * Flag indicating whether a drag operation has begun.
   *
   * #### Notes
   * This flag should not need to be used by any clients of this library.
   */
  started: boolean;
  /**
   * A reference to the HTML element that follows the cursor.
   */
  ghost: HTMLElement,
  /**
   * An `IDisposable` reference to facilitate use of `overrideCursor`.
   *
   * **See also:** [[overrideCursor]]
   */
  override?: IDisposable;
  /**
   * A key/value map of MIMEs/payloads for different drop targets.
   */
  payload: { [mime: string]: any };
  /**
   * The starting X coordinate of a drag operation.
   */
  startX: number;
  /**
   * The starting Y coordinate of a drag operation.
   */
  startY: number;
}


/**
 * The id for drop handle instances.
 */
var dropHandlerID = 0;

/**
 * The registry that holds data for drop handlers and allows for data passing.
 */
var dropHandlerRegistry: {
  [id: string]: {
    entered: boolean,
    handler: DropHandler,
    rect: ClientRect
  }
} = Object.create(null);


/**
 * A handler that provides a simple interface to make a node a drop target.
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
export
class DropHandler implements IDisposable {
  /**
   * The property descriptor for the `id` attached property.
   */
  static idProperty = new Property<DropHandler, number>({
    name: 'id',
    value: null
  });

  /**
   * Add a drop handler instance to the registry.
   *
   * @param handler - The drop handler being registered.
   *
   * #### Notes
   * This method should not need to be used by any clients of this library.
   */
  static register(handler: DropHandler): void {
    let id = ++dropHandlerID;
    DropHandler.idProperty.set(handler, id);
    dropHandlerRegistry[id] = {
      entered: false,
      handler: handler,
      rect: null
    };
  }

  /**
   * Remove a drop handler instance from the registry.
   *
   * @param handler - The drop handler being deregistered.
   *
   * #### Notes
   * This method should not need to be used by any clients of this library.
   */
  static deregister(handler: DropHandler): void {
    let id = DropHandler.idProperty.get(handler);
    if (dropHandlerRegistry[id]) {
      delete dropHandlerRegistry[id];
    }
  }

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
  static deploy(action: string, event: MouseEvent, dragData: IDragDropData): void {
    let x = event.clientX;
    let y = event.clientY;

    Object.keys(dropHandlerRegistry).forEach(key => {

      // Multiple drop targets might match. For now, all of them will be fired,
      // but in the future, this behavior might change.
      let droppable = dropHandlerRegistry[key];
      let context = droppable.handler._context;
      let node = droppable.handler._node;

      // At the beginning of a drag, cache the bounding rectangle.
      if (!droppable.rect) {
        droppable.rect = (node as HTMLElement).getBoundingClientRect();
      }
      let { left, top, right, bottom } = droppable.rect;
      if (x >= left && y >= top && x < right && y < bottom) {
        if (!droppable.entered) {
          droppable.entered = true;
          if (droppable.handler.onDragEnter) {
            droppable.handler.onDragEnter.call(context, event, dragData);
          }
        }
        switch (action) {
        case 'drag':
          if (droppable.handler.onDrag) {
            droppable.handler.onDrag.call(context, event, dragData);
          }
          break;
        case 'drop':
          if (droppable.handler.onDrop) {
            droppable.handler.onDrop.call(context, event, dragData);
          }
          break;
        }
      } else if (droppable.entered) {
        droppable.entered = false;
        if (droppable.handler.onDragLeave) {
          droppable.handler.onDragLeave.call(context, event, dragData);
        }
      }
    });
  }

  /**
   * Construct a new drop handler.
   *
   * @param node - The node that event listeners are attached to.
   *
   * @param context - The context within which to fire event handlers.
   */
  constructor(node: Node, context: any) {
    this._node = node;
    this._context = context;
    DropHandler.register(this);
  }

  /**
   * Dispose of the reference to a drop handler in the registry.
   */
  dispose(): void {
    DropHandler.deregister(this);
    this._context = null;
    this._node = null;
  }

  /**
   * Check if a drop handler is disposed.
   */
  get isDisposed(): boolean {
    return this._node === null;
  }

  /**
   * Handle the drag enter event.
   *
   * @param event - The native mouse event that underlies the drag operation.
   *
   * @param dragData - A reference to the drag/drop context used to pass data
   * between the different stages of the drag and drop life cycle.
   */
  onDragEnter: (event: MouseEvent, dragData: IDragDropData) => void = null;

  /**
   * Handle the drag event.
   *
   * @param event - The native mouse event that underlies the drag operation.
   *
   * @param dragData - A reference to the drag/drop context used to pass data
   * between the different stages of the drag and drop life cycle.
   */
  onDrag: (event: MouseEvent, dragData: IDragDropData) => void = null;

  /**
   * Handle the drag leave event.
   *
   * @param event - The native mouse event that underlies the drag operation.
   *
   * @param dragData - A reference to the drag/drop context used to pass data
   * between the different stages of the drag and drop life cycle.
   */
  onDragLeave: (event: MouseEvent, dragData: IDragDropData) => void = null;

  /**
   * Handle the drop event.
   *
   * @param event - The native mouse event that underlies the drop operation.
   *
   * @param dragData - A reference to the drag/drop context used to pass data
   * between the different stages of the drag and drop life cycle.
   */
  onDrop: (event: MouseEvent, dragData: IDragDropData) => void = null;

  private _node: Node = null;
  private _context: any = null;
}


/**
 * A handler that provides a simple interface to make a node draggable.
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
 *     this._dragHandler = new DragHandler(this.node, this);
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
export
class DragHandler implements IDisposable {
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
  autostart = true;

  /**
   * The default dragging threshold in pixels.
   */
  dragThreshold = 5;

  /**
   * Construct a new drag handler.
   *
   * @param node - The node that is being dragged.
   *
   * @param context - The context within which to fire event handlers.
   */
  constructor(node: Node, context: any) {
    this._node = node;
    this._context =  context;
    node.addEventListener('mousedown', this);
  }

  /**
   * Dispose of the resources the drag handler created.
   */
  dispose(): void {
    this._node.removeEventListener('mousedown', this);
    this._node = null;
    this._context = null;
  }

  /**
   * Check if a drag handler is disposed.
   */
  get isDisposed(): boolean {
    return this._node === null;
  }

  /**
   * Create an HTML element that will follow the cursor in drag/drop operations.
   */
  ghost(): HTMLElement {
    let node = this._node.cloneNode(true) as HTMLElement;
    let rect = (this._node as HTMLElement).getBoundingClientRect();
    node.style.height = `${rect.height}px`;
    node.style.width = `${rect.width}px`;
    node.style.opacity = '0.75';
    return node;
  }

  /**
   * Handle the DOM events for the drag handler.
   *
   * @param event - The DOM event sent to the drag handler.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the drag handler's parent DOM node. It
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
   * Handle the drag start event.
   *
   * @param event - The native mouse event that underlies the drag operation.
   *
   * @param dragData - A reference to the drag/drop context used to pass data
   * between the different stages of the drag and drop life cycle.
   */
  onDragStart: (event: MouseEvent, dragData: IDragDropData) => void = null;

  /**
   * Handle the drag end event.
   *
   * @param event - The native mouse event that underlies the drag operation.
   *
   * @param dragData - A reference to the drag/drop context used to pass data
   * between the different stages of the drag and drop life cycle.
   */
  onDragEnd: (event: MouseEvent, dragData: IDragDropData) => void = null;

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
  startDrag(event: MouseEvent): void {
    if (this._dragData.started) {
      return;
    }
    this._dragData.started = true;
    this._dragData.ghost = this.ghost();
    this._dragData.ghost.style.position = 'absolute';
    document.body.appendChild(this._dragData.ghost);
    if (this.onDragStart) {
      this.onDragStart.call(this._context, event, this._dragData);
    }
  }

  /**
   * Handle the `'mousedown'` event for the drag handler.
   */
  private _evtMouseDown(event: MouseEvent): void {
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
  }

  /**
   * Handle the `'mousemove'` event for the drag handler.
   */
  private _evtMouseMove(event: MouseEvent): void {
    if (!this._dragData.started) {
      if (!this.autostart) {
        return;
      }
      let dx = Math.abs(event.clientX - this._dragData.startX);
      let dy = Math.abs(event.clientY - this._dragData.startY);
      if (Math.sqrt(dx * dx + dy * dy) >= this.dragThreshold) {
        this.startDrag(event);
      } else {
        return;
      }
    }
    this._dragData.ghost.style.top = `${event.clientY - 10}px`;
    this._dragData.ghost.style.left = `${event.clientX - 10}px`;
    DropHandler.deploy('drag', event, this._dragData);
  }

  /**
   * Handle the `'mouseup'` event for the drag handler.
   */
  private _evtMouseUp(event: MouseEvent): void {
    document.removeEventListener('mousemove', this, true);
    document.removeEventListener('mouseup', this, true);
    if (this._dragData.started) {
      if (this._dragData.ghost) {
        document.body.removeChild(this._dragData.ghost);
      }
      DropHandler.deploy('drop', event, this._dragData);
      if (this.onDragEnd) {
        this.onDragEnd.call(this._context, event, this._dragData);
      }
    }
    this._dragData = null;
  }

  private _dragData: IDragDropData = null;
  private _node: Node = null;
  private _context: any = null;
}
