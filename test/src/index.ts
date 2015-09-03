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
  OVERRIDE_CURSOR_CLASS, boxSizing, hitTest, overrideCursor, sizeLimits
} from '../../lib/index';

import './index.css';


describe('phosphor-domutil', () => {

  describe('OVERRIDE_CURSOR_CLASS', () => {

    it('should equal `p-mod-override-cursor`', () => {
      expect(OVERRIDE_CURSOR_CLASS).to.be('p-mod-override-cursor');
    });

  });

  describe('overrideCursor()', () => {

    it('should update the body `cursor` style', () => {
      expect(document.body.style.cursor).to.be('');
      var override = overrideCursor('wait');
      expect(document.body.style.cursor).to.be('wait');
      override.dispose();
    });

    it('should add the `p-mod-override-cursor` class to the body', () => {
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(false);
      var override = overrideCursor('wait');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      override.dispose();
    });

    it('should clear the override when disposed', () => {
      expect(document.body.style.cursor).to.be('');
      var override = overrideCursor('wait');
      expect(document.body.style.cursor).to.be('wait');
      override.dispose();
      expect(document.body.style.cursor).to.be('');
    });

    it('should remove the `p-mod-override-cursor` class when disposed', () => {
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(false);
      var override = overrideCursor('wait');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      override.dispose();
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(false);
    });

    it('should respect the most recent override', () => {
      expect(document.body.style.cursor).to.be('');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(false);
      var one = overrideCursor('wait');
      expect(document.body.style.cursor).to.be('wait');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      var two = overrideCursor('default');
      expect(document.body.style.cursor).to.be('default');
      expect(document.body.classList.contains('p-mod-override-cursor')).to.be(true);
      var three = overrideCursor('cell')
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
      var div = document.createElement('div');
      div.className = 'cell-cursor';
      document.body.appendChild(div);
      expect(window.getComputedStyle(div).cursor).to.be('cell');
      var override = overrideCursor('wait');
      expect(window.getComputedStyle(div).cursor).to.be('wait');
      override.dispose();
      expect(window.getComputedStyle(div).cursor).to.be('cell');
      document.body.removeChild(div);
    });

  });

  describe('hitTest()', () => {

    it('should return `true` when point is inside the node', () => {
      var div = document.createElement('div');
      div.className = 'hit-test';
      document.body.appendChild(div);
      expect(hitTest(div, 50, 50)).to.be(true);
      document.body.removeChild(div);
    });

    it('should return `false` when point is outside the node', () => {
      var div = document.createElement('div');
      div.className = 'hit-test';
      document.body.appendChild(div);
      expect(hitTest(div, 150, 150)).to.be(false);
      document.body.removeChild(div);
    });

    it('should use closed intervals for left and top only', () => {
      var div = document.createElement('div');
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
      var div = document.createElement('div');
      div.className = 'box-sizing';
      document.body.appendChild(div);
      var sizing = boxSizing(div);
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
      var div = document.createElement('div');
      div.className = 'size-limits';
      document.body.appendChild(div);
      var limits = sizeLimits(div);
      expect(limits.minWidth).to.be(90);
      expect(limits.minHeight).to.be(95);
      expect(limits.maxWidth).to.be(100);
      expect(limits.maxHeight).to.be(105);
      document.body.removeChild(div);
    });

  });

});
