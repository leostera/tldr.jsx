(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @param {Boolean} jumped
   * @api public
   */

  function require(name, jumped){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];

    fn.call(m.exports, function(req){
      var dep = modules[id][1][req];
      return require(dep ? dep : req);
    }, m, m.exports, outer, modules, cache, entries);

    // expose as `name`.
    if (name) cache[name] = cache[id];

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
"use strict";

var Vue = require("yyx990803/vue");
var request = require("visionmedia/superagent");
var marked = require("chjj/marked");
var Batch = require("visionmedia/batch");

var base_url = "https://api.github.com/repos/tldr-pages/tldr/contents/pages";

var tldr = new Vue({
    el: "#tldr",

    data: {
        query: "",
        pages: null,
        loading: false,
        notFound: false
    },

    filters: {
        marked: (function (_marked) {
            var _markedWrapper = function marked() {
                return _marked.apply(this, arguments);
            };

            _markedWrapper.toString = function () {
                return _marked.toString();
            };

            return _markedWrapper;
        })(function (page) {
            return page && marked(page);
        })
    },

    methods: {
        getRawPage: function getRawPage(query) {
            var batch = new Batch();
            ["osx", "linux", "windows", "common"].forEach(function (os) {
                var url = [base_url, os, query + ".md"].join("/");
                batch.push(function (done) {
                    request.get(url).end(function (res) {
                        if (res.status == 200) {
                            done({ os: os, page: atob(res.body.content) });
                        } else {
                            done(null);
                        }
                    });
                });
            });
            return batch;
        },

        lookUp: function lookUp() {
            if (!this.query) {
                return;
            }this.loading = true;
            this.notFound = false;

            this.getRawPage(this.query).end((function (pages) {
                if (!pages) this.notFound = true;
                if (pages) this.pages = [pages];
                this.loading = false;
            }).bind(this));
        }
    }
});
}, {"yyx990803/vue":2,"visionmedia/superagent":3,"chjj/marked":4,"visionmedia/batch":5}],
2: [function(require, module, exports) {
"use strict";

var _ = require("./util");
var extend = _.extend;

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefiexed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user
 *   data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue(options) {
  this._init(options);
}

/**
 * Mixin global API
 */

extend(Vue, require("./api/global"));

/**
 * Vue and every constructor that extends Vue has an
 * associated options object, which can be accessed during
 * compilation steps as `this.constructor.options`.
 *
 * These can be seen as the default options of every
 * Vue instance.
 */

Vue.options = {
  directives: require("./directives"),
  filters: require("./filters"),
  partials: {},
  transitions: {},
  components: {}
};

/**
 * Build up the prototype
 */

var p = Vue.prototype;

/**
 * $data has a setter which does a bunch of
 * teardown/setup work
 */

Object.defineProperty(p, "$data", {
  get: function get() {
    return this._data;
  },
  set: function set(newData) {
    this._setData(newData);
  }
});

/**
 * Mixin internal instance methods
 */

extend(p, require("./instance/init"));
extend(p, require("./instance/events"));
extend(p, require("./instance/scope"));
extend(p, require("./instance/compile"));

/**
 * Mixin public API methods
 */

extend(p, require("./api/data"));
extend(p, require("./api/dom"));
extend(p, require("./api/events"));
extend(p, require("./api/child"));
extend(p, require("./api/lifecycle"));

module.exports = _.Vue = Vue;
}, {"./util":6,"./api/global":7,"./directives":8,"./filters":9,"./instance/init":10,"./instance/events":11,"./instance/scope":12,"./instance/compile":13,"./api/data":14,"./api/dom":15,"./api/events":16,"./api/child":17,"./api/lifecycle":18}],
6: [function(require, module, exports) {
"use strict";

var lang = require("./lang");
var extend = lang.extend;

extend(exports, lang);
extend(exports, require("./env"));
extend(exports, require("./dom"));
extend(exports, require("./filter"));
extend(exports, require("./debug"));
}, {"./lang":19,"./env":20,"./dom":21,"./filter":22,"./debug":23}],
19: [function(require, module, exports) {
"use strict";

/**
 * Check is a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

exports.isReserved = function (str) {
  var c = str.charCodeAt(0);
  return c === 36 || c === 95;
};

/**
 * Guard text output, make sure undefined outputs
 * empty string
 *
 * @param {*} value
 * @return {String}
 */

exports.toString = function (value) {
  return value == null ? "" : value.toString();
};

/**
 * Check and convert possible numeric numbers before
 * setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

exports.toNumber = function (value) {
  return isNaN(value) || value === null || typeof value === "boolean" ? value : Number(value);
};

/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

exports.stripQuotes = function (str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 34 || a === 39) ? str.slice(1, -1) : false;
};

/**
 * Camelize a hyphen-delmited string.
 *
 * @param {String} str
 * @return {String}
 */

var camelRE = /[-_](\w)/g;
var capitalCamelRE = /(?:^|[-_])(\w)/g;

exports.camelize = function (str, cap) {
  var RE = cap ? capitalCamelRE : camelRE;
  return str.replace(RE, function (_, c) {
    return c ? c.toUpperCase() : "";
  });
};

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

exports.bind = function (fn, ctx) {
  return function () {
    return fn.apply(ctx, arguments);
  };
};

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [start] - start index
 * @return {Array}
 */

exports.toArray = function (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
};

/**
 * Mix properties into target object.
 *
 * @param {Object} to
 * @param {Object} from
 */

exports.extend = function (to, from) {
  for (var key in from) {
    to[key] = from[key];
  }
  return to;
};

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

exports.isObject = function (obj) {
  return obj && typeof obj === "object";
};

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString;
exports.isPlainObject = function (obj) {
  return toString.call(obj) === "[object Object]";
};

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

exports.isArray = function (obj) {
  return Array.isArray(obj);
};

/**
 * Define a non-enumerable property
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

exports.define = function (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
};
}, {}],
20: [function(require, module, exports) {
"use strict";

/**
 * Can we use __proto__?
 *
 * @type {Boolean}
 */

exports.hasProto = "__proto__" in {};

/**
 * Indicates we have a window
 *
 * @type {Boolean}
 */

var toString = Object.prototype.toString;
var inBrowser = exports.inBrowser = typeof window !== "undefined" && toString.call(window) !== "[object Object]";

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available.
 * 
 * If the user has included a setImmediate polyfill, we can
 * also use that. In Node we actually prefer setImmediate to
 * process.nextTick so we don't block the I/O.
 * 
 * Finally, fallback to setTimeout(0) if nothing else works.
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

var defer;
/* istanbul ignore if */
if (typeof MutationObserver !== "undefined") {
  defer = deferFromMutationObserver(MutationObserver);
} else
  /* istanbul ignore if */
  if (typeof WebkitMutationObserver !== "undefined") {
    defer = deferFromMutationObserver(WebkitMutationObserver);
  } else {
    defer = setTimeout;
  }

/* istanbul ignore next */
function deferFromMutationObserver(Observer) {
  var queue = [];
  var node = document.createTextNode("0");
  var i = 0;
  new Observer(function () {
    var l = queue.length;
    for (var i = 0; i < l; i++) {
      queue[i]();
    }
    queue = queue.slice(l);
  }).observe(node, { characterData: true });
  return function mutationObserverDefer(cb) {
    queue.push(cb);
    node.nodeValue = i = ++i % 2;
  };
}

exports.nextTick = function (cb, ctx) {
  if (ctx) {
    defer(function () {
      cb.call(ctx);
    }, 0);
  } else {
    defer(cb, 0);
  }
};

/**
 * Detect if we are in IE9...
 *
 * @type {Boolean}
 */

exports.isIE9 = inBrowser && navigator.userAgent.indexOf("MSIE 9.0") > 0;

/**
 * Sniff transition/animation events
 */

if (inBrowser && !exports.isIE9) {
  var isWebkitTrans = window.ontransitionend === undefined && window.onwebkittransitionend !== undefined;
  var isWebkitAnim = window.onanimationend === undefined && window.onwebkitanimationend !== undefined;
  exports.transitionProp = isWebkitTrans ? "WebkitTransition" : "transition";
  exports.transitionEndEvent = isWebkitTrans ? "webkitTransitionEnd" : "transitionend";
  exports.animationProp = isWebkitAnim ? "WebkitAnimation" : "animation";
  exports.animationEndEvent = isWebkitAnim ? "webkitAnimationEnd" : "animationend";
}
}, {}],
21: [function(require, module, exports) {
"use strict";

var config = require("../config");

/**
 * Check if a node is in the document.
 *
 * @param {Node} node
 * @return {Boolean}
 */

var doc = typeof document !== "undefined" && document.documentElement;

exports.inDoc = function (node) {
  return doc && doc.contains(node);
};

/**
 * Extract an attribute from a node.
 *
 * @param {Node} node
 * @param {String} attr
 */

exports.attr = function (node, attr) {
  attr = config.prefix + attr;
  var val = node.getAttribute(attr);
  if (val !== null) {
    node.removeAttribute(attr);
  }
  return val;
};

/**
 * Insert el before target
 *
 * @param {Element} el
 * @param {Element} target 
 */

exports.before = function (el, target) {
  target.parentNode.insertBefore(el, target);
};

/**
 * Insert el after target
 *
 * @param {Element} el
 * @param {Element} target 
 */

exports.after = function (el, target) {
  if (target.nextSibling) {
    exports.before(el, target.nextSibling);
  } else {
    target.parentNode.appendChild(el);
  }
};

/**
 * Remove el from DOM
 *
 * @param {Element} el
 */

exports.remove = function (el) {
  el.parentNode.removeChild(el);
};

/**
 * Prepend el to target
 *
 * @param {Element} el
 * @param {Element} target 
 */

exports.prepend = function (el, target) {
  if (target.firstChild) {
    exports.before(el, target.firstChild);
  } else {
    target.appendChild(el);
  }
};

/**
 * Replace target with el
 *
 * @param {Element} target
 * @param {Element} el
 */

exports.replace = function (target, el) {
  var parent = target.parentNode;
  if (parent) {
    parent.replaceChild(el, target);
  }
};

/**
 * Copy attributes from one element to another.
 *
 * @param {Element} from
 * @param {Element} to
 */

exports.copyAttributes = function (from, to) {
  if (from.hasAttributes()) {
    var attrs = from.attributes;
    for (var i = 0, l = attrs.length; i < l; i++) {
      var attr = attrs[i];
      to.setAttribute(attr.name, attr.value);
    }
  }
};

/**
 * Add event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

exports.on = function (el, event, cb) {
  el.addEventListener(event, cb);
};

/**
 * Remove event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

exports.off = function (el, event, cb) {
  el.removeEventListener(event, cb);
};

/**
 * Add class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {Strong} cls
 */

exports.addClass = function (el, cls) {
  if (el.classList) {
    el.classList.add(cls);
  } else {
    var cur = " " + (el.getAttribute("class") || "") + " ";
    if (cur.indexOf(" " + cls + " ") < 0) {
      el.setAttribute("class", (cur + cls).trim());
    }
  }
};

/**
 * Remove class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {Strong} cls
 */

exports.removeClass = function (el, cls) {
  if (el.classList) {
    el.classList.remove(cls);
  } else {
    var cur = " " + (el.getAttribute("class") || "") + " ";
    var tar = " " + cls + " ";
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, " ");
    }
    el.setAttribute("class", cur.trim());
  }
};

/**
 * Extract raw content inside an element into a temporary
 * container div
 *
 * @param {Element} el
 * @return {Element}
 */

exports.extractContent = function (el) {
  var child;
  var rawContent;
  if (el.hasChildNodes()) {
    rawContent = document.createElement("div");
    /* jshint boss:true */
    while (child = el.firstChild) {
      rawContent.appendChild(child);
    }
  }
  return rawContent;
};
}, {"../config":24}],
24: [function(require, module, exports) {
"use strict";

module.exports = {

  /**
   * The prefix to look for when parsing directives.
   *
   * @type {String}
   */

  prefix: "v-",

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Whether allow observer to alter data objects'
   * __proto__.
   *
   * @type {Boolean}
   */

  proto: true,

  /**
   * Whether to parse mustache tags in templates.
   *
   * @type {Boolean}
   */

  interpolate: true,

  /**
   * Whether to use async rendering.
   */

  async: true,

  /**
   * Whether to warn against errors caught when evaluating
   * expressions.
   */

  warnExpressionErrors: true,

  /**
   * Internal flag to indicate the delimiters have been
   * changed.
   *
   * @type {Boolean}
   */

  _delimitersChanged: true

};

/**
 * Interpolation delimiters.
 * We need to mark the changed flag so that the text parser
 * knows it needs to recompile the regex.
 *
 * @type {Array<String>}
 */

var delimiters = ["{{", "}}"];
Object.defineProperty(module.exports, "delimiters", {
  get: function get() {
    return delimiters;
  },
  set: function set(val) {
    delimiters = val;
    this._delimitersChanged = true;
  }
});
}, {}],
22: [function(require, module, exports) {
"use strict";

var _ = require("./debug");

/**
 * Resolve read & write filters for a vm instance. The
 * filters descriptor Array comes from the directive parser.
 *
 * This is extracted into its own utility so it can
 * be used in multiple scenarios.
 *
 * @param {Vue} vm
 * @param {Array<Object>} filters
 * @param {Object} [target]
 * @return {Object}
 */

exports.resolveFilters = function (vm, filters, target) {
  if (!filters) {
    return;
  }
  var res = target || {};
  // var registry = vm.$options.filters
  filters.forEach(function (f) {
    var def = vm.$options.filters[f.name];
    _.assertAsset(def, "filter", f.name);
    if (!def) return;
    var args = f.args;
    var reader, writer;
    if (typeof def === "function") {
      reader = def;
    } else {
      reader = def.read;
      writer = def.write;
    }
    if (reader) {
      if (!res.read) res.read = [];
      res.read.push(function (value) {
        return args ? reader.apply(vm, [value].concat(args)) : reader.call(vm, value);
      });
    }
    if (writer) {
      if (!res.write) res.write = [];
      res.write.push(function (value, oldVal) {
        return args ? writer.apply(vm, [value, oldVal].concat(args)) : writer.call(vm, value, oldVal);
      });
    }
  });
  return res;
};

/**
 * Apply filters to a value
 *
 * @param {*} value
 * @param {Array} filters
 * @param {Vue} vm
 * @param {*} oldVal
 * @return {*}
 */

exports.applyFilters = function (value, filters, vm, oldVal) {
  if (!filters) {
    return value;
  }
  for (var i = 0, l = filters.length; i < l; i++) {
    value = filters[i].call(vm, value, oldVal);
  }
  return value;
};
}, {"./debug":23}],
23: [function(require, module, exports) {
"use strict";

var config = require("../config");

/**
 * Enable debug utilities. The enableDebug() function and
 * all _.log() & _.warn() calls will be dropped in the
 * minified production build.
 */

enableDebug();

function enableDebug() {

  var hasConsole = typeof console !== "undefined";

  /**
   * Log a message.
   *
   * @param {String} msg
   */

  exports.log = function (msg) {
    if (hasConsole && config.debug) {
      console.log("[Vue info]: " + msg);
    }
  };

  /**
   * We've got a problem here.
   *
   * @param {String} msg
   */

  var warned = false;
  exports.warn = function (msg) {
    if (hasConsole && (!config.silent || config.debug)) {
      if (!config.debug && !warned) {
        warned = true;
        console.log("Set `Vue.config.debug = true` to enable debug mode.");
      }
      console.warn("[Vue warn]: " + msg);
      /* istanbul ignore if */
      if (config.debug) {
        /* jshint debug: true */
        debugger;
      }
    }
  };

  /**
   * Assert asset exists
   */

  exports.assertAsset = function (val, type, id) {
    if (!val) {
      exports.warn("Failed to resolve " + type + ": " + id);
    }
  };
}
}, {"../config":24}],
7: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var mergeOptions = require("../util/merge-option");

/**
 * Expose useful internals
 */

exports.util = _;
exports.nextTick = _.nextTick;
exports.config = require("../config");

exports.compiler = {
  compile: require("../compiler/compile"),
  transclude: require("../compiler/transclude")
};

exports.parsers = {
  path: require("../parsers/path"),
  text: require("../parsers/text"),
  template: require("../parsers/template"),
  directive: require("../parsers/directive"),
  expression: require("../parsers/expression")
};

/**
 * Each instance constructor, including Vue, has a unique
 * cid. This enables us to create wrapped "child
 * constructors" for prototypal inheritance and cache them.
 */

exports.cid = 0;
var cid = 1;

/**
 * Class inehritance
 *
 * @param {Object} extendOptions
 */

exports.extend = function (extendOptions) {
  extendOptions = extendOptions || {};
  var Super = this;
  var Sub = createClass(extendOptions.name || "VueComponent");
  Sub.prototype = Object.create(Super.prototype);
  Sub.prototype.constructor = Sub;
  Sub.cid = cid++;
  Sub.options = mergeOptions(Super.options, extendOptions);
  Sub["super"] = Super;
  // allow further extension
  Sub.extend = Super.extend;
  // create asset registers, so extended classes
  // can have their private assets too.
  createAssetRegisters(Sub);
  return Sub;
};

/**
 * A function that returns a sub-class constructor with the
 * given name. This gives us much nicer output when
 * logging instances in the console.
 *
 * @param {String} name
 * @return {Function}
 */

function createClass(name) {
  return new Function("return function " + _.camelize(name, true) + " (options) { this._init(options) }")();
}

/**
 * Plugin system
 *
 * @param {Object} plugin
 */

exports.use = function (plugin) {
  // additional parameters
  var args = _.toArray(arguments, 1);
  args.unshift(this);
  if (typeof plugin.install === "function") {
    plugin.install.apply(plugin, args);
  } else {
    plugin.apply(null, args);
  }
  return this;
};

/**
 * Define asset registration methods on a constructor.
 *
 * @param {Function} Constructor
 */

var assetTypes = ["directive", "filter", "partial", "transition"];

function createAssetRegisters(Constructor) {

  /* Asset registration methods share the same signature:
   *
   * @param {String} id
   * @param {*} definition
   */

  assetTypes.forEach(function (type) {
    Constructor[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + "s"][id];
      } else {
        this.options[type + "s"][id] = definition;
      }
    };
  });

  /**
   * Component registration needs to automatically invoke
   * Vue.extend on object values.
   *
   * @param {String} id
   * @param {Object|Function} definition
   */

  Constructor.component = function (id, definition) {
    if (!definition) {
      return this.options.components[id];
    } else {
      if (_.isPlainObject(definition)) {
        definition.name = id;
        definition = _.Vue.extend(definition);
      }
      this.options.components[id] = definition;
    }
  };
}

createAssetRegisters(exports);
}, {"../util":6,"../util/merge-option":25,"../config":24,"../compiler/compile":26,"../compiler/transclude":27,"../parsers/path":28,"../parsers/text":29,"../parsers/template":30,"../parsers/directive":31,"../parsers/expression":32}],
25: [function(require, module, exports) {
"use strict";

var _ = require("./index");
var extend = _.extend;

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
 */

var strats = Object.create(null);

/**
 * Helper that recursively merges two data objects together.
 */

function mergeData(to, from) {
  var key, toVal, fromVal;
  for (key in from) {
    toVal = to[key];
    fromVal = from[key];
    if (!to.hasOwnProperty(key)) {
      to.$add(key, fromVal);
    } else if (_.isObject(toVal) && _.isObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}

/**
 * Data
 */

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }
    if (typeof childVal !== "function") {
      _.warn("The \"data\" option should be a function " + "that returns a per-instance value in component " + "definitions.");
      return parentVal;
    }
    if (!parentVal) {
      return childVal;
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn() {
      return mergeData(childVal.call(this), parentVal.call(this));
    };
  } else {
    // instance merge, return raw object
    var instanceData = typeof childVal === "function" ? childVal.call(vm) : childVal;
    var defaultData = typeof parentVal === "function" ? parentVal.call(vm) : undefined;
    if (instanceData) {
      return mergeData(instanceData, defaultData);
    } else {
      return defaultData;
    }
  }
};

/**
 * El
 */

strats.el = function (parentVal, childVal, vm) {
  if (!vm && childVal && typeof childVal !== "function") {
    _.warn("The \"el\" option should be a function " + "that returns a per-instance value in component " + "definitions.");
    return;
  }
  var ret = childVal || parentVal;
  // invoke the element factory if this is instance merge
  return vm && typeof ret === "function" ? ret.call(vm) : ret;
};

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.created = strats.ready = strats.attached = strats.detached = strats.beforeCompile = strats.compiled = strats.beforeDestroy = strats.destroyed = strats.paramAttributes = function (parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : _.isArray(childVal) ? childVal : [childVal] : parentVal;
};

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

strats.directives = strats.filters = strats.partials = strats.transitions = strats.components = function (parentVal, childVal, vm, key) {
  var ret = Object.create(vm && vm.$parent ? vm.$parent.$options[key] : _.Vue.options[key]);
  if (parentVal) {
    var keys = Object.keys(parentVal);
    var i = keys.length;
    var field;
    while (i--) {
      field = keys[i];
      ret[field] = parentVal[field];
    }
  }
  if (childVal) extend(ret, childVal);
  return ret;
};

/**
 * Events & Watchers.
 *
 * Events & watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch = strats.events = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !_.isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent ? parent.concat(child) : [child];
  }
  return ret;
};

/**
 * Other object hashes.
 */

strats.methods = strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = Object.create(parentVal);
  extend(ret, childVal);
  return ret;
};

/**
 * Default strategy.
 */

var defaultStrat = function defaultStrat(parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};

/**
 * Make sure component options get converted to actual
 * constructors.
 *
 * @param {Object} components
 */

function guardComponents(components) {
  if (components) {
    var def;
    for (var key in components) {
      def = components[key];
      if (_.isPlainObject(def)) {
        def.name = key;
        components[key] = _.Vue.extend(def);
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

module.exports = function mergeOptions(parent, child, vm) {
  guardComponents(child.components);
  var options = {};
  var key;
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm);
    }
  }
  for (key in parent) {
    merge(key);
  }
  for (key in child) {
    if (!parent.hasOwnProperty(key)) {
      merge(key);
    }
  }
  function merge(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options;
};
}, {"./index":6}],
26: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var config = require("../config");
var textParser = require("../parsers/text");
var dirParser = require("../parsers/directive");
var templateParser = require("../parsers/template");

/**
 * Compile a template and return a reusable composite link
 * function, which recursively contains more link functions
 * inside. This top level compile function should only be
 * called on instance root nodes.
 *
 * When the `asParent` flag is true, this means we are doing
 * a partial compile for a component's parent scope markup
 * (See #502). This could **only** be triggered during
 * compilation of `v-component`, and we need to skip v-with,
 * v-ref & v-component in this situation.
 *
 * @param {Element|DocumentFragment} el
 * @param {Object} options
 * @param {Boolean} partial
 * @param {Boolean} asParent - compiling a component
 *                             container as its parent.
 * @return {Function}
 */

module.exports = function compile(el, options, partial, asParent) {
  var params = !partial && options.paramAttributes;
  var paramsLinkFn = params ? compileParamAttributes(el, params, options) : null;
  var nodeLinkFn = el instanceof DocumentFragment ? null : compileNode(el, options, asParent);
  var childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && el.tagName !== "SCRIPT" && el.hasChildNodes() ? compileNodeList(el.childNodes, options) : null;

  /**
   * A linker function to be called on a already compiled
   * piece of DOM, which instantiates all directive
   * instances.
   *
   * @param {Vue} vm
   * @param {Element|DocumentFragment} el
   * @return {Function|undefined}
   */

  return function link(vm, el) {
    var originalDirCount = vm._directives.length;
    if (paramsLinkFn) paramsLinkFn(vm, el);
    // cache childNodes before linking parent, fix #657
    var childNodes = _.toArray(el.childNodes);
    if (nodeLinkFn) nodeLinkFn(vm, el);
    if (childLinkFn) childLinkFn(vm, childNodes);

    /**
     * If this is a partial compile, the linker function
     * returns an unlink function that tearsdown all
     * directives instances generated during the partial
     * linking.
     */

    if (partial) {
      var dirs = vm._directives.slice(originalDirCount);
      return function unlink() {
        var i = dirs.length;
        while (i--) {
          dirs[i]._teardown();
        }
        i = vm._directives.indexOf(dirs[0]);
        vm._directives.splice(i, dirs.length);
      };
    }
  };
};

/**
 * Compile a node and return a nodeLinkFn based on the
 * node type.
 *
 * @param {Node} node
 * @param {Object} options
 * @param {Boolean} asParent
 * @return {Function|undefined}
 */

function compileNode(node, options, asParent) {
  var type = node.nodeType;
  if (type === 1 && node.tagName !== "SCRIPT") {
    return compileElement(node, options, asParent);
  } else if (type === 3 && config.interpolate) {
    return compileTextNode(node, options);
  }
}

/**
 * Compile an element and return a nodeLinkFn.
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Boolean} asParent
 * @return {Function|null}
 */

function compileElement(el, options, asParent) {
  var linkFn, tag, component;
  // check custom element component, but only on non-root
  if (!asParent && !el.__vue__) {
    tag = el.tagName.toLowerCase();
    component = tag.indexOf("-") > 0 && options.components[tag];
    if (component) {
      el.setAttribute(config.prefix + "component", tag);
    }
  }
  if (component || el.hasAttributes()) {
    // check terminal direcitves
    if (!asParent) {
      linkFn = checkTerminalDirectives(el, options);
    }
    // if not terminal, build normal link function
    if (!linkFn) {
      var dirs = collectDirectives(el, options, asParent);
      linkFn = dirs.length ? makeDirectivesLinkFn(dirs) : null;
    }
  }
  // if the element is a textarea, we need to interpolate
  // its content on initial render.
  if (el.tagName === "TEXTAREA") {
    var realLinkFn = linkFn;
    linkFn = function (vm, el) {
      el.value = vm.$interpolate(el.value);
      if (realLinkFn) realLinkFn(vm, el);
    };
    linkFn.terminal = true;
  }
  return linkFn;
}

/**
 * Build a multi-directive link function.
 *
 * @param {Array} directives
 * @return {Function} directivesLinkFn
 */

function makeDirectivesLinkFn(directives) {
  return function directivesLinkFn(vm, el) {
    // reverse apply because it's sorted low to high
    var i = directives.length;
    var dir, j, k;
    while (i--) {
      dir = directives[i];
      if (dir._link) {
        // custom link fn
        dir._link(vm, el);
      } else {
        k = dir.descriptors.length;
        for (j = 0; j < k; j++) {
          vm._bindDir(dir.name, el, dir.descriptors[j], dir.def);
        }
      }
    }
  };
}

/**
 * Compile a textNode and return a nodeLinkFn.
 *
 * @param {TextNode} node
 * @param {Object} options
 * @return {Function|null} textNodeLinkFn
 */

function compileTextNode(node, options) {
  var tokens = textParser.parse(node.nodeValue);
  if (!tokens) {
    return null;
  }
  var frag = document.createDocumentFragment();
  var el, token;
  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];
    el = token.tag ? processTextToken(token, options) : document.createTextNode(token.value);
    frag.appendChild(el);
  }
  return makeTextNodeLinkFn(tokens, frag, options);
}

/**
 * Process a single text token.
 *
 * @param {Object} token
 * @param {Object} options
 * @return {Node}
 */

function processTextToken(token, options) {
  var el;
  if (token.oneTime) {
    el = document.createTextNode(token.value);
  } else {
    if (token.html) {
      el = document.createComment("v-html");
      setTokenType("html");
    } else if (token.partial) {
      el = document.createComment("v-partial");
      setTokenType("partial");
    } else {
      // IE will clean up empty textNodes during
      // frag.cloneNode(true), so we have to give it
      // something here...
      el = document.createTextNode(" ");
      setTokenType("text");
    }
  }
  function setTokenType(type) {
    token.type = type;
    token.def = options.directives[type];
    token.descriptor = dirParser.parse(token.value)[0];
  }
  return el;
}

/**
 * Build a function that processes a textNode.
 *
 * @param {Array<Object>} tokens
 * @param {DocumentFragment} frag
 */

function makeTextNodeLinkFn(tokens, frag) {
  return function textNodeLinkFn(vm, el) {
    var fragClone = frag.cloneNode(true);
    var childNodes = _.toArray(fragClone.childNodes);
    var token, value, node;
    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i];
      value = token.value;
      if (token.tag) {
        node = childNodes[i];
        if (token.oneTime) {
          value = vm.$eval(value);
          if (token.html) {
            _.replace(node, templateParser.parse(value, true));
          } else {
            node.nodeValue = value;
          }
        } else {
          vm._bindDir(token.type, node, token.descriptor, token.def);
        }
      }
    }
    _.replace(el, fragClone);
  };
}

/**
 * Compile a node list and return a childLinkFn.
 *
 * @param {NodeList} nodeList
 * @param {Object} options
 * @return {Function|undefined}
 */

function compileNodeList(nodeList, options) {
  var linkFns = [];
  var nodeLinkFn, childLinkFn, node;
  for (var i = 0, l = nodeList.length; i < l; i++) {
    node = nodeList[i];
    nodeLinkFn = compileNode(node, options);
    childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && node.tagName !== "SCRIPT" && node.hasChildNodes() ? compileNodeList(node.childNodes, options) : null;
    linkFns.push(nodeLinkFn, childLinkFn);
  }
  return linkFns.length ? makeChildLinkFn(linkFns) : null;
}

/**
 * Make a child link function for a node's childNodes.
 *
 * @param {Array<Function>} linkFns
 * @return {Function} childLinkFn
 */

function makeChildLinkFn(linkFns) {
  return function childLinkFn(vm, nodes) {
    var node, nodeLinkFn, childrenLinkFn;
    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
      node = nodes[n];
      nodeLinkFn = linkFns[i++];
      childrenLinkFn = linkFns[i++];
      // cache childNodes before linking parent, fix #657
      var childNodes = _.toArray(node.childNodes);
      if (nodeLinkFn) {
        nodeLinkFn(vm, node);
      }
      if (childrenLinkFn) {
        childrenLinkFn(vm, childNodes);
      }
    }
  };
}

/**
 * Compile param attributes on a root element and return
 * a paramAttributes link function.
 *
 * @param {Element} el
 * @param {Array} attrs
 * @param {Object} options
 * @return {Function} paramsLinkFn
 */

function compileParamAttributes(el, attrs, options) {
  var params = [];
  var i = attrs.length;
  var name, value, param;
  while (i--) {
    name = attrs[i];
    if (/[A-Z]/.test(name)) {
      _.warn("You seem to be using camelCase for a paramAttribute, " + "but HTML doesn't differentiate between upper and " + "lower case. You should use hyphen-delimited " + "attribute names. For more info see " + "http://vuejs.org/api/options.html#paramAttributes");
    }
    value = el.getAttribute(name);
    if (value !== null) {
      param = {
        name: name,
        value: value
      };
      var tokens = textParser.parse(value);
      if (tokens) {
        el.removeAttribute(name);
        if (tokens.length > 1) {
          _.warn("Invalid param attribute binding: \"" + name + "=\"" + value + "\"" + "\nDon't mix binding tags with plain text " + "in param attribute bindings.");
          continue;
        } else {
          param.dynamic = true;
          param.value = tokens[0].value;
        }
      }
      params.push(param);
    }
  }
  return makeParamsLinkFn(params, options);
}

/**
 * Build a function that applies param attributes to a vm.
 *
 * @param {Array} params
 * @param {Object} options
 * @return {Function} paramsLinkFn
 */

var dataAttrRE = /^data-/;

function makeParamsLinkFn(params, options) {
  var def = options.directives["with"];
  return function paramsLinkFn(vm, el) {
    var i = params.length;
    var param, path;
    while (i--) {
      param = params[i];
      // params could contain dashes, which will be
      // interpreted as minus calculations by the parser
      // so we need to wrap the path here
      path = _.camelize(param.name.replace(dataAttrRE, ""));
      if (param.dynamic) {
        // dynamic param attribtues are bound as v-with.
        // we can directly duck the descriptor here beacuse
        // param attributes cannot use expressions or
        // filters.
        vm._bindDir("with", el, {
          arg: path,
          expression: param.value
        }, def);
      } else {
        // just set once
        vm.$set(path, param.value);
      }
    }
  };
}

/**
 * Check an element for terminal directives in fixed order.
 * If it finds one, return a terminal link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

var terminalDirectives = ["repeat", "if", "component"];

function skip() {}
skip.terminal = true;

function checkTerminalDirectives(el, options) {
  if (_.attr(el, "pre") !== null) {
    return skip;
  }
  var value, dirName;
  /* jshint boss: true */
  for (var i = 0; i < 3; i++) {
    dirName = terminalDirectives[i];
    if (value = _.attr(el, dirName)) {
      return makeTeriminalLinkFn(el, dirName, value, options);
    }
  }
}

/**
 * Build a link function for a terminal directive.
 *
 * @param {Element} el
 * @param {String} dirName
 * @param {String} value
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

function makeTeriminalLinkFn(el, dirName, value, options) {
  var descriptor = dirParser.parse(value)[0];
  var def = options.directives[dirName];
  var terminalLinkFn = function terminalLinkFn(vm, el) {
    vm._bindDir(dirName, el, descriptor, def);
  };
  terminalLinkFn.terminal = true;
  return terminalLinkFn;
}

/**
 * Collect the directives on an element.
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Boolean} asParent
 * @return {Array}
 */

function collectDirectives(el, options, asParent) {
  var attrs = _.toArray(el.attributes);
  var i = attrs.length;
  var dirs = [];
  var attr, attrName, dir, dirName, dirDef;
  while (i--) {
    attr = attrs[i];
    attrName = attr.name;
    if (attrName.indexOf(config.prefix) === 0) {
      dirName = attrName.slice(config.prefix.length);
      if (asParent && (dirName === "with" || dirName === "component")) {
        continue;
      }
      dirDef = options.directives[dirName];
      _.assertAsset(dirDef, "directive", dirName);
      if (dirDef) {
        dirs.push({
          name: dirName,
          descriptors: dirParser.parse(attr.value),
          def: dirDef
        });
      }
    } else if (config.interpolate) {
      dir = collectAttrDirective(el, attrName, attr.value, options);
      if (dir) {
        dirs.push(dir);
      }
    }
  }
  // sort by priority, LOW to HIGH
  dirs.sort(directiveComparator);
  return dirs;
}

/**
 * Check an attribute for potential dynamic bindings,
 * and return a directive object.
 *
 * @param {Element} el
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Object}
 */

function collectAttrDirective(el, name, value, options) {
  if (options._skipAttrs && options._skipAttrs.indexOf(name) > -1) {
    return;
  }
  var tokens = textParser.parse(value);
  if (tokens) {
    var def = options.directives.attr;
    var i = tokens.length;
    var allOneTime = true;
    while (i--) {
      var token = tokens[i];
      if (token.tag && !token.oneTime) {
        allOneTime = false;
      }
    }
    return {
      def: def,
      _link: allOneTime ? function (vm, el) {
        el.setAttribute(name, vm.$interpolate(value));
      } : function (vm, el) {
        var value = textParser.tokensToExp(tokens, vm);
        var desc = dirParser.parse(name + ":" + value)[0];
        vm._bindDir("attr", el, desc, def);
      }
    };
  }
}

/**
 * Directive priority sort comparator
 *
 * @param {Object} a
 * @param {Object} b
 */

function directiveComparator(a, b) {
  a = a.def.priority || 0;
  b = b.def.priority || 0;
  return a > b ? 1 : -1;
}
}, {"../util":6,"../config":24,"../parsers/text":29,"../parsers/directive":31,"../parsers/template":30}],
29: [function(require, module, exports) {
"use strict";

var Cache = require("../cache");
var config = require("../config");
var dirParser = require("./directive");
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
var cache, tagRE, htmlRE, firstChar, lastChar;

/**
 * Escape a string so it can be used in a RegExp
 * constructor.
 *
 * @param {String} str
 */

function escapeRegex(str) {
  return str.replace(regexEscapeRE, "\\$&");
}

/**
 * Compile the interpolation tag regex.
 *
 * @return {RegExp}
 */

function compileRegex() {
  config._delimitersChanged = false;
  var open = config.delimiters[0];
  var close = config.delimiters[1];
  firstChar = open.charAt(0);
  lastChar = close.charAt(close.length - 1);
  var firstCharRE = escapeRegex(firstChar);
  var lastCharRE = escapeRegex(lastChar);
  var openRE = escapeRegex(open);
  var closeRE = escapeRegex(close);
  tagRE = new RegExp(firstCharRE + "?" + openRE + "(.+?)" + closeRE + lastCharRE + "?", "g");
  htmlRE = new RegExp("^" + firstCharRE + openRE + ".*" + closeRE + lastCharRE + "$");
  // reset cache
  cache = new Cache(1000);
}

/**
 * Parse a template text string into an array of tokens.
 *
 * @param {String} text
 * @return {Array<Object> | null}
 *               - {String} type
 *               - {String} value
 *               - {Boolean} [html]
 *               - {Boolean} [oneTime]
 */

exports.parse = function (text) {
  if (config._delimitersChanged) {
    compileRegex();
  }
  var hit = cache.get(text);
  if (hit) {
    return hit;
  }
  if (!tagRE.test(text)) {
    return null;
  }
  var tokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, value, first, oneTime, partial;
  /* jshint boss:true */
  while (match = tagRE.exec(text)) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index)
      });
    }
    // tag token
    first = match[1].charCodeAt(0);
    oneTime = first === 42; // *
    partial = first === 62; // >
    value = oneTime || partial ? match[1].slice(1) : match[1];
    tokens.push({
      tag: true,
      value: value.trim(),
      html: htmlRE.test(match[0]),
      oneTime: oneTime,
      partial: partial
    });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex)
    });
  }
  cache.put(text, tokens);
  return tokens;
};

/**
 * Format a list of tokens into an expression.
 * e.g. tokens parsed from 'a {{b}} c' can be serialized
 * into one single expression as '"a " + b + " c"'.
 *
 * @param {Array} tokens
 * @param {Vue} [vm]
 * @return {String}
 */

exports.tokensToExp = function (tokens, vm) {
  return tokens.length > 1 ? tokens.map(function (token) {
    return formatToken(token, vm);
  }).join("+") : formatToken(tokens[0], vm, true);
};

/**
 * Format a single token.
 *
 * @param {Object} token
 * @param {Vue} [vm]
 * @param {Boolean} single
 * @return {String}
 */

function formatToken(token, vm, single) {
  return token.tag ? vm && token.oneTime ? "\"" + vm.$eval(token.value) + "\"" : single ? token.value : inlineFilters(token.value) : "\"" + token.value + "\"";
}

/**
 * For an attribute with multiple interpolation tags,
 * e.g. attr="some-{{thing | filter}}", in order to combine
 * the whole thing into a single watchable expression, we
 * have to inline those filters. This function does exactly
 * that. This is a bit hacky but it avoids heavy changes
 * to directive parser and watcher mechanism.
 *
 * @param {String} exp
 * @return {String}
 */

var filterRE = /[^|]\|[^|]/;
function inlineFilters(exp) {
  if (!filterRE.test(exp)) {
    return "(" + exp + ")";
  } else {
    var dir = dirParser.parse(exp)[0];
    if (!dir.filters) {
      return "(" + exp + ")";
    } else {
      exp = dir.expression;
      for (var i = 0, l = dir.filters.length; i < l; i++) {
        var filter = dir.filters[i];
        var args = filter.args ? ",\"" + filter.args.join("\",\"") + "\"" : "";
        exp = "this.$options.filters[\"" + filter.name + "\"]" + ".apply(this,[" + exp + args + "])";
      }
      return exp;
    }
  }
}
}, {"../cache":33,"../config":24,"./directive":31}],
33: [function(require, module, exports) {
"use strict";

/**
 * A doubly linked list-based Least Recently Used (LRU)
 * cache. Will keep most recently used items while
 * discarding least recently used items when its limit is
 * reached. This is a bare-bone version of
 * Rasmus Andersson's js-lru:
 *
 *   https://github.com/rsms/js-lru
 *
 * @param {Number} limit
 * @constructor
 */

function Cache(limit) {
  this.size = 0;
  this.limit = limit;
  this.head = this.tail = undefined;
  this._keymap = {};
}

var p = Cache.prototype;

/**
 * Put <value> into the cache associated with <key>.
 * Returns the entry which was removed to make room for
 * the new entry. Otherwise undefined is returned.
 * (i.e. if there was enough room already).
 *
 * @param {String} key
 * @param {*} value
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var entry = {
    key: key,
    value: value
  };
  this._keymap[key] = entry;
  if (this.tail) {
    this.tail.newer = entry;
    entry.older = this.tail;
  } else {
    this.head = entry;
  }
  this.tail = entry;
  if (this.size === this.limit) {
    return this.shift();
  } else {
    this.size++;
  }
};

/**
 * Purge the least recently used (oldest) entry from the
 * cache. Returns the removed entry or undefined if the
 * cache was empty.
 */

p.shift = function () {
  var entry = this.head;
  if (entry) {
    this.head = this.head.newer;
    this.head.older = undefined;
    entry.newer = entry.older = undefined;
    this._keymap[entry.key] = undefined;
  }
  return entry;
};

/**
 * Get and register recent use of <key>. Returns the value
 * associated with <key> or undefined if not in cache.
 *
 * @param {String} key
 * @param {Boolean} returnEntry
 * @return {Entry|*}
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key];
  if (entry === undefined) return;
  if (entry === this.tail) {
    return returnEntry ? entry : entry.value;
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    if (entry === this.head) {
      this.head = entry.newer;
    }
    entry.newer.older = entry.older // C <-- E.
    ;
  }
  if (entry.older) {
    entry.older.newer = entry.newer // C. --> E
    ;
  }
  entry.newer = undefined; // D --x
  entry.older = this.tail; // D. --> E
  if (this.tail) {
    this.tail.newer = entry // E. <-- D
    ;
  }
  this.tail = entry;
  return returnEntry ? entry : entry.value;
};

module.exports = Cache;
}, {}],
31: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var Cache = require("../cache");
var cache = new Cache(1000);
var argRE = /^[^\{\?]+$|^'[^']*'$|^"[^"]*"$/;
var filterTokenRE = /[^\s'"]+|'[^']+'|"[^"]+"/g;

/**
 * Parser state
 */

var str;
var c, i, l;
var inSingle;
var inDouble;
var curly;
var square;
var paren;
var begin;
var argIndex;
var dirs;
var dir;
var lastFilterIndex;
var arg;

/**
 * Push a directive object into the result Array
 */

function pushDir() {
  dir.raw = str.slice(begin, i).trim();
  if (dir.expression === undefined) {
    dir.expression = str.slice(argIndex, i).trim();
  } else if (lastFilterIndex !== begin) {
    pushFilter();
  }
  if (i === 0 || dir.expression) {
    dirs.push(dir);
  }
}

/**
 * Push a filter to the current directive object
 */

function pushFilter() {
  var exp = str.slice(lastFilterIndex, i).trim();
  var filter;
  if (exp) {
    filter = {};
    var tokens = exp.match(filterTokenRE);
    filter.name = tokens[0];
    filter.args = tokens.length > 1 ? tokens.slice(1) : null;
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter);
  }
  lastFilterIndex = i + 1;
}

/**
 * Parse a directive string into an Array of AST-like
 * objects representing directives.
 *
 * Example:
 *
 * "click: a = a + 1 | uppercase" will yield:
 * {
 *   arg: 'click',
 *   expression: 'a = a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} str
 * @return {Array<Object>}
 */

exports.parse = function (s) {

  var hit = cache.get(s);
  if (hit) {
    return hit;
  }

  // reset parser state
  str = s;
  inSingle = inDouble = false;
  curly = square = paren = begin = argIndex = 0;
  lastFilterIndex = 0;
  dirs = [];
  dir = {};
  arg = null;

  for (i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (inSingle) {
      // check single quote
      if (c === 39) inSingle = !inSingle;
    } else if (inDouble) {
      // check double quote
      if (c === 34) inDouble = !inDouble;
    } else if (c === 44 && // comma
    !paren && !curly && !square) {
      // reached the end of a directive
      pushDir();
      // reset & skip the comma
      dir = {};
      begin = argIndex = lastFilterIndex = i + 1;
    } else if (c === 58 && // colon
    !dir.expression && !dir.arg) {
      // argument
      arg = str.slice(begin, i).trim();
      // test for valid argument here
      // since we may have caught stuff like first half of
      // an object literal or a ternary expression.
      if (argRE.test(arg)) {
        argIndex = i + 1;
        dir.arg = _.stripQuotes(arg) || arg;
      }
    } else if (c === 124 && // pipe
    str.charCodeAt(i + 1) !== 124 && str.charCodeAt(i - 1) !== 124) {
      if (dir.expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        dir.expression = str.slice(argIndex, i).trim();
      } else {
        // already has filter
        pushFilter();
      }
    } else {
      switch (c) {
        case 34:
          inDouble = true;break; // "
        case 39:
          inSingle = true;break; // '
        case 40:
          paren++;break; // (
        case 41:
          paren--;break; // )
        case 91:
          square++;break; // [
        case 93:
          square--;break; // ]
        case 123:
          curly++;break; // {
        case 125:
          curly--;break; // }
      }
    }
  }

  if (i === 0 || begin !== i) {
    pushDir();
  }

  cache.put(s, dirs);
  return dirs;
};
}, {"../util":6,"../cache":33}],
30: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var Cache = require("../cache");
var templateCache = new Cache(1000);
var idSelectorCache = new Cache(1000);

var map = {
  _default: [0, "", ""],
  legend: [1, "<fieldset>", "</fieldset>"],
  tr: [2, "<table><tbody>", "</tbody></table>"],
  col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"]
};

map.td = map.th = [3, "<table><tbody><tr>", "</tr></tbody></table>"];

map.option = map.optgroup = [1, "<select multiple=\"multiple\">", "</select>"];

map.thead = map.tbody = map.colgroup = map.caption = map.tfoot = [1, "<table>", "</table>"];

map.g = map.defs = map.symbol = map.use = map.image = map.text = map.circle = map.ellipse = map.line = map.path = map.polygon = map.polyline = map.rect = [1, "<svg " + "xmlns=\"http://www.w3.org/2000/svg\" " + "xmlns:xlink=\"http://www.w3.org/1999/xlink\" " + "xmlns:ev=\"http://www.w3.org/2001/xml-events\"" + "version=\"1.1\">", "</svg>"];

var tagRE = /<([\w:]+)/;
var entityRE = /&\w+;/;

/**
 * Convert a string template to a DocumentFragment.
 * Determines correct wrapping by tag types. Wrapping
 * strategy found in jQuery & component/domify.
 *
 * @param {String} templateString
 * @return {DocumentFragment}
 */

function stringToFragment(templateString) {
  // try a cache hit first
  var hit = templateCache.get(templateString);
  if (hit) {
    return hit;
  }

  var frag = document.createDocumentFragment();
  var tagMatch = templateString.match(tagRE);
  var entityMatch = entityRE.test(templateString);

  if (!tagMatch && !entityMatch) {
    // text only, return a single text node.
    frag.appendChild(document.createTextNode(templateString));
  } else {

    var tag = tagMatch && tagMatch[1];
    var wrap = map[tag] || map._default;
    var depth = wrap[0];
    var prefix = wrap[1];
    var suffix = wrap[2];
    var node = document.createElement("div");

    node.innerHTML = prefix + templateString.trim() + suffix;
    while (depth--) {
      node = node.lastChild;
    }

    var child;
    /* jshint boss:true */
    while (child = node.firstChild) {
      frag.appendChild(child);
    }
  }

  templateCache.put(templateString, frag);
  return frag;
}

/**
 * Convert a template node to a DocumentFragment.
 *
 * @param {Node} node
 * @return {DocumentFragment}
 */

function nodeToFragment(node) {
  var tag = node.tagName;
  // if its a template tag and the browser supports it,
  // its content is already a document fragment.
  if (tag === "TEMPLATE" && node.content instanceof DocumentFragment) {
    return node.content;
  }
  return tag === "SCRIPT" ? stringToFragment(node.textContent) : stringToFragment(node.innerHTML);
}

// Test for the presence of the Safari template cloning bug
// https://bugs.webkit.org/show_bug.cgi?id=137755
var hasBrokenTemplate = _.inBrowser ? (function () {
  var a = document.createElement("div");
  a.innerHTML = "<template>1</template>";
  return !a.cloneNode(true).firstChild.innerHTML;
})() : false;

// Test for IE10/11 textarea placeholder clone bug
var hasTextareaCloneBug = _.inBrowser ? (function () {
  var t = document.createElement("textarea");
  t.placeholder = "t";
  return t.cloneNode(true).value === "t";
})() : false;

/**
 * 1. Deal with Safari cloning nested <template> bug by
 *    manually cloning all template instances.
 * 2. Deal with IE10/11 textarea placeholder bug by setting
 *    the correct value after cloning.
 *
 * @param {Element|DocumentFragment} node
 * @return {Element|DocumentFragment}
 */

exports.clone = function (node) {
  var res = node.cloneNode(true);
  var i, original, cloned;
  /* istanbul ignore if */
  if (hasBrokenTemplate) {
    original = node.querySelectorAll("template");
    if (original.length) {
      cloned = res.querySelectorAll("template");
      i = cloned.length;
      while (i--) {
        cloned[i].parentNode.replaceChild(original[i].cloneNode(true), cloned[i]);
      }
    }
  }
  /* istanbul ignore if */
  if (hasTextareaCloneBug) {
    if (node.tagName === "TEXTAREA") {
      res.value = node.value;
    } else {
      original = node.querySelectorAll("textarea");
      if (original.length) {
        cloned = res.querySelectorAll("textarea");
        i = cloned.length;
        while (i--) {
          cloned[i].value = original[i].value;
        }
      }
    }
  }
  return res;
};

/**
 * Process the template option and normalizes it into a
 * a DocumentFragment that can be used as a partial or a
 * instance template.
 *
 * @param {*} template
 *    Possible values include:
 *    - DocumentFragment object
 *    - Node object of type Template
 *    - id selector: '#some-template-id'
 *    - template string: '<div><span>{{msg}}</span></div>'
 * @param {Boolean} clone
 * @param {Boolean} noSelector
 * @return {DocumentFragment|undefined}
 */

exports.parse = function (template, clone, noSelector) {
  var node, frag;

  // if the template is already a document fragment,
  // do nothing
  if (template instanceof DocumentFragment) {
    return clone ? template.cloneNode(true) : template;
  }

  if (typeof template === "string") {
    // id selector
    if (!noSelector && template.charAt(0) === "#") {
      // id selector can be cached too
      frag = idSelectorCache.get(template);
      if (!frag) {
        node = document.getElementById(template.slice(1));
        if (node) {
          frag = nodeToFragment(node);
          // save selector to cache
          idSelectorCache.put(template, frag);
        }
      }
    } else {
      // normal string template
      frag = stringToFragment(template);
    }
  } else if (template.nodeType) {
    // a direct node
    frag = nodeToFragment(template);
  }

  return frag && clone ? exports.clone(frag) : frag;
};
}, {"../util":6,"../cache":33}],
27: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var templateParser = require("../parsers/template");

/**
 * Process an element or a DocumentFragment based on a
 * instance option object. This allows us to transclude
 * a template node/fragment before the instance is created,
 * so the processed fragment can then be cloned and reused
 * in v-repeat.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

module.exports = function transclude(el, options) {
  // for template tags, what we want is its content as
  // a documentFragment (for block instances)
  if (el.tagName === "TEMPLATE") {
    el = templateParser.parse(el);
  }
  if (options && options.template) {
    el = transcludeTemplate(el, options);
  }
  if (el instanceof DocumentFragment) {
    _.prepend(document.createComment("v-start"), el);
    el.appendChild(document.createComment("v-end"));
  }
  return el;
};

/**
 * Process the template option.
 * If the replace option is true this will swap the $el.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transcludeTemplate(el, options) {
  var template = options.template;
  var frag = templateParser.parse(template, true);
  if (!frag) {
    _.warn("Invalid template option: " + template);
  } else {
    var rawContent = options._content || _.extractContent(el);
    if (options.replace) {
      if (frag.childNodes.length > 1) {
        transcludeContent(frag, rawContent);
        // TODO: store directives on placeholder node
        // and compile it somehow
        // probably only check for v-with, v-ref & paramAttributes
        return frag;
      } else {
        var replacer = frag.firstChild;
        _.copyAttributes(el, replacer);
        transcludeContent(replacer, rawContent);
        return replacer;
      }
    } else {
      el.appendChild(frag);
      transcludeContent(el, rawContent);
      return el;
    }
  }
}

/**
 * Resolve <content> insertion points mimicking the behavior
 * of the Shadow DOM spec:
 *
 *   http://w3c.github.io/webcomponents/spec/shadow/#insertion-points
 *
 * @param {Element|DocumentFragment} el
 * @param {Element} raw
 */

function transcludeContent(el, raw) {
  var outlets = getOutlets(el);
  var i = outlets.length;
  if (!i) {
    return;
  }var outlet, select, selected, j, main;
  // first pass, collect corresponding content
  // for each outlet.
  while (i--) {
    outlet = outlets[i];
    if (raw) {
      select = outlet.getAttribute("select");
      if (select) {
        // select content
        selected = raw.querySelectorAll(select);
        outlet.content = _.toArray(selected.length ? selected : outlet.childNodes);
      } else {
        // default content
        main = outlet;
      }
    } else {
      // fallback content
      outlet.content = _.toArray(outlet.childNodes);
    }
  }
  // second pass, actually insert the contents
  for (i = 0, j = outlets.length; i < j; i++) {
    outlet = outlets[i];
    if (outlet !== main) {
      insertContentAt(outlet, outlet.content);
    }
  }
  // finally insert the main content
  if (main) {
    insertContentAt(main, _.toArray(raw.childNodes));
  }
}

/**
 * Get <content> outlets from the element/list
 *
 * @param {Element|Array} el
 * @return {Array}
 */

var concat = [].concat;
function getOutlets(el) {
  return _.isArray(el) ? concat.apply([], el.map(getOutlets)) : el.querySelectorAll ? _.toArray(el.querySelectorAll("content")) : [];
}

/**
 * Insert an array of nodes at outlet,
 * then remove the outlet.
 *
 * @param {Element} outlet
 * @param {Array} contents
 */

function insertContentAt(outlet, contents) {
  // not using util DOM methods here because
  // parentNode can be cached
  var parent = outlet.parentNode;
  for (var i = 0, j = contents.length; i < j; i++) {
    parent.insertBefore(contents[i], outlet);
  }
  parent.removeChild(outlet);
}
}, {"../util":6,"../parsers/template":30}],
28: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var Cache = require("../cache");
var pathCache = new Cache(1000);
var identRE = /^[$_a-zA-Z]+[\w$]*$/;

/**
 * Path-parsing algorithm scooped from Polymer/observe-js
 */

var pathStateMachine = {
  beforePath: {
    ws: ["beforePath"],
    ident: ["inIdent", "append"],
    "[": ["beforeElement"],
    eof: ["afterPath"]
  },

  inPath: {
    ws: ["inPath"],
    ".": ["beforeIdent"],
    "[": ["beforeElement"],
    eof: ["afterPath"]
  },

  beforeIdent: {
    ws: ["beforeIdent"],
    ident: ["inIdent", "append"]
  },

  inIdent: {
    ident: ["inIdent", "append"],
    "0": ["inIdent", "append"],
    number: ["inIdent", "append"],
    ws: ["inPath", "push"],
    ".": ["beforeIdent", "push"],
    "[": ["beforeElement", "push"],
    eof: ["afterPath", "push"]
  },

  beforeElement: {
    ws: ["beforeElement"],
    "0": ["afterZero", "append"],
    number: ["inIndex", "append"],
    "'": ["inSingleQuote", "append", ""],
    "\"": ["inDoubleQuote", "append", ""]
  },

  afterZero: {
    ws: ["afterElement", "push"],
    "]": ["inPath", "push"]
  },

  inIndex: {
    "0": ["inIndex", "append"],
    number: ["inIndex", "append"],
    ws: ["afterElement"],
    "]": ["inPath", "push"]
  },

  inSingleQuote: {
    "'": ["afterElement"],
    eof: "error",
    "else": ["inSingleQuote", "append"]
  },

  inDoubleQuote: {
    "\"": ["afterElement"],
    eof: "error",
    "else": ["inDoubleQuote", "append"]
  },

  afterElement: {
    ws: ["afterElement"],
    "]": ["inPath", "push"]
  }
};

function noop() {}

/**
 * Determine the type of a character in a keypath.
 *
 * @param {Char} char
 * @return {String} type
 */

function getPathCharType(char) {
  if (char === undefined) {
    return "eof";
  }

  var code = char.charCodeAt(0);

  switch (code) {
    case 91: // [
    case 93: // ]
    case 46: // .
    case 34: // "
    case 39: // '
    case 48:
      // 0
      return char;

    case 95: // _
    case 36:
      // $
      return "ident";

    case 32: // Space
    case 9: // Tab
    case 10: // Newline
    case 13: // Return
    case 160: // No-break space
    case 65279: // Byte Order Mark
    case 8232: // Line Separator
    case 8233:
      // Paragraph Separator
      return "ws";
  }

  // a-z, A-Z
  if (97 <= code && code <= 122 || 65 <= code && code <= 90) {
    return "ident";
  }

  // 1-9
  if (49 <= code && code <= 57) {
    return "number";
  }

  return "else";
}

/**
 * Parse a string path into an array of segments
 * Todo implement cache
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parsePath(path) {
  var keys = [];
  var index = -1;
  var mode = "beforePath";
  var c, newChar, key, type, transition, action, typeMap;

  var actions = {
    push: function push() {
      if (key === undefined) {
        return;
      }
      keys.push(key);
      key = undefined;
    },
    append: function append() {
      if (key === undefined) {
        key = newChar;
      } else {
        key += newChar;
      }
    }
  };

  function maybeUnescapeQuote() {
    var nextChar = path[index + 1];
    if (mode === "inSingleQuote" && nextChar === "'" || mode === "inDoubleQuote" && nextChar === "\"") {
      index++;
      newChar = nextChar;
      actions.append();
      return true;
    }
  }

  while (mode) {
    index++;
    c = path[index];

    if (c === "\\" && maybeUnescapeQuote()) {
      continue;
    }

    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap["else"] || "error";

    if (transition === "error") {
      return; // parse error
    }

    mode = transition[0];
    action = actions[transition[1]] || noop;
    newChar = transition[2] === undefined ? c : transition[2];
    action();

    if (mode === "afterPath") {
      return keys;
    }
  }
}

/**
 * Format a accessor segment based on its type.
 *
 * @param {String} key
 * @return {Boolean}
 */

function formatAccessor(key) {
  if (identRE.test(key)) {
    // identifier
    return "." + key;
  } else if (+key === key >>> 0) {
    // bracket index
    return "[" + key + "]";
  } else {
    // bracket string
    return "[\"" + key.replace(/"/g, "\\\"") + "\"]";
  }
}

/**
 * Compiles a getter function with a fixed path.
 *
 * @param {Array} path
 * @return {Function}
 */

exports.compileGetter = function (path) {
  var body = "return o" + path.map(formatAccessor).join("");
  return new Function("o", body);
};

/**
 * External parse that check for a cache hit first
 *
 * @param {String} path
 * @return {Array|undefined}
 */

exports.parse = function (path) {
  var hit = pathCache.get(path);
  if (!hit) {
    hit = parsePath(path);
    if (hit) {
      hit.get = exports.compileGetter(hit);
      pathCache.put(path, hit);
    }
  }
  return hit;
};

/**
 * Get from an object from a path string
 *
 * @param {Object} obj
 * @param {String} path
 */

exports.get = function (obj, path) {
  path = exports.parse(path);
  if (path) {
    return path.get(obj);
  }
};

/**
 * Set on an object from a path
 *
 * @param {Object} obj
 * @param {String | Array} path
 * @param {*} val
 */

exports.set = function (obj, path, val) {
  if (typeof path === "string") {
    path = exports.parse(path);
  }
  if (!path || !_.isObject(obj)) {
    return false;
  }
  var last, key;
  for (var i = 0, l = path.length - 1; i < l; i++) {
    last = obj;
    key = path[i];
    obj = obj[key];
    if (!_.isObject(obj)) {
      obj = {};
      last.$add(key, obj);
    }
  }
  key = path[i];
  if (key in obj) {
    obj[key] = val;
  } else {
    obj.$add(key, val);
  }
  return true;
};
}, {"../util":6,"../cache":33}],
32: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var Path = require("./path");
var Cache = require("../cache");
var expressionCache = new Cache(1000);

var keywords = "Math,break,case,catch,continue,debugger,default," + "delete,do,else,false,finally,for,function,if,in," + "instanceof,new,null,return,switch,this,throw,true,try," + "typeof,var,void,while,with,undefined,abstract,boolean," + "byte,char,class,const,double,enum,export,extends," + "final,float,goto,implements,import,int,interface,long," + "native,package,private,protected,public,short,static," + "super,synchronized,throws,transient,volatile," + "arguments,let,yield";

var wsRE = /\s/g;
var newlineRE = /\n/g;
var saveRE = /[\{,]\s*[\w\$_]+\s*:|'[^']*'|"[^"]*"/g;
var restoreRE = /"(\d+)"/g;
var pathTestRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\])*$/;
var pathReplaceRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g;
var keywordsRE = new RegExp("^(" + keywords.replace(/,/g, "\\b|") + "\\b)");

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = [];

/**
 * Save replacer
 *
 * @param {String} str
 * @return {String} - placeholder with index
 */

function save(str) {
  var i = saved.length;
  saved[i] = str.replace(newlineRE, "\\n");
  return "\"" + i + "\"";
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite(raw) {
  var c = raw.charAt(0);
  var path = raw.slice(1);
  if (keywordsRE.test(path)) {
    return raw;
  } else {
    path = path.indexOf("\"") > -1 ? path.replace(restoreRE, restore) : path;
    return c + "scope." + path;
  }
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore(str, i) {
  return saved[i];
}

/**
 * Rewrite an expression, prefixing all path accessors with
 * `scope.` and generate getter/setter functions.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

function compileExpFns(exp, needSet) {
  // reset state
  saved.length = 0;
  // save strings and object literal keys
  var body = exp.replace(saveRE, save).replace(wsRE, "");
  // rewrite all paths
  // pad 1 space here becaue the regex matches 1 extra char
  body = (" " + body).replace(pathReplaceRE, rewrite).replace(restoreRE, restore);
  var getter = makeGetter(body);
  if (getter) {
    return {
      get: getter,
      body: body,
      set: needSet ? makeSetter(body) : null
    };
  }
}

/**
 * Compile getter setters for a simple path.
 *
 * @param {String} exp
 * @return {Function}
 */

function compilePathFns(exp) {
  var getter, path;
  if (exp.indexOf("[") < 0) {
    // really simple path
    path = exp.split(".");
    getter = Path.compileGetter(path);
  } else {
    // do the real parsing
    path = Path.parse(exp);
    getter = path.get;
  }
  return {
    get: getter,
    // always generate setter for simple paths
    set: function set(obj, val) {
      Path.set(obj, path, val);
    }
  };
}

/**
 * Build a getter function. Requires eval.
 *
 * We isolate the try/catch so it doesn't affect the
 * optimization of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeGetter(body) {
  try {
    return new Function("scope", "return " + body + ";");
  } catch (e) {
    _.warn("Invalid expression. " + "Generated function body: " + body);
  }
}

/**
 * Build a setter function.
 *
 * This is only needed in rare situations like "a[b]" where
 * a settable path requires dynamic evaluation.
 *
 * This setter function may throw error when called if the
 * expression body is not a valid left-hand expression in
 * assignment.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeSetter(body) {
  try {
    return new Function("scope", "value", body + "=value;");
  } catch (e) {
    _.warn("Invalid setter function body: " + body);
  }
}

/**
 * Check for setter existence on a cache hit.
 *
 * @param {Function} hit
 */

function checkSetter(hit) {
  if (!hit.set) {
    hit.set = makeSetter(hit.body);
  }
}

/**
 * Parse an expression into re-written getter/setters.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

exports.parse = function (exp, needSet) {
  exp = exp.trim();
  // try cache
  var hit = expressionCache.get(exp);
  if (hit) {
    if (needSet) {
      checkSetter(hit);
    }
    return hit;
  }
  // we do a simple path check to optimize for them.
  // the check fails valid paths with unusal whitespaces,
  // but that's too rare and we don't care.
  // also skip paths that start with global "Math"
  var res = pathTestRE.test(exp) && exp.slice(0, 5) !== "Math." ? compilePathFns(exp) : compileExpFns(exp, needSet);
  expressionCache.put(exp, res);
  return res;
};

// Export the pathRegex for external use
exports.pathTestRE = pathTestRE;
}, {"../util":6,"./path":28,"../cache":33}],
8: [function(require, module, exports) {
"use strict";

// manipulation directives
exports.text = require("./text");
exports.html = require("./html");
exports.attr = require("./attr");
exports.show = require("./show");
exports["class"] = require("./class");
exports.el = require("./el");
exports.ref = require("./ref");
exports.cloak = require("./cloak");
exports.style = require("./style");
exports.partial = require("./partial");
exports.transition = require("./transition");

// event listener directives
exports.on = require("./on");
exports.model = require("./model");

// child vm directives
exports.component = require("./component");
exports.repeat = require("./repeat");
exports["if"] = require("./if");

// child vm communication directives
exports["with"] = require("./with");
exports.events = require("./events");
}, {"./text":34,"./html":35,"./attr":36,"./show":37,"./class":38,"./el":39,"./ref":40,"./cloak":41,"./style":42,"./partial":43,"./transition":44,"./on":45,"./model":46,"./component":47,"./repeat":48,"./if":49,"./with":50,"./events":51}],
34: [function(require, module, exports) {
"use strict";

var _ = require("../util");

module.exports = {

  bind: function bind() {
    this.attr = this.el.nodeType === 3 ? "nodeValue" : "textContent";
  },

  update: function update(value) {
    this.el[this.attr] = _.toString(value);
  }

};
}, {"../util":6}],
35: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var templateParser = require("../parsers/template");

module.exports = {

  bind: function bind() {
    // a comment node means this is a binding for
    // {{{ inline unescaped html }}}
    if (this.el.nodeType === 8) {
      // hold nodes
      this.nodes = [];
    }
  },

  update: function update(value) {
    value = _.toString(value);
    if (this.nodes) {
      this.swap(value);
    } else {
      this.el.innerHTML = value;
    }
  },

  swap: function swap(value) {
    // remove old nodes
    var i = this.nodes.length;
    while (i--) {
      _.remove(this.nodes[i]);
    }
    // convert new value to a fragment
    // do not attempt to retrieve from id selector
    var frag = templateParser.parse(value, true, true);
    // save a reference to these nodes so we can remove later
    this.nodes = _.toArray(frag.childNodes);
    _.before(frag, this.el);
  }

};
}, {"../util":6,"../parsers/template":30}],
36: [function(require, module, exports) {
"use strict";

// xlink
var xlinkNS = "http://www.w3.org/1999/xlink";
var xlinkRE = /^xlink:/;

module.exports = {

  priority: 850,

  bind: function bind() {
    var name = this.arg;
    this.update = xlinkRE.test(name) ? xlinkHandler : defaultHandler;
  }

};

function defaultHandler(value) {
  if (value || value === 0) {
    this.el.setAttribute(this.arg, value);
  } else {
    this.el.removeAttribute(this.arg);
  }
}

function xlinkHandler(value) {
  if (value != null) {
    this.el.setAttributeNS(xlinkNS, this.arg, value);
  } else {
    this.el.removeAttributeNS(xlinkNS, "href");
  }
}
}, {}],
37: [function(require, module, exports) {
"use strict";

var transition = require("../transition");

module.exports = function (value) {
  var el = this.el;
  transition.apply(el, value ? 1 : -1, function () {
    el.style.display = value ? "" : "none";
  }, this.vm);
};
}, {"../transition":52}],
52: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var applyCSSTransition = require("./css");
var applyJSTransition = require("./js");

/**
 * Append with transition.
 *
 * @oaram {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.append = function (el, target, vm, cb) {
  apply(el, 1, function () {
    target.appendChild(el);
  }, vm, cb);
};

/**
 * InsertBefore with transition.
 *
 * @oaram {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.before = function (el, target, vm, cb) {
  apply(el, 1, function () {
    _.before(el, target);
  }, vm, cb);
};

/**
 * Remove with transition.
 *
 * @oaram {Element} el
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.remove = function (el, vm, cb) {
  apply(el, -1, function () {
    _.remove(el);
  }, vm, cb);
};

/**
 * Remove by appending to another parent with transition.
 * This is only used in block operations.
 *
 * @oaram {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.removeThenAppend = function (el, target, vm, cb) {
  apply(el, -1, function () {
    target.appendChild(el);
  }, vm, cb);
};

/**
 * Append the childNodes of a fragment to target.
 *
 * @param {DocumentFragment} block
 * @param {Node} target
 * @param {Vue} vm
 */

exports.blockAppend = function (block, target, vm) {
  var nodes = _.toArray(block.childNodes);
  for (var i = 0, l = nodes.length; i < l; i++) {
    exports.before(nodes[i], target, vm);
  }
};

/**
 * Remove a block of nodes between two edge nodes.
 *
 * @param {Node} start
 * @param {Node} end
 * @param {Vue} vm
 */

exports.blockRemove = function (start, end, vm) {
  var node = start.nextSibling;
  var next;
  while (node !== end) {
    next = node.nextSibling;
    exports.remove(node, vm);
    node = next;
  }
};

/**
 * Apply transitions with an operation callback.
 *
 * @oaram {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

var apply = exports.apply = function (el, direction, op, vm, cb) {
  var transData = el.__v_trans;
  if (!transData || !vm._isCompiled || vm.$parent && !vm.$parent._isCompiled) {
    op();
    if (cb) cb();
    return;
  }
  // determine the transition type on the element
  var jsTransition = transData.fns;
  if (jsTransition) {
    // js
    applyJSTransition(el, direction, op, transData, jsTransition, vm, cb);
  } else if (_.transitionEndEvent) {
    // css
    applyCSSTransition(el, direction, op, transData, cb);
  } else {
    // not applicable
    op();
    if (cb) cb();
  }
};

// if the vm is being manipulated by a parent directive
// during the parent's compilation phase, skip the
// animation.
}, {"../util":6,"./css":53,"./js":54}],
53: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var addClass = _.addClass;
var removeClass = _.removeClass;
var transDurationProp = _.transitionProp + "Duration";
var animDurationProp = _.animationProp + "Duration";

var queue = [];
var queued = false;

/**
 * Push a job into the transition queue, which is to be
 * executed on next frame.
 *
 * @param {Element} el    - target element
 * @param {Number} dir    - 1: enter, -1: leave
 * @param {Function} op   - the actual dom operation
 * @param {String} cls    - the className to remove when the
 *                          transition is done.
 * @param {Function} [cb] - user supplied callback.
 */

function push(el, dir, op, cls, cb) {
  queue.push({
    el: el,
    dir: dir,
    cb: cb,
    cls: cls,
    op: op
  });
  if (!queued) {
    queued = true;
    _.nextTick(flush);
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush() {
  /* jshint unused: false */
  var f = document.documentElement.offsetHeight;
  queue.forEach(run);
  queue = [];
  queued = false;
}

/**
 * Run a transition job.
 *
 * @param {Object} job
 */

function run(job) {

  var el = job.el;
  var data = el.__v_trans;
  var cls = job.cls;
  var cb = job.cb;
  var op = job.op;
  var transitionType = getTransitionType(el, data, cls);

  if (job.dir > 0) {
    // ENTER
    if (transitionType === 1) {
      // trigger transition by removing enter class
      removeClass(el, cls);
      // only need to listen for transitionend if there's
      // a user callback
      if (cb) setupTransitionCb(_.transitionEndEvent);
    } else if (transitionType === 2) {
      // animations are triggered when class is added
      // so we just listen for animationend to remove it.
      setupTransitionCb(_.animationEndEvent, function () {
        removeClass(el, cls);
      });
    } else {
      // no transition applicable
      removeClass(el, cls);
      if (cb) cb();
    }
  } else {
    // LEAVE
    if (transitionType) {
      // leave transitions/animations are both triggered
      // by adding the class, just remove it on end event.
      var event = transitionType === 1 ? _.transitionEndEvent : _.animationEndEvent;
      setupTransitionCb(event, function () {
        op();
        removeClass(el, cls);
      });
    } else {
      op();
      removeClass(el, cls);
      if (cb) cb();
    }
  }

  /**
   * Set up a transition end callback, store the callback
   * on the element's __v_trans data object, so we can
   * clean it up if another transition is triggered before
   * the callback is fired.
   *
   * @param {String} event
   * @param {Function} [cleanupFn]
   */

  function setupTransitionCb(event, cleanupFn) {
    data.event = event;
    var onEnd = data.callback = function transitionCb(e) {
      if (e.target === el) {
        _.off(el, event, onEnd);
        data.event = data.callback = null;
        if (cleanupFn) cleanupFn();
        if (cb) cb();
      }
    };
    _.on(el, event, onEnd);
  }
}

/**
 * Get an element's transition type based on the
 * calculated styles
 *
 * @param {Element} el
 * @param {Object} data
 * @param {String} className
 * @return {Number}
 *         1 - transition
 *         2 - animation
 */

function getTransitionType(el, data, className) {
  var type = data.cache && data.cache[className];
  if (type) {
    return type;
  }var inlineStyles = el.style;
  var computedStyles = window.getComputedStyle(el);
  var transDuration = inlineStyles[transDurationProp] || computedStyles[transDurationProp];
  if (transDuration && transDuration !== "0s") {
    type = 1;
  } else {
    var animDuration = inlineStyles[animDurationProp] || computedStyles[animDurationProp];
    if (animDuration && animDuration !== "0s") {
      type = 2;
    }
  }
  if (type) {
    if (!data.cache) data.cache = {};
    data.cache[className] = type;
  }
  return type;
}

/**
 * Apply CSS transition to an element.
 *
 * @param {Element} el
 * @param {Number} direction - 1: enter, -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Object} data - target element's transition data
 */

module.exports = function (el, direction, op, data, cb) {
  var prefix = data.id || "v";
  var enterClass = prefix + "-enter";
  var leaveClass = prefix + "-leave";
  // clean up potential previous unfinished transition
  if (data.callback) {
    _.off(el, data.event, data.callback);
    removeClass(el, enterClass);
    removeClass(el, leaveClass);
    data.event = data.callback = null;
  }
  if (direction > 0) {
    // enter
    addClass(el, enterClass);
    op();
    push(el, direction, null, enterClass, cb);
  } else {
    // leave
    addClass(el, leaveClass);
    push(el, direction, op, leaveClass, cb);
  }
};
}, {"../util":6}],
54: [function(require, module, exports) {
"use strict";

/**
 * Apply JavaScript enter/leave functions.
 *
 * @param {Element} el
 * @param {Number} direction - 1: enter, -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Object} data - target element's transition data
 * @param {Object} def - transition definition object
 * @param {Vue} vm - the owner vm of the element
 * @param {Function} [cb]
 */

module.exports = function (el, direction, op, data, def, vm, cb) {
  if (data.cancel) {
    data.cancel();
    data.cancel = null;
  }
  if (direction > 0) {
    // enter
    if (def.beforeEnter) {
      def.beforeEnter.call(vm, el);
    }
    op();
    if (def.enter) {
      data.cancel = def.enter.call(vm, el, function () {
        data.cancel = null;
        if (cb) cb();
      });
    } else if (cb) {
      cb();
    }
  } else {
    // leave
    if (def.leave) {
      data.cancel = def.leave.call(vm, el, function () {
        data.cancel = null;
        op();
        if (cb) cb();
      });
    } else {
      op();
      if (cb) cb();
    }
  }
};
}, {}],
38: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var addClass = _.addClass;
var removeClass = _.removeClass;

module.exports = function (value) {
  if (this.arg) {
    var method = value ? addClass : removeClass;
    method(this.el, this.arg);
  } else {
    if (this.lastVal) {
      removeClass(this.el, this.lastVal);
    }
    if (value) {
      addClass(this.el, value);
      this.lastVal = value;
    }
  }
};
}, {"../util":6}],
39: [function(require, module, exports) {
"use strict";

module.exports = {

  isLiteral: true,

  bind: function bind() {
    this.vm.$$[this.expression] = this.el;
  },

  unbind: function unbind() {
    delete this.vm.$$[this.expression];
  }

};
}, {}],
40: [function(require, module, exports) {
"use strict";

var _ = require("../util");

module.exports = {

  isLiteral: true,

  bind: function bind() {
    var vm = this.el.__vue__;
    if (!vm) {
      _.warn("v-ref should only be used on a component root element.");
      return;
    }
    // If we get here, it means this is a `v-ref` on a
    // child, because parent scope `v-ref` is stripped in
    // `v-component` already. So we just record our own ref
    // here - it will overwrite parent ref in `v-component`,
    // if any.
    vm._refID = this.expression;
  }

};
}, {"../util":6}],
41: [function(require, module, exports) {
"use strict";

var config = require("../config");

module.exports = {

  bind: function bind() {
    var el = this.el;
    this.vm.$once("hook:compiled", function () {
      el.removeAttribute(config.prefix + "cloak");
    });
  }

};
}, {"../config":24}],
42: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var prefixes = ["-webkit-", "-moz-", "-ms-"];
var camelPrefixes = ["Webkit", "Moz", "ms"];
var importantRE = /!important;?$/;
var camelRE = /([a-z])([A-Z])/g;
var testEl = null;
var propCache = {};

module.exports = {

  deep: true,

  update: function update(value) {
    if (this.arg) {
      this.setProp(this.arg, value);
    } else {
      if (typeof value === "object") {
        // cache object styles so that only changed props
        // are actually updated.
        if (!this.cache) this.cache = {};
        for (var prop in value) {
          this.setProp(prop, value[prop]);
          /* jshint eqeqeq: false */
          if (value[prop] != this.cache[prop]) {
            this.cache[prop] = value[prop];
            this.setProp(prop, value[prop]);
          }
        }
      } else {
        this.el.style.cssText = value;
      }
    }
  },

  setProp: function setProp(prop, value) {
    prop = normalize(prop);
    if (!prop) {
      return;
    } // unsupported prop
    // cast possible numbers/booleans into strings
    if (value != null) value += "";
    if (value) {
      var isImportant = importantRE.test(value) ? "important" : "";
      if (isImportant) {
        value = value.replace(importantRE, "").trim();
      }
      this.el.style.setProperty(prop, value, isImportant);
    } else {
      this.el.style.removeProperty(prop);
    }
  }

};

/**
 * Normalize a CSS property name.
 * - cache result
 * - auto prefix
 * - camelCase -> dash-case
 *
 * @param {String} prop
 * @return {String}
 */

function normalize(prop) {
  if (propCache[prop]) {
    return propCache[prop];
  }
  var res = prefix(prop);
  propCache[prop] = propCache[res] = res;
  return res;
}

/**
 * Auto detect the appropriate prefix for a CSS property.
 * https://gist.github.com/paulirish/523692
 *
 * @param {String} prop
 * @return {String}
 */

function prefix(prop) {
  prop = prop.replace(camelRE, "$1-$2").toLowerCase();
  var camel = _.camelize(prop);
  var upper = camel.charAt(0).toUpperCase() + camel.slice(1);
  if (!testEl) {
    testEl = document.createElement("div");
  }
  if (camel in testEl.style) {
    return prop;
  }
  var i = prefixes.length;
  var prefixed;
  while (i--) {
    prefixed = camelPrefixes[i] + upper;
    if (prefixed in testEl.style) {
      return prefixes[i] + prop;
    }
  }
}
}, {"../util":6}],
43: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var templateParser = require("../parsers/template");
var vIf = require("./if");

module.exports = {

  isLiteral: true,

  // same logic reuse from v-if
  compile: vIf.compile,
  teardown: vIf.teardown,

  bind: function bind() {
    var el = this.el;
    this.start = document.createComment("v-partial-start");
    this.end = document.createComment("v-partial-end");
    if (el.nodeType !== 8) {
      el.innerHTML = "";
    }
    if (el.tagName === "TEMPLATE" || el.nodeType === 8) {
      _.replace(el, this.end);
    } else {
      el.appendChild(this.end);
    }
    _.before(this.start, this.end);
    if (!this._isDynamicLiteral) {
      this.insert(this.expression);
    }
  },

  update: function update(id) {
    this.teardown();
    this.insert(id);
  },

  insert: function insert(id) {
    var partial = this.vm.$options.partials[id];
    _.assertAsset(partial, "partial", id);
    if (partial) {
      this.compile(templateParser.parse(partial));
    }
  }

};
}, {"../util":6,"../parsers/template":30,"./if":49}],
49: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var compile = require("../compiler/compile");
var templateParser = require("../parsers/template");
var transition = require("../transition");

module.exports = {

  bind: function bind() {
    var el = this.el;
    if (!el.__vue__) {
      this.start = document.createComment("v-if-start");
      this.end = document.createComment("v-if-end");
      _.replace(el, this.end);
      _.before(this.start, this.end);
      if (el.tagName === "TEMPLATE") {
        this.template = templateParser.parse(el, true);
      } else {
        this.template = document.createDocumentFragment();
        this.template.appendChild(el);
      }
      // compile the nested partial
      this.linker = compile(this.template, this.vm.$options, true);
    } else {
      this.invalid = true;
      _.warn("v-if=\"" + this.expression + "\" cannot be " + "used on an already mounted instance.");
    }
  },

  update: function update(value) {
    if (this.invalid) {
      return;
    }if (value) {
      this.insert();
    } else {
      this.teardown();
    }
  },

  insert: function insert() {
    // avoid duplicate inserts, since update() can be
    // called with different truthy values
    if (!this.unlink) {
      this.compile(this.template);
    }
  },

  compile: function compile(template) {
    var vm = this.vm;
    var frag = templateParser.clone(template);
    var originalChildLength = vm._children.length;
    this.unlink = this.linker ? this.linker(vm, frag) : vm.$compile(frag);
    transition.blockAppend(frag, this.end, vm);
    this.children = vm._children.slice(originalChildLength);
    if (this.children.length && _.inDoc(vm.$el)) {
      this.children.forEach(function (child) {
        child._callHook("attached");
      });
    }
  },

  teardown: function teardown() {
    if (!this.unlink) {
      return;
    }transition.blockRemove(this.start, this.end, this.vm);
    if (this.children && _.inDoc(this.vm.$el)) {
      this.children.forEach(function (child) {
        if (!child._isDestroyed) {
          child._callHook("detached");
        }
      });
    }
    this.unlink();
    this.unlink = null;
  }

};
}, {"../util":6,"../compiler/compile":26,"../parsers/template":30,"../transition":52}],
44: [function(require, module, exports) {
"use strict";

module.exports = {

  priority: 1000,
  isLiteral: true,

  bind: function bind() {
    this.el.__v_trans = {
      id: this.expression,
      // resolve the custom transition functions now
      fns: this.vm.$options.transitions[this.expression]
    };
  }

};
}, {}],
45: [function(require, module, exports) {
"use strict";

var _ = require("../util");

module.exports = {

  acceptStatement: true,
  priority: 700,

  bind: function bind() {
    // deal with iframes
    if (this.el.tagName === "IFRAME" && this.arg !== "load") {
      var self = this;
      this.iframeBind = function () {
        _.on(self.el.contentWindow, self.arg, self.handler);
      };
      _.on(this.el, "load", this.iframeBind);
    }
  },

  update: function update(handler) {
    if (typeof handler !== "function") {
      _.warn("Directive \"v-on:" + this.expression + "\" " + "expects a function value.");
      return;
    }
    this.reset();
    var vm = this.vm;
    this.handler = function (e) {
      e.targetVM = vm;
      vm.$event = e;
      var res = handler(e);
      vm.$event = null;
      return res;
    };
    if (this.iframeBind) {
      this.iframeBind();
    } else {
      _.on(this.el, this.arg, this.handler);
    }
  },

  reset: function reset() {
    var el = this.iframeBind ? this.el.contentWindow : this.el;
    if (this.handler) {
      _.off(el, this.arg, this.handler);
    }
  },

  unbind: function unbind() {
    this.reset();
    _.off(this.el, "load", this.iframeBind);
  }
};
}, {"../util":6}],
46: [function(require, module, exports) {
"use strict";

var _ = require("../../util");

var handlers = {
  _default: require("./default"),
  radio: require("./radio"),
  select: require("./select"),
  checkbox: require("./checkbox")
};

module.exports = {

  priority: 800,
  twoWay: true,
  handlers: handlers,

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   *     - TODO: more types may be supplied as a plugin
   */

  bind: function bind() {
    // friendly warning...
    var filters = this.filters;
    if (filters && filters.read && !filters.write) {
      _.warn("It seems you are using a read-only filter with " + "v-model. You might want to use a two-way filter " + "to ensure correct behavior.");
    }
    var el = this.el;
    var tag = el.tagName;
    var handler;
    if (tag === "INPUT") {
      handler = handlers[el.type] || handlers._default;
    } else if (tag === "SELECT") {
      handler = handlers.select;
    } else if (tag === "TEXTAREA") {
      handler = handlers._default;
    } else {
      _.warn("v-model doesn't support element type: " + tag);
      return;
    }
    handler.bind.call(this);
    this.update = handler.update;
    this.unbind = handler.unbind;
  }

};
}, {"../../util":6,"./default":55,"./radio":56,"./select":57,"./checkbox":58}],
55: [function(require, module, exports) {
"use strict";

var _ = require("../../util");

module.exports = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    // check params
    // - lazy: update model on "change" instead of "input"
    var lazy = this._checkParam("lazy") != null;
    // - number: cast value into number when updating model.
    var number = this._checkParam("number") != null;

    // handle composition events.
    // http://blog.evanyou.me/2014/01/03/composition-event/
    var cpLocked = false;
    this.cpLock = function () {
      cpLocked = true;
    };
    this.cpUnlock = function () {
      cpLocked = false;
      // in IE11 the "compositionend" event fires AFTER
      // the "input" event, so the input handler is blocked
      // at the end... have to call it here.
      set();
    };
    _.on(el, "compositionstart", this.cpLock);
    _.on(el, "compositionend", this.cpUnlock);

    // shared setter
    function set() {
      self.set(number ? _.toNumber(el.value) : el.value, true);
    }

    // if the directive has filters, we need to
    // record cursor position and restore it after updating
    // the input with the filtered value.
    // also force update for type="range" inputs to enable
    // "lock in range" (see #506)
    this.listener = this.filters || el.type === "range" ? function textInputListener() {
      if (cpLocked) {
        return;
      }var charsOffset;
      // some HTML5 input types throw error here
      try {
        // record how many chars from the end of input
        // the cursor was at
        charsOffset = el.value.length - el.selectionStart;
      } catch (e) {}
      // Fix IE10/11 infinite update cycle
      // https://github.com/yyx990803/vue/issues/592
      /* istanbul ignore if */
      if (charsOffset < 0) {
        return;
      }
      set();
      _.nextTick(function () {
        // force a value update, because in
        // certain cases the write filters output the
        // same result for different input values, and
        // the Observer set events won't be triggered.
        var newVal = self._watcher.value;
        self.update(newVal);
        if (charsOffset != null) {
          var cursorPos = _.toString(newVal).length - charsOffset;
          el.setSelectionRange(cursorPos, cursorPos);
        }
      });
    } : function textInputListener() {
      if (cpLocked) {
        return;
      }set();
    };

    this.event = lazy ? "change" : "input";
    _.on(el, this.event, this.listener);

    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && _.isIE9) {
      this.onCut = function () {
        _.nextTick(self.listener);
      };
      this.onDel = function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener();
        }
      };
      _.on(el, "cut", this.onCut);
      _.on(el, "keyup", this.onDel);
    }

    // set initial value if present
    if (el.hasAttribute("value") || el.tagName === "TEXTAREA" && el.value.trim()) {
      this._initValue = number ? _.toNumber(el.value) : el.value;
    }
  },

  update: function update(value) {
    this.el.value = _.toString(value);
  },

  unbind: function unbind() {
    var el = this.el;
    _.off(el, this.event, this.listener);
    _.off(el, "compositionstart", this.cpLock);
    _.off(el, "compositionend", this.cpUnlock);
    if (this.onCut) {
      _.off(el, "cut", this.onCut);
      _.off(el, "keyup", this.onDel);
    }
  }

};
}, {"../../util":6}],
56: [function(require, module, exports) {
"use strict";

var _ = require("../../util");

module.exports = {

  bind: function bind() {
    var self = this;
    var el = this.el;
    this.listener = function () {
      self.set(el.value, true);
    };
    _.on(el, "change", this.listener);
    if (el.checked) {
      this._initValue = el.value;
    }
  },

  update: function update(value) {
    /* jshint eqeqeq: false */
    this.el.checked = value == this.el.value;
  },

  unbind: function unbind() {
    _.off(this.el, "change", this.listener);
  }

};
}, {"../../util":6}],
57: [function(require, module, exports) {
"use strict";

var _ = require("../../util");
var Watcher = require("../../watcher");

module.exports = {

  bind: function bind() {
    var self = this;
    var el = this.el;
    // check options param
    var optionsParam = this._checkParam("options");
    if (optionsParam) {
      initOptions.call(this, optionsParam);
    }
    this.number = this._checkParam("number") != null;
    this.multiple = el.hasAttribute("multiple");
    this.listener = function () {
      var value = self.multiple ? getMultiValue(el) : el.value;
      value = self.number ? _.toNumber(value) : value;
      self.set(value, true);
    };
    _.on(el, "change", this.listener);
    checkInitialValue.call(this);
  },

  update: function update(value) {
    /* jshint eqeqeq: false */
    var el = this.el;
    el.selectedIndex = -1;
    var multi = this.multiple && _.isArray(value);
    var options = el.options;
    var i = options.length;
    var option;
    while (i--) {
      option = options[i];
      option.selected = multi ? indexOf(value, option.value) > -1 : value == option.value;
    }
  },

  unbind: function unbind() {
    _.off(this.el, "change", this.listener);
    if (this.optionWatcher) {
      this.optionWatcher.teardown();
    }
  }

};

/**
 * Initialize the option list from the param.
 *
 * @param {String} expression
 */

function initOptions(expression) {
  var self = this;
  function optionUpdateWatcher(value) {
    if (_.isArray(value)) {
      self.el.innerHTML = "";
      buildOptions(self.el, value);
      if (self._watcher) {
        self.update(self._watcher.value);
      }
    } else {
      _.warn("Invalid options value for v-model: " + value);
    }
  }
  this.optionWatcher = new Watcher(this.vm, expression, optionUpdateWatcher, { deep: true });
  // update with initial value
  optionUpdateWatcher(this.optionWatcher.value);
}

/**
 * Build up option elements. IE9 doesn't create options
 * when setting innerHTML on <select> elements, so we have
 * to use DOM API here.
 *
 * @param {Element} parent - a <select> or an <optgroup>
 * @param {Array} options
 */

function buildOptions(parent, options) {
  var op, el;
  for (var i = 0, l = options.length; i < l; i++) {
    op = options[i];
    if (!op.options) {
      el = document.createElement("option");
      if (typeof op === "string") {
        el.text = el.value = op;
      } else {
        el.text = op.text;
        el.value = op.value;
      }
    } else {
      el = document.createElement("optgroup");
      el.label = op.label;
      buildOptions(el, op.options);
    }
    parent.appendChild(el);
  }
}

/**
 * Check the initial value for selected options.
 */

function checkInitialValue() {
  var initValue;
  var options = this.el.options;
  for (var i = 0, l = options.length; i < l; i++) {
    if (options[i].hasAttribute("selected")) {
      if (this.multiple) {
        (initValue || (initValue = [])).push(options[i].value);
      } else {
        initValue = options[i].value;
      }
    }
  }
  if (initValue) {
    this._initValue = this.number ? _.toNumber(initValue) : initValue;
  }
}

/**
 * Helper to extract a value array for select[multiple]
 *
 * @param {SelectElement} el
 * @return {Array}
 */

function getMultiValue(el) {
  return Array.prototype.filter.call(el.options, filterSelected).map(getOptionValue);
}

function filterSelected(op) {
  return op.selected;
}

function getOptionValue(op) {
  return op.value || op.text;
}

/**
 * Native Array.indexOf uses strict equal, but in this
 * case we need to match string/numbers with soft equal.
 *
 * @param {Array} arr
 * @param {*} val
 */

function indexOf(arr, val) {
  /* jshint eqeqeq: false */
  var i = arr.length;
  while (i--) {
    if (arr[i] == val) {
      return i;
    }
  }
  return -1;
}
}, {"../../util":6,"../../watcher":59}],
59: [function(require, module, exports) {
"use strict";

var _ = require("./util");
var config = require("./config");
var Observer = require("./observer");
var expParser = require("./parsers/expression");
var batcher = require("./batcher");
var uid = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String} expression
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 * @constructor
 */

function Watcher(vm, expression, cb, options) {
  this.vm = vm;
  vm._watcherList.push(this);
  this.expression = expression;
  this.cbs = [cb];
  this.id = ++uid; // uid for batching
  this.active = true;
  options = options || {};
  this.deep = options.deep;
  this.user = options.user;
  this.deps = Object.create(null);
  // setup filters if any.
  // We delegate directive filters here to the watcher
  // because they need to be included in the dependency
  // collection process.
  if (options.filters) {
    this.readFilters = options.filters.read;
    this.writeFilters = options.filters.write;
  }
  // parse expression for getter/setter
  var res = expParser.parse(expression, options.twoWay);
  this.getter = res.get;
  this.setter = res.set;
  this.value = this.get();
}

var p = Watcher.prototype;

/**
 * Add a dependency to this directive.
 *
 * @param {Dep} dep
 */

p.addDep = function (dep) {
  var id = dep.id;
  if (!this.newDeps[id]) {
    this.newDeps[id] = dep;
    if (!this.deps[id]) {
      this.deps[id] = dep;
      dep.addSub(this);
    }
  }
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */

p.get = function () {
  this.beforeGet();
  var vm = this.vm;
  var value;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (config.warnExpressionErrors) {
      _.warn("Error when evaluating expression \"" + this.expression + "\":\n   " + e);
    }
  }
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value);
  }
  value = _.applyFilters(value, this.readFilters, vm);
  this.afterGet();
  return value;
};

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

p.set = function (value) {
  var vm = this.vm;
  value = _.applyFilters(value, this.writeFilters, vm, this.value);
  try {
    this.setter.call(vm, vm, value);
  } catch (e) {
    if (config.warnExpressionErrors) {
      _.warn("Error when evaluating setter \"" + this.expression + "\":\n   " + e);
    }
  }
};

/**
 * Prepare for dependency collection.
 */

p.beforeGet = function () {
  Observer.target = this;
  this.newDeps = {};
};

/**
 * Clean up for dependency collection.
 */

p.afterGet = function () {
  Observer.target = null;
  for (var id in this.deps) {
    if (!this.newDeps[id]) {
      this.deps[id].removeSub(this);
    }
  }
  this.deps = this.newDeps;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */

p.update = function () {
  if (!config.async || config.debug) {
    this.run();
  } else {
    batcher.push(this);
  }
};

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

p.run = function () {
  if (this.active) {
    var value = this.get();
    if (value !== this.value || Array.isArray(value) || this.deep) {
      var oldValue = this.value;
      this.value = value;
      var cbs = this.cbs;
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i](value, oldValue);
        // if a callback also removed other callbacks,
        // we need to adjust the loop accordingly.
        var removed = l - cbs.length;
        if (removed) {
          i -= removed;
          l -= removed;
        }
      }
    }
  }
};

/**
 * Add a callback.
 *
 * @param {Function} cb
 */

p.addCb = function (cb) {
  this.cbs.push(cb);
};

/**
 * Remove a callback.
 *
 * @param {Function} cb
 */

p.removeCb = function (cb) {
  var cbs = this.cbs;
  if (cbs.length > 1) {
    var i = cbs.indexOf(cb);
    if (i > -1) {
      cbs.splice(i, 1);
    }
  } else if (cb === cbs[0]) {
    this.teardown();
  }
};

/**
 * Remove self from all dependencies' subcriber list.
 */

p.teardown = function () {
  if (this.active) {
    // remove self from vm's watcher list
    // we can skip this if the vm if being destroyed
    // which can improve teardown performance.
    if (!this.vm._isBeingDestroyed) {
      var list = this.vm._watcherList;
      list.splice(list.indexOf(this));
    }
    for (var id in this.deps) {
      this.deps[id].removeSub(this);
    }
    this.active = false;
    this.vm = this.cbs = this.value = null;
  }
};

/**
 * Recrusively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 *
 * @param {Object} obj
 */

function traverse(obj) {
  var key, val, i;
  for (key in obj) {
    val = obj[key];
    if (_.isArray(val)) {
      i = val.length;
      while (i--) traverse(val[i]);
    } else if (_.isObject(val)) {
      traverse(val);
    }
  }
}

module.exports = Watcher;
}, {"./util":6,"./config":24,"./observer":60,"./parsers/expression":32,"./batcher":61}],
60: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var config = require("../config");
var Dep = require("./dep");
var arrayMethods = require("./array");
var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
require("./object");

var uid = 0;

/**
 * Type enums
 */

var ARRAY = 0;
var OBJECT = 1;

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function protoAugment(target, src) {
  target.__proto__ = src;
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function copyAugment(target, src, keys) {
  var i = keys.length;
  var key;
  while (i--) {
    key = keys[i];
    _.define(target, key, src[key]);
  }
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 *
 * @param {Array|Object} value
 * @param {Number} type
 * @constructor
 */

function Observer(value, type) {
  this.id = ++uid;
  this.value = value;
  this.active = true;
  this.deps = [];
  _.define(value, "__ob__", this);
  if (type === ARRAY) {
    var augment = config.proto && _.hasProto ? protoAugment : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else if (type === OBJECT) {
    this.walk(value);
  }
}

Observer.target = null;

var p = Observer.prototype;

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @return {Observer|undefined}
 * @static
 */

Observer.create = function (value) {
  if (value && value.hasOwnProperty("__ob__") && value.__ob__ instanceof Observer) {
    return value.__ob__;
  } else if (_.isArray(value)) {
    return new Observer(value, ARRAY);
  } else if (_.isPlainObject(value) && !value._isVue // avoid Vue instance
  ) {
    return new Observer(value, OBJECT);
  }
};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object. Properties prefixed with `$` or `_`
 * and accessor properties are ignored.
 *
 * @param {Object} obj
 */

p.walk = function (obj) {
  var keys = Object.keys(obj);
  var i = keys.length;
  var key, prefix;
  while (i--) {
    key = keys[i];
    prefix = key.charCodeAt(0);
    if (prefix !== 36 && prefix !== 95) {
      // skip $ or _
      this.convert(key, obj[key]);
    }
  }
};

/**
 * Try to carete an observer for a child value,
 * and if value is array, link dep to the array.
 *
 * @param {*} val
 * @return {Dep|undefined}
 */

p.observe = function (val) {
  return Observer.create(val);
};

/**
 * Observe a list of Array items.
 *
 * @param {Array} items
 */

p.observeArray = function (items) {
  var i = items.length;
  while (i--) {
    this.observe(items[i]);
  }
};

/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

p.convert = function (key, val) {
  var ob = this;
  var childOb = ob.observe(val);
  var dep = new Dep();
  if (childOb) {
    childOb.deps.push(dep);
  }
  Object.defineProperty(ob.value, key, {
    enumerable: true,
    configurable: true,
    get: function get() {
      // Observer.target is a watcher whose getter is
      // currently being evaluated.
      if (ob.active && Observer.target) {
        Observer.target.addDep(dep);
      }
      return val;
    },
    set: function set(newVal) {
      if (newVal === val) {
        return;
      } // remove dep from old value
      var oldChildOb = val && val.__ob__;
      if (oldChildOb) {
        var oldDeps = oldChildOb.deps;
        oldDeps.splice(oldDeps.indexOf(dep), 1);
      }
      val = newVal;
      // add dep to new value
      var newChildOb = ob.observe(newVal);
      if (newChildOb) {
        newChildOb.deps.push(dep);
      }
      dep.notify();
    }
  });
};

/**
 * Notify change on all self deps on an observer.
 * This is called when a mutable value mutates. e.g.
 * when an Array's mutating methods are called, or an
 * Object's $add/$delete are called.
 */

p.notify = function () {
  var deps = this.deps;
  for (var i = 0, l = deps.length; i < l; i++) {
    deps[i].notify();
  }
};

/**
 * Add an owner vm, so that when $add/$delete mutations
 * happen we can notify owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 *
 * @param {Vue} vm
 */

p.addVm = function (vm) {
  (this.vms = this.vms || []).push(vm);
};

/**
 * Remove an owner vm. This is called when the object is
 * swapped out as an instance's $data object.
 *
 * @param {Vue} vm
 */

p.removeVm = function (vm) {
  this.vms.splice(this.vms.indexOf(vm), 1);
};

module.exports = Observer;
}, {"../util":6,"../config":24,"./dep":62,"./array":63,"./object":64}],
62: [function(require, module, exports) {
"use strict";

var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @constructor
 */

function Dep() {
  this.id = ++uid;
  this.subs = [];
}

var p = Dep.prototype;

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

p.addSub = function (sub) {
  this.subs.push(sub);
};

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

p.removeSub = function (sub) {
  if (this.subs.length) {
    var i = this.subs.indexOf(sub);
    if (i > -1) this.subs.splice(i, 1);
  }
};

/**
 * Notify all subscribers of a new value.
 */

p.notify = function () {
  for (var i = 0, subs = this.subs; i < subs.length; i++) {
    subs[i].update();
  }
};

module.exports = Dep;
}, {}],
63: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */

;["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  _.define(arrayMethods, method, function mutator() {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case "push":
        inserted = args;
        break;
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.notify();
    return result;
  });
});

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

_.define(arrayProto, "$set", function $set(index, val) {
  if (index >= this.length) {
    this.length = index + 1;
  }
  return this.splice(index, 1, val)[0];
});

/**
 * Convenience method to remove the element at given index.
 *
 * @param {Number} index
 * @param {*} val
 */

_.define(arrayProto, "$remove", function $remove(index) {
  if (typeof index !== "number") {
    index = this.indexOf(index);
  }
  if (index > -1) {
    return this.splice(index, 1)[0];
  }
});

module.exports = arrayMethods;
}, {"../util":6}],
64: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var objProto = Object.prototype;

/**
 * Add a new property to an observed object
 * and emits corresponding event
 *
 * @param {String} key
 * @param {*} val
 * @public
 */

_.define(objProto, "$add", function $add(key, val) {
  if (this.hasOwnProperty(key)) {
    return;
  }var ob = this.__ob__;
  if (!ob || _.isReserved(key)) {
    this[key] = val;
    return;
  }
  ob.convert(key, val);
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._proxy(key);
      vm._digest();
    }
  } else {
    ob.notify();
  }
});

/**
 * Deletes a property from an observed object
 * and emits corresponding event
 *
 * @param {String} key
 * @public
 */

_.define(objProto, "$delete", function $delete(key) {
  if (!this.hasOwnProperty(key)) {
    return;
  }delete this[key];
  var ob = this.__ob__;
  if (!ob || _.isReserved(key)) {
    return;
  }
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._unproxy(key);
      vm._digest();
    }
  } else {
    ob.notify();
  }
});
}, {"../util":6}],
61: [function(require, module, exports) {
"use strict";

var _ = require("./util");
var MAX_UPDATE_COUNT = 10;

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.
var queue = [];
var userQueue = [];
var has = {};
var waiting = false;
var flushing = false;

/**
 * Reset the batcher's state.
 */

function reset() {
  queue = [];
  userQueue = [];
  has = {};
  waiting = false;
  flushing = false;
}

/**
 * Flush both queues and run the jobs.
 */

function flush() {
  flushing = true;
  run(queue);
  run(userQueue);
  reset();
}

/**
 * Run the jobs in a single queue.
 *
 * @param {Array} queue
 */

function run(queue) {
  // do not cache length because more jobs might be pushed
  // as we run existing jobs
  for (var i = 0; i < queue.length; i++) {
    queue[i].run();
  }
}

/**
 * Push a job into the job queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Object} job
 *   properties:
 *   - {String|Number} id
 *   - {Function}      run
 */

exports.push = function (job) {
  var id = job.id;
  if (!id || !has[id] || flushing) {
    if (!has[id]) {
      has[id] = 1;
    } else {
      has[id]++;
      // detect possible infinite update loops
      if (has[id] > MAX_UPDATE_COUNT) {
        _.warn("You may have an infinite update loop for the " + "watcher with expression: \"" + job.expression + "\".");
        return;
      }
    }
    // A user watcher callback could trigger another
    // directive update during the flushing; at that time
    // the directive queue would already have been run, so
    // we call that update immediately as it is pushed.
    if (flushing && !job.user) {
      job.run();
      return;
    }
    ;(job.user ? userQueue : queue).push(job);
    if (!waiting) {
      waiting = true;
      _.nextTick(flush);
    }
  }
};
}, {"./util":6}],
58: [function(require, module, exports) {
"use strict";

var _ = require("../../util");

module.exports = {

  bind: function bind() {
    var self = this;
    var el = this.el;
    this.listener = function () {
      self.set(el.checked, true);
    };
    _.on(el, "change", this.listener);
    if (el.checked) {
      this._initValue = el.checked;
    }
  },

  update: function update(value) {
    this.el.checked = !!value;
  },

  unbind: function unbind() {
    _.off(this.el, "change", this.listener);
  }

};
}, {"../../util":6}],
47: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var templateParser = require("../parsers/template");

module.exports = {

  isLiteral: true,

  /**
   * Setup. Two possible usages:
   *
   * - static:
   *   v-component="comp"
   *
   * - dynamic:
   *   v-component="{{currentView}}"
   */

  bind: function bind() {
    if (!this.el.__vue__) {
      // create a ref anchor
      this.ref = document.createComment("v-component");
      _.replace(this.el, this.ref);
      // check keep-alive options.
      // If yes, instead of destroying the active vm when
      // hiding (v-if) or switching (dynamic literal) it,
      // we simply remove it from the DOM and save it in a
      // cache object, with its constructor id as the key.
      this.keepAlive = this._checkParam("keep-alive") != null;
      // check ref
      this.refID = _.attr(this.el, "ref");
      if (this.keepAlive) {
        this.cache = {};
      }
      // if static, build right now.
      if (!this._isDynamicLiteral) {
        this.resolveCtor(this.expression);
        var child = this.build();
        child.$before(this.ref);
        this.setCurrent(child);
      } else {
        // check dynamic component params
        this.readyEvent = this._checkParam("wait-for");
        this.transMode = this._checkParam("transition-mode");
      }
    } else {
      _.warn("v-component=\"" + this.expression + "\" cannot be " + "used on an already mounted instance.");
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   */

  resolveCtor: function resolveCtor(id) {
    this.ctorId = id;
    this.Ctor = this.vm.$options.components[id];
    _.assertAsset(this.Ctor, "component", id);
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @return {Vue} - the created instance
   */

  build: function build() {
    if (this.keepAlive) {
      var cached = this.cache[this.ctorId];
      if (cached) {
        return cached;
      }
    }
    var vm = this.vm;
    var el = templateParser.clone(this.el);
    if (this.Ctor) {
      var child = vm.$addChild({
        el: el,
        _asComponent: true
      }, this.Ctor);
      if (this.keepAlive) {
        this.cache[this.ctorId] = child;
      }
      return child;
    }
  },

  /**
   * Teardown the current child, but defers cleanup so
   * that we can separate the destroy and removal steps.
   */

  unbuild: function unbuild() {
    var child = this.childVM;
    if (!child || this.keepAlive) {
      return;
    }
    // the sole purpose of `deferCleanup` is so that we can
    // "deactivate" the vm right now and perform DOM removal
    // later.
    child.$destroy(false, true);
  },

  /**
   * Remove current destroyed child and manually do
   * the cleanup after removal.
   *
   * @param {Function} cb
   */

  remove: function remove(child, cb) {
    var keepAlive = this.keepAlive;
    if (child) {
      child.$remove(function () {
        if (!keepAlive) child._cleanup();
        if (cb) cb();
      });
    } else if (cb) {
      cb();
    }
  },

  /**
   * Update callback for the dynamic literal scenario,
   * e.g. v-component="{{view}}"
   */

  update: function update(value) {
    if (!value) {
      // just destroy and remove current
      this.unbuild();
      this.remove(this.childVM);
      this.unsetCurrent();
    } else {
      this.resolveCtor(value);
      this.unbuild();
      var newComponent = this.build();
      var self = this;
      if (this.readyEvent) {
        newComponent.$once(this.readyEvent, function () {
          self.swapTo(newComponent);
        });
      } else {
        this.swapTo(newComponent);
      }
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} target
   */

  swapTo: function swapTo(target) {
    var self = this;
    var current = this.childVM;
    this.unsetCurrent();
    this.setCurrent(target);
    switch (self.transMode) {
      case "in-out":
        target.$before(self.ref, function () {
          self.remove(current);
        });
        break;
      case "out-in":
        self.remove(current, function () {
          target.$before(self.ref);
        });
        break;
      default:
        self.remove(current);
        target.$before(self.ref);
    }
  },

  /**
   * Set childVM and parent ref
   */

  setCurrent: function setCurrent(child) {
    this.childVM = child;
    var refID = child._refID || this.refID;
    if (refID) {
      this.vm.$[refID] = child;
    }
  },

  /**
   * Unset childVM and parent ref
   */

  unsetCurrent: function unsetCurrent() {
    var child = this.childVM;
    this.childVM = null;
    var refID = child && child._refID || this.refID;
    if (refID) {
      this.vm.$[refID] = null;
    }
  },

  /**
   * Unbind.
   */

  unbind: function unbind() {
    this.unbuild();
    // destroy all keep-alive cached instances
    if (this.cache) {
      for (var key in this.cache) {
        this.cache[key].$destroy();
      }
      this.cache = null;
    }
  }

};
}, {"../util":6,"../parsers/template":30}],
48: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var isObject = _.isObject;
var isPlainObject = _.isPlainObject;
var textParser = require("../parsers/text");
var expParser = require("../parsers/expression");
var templateParser = require("../parsers/template");
var compile = require("../compiler/compile");
var transclude = require("../compiler/transclude");
var mergeOptions = require("../util/merge-option");
var uid = 0;

module.exports = {

  /**
   * Setup.
   */

  bind: function bind() {
    // uid as a cache identifier
    this.id = "__v_repeat_" + ++uid;
    // we need to insert the objToArray converter
    // as the first read filter, because it has to be invoked
    // before any user filters. (can't do it in `update`)
    if (!this.filters) {
      this.filters = {};
    }
    // add the object -> array convert filter
    var objectConverter = _.bind(objToArray, this);
    if (!this.filters.read) {
      this.filters.read = [objectConverter];
    } else {
      this.filters.read.unshift(objectConverter);
    }
    // setup ref node
    this.ref = document.createComment("v-repeat");
    _.replace(this.el, this.ref);
    // check if this is a block repeat
    this.template = this.el.tagName === "TEMPLATE" ? templateParser.parse(this.el, true) : this.el;
    // check other directives that need to be handled
    // at v-repeat level
    this.checkIf();
    this.checkRef();
    this.checkComponent();
    // check for trackby param
    this.idKey = this._checkParam("track-by") || this._checkParam("trackby"); // 0.11.0 compat
    // cache for primitive value instances
    this.cache = Object.create(null);
  },

  /**
   * Warn against v-if usage.
   */

  checkIf: function checkIf() {
    if (_.attr(this.el, "if") !== null) {
      _.warn("Don't use v-if with v-repeat. " + "Use v-show or the \"filterBy\" filter instead.");
    }
  },

  /**
   * Check if v-ref/ v-el is also present.
   */

  checkRef: function checkRef() {
    var refID = _.attr(this.el, "ref");
    this.refID = refID ? this.vm.$interpolate(refID) : null;
    var elId = _.attr(this.el, "el");
    this.elId = elId ? this.vm.$interpolate(elId) : null;
  },

  /**
   * Check the component constructor to use for repeated
   * instances. If static we resolve it now, otherwise it
   * needs to be resolved at build time with actual data.
   */

  checkComponent: function checkComponent() {
    var id = _.attr(this.el, "component");
    var options = this.vm.$options;
    if (!id) {
      this.Ctor = _.Vue; // default constructor
      this.inherit = true; // inline repeats should inherit
      // important: transclude with no options, just
      // to ensure block start and block end
      this.template = transclude(this.template);
      this._linkFn = compile(this.template, options);
    } else {
      this._asComponent = true;
      var tokens = textParser.parse(id);
      if (!tokens) {
        // static component
        var Ctor = this.Ctor = options.components[id];
        _.assertAsset(Ctor, "component", id);
        // If there's no parent scope directives and no
        // content to be transcluded, we can optimize the
        // rendering by pre-transcluding + compiling here
        // and provide a link function to every instance.
        if (!this.el.hasChildNodes() && !this.el.hasAttributes()) {
          // merge an empty object with owner vm as parent
          // so child vms can access parent assets.
          var merged = mergeOptions(Ctor.options, {}, {
            $parent: this.vm
          });
          this.template = transclude(this.template, merged);
          this._linkFn = compile(this.template, merged, false, true);
        }
      } else {
        // to be resolved later
        var ctorExp = textParser.tokensToExp(tokens);
        this.ctorGetter = expParser.parse(ctorExp).get;
      }
    }
  },

  /**
   * Update.
   * This is called whenever the Array mutates.
   *
   * @param {Array} data
   */

  update: function update(data) {
    if (typeof data === "number") {
      data = range(data);
    }
    this.vms = this.diff(data || [], this.vms);
    // update v-ref
    if (this.refID) {
      this.vm.$[this.refID] = this.vms;
    }
    if (this.elId) {
      this.vm.$$[this.elId] = this.vms.map(function (vm) {
        return vm.$el;
      });
    }
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   * @param {Array} oldVms
   * @return {Array}
   */

  diff: function diff(data, oldVms) {
    var idKey = this.idKey;
    var converted = this.converted;
    var ref = this.ref;
    var alias = this.arg;
    var init = !oldVms;
    var vms = new Array(data.length);
    var obj, raw, vm, i, l;
    // First pass, go through the new Array and fill up
    // the new vms array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      obj = data[i];
      raw = converted ? obj.value : obj;
      vm = !init && this.getVm(raw);
      if (vm) {
        // reusable instance
        vm._reused = true;
        vm.$index = i; // update $index
        if (converted) {
          vm.$key = obj.key // update $key
          ;
        }
        if (idKey) {
          // swap track by id data
          if (alias) {
            vm[alias] = raw;
          } else {
            vm._setData(raw);
          }
        }
      } else {
        // new instance
        vm = this.build(obj, i);
        vm._new = true;
      }
      vms[i] = vm;
      // insert if this is first run
      if (init) {
        vm.$before(ref);
      }
    }
    // if this is the first run, we're done.
    if (init) {
      return vms;
    }
    // Second pass, go through the old vm instances and
    // destroy those who are not reused (and remove them
    // from cache)
    for (i = 0, l = oldVms.length; i < l; i++) {
      vm = oldVms[i];
      if (!vm._reused) {
        this.uncacheVm(vm);
        vm.$destroy(true);
      }
    }
    // final pass, move/insert new instances into the
    // right place. We're going in reverse here because
    // insertBefore relies on the next sibling to be
    // resolved.
    var targetNext, currentNext;
    i = vms.length;
    while (i--) {
      vm = vms[i];
      // this is the vm that we should be in front of
      targetNext = vms[i + 1];
      if (!targetNext) {
        // This is the last item. If it's reused then
        // everything else will eventually be in the right
        // place, so no need to touch it. Otherwise, insert
        // it.
        if (!vm._reused) {
          vm.$before(ref);
        }
      } else {
        if (vm._reused) {
          // this is the vm we are actually in front of
          currentNext = findNextVm(vm, ref);
          // we only need to move if we are not in the right
          // place already.
          if (currentNext !== targetNext) {
            vm.$before(targetNext.$el, null, false);
          }
        } else {
          // new instance, insert to existing next
          vm.$before(targetNext.$el);
        }
      }
      vm._new = false;
      vm._reused = false;
    }
    return vms;
  },

  /**
   * Build a new instance and cache it.
   *
   * @param {Object} data
   * @param {Number} index
   */

  build: function build(data, index) {
    var original = data;
    var meta = { $index: index };
    if (this.converted) {
      meta.$key = original.key;
    }
    var raw = this.converted ? data.value : data;
    var alias = this.arg;
    var hasAlias = !isPlainObject(raw) || alias;
    // wrap the raw data with alias
    data = hasAlias ? {} : raw;
    if (alias) {
      data[alias] = raw;
    } else if (hasAlias) {
      meta.$value = raw;
    }
    // resolve constructor
    var Ctor = this.Ctor || this.resolveCtor(data, meta);
    var vm = this.vm.$addChild({
      el: templateParser.clone(this.template),
      _asComponent: this._asComponent,
      _linkFn: this._linkFn,
      _meta: meta,
      data: data,
      inherit: this.inherit
    }, Ctor);
    // cache instance
    this.cacheVm(raw, vm);
    return vm;
  },

  /**
   * Resolve a contructor to use for an instance.
   * The tricky part here is that there could be dynamic
   * components depending on instance data.
   *
   * @param {Object} data
   * @param {Object} meta
   * @return {Function}
   */

  resolveCtor: function resolveCtor(data, meta) {
    // create a temporary context object and copy data
    // and meta properties onto it.
    // use _.define to avoid accidentally overwriting scope
    // properties.
    var context = Object.create(this.vm);
    var key;
    for (key in data) {
      _.define(context, key, data[key]);
    }
    for (key in meta) {
      _.define(context, key, meta[key]);
    }
    var id = this.ctorGetter.call(context, context);
    var Ctor = this.vm.$options.components[id];
    _.assertAsset(Ctor, "component", id);
    return Ctor;
  },

  /**
   * Unbind, teardown everything
   */

  unbind: function unbind() {
    if (this.refID) {
      this.vm.$[this.refID] = null;
    }
    if (this.vms) {
      var i = this.vms.length;
      var vm;
      while (i--) {
        vm = this.vms[i];
        this.uncacheVm(vm);
        vm.$destroy();
      }
    }
  },

  /**
   * Cache a vm instance based on its data.
   *
   * If the data is an object, we save the vm's reference on
   * the data object as a hidden property. Otherwise we
   * cache them in an object and for each primitive value
   * there is an array in case there are duplicates.
   *
   * @param {Object} data
   * @param {Vue} vm
   */

  cacheVm: function cacheVm(data, vm) {
    var idKey = this.idKey;
    var cache = this.cache;
    var id;
    if (idKey) {
      id = data[idKey];
      if (!cache[id]) {
        cache[id] = vm;
      } else {
        _.warn("Duplicate ID in v-repeat: " + id);
      }
    } else if (isObject(data)) {
      id = this.id;
      if (data.hasOwnProperty(id)) {
        if (data[id] === null) {
          data[id] = vm;
        } else {
          _.warn("Duplicate objects are not supported in v-repeat.");
        }
      } else {
        _.define(data, this.id, vm);
      }
    } else {
      if (!cache[data]) {
        cache[data] = [vm];
      } else {
        cache[data].push(vm);
      }
    }
    vm._raw = data;
  },

  /**
   * Try to get a cached instance from a piece of data.
   *
   * @param {Object} data
   * @return {Vue|undefined}
   */

  getVm: function getVm(data) {
    if (this.idKey) {
      return this.cache[data[this.idKey]];
    } else if (isObject(data)) {
      return data[this.id];
    } else {
      var cached = this.cache[data];
      if (cached) {
        var i = 0;
        var vm = cached[i];
        // since duplicated vm instances might be a reused
        // one OR a newly created one, we need to return the
        // first instance that is neither of these.
        while (vm && (vm._reused || vm._new)) {
          vm = cached[++i];
        }
        return vm;
      }
    }
  },

  /**
   * Delete a cached vm instance.
   *
   * @param {Vue} vm
   */

  uncacheVm: function uncacheVm(vm) {
    var data = vm._raw;
    if (this.idKey) {
      this.cache[data[this.idKey]] = null;
    } else if (isObject(data)) {
      data[this.id] = null;
      vm._raw = null;
    } else {
      this.cache[data].pop();
    }
  }

};

/**
 * Helper to find the next element that is an instance
 * root node. This is necessary because a destroyed vm's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its __vue__ reference
 * should have been removed so we can skip them.
 *
 * @param {Vue} vm
 * @param {CommentNode} ref
 * @return {Vue}
 */

function findNextVm(vm, ref) {
  var el = (vm._blockEnd || vm.$el).nextSibling;
  while (!el.__vue__ && el !== ref) {
    el = el.nextSibling;
  }
  return el.__vue__;
}

/**
 * Attempt to convert non-Array objects to array.
 * This is the default filter installed to every v-repeat
 * directive.
 *
 * It will be called with **the directive** as `this`
 * context so that we can mark the repeat array as converted
 * from an object.
 *
 * @param {*} obj
 * @return {Array}
 * @private
 */

function objToArray(obj) {
  if (!isPlainObject(obj)) {
    return obj;
  }
  var keys = Object.keys(obj);
  var i = keys.length;
  var res = new Array(i);
  var key;
  while (i--) {
    key = keys[i];
    res[i] = {
      key: key,
      value: obj[key]
    };
  }
  // `this` points to the repeat directive instance
  this.converted = true;
  return res;
}

/**
 * Create a range array from given number.
 *
 * @param {Number} n
 * @return {Array}
 */

function range(n) {
  var i = -1;
  var ret = new Array(n);
  while (++i < n) {
    ret[i] = i;
  }
  return ret;
}
}, {"../util":6,"../parsers/text":29,"../parsers/expression":32,"../parsers/template":30,"../compiler/compile":26,"../compiler/transclude":27,"../util/merge-option":25}],
50: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var Watcher = require("../watcher");

module.exports = {

  priority: 900,

  bind: function bind() {

    var child = this.vm;
    var parent = child.$parent;
    var childKey = this.arg || "$data";
    var parentKey = this.expression;

    if (this.el !== child.$el) {
      _.warn("v-with can only be used on instance root elements.");
    } else if (!parent) {
      _.warn("v-with must be used on an instance with a parent.");
    } else {

      // simple lock to avoid circular updates.
      // without this it would stabilize too, but this makes
      // sure it doesn't cause other watchers to re-evaluate.
      var locked = false;
      var lock = function lock() {
        locked = true;
        _.nextTick(unlock);
      };
      var unlock = function unlock() {
        locked = false;
      };

      this.parentWatcher = new Watcher(parent, parentKey, function (val) {
        if (!locked) {
          lock();
          child.$set(childKey, val);
        }
      });

      // set the child initial value first, before setting
      // up the child watcher to avoid triggering it
      // immediately.
      child.$set(childKey, this.parentWatcher.value);

      this.childWatcher = new Watcher(child, childKey, function (val) {
        if (!locked) {
          lock();
          parent.$set(parentKey, val);
        }
      });
    }
  },

  unbind: function unbind() {
    if (this.parentWatcher) {
      this.parentWatcher.teardown();
      this.childWatcher.teardown();
    }
  }

};
}, {"../util":6,"../watcher":59}],
51: [function(require, module, exports) {
"use strict";

var _ = require("../util");

module.exports = {

  bind: function bind() {
    var child = this.el.__vue__;
    if (!child || this.vm !== child.$parent) {
      _.warn("`v-events` should only be used on a child component " + "from the parent template.");
      return;
    }
    var method = this.vm[this.expression];
    if (!method) {
      _.warn("`v-events` cannot find method \"" + this.expression + "\" on the parent instance.");
    }
    child.$on(this.arg, method);
  }

  // when child is destroyed, all events are turned off,
  // so no need for unbind here.

};
}, {"../util":6}],
9: [function(require, module, exports) {
"use strict";

var _ = require("../util");

/**
 * Stringify value.
 *
 * @param {Number} indent
 */

exports.json = {
  read: function read(value, indent) {
    return typeof value === "string" ? value : JSON.stringify(value, null, Number(indent) || 2);
  },
  write: function write(value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
};

/**
 * 'abc' => 'Abc'
 */

exports.capitalize = function (value) {
  if (!value && value !== 0) return "";
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * 'abc' => 'ABC'
 */

exports.uppercase = function (value) {
  return value || value === 0 ? value.toString().toUpperCase() : "";
};

/**
 * 'AbC' => 'abc'
 */

exports.lowercase = function (value) {
  return value || value === 0 ? value.toString().toLowerCase() : "";
};

/**
 * 12345 => $12,345.00
 *
 * @param {String} sign
 */

var digitsRE = /(\d{3})(?=\d)/g;

exports.currency = function (value, sign) {
  value = parseFloat(value);
  if (!value && value !== 0) return "";
  sign = sign || "$";
  var s = Math.floor(Math.abs(value)).toString(),
      i = s.length % 3,
      h = i > 0 ? s.slice(0, i) + (s.length > 3 ? "," : "") : "",
      f = "." + value.toFixed(2).slice(-2);
  return (value < 0 ? "-" : "") + sign + h + s.slice(i).replace(digitsRE, "$1,") + f;
};

/**
 * 'item' => 'items'
 *
 * @params
 *  an array of strings corresponding to
 *  the single, double, triple ... forms of the word to
 *  be pluralized. When the number to be pluralized
 *  exceeds the length of the args, it will use the last
 *  entry in the array.
 *
 *  e.g. ['single', 'double', 'triple', 'multiple']
 */

exports.pluralize = function (value) {
  var args = _.toArray(arguments, 1);
  return args.length > 1 ? args[value % 10 - 1] || args[args.length - 1] : args[0] + (value === 1 ? "" : "s");
};

/**
 * A special filter that takes a handler function,
 * wraps it so it only gets triggered on specific
 * keypresses. v-on only.
 *
 * @param {String} key
 */

var keyCodes = {
  enter: 13,
  tab: 9,
  "delete": 46,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  esc: 27
};

exports.key = function (handler, key) {
  if (!handler) return;
  var code = keyCodes[key];
  if (!code) {
    code = parseInt(key, 10);
  }
  return function (e) {
    if (e.keyCode === code) {
      return handler.call(this, e);
    }
  };
};

// expose keycode hash
exports.key.keyCodes = keyCodes;

/**
 * Install special array filters
 */

_.extend(exports, require("./array-filters"));
}, {"../util":6,"./array-filters":65}],
65: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var Path = require("../parsers/path");

/**
 * Filter filter for v-repeat
 *
 * @param {String} searchKey
 * @param {String} [delimiter]
 * @param {String} dataKey
 */

exports.filterBy = function (arr, searchKey, delimiter, dataKey) {
  // allow optional `in` delimiter
  // because why not
  if (delimiter && delimiter !== "in") {
    dataKey = delimiter;
  }
  // get the search string
  var search = _.stripQuotes(searchKey) || this.$get(searchKey);
  if (!search) {
    return arr;
  }
  search = ("" + search).toLowerCase();
  // get the optional dataKey
  dataKey = dataKey && (_.stripQuotes(dataKey) || this.$get(dataKey));
  return arr.filter(function (item) {
    return dataKey ? contains(Path.get(item, dataKey), search) : contains(item, search);
  });
};

/**
 * Filter filter for v-repeat
 *
 * @param {String} sortKey
 * @param {String} reverseKey
 */

exports.orderBy = function (arr, sortKey, reverseKey) {
  var key = _.stripQuotes(sortKey) || this.$get(sortKey);
  if (!key) {
    return arr;
  }
  var order = 1;
  if (reverseKey) {
    if (reverseKey === "-1") {
      order = -1;
    } else if (reverseKey.charCodeAt(0) === 33) {
      // !
      reverseKey = reverseKey.slice(1);
      order = this.$get(reverseKey) ? 1 : -1;
    } else {
      order = this.$get(reverseKey) ? -1 : 1;
    }
  }
  // sort on a copy to avoid mutating original array
  return arr.slice().sort(function (a, b) {
    a = Path.get(a, key);
    b = Path.get(b, key);
    return a === b ? 0 : a > b ? order : -order;
  });
};

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains(val, search) {
  if (_.isObject(val)) {
    for (var key in val) {
      if (contains(val[key], search)) {
        return true;
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1;
  }
}
}, {"../util":6,"../parsers/path":28}],
10: [function(require, module, exports) {
"use strict";

var mergeOptions = require("../util/merge-option");

/**
 * The main init sequence. This is called for every
 * instance, including ones that are created from extended
 * constructors.
 *
 * @param {Object} options - this options object should be
 *                           the result of merging class
 *                           options and the options passed
 *                           in to the constructor.
 */

exports._init = function (options) {

  options = options || {};

  this.$el = null;
  this.$parent = options._parent;
  this.$root = options._root || this;
  this.$ = {}; // child vm references
  this.$$ = {}; // element references
  this._watcherList = []; // all watchers as an array
  this._watchers = {}; // internal watchers as a hash
  this._userWatchers = {}; // user watchers as a hash
  this._directives = []; // all directives

  // a flag to avoid this being observed
  this._isVue = true;

  // events bookkeeping
  this._events = {}; // registered callbacks
  this._eventsCount = {}; // for $broadcast optimization
  this._eventCancelled = false; // for event cancellation

  // block instance properties
  this._isBlock = false;
  this._blockStart = // @type {CommentNode}
  this._blockEnd = null; // @type {CommentNode}

  // lifecycle state
  this._isCompiled = this._isDestroyed = this._isReady = this._isAttached = this._isBeingDestroyed = false;

  // children
  this._children = [];
  this._childCtors = {};
  // transcluded components that belong to the parent
  this._transCpnts = null;

  // merge options.
  options = this.$options = mergeOptions(this.constructor.options, options, this);

  // set data after merge.
  this._data = options.data || {};

  // initialize data observation and scope inheritance.
  this._initScope();

  // setup event system and option events.
  this._initEvents();

  // call created hook
  this._callHook("created");

  // if `el` option is passed, start compilation.
  if (options.el) {
    this.$mount(options.el);
  }
};
}, {"../util/merge-option":25}],
11: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var inDoc = _.inDoc;

/**
 * Setup the instance's option events & watchers.
 * If the value is a string, we pull it from the
 * instance's methods by name.
 */

exports._initEvents = function () {
  var options = this.$options;
  registerCallbacks(this, "$on", options.events);
  registerCallbacks(this, "$watch", options.watch);
};

/**
 * Register callbacks for option events and watchers.
 *
 * @param {Vue} vm
 * @param {String} action
 * @param {Object} hash
 */

function registerCallbacks(vm, action, hash) {
  if (!hash) {
    return;
  }var handlers, key, i, j;
  for (key in hash) {
    handlers = hash[key];
    if (_.isArray(handlers)) {
      for (i = 0, j = handlers.length; i < j; i++) {
        register(vm, action, key, handlers[i]);
      }
    } else {
      register(vm, action, key, handlers);
    }
  }
}

/**
 * Helper to register an event/watch callback.
 *
 * @param {Vue} vm
 * @param {String} action
 * @param {String} key
 * @param {*} handler
 */

function register(vm, action, key, handler) {
  var type = typeof handler;
  if (type === "function") {
    vm[action](key, handler);
  } else if (type === "string") {
    var methods = vm.$options.methods;
    var method = methods && methods[handler];
    if (method) {
      vm[action](key, method);
    } else {
      _.warn("Unknown method: \"" + handler + "\" when " + "registering callback for " + action + ": \"" + key + "\".");
    }
  }
}

/**
 * Setup recursive attached/detached calls
 */

exports._initDOMHooks = function () {
  this.$on("hook:attached", onAttached);
  this.$on("hook:detached", onDetached);
};

/**
 * Callback to recursively call attached hook on children
 */

function onAttached() {
  this._isAttached = true;
  this._children.forEach(callAttach);
  if (this._transCpnts) {
    this._transCpnts.forEach(callAttach);
  }
}

/**
 * Iterator to call attached hook
 * 
 * @param {Vue} child
 */

function callAttach(child) {
  if (!child._isAttached && inDoc(child.$el)) {
    child._callHook("attached");
  }
}

/**
 * Callback to recursively call detached hook on children
 */

function onDetached() {
  this._isAttached = false;
  this._children.forEach(callDetach);
  if (this._transCpnts) {
    this._transCpnts.forEach(callDetach);
  }
}

/**
 * Iterator to call detached hook
 * 
 * @param {Vue} child
 */

function callDetach(child) {
  if (child._isAttached && !inDoc(child.$el)) {
    child._callHook("detached");
  }
}

/**
 * Trigger all handlers for a hook
 *
 * @param {String} hook
 */

exports._callHook = function (hook) {
  var handlers = this.$options[hook];
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(this);
    }
  }
  this.$emit("hook:" + hook);
};
}, {"../util":6}],
12: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var Observer = require("../observer");
var Dep = require("../observer/dep");

/**
 * Setup the scope of an instance, which contains:
 * - observed data
 * - computed properties
 * - user methods
 * - meta properties
 */

exports._initScope = function () {
  this._initData();
  this._initComputed();
  this._initMethods();
  this._initMeta();
};

/**
 * Initialize the data. 
 */

exports._initData = function () {
  // proxy data on instance
  var data = this._data;
  var keys = Object.keys(data);
  var i = keys.length;
  var key;
  while (i--) {
    key = keys[i];
    if (!_.isReserved(key)) {
      this._proxy(key);
    }
  }
  // observe data
  Observer.create(data).addVm(this);
};

/**
 * Swap the isntance's $data. Called in $data's setter.
 *
 * @param {Object} newData
 */

exports._setData = function (newData) {
  newData = newData || {};
  var oldData = this._data;
  this._data = newData;
  var keys, key, i;
  // unproxy keys not present in new data
  keys = Object.keys(oldData);
  i = keys.length;
  while (i--) {
    key = keys[i];
    if (!_.isReserved(key) && !(key in newData)) {
      this._unproxy(key);
    }
  }
  // proxy keys not already proxied,
  // and trigger change for changed values
  keys = Object.keys(newData);
  i = keys.length;
  while (i--) {
    key = keys[i];
    if (!this.hasOwnProperty(key) && !_.isReserved(key)) {
      // new property
      this._proxy(key);
    }
  }
  oldData.__ob__.removeVm(this);
  Observer.create(newData).addVm(this);
  this._digest();
};

/**
 * Proxy a property, so that
 * vm.prop === vm._data.prop
 *
 * @param {String} key
 */

exports._proxy = function (key) {
  // need to store ref to self here
  // because these getter/setters might
  // be called by child instances!
  var self = this;
  Object.defineProperty(self, key, {
    configurable: true,
    enumerable: true,
    get: function proxyGetter() {
      return self._data[key];
    },
    set: function proxySetter(val) {
      self._data[key] = val;
    }
  });
};

/**
 * Unproxy a property.
 *
 * @param {String} key
 */

exports._unproxy = function (key) {
  delete this[key];
};

/**
 * Force update on every watcher in scope.
 */

exports._digest = function () {
  var i = this._watcherList.length;
  while (i--) {
    this._watcherList[i].update();
  }
  var children = this._children;
  i = children.length;
  while (i--) {
    var child = children[i];
    if (child.$options.inherit) {
      child._digest();
    }
  }
};

/**
 * Setup computed properties. They are essentially
 * special getter/setters
 */

function noop() {}
exports._initComputed = function () {
  var computed = this.$options.computed;
  if (computed) {
    for (var key in computed) {
      var userDef = computed[key];
      var def = {
        enumerable: true,
        configurable: true
      };
      if (typeof userDef === "function") {
        def.get = _.bind(userDef, this);
        def.set = noop;
      } else {
        def.get = userDef.get ? _.bind(userDef.get, this) : noop;
        def.set = userDef.set ? _.bind(userDef.set, this) : noop;
      }
      Object.defineProperty(this, key, def);
    }
  }
};

/**
 * Setup instance methods. Methods must be bound to the
 * instance since they might be called by children
 * inheriting them.
 */

exports._initMethods = function () {
  var methods = this.$options.methods;
  if (methods) {
    for (var key in methods) {
      this[key] = _.bind(methods[key], this);
    }
  }
};

/**
 * Initialize meta information like $index, $key & $value.
 */

exports._initMeta = function () {
  var metas = this.$options._meta;
  if (metas) {
    for (var key in metas) {
      this._defineMeta(key, metas[key]);
    }
  }
};

/**
 * Define a meta property, e.g $index, $key, $value
 * which only exists on the vm instance but not in $data.
 *
 * @param {String} key
 * @param {*} value
 */

exports._defineMeta = function (key, value) {
  var dep = new Dep();
  Object.defineProperty(this, key, {
    enumerable: true,
    configurable: true,
    get: function metaGetter() {
      if (Observer.target) {
        Observer.target.addDep(dep);
      }
      return value;
    },
    set: function metaSetter(val) {
      if (val !== value) {
        value = val;
        dep.notify();
      }
    }
  });
};
}, {"../util":6,"../observer":60,"../observer/dep":62}],
13: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var Directive = require("../directive");
var compile = require("../compiler/compile");
var transclude = require("../compiler/transclude");

/**
 * Transclude, compile and link element.
 *
 * If a pre-compiled linker is available, that means the
 * passed in element will be pre-transcluded and compiled
 * as well - all we need to do is to call the linker.
 *
 * Otherwise we need to call transclude/compile/link here.
 *
 * @param {Element} el
 * @return {Element}
 */

exports._compile = function (el) {
  var options = this.$options;
  var parent = options._parent;
  if (options._linkFn) {
    this._initElement(el);
    options._linkFn(this, el);
  } else {
    var raw = el;
    if (options._asComponent) {
      // separate container element and content
      var content = options._content = _.extractContent(raw);
      // create two separate linekrs for container and content
      var parentOptions = parent.$options;

      // hack: we need to skip the paramAttributes for this
      // child instance when compiling its parent container
      // linker. there could be a better way to do this.
      parentOptions._skipAttrs = options.paramAttributes;
      var containerLinkFn = compile(raw, parentOptions, true, true);
      parentOptions._skipAttrs = null;

      if (content) {
        var ol = parent._children.length;
        var contentLinkFn = compile(content, parentOptions, true);
        // call content linker now, before transclusion
        this._contentUnlinkFn = contentLinkFn(parent, content);
        this._transCpnts = parent._children.slice(ol);
      }
      // tranclude, this possibly replaces original
      el = transclude(el, options);
      this._initElement(el);
      // now call the container linker on the resolved el
      this._containerUnlinkFn = containerLinkFn(parent, el);
    } else {
      // simply transclude
      el = transclude(el, options);
      this._initElement(el);
    }
    var linkFn = compile(el, options);
    linkFn(this, el);
    if (options.replace) {
      _.replace(raw, el);
    }
  }
  return el;
};

/**
 * Initialize instance element. Called in the public
 * $mount() method.
 *
 * @param {Element} el
 */

exports._initElement = function (el) {
  if (el instanceof DocumentFragment) {
    this._isBlock = true;
    this.$el = this._blockStart = el.firstChild;
    this._blockEnd = el.lastChild;
    this._blockFragment = el;
  } else {
    this.$el = el;
  }
  this.$el.__vue__ = this;
  this._callHook("beforeCompile");
};

/**
 * Create and bind a directive to an element.
 *
 * @param {String} name - directive name
 * @param {Node} node   - target node
 * @param {Object} desc - parsed directive descriptor
 * @param {Object} def  - directive definition object
 */

exports._bindDir = function (name, node, desc, def) {
  this._directives.push(new Directive(name, node, this, desc, def));
};

/**
 * Teardown an instance, unobserves the data, unbind all the
 * directives, turn off all the event listeners, etc.
 *
 * @param {Boolean} remove - whether to remove the DOM node.
 * @param {Boolean} deferCleanup - if true, defer cleanup to
 *                                 be called later
 */

exports._destroy = function (remove, deferCleanup) {
  if (this._isBeingDestroyed) {
    return;
  }
  this._callHook("beforeDestroy");
  this._isBeingDestroyed = true;
  var i;
  // remove self from parent. only necessary
  // if parent is not being destroyed as well.
  var parent = this.$parent;
  if (parent && !parent._isBeingDestroyed) {
    i = parent._children.indexOf(this);
    parent._children.splice(i, 1);
  }
  // destroy all children.
  i = this._children.length;
  while (i--) {
    this._children[i].$destroy();
  }
  // teardown parent linkers
  if (this._containerUnlinkFn) {
    this._containerUnlinkFn();
  }
  if (this._contentUnlinkFn) {
    this._contentUnlinkFn();
  }
  // teardown all directives. this also tearsdown all
  // directive-owned watchers. intentionally check for
  // directives array length on every loop since directives
  // that manages partial compilation can splice ones out
  for (i = 0; i < this._directives.length; i++) {
    this._directives[i]._teardown();
  }
  // teardown all user watchers.
  for (i in this._userWatchers) {
    this._userWatchers[i].teardown();
  }
  // remove reference to self on $el
  if (this.$el) {
    this.$el.__vue__ = null;
  }
  // remove DOM element
  var self = this;
  if (remove && this.$el) {
    this.$remove(function () {
      self._cleanup();
    });
  } else if (!deferCleanup) {
    this._cleanup();
  }
};

/**
 * Clean up to ensure garbage collection.
 * This is called after the leave transition if there
 * is any.
 */

exports._cleanup = function () {
  // remove reference from data ob
  this._data.__ob__.removeVm(this);
  this._data = this._watchers = this._userWatchers = this._watcherList = this.$el = this.$parent = this.$root = this._children = this._transCpnts = this._directives = null;
  // call the last hook...
  this._isDestroyed = true;
  this._callHook("destroyed");
  // turn off all instance listeners.
  this.$off();
};
}, {"../util":6,"../directive":66,"../compiler/compile":26,"../compiler/transclude":27}],
66: [function(require, module, exports) {
"use strict";

var _ = require("./util");
var config = require("./config");
var Watcher = require("./watcher");
var textParser = require("./parsers/text");
var expParser = require("./parsers/expression");

/**
 * A directive links a DOM element with a piece of data,
 * which is the result of evaluating an expression.
 * It registers a watcher with the expression and calls
 * the DOM update function when a change is triggered.
 *
 * @param {String} name
 * @param {Node} el
 * @param {Vue} vm
 * @param {Object} descriptor
 *                 - {String} expression
 *                 - {String} [arg]
 *                 - {Array<Object>} [filters]
 * @param {Object} def - directive definition object
 * @constructor
 */

function Directive(name, el, vm, descriptor, def) {
  // public
  this.name = name;
  this.el = el;
  this.vm = vm;
  // copy descriptor props
  this.raw = descriptor.raw;
  this.expression = descriptor.expression;
  this.arg = descriptor.arg;
  this.filters = _.resolveFilters(vm, descriptor.filters);
  // private
  this._locked = false;
  this._bound = false;
  // init
  this._bind(def);
}

var p = Directive.prototype;

/**
 * Initialize the directive, mixin definition properties,
 * setup the watcher, call definition bind() and update()
 * if present.
 *
 * @param {Object} def
 */

p._bind = function (def) {
  if (this.name !== "cloak" && this.el.removeAttribute) {
    this.el.removeAttribute(config.prefix + this.name);
  }
  if (typeof def === "function") {
    this.update = def;
  } else {
    _.extend(this, def);
  }
  this._watcherExp = this.expression;
  this._checkDynamicLiteral();
  if (this.bind) {
    this.bind();
  }
  if (this._watcherExp && (this.update || this.twoWay) && (!this.isLiteral || this._isDynamicLiteral) && !this._checkStatement()) {
    // wrapped updater for context
    var dir = this;
    var update = this._update = this.update ? function (val, oldVal) {
      if (!dir._locked) {
        dir.update(val, oldVal);
      }
    } : function () {}; // noop if no update is provided
    // use raw expression as identifier because filters
    // make them different watchers
    var watcher = this.vm._watchers[this.raw];
    // v-repeat always creates a new watcher because it has
    // a special filter that's bound to its directive
    // instance.
    if (!watcher || this.name === "repeat") {
      watcher = this.vm._watchers[this.raw] = new Watcher(this.vm, this._watcherExp, update, // callback
      {
        filters: this.filters,
        twoWay: this.twoWay,
        deep: this.deep
      });
    } else {
      watcher.addCb(update);
    }
    this._watcher = watcher;
    if (this._initValue != null) {
      watcher.set(this._initValue);
    } else if (this.update) {
      this.update(watcher.value);
    }
  }
  this._bound = true;
};

/**
 * check if this is a dynamic literal binding.
 *
 * e.g. v-component="{{currentView}}"
 */

p._checkDynamicLiteral = function () {
  var expression = this.expression;
  if (expression && this.isLiteral) {
    var tokens = textParser.parse(expression);
    if (tokens) {
      var exp = textParser.tokensToExp(tokens);
      this.expression = this.vm.$get(exp);
      this._watcherExp = exp;
      this._isDynamicLiteral = true;
    }
  }
};

/**
 * Check if the directive is a function caller
 * and if the expression is a callable one. If both true,
 * we wrap up the expression and use it as the event
 * handler.
 *
 * e.g. v-on="click: a++"
 *
 * @return {Boolean}
 */

p._checkStatement = function () {
  var expression = this.expression;
  if (expression && this.acceptStatement && !expParser.pathTestRE.test(expression)) {
    var fn = expParser.parse(expression).get;
    var vm = this.vm;
    var handler = function handler() {
      fn.call(vm, vm);
    };
    if (this.filters) {
      handler = _.applyFilters(handler, this.filters.read, vm);
    }
    this.update(handler);
    return true;
  }
};

/**
 * Check for an attribute directive param, e.g. lazy
 *
 * @param {String} name
 * @return {String}
 */

p._checkParam = function (name) {
  var param = this.el.getAttribute(name);
  if (param !== null) {
    this.el.removeAttribute(name);
  }
  return param;
};

/**
 * Teardown the watcher and call unbind.
 */

p._teardown = function () {
  if (this._bound) {
    if (this.unbind) {
      this.unbind();
    }
    var watcher = this._watcher;
    if (watcher && watcher.active) {
      watcher.removeCb(this._update);
      if (!watcher.active) {
        this.vm._watchers[this.raw] = null;
      }
    }
    this._bound = false;
    this.vm = this.el = this._watcher = null;
  }
};

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way directives
 * e.g. v-model.
 *
 * @param {*} value
 * @param {Boolean} lock - prevent wrtie triggering update.
 * @public
 */

p.set = function (value, lock) {
  if (this.twoWay) {
    if (lock) {
      this._locked = true;
    }
    this._watcher.set(value);
    if (lock) {
      var self = this;
      _.nextTick(function () {
        self._locked = false;
      });
    }
  }
};

module.exports = Directive;
}, {"./util":6,"./config":24,"./watcher":59,"./parsers/text":29,"./parsers/expression":32}],
14: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var Watcher = require("../watcher");
var Path = require("../parsers/path");
var textParser = require("../parsers/text");
var dirParser = require("../parsers/directive");
var expParser = require("../parsers/expression");
var filterRE = /[^|]\|[^|]/;

/**
 * Get the value from an expression on this vm.
 *
 * @param {String} exp
 * @return {*}
 */

exports.$get = function (exp) {
  var res = expParser.parse(exp);
  if (res) {
    return res.get.call(this, this);
  }
};

/**
 * Set the value from an expression on this vm.
 * The expression must be a valid left-hand
 * expression in an assignment.
 *
 * @param {String} exp
 * @param {*} val
 */

exports.$set = function (exp, val) {
  var res = expParser.parse(exp, true);
  if (res && res.set) {
    res.set.call(this, this, val);
  }
};

/**
 * Add a property on the VM
 *
 * @param {String} key
 * @param {*} val
 */

exports.$add = function (key, val) {
  this._data.$add(key, val);
};

/**
 * Delete a property on the VM
 *
 * @param {String} key
 */

exports.$delete = function (key) {
  this._data.$delete(key);
};

/**
 * Watch an expression, trigger callback when its
 * value changes.
 *
 * @param {String} exp
 * @param {Function} cb
 * @param {Boolean} [deep]
 * @param {Boolean} [immediate]
 * @return {Function} - unwatchFn
 */

exports.$watch = function (exp, cb, deep, immediate) {
  var vm = this;
  var key = deep ? exp + "**deep**" : exp;
  var watcher = vm._userWatchers[key];
  var wrappedCb = function wrappedCb(val, oldVal) {
    cb.call(vm, val, oldVal);
  };
  if (!watcher) {
    watcher = vm._userWatchers[key] = new Watcher(vm, exp, wrappedCb, {
      deep: deep,
      user: true
    });
  } else {
    watcher.addCb(wrappedCb);
  }
  if (immediate) {
    wrappedCb(watcher.value);
  }
  return function unwatchFn() {
    watcher.removeCb(wrappedCb);
    if (!watcher.active) {
      vm._userWatchers[key] = null;
    }
  };
};

/**
 * Evaluate a text directive, including filters.
 *
 * @param {String} text
 * @return {String}
 */

exports.$eval = function (text) {
  // check for filters.
  if (filterRE.test(text)) {
    var dir = dirParser.parse(text)[0];
    // the filter regex check might give false positive
    // for pipes inside strings, so it's possible that
    // we don't get any filters here
    return dir.filters ? _.applyFilters(this.$get(dir.expression), _.resolveFilters(this, dir.filters).read, this) : this.$get(dir.expression);
  } else {
    // no filter
    return this.$get(text);
  }
};

/**
 * Interpolate a piece of template text.
 *
 * @param {String} text
 * @return {String}
 */

exports.$interpolate = function (text) {
  var tokens = textParser.parse(text);
  var vm = this;
  if (tokens) {
    return tokens.length === 1 ? vm.$eval(tokens[0].value) : tokens.map(function (token) {
      return token.tag ? vm.$eval(token.value) : token.value;
    }).join("");
  } else {
    return text;
  }
};

/**
 * Log instance data as a plain JS object
 * so that it is easier to inspect in console.
 * This method assumes console is available.
 *
 * @param {String} [path]
 */

exports.$log = function (path) {
  var data = path ? Path.get(this._data, path) : this._data;
  if (data) {
    data = JSON.parse(JSON.stringify(data));
  }
  console.log(data);
};
}, {"../util":6,"../watcher":59,"../parsers/path":28,"../parsers/text":29,"../parsers/directive":31,"../parsers/expression":32}],
15: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var transition = require("../transition");

/**
 * Append instance to target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$appendTo = function (target, cb, withTransition) {
  return insert(this, target, cb, withTransition, append, transition.append);
};

/**
 * Prepend instance to target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$prependTo = function (target, cb, withTransition) {
  target = query(target);
  if (target.hasChildNodes()) {
    this.$before(target.firstChild, cb, withTransition);
  } else {
    this.$appendTo(target, cb, withTransition);
  }
  return this;
};

/**
 * Insert instance before target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$before = function (target, cb, withTransition) {
  return insert(this, target, cb, withTransition, before, transition.before);
};

/**
 * Insert instance after target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$after = function (target, cb, withTransition) {
  target = query(target);
  if (target.nextSibling) {
    this.$before(target.nextSibling, cb, withTransition);
  } else {
    this.$appendTo(target.parentNode, cb, withTransition);
  }
  return this;
};

/**
 * Remove instance from DOM
 *
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$remove = function (cb, withTransition) {
  var inDoc = this._isAttached && _.inDoc(this.$el);
  // if we are not in document, no need to check
  // for transitions
  if (!inDoc) withTransition = false;
  var op;
  var self = this;
  var realCb = function realCb() {
    if (inDoc) self._callHook("detached");
    if (cb) cb();
  };
  if (this._isBlock && !this._blockFragment.hasChildNodes()) {
    op = withTransition === false ? append : transition.removeThenAppend;
    blockOp(this, this._blockFragment, op, realCb);
  } else {
    op = withTransition === false ? remove : transition.remove;
    op(this.$el, this, realCb);
  }
  return this;
};

/**
 * Shared DOM insertion function.
 *
 * @param {Vue} vm
 * @param {Element} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition]
 * @param {Function} op1 - op for non-transition insert
 * @param {Function} op2 - op for transition insert
 * @return vm
 */

function insert(vm, target, cb, withTransition, op1, op2) {
  target = query(target);
  var targetIsDetached = !_.inDoc(target);
  var op = withTransition === false || targetIsDetached ? op1 : op2;
  var shouldCallHook = !targetIsDetached && !vm._isAttached && !_.inDoc(vm.$el);
  if (vm._isBlock) {
    blockOp(vm, target, op, cb);
  } else {
    op(vm.$el, target, vm, cb);
  }
  if (shouldCallHook) {
    vm._callHook("attached");
  }
  return vm;
}

/**
 * Execute a transition operation on a block instance,
 * iterating through all its block nodes.
 *
 * @param {Vue} vm
 * @param {Node} target
 * @param {Function} op
 * @param {Function} cb
 */

function blockOp(vm, target, op, cb) {
  var current = vm._blockStart;
  var end = vm._blockEnd;
  var next;
  while (next !== end) {
    next = current.nextSibling;
    op(current, target, vm);
    current = next;
  }
  op(end, target, vm, cb);
}

/**
 * Check for selectors
 *
 * @param {String|Element} el
 */

function query(el) {
  return typeof el === "string" ? document.querySelector(el) : el;
}

/**
 * Append operation that takes a callback.
 *
 * @param {Node} el
 * @param {Node} target
 * @param {Vue} vm - unused
 * @param {Function} [cb]
 */

function append(el, target, vm, cb) {
  target.appendChild(el);
  if (cb) cb();
}

/**
 * InsertBefore operation that takes a callback.
 *
 * @param {Node} el
 * @param {Node} target
 * @param {Vue} vm - unused
 * @param {Function} [cb]
 */

function before(el, target, vm, cb) {
  _.before(el, target);
  if (cb) cb();
}

/**
 * Remove operation that takes a callback.
 *
 * @param {Node} el
 * @param {Vue} vm - unused
 * @param {Function} [cb]
 */

function remove(el, vm, cb) {
  _.remove(el);
  if (cb) cb();
}
}, {"../util":6,"../transition":52}],
16: [function(require, module, exports) {
"use strict";

var _ = require("../util");

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 */

exports.$on = function (event, fn) {
  (this._events[event] || (this._events[event] = [])).push(fn);
  modifyListenerCount(this, event, 1);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 */

exports.$once = function (event, fn) {
  var self = this;
  function on() {
    self.$off(event, on);
    fn.apply(this, arguments);
  }
  on.fn = fn;
  this.$on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 */

exports.$off = function (event, fn) {
  var cbs;
  // all
  if (!arguments.length) {
    if (this.$parent) {
      for (event in this._events) {
        cbs = this._events[event];
        if (cbs) {
          modifyListenerCount(this, event, -cbs.length);
        }
      }
    }
    this._events = {};
    return this;
  }
  // specific event
  cbs = this._events[event];
  if (!cbs) {
    return this;
  }
  if (arguments.length === 1) {
    modifyListenerCount(this, event, -cbs.length);
    this._events[event] = null;
    return this;
  }
  // specific handler
  var cb;
  var i = cbs.length;
  while (i--) {
    cb = cbs[i];
    if (cb === fn || cb.fn === fn) {
      modifyListenerCount(this, event, -1);
      cbs.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Trigger an event on self.
 *
 * @param {String} event
 */

exports.$emit = function (event) {
  this._eventCancelled = false;
  var cbs = this._events[event];
  if (cbs) {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length - 1;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments[i + 1];
    }
    i = 0;
    cbs = cbs.length > 1 ? _.toArray(cbs) : cbs;
    for (var l = cbs.length; i < l; i++) {
      if (cbs[i].apply(this, args) === false) {
        this._eventCancelled = true;
      }
    }
  }
  return this;
};

/**
 * Recursively broadcast an event to all children instances.
 *
 * @param {String} event
 * @param {...*} additional arguments
 */

exports.$broadcast = function (event) {
  // if no child has registered for this event,
  // then there's no need to broadcast.
  if (!this._eventsCount[event]) return;
  var children = this._children;
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    child.$emit.apply(child, arguments);
    if (!child._eventCancelled) {
      child.$broadcast.apply(child, arguments);
    }
  }
  return this;
};

/**
 * Recursively propagate an event up the parent chain.
 *
 * @param {String} event
 * @param {...*} additional arguments
 */

exports.$dispatch = function () {
  var parent = this.$parent;
  while (parent) {
    parent.$emit.apply(parent, arguments);
    parent = parent._eventCancelled ? null : parent.$parent;
  }
  return this;
};

/**
 * Modify the listener counts on all parents.
 * This bookkeeping allows $broadcast to return early when
 * no child has listened to a certain event.
 *
 * @param {Vue} vm
 * @param {String} event
 * @param {Number} count
 */

var hookRE = /^hook:/;
function modifyListenerCount(vm, event, count) {
  var parent = vm.$parent;
  // hooks do not get broadcasted so no need
  // to do bookkeeping for them
  if (!parent || !count || hookRE.test(event)) {
    return;
  }while (parent) {
    parent._eventsCount[event] = (parent._eventsCount[event] || 0) + count;
    parent = parent.$parent;
  }
}
}, {"../util":6}],
17: [function(require, module, exports) {
"use strict";

var _ = require("../util");

/**
 * Create a child instance that prototypally inehrits
 * data on parent. To achieve that we create an intermediate
 * constructor with its prototype pointing to parent.
 *
 * @param {Object} opts
 * @param {Function} [BaseCtor]
 * @return {Vue}
 * @public
 */

exports.$addChild = function (opts, BaseCtor) {
  BaseCtor = BaseCtor || _.Vue;
  opts = opts || {};
  var parent = this;
  var ChildVue;
  var inherit = opts.inherit !== undefined ? opts.inherit : BaseCtor.options.inherit;
  if (inherit) {
    var ctors = parent._childCtors;
    ChildVue = ctors[BaseCtor.cid];
    if (!ChildVue) {
      var optionName = BaseCtor.options.name;
      var className = optionName ? _.camelize(optionName, true) : "VueComponent";
      ChildVue = new Function("return function " + className + " (options) {" + "this.constructor = " + className + ";" + "this._init(options) }")();
      ChildVue.options = BaseCtor.options;
      ChildVue.prototype = this;
      ctors[BaseCtor.cid] = ChildVue;
    }
  } else {
    ChildVue = BaseCtor;
  }
  opts._parent = parent;
  opts._root = parent.$root;
  var child = new ChildVue(opts);
  this._children.push(child);
  return child;
};
}, {"../util":6}],
18: [function(require, module, exports) {
"use strict";

var _ = require("../util");
var compile = require("../compiler/compile");

/**
 * Set instance target element and kick off the compilation
 * process. The passed in `el` can be a selector string, an
 * existing Element, or a DocumentFragment (for block
 * instances).
 *
 * @param {Element|DocumentFragment|string} el
 * @public
 */

exports.$mount = function (el) {
  if (this._isCompiled) {
    _.warn("$mount() should be called only once.");
    return;
  }
  if (!el) {
    el = document.createElement("div");
  } else if (typeof el === "string") {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      _.warn("Cannot find element: " + selector);
      return;
    }
  }
  this._compile(el);
  this._isCompiled = true;
  this._callHook("compiled");
  if (_.inDoc(this.$el)) {
    this._callHook("attached");
    this._initDOMHooks();
    ready.call(this);
  } else {
    this._initDOMHooks();
    this.$once("hook:attached", ready);
  }
  return this;
};

/**
 * Mark an instance as ready.
 */

function ready() {
  this._isAttached = true;
  this._isReady = true;
  this._callHook("ready");
}

/**
 * Teardown the instance, simply delegate to the internal
 * _destroy.
 */

exports.$destroy = function (remove, deferCleanup) {
  this._destroy(remove, deferCleanup);
};

/**
 * Partially compile a piece of DOM and return a
 * decompile function.
 *
 * @param {Element|DocumentFragment} el
 * @return {Function}
 */

exports.$compile = function (el) {
  return compile(el, this.$options, true)(this, el);
};
}, {"../util":6,"../compiler/compile":26}],
3: [function(require, module, exports) {
"use strict";

/**
 * Module dependencies.
 */

var Emitter = require("emitter");
var reduce = require("reduce");

/**
 * Root reference for iframes.
 */

var root = "undefined" == typeof window ? undefined : window;

/**
 * Noop.
 */

function noop() {};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = ({}).toString.call(obj);

  switch (str) {
    case "[object File]":
    case "[object Blob]":
    case "[object FormData]":
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest && ("file:" != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest();
  } else {
    try {
      return new ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) {}
    try {
      return new ActiveXObject("Msxml2.XMLHTTP.6.0");
    } catch (e) {}
    try {
      return new ActiveXObject("Msxml2.XMLHTTP.3.0");
    } catch (e) {}
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = "".trim ? function (s) {
  return s.trim();
} : function (s) {
  return s.replace(/(^\s*|\s*$)/g, "");
};

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) {
    return obj;
  }var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join("&");
}

/**
 * Expose serialization method.
 */

request.serializeObject = serialize;

/**
 * Parse the given x-www-form-urlencoded `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseString(str) {
  var obj = {};
  var pairs = str.split("&");
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split("=");
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: "text/html",
  json: "application/json",
  xml: "application/xml",
  urlencoded: "application/x-www-form-urlencoded",
  form: "application/x-www-form-urlencoded",
  "form-data": "application/x-www-form-urlencoded"
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

request.serialize = {
  "application/x-www-form-urlencoded": serialize,
  "application/json": JSON.stringify
};

/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(str){
 *       return { object parsed from str };
 *     };
 *
 */

request.parse = {
  "application/x-www-form-urlencoded": parseString,
  "application/json": JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(":");
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str) {
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str) {
  return reduce(str.split(/ *; */), function (obj, str) {
    var parts = str.split(/ *= */),
        key = parts.shift(),
        val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.req.method != "HEAD" ? this.xhr.responseText : null;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header["content-type"] = this.xhr.getResponseHeader("content-type");
  this.setHeaderProperties(this.header);
  this.body = this.req.method != "HEAD" ? this.parseBody(this.text) : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function (field) {
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function (header) {
  // content-type
  var ct = this.header["content-type"] || "";
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function (str) {
  var parse = request.parse[this.type];
  return parse && str && str.length ? parse(str) : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function (status) {
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = 4 == type || 5 == type ? this.toError() : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function () {
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = "cannot " + method + " " + url + " (" + this.status + ")";
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on("end", function () {
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch (e) {
      err = new Error("Parser is unable to parse the response");
      err.parse = true;
      err.original = e;
    }

    self.callback(err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function (fn) {
  fn(this);
  return this;
};

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function (ms) {
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function () {
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function () {
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit("abort");
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function (field, val) {
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function (field) {
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function (field) {
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function (type) {
  this.set("Content-Type", request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function (type) {
  this.set("Accept", request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function (user, pass) {
  var str = btoa(user + ":" + pass);
  this.set("Authorization", "Basic " + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function (val) {
  if ("string" != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function (name, val) {
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function (field, file, filename) {
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function (data) {
  var obj = isObject(data);
  var type = this.getHeader("Content-Type");

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ("string" == typeof data) {
    if (!type) this.type("form");
    type = this.getHeader("Content-Type");
    if ("application/x-www-form-urlencoded" == type) {
      this._data = this._data ? this._data + "&" + data : data;
    } else {
      this._data = (this._data || "") + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type("json");
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function (err, res) {
  var fn = this._callback;
  this.clearTimeout();
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit("error", err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function () {
  var err = new Error("Origin is not allowed by Access-Control-Allow-Origin");
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function () {
  var timeout = this._timeout;
  var err = new Error("timeout of " + timeout + "ms exceeded");
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function () {
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function (fn) {
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join("&");
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function () {
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit("end");
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function (e) {
      e.percent = e.loaded / e.total * 100;
      self.emit("progress", e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function () {
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf("?") ? "&" + query : "?" + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ("GET" != this.method && "HEAD" != this.method && "string" != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader("Content-Type")];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit("request", this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ("function" == typeof url) {
    return new Request("GET", method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request("GET", method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function (url, data, fn) {
  var req = request("GET", url);
  if ("function" == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function (url, data, fn) {
  var req = request("HEAD", url);
  if ("function" == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function (url, fn) {
  var req = request("DELETE", url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function (url, data, fn) {
  var req = request("PATCH", url);
  if ("function" == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function (url, data, fn) {
  var req = request("POST", url);
  if ("function" == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function (url, data, fn) {
  var req = request("PUT", url);
  if ("function" == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;
}, {"emitter":67,"reduce":68}],
67: [function(require, module, exports) {
"use strict";

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) {
    return mixin(obj);
  }
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
  this._callbacks = this._callbacks || {};
  (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function (event, fn) {
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks["$" + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks["$" + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function (event) {
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1),
      callbacks = this._callbacks["$" + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function (event) {
  this._callbacks = this._callbacks || {};
  return this._callbacks["$" + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function (event) {
  return !!this.listeners(event).length;
};
}, {}],
68: [function(require, module, exports) {
"use strict";

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function (arr, fn, initial) {
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3 ? initial : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }

  return curr;
};
}, {}],
4: [function(require, module, exports) {
"use strict";

/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function () {

  /**
   * Block-Level Grammar
   */

  var block = {
    newline: /^\n+/,
    code: /^( {4}[^\n]+\n*)+/,
    fences: noop,
    hr: /^( *[-*_]){3,} *(?:\n+|$)/,
    heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
    nptable: noop,
    lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
    blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
    list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
    html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
    table: noop,
    paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
    text: /^[^\n]+/
  };

  block.bullet = /(?:[*+-]|\d+\.)/;
  block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
  block.item = replace(block.item, "gm")(/bull/g, block.bullet)();

  block.list = replace(block.list)(/bull/g, block.bullet)("hr", "\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))")("def", "\\n+(?=" + block.def.source + ")")();

  block.blockquote = replace(block.blockquote)("def", block.def)();

  block._tag = "(?!(?:" + "a|em|strong|small|s|cite|q|dfn|abbr|data|time|code" + "|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo" + "|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b";

  block.html = replace(block.html)("comment", /<!--[\s\S]*?-->/)("closed", /<(tag)[\s\S]+?<\/\1>/)("closing", /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g, block._tag)();

  block.paragraph = replace(block.paragraph)("hr", block.hr)("heading", block.heading)("lheading", block.lheading)("blockquote", block.blockquote)("tag", "<" + block._tag)("def", block.def)();

  /**
   * Normal Block Grammar
   */

  block.normal = merge({}, block);

  /**
   * GFM Block Grammar
   */

  block.gfm = merge({}, block.normal, {
    fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
    paragraph: /^/
  });

  block.gfm.paragraph = replace(block.paragraph)("(?!", "(?!" + block.gfm.fences.source.replace("\\1", "\\2") + "|" + block.list.source.replace("\\1", "\\3") + "|")();

  /**
   * GFM + Tables Block Grammar
   */

  block.tables = merge({}, block.gfm, {
    nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
    table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
  });

  /**
   * Block Lexer
   */

  function Lexer(options) {
    this.tokens = [];
    this.tokens.links = {};
    this.options = options || marked.defaults;
    this.rules = block.normal;

    if (this.options.gfm) {
      if (this.options.tables) {
        this.rules = block.tables;
      } else {
        this.rules = block.gfm;
      }
    }
  }

  /**
   * Expose Block Rules
   */

  Lexer.rules = block;

  /**
   * Static Lex Method
   */

  Lexer.lex = function (src, options) {
    var lexer = new Lexer(options);
    return lexer.lex(src);
  };

  /**
   * Preprocessing
   */

  Lexer.prototype.lex = function (src) {
    src = src.replace(/\r\n|\r/g, "\n").replace(/\t/g, "    ").replace(/\u00a0/g, " ").replace(/\u2424/g, "\n");

    return this.token(src, true);
  };

  /**
   * Lexing
   */

  Lexer.prototype.token = function (src, top, bq) {
    var src = src.replace(/^ +$/gm, ""),
        next,
        loose,
        cap,
        bull,
        b,
        item,
        space,
        i,
        l;

    while (src) {
      // newline
      if (cap = this.rules.newline.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[0].length > 1) {
          this.tokens.push({
            type: "space"
          });
        }
      }

      // code
      if (cap = this.rules.code.exec(src)) {
        src = src.substring(cap[0].length);
        cap = cap[0].replace(/^ {4}/gm, "");
        this.tokens.push({
          type: "code",
          text: !this.options.pedantic ? cap.replace(/\n+$/, "") : cap
        });
        continue;
      }

      // fences (gfm)
      if (cap = this.rules.fences.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: "code",
          lang: cap[2],
          text: cap[3]
        });
        continue;
      }

      // heading
      if (cap = this.rules.heading.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: "heading",
          depth: cap[1].length,
          text: cap[2]
        });
        continue;
      }

      // table no leading pipe (gfm)
      if (top && (cap = this.rules.nptable.exec(src))) {
        src = src.substring(cap[0].length);

        item = {
          type: "table",
          header: cap[1].replace(/^ *| *\| *$/g, "").split(/ *\| */),
          align: cap[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
          cells: cap[3].replace(/\n$/, "").split("\n")
        };

        for (i = 0; i < item.align.length; i++) {
          if (/^ *-+: *$/.test(item.align[i])) {
            item.align[i] = "right";
          } else if (/^ *:-+: *$/.test(item.align[i])) {
            item.align[i] = "center";
          } else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = "left";
          } else {
            item.align[i] = null;
          }
        }

        for (i = 0; i < item.cells.length; i++) {
          item.cells[i] = item.cells[i].split(/ *\| */);
        }

        this.tokens.push(item);

        continue;
      }

      // lheading
      if (cap = this.rules.lheading.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: "heading",
          depth: cap[2] === "=" ? 1 : 2,
          text: cap[1]
        });
        continue;
      }

      // hr
      if (cap = this.rules.hr.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: "hr"
        });
        continue;
      }

      // blockquote
      if (cap = this.rules.blockquote.exec(src)) {
        src = src.substring(cap[0].length);

        this.tokens.push({
          type: "blockquote_start"
        });

        cap = cap[0].replace(/^ *> ?/gm, "");

        // Pass `top` to keep the current
        // "toplevel" state. This is exactly
        // how markdown.pl works.
        this.token(cap, top, true);

        this.tokens.push({
          type: "blockquote_end"
        });

        continue;
      }

      // list
      if (cap = this.rules.list.exec(src)) {
        src = src.substring(cap[0].length);
        bull = cap[2];

        this.tokens.push({
          type: "list_start",
          ordered: bull.length > 1
        });

        // Get each top-level item.
        cap = cap[0].match(this.rules.item);

        next = false;
        l = cap.length;
        i = 0;

        for (; i < l; i++) {
          item = cap[i];

          // Remove the list item's bullet
          // so it is seen as the next token.
          space = item.length;
          item = item.replace(/^ *([*+-]|\d+\.) +/, "");

          // Outdent whatever the
          // list item contains. Hacky.
          if (~item.indexOf("\n ")) {
            space -= item.length;
            item = !this.options.pedantic ? item.replace(new RegExp("^ {1," + space + "}", "gm"), "") : item.replace(/^ {1,4}/gm, "");
          }

          // Determine whether the next list item belongs here.
          // Backpedal if it does not belong in this list.
          if (this.options.smartLists && i !== l - 1) {
            b = block.bullet.exec(cap[i + 1])[0];
            if (bull !== b && !(bull.length > 1 && b.length > 1)) {
              src = cap.slice(i + 1).join("\n") + src;
              i = l - 1;
            }
          }

          // Determine whether item is loose or not.
          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
          // for discount behavior.
          loose = next || /\n\n(?!\s*$)/.test(item);
          if (i !== l - 1) {
            next = item.charAt(item.length - 1) === "\n";
            if (!loose) loose = next;
          }

          this.tokens.push({
            type: loose ? "loose_item_start" : "list_item_start"
          });

          // Recurse.
          this.token(item, false, bq);

          this.tokens.push({
            type: "list_item_end"
          });
        }

        this.tokens.push({
          type: "list_end"
        });

        continue;
      }

      // html
      if (cap = this.rules.html.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: this.options.sanitize ? "paragraph" : "html",
          pre: cap[1] === "pre" || cap[1] === "script" || cap[1] === "style",
          text: cap[0]
        });
        continue;
      }

      // def
      if (!bq && top && (cap = this.rules.def.exec(src))) {
        src = src.substring(cap[0].length);
        this.tokens.links[cap[1].toLowerCase()] = {
          href: cap[2],
          title: cap[3]
        };
        continue;
      }

      // table (gfm)
      if (top && (cap = this.rules.table.exec(src))) {
        src = src.substring(cap[0].length);

        item = {
          type: "table",
          header: cap[1].replace(/^ *| *\| *$/g, "").split(/ *\| */),
          align: cap[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
          cells: cap[3].replace(/(?: *\| *)?\n$/, "").split("\n")
        };

        for (i = 0; i < item.align.length; i++) {
          if (/^ *-+: *$/.test(item.align[i])) {
            item.align[i] = "right";
          } else if (/^ *:-+: *$/.test(item.align[i])) {
            item.align[i] = "center";
          } else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = "left";
          } else {
            item.align[i] = null;
          }
        }

        for (i = 0; i < item.cells.length; i++) {
          item.cells[i] = item.cells[i].replace(/^ *\| *| *\| *$/g, "").split(/ *\| */);
        }

        this.tokens.push(item);

        continue;
      }

      // top-level paragraph
      if (top && (cap = this.rules.paragraph.exec(src))) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: "paragraph",
          text: cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1]
        });
        continue;
      }

      // text
      if (cap = this.rules.text.exec(src)) {
        // Top-level should never reach here.
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: "text",
          text: cap[0]
        });
        continue;
      }

      if (src) {
        throw new Error("Infinite loop on byte: " + src.charCodeAt(0));
      }
    }

    return this.tokens;
  };

  /**
   * Inline-Level Grammar
   */

  var inline = {
    escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
    autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
    url: noop,
    tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
    link: /^!?\[(inside)\]\(href\)/,
    reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
    nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
    strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
    em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
    code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    br: /^ {2,}\n(?!\s*$)/,
    del: noop,
    text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
  };

  inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
  inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

  inline.link = replace(inline.link)("inside", inline._inside)("href", inline._href)();

  inline.reflink = replace(inline.reflink)("inside", inline._inside)();

  /**
   * Normal Inline Grammar
   */

  inline.normal = merge({}, inline);

  /**
   * Pedantic Inline Grammar
   */

  inline.pedantic = merge({}, inline.normal, {
    strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
  });

  /**
   * GFM Inline Grammar
   */

  inline.gfm = merge({}, inline.normal, {
    escape: replace(inline.escape)("])", "~|])")(),
    url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
    del: /^~~(?=\S)([\s\S]*?\S)~~/,
    text: replace(inline.text)("]|", "~]|")("|", "|https?://|")()
  });

  /**
   * GFM + Line Breaks Inline Grammar
   */

  inline.breaks = merge({}, inline.gfm, {
    br: replace(inline.br)("{2,}", "*")(),
    text: replace(inline.gfm.text)("{2,}", "*")()
  });

  /**
   * Inline Lexer & Compiler
   */

  function InlineLexer(links, options) {
    this.options = options || marked.defaults;
    this.links = links;
    this.rules = inline.normal;
    this.renderer = this.options.renderer || new Renderer();
    this.renderer.options = this.options;

    if (!this.links) {
      throw new Error("Tokens array requires a `links` property.");
    }

    if (this.options.gfm) {
      if (this.options.breaks) {
        this.rules = inline.breaks;
      } else {
        this.rules = inline.gfm;
      }
    } else if (this.options.pedantic) {
      this.rules = inline.pedantic;
    }
  }

  /**
   * Expose Inline Rules
   */

  InlineLexer.rules = inline;

  /**
   * Static Lexing/Compiling Method
   */

  InlineLexer.output = function (src, links, options) {
    var inline = new InlineLexer(links, options);
    return inline.output(src);
  };

  /**
   * Lexing/Compiling
   */

  InlineLexer.prototype.output = function (src) {
    var out = "",
        link,
        text,
        href,
        cap;

    while (src) {
      // escape
      if (cap = this.rules.escape.exec(src)) {
        src = src.substring(cap[0].length);
        out += cap[1];
        continue;
      }

      // autolink
      if (cap = this.rules.autolink.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[2] === "@") {
          text = cap[1].charAt(6) === ":" ? this.mangle(cap[1].substring(7)) : this.mangle(cap[1]);
          href = this.mangle("mailto:") + text;
        } else {
          text = escape(cap[1]);
          href = text;
        }
        out += this.renderer.link(href, null, text);
        continue;
      }

      // url (gfm)
      if (!this.inLink && (cap = this.rules.url.exec(src))) {
        src = src.substring(cap[0].length);
        text = escape(cap[1]);
        href = text;
        out += this.renderer.link(href, null, text);
        continue;
      }

      // tag
      if (cap = this.rules.tag.exec(src)) {
        if (!this.inLink && /^<a /i.test(cap[0])) {
          this.inLink = true;
        } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
          this.inLink = false;
        }
        src = src.substring(cap[0].length);
        out += this.options.sanitize ? escape(cap[0]) : cap[0];
        continue;
      }

      // link
      if (cap = this.rules.link.exec(src)) {
        src = src.substring(cap[0].length);
        this.inLink = true;
        out += this.outputLink(cap, {
          href: cap[2],
          title: cap[3]
        });
        this.inLink = false;
        continue;
      }

      // reflink, nolink
      if ((cap = this.rules.reflink.exec(src)) || (cap = this.rules.nolink.exec(src))) {
        src = src.substring(cap[0].length);
        link = (cap[2] || cap[1]).replace(/\s+/g, " ");
        link = this.links[link.toLowerCase()];
        if (!link || !link.href) {
          out += cap[0].charAt(0);
          src = cap[0].substring(1) + src;
          continue;
        }
        this.inLink = true;
        out += this.outputLink(cap, link);
        this.inLink = false;
        continue;
      }

      // strong
      if (cap = this.rules.strong.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.strong(this.output(cap[2] || cap[1]));
        continue;
      }

      // em
      if (cap = this.rules.em.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.em(this.output(cap[2] || cap[1]));
        continue;
      }

      // code
      if (cap = this.rules.code.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.codespan(escape(cap[2], true));
        continue;
      }

      // br
      if (cap = this.rules.br.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.br();
        continue;
      }

      // del (gfm)
      if (cap = this.rules.del.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.del(this.output(cap[1]));
        continue;
      }

      // text
      if (cap = this.rules.text.exec(src)) {
        src = src.substring(cap[0].length);
        out += escape(this.smartypants(cap[0]));
        continue;
      }

      if (src) {
        throw new Error("Infinite loop on byte: " + src.charCodeAt(0));
      }
    }

    return out;
  };

  /**
   * Compile Link
   */

  InlineLexer.prototype.outputLink = function (cap, link) {
    var href = escape(link.href),
        title = link.title ? escape(link.title) : null;

    return cap[0].charAt(0) !== "!" ? this.renderer.link(href, title, this.output(cap[1])) : this.renderer.image(href, title, escape(cap[1]));
  };

  /**
   * Smartypants Transformations
   */

  InlineLexer.prototype.smartypants = function (text) {
    if (!this.options.smartypants) return text;
    return text
    // em-dashes
    .replace(/--/g, "—")
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1‘")
    // closing singles & apostrophes
    .replace(/'/g, "’")
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1“")
    // closing doubles
    .replace(/"/g, "”")
    // ellipses
    .replace(/\.{3}/g, "…");
  };

  /**
   * Mangle Links
   */

  InlineLexer.prototype.mangle = function (text) {
    var out = "",
        l = text.length,
        i = 0,
        ch;

    for (; i < l; i++) {
      ch = text.charCodeAt(i);
      if (Math.random() > 0.5) {
        ch = "x" + ch.toString(16);
      }
      out += "&#" + ch + ";";
    }

    return out;
  };

  /**
   * Renderer
   */

  function Renderer(options) {
    this.options = options || {};
  }

  Renderer.prototype.code = function (code, lang, escaped) {
    if (this.options.highlight) {
      var out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    if (!lang) {
      return "<pre><code>" + (escaped ? code : escape(code, true)) + "\n</code></pre>";
    }

    return "<pre><code class=\"" + this.options.langPrefix + escape(lang, true) + "\">" + (escaped ? code : escape(code, true)) + "\n</code></pre>\n";
  };

  Renderer.prototype.blockquote = function (quote) {
    return "<blockquote>\n" + quote + "</blockquote>\n";
  };

  Renderer.prototype.html = function (html) {
    return html;
  };

  Renderer.prototype.heading = function (text, level, raw) {
    return "<h" + level + " id=\"" + this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, "-") + "\">" + text + "</h" + level + ">\n";
  };

  Renderer.prototype.hr = function () {
    return this.options.xhtml ? "<hr/>\n" : "<hr>\n";
  };

  Renderer.prototype.list = function (body, ordered) {
    var type = ordered ? "ol" : "ul";
    return "<" + type + ">\n" + body + "</" + type + ">\n";
  };

  Renderer.prototype.listitem = function (text) {
    return "<li>" + text + "</li>\n";
  };

  Renderer.prototype.paragraph = function (text) {
    return "<p>" + text + "</p>\n";
  };

  Renderer.prototype.table = function (header, body) {
    return "<table>\n" + "<thead>\n" + header + "</thead>\n" + "<tbody>\n" + body + "</tbody>\n" + "</table>\n";
  };

  Renderer.prototype.tablerow = function (content) {
    return "<tr>\n" + content + "</tr>\n";
  };

  Renderer.prototype.tablecell = function (content, flags) {
    var type = flags.header ? "th" : "td";
    var tag = flags.align ? "<" + type + " style=\"text-align:" + flags.align + "\">" : "<" + type + ">";
    return tag + content + "</" + type + ">\n";
  };

  // span level renderer
  Renderer.prototype.strong = function (text) {
    return "<strong>" + text + "</strong>";
  };

  Renderer.prototype.em = function (text) {
    return "<em>" + text + "</em>";
  };

  Renderer.prototype.codespan = function (text) {
    return "<code>" + text + "</code>";
  };

  Renderer.prototype.br = function () {
    return this.options.xhtml ? "<br/>" : "<br>";
  };

  Renderer.prototype.del = function (text) {
    return "<del>" + text + "</del>";
  };

  Renderer.prototype.link = function (href, title, text) {
    if (this.options.sanitize) {
      try {
        var prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g, "").toLowerCase();
      } catch (e) {
        return "";
      }
      if (prot.indexOf("javascript:") === 0 || prot.indexOf("vbscript:") === 0) {
        return "";
      }
    }
    var out = "<a href=\"" + href + "\"";
    if (title) {
      out += " title=\"" + title + "\"";
    }
    out += ">" + text + "</a>";
    return out;
  };

  Renderer.prototype.image = function (href, title, text) {
    var out = "<img src=\"" + href + "\" alt=\"" + text + "\"";
    if (title) {
      out += " title=\"" + title + "\"";
    }
    out += this.options.xhtml ? "/>" : ">";
    return out;
  };

  /**
   * Parsing & Compiling
   */

  function Parser(options) {
    this.tokens = [];
    this.token = null;
    this.options = options || marked.defaults;
    this.options.renderer = this.options.renderer || new Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
  }

  /**
   * Static Parse Method
   */

  Parser.parse = function (src, options, renderer) {
    var parser = new Parser(options, renderer);
    return parser.parse(src);
  };

  /**
   * Parse Loop
   */

  Parser.prototype.parse = function (src) {
    this.inline = new InlineLexer(src.links, this.options, this.renderer);
    this.tokens = src.reverse();

    var out = "";
    while (this.next()) {
      out += this.tok();
    }

    return out;
  };

  /**
   * Next Token
   */

  Parser.prototype.next = function () {
    return this.token = this.tokens.pop();
  };

  /**
   * Preview Next Token
   */

  Parser.prototype.peek = function () {
    return this.tokens[this.tokens.length - 1] || 0;
  };

  /**
   * Parse Text Tokens
   */

  Parser.prototype.parseText = function () {
    var body = this.token.text;

    while (this.peek().type === "text") {
      body += "\n" + this.next().text;
    }

    return this.inline.output(body);
  };

  /**
   * Parse Current Token
   */

  Parser.prototype.tok = function () {
    switch (this.token.type) {
      case "space":
        {
          return "";
        }
      case "hr":
        {
          return this.renderer.hr();
        }
      case "heading":
        {
          return this.renderer.heading(this.inline.output(this.token.text), this.token.depth, this.token.text);
        }
      case "code":
        {
          return this.renderer.code(this.token.text, this.token.lang, this.token.escaped);
        }
      case "table":
        {
          var header = "",
              body = "",
              i,
              row,
              cell,
              flags,
              j;

          // header
          cell = "";
          for (i = 0; i < this.token.header.length; i++) {
            flags = { header: true, align: this.token.align[i] };
            cell += this.renderer.tablecell(this.inline.output(this.token.header[i]), { header: true, align: this.token.align[i] });
          }
          header += this.renderer.tablerow(cell);

          for (i = 0; i < this.token.cells.length; i++) {
            row = this.token.cells[i];

            cell = "";
            for (j = 0; j < row.length; j++) {
              cell += this.renderer.tablecell(this.inline.output(row[j]), { header: false, align: this.token.align[j] });
            }

            body += this.renderer.tablerow(cell);
          }
          return this.renderer.table(header, body);
        }
      case "blockquote_start":
        {
          var body = "";

          while (this.next().type !== "blockquote_end") {
            body += this.tok();
          }

          return this.renderer.blockquote(body);
        }
      case "list_start":
        {
          var body = "",
              ordered = this.token.ordered;

          while (this.next().type !== "list_end") {
            body += this.tok();
          }

          return this.renderer.list(body, ordered);
        }
      case "list_item_start":
        {
          var body = "";

          while (this.next().type !== "list_item_end") {
            body += this.token.type === "text" ? this.parseText() : this.tok();
          }

          return this.renderer.listitem(body);
        }
      case "loose_item_start":
        {
          var body = "";

          while (this.next().type !== "list_item_end") {
            body += this.tok();
          }

          return this.renderer.listitem(body);
        }
      case "html":
        {
          var html = !this.token.pre && !this.options.pedantic ? this.inline.output(this.token.text) : this.token.text;
          return this.renderer.html(html);
        }
      case "paragraph":
        {
          return this.renderer.paragraph(this.inline.output(this.token.text));
        }
      case "text":
        {
          return this.renderer.paragraph(this.parseText());
        }
    }
  };

  /**
   * Helpers
   */

  function escape(html, encode) {
    return html.replace(!encode ? /&(?!#?\w+;)/g : /&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function unescape(html) {
    return html.replace(/&([#\w]+);/g, function (_, n) {
      n = n.toLowerCase();
      if (n === "colon") return ":";
      if (n.charAt(0) === "#") {
        return n.charAt(1) === "x" ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
      }
      return "";
    });
  }

  function replace(regex, opt) {
    regex = regex.source;
    opt = opt || "";
    return function self(name, val) {
      if (!name) {
        return new RegExp(regex, opt);
      }val = val.source || val;
      val = val.replace(/(^|[^\[])\^/g, "$1");
      regex = regex.replace(name, val);
      return self;
    };
  }

  function noop() {}
  noop.exec = noop;

  function merge(obj) {
    var i = 1,
        target,
        key;

    for (; i < arguments.length; i++) {
      target = arguments[i];
      for (key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          obj[key] = target[key];
        }
      }
    }

    return obj;
  }

  /**
   * Marked
   */

  function marked(src, opt, callback) {
    if (callback || typeof opt === "function") {
      if (!callback) {
        callback = opt;
        opt = null;
      }

      opt = merge({}, marked.defaults, opt || {});

      var highlight = opt.highlight,
          tokens,
          pending,
          i = 0;

      try {
        tokens = Lexer.lex(src, opt);
      } catch (e) {
        return callback(e);
      }

      pending = tokens.length;

      var done = function done(err) {
        if (err) {
          opt.highlight = highlight;
          return callback(err);
        }

        var out;

        try {
          out = Parser.parse(tokens, opt);
        } catch (e) {
          err = e;
        }

        opt.highlight = highlight;

        return err ? callback(err) : callback(null, out);
      };

      if (!highlight || highlight.length < 3) {
        return done();
      }

      delete opt.highlight;

      if (!pending) {
        return done();
      }for (; i < tokens.length; i++) {
        (function (token) {
          if (token.type !== "code") {
            return --pending || done();
          }
          return highlight(token.text, token.lang, function (err, code) {
            if (err) return done(err);
            if (code == null || code === token.text) {
              return --pending || done();
            }
            token.text = code;
            token.escaped = true;
            --pending || done();
          });
        })(tokens[i]);
      }

      return;
    }
    try {
      if (opt) opt = merge({}, marked.defaults, opt);
      return Parser.parse(Lexer.lex(src, opt), opt);
    } catch (e) {
      e.message += "\nPlease report this to https://github.com/chjj/marked.";
      if ((opt || marked.defaults).silent) {
        return "<p>An error occured:</p><pre>" + escape(e.message + "", true) + "</pre>";
      }
      throw e;
    }
  }

  /**
   * Options
   */

  marked.options = marked.setOptions = function (opt) {
    merge(marked.defaults, opt);
    return marked;
  };

  marked.defaults = {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: false,
    silent: false,
    highlight: null,
    langPrefix: "lang-",
    smartypants: false,
    headerPrefix: "",
    renderer: new Renderer(),
    xhtml: false
  };

  /**
   * Expose
   */

  marked.Parser = Parser;
  marked.parser = Parser.parse;

  marked.Renderer = Renderer;

  marked.Lexer = Lexer;
  marked.lexer = Lexer.lex;

  marked.InlineLexer = InlineLexer;
  marked.inlineLexer = InlineLexer.output;

  marked.parse = marked;

  if (typeof module !== "undefined" && typeof exports === "object") {
    module.exports = marked;
  } else if (typeof define === "function" && define.amd) {
    define(function () {
      return marked;
    });
  } else {
    this.marked = marked;
  }
}).call((function () {
  return this || (typeof window !== "undefined" ? window : global);
})());
}, {}],
5: [function(require, module, exports) {
"use strict";

/**
 * Module dependencies.
 */

try {
  var EventEmitter = require("events").EventEmitter;
} catch (err) {
  var Emitter = require("emitter");
}

/**
 * Noop.
 */

function noop() {}

/**
 * Expose `Batch`.
 */

module.exports = Batch;

/**
 * Create a new Batch.
 */

function Batch() {
  if (!(this instanceof Batch)) {
    return new Batch();
  }this.fns = [];
  this.concurrency(Infinity);
  this.throws(true);
  for (var i = 0, len = arguments.length; i < len; ++i) {
    this.push(arguments[i]);
  }
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

if (EventEmitter) {
  Batch.prototype.__proto__ = EventEmitter.prototype;
} else {
  Emitter(Batch.prototype);
}

/**
 * Set concurrency to `n`.
 *
 * @param {Number} n
 * @return {Batch}
 * @api public
 */

Batch.prototype.concurrency = function (n) {
  this.n = n;
  return this;
};

/**
 * Queue a function.
 *
 * @param {Function} fn
 * @return {Batch}
 * @api public
 */

Batch.prototype.push = function (fn) {
  this.fns.push(fn);
  return this;
};

/**
 * Set wether Batch will or will not throw up.
 *
 * @param  {Boolean} throws
 * @return {Batch}
 * @api public
 */
Batch.prototype.throws = function (throws) {
  this.e = !!throws;
  return this;
};

/**
 * Execute all queued functions in parallel,
 * executing `cb(err, results)`.
 *
 * @param {Function} cb
 * @return {Batch}
 * @api public
 */

Batch.prototype.end = function (cb) {
  var self = this,
      total = this.fns.length,
      pending = total,
      results = [],
      errors = [],
      cb = cb || noop,
      fns = this.fns,
      max = this.n,
      throws = this.e,
      index = 0,
      done;

  // empty
  if (!fns.length) return cb(null, results);

  // process
  function next() {
    var i = index++;
    var fn = fns[i];
    if (!fn) {
      return;
    }var start = new Date();

    try {
      fn(callback);
    } catch (err) {
      callback(err);
    }

    function callback(err, res) {
      if (done) {
        return;
      }if (err && throws) {
        return (done = true, cb(err));
      }var complete = total - pending + 1;
      var end = new Date();

      results[i] = res;
      errors[i] = err;

      self.emit("progress", {
        index: i,
        value: res,
        error: err,
        pending: pending,
        total: total,
        complete: complete,
        percent: complete / total * 100 | 0,
        start: start,
        end: end,
        duration: end - start
      });

      if (--pending) next();else if (!throws) cb(errors, results);else cb(null, results);
    }
  }

  // concurrency
  for (var i = 0; i < fns.length; i++) {
    if (i == max) break;
    next();
  }

  return this;
};
}, {"emitter":67}]}, {}, {"1":""})
