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
  boxSizing, hitTest, overrideCursor, sizeLimits,
  DragHandler, DropHandler, IDragDropData
} from '../../lib/index';

import './index.css';


function triggerMouseEvent(node: HTMLElement, eventType: string, options: any = {}): MouseEvent {
  options.bubbles = true;
  let clickEvent = new MouseEvent(eventType, options);
  node.dispatchEvent(clickEvent);
  return clickEvent;
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

  describe('DragHandler', () => {

    describe('#constructor()', () => {

      it('should accept two arguments', () => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);
        handler.dispose();
        expect(handler instanceof DragHandler).to.be(true);
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

    describe('#ghost()', () => {

      it('should create a node with same dimensions as the original', () => {
        let nodeHeight = 99;
        let nodeWidth = 89;
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);
        node.style.height = `${nodeHeight}px`;
        node.style.width = `${nodeWidth}px`;
        let ghost = handler.ghost();
        let ghostHeight = ghost.getBoundingClientRect().height;
        let ghostWidth = ghost.getBoundingClientRect().width;
        expect(nodeHeight).to.equal(nodeHeight);
        expect(nodeWidth).to.equal(nodeWidth);
        handler.dispose();
      });

    });

    describe('#onDragStart', () => {

      it('should be invoked when a drag has exceeded the threshold', (done) => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);
        node.style.height = '100px';
        node.style.width = '100px';
        document.body.appendChild(node);
        let { top, right } = node.getBoundingClientRect();
        handler.onDragStart = (event: MouseEvent, dragData: IDragDropData) => {
          expect(event.clientX).to.equal(right + handler.dragThreshold);
          expect(dragData.startY).to.equal(top);
          done();
        };
        // Ignore anything but a primary click.
        triggerMouseEvent(node, 'mousedown', {
          button: 1,
          clientX: right,
          clientY: top
        });
        triggerMouseEvent(node, 'mousedown', {
          clientX: right,
          clientY: top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: right + 1,
          clientY: top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: right + handler.dragThreshold,
          clientY: top
        });
        triggerMouseEvent(document.body, 'mouseup');
        handler.dispose();
      });

    });

    describe('#onDragEnd', () => {

      it('should be invoked when a drag ends', (done) => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);
        node.style.height = '100px';
        node.style.width = '100px';
        document.body.appendChild(node);
        let { top, right } = node.getBoundingClientRect();
        handler.onDragEnd = (event: MouseEvent, dragData: IDragDropData) => {
          expect(dragData.startX).to.equal(right);
          expect(dragData.startY).to.equal(top);
          done();
        };
        triggerMouseEvent(node, 'mousedown', {
          clientX: right,
          clientY: top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: right + handler.dragThreshold,
          clientY: top
        });
        triggerMouseEvent(document.body, 'mouseup');
        handler.dispose();
      });

    });

    describe('#startDrag', () => {

      it('should trigger a drag when autostart is false', (done) => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);
        handler.autostart = false;
        node.style.height = '100px';
        node.style.width = '100px';
        document.body.appendChild(node);
        let { top, right } = node.getBoundingClientRect();
        let belowThreshold = right + handler.dragThreshold - 1;
        handler.onDragStart = (event: MouseEvent, dragData: IDragDropData) => {
          expect(event.clientX).to.equal(belowThreshold);
          done();
        };
        triggerMouseEvent(node, 'mousedown', {
          clientX: right,
          clientY: top
        });
        let event = triggerMouseEvent(document.body, 'mousemove', {
          clientX: belowThreshold,
          clientY: top
        });
        handler.startDrag(event);
        triggerMouseEvent(document.body, 'mouseup');
        handler.dispose();
      });

      it('should trigger a drag without needing a mousedown', (done) => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);
        handler.autostart = false;
        node.style.height = '100px';
        node.style.width = '100px';
        document.body.appendChild(node);
        let { top, right } = node.getBoundingClientRect();
        handler.onDragStart = (event: MouseEvent, dragData: IDragDropData) => {
          expect(event.clientX).to.equal(right);
          done();
        };
        // Ignore mousemove events before startDrag if autostart is false.
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: right,
          clientY: top
        });
        let event = triggerMouseEvent(document.body, 'mousemove', {
          clientX: right,
          clientY: top
        });
        handler.startDrag(event);
        triggerMouseEvent(document.body, 'mouseup');
        handler.dispose();
      });

      it('should be safely invokable multiple times', (done) => {
        let node = document.createElement('div');
        let handler = new DragHandler(node, null);
        handler.autostart = true;
        node.style.height = '100px';
        node.style.width = '100px';
        document.body.appendChild(node);
        let { top, right } = node.getBoundingClientRect();
        handler.onDragStart = (event: MouseEvent, dragData: IDragDropData) => {
          expect(event.clientX).to.equal(right);
          done();
        };
        let event = triggerMouseEvent(document.body, 'mousemove', {
          clientX: right,
          clientY: top
        });
        handler.startDrag(event);
        handler.startDrag(event);
        handler.startDrag(event);
        handler.startDrag(event);
        triggerMouseEvent(document.body, 'mouseup');
        handler.dispose();
      });

    });

  });


  describe('DropHandler', () => {

    describe('#constructor()', () => {

      it('should accept two arguments', () => {
        let node = document.createElement('div');
        let handler = new DropHandler(node, null);
        handler.dispose();
        expect(handler instanceof DropHandler).to.be(true);
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

      it('should be invoked when a drag enters a drop target', (done) => {
        let draggable = document.createElement('div');
        let droppable = document.createElement('div');
        let drag = new DragHandler(draggable, null);
        let drop = new DropHandler(droppable, null);
        draggable.style.height = '100px';
        draggable.style.width = '100px';
        droppable.style.height = '100px';
        droppable.style.width = '100px';
        document.body.appendChild(draggable);
        document.body.appendChild(droppable);
        let dragRect = draggable.getBoundingClientRect();
        let dropRect = droppable.getBoundingClientRect();
        drop.onDragEnter = (event: MouseEvent, dragData: IDragDropData) => {
          expect(dragData.startX).to.equal(dragRect.right);
          expect(dragData.startY).to.equal(dragRect.top);
          done();
        };
        triggerMouseEvent(draggable, 'mousedown', {
          clientX: dragRect.right,
          clientY: dragRect.top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dragRect.right + drag.dragThreshold,
          clientY: dragRect.top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });
        triggerMouseEvent(document.body, 'mouseup');
        drag.dispose();
        drop.dispose();
      });

    });

    describe('#onDrag', () => {

      it('should be invoked when a drag happens over a drop target', (done) => {
        let draggable = document.createElement('div');
        let droppable = document.createElement('div');
        let drag = new DragHandler(draggable, null);
        let drop = new DropHandler(droppable, null);
        draggable.style.height = '100px';
        draggable.style.width = '100px';
        droppable.style.height = '100px';
        droppable.style.width = '100px';
        document.body.appendChild(draggable);
        document.body.appendChild(droppable);
        let dragRect = draggable.getBoundingClientRect();
        let dropRect = droppable.getBoundingClientRect();
        drop.onDrag = (event: MouseEvent, dragData: IDragDropData) => {
          expect(dragData.startX).to.equal(dragRect.right);
          expect(dragData.startY).to.equal(dragRect.top);
          done();
        };
        triggerMouseEvent(draggable, 'mousedown', {
          clientX: dragRect.right,
          clientY: dragRect.top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dragRect.right + drag.dragThreshold,
          clientY: dragRect.top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });
        triggerMouseEvent(document.body, 'mouseup');
        drag.dispose();
        drop.dispose();
      });

    });

    describe('#onDragLeave', () => {

      it('should be invoked when a drag leaves a drop target', (done) => {
        let draggable = document.createElement('div');
        let droppable = document.createElement('div');
        let drag = new DragHandler(draggable, null);
        let drop = new DropHandler(droppable, null);
        draggable.style.height = '100px';
        draggable.style.width = '100px';
        droppable.style.height = '100px';
        droppable.style.width = '100px';
        document.body.appendChild(draggable);
        document.body.appendChild(droppable);
        let dragRect = draggable.getBoundingClientRect();
        let dropRect = droppable.getBoundingClientRect();
        drop.onDragLeave = (event: MouseEvent, dragData: IDragDropData) => {
          expect(dragData.startX).to.equal(dragRect.right);
          expect(dragData.startY).to.equal(dragRect.top);
          done();
        };
        triggerMouseEvent(draggable, 'mousedown', {
          clientX: dragRect.right,
          clientY: dragRect.top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dragRect.right + drag.dragThreshold,
          clientY: dragRect.top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dropRect.left,
          clientY: dropRect.bottom + 1
        });
        triggerMouseEvent(document.body, 'mouseup');
        drag.dispose();
        drop.dispose();
      });

    });

    describe('#onDrop', () => {

      it('should be invoked when an item is dropped', (done) => {
        let draggable = document.createElement('div');
        let droppable = document.createElement('div');
        let drag = new DragHandler(draggable, null);
        let drop = new DropHandler(droppable, null);
        draggable.style.height = '100px';
        draggable.style.width = '100px';
        droppable.style.height = '100px';
        droppable.style.width = '100px';
        document.body.appendChild(draggable);
        document.body.appendChild(droppable);
        let dragRect = draggable.getBoundingClientRect();
        let dropRect = droppable.getBoundingClientRect();
        drop.onDrop = (event: MouseEvent, dragData: IDragDropData) => {
          expect(dragData.startX).to.equal(dragRect.right);
          expect(dragData.startY).to.equal(dragRect.top);
          done();
        };
        triggerMouseEvent(draggable, 'mousedown', {
          clientX: dragRect.right,
          clientY: dragRect.top
        });
        triggerMouseEvent(document.body, 'mousemove', {
          clientX: dragRect.right + drag.dragThreshold,
          clientY: dragRect.top
        });
        triggerMouseEvent(document.body, 'mouseup', {
          clientX: dropRect.left,
          clientY: dropRect.top
        });
        drag.dispose();
        drop.dispose();
      });

    });

  });

});
