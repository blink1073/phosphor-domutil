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


// This needs to mirror the DRAG_THRESHOLD in the main index file.
const DRAG_THRESHOLD = 5;


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
          clientX: dragRect.left + DRAG_THRESHOLD,
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
          clientX: dragRect.left + DRAG_THRESHOLD,
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
        let droppableOverlap = document.createElement('div');
        let drag = new DragHandler(draggable, null);
        let drop = new DropHandler(droppable, null);
        let dropOverlap = new DropHandler(droppableOverlap, null);

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

        droppableOverlap.style.position = 'absolute';
        droppableOverlap.style.top = '150px';
        droppableOverlap.style.left = '225px';
        droppableOverlap.style.height = '100px';
        droppableOverlap.style.width = '100px';

        document.body.appendChild(draggable);
        document.body.appendChild(droppable);
        document.body.appendChild(droppableOverlap);

        let dragRect = draggable.getBoundingClientRect();
        let dropRect = droppable.getBoundingClientRect();
        let dropOverlapRect = droppableOverlap.getBoundingClientRect();

        let count = 0;
        let leaveBeforeEnter = false;

        drop.onDragLeave = () => {
          count++;
        };

        dropOverlap.onDragEnter = () => {
          if (count === 1) {
            leaveBeforeEnter = true;
          }
        };

        triggerMouseEvent(draggable, 'mousedown', {
          clientX: dragRect.left,
          clientY: dragRect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dragRect.left + DRAG_THRESHOLD,
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
          clientX: dropRect.left + dropRect.width + 1,
          clientY: dropOverlapRect.top
        });

        expect(count).to.be(1);
        expect(leaveBeforeEnter).to.be(true);

        triggerMouseEvent(document.body, 'mouseup');

        drag.dispose();
        drop.dispose();
        dropOverlap.dispose();
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

      it('if not set, dropAction should be set to \'none\'', () => {
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
        let dropAction = '';

        drag.onDragEnd = (event: MouseEvent, data: DragData) => {
          dropAction = data.dropAction;
        };

        drop.onDragEnter = (event: MouseEvent, data: DragData) => {
          dropAction = data.dropAction = 'copy';
        };

        triggerMouseEvent(draggable, 'mousedown', {
          clientX: dragRect.left,
          clientY: dragRect.top
        });

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });

        triggerMouseEvent(document.body, 'mouseup', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });

        expect(dropAction).to.equal('none');

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
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD - 1,
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD,
          clientY: rect.top
        });

        expect(count).to.be(1);

        triggerMouseEvent(document.body, 'mouseup');

        handler.dispose();
      });

      it('should ignore secondary mouse clicks', () => {
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
          button: 1,
          clientX: rect.left,
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD,
          clientY: rect.top
        });

        expect(count).to.be(0);

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
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD - 1,
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD,
          clientY: rect.top
        });

        expect(count).to.be(1);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD + 1,
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
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD - 1,
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD,
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mouseup');

        expect(count).to.be(1);

        handler.dispose();
      });

      it('should ignore secondary mouseup events', () => {
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
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD,
          clientY: rect.top
        });

        expect(count).to.be(0);

        triggerMouseEvent(document.body, 'mouseup', {
          button: 1
        });

        expect(count).to.be(0);

        handler.dispose();
      });

    });

    describe('#start', () => {

      it('should initiate a drag without needing a mousedown', () => {
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
        let content = '';
        handler.onDrag = () => { count++; };

        handler.start(0, 0, {});

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD - 1,
          clientY: rect.top
        });

        expect(count).to.be(1);

        triggerMouseEvent(document.body, 'mouseup');

        handler.dispose();
      });

      it('should populate the drag data', () => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);

        node.style.position = 'absolute';
        node.style.top = '0px';
        node.style.left = '0px';
        node.style.height = '100px';
        node.style.width = '100px';

        document.body.appendChild(node);

        let rect = node.getBoundingClientRect();

        let content = '';
        handler.onDrag = (ev, data) => {
          content = data.getData('text/plain');
        };

        handler.start(0, 0, { 'text/plain': 'foo' });

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD - 1,
          clientY: rect.top
        });

        expect(content).to.be('foo');

        triggerMouseEvent(document.body, 'mouseup');

        handler.dispose();
      });

      it('should ignore if a drag is already started', () => {
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
        let content = '';
        handler.onDrag = (ev, data) => {
          count++;
          content = data.getData('text/plain');
        };

        handler.start(0, 0, { 'text/plain': 'foo' });

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD - 1,
          clientY: rect.top
        });

        handler.start(0, 0, { 'text/plain': 'bar' });

        triggerMouseEvent(document.body, 'mousemove', {
          clientX: rect.left + DRAG_THRESHOLD - 2,
          clientY: rect.top
        });

        expect(count).to.be(2);
        expect(content).to.be('foo');

        triggerMouseEvent(document.body, 'mouseup');

        handler.dispose();
      });

    });

  });

  describe('DragData', () => {

    describe('#constructor()', () => {

      it('should accept one argument', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        expect(dragData instanceof DragData).to.be(true);
      });

    });

    describe('#dropAction', () => {

      it('should be gettable and default to \'none\'', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        expect(dragData.dropAction).to.equal('none');
      });

      it('should be settable to \'copy\'', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        dragData.dropAction = 'copy';
        expect(dragData.dropAction).to.equal('copy');
      });

      it('should be settable to \'link\'', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        dragData.dropAction = 'link';
        expect(dragData.dropAction).to.equal('link');
      });

      it('should be settable to \'move\'', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        dragData.dropAction = 'move';
        expect(dragData.dropAction).to.equal('move');
      });

      it('should be settable to \'none\'', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        dragData.dropAction = 'move';
        expect(dragData.dropAction).to.equal('move');
        dragData.dropAction = 'none';
        expect(dragData.dropAction).to.equal('none');
      });

      it('should be settable to nothing else', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        dragData.dropAction = 'move';
        expect(dragData.dropAction).to.equal('move');
        dragData.dropAction = 'foo';
        expect(dragData.dropAction).to.equal('move');
      });

      it('should be settable multiple times without side-effects', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        dragData.dropAction = 'move';
        dragData.dropAction = 'move';
        expect(dragData.dropAction).to.equal('move');
      });

    });

    describe('#getData()', () => {

      it('should return the data for a mime type', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        let mime = 'application/x-phosphor-test';
        let data = 'arbitrary test data';
        dragData.setData(mime, data);
        expect(dragData.getData(mime)).to.equal(data);
      });

    });

    describe('#setData()', () => {

      it('should set the data for a mime type', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        let mime = 'application/x-phosphor-test';
        let data = 'arbitrary test data';
        dragData.setData(mime, data);
        expect(dragData.getData(mime)).to.equal(data);
      });

    });

    describe('#clearData()', () => {

      it('should delete the data for a mime type', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        let mime = 'application/x-phosphor-test';
        let data = 'arbitrary test data';
        dragData.setData(mime, data);
        expect(dragData.getData(mime)).to.equal(data);
        dragData.clearData(mime);
        expect(dragData.getData(mime)).to.equal(void 0);
      });

    });

    describe('#types()', () => {

      it('should return the list of mime types set', () => {
        let node = document.createElement('div') as HTMLElement;
        let dragData = new DragData(node);
        let mimeOne = 'application/x-phosphor-test';
        let dataOne = 'arbitrary test data';
        let mimeTwo = 'application/x-phosphor-test-two';
        let dataTwo = 'more arbitrary test data';
        expect(dragData.types()).to.have.length(0);
        dragData.setData(mimeOne, dataOne);
        expect(dragData.types()).to.have.length(1);
        expect(dragData.types()).to.contain(mimeOne);
        dragData.setData(mimeTwo, dataTwo);
        expect(dragData.types()).to.have.length(2);
        expect(dragData.types()).to.contain(mimeOne);
        expect(dragData.types()).to.contain(mimeTwo);
      });

    });

  });

});
