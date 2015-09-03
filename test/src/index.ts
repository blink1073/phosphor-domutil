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
  overrideCursor, hitTest, boxSizing, sizeLimits
} from "../../lib/index";


describe('phosphor-domutil', () => {

  /**
   * overrideCursor section
   */
  describe('overrideCursor', () => {

    it('should change to wait', () => {
      var delegate = overrideCursor('wait');
      expect(document.body.style.cursor).to.be('wait');
    });

    it('should revert when delegate is disposed', () => {
      var delegate = overrideCursor('wait');
      expect(document.body.style.cursor).to.be('wait');

      delegate.dispose();
      expect(document.body.style.cursor).to.be('');
    })
  });

  /**
   * hitTest section
   */
  describe('hitTest', () => {

    it('should return true when inside, false when outside', () => {
      var obj = document.createElement('img');
      obj.style.position = 'absolute';
      obj.style.left = '0';
      obj.style.top = '0';
      obj.width = 100;
      obj.height = 100;
      document.body.appendChild(obj);

      var inside = hitTest(obj, 50, 50);
      expect(inside).to.be(true);

      var outside = hitTest(obj, 150, 150);
      expect(outside).to.be(false);
    });

    it('should use closed intervals for left and top only', () => {
      var obj = document.createElement('img');
      obj.style.position = 'absolute';
      obj.style.left = '0';
      obj.style.top = '0';
      obj.width = 100;
      obj.height = 100;
      document.body.appendChild(obj);

      var top_left_corner = hitTest(obj, 0, 0);
      expect(top_left_corner).to.be(true);

      var top_right_corner = hitTest(obj, 100, 0);
      expect(top_right_corner).to.be(false);

      var inside_top_right = hitTest(obj, 99, 0);
      expect(inside_top_right).to.be(true);

      var bottom_left_corner = hitTest(obj, 0, 100);
      expect(bottom_left_corner).to.be(false);

      var inside_bottom_left = hitTest(obj, 0, 99);
      expect(inside_bottom_left).to.be(true);

      var bottom_right_corner = hitTest(obj, 100, 100);
      expect(bottom_right_corner).to.be(false);

      var inside_bottom_right = hitTest(obj, 99, 99);
      expect(inside_bottom_right).to.be(true);
    });

  });

  /**
   * boxSizing section
   */
  describe('boxSizing', () => {

    it('should return a box sizing with correct parameters', () => {
      var obj = document.createElement('img');
      obj.style.position = 'absolute';
      obj.style.left = '0';
      obj.style.top = '0';
      obj.style.borderTop = "solid 10px black";
      obj.style.borderLeft = "solid 10px black";
      obj.style.paddingRight = '15px';
      obj.style.paddingBottom = '15px';
      obj.width = 100;
      obj.height = 100;
      document.body.appendChild(obj);

      var sizing = boxSizing(obj);

      expect(sizing.borderTop).to.be(10);
      expect(sizing.borderLeft).to.be(10);
      expect(sizing.borderRight).to.be(0);
      expect(sizing.borderBottom).to.be(0);

      expect(sizing.paddingTop).to.be(0);
      expect(sizing.paddingLeft).to.be(0);
      expect(sizing.paddingRight).to.be(15);
      expect(sizing.paddingBottom).to.be(15);
    });

  });

  /**
   * sizeLimits section
   */
  describe('sizeLimits', () => {

    it('should return a size limits object with correct parameters', () => {
      var obj = document.createElement('img');
      obj.style.position = 'absolute';
      obj.style.minWidth = '90px';
      obj.style.minHeight = '90px';
      obj.style.maxWidth = '120px';
      obj.style.maxHeight = '120px';
      obj.height = 100;
      obj.width = 100;
      document.body.appendChild(obj);

      var limits = sizeLimits(obj);

      expect(limits.minWidth).to.be(90);
      expect(limits.minHeight).to.be(90);
      expect(limits.maxWidth).to.be(120);
      expect(limits.maxHeight).to.be(120);
    });

  });

});
