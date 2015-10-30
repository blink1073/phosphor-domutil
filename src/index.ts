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
 * `p-mod-override-cursor`: the class name added to the document body
 *   during cursor override.
 */
export
const OVERRIDE_CURSOR_CLASS = 'p-mod-override-cursor';


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
 * var override = overrideCursor('wait');
 *
 * // clear the override by disposing the return value
 * override.dispose();
 * ```
 */
export
function overrideCursor(cursor: string): IDisposable {
  var id = ++overrideID;
  var body = document.body;
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
 * var div = document.createElement('div');
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
  var rect = node.getBoundingClientRect();
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
 * var div = document.createElement('div');
 * div.style.borderTop = 'solid 10px black';
 * document.body.appendChild(div);
 *
 * var sizing = boxSizing(div);
 * sizing.borderTop;    // 10
 * sizing.paddingLeft;  // 0
 * // etc...
 * ```
 */
export
function boxSizing(node: HTMLElement): IBoxSizing {
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
 * var div = document.createElement('div');
 * div.style.minWidth = '90px';
 * document.body.appendChild(div);
 *
 * var limits = sizeLimits(div);
 * limits.minWidth;   // 90
 * limits.maxHeight;  // Infinity
 * // etc...
 * ```
 */
export
function sizeLimits(node: HTMLElement): ISizeLimits {
  var cstyle = window.getComputedStyle(node);
  return {
    minWidth: parseInt(cstyle.minWidth, 10) || 0,
    minHeight: parseInt(cstyle.minHeight, 10) || 0,
    maxWidth: parseInt(cstyle.maxWidth, 10) || Infinity,
    maxHeight: parseInt(cstyle.maxHeight, 10) || Infinity,
  }
}


const DRAG_MIME_TYPE = 'application/x-phosphor-draggable';


var dropCache = {
  data: Object.create(null),
  id: 0
};


/**
 * Get arbitrary data associated with a drag and drop operation.
 *
 * @param event - The DragEvent generated by a user interaction.
 *
 * @param mime - The MIME type whose data is being retrieved.
 *
 * @returns An arbitrary value associated with a DragEvent and a MIME type.
 *
 * #### Notes
 * The native drag and drop life cycle ends for the drop target with a `drop`
 * event where the value associated with a particular MIME should be retrieved.
 * One example is a Widget being dropped on a target that will clone it using a
 * retrieved factory function.
 */
export
function getDropData(event: DragEvent, mime: string): any {
  let id = event.dataTransfer.getData(DRAG_MIME_TYPE) || -1;
  return dropCache.data[id] && dropCache.data[id][mime];
}


/**
 * Set arbitrary data associated with a specific drag event.
 *
 * @param event - The DragEvent generated by a user interaction.
 *
 * @param mime - The MIME type whose data is being retrieved.
 *
 * @param data - The value being stored for a DragEvent/MIME combination.
 *
 * #### Notes
 * The native drag and drop life cycle begins with a `dragstart` event on the
 * draggable node. The value associated with a particular MIME should be set in
 * this event handler.
 */
export
function setDropData(event: DragEvent, mime: string, data: any): void {
  let id = event.dataTransfer.getData(DRAG_MIME_TYPE);
  if (!id) {
    id = `drag-${dropCache.id++}`;
    event.dataTransfer.setData(DRAG_MIME_TYPE, id);
    dropCache.data[id] = { };
  }
  dropCache.data[id][mime] = data;
}


/**
 * Clear data being held privately for a specific drag event.
 *
 * @param event - The DragEvent generated by a user interaction.
 *
 * #### Notes
 * The native drag and drop life cycle ends with a `dragend` event on the
 * draggable node. The values associated with a particular DragEvent should be
 * cleared in this event handler.
 */
export
function clearDropData(event: DragEvent): void {
  let id = event.dataTransfer.getData(DRAG_MIME_TYPE);
  delete dropCache.data[id];
}
