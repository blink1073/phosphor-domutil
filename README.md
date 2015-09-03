phosphor-domutil
================

[![Build Status](https://travis-ci.org/phosphorjs/phosphor-domutil.svg)](https://travis-ci.org/phosphorjs/phosphor-domutil?branch=master)
[![Coverage Status](https://coveralls.io/repos/phosphorjs/phosphor-domutil/badge.svg?branch=master&service=github)](https://coveralls.io/github/phosphorjs/phosphor-domutil?branch=master)

Utilities for working with the DOM.

[API Docs](http://phosphorjs.github.io/phosphor-domutil/api/)


Package Install
---------------

**Prerequisites**
- [node](http://nodejs.org/)

```bash
npm install --save phosphor-domutil
```


Source Build
------------

**Prerequisites**
- [git](http://git-scm.com/)
- [node](http://nodejs.org/)

```bash
git clone https://github.com/phosphorjs/phosphor-domutil.git
cd phosphor-domutil
npm install
```

**Rebuild**
```bash
npm run clean
npm run build
```


Run Tests
---------

Follow the source build instructions first.

```bash
# run tests in Firefox
npm test

# run tests in Chrome
npm run test:chrome

# run tests in IE
npm run test:ie
```


Build Docs
----------

Follow the source build instructions first.

```bash
npm run docs
```

Navigate to `docs/index.html`.


Supported Runtimes
------------------

The runtime versions which are currently *known to work* are listed below.
Earlier versions may also work, but come with no guarantees.

- IE 11+
- Firefox 32+
- Chrome 38+


Usage Examples
--------------

**Note:** This module is fully compatible with Node/Babel/ES6/ES5. Simply
omit the type declarations when using a language other than TypeScript.

**overrideCursor**

```typescript
import {
  overrideCursor
} from 'phosphor-domutil';

// overrideCursor returns a `disposable`
var cursorDisposable = overrideCursor('wait');

// when you want to stop overriding the cursor, just dispose of it.
cursorDisposable.dispose();
```

**hitTest**

```typescript
import {
  hitTest
} from 'phosphor-domutil';

// Set up a dummy test object, 100x100 at (0,0)
var obj = document.createElement('img');
obj.style.position = 'absolute';
obj.style.left = '0px';
obj.style.top = '0px';
obj.width = 100;
obj.height = 100;
document.body.appendChild(obj);

hitTest(obj, 50, 50); // true
hitTest(obj, 150, 150); // false
```

**boxSizing**

```typescript
import {
  boxSizing
} from 'phosphor-domutil';

// Set up a dummy object
var obj = document.createElement('img');
obj.style.position = 'absolute';
obj.style.borderTop = "solid 10px black";
document.body.appendChild(obj);

var sizing = boxSizing(obj);
console.log(sizing.borderTop); // 10
```

**sizeLimits**

```typescript
import {
  sizeLimits
} from 'phosphor-domutil';

// Set up dummy object
var obj = document.createElement('img');
obj.style.position = 'absolute';
obj.style.minWidth = '90px';
document.body.appendChild(obj);

var limits = sizeLimits(obj);
console.log(limits.minWidth); // 90
```
