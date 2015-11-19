/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

import {
  DragData, DragHandler, DropHandler, boxSizing, hitTest, overrideCursor,
  sizeLimits,
} from '../../lib/index';

import './index.css';


function triggerMouseEvent(node: HTMLElement, type: string, options: any = {}): MouseEvent {
  let event = document.createEvent('MouseEvents');
  event.initMouseEvent(
    type, true, true,
    window, 0, 0, 0,
    options.clientX || 0,
    options.clientY || 0,
    !!options.ctrlKey,
    !!options.altKey,
    !!options.shiftKey,
    !!options.metaKey,
    options.button || 0,
    null
  );
  node.dispatchEvent(event);
  return event;
}


describe('phosphor-domutil', () => {

  describe('overrideCursor()', () => {

    it('should update the body `cursor` style', () => {
      expect(document.body.style.cursor).to.be('');
      let override = overrideCursor('wait');
      expect(document.body.style.cursor).to.be('wait');
      override.dispose();
    });

    it('should add the `p-mod-override-cursor` class to the body', () => {
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(false);
      let override = overrideCursor('wait');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      override.dispose();
    });

    it('should clear the override when disposed', () => {
      expect(document.body.style.cursor).to.be('');
      let override = overrideCursor('wait');
      expect(document.body.style.cursor).to.be('wait');
      override.dispose();
      expect(document.body.style.cursor).to.be('');
    });

    it('should remove the `p-mod-override-cursor` class when disposed', () => {
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(false);
      let override = overrideCursor('wait');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      override.dispose();
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(false);
    });

    it('should respect the most recent override', () => {
      expect(document.body.style.cursor).to.be('');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(false);
      let one = overrideCursor('wait');
      expect(document.body.style.cursor).to.be('wait');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      let two = overrideCursor('default');
      expect(document.body.style.cursor).to.be('default');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      let three = overrideCursor('cell')
      expect(document.body.style.cursor).to.be('cell');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      two.dispose();
      expect(document.body.style.cursor).to.be('cell');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      one.dispose();
      expect(document.body.style.cursor).to.be('cell');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      three.dispose();
      expect(document.body.style.cursor).to.be('');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(false);
    });

    it('should override the computed cursor for a node', () => {
      let div = document.createElement('div');
      div.className = 'cell-cursor';
      document.body.appendChild(div);
      expect(window.getComputedStyle(div).cursor).to.be('cell');
      let override = overrideCursor('wait');
      expect(window.getComputedStyle(div).cursor).to.be('wait');
      override.dispose();
      expect(window.getComputedStyle(div).cursor).to.be('cell');
      document.body.removeChild(div);
    });

  });

  describe('hitTest()', () => {

    it('should return `true` when point is inside the node', () => {
      let div = document.createElement('div');
      div.className = 'hit-test';
      document.body.appendChild(div);
      expect(hitTest(div, 50, 50)).to.be(true);
      document.body.removeChild(div);
    });

    it('should return `false` when point is outside the node', () => {
      let div = document.createElement('div');
      div.className = 'hit-test';
      document.body.appendChild(div);
      expect(hitTest(div, 150, 150)).to.be(false);
      document.body.removeChild(div);
    });

    it('should use closed intervals for left and top only', () => {
      let div = document.createElement('div');
      div.className = 'hit-test';
      document.body.appendChild(div);
      expect(hitTest(div, 0, 0)).to.be(true);
      expect(hitTest(div, 100, 0)).to.be(false);
      expect(hitTest(div, 99, 0)).to.be(true);
      expect(hitTest(div, 0, 100)).to.be(false);
      expect(hitTest(div, 0, 99)).to.be(true);
      expect(hitTest(div, 100, 100)).to.be(false);
      expect(hitTest(div, 99, 99)).to.be(true);
      document.body.removeChild(div);
    });

  });

  describe('boxSizing()', () => {

    it('should return a box sizing with correct parameters', () => {
      let div = document.createElement('div');
      div.className = 'box-sizing';
      document.body.appendChild(div);
      let sizing = boxSizing(div);
      expect(sizing.borderTop).to.be(10);
      expect(sizing.borderLeft).to.be(15);
      expect(sizing.borderRight).to.be(0);
      expect(sizing.borderBottom).to.be(0);
      expect(sizing.paddingTop).to.be(15);
      expect(sizing.paddingLeft).to.be(12);
      expect(sizing.paddingRight).to.be(8);
      expect(sizing.paddingBottom).to.be(9);
      expect(sizing.verticalSum).to.be(34);
      expect(sizing.horizontalSum).to.be(35);
      document.body.removeChild(div);
    });

  });

  describe('sizeLimits()', () => {

    it('should return a size limits object with correct parameters', () => {
      let div = document.createElement('div');
      div.className = 'size-limits';
      document.body.appendChild(div);
      let limits = sizeLimits(div);
      expect(limits.minWidth).to.be(90);
      expect(limits.minHeight).to.be(95);
      expect(limits.maxWidth).to.be(100);
      expect(limits.maxHeight).to.be(105);
      document.body.removeChild(div);
    });

  });

  describe('DropHandler', () => {

    describe('#constructor()', () => {

      it('should accept two arguments', () => {
        let node = document.createElement('div');
        let handler = new DropHandler(node, null);
        expect(handler instanceof DropHandler).to.be(true);
        handler.dispose();
      });

    });

    describe('#dispose()', () => {

      it('should dispose drop handler resources', () => {
        let node = document.createElement('div');
        let handler = new DropHandler(node, null);
        handler.dispose();
        expect(handler.isDisposed).to.be(true);
      });

    });

    describe('#onDragEnter', () => {

      it('should be invoked when a drag enters a drop target', () => {
        let draggable = document.createElement('div');
        let droppable = document.createElement('div');
        let drag = new DragHandler(draggable, null);
        let drop = new DropHandler(droppable, null);

        draggable.style.position = 'absolute';
        draggable.style.top = '0px';
        draggable.style.left = '0px';
        draggable.style.height = '100px';
        draggable.style.width = '100px';

        droppable.style.position = 'absolute';
        droppable.style.top = '150px';
        droppable.style.left = '150px';
        droppable.style.height = '100px';
        droppable.style.width = '100px';

        document.body.appendChild(draggable);
        document.body.appendChild(droppable);

        let dragRect = draggable.getBoundingClientRect();
        let dropRect = droppable.getBoundingClientRect();

        let count = 0;
        drop.onDragEnter = () => { count++; };

        triggerMouseEvent(draggable, 'mousedown', {
          clientX: dragRect.left,
          clientY: dragRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dragRect.left + drag.threshold,
          clientY: dragRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });

        expect(count).to.be(1);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left + 1,
          clientY: dropRect.top
        });

        expect(count).to.be(1);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left + 1,
          clientY: dropRect.top + 1,
        });

        expect(count).to.be(1);

        triggerMouseEvent(document.body, 'mouseup');

        drag.dispose();
        drop.dispose();
      });

    });

    describe('#onDragOver', () => {

      it('should be invoked when a drag happens over a drop target', () => {
        let draggable = document.createElement('div');
        let droppable = document.createElement('div');
        let drag = new DragHandler(draggable, null);
        let drop = new DropHandler(droppable, null);

        draggable.style.position = 'absolute';
        draggable.style.top = '0px';
        draggable.style.left = '0px';
        draggable.style.height = '100px';
        draggable.style.width = '100px';

        droppable.style.position = 'absolute';
        droppable.style.top = '150px';
        droppable.style.left = '150px';
        droppable.style.height = '100px';
        droppable.style.width = '100px';

        document.body.appendChild(draggable);
        document.body.appendChild(droppable);

        let dragRect = draggable.getBoundingClientRect();
        let dropRect = droppable.getBoundingClientRect();

        let count = 0;
        drop.onDragOver = () => { count++; };

        triggerMouseEvent(draggable, 'mousedown', {
          clientX: dragRect.left,
          clientY: dragRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dragRect.left + drag.threshold,
          clientY: dragRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });

        expect(count).to.be(1);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left + 1,
          clientY: dropRect.top
        });

        expect(count).to.be(2);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left + 1,
          clientY: dropRect.top + 1,
        });

        expect(count).to.be(3);

        triggerMouseEvent(document.body, 'mouseup');

        drag.dispose();
        drop.dispose();
      });

    });

    describe('#onDragLeave', () => {

      it('should be invoked when a drag leaves a drop target', () => {
        let draggable = document.createElement('div');
        let droppable = document.createElement('div');
        let drag = new DragHandler(draggable, null);
        let drop = new DropHandler(droppable, null);

        draggable.style.position = 'absolute';
        draggable.style.top = '0px';
        draggable.style.left = '0px';
        draggable.style.height = '100px';
        draggable.style.width = '100px';

        droppable.style.position = 'absolute';
        droppable.style.top = '150px';
        droppable.style.left = '150px';
        droppable.style.height = '100px';
        droppable.style.width = '100px';

        document.body.appendChild(draggable);
        document.body.appendChild(droppable);

        let dragRect = draggable.getBoundingClientRect();
        let dropRect = droppable.getBoundingClientRect();

        let count = 0;
        drop.onDragLeave = () => { count++; };

        triggerMouseEvent(draggable, 'mousedown', {
          clientX: dragRect.left,
          clientY: dragRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dragRect.left + drag.threshold,
          clientY: dragRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left + 1,
          clientY: dropRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dragRect.left,
          clientY: dragRect.top
        });

        expect(count).to.be(1);

        triggerMouseEvent(document.body, 'mouseup');

        drag.dispose();
        drop.dispose();
      });

    });

    describe('#onDrop', () => {

      it('should be invoked when an item is dropped', () => {
        let draggable = document.createElement('div');
        let droppable = document.createElement('div');
        let drag = new DragHandler(draggable, null);
        let drop = new DropHandler(droppable, null);

        draggable.style.position = 'absolute';
        draggable.style.top = '0px';
        draggable.style.left = '0px';
        draggable.style.height = '100px';
        draggable.style.width = '100px';

        droppable.style.position = 'absolute';
        droppable.style.top = '150px';
        droppable.style.left = '150px';
        droppable.style.height = '100px';
        droppable.style.width = '100px';

        document.body.appendChild(draggable);
        document.body.appendChild(droppable);

        let dragRect = draggable.getBoundingClientRect();
        let dropRect = droppable.getBoundingClientRect();

        let count = 0;
        drop.onDrop = () => { count++; };

        triggerMouseEvent(draggable, 'mousedown', {
          clientX: dragRect.left,
          clientY: dragRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mouseup', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });

        expect(count).to.be(1);

        drag.dispose();
        drop.dispose();
      });

    });

  });

  describe('DragHandler', () => {

    describe('#constructor()', () => {

      it('should accept two arguments', () => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);
        expect(handler instanceof DragHandler).to.be(true);
        handler.dispose();
      });

    });

    describe('#dispose()', () => {

      it('should dispose drag handler resources', () => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);
        handler.dispose();
        expect(handler.isDisposed).to.be(true);
      });

    });

    describe('#createGhost()', () => {

      it('should create a node with same dimensions as the original', () => {
        let nodeHeight = 99;
        let nodeWidth = 89;
        let node = document.createElement('div');
        document.body.appendChild(node);
        let handler = new DragHandler(node, null);
        node.style.height = `${nodeHeight}px`;
        node.style.width = `${nodeWidth}px`;
        let ghost = handler.createGhost();
        document.body.appendChild(ghost);
        let ghostHeight = ghost.getBoundingClientRect().height;
        let ghostWidth = ghost.getBoundingClientRect().width;
        expect(nodeHeight).to.equal(nodeHeight);
        expect(nodeWidth).to.equal(nodeWidth);
        document.body.removeChild(node);
        handler.dispose();
      });

    });

    describe('#onDragStart', () => {

      it('should be invoked when a drag has exceeded the threshold', () => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);

        node.style.position = 'absolute';
        node.style.top = '0px';
        node.style.left = '0px';
        node.style.height = '100px';
        node.style.width = '100px';

        document.body.appendChild(node);

        let rect = node.getBoundingClientRect();

        let count = 0;
        handler.onDragStart = () => { count++; };

        triggerMouseEvent(node, 'mousedown', {
          clientX: rect.left,
          clientY: rect.top,
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + handler.threshold - 1,
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + handler.threshold,
          clientY: rect.top
        });

        expect(count).to.be(1);

        triggerMouseEvent(document.body, 'mouseup');

        handler.dispose();
      });

    });

    describe('#onDrag', () => {

      it('should be invoked when a drag moves', () => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);

        node.style.position = 'absolute';
        node.style.top = '0px';
        node.style.left = '0px';
        node.style.height = '100px';
        node.style.width = '100px';

        document.body.appendChild(node);

        let rect = node.getBoundingClientRect();

        let count = 0;
        handler.onDrag = () => { count++; };

        triggerMouseEvent(node, 'mousedown', {
          clientX: rect.left,
          clientY: rect.top,
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + handler.threshold - 1,
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + handler.threshold,
          clientY: rect.top
        });

        expect(count).to.be(1);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + handler.threshold + 1,
          clientY: rect.top
        });

        expect(count).to.be(2);

        triggerMouseEvent(document.body, 'mouseup');

        handler.dispose();
      });

    });

    describe('#onDragEnd', () => {

      it('should be invoked when a drag ends', () => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);

        node.style.position = 'absolute';
        node.style.top = '0px';
        node.style.left = '0px';
        node.style.height = '100px';
        node.style.width = '100px';

        document.body.appendChild(node);

        let rect = node.getBoundingClientRect();

        let count = 0;
        handler.onDragEnd = () => { count++; };

        triggerMouseEvent(node, 'mousedown', {
          clientX: rect.left,
          clientY: rect.top,
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + handler.threshold - 1,
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + handler.threshold,
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mouseup');

        expect(count).to.be(1);

        handler.dispose();
      });

    });

  });

});
