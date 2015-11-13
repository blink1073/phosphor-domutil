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

import {
  Widget
} from 'phosphor-widget';

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
 * Test whether a client rect contains the given client position.
 */
export
function hitTestRect(r: ClientRect, x: number, y: number): boolean {
  return x >= r.left && y >= r.top && x < r.right && y < r.bottom;
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
  started: boolean;
  ghost: HTMLElement,
  override?: IDisposable;
  payload: { [mime: string]: any };
  startX: number;
  startY: number;
}


export
class DroppableHandler implements IDisposable {

  static id = 0;

  static idProperty = new Property<DroppableHandler, number>({
    name: 'id',
    value: null
  });

  static droppables: {
    [id: string]: {
      entered: boolean,
      handler: DroppableHandler,
      rect: ClientRect
    }
  } = Object.create(null);

  static register(handler: DroppableHandler): void {
    let id = ++DroppableHandler.id;
    DroppableHandler.idProperty.set(handler, id);
    DroppableHandler.droppables[id] = {
      entered: false,
      handler: handler,
      rect: null
    };
  }

  static deregister(handler: DroppableHandler): void {
    let id = DroppableHandler.idProperty.get(handler);
    if (DroppableHandler.droppables[id]) {
      delete DroppableHandler.droppables[id];
    }
  }

  static drag(event: MouseEvent, data: IDragDropData): void {
    let x = event.clientX;
    let y = event.clientY;

    Object.keys(DroppableHandler.droppables).forEach(key => {
      // Multiple drop targets might match. This requires thought.
      let droppable = DroppableHandler.droppables[key];
      let widget = droppable.handler._widget;
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
      } else if (droppable.entered) {
        droppable.entered = false;
        droppable.handler.onDragLeave.call(widget, event, data);
      }
    });
  }

  static drop(event: MouseEvent, data: IDragDropData): void {
    let x = event.clientX;
    let y = event.clientY;

    Object.keys(DroppableHandler.droppables).forEach(key => {
      // Multiple drop targets might match. This requires thought.
      let droppable = DroppableHandler.droppables[key];
      let widget = droppable.handler._widget;
      if (!droppable.rect) {
        droppable.rect = widget.node.getBoundingClientRect();
      }
      if (hitTestRect(droppable.rect, x, y)) {
        if (!droppable.entered) {
          droppable.entered = true;
          droppable.handler.onDragEnter.call(widget, event, data);
        }
        droppable.handler.onDrop.call(widget, event, data);
      } else if (droppable.entered) {
        droppable.entered = false;
        droppable.handler.onDragLeave.call(widget, event, data);
      }
    });
  }

  constructor(widget: Widget) {
    this._widget = widget;
    DroppableHandler.register(this);
  }

  dispose(): void {
    DroppableHandler.deregister(this);
    this._widget = null;
  }

  get isDisposed(): boolean {
    return this._widget === null;
  }

  onDragEnter(event: MouseEvent, dragData: IDragDropData): void { }

  onDrag(event: MouseEvent, dragData: IDragDropData): void { }

  onDragLeave(event: MouseEvent, dragData: IDragDropData): void { }

  onDrop(event: MouseEvent, dragData: IDragDropData): void { }

  private _widget: Widget = null;
}


export
class DragHandler implements IDisposable {

  autostart = true;

  dragThreshold = 5;

  constructor(widget: Widget) {
    this._widget = widget;
    widget.node.addEventListener('mousemove', this);
  }

  dispose(): void {
    this._widget.node.removeEventListener('mousemove', this);
    this._widget = null;
  }

  get isDisposed(): boolean {
    return this._widget === null;
  }

  ghost(): HTMLElement {
    let widget = this._widget;
    let node = widget.node.cloneNode(true) as HTMLElement;
    let rect = widget.node.getBoundingClientRect();
    node.style.height = `${rect.height}px`;
    node.style.width = `${rect.width}px`;
    node.style.opacity = '0.75';
    return node;
  }

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

  onDragStart(event: MouseEvent, dragData: IDragDropData): void { }

  onDragEnd(event: MouseEvent, dragData: IDragDropData): void { }

  startDrag(event: MouseEvent): void {
    if (this._dragData.started) {
      return;
    }
    this._dragData.started = true;
    this._dragData.ghost = this.ghost();
    this._dragData.ghost.style.position = 'absolute';
    document.body.appendChild(this._dragData.ghost);
    this.onDragStart(event, this._dragData);
  }

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

    // 10px is arbitary, this might require configuration.
    this._dragData.ghost.style.top = `${event.clientY - 10}px`;
    this._dragData.ghost.style.left = `${event.clientX - 10}px`;
    DroppableHandler.drag(event, this._dragData);
  }

  private _evtMouseUp(event: MouseEvent): void {
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
  }

  private _dragData: IDragDropData = null;
  private _widget: Widget;
}
