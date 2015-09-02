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


/**
 * The class name added to the document body on cursor override.
 */
export
const OVERRIDE_CURSOR_CLASS = 'p-mod-override-cursor';


/**
 * The token object for the current override.
 */
var overrideToken: any = null;


/**
 * Override the cursor for the entire document.
 *
 * @param cursor - The string representing the cursor style.
 *
 * @returns An object conforming to the IDisposable interface which will clear
 * the override.
 */
export
function overrideCursor(cursor: string): IDisposable {
  var token = overrideToken = <any>{};
  var body = document.body;
  body.style.cursor = cursor;
  body.classList.add(OVERRIDE_CURSOR_CLASS);
  return new DisposableDelegate(() => {
    if (token === overrideToken) {
      overrideToken = null;
      body.style.cursor = '';
      body.classList.remove(OVERRIDE_CURSOR_CLASS);
    }
  });
}


/**
 * Test whether a client position lies within a node.
 *
 * @param node - The HTMLElement on which to test against.
 *
 * @param x - The x co-ordinate of the position to hit test.
 *
 * @param y - The y co-ordinate of the position to hit test.
 *
 * @returns A boolean, true if the x-y co-ordinates are within the node.
 *
 * #### Example
 * ```typescript
 * var obj = document.createElement('img');
 * obj.style.position = 'absolute';
 * obj.style.left = 0;
 * obj.style.top = 0;
 * obj.width = 100;
 * obj.height = 100;
 * document.body.appendChild( obj );
 *
 * hitTest( obj, 50, 50 ); // true
 * hitTest( obj, 150, 150 ); // false
 * ```
 *
 * #### Notes
 * This has `O(1)` complexity.
 */
export
function hitTest(node: HTMLElement, x: number, y: number): boolean {
  var rect = node.getBoundingClientRect();
  return x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
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
 * Compute the box sizing for a DOM node.
 *
 * @param node - The HTMLElement for which to compute the box sizing.
 *
 * @returns An object conforming to the IBoxSizing interface.
 *
 * #### Example
 * ```typescript
 * var node = document.createElement('img');
 * node.width = 100;
 * node.height = 100;
 * document.body.appendChild( node );
 *
 * var sizing = boxSizing( node );
 * ```
 *
 * #### Notes
 * This has `O(1)` complexity.
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
 * Compute the size limits for a DOM node.
 *
 * @param node - The node for which to compute the size limits.
 *
 * @returns An object conforming to the ISizeLimits interface.
 *
 * #### Example
 * ```typescript
 * var obj = document.createElement('img');
 * obj.height = 100;
 * obj.width = 100;
 * document.body.appendNode( obj );
 *
 * var limits = sizeLimits( obj );
 * ```
 *
 * #### Notes
 * This has `O(1)` complexity.
 *
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
