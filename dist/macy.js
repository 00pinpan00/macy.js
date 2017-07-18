/* Macy.js - v2.0.0 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Macy = factory());
}(this, (function () { 'use strict';

var methods = Object.getOwnPropertyNames(Array.prototype);

methods.forEach(function (methodName) {
  if (methodName !== 'length') {
    NodeList.prototype[methodName] = Array.prototype[methodName];
    HTMLCollection.prototype[methodName] = Array.prototype[methodName];
  }
});

/**
 * Element Factory
 * @param  {String} parameter       - Element Selector
 * @param  {HTMLElement} context    - The parent to find the selector in
 * @return {HTMLElement/HTMLCollection}
 */
var $e = function $e(parameter, context) {
  if (!(this instanceof $e)) {
    return new $e(parameter, context);
  }

  // Allow for spaces before or after
  parameter = parameter.replace(/^\s*/, '').replace(/\s*$/, '');

  if (context) {
    return this.byCss(parameter, context);
  }

  for (var key in this.selectors) {
    // Reusing it to save space
    context = key.split('/');
    if (new RegExp(context[1], context[2]).test(parameter)) {
      return this.selectors[key](parameter);
    }
  }

  return this.byCss(parameter);
};

/**
 * Get an element by using querySelectorAll
 * @param  {String} parameter       - Element Selector
 * @param  {HTMLElement} context    - The parent to find the selector in
 * @return {NodeList}
 */
$e.prototype.byCss = function (parameter, context) {
  return (context || document).querySelectorAll(parameter);
};

$e.prototype.selectors = {};

/**
 * Get an element by using getElementsByClassName
 * @param  {String} param   - Element Selector
 * @return {HTMLCollection}
 */
$e.prototype.selectors[/^\.[\w\-]+$/] = function (param) {
  return document.getElementsByClassName(param.substring(1));
};

/**
 * Get an element by using getElementsByTagName
 * @param  {String} param   - Element Selector
 * @return {HTMLCollection}       [description]
 */
$e.prototype.selectors[/^\w+$/] = function (param) {
  return document.getElementsByTagName(param);
};

/**
 * Get an element by using getElementsByTagName
 * @param  {String} param   - Element Selector
 * @return {HTMLElement}
 */
$e.prototype.selectors[/^\#[\w\-]+$/] = function (param) {
  return document.getElementById(param.substring(1));
};

var isObject = function isObject(obj) {
  return obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]';
};

/**
 * Return the current spacing options based on document size.
 * @param  {Object} options - Macy instance's options
 * @return {Object}         - Object containing the current spacing options
 */
function getResponsiveOptions(options) {
  var docWidth = document.body.clientWidth;
  var responsiveOptions = {
    columns: options.columns
  };

  var tempOpts = void 0;

  if (!isObject(options.margin)) {
    responsiveOptions.margin = {
      x: options.margin,
      y: options.margin
    };
  } else {
    responsiveOptions.margin = {
      x: options.margin.x,
      y: options.margin.y
    };
  }

  var keys = Object.keys(options.breakAt);

  for (var i = keys.length - 1; i >= 0; i--) {
    var widths = parseInt(keys[i], 10);

    if (docWidth <= widths) {
      tempOpts = options.breakAt[widths];

      if (!isObject(tempOpts)) {
        responsiveOptions.columns = tempOpts;
      }

      if (isObject(tempOpts) && tempOpts.columns) {
        responsiveOptions.columns = tempOpts.columns;
      }

      if (isObject(tempOpts) && tempOpts.margin && !isObject(tempOpts.margin)) {
        responsiveOptions.margin = {
          x: tempOpts.margin,
          y: tempOpts.margin
        };
      }

      if (isObject(tempOpts) && tempOpts.margin && isObject(tempOpts.margin) && tempOpts.margin.x) {
        responsiveOptions.margin.x = tempOpts.margin.x;
      }

      if (isObject(tempOpts) && tempOpts.margin && isObject(tempOpts.margin) && tempOpts.margin.y) {
        responsiveOptions.margin.y = tempOpts.margin.y;
      }
    }
  }

  return responsiveOptions;
}

/**
 * Return the current number of columns macy should be
 * @param  {Object} options - Macy instance's options
 * @return {Integer}        - Number of columns
 */
function getCurrentColumns(options) {
  var noOfColumns = getResponsiveOptions(options).columns;
  return noOfColumns;
}

/**
 * Return the current margin dimensions macy should use
 * @param  {Object} options - Macy instance's options
 * @return {Object}         - Object containing x & y margins
 */
function getCurrentMargin(options) {
  var margin = getResponsiveOptions(options).margin;
  return margin;
}

/**
 * Get the width of each column based on the number of columns
 * @param  {Object} options           - Macy instance's options
 * @param  {Boolean} marginsIncluded  - Include margins into the calculations
 * @return {String}                   - The correct number css style for column width
 */
function getWidths(options) {
  var marginsIncluded = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  var noOfColumns = getCurrentColumns(options);
  var margins = getCurrentMargin(options).x;
  var width = 100 / noOfColumns;

  if (!marginsIncluded) {
    return width;
  }

  if (noOfColumns === 1) {
    return '100%';
  }

  margins = (noOfColumns - 1) * margins / noOfColumns;
  return 'calc(' + width + '% - ' + margins + 'px)';
}

/**
 * Get the left position based on which column and column width
 * @param  {Macy}    ctx  - Macy instance
 * @param  {Integer} col  - Current Number of Columns
 * @return {String}       - The correct number css style for column position
 */
function getLeftPosition(ctx, col) {
  var noOfColumns = getCurrentColumns(ctx.options);
  var totalLeft = 0;
  var margin = void 0,
      str = void 0,
      baseMargin = void 0;

  col++;

  if (col === 1) {
    return 0;
  }

  baseMargin = getCurrentMargin(ctx.options).x;

  margin = (baseMargin - (noOfColumns - 1) * baseMargin / noOfColumns) * (col - 1);
  totalLeft += getWidths(ctx.options, false) * (col - 1);
  str = 'calc(' + totalLeft + '% + ' + margin + 'px)';

  return str;
}

/**
 * Sets the containers height based on the last item in the container
 * @param {Macy} ctx  - Macy instance
 */
function setContainerHeight(ctx) {
  var largest = 0;
  var container = ctx.container,
      rows = ctx.rows;


  for (var i = rows.length - 1; i >= 0; i--) {
    largest = rows[i] > largest ? rows[i] : largest;
  }

  container.style.height = largest + 'px';
}

/**
 * Get Element computed style
 * @param  {HTMLElement} element  - Element
 * @param  {String}      property - Property to fetch
 * @return {String}               - Desired Element Property
 */
var prop = (function (element, property) {
  return window.getComputedStyle(element, null).getPropertyValue(property);
});

var setUpRows = function setUpRows(ctx, cols) {
  var refresh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


  if (!ctx.lastcol) {
    ctx.lastcol = 0;
  }

  // Reset rows
  if (refresh) {
    ctx.rows = [];
    ctx.cols = [];
    ctx.lastcol = 0;

    for (var i = cols - 1; i >= 0; i--) {
      ctx.rows[i] = 0;
      ctx.cols[i] = getLeftPosition(ctx, i);
    }
  }

  if (ctx.tmpRows) {
    ctx.rows = [];

    for (var i = cols - 1; i >= 0; i--) {
      ctx.rows[i] = ctx.tmpRows[i];
    }
    return;
  }

  ctx.tmpRows = [];
  for (var i = cols - 1; i >= 0; i--) {
    ctx.tmpRows[i] = ctx.rows[i];
  }
};

/**
 * A Sorting method when trueOrder = false
 * @param  {Macy}      ctx              - Macy Instance
 * @param  {NodeList}  $eles            - Element List to sort
 * @param  {Boolean}   refresh          - Show all columns and rows be refreshed and recalculated
 * @param  {Boolean}   markasComplete   - Mark elements as complete
 */
function shuffle(ctx, $eles) {
  var refresh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var markasComplete = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  var cols = getCurrentColumns(ctx.options);
  var margin = getCurrentMargin(ctx.options).y;
  setUpRows(ctx, cols, refresh);

  $eles.forEach(function (ele) {
    var smallest = 0;
    var eleHeight = parseInt(ele.offsetHeight, 10);

    if (isNaN(eleHeight)) return;

    ctx.rows.forEach(function (v, k) {
      if (v < ctx.rows[smallest]) {
        smallest = k;
      }
    });

    ele.style.position = 'absolute';
    ele.style.top = ctx.rows[smallest] + 'px';
    ele.style.left = '' + ctx.cols[smallest];
    ctx.rows[smallest] += !isNaN(eleHeight) ? eleHeight + margin : 0;

    if (markasComplete) {
      ele.dataset.macyComplete = 1;
    }
  });

  if (markasComplete) {
    ctx.tmpRows = null;
  }

  setContainerHeight(ctx);
}

/**
 * A Sorting method when trueOrder = true
 * @param  {Macy}      ctx              - Macy Instance
 * @param  {NodeList}  $eles            - Element List to sort
 * @param  {Boolean}   refresh          - Show all columns and rows be refreshed and recalculated
 * @param  {Boolean}   markasComplete   - Mark elements as complete
 */
function sort(ctx, $eles) {
  var refresh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var markasComplete = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  var cols = getCurrentColumns(ctx.options);
  var margin = getCurrentMargin(ctx.options).y;
  setUpRows(ctx, cols, refresh);

  $eles.forEach(function (ele) {

    if (ctx.lastcol === cols) {
      ctx.lastcol = 0;
    }

    var eleHeight = prop(ele, 'height');
    eleHeight = parseInt(eleHeight.replace('px', ''), 10);

    if (isNaN(eleHeight)) return;
    ele.style.position = 'absolute';
    ele.style.top = ctx.rows[ctx.lastcol] + 'px';
    ele.style.left = '' + ctx.cols[ctx.lastcol];
    ctx.rows[ctx.lastcol] += !isNaN(eleHeight) ? eleHeight + margin : 0;
    ctx.lastcol += 1;

    if (markasComplete) {
      ele.dataset.macyComplete = 1;
    }
  });

  if (markasComplete) {
    ctx.tmpRows = null;
  }

  setContainerHeight(ctx);
}

var calculate = function calculate(ctx) {
  var refresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var loaded = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var children = refresh ? ctx.container.children : $e(':scope > *:not([data-macy-complete="1"])', ctx.container);
  var eleWidth = getWidths(ctx.options);

  children.forEach(function (child) {
    if (refresh) {
      child.dataset.macyComplete = 0;
    }
    child.style.width = eleWidth;
  });

  if (ctx.options.trueOrder) {
    return sort(ctx, children, refresh, loaded);
  }

  return shuffle(ctx, children, refresh, loaded);
};

/**
 * A hacky way to make a function asynchronous
 * @param  {Function} fn  - The Function to be ran asynchronously
 * @param  {Function} cb  - A optional function that runs after fn
 */
var async = function async(fn, cb) {
  setTimeout(function () {
    var x = fn();
    if (cb) {
      cb(x);
    }
  }, 0);
};

var imagesComplete = function imagesComplete(during, after, data) {
  if (during) {
    async(during);
  }

  if (data.req === data.complete) {
    async(after);
  }
};

/**
 * Checks through all images and runs the function on complete images
 * @param  {NodeList} imgs   - Image Elements
 * @param  {Function} during - Function to on each image load
 * @param  {Function} after  - Function to run once all images loaded
 */
var imagesLoaded = function imagesLoaded(imgs, during, after) {
  var imgLen = imgs.length;
  var imgComplete = 0;

  imgs.forEach(function (img) {
    if (img.complete) {
      imgComplete++;
      imagesComplete(during, after, {
        req: imgLen,
        complete: imgComplete
      });
    }

    img.addEventListener('load', function () {
      imgComplete++;
      imagesComplete(during, after, {
        req: imgLen,
        complete: imgComplete
      });
    });
  });
};

/**
 * Waits until wait stops being called before calling desired function
 * @param  {Function} func  - Function to run after the Wait stops being called
 * @param  {Integer}  delta - Time to wait after wait call to run the function
 * @return {Function}       - function that runs the desired function after it has stopped being called
 */
function wait(func, delta) {
  var to = void 0;

  return function () {
    if (to) {
      clearTimeout(to);
    }

    to = setTimeout(func, delta);
  };
}

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var defaults = {
  columns: 4,
  margin: 2,
  trueOrder: true,
  waitForImages: false
};

/**
 * Masonary Factory
 * @param {Object} opts - The configuration object for macy.
 */
var Macy = function Macy() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaults;

  /**
   * Create instance of macy if not instatiated with new Macy
   */
  if (!(this instanceof Macy)) {
    return new Macy(opts);
  }
  this.options = {};
  _extends(this.options, defaults, opts);
  // this.options = opts;
  this.container = $e(opts.container);

  // Checks if container element exists
  if (this.container instanceof $e || !this.container) {
    return opts.debug ? console.error('Error: Container not found') : false;
  }

  // Remove container selector from the options
  delete this.options.container;

  if (this.container.length) {
    this.container = this.container[0];
  }

  this.container.style.position = 'relative';
  this.rows = [];

  var loadingEvent = this.recalculate.bind(this, false, false);
  var finishedLoading = this.recalculate.bind(this, true, true);

  var imgs = $e('img', this.container);

  this.resizer = wait(function () {
    finishedLoading();
  }, 100);

  window.addEventListener('resize', this.resizer);

  if (opts.waitForImages) {
    return imagesLoaded(imgs, null, finishedLoading);
  }

  this.recalculate(true, false);
  imagesLoaded(imgs, loadingEvent, finishedLoading);
};

Macy.init = function (options) {
  console.warn('Depreciated: Macy.init will be removed in v3.0.0 opt to use Macy directly like so Macy({ /*options here*/ }) ');
  return new Macy(options);
};

/**
 * Public method for recalculating image positions when the images have loaded.
 * @param  {Boolean} waitUntilFinish - if true it will not recalculate until all images are finished loading
 * @param  {Boolean} refresh         - If true it will recalculate the entire container instead of just new elements.
 */
Macy.prototype.recalculateOnImageLoad = function () {
  var waitUntilFinish = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var refresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var imgs = $e('img', this.container);
  var loadingEvent = this.recalculate.bind(this, refresh, false);
  var finalEvent = this.recalculate.bind(this, refresh, true);

  if (waitUntilFinish) {
    return imagesLoaded(imgs, null, finalEvent);
  }

  loadingEvent();
  return imagesLoaded(imgs, loadingEvent, finalEvent);
};

/**
 * Run a function on every image load or once all images are loaded
 * @param  {Function}  func      - Function to run on image load
 * @param  {Boolean} everyLoad   - If true it will run everytime an image loads
 */
Macy.prototype.runOnImageLoad = function (func) {
  var everyLoad = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var imgs = $e('img', this.container);

  if (everyLoad) {
    return imagesLoaded(imgs, func, func);
  }

  return imagesLoaded(imgs, null, func);
};

/**
 * Recalculates masonory positions
 * @param  {Boolean} refresh - Recalculates All elements within the container
 * @param  {Boolean} loaded  - When true it sets the recalculated elements to be marked as complete
 */
Macy.prototype.recalculate = function () {
  var refresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var loaded = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  return calculate(this, refresh, loaded);
};

/**
 * Destroys macy instance
 */
Macy.prototype.remove = function () {
  window.removeEventListener('resize', this.resizer);

  this.container.children.forEach(function (child) {
    child.removeAttribute('data-macy-complete');
    child.removeAttribute('style');
  });

  this.container.removeAttribute('style');
};

/**
 * ReInitializes the macy instance using the already defined options
 */
Macy.prototype.reInit = function () {
  this.recalculate(true, true);
  window.addEventListener('resize', this.resizer);
};

/**
 * Export Macy
 */
// module.exports = Macy;

return Macy;

})));
