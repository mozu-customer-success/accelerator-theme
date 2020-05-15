
// Placeholder script for the theme packager. Must be present and empty, but can be ignored after that.;
define("modules/common", function(){});

/**
 * Creates an interface object to the Mozu store's Web APIs. It pulls in the Mozu
 * JavaScript SDK and initializes it with the current store's context values
 * (tenant, catalog and store IDs, and authorization tickets).
 */

define('modules/api',['sdk', 'jquery', 'hyprlive'], function (Mozu, $, Hypr) { 
    var apiConfig = require.mozuData('apicontext');
    Mozu.setServiceUrls(apiConfig.urls);
    var api = Mozu.Store(apiConfig.headers).api();

    var extendedPropertyParameters = Hypr.getThemeSetting('extendedPropertyParameters');
    if (extendedPropertyParameters && Hypr.getThemeSetting('extendedPropertiesEnabled')) {
        api.setAffiliateTrackingParameters(extendedPropertyParameters.split(','));
    }

    if (Hypr.getThemeSetting('useDebugScripts') || require.mozuData('pagecontext').isDebugMode) {
        api.on('error', function (badPromise, xhr, requestConf) {
            var e = "Error communicating with Mozu web services";
            if (requestConf && requestConf.url) e += (" at " + requestConf.url);
            var correlation = xhr && xhr.getResponseHeader && xhr.getResponseHeader('x-vol-correlation');
            if (correlation) e += " --- Correlation ID: " + correlation;
            //if (window && window.console) window.console.error(e, badPromise, xhr);
        });
    }
    return api;
});

//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this ||
            {};

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.9.1';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      // The 2-argument case is omitted because we’re not using it.
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  var builtinIteratee;

  // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  };

  // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.
  _.iteratee = builtinIteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // Some functions take a variable number of arguments, or a few expected
  // arguments at the beginning and then a variable number of values to operate
  // on. This helper accumulates all remaining arguments past the function’s
  // argument length (or an explicit `startIndex`), into an array that becomes
  // the last argument. Similar to ES6’s "rest parameter".
  var restArguments = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var has = function(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  }

  var deepGet = function(obj, path) {
    var length = path.length;
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }
    return length ? obj : void 0;
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  var createReduce = function(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function(obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = restArguments(function(obj, path, args) {
    var contextPath, func;
    if (_.isFunction(path)) {
      func = path;
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }
    return _.map(obj, function(context) {
      var method = func;
      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }
        if (context == null) return void 0;
        method = context[path];
      }
      return method == null ? method : method.apply(context, args);
    });
  });

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection.
  _.shuffle = function(obj) {
    return _.sample(obj, Infinity);
  };

  // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior, partition) {
    return function(obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (has(result, key)) result[key]++; else result[key] = 1;
  });

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, Boolean);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = restArguments(function(array, otherArrays) {
    return _.difference(array, otherArrays);
  });

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = restArguments(function(arrays) {
    return _.uniq(flatten(arrays, true, true));
  });

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = restArguments(function(array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  });

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = restArguments(_.unzip);

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of _.pairs.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions.
  var createPredicateIndexFinder = function(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test.
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions.
  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.
  _.chunk = function(array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0, length = array.length;
    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = restArguments(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
  _.partial = restArguments(function(func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  _.partial.placeholder = _;

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = restArguments(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  });

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = restArguments(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
  });

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;

    var later = function(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function(args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  _.restArguments = restArguments;

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
        length = keys.length,
        results = {};
    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  // The opposite of _.object.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, defaults) {
    return function(obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test.
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Internal pick helper function to determine if `obj` has key `key`.
  var keyInObj = function(value, key, obj) {
    return key in obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = restArguments(function(obj, keys) {
    var result = {}, iteratee = keys[0];
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

  // Return a copy of the object without the blacklisted properties.
  _.omit = restArguments(function(obj, keys) {
    var iteratee = keys[0], context;
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  });

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
  var nodelist = root.document && root.document.childNodes;
  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, path) {
    if (!_.isArray(path)) {
      return has(obj, path);
    }
    var length = path.length;
    for (var i = 0; i < length; i++) {
      var key = path[i];
      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }
      obj = obj[key];
    }
    return !!length;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  // Creates a function that, when passed an object, will traverse that object’s
  // properties down the given `path`, specified as an array of keys or indexes.
  _.property = function(path) {
    if (!_.isArray(path)) {
      return shallowProperty(path);
    }
    return function(obj) {
      return deepGet(obj, path);
    };
  };

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    if (obj == null) {
      return function(){};
    }
    return function(path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.
  _.result = function(obj, path, fallback) {
    if (!_.isArray(path)) path = [path];
    var length = path.length;
    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
    }
    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];
      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }
      obj = _.isFunction(prop) ? prop.call(obj) : prop;
    }
    return obj;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var chainResult = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return String(this._wrapped);
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define == 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}());

//     Backbone.js 1.4.0

//     (c) 2010-2019 Jeremy Ashkenas and DocumentCloud
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global;

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define('backbone',['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'), $;
    try { $ = require('jquery'); } catch (e) {}
    factory(root, exports, _, $);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, root.jQuery || root.Zepto || root.ender || root.$);
  }

})(function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to a common array method we'll want to use later.
  var slice = Array.prototype.slice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.4.0';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... this will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // a custom event channel. You may bind a callback to an event with `on` or
  // remove with `off`; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {};

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // A private global variable to share between listeners and listenees.
  var _listening;

  // Iterates over the standard `event, callback` (as well as the fancy multiple
  // space-separated events `"change blur", callback` and jQuery-style event
  // maps `{event: callback}`).
  var eventsApi = function(iteratee, events, name, callback, opts) {
    var i = 0, names;
    if (name && typeof name === 'object') {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
      for (names = _.keys(name); i < names.length ; i++) {
        events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
      }
    } else if (name && eventSplitter.test(name)) {
      // Handle space-separated event names by delegating them individually.
      for (names = name.split(eventSplitter); i < names.length; i++) {
        events = iteratee(events, names[i], callback, opts);
      }
    } else {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
    }
    return events;
  };

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  Events.on = function(name, callback, context) {
    this._events = eventsApi(onApi, this._events || {}, name, callback, {
      context: context,
      ctx: this,
      listening: _listening
    });

    if (_listening) {
      var listeners = this._listeners || (this._listeners = {});
      listeners[_listening.id] = _listening;
      // Allow the listening to use a counter, instead of tracking
      // callbacks for library interop
      _listening.interop = false;
    }

    return this;
  };

  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to
  // for easier unbinding later.
  Events.listenTo = function(obj, name, callback) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = _listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      this._listenId || (this._listenId = _.uniqueId('l'));
      listening = _listening = listeningTo[id] = new Listening(this, obj);
    }

    // Bind callbacks on obj.
    var error = tryCatchOn(obj, name, callback, this);
    _listening = void 0;

    if (error) throw error;
    // If the target obj is not Backbone.Events, track events manually.
    if (listening.interop) listening.on(name, callback);

    return this;
  };

  // The reducing API that adds a callback to the `events` object.
  var onApi = function(events, name, callback, options) {
    if (callback) {
      var handlers = events[name] || (events[name] = []);
      var context = options.context, ctx = options.ctx, listening = options.listening;
      if (listening) listening.count++;

      handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening});
    }
    return events;
  };

  // An try-catch guarded #on function, to prevent poisoning the global
  // `_listening` variable.
  var tryCatchOn = function(obj, name, callback, context) {
    try {
      obj.on(name, callback, context);
    } catch (e) {
      return e;
    }
  };

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  Events.off = function(name, callback, context) {
    if (!this._events) return this;
    this._events = eventsApi(offApi, this._events, name, callback, {
      context: context,
      listeners: this._listeners
    });

    return this;
  };

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  Events.stopListening = function(obj, name, callback) {
    var listeningTo = this._listeningTo;
    if (!listeningTo) return this;

    var ids = obj ? [obj._listenId] : _.keys(listeningTo);
    for (var i = 0; i < ids.length; i++) {
      var listening = listeningTo[ids[i]];

      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) break;

      listening.obj.off(name, callback, this);
      if (listening.interop) listening.off(name, callback);
    }
    if (_.isEmpty(listeningTo)) this._listeningTo = void 0;

    return this;
  };

  // The reducing API that removes a callback from the `events` object.
  var offApi = function(events, name, callback, options) {
    if (!events) return;

    var context = options.context, listeners = options.listeners;
    var i = 0, names;

    // Delete all event listeners and "drop" events.
    if (!name && !context && !callback) {
      for (names = _.keys(listeners); i < names.length; i++) {
        listeners[names[i]].cleanup();
      }
      return;
    }

    names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
      name = names[i];
      var handlers = events[name];

      // Bail out if there are no events stored.
      if (!handlers) break;

      // Find any remaining events.
      var remaining = [];
      for (var j = 0; j < handlers.length; j++) {
        var handler = handlers[j];
        if (
          callback && callback !== handler.callback &&
            callback !== handler.callback._callback ||
              context && context !== handler.context
        ) {
          remaining.push(handler);
        } else {
          var listening = handler.listening;
          if (listening) listening.off(name, callback);
        }
      }

      // Replace events if there are any remaining.  Otherwise, clean up.
      if (remaining.length) {
        events[name] = remaining;
      } else {
        delete events[name];
      }
    }

    return events;
  };

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  Events.once = function(name, callback, context) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, this.off.bind(this));
    if (typeof name === 'string' && context == null) callback = void 0;
    return this.on(events, callback, context);
  };

  // Inversion-of-control versions of `once`.
  Events.listenToOnce = function(obj, name, callback) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, this.stopListening.bind(this, obj));
    return this.listenTo(obj, events);
  };

  // Reduces the event callbacks into a map of `{event: onceWrapper}`.
  // `offer` unbinds the `onceWrapper` after it has been called.
  var onceMap = function(map, name, callback, offer) {
    if (callback) {
      var once = map[name] = _.once(function() {
        offer(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
    }
    return map;
  };

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  Events.trigger = function(name) {
    if (!this._events) return this;

    var length = Math.max(0, arguments.length - 1);
    var args = Array(length);
    for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

    eventsApi(triggerApi, this._events, name, void 0, args);
    return this;
  };

  // Handles triggering the appropriate event callbacks.
  var triggerApi = function(objEvents, name, callback, args) {
    if (objEvents) {
      var events = objEvents[name];
      var allEvents = objEvents.all;
      if (events && allEvents) allEvents = allEvents.slice();
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, [name].concat(args));
    }
    return objEvents;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  // A listening class that tracks and cleans up memory bindings
  // when all callbacks have been offed.
  var Listening = function(listener, obj) {
    this.id = listener._listenId;
    this.listener = listener;
    this.obj = obj;
    this.interop = true;
    this.count = 0;
    this._events = void 0;
  };

  Listening.prototype.on = Events.on;

  // Offs a callback (or several).
  // Uses an optimized counter if the listenee uses Backbone.Events.
  // Otherwise, falls back to manual tracking to support events
  // library interop.
  Listening.prototype.off = function(name, callback) {
    var cleanup;
    if (this.interop) {
      this._events = eventsApi(offApi, this._events, name, callback, {
        context: void 0,
        listeners: void 0
      });
      cleanup = !this._events;
    } else {
      this.count--;
      cleanup = this.count === 0;
    }
    if (cleanup) this.cleanup();
  };

  // Cleans up memory bindings between the listener and the listenee.
  Listening.prototype.cleanup = function() {
    delete this.listener._listeningTo[this.obj._listenId];
    if (!this.interop) delete this.obj._listeners[this.id];
  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    this.cid = _.uniqueId(this.cidPrefix);
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    var defaults = _.result(this, 'defaults');
    attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // The prefix is used to create the client id which is used to identify models locally.
    // You may want to override this if you're experiencing name clashes with model ids.
    cidPrefix: 'c',

    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the Model.
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Special-cased proxy to underscore's `_.matches` method.
    matches: function(attrs) {
      return !!_.iteratee(attrs, this)(this.attributes);
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      var unset      = options.unset;
      var silent     = options.silent;
      var changes    = [];
      var changing   = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }

      var current = this.attributes;
      var changed = this.changed;
      var prev    = this._previousAttributes;

      // For each `set` attribute, update or delete the current value.
      for (var attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          changed[attr] = val;
        } else {
          delete changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Update the `id`.
      if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0; i < changes.length; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      var changed = {};
      var hasChanged;
      for (var attr in diff) {
        var val = diff[attr];
        if (_.isEqual(old[attr], val)) continue;
        changed[attr] = val;
        hasChanged = true;
      }
      return hasChanged ? changed : false;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server, merging the response with the model's
    // local attributes. Any changed attributes will trigger a "change" event.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (!model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true, parse: true}, options);
      var wait = options.wait;

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !wait) {
        if (!this.set(attrs, options)) return false;
      } else if (!this._validate(attrs, options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      var attributes = this.attributes;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
        if (serverAttrs && !model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      // Set temporary attributes if `{wait: true}` to properly find new ids.
      if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

      var method = this.isNew() ? 'create' : options.patch ? 'patch' : 'update';
      if (method === 'patch' && !options.attrs) options.attrs = attrs;
      var xhr = this.sync(method, this, options);

      // Restore attributes.
      this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      var wait = options.wait;

      var destroy = function() {
        model.stopListening();
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (wait) destroy();
        if (success) success.call(options.context, model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      var xhr = false;
      if (this.isNew()) {
        _.defer(options.success);
      } else {
        wrapError(this, options);
        xhr = this.sync('delete', this, options);
      }
      if (!wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      var id = this.get(this.idAttribute);
      return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend({}, options, {validate: true}));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analogous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Splices `insert` into `array` at index `at`.
  var splice = function(array, insert, at) {
    at = Math.min(Math.max(at, 0), array.length);
    var tail = Array(array.length - at);
    var length = insert.length;
    var i;
    for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
    for (i = 0; i < length; i++) array[i + at] = insert[i];
    for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,


    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the Collection.
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model) { return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set. `models` may be Backbone
    // Models or raw JavaScript objects to be converted to Models, or any
    // combination of the two.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      options = _.extend({}, options);
      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();
      var removed = this._removeModels(models, options);
      if (!options.silent && removed.length) {
        options.changes = {added: [], merged: [], removed: removed};
        this.trigger('update', this, options);
      }
      return singular ? removed[0] : removed;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      if (models == null) return;

      options = _.extend({}, setOptions, options);
      if (options.parse && !this._isModel(models)) {
        models = this.parse(models, options) || [];
      }

      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();

      var at = options.at;
      if (at != null) at = +at;
      if (at > this.length) at = this.length;
      if (at < 0) at += this.length + 1;

      var set = [];
      var toAdd = [];
      var toMerge = [];
      var toRemove = [];
      var modelMap = {};

      var add = options.add;
      var merge = options.merge;
      var remove = options.remove;

      var sort = false;
      var sortable = this.comparator && at == null && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      var model, i;
      for (i = 0; i < models.length; i++) {
        model = models[i];

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        var existing = this.get(model);
        if (existing) {
          if (merge && model !== existing) {
            var attrs = this._isModel(model) ? model.attributes : model;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            toMerge.push(existing);
            if (sortable && !sort) sort = existing.hasChanged(sortAttr);
          }
          if (!modelMap[existing.cid]) {
            modelMap[existing.cid] = true;
            set.push(existing);
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(model, options);
          if (model) {
            toAdd.push(model);
            this._addReference(model, options);
            modelMap[model.cid] = true;
            set.push(model);
          }
        }
      }

      // Remove stale models.
      if (remove) {
        for (i = 0; i < this.length; i++) {
          model = this.models[i];
          if (!modelMap[model.cid]) toRemove.push(model);
        }
        if (toRemove.length) this._removeModels(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      var orderChanged = false;
      var replace = !sortable && add && remove;
      if (set.length && replace) {
        orderChanged = this.length !== set.length || _.some(this.models, function(m, index) {
          return m !== set[index];
        });
        this.models.length = 0;
        splice(this.models, set, 0);
        this.length = this.models.length;
      } else if (toAdd.length) {
        if (sortable) sort = true;
        splice(this.models, toAdd, at == null ? this.length : at);
        this.length = this.models.length;
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort/update events.
      if (!options.silent) {
        for (i = 0; i < toAdd.length; i++) {
          if (at != null) options.index = at + i;
          model = toAdd[i];
          model.trigger('add', model, this, options);
        }
        if (sort || orderChanged) this.trigger('sort', this, options);
        if (toAdd.length || toRemove.length || toMerge.length) {
          options.changes = {
            added: toAdd,
            removed: toRemove,
            merged: toMerge
          };
          this.trigger('update', this, options);
        }
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options = options ? _.clone(options) : {};
      for (var i = 0; i < this.models.length; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      return this.remove(model, options);
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      return this.remove(model, options);
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id, cid, model object with id or cid
    // properties, or an attributes object that is transformed through modelId.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] ||
        this._byId[this.modelId(this._isModel(obj) ? obj.attributes : obj)] ||
        obj.cid && this._byId[obj.cid];
    },

    // Returns `true` if the model is in the collection.
    has: function(obj) {
      return this.get(obj) != null;
    },

    // Get the model at the given index.
    at: function(index) {
      if (index < 0) index += this.length;
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      return this[first ? 'find' : 'filter'](attrs);
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      var comparator = this.comparator;
      if (!comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      var length = comparator.length;
      if (_.isFunction(comparator)) comparator = comparator.bind(this);

      // Run sort based on type of `comparator`.
      if (length === 1 || _.isString(comparator)) {
        this.models = this.sortBy(comparator);
      } else {
        this.models.sort(comparator);
      }
      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return this.map(attr + '');
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success.call(options.context, collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      var wait = options.wait;
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(m, resp, callbackOpts) {
        if (wait) collection.add(m, callbackOpts);
        if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models, {
        model: this.model,
        comparator: this.comparator
      });
    },

    // Define how to uniquely identify models in the collection.
    modelId: function(attrs) {
      return attrs[this.model.prototype.idAttribute || 'id'];
    },

    // Get an iterator of all models in this collection.
    values: function() {
      return new CollectionIterator(this, ITERATOR_VALUES);
    },

    // Get an iterator of all model IDs in this collection.
    keys: function() {
      return new CollectionIterator(this, ITERATOR_KEYS);
    },

    // Get an iterator of all [ID, model] tuples in this collection.
    entries: function() {
      return new CollectionIterator(this, ITERATOR_KEYSVALUES);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (this._isModel(attrs)) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method called by both remove and set.
    _removeModels: function(models, options) {
      var removed = [];
      for (var i = 0; i < models.length; i++) {
        var model = this.get(models[i]);
        if (!model) continue;

        var index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;

        // Remove references before triggering 'remove' event to prevent an
        // infinite loop. #3693
        delete this._byId[model.cid];
        var id = this.modelId(model.attributes);
        if (id != null) delete this._byId[id];

        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }

        removed.push(model);
        this._removeReference(model, options);
      }
      return removed;
    },

    // Method for checking whether an object should be considered a model for
    // the purposes of adding to the collection.
    _isModel: function(model) {
      return model instanceof Model;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      var id = this.modelId(model.attributes);
      if (id != null) this._byId[id] = model;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      delete this._byId[model.cid];
      var id = this.modelId(model.attributes);
      if (id != null) delete this._byId[id];
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if (model) {
        if ((event === 'add' || event === 'remove') && collection !== this) return;
        if (event === 'destroy') this.remove(model, options);
        if (event === 'change') {
          var prevId = this.modelId(model.previousAttributes());
          var id = this.modelId(model.attributes);
          if (prevId !== id) {
            if (prevId != null) delete this._byId[prevId];
            if (id != null) this._byId[id] = model;
          }
        }
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Defining an @@iterator method implements JavaScript's Iterable protocol.
  // In modern ES2015 browsers, this value is found at Symbol.iterator.
  /* global Symbol */
  var $$iterator = typeof Symbol === 'function' && Symbol.iterator;
  if ($$iterator) {
    Collection.prototype[$$iterator] = Collection.prototype.values;
  }

  // CollectionIterator
  // ------------------

  // A CollectionIterator implements JavaScript's Iterator protocol, allowing the
  // use of `for of` loops in modern browsers and interoperation between
  // Backbone.Collection and other JavaScript functions and third-party libraries
  // which can operate on Iterables.
  var CollectionIterator = function(collection, kind) {
    this._collection = collection;
    this._kind = kind;
    this._index = 0;
  };

  // This "enum" defines the three possible kinds of values which can be emitted
  // by a CollectionIterator that correspond to the values(), keys() and entries()
  // methods on Collection, respectively.
  var ITERATOR_VALUES = 1;
  var ITERATOR_KEYS = 2;
  var ITERATOR_KEYSVALUES = 3;

  // All Iterators should themselves be Iterable.
  if ($$iterator) {
    CollectionIterator.prototype[$$iterator] = function() {
      return this;
    };
  }

  CollectionIterator.prototype.next = function() {
    if (this._collection) {

      // Only continue iterating if the iterated collection is long enough.
      if (this._index < this._collection.length) {
        var model = this._collection.at(this._index);
        this._index++;

        // Construct a value depending on what kind of values should be iterated.
        var value;
        if (this._kind === ITERATOR_VALUES) {
          value = model;
        } else {
          var id = this._collection.modelId(model.attributes);
          if (this._kind === ITERATOR_KEYS) {
            value = id;
          } else { // ITERATOR_KEYSVALUES
            value = [id, model];
          }
        }
        return {value: value, done: false};
      }

      // Once exhausted, remove the reference to the collection so future
      // calls to the next method always return done.
      this._collection = void 0;
    }

    return {value: void 0, done: true};
  };

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this.preinitialize.apply(this, arguments);
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be set as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the View
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this._removeElement();
      this.stopListening();
      return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function() {
      this.$el.remove();
    },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
    setElement: function(element) {
      this.undelegateEvents();
      this._setElement(element);
      this.delegateEvents();
      return this;
    },

    // Creates the `this.el` and `this.$el` references for this view using the
    // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
    // context or an element. Subclasses can override this to utilize an
    // alternative DOM manipulation API and are only required to set the
    // `this.el` property.
    _setElement: function(el) {
      this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
      this.el = this.$el[0];
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents: function(events) {
      events || (events = _.result(this, 'events'));
      if (!events) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], method.bind(this));
      }
      return this;
    },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      if (this.$el) this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate: function(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function(tagName) {
      return document.createElement(tagName);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        this.setElement(this._createElement(_.result(this, 'tagName')));
        this._setAttributes(attrs);
      } else {
        this.setElement(_.result(this, 'el'));
      }
    },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
    _setAttributes: function(attributes) {
      this.$el.attr(attributes);
    }

  });

  // Proxy Backbone class methods to Underscore functions, wrapping the model's
  // `attributes` object or collection's `models` array behind the scenes.
  //
  // collection.filter(function(model) { return model.get('age') > 10 });
  // collection.each(this.addView);
  //
  // `Function#apply` can be slow so we use the method's arg count, if we know it.
  var addMethod = function(base, length, method, attribute) {
    switch (length) {
      case 1: return function() {
        return base[method](this[attribute]);
      };
      case 2: return function(value) {
        return base[method](this[attribute], value);
      };
      case 3: return function(iteratee, context) {
        return base[method](this[attribute], cb(iteratee, this), context);
      };
      case 4: return function(iteratee, defaultVal, context) {
        return base[method](this[attribute], cb(iteratee, this), defaultVal, context);
      };
      default: return function() {
        var args = slice.call(arguments);
        args.unshift(this[attribute]);
        return base[method].apply(base, args);
      };
    }
  };

  var addUnderscoreMethods = function(Class, base, methods, attribute) {
    _.each(methods, function(length, method) {
      if (base[method]) Class.prototype[method] = addMethod(base, length, method, attribute);
    });
  };

  // Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
  var cb = function(iteratee, instance) {
    if (_.isFunction(iteratee)) return iteratee;
    if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
    if (_.isString(iteratee)) return function(model) { return model.get(iteratee); };
    return iteratee;
  };
  var modelMatcher = function(attrs) {
    var matcher = _.matches(attrs);
    return function(model) {
      return matcher(model.attributes);
    };
  };

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var collectionMethods = {forEach: 3, each: 3, map: 3, collect: 3, reduce: 0,
    foldl: 0, inject: 0, reduceRight: 0, foldr: 0, find: 3, detect: 3, filter: 3,
    select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 3, includes: 3,
    contains: 3, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
    head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
    without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
    isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
    sortBy: 3, indexBy: 3, findIndex: 3, findLastIndex: 3};


  // Underscore methods that we want to implement on the Model, mapped to the
  // number of arguments they take.
  var modelMethods = {keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
    omit: 0, chain: 1, isEmpty: 1};

  // Mix in each Underscore method as a proxy to `Collection#models`.

  _.each([
    [Collection, collectionMethods, 'models'],
    [Model, modelMethods, 'attributes']
  ], function(config) {
    var Base = config[0],
        methods = config[1],
        attribute = config[2];

    Base.mixin = function(obj) {
      var mappings = _.reduce(_.functions(obj), function(memo, name) {
        memo[name] = 0;
        return memo;
      }, {});
      addUnderscoreMethods(Base, obj, mappings, attribute);
    };

    addUnderscoreMethods(Base, _, methods, attribute);
  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // Pass along `textStatus` and `errorThrown` from jQuery.
    var error = options.error;
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    create: 'POST',
    update: 'PUT',
    patch: 'PATCH',
    delete: 'DELETE',
    read: 'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the Router.
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        if (router.execute(callback, args, name) !== false) {
          router.trigger.apply(router, ['route:' + name].concat(args));
          router.trigger('route', name, args);
          Backbone.history.trigger('route', router, name, args);
        }
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args, name) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, function(match, optional) {
          return optional ? match : '([^/?]+)';
        })
        .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    this.checkUrl = this.checkUrl.bind(this);

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      var path = this.location.pathname.replace(/[^\/]$/, '$&/');
      return path === this.root && !this.getSearch();
    },

    // Does the pathname match the root?
    matchRoot: function() {
      var path = this.decodeFragment(this.location.pathname);
      var rootPath = path.slice(0, this.root.length - 1) + '/';
      return rootPath === this.root;
    },

    // Unicode characters in `location.pathname` are percent encoded so they're
    // decoded for comparison. `%25` should not be decoded since it may be part
    // of an encoded parameter.
    decodeFragment: function(fragment) {
      return decodeURI(fragment.replace(/%25/g, '%2525'));
    },

    // In IE6, the hash fragment and search params are incorrect if the
    // fragment contains `?`.
    getSearch: function() {
      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
      return match ? match[0] : '';
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the pathname and search params, without the root.
    getPath: function() {
      var path = this.decodeFragment(
        this.location.pathname + this.getSearch()
      ).slice(this.root.length - 1);
      return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    // Get the cross-browser normalized URL fragment from the path or hash.
    getFragment: function(fragment) {
      if (fragment == null) {
        if (this._usePushState || !this._wantsHashChange) {
          fragment = this.getPath();
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error('Backbone.history has already been started');
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._hasHashChange   = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
      this._useHashChange   = this._wantsHashChange && this._hasHashChange;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.history && this.history.pushState);
      this._usePushState    = this._wantsPushState && this._hasPushState;
      this.fragment         = this.getFragment();

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          var rootPath = this.root.slice(0, -1) || '/';
          this.location.replace(rootPath + '#' + this.getPath());
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot()) {
          this.navigate(this.getHash(), {replace: true});
        }

      }

      // Proxy an iframe to handle location events if the browser doesn't
      // support the `hashchange` event, HTML5 history, or the user wants
      // `hashChange` but not `pushState`.
      if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = 'javascript:0';
        this.iframe.style.display = 'none';
        this.iframe.tabIndex = -1;
        var body = document.body;
        // Using `appendChild` will throw on IE < 9 if the document is not ready.
        var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
        iWindow.document.open();
        iWindow.document.close();
        iWindow.location.hash = '#' + this.fragment;
      }

      // Add a cross-platform `addEventListener` shim for older browsers.
      var addEventListener = window.addEventListener || function(eventName, listener) {
        return attachEvent('on' + eventName, listener);
      };

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._usePushState) {
        addEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        addEventListener('hashchange', this.checkUrl, false);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      // Add a cross-platform `removeEventListener` shim for older browsers.
      var removeEventListener = window.removeEventListener || function(eventName, listener) {
        return detachEvent('on' + eventName, listener);
      };

      // Remove window listeners.
      if (this._usePushState) {
        removeEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        removeEventListener('hashchange', this.checkUrl, false);
      }

      // Clean up the iframe if necessary.
      if (this.iframe) {
        document.body.removeChild(this.iframe);
        this.iframe = null;
      }

      // Some environments will throw when clearing an undefined interval.
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();

      // If the user pressed the back button, the iframe's hash will have
      // changed and we should use that for comparison.
      if (current === this.fragment && this.iframe) {
        current = this.getHash(this.iframe.contentWindow);
      }

      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      // If the root doesn't match, no routes can match either.
      if (!this.matchRoot()) return false;
      fragment = this.fragment = this.getFragment(fragment);
      return _.some(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      // Normalize the fragment.
      fragment = this.getFragment(fragment || '');

      // Don't include a trailing slash on the root.
      var rootPath = this.root;
      if (fragment === '' || fragment.charAt(0) === '?') {
        rootPath = rootPath.slice(0, -1) || '/';
      }
      var url = rootPath + fragment;

      // Strip the fragment of the query and hash for matching.
      fragment = fragment.replace(pathStripper, '');

      // Decode for matching.
      var decodedFragment = this.decodeFragment(fragment);

      if (this.fragment === decodedFragment) return;
      this.fragment = decodedFragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._usePushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && fragment !== this.getHash(this.iframe.contentWindow)) {
          var iWindow = this.iframe.contentWindow;

          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if (!options.replace) {
            iWindow.document.open();
            iWindow.document.close();
          }

          this._updateHash(iWindow.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;
});

/**
 * Adds builtin validation features to BackboneJS Models, customized to connect
 * to display internationalized Mozu text labels.
 */
define('modules/backbone-mozu-validation',["underscore", "backbone", 'hyprlive'], function (_, Backbone, Hypr) {

    // Adapted from Backbone.Validation v0.8.1
    //
    // Copyright (c) 2011-2013 Thomas Pedersen
    // Modified by Volusion for Mozu, not officially forked (yet)
    // Distributed under MIT License
    //
    // Documentation and full license available at:
    // http://thedersen.com/projects/backbone-validation
    Backbone.Validation = (function (_) {
        

        // Default options
        // ---------------

        var defaultOptions = {
            forceUpdate: false,
            selector: 'name',
            labelFormatter: 'sentenceCase',
            valid: Function.prototype,
            invalid: Function.prototype
        };


        // Helper functions
        // ----------------

        // Formatting functions used for formatting error messages
        var formatFunctions = {
            // Uses the configured label formatter to format the attribute name
            // to make it more readable for the user
            formatLabel: function (attrName, model) {
                return defaultLabelFormatters[defaultOptions.labelFormatter](attrName, model);
            },

            // Replaces nummeric placeholders like {0} in a string with arguments
            // passed to the function
            format: function () {
                var args = Array.prototype.slice.call(arguments),
                    text = args.shift();
                return text.replace(/\{(\d+)\}/g, function (match, number) {
                    return typeof args[number] !== 'undefined' ? args[number] : match;
                });
            }
        };

        // Flattens an object
        // eg:
        //
        //     var o = {
        //       address: {
        //         street: 'Street',
        //         zip: 1234
        //       }
        //     };
        //
        // becomes:
        //
        //     var o = {
        //       'address.street': 'Street',
        //       'address.zip': 1234
        //     };
        var maxFlattenDepth = 20;
        var flatten = function (obj, into, prefix, depth) {
            if (depth === 0) throw "Cannot flatten circular object.";
            if (!depth) depth = maxFlattenDepth;
            into = into || {};
            prefix = prefix || '';

            if (obj instanceof Backbone.Model) {
                obj = obj.attributes;
            }

            _.each(obj, function (val, key) {
                if (obj.hasOwnProperty(key)) {
                    if (val && typeof val === 'object' && !(
                      val instanceof Array ||
                      val instanceof Date ||
                      val instanceof RegExp ||
                      val instanceof Backbone.Collection)
                    ) {
                        flatten(val, into, prefix + key + '.', depth - 1);
                    }
                    else {
                        into[prefix + key] = val;
                    }
                }
            });

            return into;
        };

        // Validation
        // ----------

        var Validation = (function () {

            // Returns an object with undefined properties for all
            // attributes on the model that has defined one or more
            // validation rules.
            var getValidatedAttrs = function (model) {
                return _.reduce(_.keys(model.validation || {}), function (memo, key) {
                    memo[key] = void 0;
                    return memo;
                }, {});
            };

            // Looks on the model for validations for a specified
            // attribute. Returns an array of any validators defined,
            // or an empty array if none is defined.
            var getValidators = function (model, attr) {
                var attrValidationSet = model.validation ? model.validation[attr] || {} : {};

                // If the validator is a function or a string, wrap it in a function validator
                if (_.isFunction(attrValidationSet) || _.isString(attrValidationSet)) {
                    attrValidationSet = {
                        fn: attrValidationSet
                    };
                }

                // Stick the validator object into an array
                if (!_.isArray(attrValidationSet)) {
                    attrValidationSet = [attrValidationSet];
                }

                // Reduces the array of validators into a new array with objects
                // with a validation method to call, the value to validate against
                // and the specified error message, if any
                return _.reduce(attrValidationSet, function (memo, attrValidation) {
                    _.each(_.without(_.keys(attrValidation), 'msg'), function (validator) {
                        memo.push({
                            fn: defaultValidators[validator],
                            val: attrValidation[validator],
                            msg: attrValidation.msg
                        });
                    });
                    return memo;
                }, []);
            };

            // Validates an attribute against all validators defined
            // for that attribute. If one or more errors are found,
            // the first error message is returned.
            // If the attribute is valid, an empty string is returned.
            var validateAttr = function (model, attr, value, computed) {
                // Reduces the array of validators to an error message by
                // applying all the validators and returning the first error
                // message, if any.
                return _.reduce(getValidators(model, attr), function (memo, validator) {
                    // Pass the format functions plus the default
                    // validators as the context to the validator
                    var ctx = _.extend({}, formatFunctions, defaultValidators),
                        result = validator.fn.call(ctx, value, attr, validator.val, model, computed);

                    if (result === false || memo === false) {
                        return false;
                    }
                    if (result && !memo) {
                        return validator.msg || result;
                    }
                    return memo;
                }, '');
            };

            // Loops through the model's attributes and validates them all.
            // Returns and object containing names of invalid attributes
            // as well as error messages.
            var validateModel = function (model, attrs) {
                var error,
                    invalidAttrs = {},
                    isValid = true,
                    computed = _.clone(attrs),
                    flattened = flatten(attrs);

                _.each(flattened, function (val, attr) {
                    error = validateAttr(model, attr, val, computed);
                    if (error) {
                        invalidAttrs[attr] = error;
                        isValid = false;
                    }
                });

                return {
                    invalidAttrs: invalidAttrs,
                    isValid: isValid
                };
            };

            // Contains the methods that are mixed in on the model when binding
            var mixin = function (view, options) {
                return {

                    // Check whether or not a value passes validation
                    // without updating the model
                    preValidate: function (attr, value) {
                        return validateAttr(this, attr, value, _.extend({}, this.attributes));
                    },

                    // Check to see if an attribute, an array of attributes or the
                    // entire model is valid. Passing true will force a validation
                    // of the model.
                    isValid: function (option) {
                        var flattened = flatten(this.attributes);

                        if (_.isString(option)) {
                            return !validateAttr(this, option, flattened[option], _.extend({}, this.attributes));
                        }
                        if (_.isArray(option)) {
                            return _.reduce(option, function (memo, attr) {
                                return memo && !validateAttr(this, attr, flattened[attr], _.extend({}, this.attributes));
                            }, true, this);
                        }
                        if (option === true) {
                            this.validate(null, { silent: true });
                        }
                        return this.validation ? this._isValid : true;
                    },

                    // This is called by Backbone when it needs to perform validation.
                    // You can call it manually without any parameters to validate the
                    // entire model.
                    validate: function (attrs, setOptions) {
                        var model = this,
                            validateAll = !attrs,
                            opt = _.extend({}, options, setOptions),
                            validatedAttrs = getValidatedAttrs(model),
                            selectedAttrs = attrs;

                        if (typeof attrs == "string") {
                            selectedAttrs = {};
                            _.each(validatedAttrs, function (v, k) {
                                if (k.indexOf(attrs) === 0) {
                                    selectedAttrs[k] = v;
                                }
                            });
                        }

                        var allAttrs = _.extend({}, validatedAttrs, selectedAttrs, model.attributes),
                            changedAttrs = flatten(selectedAttrs || allAttrs),
                            result = validateModel(model, allAttrs);

                        model._isValid = result.isValid;

                        // After validation is performed, loop through all changed attributes
                        // and call the valid callbacks so the view is updated.
                        _.each(validatedAttrs, function (val, attr) {
                            var invalid = result.invalidAttrs.hasOwnProperty(attr);
                            if (!invalid && !options.silent) {
                                opt.valid(view, attr, opt.selector);
                            }
                        });

                        // After validation is performed, loop through all changed attributes
                        // and call the invalid callback so the view is updated.
                        _.each(validatedAttrs, function (val, attr) {
                            var invalid = result.invalidAttrs.hasOwnProperty(attr),
                                changed = changedAttrs.hasOwnProperty(attr);

                            if (invalid && (changed || validateAll) && !options.silent) {
                                opt.invalid(view, attr, result.invalidAttrs[attr], opt.selector);
                            }
                        });

                        // Trigger validated events.
                        // Need to defer this so the model is actually updated before
                        // the event is triggered.
                        _.defer(function () {
                            model.trigger('validated', model._isValid, model, result.invalidAttrs);
                            model.trigger('validated:' + (model._isValid ? 'valid' : 'invalid'), model, result.invalidAttrs);
                        });

                        // Return any error messages to Backbone, unless the forceUpdate flag is set.
                        // Then we do not return anything and fools Backbone to believe the validation was
                        // a success. That way Backbone will update the model regardless.
                        if (!opt.forceUpdate && _.intersection(_.keys(result.invalidAttrs), _.keys(changedAttrs)).length > 0) {
                            return result.invalidAttrs;
                        }
                    }
                };
            };

            // Helper to mix in validation on a model
            var bindModel = function (view, model, options) {
                _.extend(model, mixin(view, options));
            };

            // Removes the methods added to a model
            var unbindModel = function (model) {
                delete model.validate;
                delete model.preValidate;
                delete model.isValid;
            };

            // Mix in validation on a model whenever a model is
            // added to a collection
            var collectionAdd = function (model) {
                bindModel(this.view, model, this.options);
            };

            // Remove validation from a model whenever a model is
            // removed from a collection
            var collectionRemove = function (model) {
                unbindModel(model);
            };

            // Returns the public methods on Backbone.Validation
            return {

                // Current version of the library
                version: '0.8.1',

                // Called to configure the default options
                configure: function (options) {
                    _.extend(defaultOptions, options);
                },

                // Hooks up validation on a view with a model
                // or collection
                bind: function (view, options) {
                    var model = view.model,
                        collection = view.collection;

                    options = _.extend({}, defaultOptions, defaultCallbacks, options);

                    if (typeof model === 'undefined' && typeof collection === 'undefined') {
                        throw 'Before you execute the binding your view must have a model or a collection.\n' +
                              'See http://thedersen.com/projects/backbone-validation/#using-form-model-validation for more information.';
                    }

                    if (model) {
                        bindModel(view, model, options);
                    }
                    else if (collection) {
                        collection.each(function (model) {
                            bindModel(view, model, options);
                        });
                        collection.bind('add', collectionAdd, { view: view, options: options });
                        collection.bind('remove', collectionRemove);
                    }
                },

                // Removes validation from a view with a model
                // or collection
                unbind: function (view) {
                    var model = view.model,
                        collection = view.collection;

                    if (model) {
                        unbindModel(view.model);
                    }
                    if (collection) {
                        collection.each(function (model) {
                            unbindModel(model);
                        });
                        collection.unbind('add', collectionAdd);
                        collection.unbind('remove', collectionRemove);
                    }
                },

                // Used to extend the Backbone.Model.prototype
                // with validation
                mixin: mixin(null, defaultOptions)
            };
        }());


        // Callbacks
        // ---------

        var defaultCallbacks = Validation.callbacks = {

            // Gets called when a previously invalid field in the
            // view becomes valid. Removes any error message.
            valid: function (view, attr) {
                view.$('[data-mz-value="' + attr + '"]').removeClass('is-invalid');
                view.$('[data-mz-validationmessage-for="' + attr + '"]').text('');
            },

            // Gets called when a field in the view becomes invalid.
            // Adds a error message.
            invalid: function (view, attr, error) {
                view.$('[data-mz-value="' + attr + '"]').addClass('is-invalid');
                view.$('[data-mz-validationmessage-for="' + attr + '"]').text(error);
            }
        };


        // Patterns
        // --------

        var defaultPatterns = Validation.patterns = {
            // Matches any digit(s) (i.e. 0-9)
            digits: /^\d+$/,

            // Matched any number (e.g. 100.000)
            number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,

            // Matches a valid email address (e.g. mail@example.com)
            email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,

            // Mathes any valid url (e.g. http://www.xample.com)
            url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
        };


        // Error messages
        // --------------

        // Error message for the build in validators.
        // {x} gets swapped out with arguments form the validator.
        var defaultMessages = Validation.messages = {
            required: Hypr.getLabel('genericRequired'),
            acceptance: Hypr.getLabel('genericAcceptance'),
            min: Hypr.getLabel('genericMin'),
            max: Hypr.getLabel('genericMax'),
            range: Hypr.getLabel('genericRange'),
            length: Hypr.getLabel('genericLength'),
            minLength: Hypr.getLabel('genericMinLength'),
            maxLength: Hypr.getLabel('genericMaxLength'),
            rangeLength: Hypr.getLabel('genericRangeLength'),
            oneOf: Hypr.getLabel('genericOneOf'),
            equalTo: Hypr.getLabel('genericEqualTo'),
            pattern: Hypr.getLabel('genericPattern')
        };

        // Label formatters
        // ----------------

        // Label formatters are used to convert the attribute name
        // to a more human friendly label when using the built in
        // error messages.
        // Configure which one to use with a call to
        //
        //     Backbone.Validation.configure({
        //       labelFormatter: 'label'
        //     });
        var defaultLabelFormatters = Validation.labelFormatters = {

            // Returns the attribute name with applying any formatting
            none: function (attrName) {
                return attrName;
            },

            // Converts attributeName or attribute_name to Attribute name
            sentenceCase: function (attrName) {
                return attrName.replace(/(?:^\w|[A-Z]|\b\w)/g, function (match, index) {
                    return index === 0 ? match.toUpperCase() : ' ' + match.toLowerCase();
                }).replace(/_/g, ' ');
            },

            // Looks for a label configured on the model and returns it
            //
            //      var Model = Backbone.Model.extend({
            //        validation: {
            //          someAttribute: {
            //            required: true
            //          }
            //        },
            //
            //        labels: {
            //          someAttribute: 'Custom label'
            //        }
            //      });
            label: function (attrName, model) {
                return (model.labels && model.labels[attrName]) || defaultLabelFormatters.sentenceCase(attrName, model);
            }
        };


        // Built in validators
        // -------------------

        var defaultValidators = Validation.validators = (function () {
            // Use native trim when defined
            var trim = String.prototype.trim ?
              function (text) {
                  return text === null ? '' : String.prototype.trim.call(text);
              } :
              function (text) {
                  var trimLeft = /^\s+/,
                      trimRight = /\s+$/;

                  return text === null ? '' : text.toString().replace(trimLeft, '').replace(trimRight, '');
              };

            // Determines whether or not a value is a number
            var isNumber = function (value) {
                return _.isNumber(value) || (_.isString(value) && value.match(defaultPatterns.number));
            };

            // Determines whether or not a value is empty
            var hasValue = function (value) {
                return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && trim(value) === '') || (_.isArray(value) && _.isEmpty(value)));
            };

            return {
                // Function validator
                // Lets you implement a custom function used for validation
                fn: function (value, attr, fn, model, computed) {
                    if (_.isString(fn)) {
                        var hier = attr.split('.');
                        if (hier.length > 1) {
                            hier.pop();
                            model = model.get(hier.join('.'));
                        }
                        fn = model[fn];
                    }
                    return fn.call(model, value, attr, computed);
                },

                // Required validator
                // Validates if the attribute is required or not
                required: function (value, attr, required, model, computed) {
                    var isRequired = _.isFunction(required) ? required.call(model, value, attr, computed) : required;
                    if (!isRequired && !hasValue(value)) {
                        return false; // overrides all other validators
                    }
                    if (isRequired && !hasValue(value)) {
                        return this.format(defaultMessages.required, this.formatLabel(attr, model));
                    }
                },

                // Acceptance validator
                // Validates that something has to be accepted, e.g. terms of use
                // `true` or 'true' are valid
                acceptance: function (value, attr, accept, model) {
                    if (value !== 'true' && (!_.isBoolean(value) || value === false)) {
                        return this.format(defaultMessages.acceptance, this.formatLabel(attr, model));
                    }
                },

                // Min validator
                // Validates that the value has to be a number and equal to or greater than
                // the min value specified
                min: function (value, attr, minValue, model) {
                    if (!isNumber(value) || value < minValue) {
                        return this.format(defaultMessages.min, this.formatLabel(attr, model), minValue);
                    }
                },

                // Max validator
                // Validates that the value has to be a number and equal to or less than
                // the max value specified
                max: function (value, attr, maxValue, model) {
                    if (!isNumber(value) || value > maxValue) {
                        return this.format(defaultMessages.max, this.formatLabel(attr, model), maxValue);
                    }
                },

                // Range validator
                // Validates that the value has to be a number and equal to or between
                // the two numbers specified
                range: function (value, attr, range, model) {
                    if (!isNumber(value) || value < range[0] || value > range[1]) {
                        return this.format(defaultMessages.range, this.formatLabel(attr, model), range[0], range[1]);
                    }
                },

                // Length validator
                // Validates that the value has to be a string with length equal to
                // the length value specified
                length: function (value, attr, length, model) {
                    if (!hasValue(value) || trim(value).length !== length) {
                        return this.format(defaultMessages.length, this.formatLabel(attr, model), length);
                    }
                },

                // Min length validator
                // Validates that the value has to be a string with length equal to or greater than
                // the min length value specified
                minLength: function (value, attr, minLength, model) {
                    if (!hasValue(value) || trim(value).length < minLength) {
                        return this.format(defaultMessages.minLength, this.formatLabel(attr, model), minLength);
                    }
                },

                // Max length validator
                // Validates that the value has to be a string with length equal to or less than
                // the max length value specified
                maxLength: function (value, attr, maxLength, model) {
                    if (!hasValue(value) || trim(value).length > maxLength) {
                        return this.format(defaultMessages.maxLength, this.formatLabel(attr, model), maxLength);
                    }
                },

                // Range length validator
                // Validates that the value has to be a string and equal to or between
                // the two numbers specified
                rangeLength: function (value, attr, range, model) {
                    if (!hasValue(value) || trim(value).length < range[0] || trim(value).length > range[1]) {
                        return this.format(defaultMessages.rangeLength, this.formatLabel(attr, model), range[0], range[1]);
                    }
                },

                // One of validator
                // Validates that the value has to be equal to one of the elements in
                // the specified array. Case sensitive matching
                oneOf: function (value, attr, values, model) {
                    if (!_.include(values, value)) {
                        return this.format(defaultMessages.oneOf, this.formatLabel(attr, model), values.join(', '));
                    }
                },

                // Equal to validator
                // Validates that the value has to be equal to the value of the attribute
                // with the name specified
                equalTo: function (value, attr, equalTo, model, computed) {
                    if (value !== computed[equalTo]) {
                        return this.format(defaultMessages.equalTo, this.formatLabel(attr, model), this.formatLabel(equalTo, model));
                    }
                },

                // Pattern validator
                // Validates that the value has to match the pattern specified.
                // Can be a regular expression or the name of one of the built in patterns
                pattern: function (value, attr, pattern, model) {
                    if (!hasValue(value) || !value.toString().match(defaultPatterns[pattern] || pattern)) {
                        return this.format(defaultMessages.pattern, this.formatLabel(attr, model), pattern);
                    }
                }
            };
        }());

        return Validation;
    }(_));

    return Backbone;

});

/*global define:false require:false */
(function (name, context, definition) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition();
    else if (typeof define == 'function' && define.amd) define('vendor/jquery-scrollto',definition);
    else context[name] = definition();
})('jquery-scrollto', this, function (require) {
    // Prepare
    var jQuery, $, ScrollTo;
    jQuery = $ = window.jQuery || require('jquery');

    // Fix scrolling animations on html/body on safari
    $.propHooks.scrollTop = $.propHooks.scrollLeft = {
        get: function (elem, prop) {
            var result = null;
            if (elem.tagName === 'HTML' || elem.tagName === 'BODY') {
                if (prop === 'scrollLeft') {
                    result = window.scrollX;
                } else if (prop === 'scrollTop') {
                    result = window.scrollY;
                }
            }
            if (result == null) {
                result = elem[prop];
            }
            return result;
        }
    };
    $.Tween.propHooks.scrollTop = $.Tween.propHooks.scrollLeft = {
        get: function (tween) {
            return $.propHooks.scrollTop.get(tween.elem, tween.prop);
        },
        set: function (tween) {
            // Our safari fix
            if (tween.elem.tagName === 'HTML' || tween.elem.tagName === 'BODY') {
                // Defaults
                tween.options.bodyScrollLeft = (tween.options.bodyScrollLeft || window.scrollX);
                tween.options.bodyScrollTop = (tween.options.bodyScrollTop || window.scrollY);

                // Apply
                if (tween.prop === 'scrollLeft') {
                    tween.options.bodyScrollLeft = Math.round(tween.now);
                }
                else if (tween.prop === 'scrollTop') {
                    tween.options.bodyScrollTop = Math.round(tween.now);
                }

                // Apply
                window.scrollTo(tween.options.bodyScrollLeft, tween.options.bodyScrollTop);
            }
                // jQuery's IE8 Fix
            else if (tween.elem.nodeType && tween.elem.parentNode) {
                tween.elem[tween.prop] = tween.now;
            }
        }
    };

    // jQuery ScrollTo
    ScrollTo = {
        // Configuration
        config: {
            axis: 'xy',
            duration: 400,
            easing: 'swing',
            callback: undefined,
            durationMode: 'each',
            offsetTop: 0,
            offsetLeft: 0
        },

        // Set Configuration
        configure: function (options) {
            // Apply Options to Config
            $.extend(ScrollTo.config, options || {});

            // Chain
            return this;
        },

        // Perform the Scroll Animation for the Collections
        // We use $inline here, so we can determine the actual offset start for each overflow:scroll item
        // Each collection is for each overflow:scroll item
        scroll: function (collections, config) {
            // Prepare
            var collection, $container, container, $target, $inline, position, containerTagName,
				containerScrollTop, containerScrollLeft,
				containerScrollTopEnd, containerScrollLeftEnd,
				startOffsetTop, targetOffsetTop, targetOffsetTopAdjusted,
				startOffsetLeft, targetOffsetLeft, targetOffsetLeftAdjusted,
				scrollOptions,
				callback;

            // Determine the Scroll
            collection = collections.pop();
            $container = collection.$container;
            $target = collection.$target;
            containerTagName = $container.prop('tagName');

            // Prepare the Inline Element of the Container
            $inline = $('<span/>').css({
                'position': 'absolute',
                'top': '0px',
                'left': '0px'
            });
            position = $container.css('position');

            // Insert the Inline Element of the Container
            $container.css({ position: 'relative' });
            $inline.appendTo($container);

            // Determine the top offset
            startOffsetTop = $inline.offset().top;
            targetOffsetTop = $target.offset().top;
            targetOffsetTopAdjusted = targetOffsetTop - startOffsetTop - parseInt(config.offsetTop, 10);

            // Determine the left offset
            startOffsetLeft = $inline.offset().left;
            targetOffsetLeft = $target.offset().left;
            targetOffsetLeftAdjusted = targetOffsetLeft - startOffsetLeft - parseInt(config.offsetLeft, 10);

            // Determine current scroll positions
            containerScrollTop = $container.prop('scrollTop');
            containerScrollLeft = $container.prop('scrollLeft');

            // Reset the Inline Element of the Container
            $inline.remove();
            $container.css({ position: position });

            // Prepare the scroll options
            scrollOptions = {};

            // Prepare the callback
            callback = function (event) {
                // Check
                if (collections.length === 0) {
                    // Callback
                    if (typeof config.callback === 'function') {
                        config.callback();
                    }
                }
                else {
                    // Recurse
                    ScrollTo.scroll(collections, config);
                }
                // Return true
                return true;
            };

            // Handle if we only want to scroll if we are outside the viewport
            if (config.onlyIfOutside) {
                // Determine current scroll positions
                containerScrollTopEnd = containerScrollTop + $container.height();
                containerScrollLeftEnd = containerScrollLeft + $container.width();

                // Check if we are in the range of the visible area of the container
                if (containerScrollTop < targetOffsetTopAdjusted && targetOffsetTopAdjusted < containerScrollTopEnd) {
                    targetOffsetTopAdjusted = containerScrollTop;
                }
                if (containerScrollLeft < targetOffsetLeftAdjusted && targetOffsetLeftAdjusted < containerScrollLeftEnd) {
                    targetOffsetLeftAdjusted = containerScrollLeft;
                }
            }

            // Determine the scroll options
            if (targetOffsetTopAdjusted !== containerScrollTop) {
                scrollOptions.scrollTop = targetOffsetTopAdjusted;
            }
            if (targetOffsetLeftAdjusted !== containerScrollLeft) {
                scrollOptions.scrollLeft = targetOffsetLeftAdjusted;
            }

            // Check to see if the scroll is necessary
            if ($container.prop('scrollHeight') === $container.width() || config.axis.indexOf('y') === -1) {
                delete scrollOptions.scrollTop;
            }
            if ($container.prop('scrollWidth') === $container.width() || config.axis.indexOf('x') === -1) {
                delete scrollOptions.scrollLeft;
            }

            // Perform the scroll
            if (scrollOptions.scrollTop != null || scrollOptions.scrollLeft != null) {
                $container.animate(scrollOptions, {
                    duration: config.duration,
                    easing: config.easing,
                    complete: callback
                });
            }
            else {
                callback();
            }

            // Return true
            return true;
        },

        // ScrollTo the Element using the Options
        fn: function (options) {
            // Prepare
            var collections, config, $container, container;
            collections = [];

            // Prepare
            var $target = $(this);
            if ($target.length === 0) {
                // Chain
                return this;
            }

            // Handle Options
            config = $.extend({}, ScrollTo.config, options);

            // Fetch
            $container = $target.parent();
            container = $container.get(0);

            // Cycle through the containers
            while (($container.length === 1) && (container !== document.body) && (container !== document)) {
                // Check Container for scroll differences
                var containerScrollTop, containerScrollLeft;
                containerScrollTop = $container.css('overflow-y') !== 'visible' && container.scrollHeight !== container.clientHeight;
                containerScrollLeft = $container.css('overflow-x') !== 'visible' && container.scrollWidth !== container.clientWidth;
                if (containerScrollTop || containerScrollLeft) {
                    // Push the Collection
                    collections.push({
                        '$container': $container,
                        '$target': $target
                    });
                    // Update the Target
                    $target = $container;
                }
                // Update the Container
                $container = $container.parent();
                container = $container.get(0);
            }

            // Add the final collection
            collections.push({
                '$container': $('html'),
                // document.body doesn't work in firefox, html works for all
                // internet explorer starts at the beggining
                '$target': $target
            });

            // Adjust the Config
            if (config.durationMode === 'all') {
                config.duration /= collections.length;
            }

            // Handle
            ScrollTo.scroll(collections, config);

            // Chain
            return this;
        }
    };

    // Apply our extensions to jQuery
    $.ScrollTo = $.ScrollTo || ScrollTo;
    $.fn.ScrollTo = $.fn.ScrollTo || ScrollTo.fn;

    // Export
    return ScrollTo;
});
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define('vendor/jquery.cookie/jquery.cookie',['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

/**
 * This file adds some common plugins to jQuery and then returns jQuery, so you can require it instead of jQuery itself and then you're guaranteed to have these plugins.    * They are:
 *   **$.cookie** -- Adds cookie management, using normal jQuery overload style: $.cookie('foo') gets foo cookie, $.cookie('foo','bar') sets it. *(This plugin is a separate file, shimmed in using the shim plugin.)*
 *   **$.fn.jsonData** -- Equivalent to the getter function of  $.fn.data, but without a weird jQuery bug that fails to parse JSON properly if it's been HTML escaped into an attribute.
 *   **$.fn.noFlickerFadeIn** -- A version of $.fn.fadeIn that operates on visibility:invisible objects, so there's no document reflow.
 *   **$.fn.ScrollTo** -- A plugin to smoothly scroll any element into view.
 */
define('modules/jquery-mozu',["jquery", "vendor/jquery-scrollto", "vendor/jquery.cookie/jquery.cookie"], function ($) {

   
    $.fn.jsonData = function (dataAttr) {
        var d = this.attr("data-mz-" + dataAttr);
        return (typeof d === 'string' && d.charAt(0).match(/[\{\[\(]/)) ? $.parseJSON(d) : d;
    };

    // use this instead of fadeIn for elements that are set to visibility: hidden instead of display:none
    // display:none on large elements makes the page look tiny at first, the footer hugging the header
    $.fn.noFlickerFadeIn = function () {
        this.css('visibility', 'visible');
        if (Modernizr.csstransitions) {
            this.css('opacity', 1);
        } else {
            this.animate({ opacity: 1 }, 300);
        }
    };

    // get url query parameters
    $.deparam = function(querystring) {
        // remove any preceding url and split
        querystring = querystring || window.location.search;
        querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
        var params = {}, pair, d = decodeURIComponent, i;
        // march and parse
        for (i = querystring.length; i > 0;) {
            pair = querystring[--i].split('=');
            if (pair && pair.length > 1) params[d(pair[0])] = d(pair[1].replace(/\+/g, '%20'));
        }

        return params;
    };//--  fn  deparam

    return $.noConflict();

});

define('modules/models-messages',["backbone", 'hyprlive'], function(Backbone, Hypr) {

    var isDebugMode = require.mozuData('pagecontext').isDebugMode,
    unexpectedErrorText = Hypr.getLabel('unexpectedError');

    var Message = Backbone.Model.extend({
        defaults:{
            autoFade : false
        },
        toJSON: function() {
            var j = Backbone.Model.prototype.toJSON.apply(this);
            if ((!isDebugMode && j.errorCode === "UNEXPECTED_ERROR") || !j.message) j.message = unexpectedErrorText;
            return j;
        }
    }),
    MessagesCollection = Backbone.Collection.extend({
        model: Message
    });
    return {
        Message: Message,
        MessagesCollection: MessagesCollection
    };

});

define('modules/backbone-mozu-model',[
    "modules/jquery-mozu",
    "underscore",
    "modules/api",
    "backbone",
    "modules/models-messages",
    "modules/backbone-mozu-validation"], function ($, _, api, Backbone, MessageModels) {


        var $window = $(window),
            Model = Backbone.Model,
           Collection = Backbone.Collection;

        // Detects dot notation in named properties and deepens a flat object to respect those property names.
        // Pessimistically, prefers dot-notated properties over properly deep ones
        function deepen(obj) {
            var ret = {};
            _.each(obj, function (val, key) {
                var ctx = ret, level;
                key = key.split('.');
                while (key.length > 1) {
                    level = key.shift();
                    ctx = ctx[level] || (ctx[level] = {});
                }
                ctx[key[0]] = val;
            });
            return ret;
        }

        var methodMap = {
            'read': 'get',
            'delete': 'del'
        };

        var modelProto = _.extend({}, Backbone.Validation.mixin,

            /** @lends MozuModel.prototype */
        {
            /**
             * @classdesc Extends the BackboneJS Model object to create a Backbone.MozuModel with extra features for model nesting, error handling, validation, and connection to the JavaScript SDK.
             * @class MozuModel
             * @param {object} json A JSON representation of the model to preload into the MozuModel. If you create a new MozuModel with no arguments, its attributes will be blank.
             * @augments external:Backbone.Model
             */


            /**
             * Array of the names of methods whose return values should be added to the JSON serialization of this model that is sent to the view, when MozuModel#toJSON is called with `{ helpers: true }`, which it is in the default implementation of {@ link MozuView#getRenderContext}.
             * The base MozuModel has helpers `['isLoading', 'isValid']`. When you subclass a MozuModel, any helpers you specify will be added to this array, rather than replacing it.
             * @member {string[]} helpers
             * @memberof MozuModel.prototype
             * @public
             */

            /**
             * If `true`, then this MozuModel will gain a `messages` property that is a {@ link Messages.MessageCollection }. It will also subscribe to the `error` event on its `apiModel` and update the `messages` collection as error messages come in from the service.
             * If `false`, this MozuModel will traverse up any existing tree of relations to find a parent or ancestor model that does handle messages, and use its `messages` collection instead.
             * @member {Boolean} handlesMessages
             * @memberof MozuModel.prototype
             * @default false
             */

            /**
             * Find the nearest parent model that handles error messages and pass all subsequent errors thrown on this model to that model. Run on contruct.
             * @private
             */
            passErrors: function() {
                var self = this;
                _.defer(function() {
                    var ctx = self,
                        passFn = function(e, c) {
                            ctx.trigger('error', e, c);
                        };
                    do {
                        if (ctx.handlesMessages) {
                            self.on('error', passFn);
                            break;
                        }
                        ctx = ctx.parent;
                    } while (ctx);
                }, 300);
            },


            /**
             * Dictionary of related models or collections.
             * @member {Object} relations
             * @memberof MozuModel.prototype
             * @public
             * @example
             * var Product = Backbone.MozuModel.extend({
             *   relations: {
             *     content: ProductContent, // another Backbone.MozuModel or Backbone.Model class
             *     options: Backbone.Collection.extend(
             *       model: ProductOption
             *     }) // a "has many" relationship
             *   }
             * });
             *
             * new Product(someJSON).get('content') // --> an instance of ProductContent
             */

            /**
             * Get the value of an attribute. Unlike the `get()` method on the plain `Backbone.Model`, this method accepts a dot-separated path to a property on a child model (child models are defined on {@link Backbone.MozuModel#relations}).
             * @example
             * // returns the value of Product.ProductContent.ProductName
             * productModel.get('content.productName');
             * @param {string} attr The name, or dot-separated path, of the property to return.
             * @returns {Object} The value of the named attribute, and `undefined` if it was never set.
             */
            get: function(attr) {
                var prop = attr.split('.'), ret = this, level;
                while (ret && (level = prop.shift())) ret = Backbone.Model.prototype.get.call(ret, level);
                if (!ret && this.relations && (attr in this.relations)) {
                    ret = this.setRelation(attr, null, { silent: true });
                    this.attributes[attr] = ret;
                }
                return ret;
            },

            /** @private */
            setRelation: function(attr, val, options) {
                var relation = this.attributes[attr],
                    id = this.idAttribute || "id";

                if (!("parse" in options)) options.parse = true;

                //if (options.unset && relation) delete relation.parent;

                if (this.relations && _.has(this.relations, attr)) {

                    // If the relation already exists, we don't want to replace it, rather
                    // update the data within it whether it is a collection or model
                    if (relation && relation instanceof Collection) {

                        id = relation.model.prototype.idAttribute || id;

                        // If the val that is being set is already a collection, use the models
                        // within the collection.
                        if (val instanceof Collection || val instanceof Array) {
                            val = val.models || val;

                            relation.reset(_.clone(val), options);

                        } else {

                            // The incoming val that is being set is not an array or collection, then it represents
                            // a single model.  Go through each of the models in the existing relation and remove
                            // all models that aren't the same as this one (by id). If it is the same, call set on that
                            // model.

                            relation.each(function(model) {
                                if (val && val[id] === model[id]) {
                                    model.set(val, options);
                                } else {
                                    relation.remove(model);
                                }
                            });
                        }

                        return relation;
                    }

                    if (relation && relation instanceof Model) {
                        if (options.unset) {
                            relation.clear(options);
                        } else {
                            relation.set((val && val.toJSON) ? val.toJSON() : val, options);
                        }
                        return relation;
                    }

                    options._parent = this;

                    if (!(val instanceof this.relations[attr])) val = new this.relations[attr](val, options);
                    val.parent = this;
                }

                return val;
            },


            /**
             * Set the value of an attribute or a hash of attributes. Unlike the `set()` method on he plain `Backbone.Model`, this method accepts a dot-separated path to a property on a child model (child models are defined on {@link Backbone.MozuModel#relations}).
             * @example
             * // sets the value of Customer.EditingContact.FirstName
             * customerModel.set('editingContact.firstName');
             * @param {string} key The name, or dot-separated path, of the property to return.
             * @returns {Object} Returns the value of the named attribute, and `undefined` if it was never set.
             */
            set: function(key, val, options) {
                var attr, attrs, unset, changes, silent, changing, prev, current, syncRemovedKeys, containsPrice;
                if (!key && key !== 0) return this;

                containsPrice = new RegExp('price', 'i');

                // Remove any properties from the current model
                // where there are properties no longer present in the latest api model.
                // This is to fix an issue when sale price is only on certain configurations or volume price bands,
                // so that the sale price does not persist.
                syncRemovedKeys = function (currentModel, attrKey) {
                    _.each(_.difference(_.keys(currentModel[attrKey].toJSON()), _.keys(attrs[attrKey])), function (keyName) {
                        changes.push(keyName);
                        currentModel[attrKey].unset(keyName);
                    });
                };

                // Handle both `"key", value` and `{key: value}` -style arguments.
                if (typeof key === 'object') {
                    attrs = key;
                    options = val;
                } else {
                    (attrs = {})[key] = val;
                }

                options = options || {};

                // allow for dot notation in setting properties remotely on related models, by shifting context!
                attrs = deepen(attrs);

                // Run validation.
                if (!this._validate(attrs, options)) return false;

                // Extract attributes and options.
                unset = options.unset;
                silent = options.silent;
                changes = [];
                changing = this._changing;
                this._changing = true;

                if (!changing) {
                    this._previousAttributes = _.clone(this.attributes);
                    this.changed = {};
                }
                current = this.attributes;
                prev = this._previousAttributes;

                // Check for changes of `id`.
                if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

                // For each `set` attribute, update or delete the current value.
                for (attr in attrs) {
                    val = attrs[attr];

                    // Inject in the relational lookup
                    val = this.setRelation(attr, val, options);

                    if (this.dataTypes && attr in this.dataTypes && (val !== null || !containsPrice.test(attr))) {
                        val = this.dataTypes[attr](val);
                    }

                    if (!_.isEqual(current[attr], val)) changes.push(attr);
                    if (!_.isEqual(prev[attr], val)) {
                        this.changed[attr] = val;
                    } else {
                        delete this.changed[attr];
                    }
                    var isARelation = this.relations && this.relations[attr] && (val instanceof this.relations[attr]);
                    if (unset && !isARelation) {
                        delete current[attr];
                    } else {
                        current[attr] = val;
                    }

                    if (current[attr] instanceof Backbone.Model && containsPrice.test(attr)) {
                        syncRemovedKeys(current, attr);
                    }
                }

                // Trigger all relevant attribute changes.
                if (!silent) {
                    if (changes.length) this._pending = true;
                    for (var i = 0, l = changes.length; i < l; i++) {
                        this.trigger('change:' + changes[i], this, current[changes[i]], options);
                    }
                }

                if (changing) return this;
                if (!silent) {
                    while (this._pending) {
                        this._pending = false;
                        this.trigger('change', this, options, attrs);
                    }
                }
                this._pending = false;
                this._changing = false;
                return this;
            },
            initApiModel: function(conf) {
                var me = this;
                this.apiModel = api.createSync(this.mozuType, _.extend({}, _.result(this, 'defaults') || {}, conf));
                if (!this.apiModel || !this.apiModel.on) return;
                this.apiModel.on('action', function() {
                    me.isLoading(true);
                    me.trigger('request');
                });
                this.apiModel.on('sync', function(rawJSON) {
                    me.isLoading(false);
                    if (rawJSON) {
                        me._isSyncing = true;
                        me.set(rawJSON);
                        me._isSyncing = false;
                    }
                    me.trigger('sync', rawJSON);
                });
                this.apiModel.on('spawn', function(rawJSON) {
                    me.isLoading(false);
                });
                this.apiModel.on('error', function(err) {
                    me.isLoading(false);
                    me.trigger('error', err);
                });
                this.on('change', function() {
                    if (!me._isSyncing) {
                        var changedAttributes = me.changedAttributes();
                        _.each(changedAttributes, function(v, k, l) {
                            if (v && typeof v.toJSON === "function")
                                l[k] = v.toJSON();
                        });
                        me.apiModel.prop(changedAttributes);
                    }
                });
            },

            /**
             * The type of Mozu API object that this model represents; when you specify a `mozuType`, then an SDK object corresponding to that type is created and exposed at the {@link MozuModel#apiModel} property. Its methods are also added to the MozuModel, all prefixed with "api". For example, the SDK `product` object has a method `addToCart`. A Backbone.MozuModel with mozuType `product` will therefore have a method `apiAddToCart`.
             * member {string} mozuType
             * @memberOf MozuModel.prototype
             */

            /**
             * The underlying SDK object created if you specified a MozuModel#mozuType.
             * MozuModels do not use the default Backbone.sync function used by standard Backbone.Models. Instead, MozuModels can communicate with the Mozu API if a {@link MozuModel#mozuType mozuType} is specified.
             * When a new instance of such a model is created, then it will create an SDK object of its `mozuType`, use event listeners to link up `sync` and `error` events between the SDK object and the MozuModel, and add methods for all the methods provided by the SDK object (see {@link MozuModel#mozuType mozuType}.)
             *
             * @member {object} apiModel
             * @memberOf MozuModel.prototype
             */


            /**
             * Ensure that the underlying SDK object has exactly the same data as the live Backbone model. In conflicts, Backbone always wins.
             * The underlying SDK object has event hooks into changes to the Backbone model, but under some circumstances a change may be unnoticed and they'll get out of sync.
             * For instance, if models are nested several layers deep, or if you changed a model attribute with `{ silent: true }` set. Run this method prior to doing any API action
             * to ensure that the SDK object is up to date.
             * @returns {null}
             */
            syncApiModel: function() {
                this.apiModel.prop(this.toJSON());
            },

            /**
             * A helper method for use in templates. True if there are one or more messages in this model's `messages` cllection.
             * Added to the list of {@link MozuModel#helpers } if {@link MozuModel#handlesMessages } is set to `true`.
             * @returns {boolean} True if there are one or more messages in this model's `messages` collection.
             * @method hasMessages
             * @memberof MozuModel.prototype
             */

            initMessages: function() {
                var me = this;
                me.messages = new MessageModels.MessagesCollection();
                me.hasMessages = function() {
                    return me.messages.length > 0;
                };
                me.helpers.push('hasMessages');
                me.on('error', function(err) {
                    if (err.items && err.items.length) {
                        me.messages.reset(err.items);
                    } else {
                        me.messages.reset([err]);
                    }
                });
                me.on('sync', function(raw) {
                    if (!raw || !raw.messages || raw.messages.length === 0) me.messages.reset();
                });
                _.each(this.relations, function(v, key) {
                    var relInstance = me.get(key);
                    if (relInstance) me.listenTo(relInstance, 'error', function(err) {
                        me.trigger('error', err);
                    });
                });
            },
            fetch: function() {
                var self = this;
                return this.apiModel.get().then(function() {
                    return self;
                });
            },
            sync: function(method, model, options) {
                method = methodMap[method] || method;
                model.apiModel[method](model.attributes).then(function(model) {
                    options.success(model.data);
                }, function(error) {
                    options.error(error);
                });
            },

            /**
             * Called whenever an API request begins. You may call this manually to trigger a `loadingchange` event, which {@link MozuView} automatically listens to and displays loading state in the DOM.
             * Added to the list of {@link MozuModel#helpers } automatically, to provide a boolean `model.isLoading` inside HyprLive templates.
             * @returns {boolean} True if the model is currently loading.
             * @param {boolean} yes Set this to true to trigger a `loadingchange` event.
             */
            isLoading: function(yes, opts) {
                if (arguments.length === 0) return !!this._isLoading;
                this._isLoading = yes;
                // firefox bfcache fix
                if (yes) {
                    this._cleanup = this._cleanup || _.bind(this.isLoading, this, false);
                    this._isWatchingUnload = true;
                    $window.on('beforeunload', this._cleanup);
                } else if (this._isWatchingUnload) {
                    delete this._isWatchingUnload;
                    $window.off('beforeunload', this._cleanup);
                }
                if (!opts || !opts.silent) this.trigger('loadingchange', yes);
            },
            getHelpers: function() {
                return this.helpers;
            },

            /**
             * Calls the provided callback immediately if `isLoading` is false, or queues it to be called the next time `isLoading` becomes false.
             * Good for queueing user actions while waiting for an API request to complete.
             * @param {function} cb The callback function to be called when the `isLoading` is false.
             */
            whenReady: function(cb) {
                var me = this,
                    isLoading = this.isLoading();
                if (!isLoading) return cb();
                var handler = function(yes) {
                    if (!yes) {
                        me.off('loadingchange', handler);
                        cb();
                    }
                };
                me.on('loadingchange', handler);
            },

            /**
             * Convert the data in this model to a plain JavaScript object that could be passed to `JSON.stringify`.
             * MozuModel extends the Backbone.Model#toJSON method with two configuration options.
             * @param {object} options The configuration options.
             * @param {boolean} options.helpers Include helper methods specified in the {@link MozuModel#helpers} collection.
             * @param {boolean} options.ensureCopy Ensure that the returned JSON is a complete in-memory copy of the attributes, with no references. Use this helper if you're going to transform the JSON.
             * @returns {object}
             */
            toJSON: function(options) {
                var attrs = _.clone(this.attributes);
                if (options && options.helpers) {
                    _.each(this.getHelpers(), function(helper) {
                        attrs[helper] = this[helper]();
                    }, this);
                    if (this.hasMessages) attrs.messages = this.messages.toJSON();
                    if (this.validation) attrs.isValid = this.isValid(options.forceValidation);
                }

                _.each(this.relations, function(rel, key) {
                    if (_.has(attrs, key)) {
                        attrs[key] = attrs[key].toJSON(options);
                    }
                });

                return (options && options.ensureCopy) ? JSON.parse(JSON.stringify(attrs)) : attrs;
            },

            hasRequiredBehavior: function(behaviorId){
                var userBehaviors = require.mozuData('user').behaviors || [];
                if (userBehaviors.includes(1014)) return true;
                var requiredBehaviors = this.requiredBehaviors || [];

                if (behaviorId) {
                    requiredBehaviors = [behaviorId];
                }

                if (requiredBehaviors.length) {
                    var match = _.intersection(userBehaviors, requiredBehaviors);
                    if (this.requiredBehaviorsType === "AllOf") {
                        if (match.length !== this.requiredBehaviors.length) {
                            return false;
                        }
                    }
                    if (match.length < 1) {
                        return false;
                    }
                }
                return true;
            }



        });

        // we have to attach the constructor to the prototype via direct assignment,
        // because iterative extend methods don't work on the 'constructor' property
        // in IE8

        modelProto.constructor = function(conf) {
            this.helpers = (this.helpers || []).concat(['isLoading', 'isValid']);

            //if (this.requiredBehaviors) {
                this.helpers = (this.helpers || []).concat(['hasRequiredBehavior']);
            //}


            Backbone.Model.apply(this, arguments);
            if (this.mozuType) this.initApiModel(conf);
            if (this.handlesMessages) {
                this.initMessages();
            } else {
                this.passErrors();
            }
        };


        var MozuModel = Backbone.MozuModel = Backbone.Model.extend(modelProto, {
            /**
             * Create a mozuModel from any preloaded JSON present for this type.
             * @example
             *     var Product = Backbone.MozuModel.extend({
             *         mozuType: 'product'
             *     });
             *
             *     // the fromCurrent static factory method is a shortcut for a common pattern.
             *     var thisProduct = Product.fromCurrent();
             *
             *     // the above is equivalent to:
             *     var thisProduct = new Product(require.mozuData('product'));
             * @memberof MozuModel
             * @static
             */
            fromCurrent: function (overRide) {
                var mozuType = this.prototype.mozuType;
                if (overRide) mozuType = overRide;
                return new this(require.mozuData(mozuType), { silent: true, parse: true });
            },
            DataTypes: {
                "Int": function (val) {
                    val = parseInt(val, 10);
                    return isNaN(val) ? 0 : val;
                },
                "Float": function (val) {
                    val = parseFloat(val);
                    return isNaN(val) ? 0 : val;
                },
                "Boolean": function (val) {
                    return typeof val === "string" ? val.toLowerCase() === "true" : !!val;
                }
            }
        });

        function flattenValidation(proto, into, prefix) {
            _.each(proto.validation, function (val, key) {
                into[prefix + key] = val;
            });
            if (!proto.__validationFlattened) {
                _.each(proto.relations, function (val, key) {
                    flattenValidation(val.prototype, into, key + '.');
                });
            }
            proto.__validationFlattened = true;
            return into;
        }

        Backbone.MozuModel.extend = function (conf, statics) {
            if (conf) conf.validation = flattenValidation(conf, {}, '');
            if (conf && conf.mozuType) {
                // reflect all methods
                var actions = api.getAvailableActionsFor(conf.mozuType);
                if (actions) _.each(actions, function (actionName) {
                    var apiActionName = "api" + actionName.charAt(0).toUpperCase() + actionName.substring(1);
                    if (!(apiActionName in conf)) {
                        conf[apiActionName] = function (data) {
                            var self = this;
                            // include self by default...
                            if (actionName in { 'create': true, 'update': true }) data = data || this.toJSON();
                            if (typeof data === "object" && !$.isArray(data) && !$.isPlainObject(data)) data = null;
                            this.syncApiModel();
                            this.isLoading(true);
                            var p = this.apiModel[actionName](data);
                            p.ensure(function () {
                                self.isLoading(false);
                            });
                            return p;
                        };
                    }
                });

            }
            var ret = Backbone.Model.extend.call(this, conf, statics);
            if (conf && conf.helpers && conf.helpers.length > 0 && this.prototype.helpers && this.prototype.helpers.length > 0) ret.prototype.helpers = _.union(this.prototype.helpers, conf.helpers);
            return ret;
        };

        Backbone.Collection.prototype.resetRelations = function (options) {
            _.each(this.models, function(model) {
                _.each(model.relations, function(rel, key) {
                    if (model.get(key) instanceof Backbone.Collection) {
                        model.get(key).trigger('reset', model, options);
                    }
                });
            });
        };

        Backbone.Collection.prototype.reset = function (models, options) {
            options = options || {};
            for (var i = 0, l = this.models.length; i < l; i++) {
                this._removeReference(this.models[i]);
            }
            options.previousModels = this.models;
            this._reset();
            this.add(models, _.extend({ silent: true }, options));
            if (!options.silent) {
                this.trigger('reset', this, options);
                this.resetRelations(options);
            }
            return this;
        };
        return Backbone;
});

define('modules/backbone-mozu-pagedcollection',[
    "jquery",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu-model"], function ($, _, Hypr, Backbone) {

        var defaultPageSize = Hypr.getThemeSetting('defaultPageSize'),
            defaultSort = Hypr.getThemeSetting('defaultSort'),
            sorts = [
            {
                "text": Hypr.getLabel('default'),
                "value": defaultSort
            },
            {
                "text": Hypr.getLabel('sortByPriceAsc'),
                "value": "price asc"
            },
            {
                "text": Hypr.getLabel('sortByPriceDesc'),
                "value": "price desc"
            },
            {
                "text": Hypr.getLabel('sortByNameAsc'),
                "value": "productName asc"
            },
            {
                "text": Hypr.getLabel('sortByNameDesc'),
                "value": "productName desc"
            },
            {
                "text": Hypr.getLabel('sortByDateDesc'),
                "value": "createDate desc"
            },
            {
                "text": Hypr.getLabel('sortByDateAsc'),
                "value": "createDate asc"
            }
        ];

        var PagedCollection = Backbone.MozuPagedCollection = Backbone.MozuModel.extend({
            helpers: ['firstIndex', 'lastIndex', 'middlePageNumbers', 'hasPreviousPage', 'hasNextPage', 'currentPage', 'sorts', 'currentSort'],
            validation: {
                pageSize: { min: 1 },
                pageCount: { min: 1 },
                totalCount: { min: 0 },
                startIndex: { min: 0 }
            },
            dataTypes: {
                pageSize: Backbone.MozuModel.DataTypes.Int,
                pageCount: Backbone.MozuModel.DataTypes.Int,
                startIndex: Backbone.MozuModel.DataTypes.Int,
                totalCount: Backbone.MozuModel.DataTypes.Int
            },
            defaultSort: defaultSort,

            _isPaged: true,

            getQueryParams: function() {
                var self = this, lrClone = _.clone(this.lastRequest);
                _.each(lrClone, function(v, p) {
                    if (self.baseRequestParams && (p in self.baseRequestParams)) delete lrClone[p];
                });
                if (parseInt(lrClone.pageSize, 10) === defaultPageSize) delete lrClone.pageSize;

                var startIndex = this.get('startIndex');
                if (startIndex) lrClone.startIndex = startIndex;
                return lrClone;
            },

            getQueryString: function() {
                var params = this.getQueryParams();
                if (!params || _.isEmpty(params)) return "";
                return "?" + $.param(params)
                              .replace(/\+/g, ' ');
            },

            buildRequest: function() {
                var conf = this.baseRequestParams ? _.clone(this.baseRequestParams) : {},
                    pageSize = this.get("pageSize"),
                    startIndex = this.get("startIndex"),
                    sortBy = $.deparam().sortBy || this.currentSort() || this.defaultSort,
                    filter = this.currentFilter() || this.filter;

                conf.pageSize = pageSize;
                if (startIndex) conf.startIndex = startIndex;
                if (sortBy) conf.sortBy = sortBy;
                if (filter) conf.filter = filter;
                return conf;
            },

            previousPage: function() {
                try {
                    return this.apiModel.prevPage(this.lastRequest);
                } catch (e) { }
            },

            nextPage: function() {
                try {
                    return this.apiModel.nextPage(this.lastRequest);
                } catch (e) { }
            },

            syncIndex: function (currentUriFragment) {
                try {
                    var uriStartIndex = parseInt(($.deparam(currentUriFragment).startIndex || 0), 10);
                    if (!isNaN(uriStartIndex) && uriStartIndex !== this.apiModel.getIndex()) {
                        this.lastRequest.startIndex = uriStartIndex;
                        return this.apiModel.setIndex(uriStartIndex, this.lastRequest);
                    }
                } catch (e) { }
            },
            
            setIndex: function(num, config){
                try {
                    num = parseInt(num, 10);
                    if (typeof num === 'number') {
                        return this.apiModel.setIndex((num), Object.assign(this.lastRequest, config));
                    }
                } catch (e) { }
            },

            setPage: function(num) {
                num = parseInt(num, 10);
                if (num != this.currentPage() && num <= parseInt(this.get('pageCount'), 10)) return this.apiModel.setIndex((num - 1) * parseInt(this.get('pageSize'), 10), this.lastRequest);
            },

            changePageSize: function() {
                return this.apiGet($.extend(this.lastRequest, { pageSize: this.get('pageSize') }));
            },

            firstIndex: function() {
                return this.get("startIndex") + 1;
            },

            lastIndex: function() {
                return this.get("startIndex") + this.get("items").length;
            },

            hasPreviousPage: function() {
                return this.get("startIndex") > 0;
            },

            hasNextPage: function() {
                return this.lastIndex() < this.get("totalCount");
            },

            currentPage: function() {
                return Math.ceil(this.firstIndex() / (this.get('pageSize') || 1));
            },

            middlePageNumbers: function() {
                var current = this.currentPage(),
                    ret = [],
                    pageCount = this.get('pageCount'),
                    i = Math.max(Math.min(current - 2, pageCount - 4), 2),
                    last = Math.min(i + 5, pageCount);
                while (i < last) ret.push(i++);
                return ret;
            },

            sorts: function() {
                return sorts;
            },

            currentSort: function() {
                return (this.lastRequest && this.lastRequest.sortBy && decodeURIComponent(this.lastRequest.sortBy).replace(/\+/g, ' ')) || '';
            },

            currentFilter: function () {
                return (this.lastRequest && this.lastRequest.filter && decodeURIComponent(this.lastRequest.filter).replace(/\+/g, ' ')) || '';
            },

            sortBy: function(sortString) {
                return this.apiGet($.extend(this.lastRequest, { sortBy: sortString }));
            },

            filterBy: function (filterString) {
                return this.apiGet($.extend(this.lastRequest, { filter: filterString }));
            },

            initialize: function() {
                this.lastRequest = this.buildRequest();
            }
        });


        return Backbone;
});

define('modules/views-messages',['modules/jquery-mozu','underscore','backbone','hyprlive'], function($, _, Backbone, Hypr) {
    // because mozuviews need mozumessageviews and mozumessageviews extend mozuviews, we're risking circular reference problems.
    // we fix this by making a factory method that extends the mozu message view only when asked.
    // this avoids the circular reference problem by not asking for backbone-mozuview until we know it's been provided.
    var MozuMessagesView,
        offset = parseInt(Hypr.getThemeSetting('gutterWidth'), 10) || 10;
    return function(opts) {
        if (!MozuMessagesView) MozuMessagesView = Backbone.MozuView.extend({
            templateName: 'modules/common/message-bar',
            initialize: function() {
                this.model.on('reset', this.render, this);
            },
            dismissMessage: function() {
                this.$el.fadeOut(3000); 
                this.model.trigger('messageDismiss');
            },
            render: function() {
                var self = this;
                Backbone.MozuView.prototype.render.apply(this, arguments);
                if (this.model.length > 0) {
                    this.$el.ScrollTo({
                        onlyIfOutside: true,
                        offsetTop: offset,
                        offsetLeft: offset * 1.5,
                        axis: 'y'
                    });
                }

                if(this.model.findWhere({'autoFade': true})){
                    self.$el.show(function() {
                        setTimeout(function(){
                            self.$el.fadeOut(3000);
                        }, 4000);
                    });
                }
                
            }
        });
        return new MozuMessagesView(opts);
    };

});
define('modules/backbone-mozu-view',[
    "modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "backbone",
    "modules/views-messages"
], function ($, _, Hypr, Backbone, messageViewFactory) {

    var MozuView = Backbone.MozuView = Backbone.View.extend(


        /** @lends MozuView.prototype */
        {

            /**
             * Extends the BackboneJS View object to create a Backbone.MozuView with extra features for Hypr integration, queued rendering, simple one-way data binding, and automatic accessor generation.
             * @class MozuView
             * @augments external:Backbone.View
             */


            /**
             * Array of properties of the model to autogenerate update handlers for. The handlers created follow the naming convention `updatePropName` for a property `propName`. They're designed to be attached to an input element using the `events` or `additionalEvents` hash; they expect a jQuery Event from which they determine the original target element, then they try to get that target element's value and set the model property.
             * @member {Array} autoUpdate
             * @memberOf MozuView.prototype
             * @public
             * @example
             * var FullNameView = Backbone.MozuView.extend({
             *  autoUpdate: ['firstName','lastNameOrSurname']
             * });
             * var fullNameView = new FullNameView({ model: someModel, el: $someElement });
             * typeof fullNameView.updateFirstName; // --> "function" that takes a jQuery Event as its argument
             * typeof fullNameView.updateLastNameOrSurname; // --> same as above
             */


        constructor: function (conf) {
            Backbone.View.apply(this, arguments);
            this.template = Hypr.getTemplate(conf.templateName || this.templateName);
            this.listenTo(this.model, "sync", this.render);
            this.listenTo(this.model, "render", this.render);
            this.listenTo(this.model, "loadingchange", this.handleLoadingChange);
            if (this.model.handlesMessages && conf.messagesEl) {
                this.messageView = messageViewFactory({
                    el: conf.messagesEl,
                    model: this.model.messages
                });
            }
            if (this.renderOnChange) {
                _.each(this.renderOnChange, function (prop) {
                    var model = this.model;
                    if (prop.indexOf('.') !== -1) {
                        var level, hier = prop.split('.');
                        while (hier.length > 1) {
                            level = hier.shift();
                            model = model[level] || model.get(level);
                        }
                        prop = hier[0];
                    }
                    this.listenTo(model, 'change', _.debounce(this.dequeueRender, 150), this);
                    this.listenTo(model, 'change:' + prop, this.enqueueRender, this);
                }, this);
            }

            if(conf.requiredBehaviors || this.requiredBehaviors){
                var behaviors = this.model.requiredBehaviors || [];

                _.each(this.requiredBehaviors, function (behavior) {
                    if (behaviors.indexOf(behavior) == -1) { behaviors.push(behavior); }
                });

                _.each(conf.requiredBehaviors, function (behavior) {
                    if (behaviors.indexOf(behavior) == -1) { behaviors.push(behavior); }
                });

                this.model.requiredBehaviors = behaviors;   
            }

            Backbone.Validation.bind(this);
            Backbone.MozuView.trigger('create', this);

        },
            enqueueRender: function () {
            this.renderQueued = true;
        },
        dequeueRender: function () {
            if (this.renderQueued) {
                this.render();
                this.renderQueued = false;
            }
        },
        events: function () {
            var defaults = _.object(_.flatten(_.map(this.$('[data-mz-value]'), function (el) {
                var val = el.getAttribute('data-mz-value');
                return _.map(['change', 'blur', 'keyup'], function (ev) {
                    return [ev + ' [data-mz-value="' + val + '"]', "update" + val.charAt(0).toUpperCase() + val.substring(1)];
                });
            }).concat(_.map(this.$('[data-mz-action]'), function (el) {
                var action = el.getAttribute('data-mz-action');
                return _.map(['click'], function (ev) {
                    return [ev + ' [data-mz-action="' + action + '"]', action];
                });
            })), true));
            return this.additionalEvents ? _.extend(defaults, this.additionalEvents) : defaults;
        },
        handleLoadingChange: function (isLoading) {
            this.$el[isLoading ? 'addClass' : 'removeClass']('is-loading');
        },
            /**
             * Get the context that will be sent to the template by the MozuView#render method. In the base implementation, this returns an object with a single property, `model`, whose value is the JSON representation of the `model` property of this view. This object is sent to Hypr, which extends it on to the global context object always present in every template, which includes `siteContext`, `labels`, etc. 
             * 
             * Override this method to add another base-level variable to be available in this template.
             * @example
             * // base implementation
             * productView.getRenderContext(); // --> { model: { [...product data] } }
             * // an example override
             * var ViewWithExtraRootVariable = MozuView.extend({
             *   getRenderContext: function() {
             *      // first get the parent method's output
             *      var context = MozuView.prototype.getRenderContext.apply(this, arguments);
             *      context.foo = "bar";
             *      return context;
             *   }
             * });
             * var anotherView = new ViewWithExtraRootVariable({
             *   model: someModel,
             *   templateName: "path/to/template",
             *   el: $('some-selector')
             * });
             * anotherView.getRenderContext(); // --> { model: { [...model data] }, foo: "bar" }
             * // now, the template bound to this view can say {{ foo }} to render bar.
             * @param {MozuModel} substituteModel A model to use, for this render cycle only instead of the view's model.
             */
            getRenderContext: function (substituteModel) {
            var model = (substituteModel || this.model).toJSON({ helpers: true });
                return {
                    Model: model,
                    model: model
                };
            },
            
            /**
             * Renders the template into the element specified at the `el` property, using the JSON representation of the `model` and whatever else is added by {@link MozuView#getRenderContext}.
             */
            render: function (options) {
                if (this.model.requiredBehaviors && this.requireBehaviorsToRender) {
                    var userBehaviors = require.mozuData('user').behaviors || [];
                    var match = _.intersection(userBehaviors, this.model.requiredBehaviors);
                    if (this.model.requiredBehaviorsType == "AllOf") {
                        if (match.length !== this.requiredBehaviors.length) {
                            return;
                        } 
                    }
                    if(match.length < 1) {
                        return;
                    }
                }
                var thenFocus = this.el && document.activeElement && document.activeElement.type !== "radio" && document.activeElement.type !== "checkbox" && $.contains(this.el, document.activeElement) && {
                    'id': document.activeElement.id,
                    'mzvalue': document.activeElement.getAttribute('data-mz-value'),
                    'mzFocusBookmark': document.activeElement.getAttribute('data-mz-focus-bookmark'),
                    'value': document.activeElement.value
                };

                this.storeDropzones();

                Backbone.Validation.unbind(this);
                this.undelegateEvents();
                var newHtml = this.template.render(this.getRenderContext());
                this.$el.html(newHtml);

                this.retrieveDropzones();

                this.delegateEvents();
                Backbone.Validation.bind(this);
                if (thenFocus) {
                    if (thenFocus.id) {
                        $(document.getElementById(thenFocus.id)).focus();
                    } else if (thenFocus.mzFocusBookmark) {
                        this.$('[data-mz-focus-bookmark="' + thenFocus.mzFocusBookmark + '"]').focus();
                    } else if (thenFocus.mzvalue) {
                        this.$('[data-mz-value="' + thenFocus.mzvalue + '"]').focus();
                    }
                }
                if (!options || !options.silent) {
                    this.trigger('render', newHtml);
                    Backbone.MozuView.trigger('render', this, newHtml);
                }
            },

            storeDropzones: function() {
                var dropzones = this.dropzones = {};
                this.$('.mz-drop-zone').each(function() {
                    dropzones[this.id] = this;
                });
            },

            retrieveDropzones: function() {
                var dropzones = this.dropzones;
                this.$('.mz-drop-zone').each(function() {
                    if (dropzones[this.id]) $(this).replaceWith(dropzones[this.id]);
                });
            },

            removeInner: function () {
                this._removeInnerElements();
                this.stopListening();
                return this;
            },

            _removeInnerElements: function () {
                this.$el.off();
                this.$el.empty();
            }

            /**
             * Array of properties of the model to autogenerate update handlers for. The handlers created follow the naming convention `updatePropName` for a property `propName`. They're designed to be attached to an input element using the `events` or `additionalEvents` hash; they expect a jQuery Event from which they determine the original target element, then they try to get that target element's value and set the model property.
             * @member {Array} autoUpdate
             * @memberOf MozuView.prototype
             * @public
             * @example
             * var FullNameView = Backbone.MozuView.extend({
             *  autoUpdate: ['firstName','lastNameOrSurname']
             * });
             * var fullNameView = new FullNameView({ model: someModel, el: $someElement });
             * typeof fullNameView.updateFirstName; // --> "function" that takes a jQuery Event as its argument
             * typeof fullNameView.updateLastNameOrSurname; // --> same as above
             */


        });
    _.extend(Backbone.MozuView, Backbone.Events, {
        extend: function (conf, statics) {
            if (conf.autoUpdate) {
                _.each(conf.autoUpdate, function (prop) {
                    var methodName = 'update' + prop.charAt(0).toUpperCase() + prop.substring(1);
                    conf[methodName] = _.debounce(conf[methodName] || function (e) {
                        var attrs = {},
                            $target = $(e.currentTarget),
                            checked = $target.prop('checked'),
                            value = e.currentTarget.type === "checkbox" ? checked : $target.val();
                        if (!(e.currentTarget.type === "radio" && !checked)) {
                            attrs[prop] = value;
                            this.model.set(attrs);
                        }
                    }, 50);
                });
            }
            return Backbone.View.extend.call(this, conf, statics);
        }
    });
});

/**
 * This is a convenience script which combines Backbone.MozuModel,
 * Backbone.MozuView, and Backbone.Validation into a single package, all on the
 * Backbone object as is BackboneJS convention.
 */
define('modules/backbone-mozu',[
    "modules/backbone-mozu-validation",
    "modules/backbone-mozu-model",
    "modules/backbone-mozu-pagedcollection",
    "modules/backbone-mozu-view"
], function (Backbone) {
    return Backbone;
});

/*!
 * Bootstrap v3.3.7 (http://getbootstrap.com)
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under the MIT license
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1||b[0]>3)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4")}(jQuery),+function(a){function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){if(a(b.target).is(this))return b.handleObj.handler.apply(this,arguments)}})})}(jQuery),+function(a){function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.3.7",d.TRANSITION_DURATION=150,d.prototype.close=function(b){function c(){g.detach().trigger("closed.bs.alert").remove()}var e=a(this),f=e.attr("data-target");f||(f=e.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,""));var g=a("#"===f?[]:f);b&&b.preventDefault(),g.length||(g=e.closest(".alert")),g.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(g.removeClass("in"),a.support.transition&&g.hasClass("fade")?g.one("bsTransitionEnd",c).emulateTransitionEnd(d.TRANSITION_DURATION):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.3.7",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),setTimeout(a.proxy(function(){d[e](null==f[b]?this.options[b]:f[b]),"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c).prop(c,!0)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c).prop(c,!1))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")?(c.prop("checked")&&(a=!1),b.find(".active").removeClass("active"),this.$element.addClass("active")):"checkbox"==c.prop("type")&&(c.prop("checked")!==this.$element.hasClass("active")&&(a=!1),this.$element.toggleClass("active")),c.prop("checked",this.$element.hasClass("active")),a&&c.trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active")),this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target).closest(".btn");b.call(d,"toggle"),a(c.target).is('input[type="radio"], input[type="checkbox"]')||(c.preventDefault(),d.is("input,button")?d.trigger("focus"):d.find("input:visible,button:visible").first().trigger("focus"))}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(b){a(b.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(b.type))})}(jQuery),+function(a){function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=null,this.sliding=null,this.interval=null,this.$active=null,this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",a.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.3.7",c.TRANSITION_DURATION=600,c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},c.prototype.keydown=function(a){if(!/input|textarea/i.test(a.target.tagName)){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()}},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.getItemForDirection=function(a,b){var c=this.getItemIndex(b),d="prev"==a&&0===c||"next"==a&&c==this.$items.length-1;if(d&&!this.options.wrap)return b;var e="prev"==a?-1:1,f=(c+e)%this.$items.length;return this.$items.eq(f)},c.prototype.to=function(a){var b=this,c=this.getItemIndex(this.$active=this.$element.find(".item.active"));if(!(a>this.$items.length-1||a<0))return this.sliding?this.$element.one("slid.bs.carousel",function(){b.to(a)}):c==a?this.pause().cycle():this.slide(a>c?"next":"prev",this.$items.eq(a))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){if(!this.sliding)return this.slide("next")},c.prototype.prev=function(){if(!this.sliding)return this.slide("prev")},c.prototype.slide=function(b,d){var e=this.$element.find(".item.active"),f=d||this.getItemForDirection(b,e),g=this.interval,h="next"==b?"left":"right",i=this;if(f.hasClass("active"))return this.sliding=!1;var j=f[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:h});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,g&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(f)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:h});return a.support.transition&&this.$element.hasClass("slide")?(f.addClass(b),f[0].offsetWidth,e.addClass(h),f.addClass(h),e.one("bsTransitionEnd",function(){f.removeClass([b,h].join(" ")).addClass("active"),e.removeClass(["active",h].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(c.TRANSITION_DURATION)):(e.removeClass("active"),f.addClass("active"),this.sliding=!1,this.$element.trigger(m)),g&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this};var e=function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}};a(document).on("click.bs.carousel.data-api","[data-slide]",e).on("click.bs.carousel.data-api","[data-slide-to]",e),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){function b(b){var c,d=b.attr("data-target")||(c=b.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"");return a(d)}function c(b){return this.each(function(){var c=a(this),e=c.data("bs.collapse"),f=a.extend({},d.DEFAULTS,c.data(),"object"==typeof b&&b);!e&&f.toggle&&/show|hide/.test(b)&&(f.toggle=!1),e||c.data("bs.collapse",e=new d(this,f)),"string"==typeof b&&e[b]()})}var d=function(b,c){this.$element=a(b),this.options=a.extend({},d.DEFAULTS,c),this.$trigger=a('[data-toggle="collapse"][href="#'+b.id+'"],[data-toggle="collapse"][data-target="#'+b.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};d.VERSION="3.3.7",d.TRANSITION_DURATION=350,d.DEFAULTS={toggle:!0},d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},d.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b,e=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(e&&e.length&&(b=e.data("bs.collapse"),b&&b.transitioning))){var f=a.Event("show.bs.collapse");if(this.$element.trigger(f),!f.isDefaultPrevented()){e&&e.length&&(c.call(e,"hide"),b||e.data("bs.collapse",null));var g=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var h=function(){this.$element.removeClass("collapsing").addClass("collapse in")[g](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return h.call(this);var i=a.camelCase(["scroll",g].join("-"));this.$element.one("bsTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])}}}},d.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var e=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(e,this)).emulateTransitionEnd(d.TRANSITION_DURATION):e.call(this)}}},d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},d.prototype.getParent=function(){return a(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(a.proxy(function(c,d){var e=a(d);this.addAriaAndCollapsedClass(b(e),e)},this)).end()},d.prototype.addAriaAndCollapsedClass=function(a,b){var c=a.hasClass("in");a.attr("aria-expanded",c),b.toggleClass("collapsed",!c).attr("aria-expanded",c)};var e=a.fn.collapse;a.fn.collapse=c,a.fn.collapse.Constructor=d,a.fn.collapse.noConflict=function(){return a.fn.collapse=e,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(d){var e=a(this);e.attr("data-target")||d.preventDefault();var f=b(e),g=f.data("bs.collapse"),h=g?"toggle":e.data();c.call(f,h)})}(jQuery),+function(a){function b(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function c(c){c&&3===c.which||(a(e).remove(),a(f).each(function(){var d=a(this),e=b(d),f={relatedTarget:this};e.hasClass("open")&&(c&&"click"==c.type&&/input|textarea/i.test(c.target.tagName)&&a.contains(e[0],c.target)||(e.trigger(c=a.Event("hide.bs.dropdown",f)),c.isDefaultPrevented()||(d.attr("aria-expanded","false"),e.removeClass("open").trigger(a.Event("hidden.bs.dropdown",f)))))}))}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.3.7",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=b(e),g=f.hasClass("open");if(c(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(a(this)).on("click",c);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus").attr("aria-expanded","true"),f.toggleClass("open").trigger(a.Event("shown.bs.dropdown",h))}return!1}},g.prototype.keydown=function(c){if(/(38|40|27|32)/.test(c.which)&&!/input|textarea/i.test(c.target.tagName)){var d=a(this);if(c.preventDefault(),c.stopPropagation(),!d.is(".disabled, :disabled")){var e=b(d),g=e.hasClass("open");if(!g&&27!=c.which||g&&27==c.which)return 27==c.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.disabled):visible a",i=e.find(".dropdown-menu"+h);if(i.length){var j=i.index(c.target);38==c.which&&j>0&&j--,40==c.which&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",c).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f,g.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",g.prototype.keydown)}(jQuery),+function(a){function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$dialog=this.$element.find(".modal-dialog"),this.$backdrop=null,this.isShown=null,this.originalBodyPad=null,this.scrollbarWidth=0,this.ignoreBackdropClick=!1,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.3.7",c.TRANSITION_DURATION=300,c.BACKDROP_TRANSITION_DURATION=150,c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var d=this,e=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(e),this.isShown||e.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.$dialog.on("mousedown.dismiss.bs.modal",function(){d.$element.one("mouseup.dismiss.bs.modal",function(b){a(b.target).is(d.$element)&&(d.ignoreBackdropClick=!0)})}),this.backdrop(function(){var e=a.support.transition&&d.$element.hasClass("fade");d.$element.parent().length||d.$element.appendTo(d.$body),d.$element.show().scrollTop(0),d.adjustDialog(),e&&d.$element[0].offsetWidth,d.$element.addClass("in"),d.enforceFocus();var f=a.Event("shown.bs.modal",{relatedTarget:b});e?d.$dialog.one("bsTransitionEnd",function(){d.$element.trigger("focus").trigger(f)}).emulateTransitionEnd(c.TRANSITION_DURATION):d.$element.trigger("focus").trigger(f)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"),this.$dialog.off("mousedown.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(c.TRANSITION_DURATION):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){document===a.target||this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},c.prototype.resize=function(){this.isShown?a(window).on("resize.bs.modal",a.proxy(this.handleUpdate,this)):a(window).off("resize.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$body.removeClass("modal-open"),a.resetAdjustments(),a.resetScrollbar(),a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var d=this,e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&e;if(this.$backdrop=a(document.createElement("div")).addClass("modal-backdrop "+e).appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){return this.ignoreBackdropClick?void(this.ignoreBackdropClick=!1):void(a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus():this.hide()))},this)),f&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;f?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var g=function(){d.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):g()}else b&&b()},c.prototype.handleUpdate=function(){this.adjustDialog()},c.prototype.adjustDialog=function(){var a=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&a?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!a?this.scrollbarWidth:""})},c.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},c.prototype.checkScrollbar=function(){var a=window.innerWidth;if(!a){var b=document.documentElement.getBoundingClientRect();a=b.right-Math.abs(b.left)}this.bodyIsOverflowing=document.body.clientWidth<a,this.scrollbarWidth=this.measureScrollbar()},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.originalBodyPad=document.body.style.paddingRight||"",this.bodyIsOverflowing&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right",this.originalBodyPad)},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;!e&&/destroy|hide/.test(b)||(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",a,b)};c.VERSION="3.3.7",c.TRANSITION_DURATION=150,c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){if(this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(a.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,focus:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusin"==b.type?"focus":"hover"]=!0),c.tip().hasClass("in")||"in"==c.hoverState?void(c.hoverState="in"):(clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show())},c.prototype.isInStateTrue=function(){for(var a in this.inState)if(this.inState[a])return!0;return!1},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);if(c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusout"==b.type?"focus":"hover"]=!1),!c.isInStateTrue())return clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var d=a.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!d)return;var e=this,f=this.tip(),g=this.getUID(this.type);this.setContent(),f.attr("id",g),this.$element.attr("aria-describedby",g),this.options.animation&&f.addClass("fade");var h="function"==typeof this.options.placement?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,j=i.test(h);j&&(h=h.replace(i,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(h).data("bs."+this.type,this),this.options.container?f.appendTo(this.options.container):f.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var k=this.getPosition(),l=f[0].offsetWidth,m=f[0].offsetHeight;if(j){var n=h,o=this.getPosition(this.$viewport);h="bottom"==h&&k.bottom+m>o.bottom?"top":"top"==h&&k.top-m<o.top?"bottom":"right"==h&&k.right+l>o.width?"left":"left"==h&&k.left-l<o.left?"right":h,f.removeClass(n).addClass(h)}var p=this.getCalculatedOffset(h,k,l,m);this.applyPlacement(p,h);var q=function(){var a=e.hoverState;e.$element.trigger("shown.bs."+e.type),e.hoverState=null,"out"==a&&e.leave(e)};a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",q).emulateTransitionEnd(c.TRANSITION_DURATION):q()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top+=g,b.left+=h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=/top|bottom/.test(c),m=l?2*k.left-e+i:2*k.top-f+j,n=l?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(m,d[0][n],l)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c?"left":"top",50*(1-a/b)+"%").css(c?"top":"left","")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(b){function d(){"in"!=e.hoverState&&f.detach(),e.$element&&e.$element.removeAttr("aria-describedby").trigger("hidden.bs."+e.type),b&&b()}var e=this,f=a(this.$tip),g=a.Event("hide.bs."+this.type);if(this.$element.trigger(g),!g.isDefaultPrevented())return f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",d).emulateTransitionEnd(c.TRANSITION_DURATION):d(),this.hoverState=null,this},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName,e=c.getBoundingClientRect();null==e.width&&(e=a.extend({},e,{width:e.right-e.left,height:e.bottom-e.top}));var f=window.SVGElement&&c instanceof window.SVGElement,g=d?{top:0,left:0}:f?null:b.offset(),h={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop()},i=d?{width:a(window).width(),height:a(window).height()}:null;return a.extend({},e,h,i,g)},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.right&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){if(!this.$tip&&(this.$tip=a(this.options.template),1!=this.$tip.length))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),b?(c.inState.click=!c.inState.click,c.isInStateTrue()?c.enter(c):c.leave(c)):c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){var a=this;clearTimeout(this.timeout),this.hide(function(){a.$element.off("."+a.type).removeData("bs."+a.type),a.$tip&&a.$tip.detach(),a.$tip=null,a.$arrow=null,a.$viewport=null,a.$element=null})};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;!e&&/destroy|hide/.test(b)||(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.3.7",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){function b(c,d){this.$body=a(document.body),this.$scrollElement=a(a(c).is(document.body)?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",a.proxy(this.process,this)),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.3.7",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b=this,c="offset",d=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),a.isWindow(this.$scrollElement[0])||(c="position",d=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var b=a(this),e=b.data("target")||b.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[c]().top+d,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){b.offsets.push(this[0]),b.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<e[0])return this.activeTarget=null,this.clear();for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(void 0===e[a+1]||b<e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){
this.activeTarget=b,this.clear();var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")},b.prototype.clear=function(){a(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.3.7",c.TRANSITION_DURATION=150,c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a"),f=a.Event("hide.bs.tab",{relatedTarget:b[0]}),g=a.Event("show.bs.tab",{relatedTarget:e[0]});if(e.trigger(f),b.trigger(g),!g.isDefaultPrevented()&&!f.isDefaultPrevented()){var h=a(d);this.activate(b.closest("li"),c),this.activate(h,h.parent(),function(){e.trigger({type:"hidden.bs.tab",relatedTarget:b[0]}),b.trigger({type:"shown.bs.tab",relatedTarget:e[0]})})}}},c.prototype.activate=function(b,d,e){function f(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),h?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu").length&&b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),e&&e()}var g=d.find("> .active"),h=e&&a.support.transition&&(g.length&&g.hasClass("fade")||!!d.find("> .fade").length);g.length&&h?g.one("bsTransitionEnd",f).emulateTransitionEnd(c.TRANSITION_DURATION):f(),g.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this};var e=function(c){c.preventDefault(),b.call(a(this),"show")};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',e).on("click.bs.tab.data-api",'[data-toggle="pill"]',e)}(jQuery),+function(a){function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=null,this.unpin=null,this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.3.7",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getState=function(a,b,c,d){var e=this.$target.scrollTop(),f=this.$element.offset(),g=this.$target.height();if(null!=c&&"top"==this.affixed)return e<c&&"top";if("bottom"==this.affixed)return null!=c?!(e+this.unpin<=f.top)&&"bottom":!(e+g<=a-d)&&"bottom";var h=null==this.affixed,i=h?e:f.top,j=h?g:b;return null!=c&&e<=c?"top":null!=d&&i+j>=a-d&&"bottom"},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=this.$element.height(),d=this.options.offset,e=d.top,f=d.bottom,g=Math.max(a(document).height(),a(document.body).height());"object"!=typeof d&&(f=e=d),"function"==typeof e&&(e=d.top(this.$element)),"function"==typeof f&&(f=d.bottom(this.$element));var h=this.getState(g,b,e,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var i="affix"+(h?"-"+h:""),j=a.Event(i+".bs.affix");if(this.$element.trigger(j),j.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:g-b-f})}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},null!=d.offsetBottom&&(d.offset.bottom=d.offsetBottom),null!=d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);
define("bootstrap", function(){});

define('modules/models-price',["underscore", "modules/backbone-mozu"], function (_, Backbone) {

    var ProductPrice = Backbone.MozuModel.extend({
        dataTypes: {
            price: Backbone.MozuModel.DataTypes.Float,
            salePrice: Backbone.MozuModel.DataTypes.Float,
            offerPrice: Backbone.MozuModel.DataTypes.Float
        },
        helpers: ['onSale'],
        onSale: function() {
            var salePrice = this.get('salePrice');
            return salePrice !== null && !isNaN(salePrice) && salePrice !== this.get("price");
        }
    }),

    ProductPriceRange = Backbone.MozuModel.extend({
        relations: {
            lower: ProductPrice,
            upper: ProductPrice
        }
    });

    return {
        ProductPrice: ProductPrice,
        ProductPriceRange: ProductPriceRange
    };

});
define('modules/models-product-options',[
	"modules/jquery-mozu",
	"underscore",
	"modules/backbone-mozu",
	"hyprlive",
	"modules/api",
    "hyprlivecontext"],
    function($, _, Backbone, Hypr, api, HyprLiveContext) {
    	function zeroPad(str, len) {
	        str = str.toString();
	        while (str.length < 2) str = '0' + str;
	        return str;
	    }
	    function formatDate(d) {
	        var date = new Date(Date.parse(d) + (new Date()).getTimezoneOffset() * 60000);
	        return [zeroPad(date.getFullYear(), 4), zeroPad(date.getMonth() + 1, 2), zeroPad(date.getDate(), 2)].join('-');
	    }
    	var ProductOption = Backbone.MozuModel.extend({
	        idAttribute: "attributeFQN",
	        helpers: ['isChecked'],
	        initialize: function() {
	            var me = this;
	            _.defer(function() {
	                me.listenTo(me.collection, 'invalidoptionselected', me.handleInvalid, me);
	            });

	            var equalsThisValue = function(fvalue, newVal) {
	                return fvalue.value.toString() === newVal.toString();
	            },
	            containsThisValue = function(existingOptionValueListing, newVal) {
	                return _.some(newVal, function(val) {
	                    return equalsThisValue(existingOptionValueListing, val);
	                });
	            },
	            attributeDetail = me.get('attributeDetail');
	            if (attributeDetail) {
	                if (attributeDetail.valueType === ProductOption.Constants.ValueTypes.Predefined) {
	                    this.legalValues = _.chain(this.get('values')).pluck('value').map(function(v) { return !_.isUndefined(v) && !_.isNull(v) ? v.toString() : v; }).value();
	                }
	                if (attributeDetail.inputType === ProductOption.Constants.InputTypes.YesNo) {
	                    me.on('change:value', function(model, newVal) {
	                        var values;
	                        if (me.previous('value') !== newVal) {
	                            values = me.get('values');
	                            _.first(values).isSelected = newVal;
	                            me.set({
	                                value: newVal,
	                                shopperEnteredValue: newVal,
	                                values: values
	                            }, {
	                                silent: true
	                            });
	                            me.trigger('optionchange', newVal, me);
	                        }
	                    });
	                } else {
	                    me.on("change:value", function(model, newVal) {
	                        var newValObj, values = me.get("values"),
	                            comparator = this.get('isMultiValue') ? containsThisValue : equalsThisValue;
	                        if (typeof newVal === "string") newVal = $.trim(newVal);
	                        if (newVal || newVal === false || newVal === 0 || newVal === '') {
	                            _.each(values, function(fvalue) {
	                                if (comparator(fvalue, newVal)) {
	                                    newValObj = fvalue;
	                                    fvalue.isSelected = true;
	                                    me.set("value", newVal, { silent: true });
	                                } else {
	                                    fvalue.isSelected = false;
	                                }
	                            });
	                            me.set("values", values);
	                            if (me.get("attributeDetail").valueType === ProductOption.Constants.ValueTypes.ShopperEntered) {
	                                me.set("shopperEnteredValue", newVal, { silent: true });
	                            }
	                        } else {
	                            me.unset('value');
	                            me.unset("shopperEnteredValue");
	                        }
	                        if (newValObj && !newValObj.isEnabled) me.collection.trigger('invalidoptionselected', newValObj, me);
	                        me.trigger('optionchange', newVal, me);
	                    });
	                }
	            }
	        },
	        handleInvalid: function(newValObj, opt) {
	            if (this !== opt && !newValObj.autoAddEnabled) {
	                this.unset("value");
	                _.each(this.get("values"), function(value) {
	                    value.isSelected = false;
	                });
	            }
	        },
	        parse: function(raw) {
	            var selectedValue, vals, storedShopperValue;
	            if (raw.isMultiValue) {
	                vals = _.pluck(_.where(raw.values, { isSelected: true }), 'value');
	                if (vals && vals.length > 0) raw.value = vals;
	            } else {
	                selectedValue = _.findWhere(raw.values, { isSelected: true });
	                if (selectedValue) raw.value = selectedValue.value;
	            }
	            if (raw.attributeDetail) {
	                if (raw.attributeDetail.valueType !== ProductOption.Constants.ValueTypes.Predefined) {
	                    storedShopperValue = raw.values[0] && raw.values[0].shopperEnteredValue;
	                    if (storedShopperValue || storedShopperValue === 0) {
	                        raw.shopperEnteredValue = storedShopperValue;
	                        raw.value = storedShopperValue;
	                    }
	                }
	                if (raw.attributeDetail.inputType === ProductOption.Constants.InputTypes.Date && raw.attributeDetail.validation) {
	                    raw.minDate = formatDate(raw.attributeDetail.validation.minDateValue);
	                    raw.maxDate = formatDate(raw.attributeDetail.validation.maxDateValue);
	                }
	            }
	            return raw;
	        },
	        isChecked: function() {
	            var attributeDetail = this.get('attributeDetail'),
	                values = this.get('values');

	            return !!(attributeDetail && attributeDetail.inputType === ProductOption.Constants.InputTypes.YesNo && values && this.get('shopperEnteredValue'));
	        },
	        isValidValue: function() {
	            var value = this.getValueOrShopperEnteredValue();
	            return value !== undefined && value !== '' && (this.get('attributeDetail').valueType !== ProductOption.Constants.ValueTypes.Predefined || (this.get('isMultiValue') ? !_.difference(_.map(value, function(v) { return v.toString(); }), this.legalValues).length : _.contains(this.legalValues, value.toString())));
	        },
	        getValueOrShopperEnteredValue: function() {
	            return this.get('value') || (this.get('value') === 0) ? this.get('value') : this.get('shopperEnteredValue');
	        },
	        isConfigured: function() {
	            var attributeDetail = this.get('attributeDetail');
	            if (!attributeDetail) return true; // if attributeDetail is missing, this is a preconfigured product
	            return attributeDetail.inputType === ProductOption.Constants.InputTypes.YesNo ? this.isChecked() : this.isValidValue();
	        },
	        toJSON: function(options) {
	            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
	            if (j && j.attributeDetail && j.attributeDetail.valueType !== ProductOption.Constants.ValueTypes.Predefined && this.isConfigured()) {
	                var val = j.value || j.shopperEnteredValue;
	                if (j.attributeDetail.dataType === "Number") val = parseFloat(val);
	                j.shopperEnteredValue = j.value = val;
	            }

	            return j;
	        },
	        addConfiguration: function(biscuit, options) {
	            var fqn, value, attributeDetail, valueKey, pushConfigObject, optionName;
	            if (this.isConfigured()) {
	                if (options && options.unabridged) {
	                    biscuit.push(this.toJSON());
	                } else {
	                    fqn = this.get('attributeFQN');
	                    value = this.getValueOrShopperEnteredValue();
	                    attributeDetail = this.get('attributeDetail');
	                    optionName = attributeDetail.name;
	                    valueKey = attributeDetail.valueType === ProductOption.Constants.ValueTypes.ShopperEntered ? "shopperEnteredValue" : "value";
	                    if (attributeDetail.dataType === "Number") value = parseFloat(value);
	                    pushConfigObject = function(val) {
	                        var o = {
	                            attributeFQN: fqn,
	                            name: optionName
	                        };
	                        o[valueKey] = val;
	                        biscuit.push(o);
	                    };
	                    if (_.isArray(value)) {
	                        _.each(value, pushConfigObject);
	                    } else {
	                        pushConfigObject(value);
	                    }
	                }
	            }
	        }
	    }, {
	        Constants: {
	            ValueTypes: {
	                Predefined: "Predefined",
	                ShopperEntered: "ShopperEntered",
	                AdminEntered: "AdminEntered"
	            },
	            InputTypes: {
	                List: "List",
	                YesNo: "YesNo",
	                Date: "Date"
	            }
	        }
	    });
	return ProductOption;
    });

define('modules/models-family',[
	"modules/jquery-mozu", 
	"underscore", 
	"modules/backbone-mozu", 
	"hyprlive", 
	"modules/models-price", 
	"modules/api",
    "hyprlivecontext",
    "modules/models-product-options",
    "modules/models-messages"], 
    function($, _, Backbone, Hypr, PriceModels, api, HyprLiveContext, ProductOption, MessageModels) {
    	var ProductContent = Backbone.MozuModel.extend({}), 
	      	
    	FamilyItem = Backbone.MozuModel.extend({
	        mozuType: 'product',
	        idAttribute: 'productCode',
	        handlesMessages: true,        
	        helpers: ['mainImage', 'notDoneConfiguring', 'hasPriceRange', 'supportsInStorePickup', 'isPurchasable','hasVolumePricing'],
	        defaults: {
	            purchasableState: {},
	            quantity: 0
	        },
	        dataTypes: {
	            quantity: Backbone.MozuModel.DataTypes.Int
	        },
	        initApiModel: function(conf) {
	            var me = this;
	            this.apiModel = api.createSync(this.mozuType, _.extend({}, _.result(this, 'defaults') || {}, conf));
	            if (!this.apiModel || !this.apiModel.on) return;
	            this.apiModel.on('action', function() {
	                me.isLoading(true);
	                me.trigger('request');
	            });
	            this.apiModel.on('sync', function(rawJSON) {
	                me.isLoading(false);
	                if (rawJSON) {
	                    me._isSyncing = true;
	                    var updaterawJSON = (rawJSON.options && rawJSON.options.length) ? me.checkVariationCode(rawJSON) : rawJSON;
	                    me.set(updaterawJSON);
	                    me._isSyncing = false;
	                }
	                me.trigger('sync', rawJSON);
	            });
	            this.apiModel.on('spawn', function(rawJSON) {
	                me.isLoading(false);
	            });
	            this.apiModel.on('error', function(err) {
	                var my = me;
	                me.isLoading(false);
	                //Get items which are out of stock
	                if(err.message.indexOf("Item not found: "+me.id+" product code "+me.id+" is out of stock") !== -1){
	                	var serviceurl = '/api/commerce/catalog/storefront/products/' + me.get('productCode')+'?&allowInactive=true&supressOutOfStock404=true';
	                	api.request('GET', serviceurl).then(function(newProduct) {
	                		my.set(newProduct);
	                		my.trigger('ready');
	                    	my.set("isReady",true);
	                    	my.trigger('familyReady', my);
	                    	if(my.get('inventoryInfo').outOfStockBehavior !== "AllowBackOrder" && typeof my.get('inventoryInfo').onlineStockAvailable !== 'undefined' && my.get('inventoryInfo').onlineStockAvailable === 0){
		                    	my.set('quantityNull', 0);
		                    }
	                    	my.set('itemCode', Hypr.getLabel('item')+'# '+my.get('productCode'));
	                    	my.messages.reset([Hypr.getLabel('productOutOfStock')]);
	                    	return;
	                	});     
	                	return;
	                }
	                if(err.message.indexOf("Item not found: "+me.id+" product code "+me.id+" not found") !== -1){
	                	--window.familyLength;
	                	if(window.familyLength === window.familyArray.length){
	                		if(!window.checkInventory){
			                    window.outOfStockFamily = true;
			                    $("[data-mz-action='addToCart']").addClass('button_disabled').attr("disabled", "disabled");
			                }
	                	}
	                	return;
	                }
	                me.trigger('error', err);
	            });
	            this.on('change', function() {
	                if (!me._isSyncing) {
	                    var changedAttributes = me.changedAttributes();
	                    _.each(changedAttributes, function(v, k, l) {
	                        if (v && typeof v.toJSON === "function")
	                            l[k] = v.toJSON();
	                    });
	                    me.apiModel.prop(changedAttributes);
	                }
	            });
	        },
            /**
             * A helper method for use in templates. True if there are one or more messages in this model's `messages` cllection.
             * Added to the list of {@link MozuModel#helpers } if {@link MozuModel#handlesMessages } is set to `true`.
             * @returns {boolean} True if there are one or more messages in this model's `messages` collection.
             * @method hasMessages
             * @memberof MozuModel.prototype
             */

            initMessages: function() {
                var me = this;
                me.messages = new MessageModels.MessagesCollection();
                me.hasMessages = function() {
                    return me.messages.length > 0;
                };
                me.helpers.push('hasMessages');
                me.on('error', function(err) {
                    if (err.items && err.items.length) {
                        me.messages.reset(err.items);
                    } else {
                        me.messages.reset([err]);
                    }
                    window.productView.render();
                });
                me.on('sync', function(raw) {
                    if (!raw || !raw.messages || raw.messages.length === 0) me.messages.reset();
                });
                _.each(this.relations, function(v, key) {
                    var relInstance = me.get(key);
                    if (relInstance) me.listenTo(relInstance, 'error', function(err) {
                        me.trigger('error', err);
                    });
                });
            },	        
	        validation: {
	            quantity: {
	                min: 0,
	                msg: Hypr.getLabel('enterProductQuantity')
	            }
	        },
	        relations: {
	            content: ProductContent,
	            price: PriceModels.ProductPrice,
	            priceRange: PriceModels.ProductPriceRange,
	            options: Backbone.Collection.extend({
	                model: ProductOption
	            })
	        },
	        hasPriceRange: function() {
	            return this._hasPriceRange;
	        },
	        hasVolumePricing: function() {
	            return this._hasVolumePricing;
	        },
	        calculateHasPriceRange: function(json) {
	            this._hasPriceRange = json && !!json.priceRange;
	        },
	        initialize: function(conf) {
	            var me = this;
	            setTimeout(function(){
	                me.apiGet().then(function(){
	                    var slug = me.get('content').get('seoFriendlyUrl');
	                    _.bindAll(me, 'calculateHasPriceRange', 'onOptionChange');
	                    me.listenTo(me.get("options"), "optionchange", me.onOptionChange);
	                    me._hasVolumePricing = false;
	                    me._minQty = 0;
	                    if (me.get('volumePriceBands') && me.get('volumePriceBands').length > 0) {
	                        me._hasVolumePricing = true;
	                        me._minQty = _.first(me.get('volumePriceBands')).minQty;
	                        if (me._minQty > 1) {
	                            if (me.get('quantity') <= 1) {
	                                me.set('quantity', me._minQty);
	                            }
	                            me.validation.quantity.msg = Hypr.getLabel('enterProductQuantity', me._minQty);
	                        }
	                    }
	                    me.updateConfiguration = _.debounce(me.updateConfiguration, 300);
	                    me.set({ url: (HyprLiveContext.locals.siteContext.siteSubdirectory || '') + (slug ? "/" + slug : "") +  "/p/" + me.get("productCode")});
	                    me.lastConfiguration = [];
	                    me.calculateHasPriceRange(conf);
	                    me.on('sync', me.calculateHasPriceRange);
	                    me.set('itemCode', Hypr.getLabel('item')+'# '+me.get('productCode'));
	                    if(me.get('inventoryInfo').outOfStockBehavior !== "AllowBackOrder" && typeof me.get('inventoryInfo').onlineStockAvailable !== 'undefined' && me.get('inventoryInfo').onlineStockAvailable === 0){
	                    	me.set('quantityNull', 0);
	                    }
	                    me.trigger('ready');
	                    me.trigger('familyReady', me);
	                    me.set("isReady",true);
	                });
	            },400);
	        },
	        checkVariationCode: function(rawJSON){
	            var me = this;
	            var variations = rawJSON.variations || me.get("variations");
	            var variationCodes = me.get('variationCodes');
	            var outOfStockBehavior = rawJSON.inventoryInfo.outOfStockBehavior;
	            //remove variations with inventory zero if outOfStockBehavior === "HideProduct"
	            if(outOfStockBehavior === "HideProduct"){
	            	variations.reduce(function (hideProduct, variation) {
					  	if (variation.inventoryInfo.onlineStockAvailable === 0) {
					    	return hideProduct.concat(variation);
					  	} else {
					    	return hideProduct;
					  	}
					}, []);
	            }
	            var variation_pro = [];
	            var options_arr = [];
	            rawJSON.variations = variation_pro;
	            var count = 0;
	            for(var j=0; j < variations.length; j++){
	                for (var k = 0; k < variationCodes.length; k++) {
	                    if (variations[j].productCode === variationCodes[k]) {
	                        variation_pro.push(variations[j]);
	                        if (rawJSON.options) {
	                        	//get options matching to variationCodes with inventory
	                            for (var x=0; x < variations[j].options.length; x++) {
	                            	var checkDuplication = 0;
	                            	for(var o=0; o < options_arr.length; o++){
	                            		if(options_arr[o].option === variations[j].options[x].valueSequence)
	                            			checkDuplication = 1;
	                            	}
	                            	//Don't let items to duplicate
	                            	if(checkDuplication === 0){
		                            	options_arr[count] = {};
		                            	options_arr[count].option = variations[j].options[x].valueSequence;
		                            	options_arr[count].onlineStockAvailable = variations[j].inventoryInfo.onlineStockAvailable;
		                            	++count;
		                                options_arr = _.uniq(options_arr); 
		                            }
	                            }
	                        }
	                    }
	                }
	        	}
	            rawJSON.variations = variation_pro;
	            //remove unwanted options
	            if(options_arr.length){
		            for(var i=0;i<rawJSON.options.length;i++){
		                var opt_pro= [];
		                var option = rawJSON.options[i];
		                var key = option.attributeFQN;
		                for (var b = 0; b < option.values.length; b++) {
		                    for (var c = 0; c < options_arr.length; c++) {
		                        if (option.values[b].attributeValueId === options_arr[c].option) {
		                        	if(outOfStockBehavior === "DisplayMessage" && options_arr[c].onlineStockAvailable === 0){
		                        		option.values[b].isEnabled = false;
		                        	}
		                            opt_pro.push(option.values[b]);     
		                            break;                       
		                        }
		                    }
		                } 
		                if(outOfStockBehavior !== "AllowBackOrder"){
			                var checkEnable = false;
							for(var p = 0; p < opt_pro.length; p++) {
							    if (opt_pro[p].isEnabled === true) {
							        checkEnable = true;
							        break;
							    }
							}
			                if(checkEnable === false)
			                	rawJSON.quantityNull = 0;
			            }
		                rawJSON.options[i].values=opt_pro;
		            }
		        }
	            return rawJSON;
	        },
	        mainImage: function() {
	        	var productImages = this.get('mainImage');
	            //var productImages = this.get('content.productImages');
	            //return productImages && productImages[0];
	            return productImages;
	        },
	        notDoneConfiguring: function() {
	            return this.get('productUsage') === FamilyItem.Constants.ProductUsage.Configurable && !this.get('variationProductCode');
	        },
	        isPurchasable: function() {
	            var purchaseState = this.get('purchasableState');
	            if (purchaseState.isPurchasable){
	                return true;
	            }
	            if (this._hasVolumePricing && purchaseState.messages && purchaseState.messages.length === 1 && purchaseState.messages[0].validationType === 'MinQtyNotMet') {
	                return true;
	            }
	            return false;
	        },
	        supportsInStorePickup: function() {
	            return _.contains(this.get('fulfillmentTypesSupported'), FamilyItem.Constants.FulfillmentTypes.IN_STORE_PICKUP);
	        },
	        getConfiguredOptions: function(options) {
	            return this.get('options').reduce(function(biscuit, opt) {
	                opt.addConfiguration(biscuit, options);
	                return biscuit;
	            }, []);
	        },


	        addToCart: function () {
	            var me = this;
	            me.messages.reset();
	            var dfd = $.Deferred();
	            this.whenReady(function () {
	                if (!me.validate()) {
	                    var fulfillMethod = me.get('fulfillmentMethod');
	                    if (!fulfillMethod) {
	                        fulfillMethod = (me.get('goodsType') === 'Physical') ? FamilyItem.Constants.FulfillmentMethods.SHIP : FamilyItem.Constants.FulfillmentMethods.DIGITAL;
	                    }
	                    if(typeof me.get('inventoryInfo') === 'undefined'){
	                    	dfd.reject(Hypr.getLabel('selectValidOption')); 
	                    	return;
	                    }
	                    //reject products to proceed which are out of stock(under 'DisplayMessage' and 'HideMessage') and allow to proceed which are under 'AllowBackOrder'
	                    if(me.get('quantityNull') === 0){
	                    	dfd.reject(Hypr.getLabel('selectValidOption')); 
	                    	return;
	                    }else if(typeof me.get('inventoryInfo').onlineStockAvailable !== 'undefined'){
	                    	//products without options
	                    	var id = Hypr.getThemeSetting('oneSizeAttributeName'),
                				oneSizeOption = me.get('options').get(id);
	                    	if(oneSizeOption && me.get('quantity') === 0){
	                    		//dfd.reject(Hypr.getLabel('productwithoutSku'));
	                    		dfd.reject(Hypr.getLabel('selectValidOption'));
	                    		return;
	                    	}
	                    	//options selected but qty zero
	                    	if(me.get('quantity') === 0){
	                    		me.trigger('error', { message : Hypr.getLabel('enterProductQuantity')});
	                    		dfd.reject(Hypr.getLabel('enterQuantity', me.get('productCode')));
	                    		return;
	                    	}
		                    me.apiAddToCart({
		                        options: me.getConfiguredOptions(),
		                        fulfillmentMethod: fulfillMethod,
		                        quantity: me.get("quantity")
		                    }).then(function (item) {
		                    	dfd.resolve(me);
		                        me.trigger('addedtocart', item);
		                    },function(err){
		                    	if(err.message.indexOf("The following items have limited quantity or are out of stock:") !== -1){ 
									me.trigger('error', { message : Hypr.getLabel('productOutOfStockError')});
		                        } 
		                    	dfd.reject(err);
		                    });
		                }else if(me.lastConfiguration && !me.lastConfiguration.length && me.get('quantity') > 0){
		                	//options not selected but qty > zero
		                	me.trigger('error', { message : Hypr.getLabel('selectValidOption')});
		                	dfd.reject(Hypr.getLabel('selectValidOptionProduct', me.get('productCode')));
		                }else if(me.lastConfiguration && me.lastConfiguration.length && typeof me.get('inventoryInfo').onlineStockAvailable === 'undefined' && me.get('quantity') > 0){
		                	//if all options are not selected and qty > 0
		                	me.trigger('error', { message : Hypr.getLabel('selectValidOption')});
		                	dfd.reject(Hypr.getLabel('selectValidOptionProduct', me.get('productCode')));
		                }else if(me.lastConfiguration && me.lastConfiguration.length && me.get('quantity') === 0){
		                	//options selected but qty 0
		                	me.trigger('error', { message : Hypr.getLabel('enterProductQuantity')});
		                	dfd.reject(Hypr.getLabel('enterQuantity', me.get('productCode')));
		                }else{
		                	dfd.reject(Hypr.getLabel('selectValidOption')); 
		                }
	                }
	            });
	            return dfd.promise();
	        },
	        addToWishlist: function() {
	            var me = this;
	            this.whenReady(function() {
	                if (!me.validate()) {
	                    me.apiAddToWishlist({
	                        customerAccountId: require.mozuData('user').accountId,
	                        quantity: me.get("quantity"),
	                        options: me.getConfiguredOptions()
	                    }).then(function(item) {
	                        me.trigger('addedtowishlist', item);
	                    });
	                }
	            });
	        },
	        addToCartForPickup: function(locationCode, locationName, quantity) {
	            var me = this;
	            this.whenReady(function() {
	                return me.apiAddToCartForPickup({
	                    fulfillmentLocationCode: locationCode,
	                    fulfillmentMethod: FamilyItem.Constants.FulfillmentMethods.PICKUP,
	                    fulfillmentLocationName: locationName,
	                    quantity: quantity || 1
	                }).then(function(item) {
	                    me.trigger('addedtocart', item);
	                });
	            });
	        },
	        onOptionChange: function() {
	            this.isLoading(true);
	            this.updateConfiguration();
	        },
	        updateQuantity: function (newQty) {
	            if (this.get('quantity') === newQty) return;
	            this.set('quantity', newQty);
	            if (!this._hasVolumePricing) return;
	            if (newQty < this._minQty) {
	                return this.showBelowQuantityWarning();
	            }
	            this.isLoading(true);
	            this.apiConfigure({ options: this.getConfiguredOptions() }, { useExistingInstances: true });
	        },
	        showBelowQuantityWarning: function () {
	            this.validation.quantity.min = this._minQty;
	            this.validate();
	            this.validation.quantity.min = 1;
	        },
	        handleMixedVolumePricingTransitions: function (data) {
	            if (!data || !data.volumePriceBands || data.volumePriceBands.length === 0) return;
	            if (this._minQty === data.volumePriceBands[0].minQty) return;
	            this._minQty = data.volumePriceBands[0].minQty;
	            this.validation.quantity.msg = Hypr.getLabel('enterProductQuantity', this._minQty);
	            if (this.get('quantity') < this._minQty) {
	                this.updateQuantity(this._minQty);
	            }
	        },
	        updateConfiguration: function() {
	            var me = this,
	              newConfiguration = this.getConfiguredOptions();
	            if (JSON.stringify(this.lastConfiguration) !== JSON.stringify(newConfiguration)) {
	                this.lastConfiguration = newConfiguration;
	                this.apiConfigure({ options: newConfiguration }, { useExistingInstances: true })
	                    .then(function (apiModel) {	   	                    	
	                    	var html = "";
	                    	var price = "";
	                    	if(!me.get('addedtocart')){
	                    		//set item code Item# 412167
	                    		if(me.get('variationProductCode')){
	                    			me.set('itemCode', Hypr.getLabel('sku')+'# '+me.get('variationProductCode'));
	                    		}
	                    		//To show In Stock price
	                    		// If price is not a range
		                    	if(typeof me.get('price').get('priceType') != 'undefined'){
		                    		var sp_price = "";
			                    	if(typeof me.get('price').get('salePrice') != 'undefined')
		                				sp_price = me.get('price').get('salePrice');
		            				else
		                				sp_price = me.get('price').get('price');
		            				price = Hypr.engine.render("{{price|currency}}",{ locals: { price: sp_price }}); 
		            			}else{
		            				//If price is in a range
		            				var lower_sp_price = "";
		            				var upper_sp_price = "";
		            				//get lower salePrice/price
		            				if(typeof me.get('priceRange').get('lower').get('salePrice') != 'undefined')
		            					lower_sp_price = me.get('priceRange').get('lower').get('salePrice');
		            				else 
		            					lower_sp_price = me.get('priceRange').get('lower').get('price');
		            				//get upper salePrice/price
		            				if(typeof me.get('priceRange').get('upper').get('salePrice') != 'undefined')
		            					upper_sp_price = me.get('priceRange').get('upper').get('salePrice');
		            				else 
		            					upper_sp_price = me.get('priceRange').get('upper').get('price');
		            				lower_sp_price = Hypr.engine.render("{{price|currency}}",{ locals: { price: lower_sp_price }});
		            				upper_sp_price = Hypr.engine.render("{{price|currency}}",{ locals: { price: upper_sp_price }});
		            				price = lower_sp_price + ' - '+ upper_sp_price;
		            			}
	            				var stockMsglabel = Hypr.getLabel('upcInStock');  
	            				html += stockMsglabel + ' ' + price;    
	            				me.set('stockInfo', html);      
            				}else{
            					//Replace VariationProductCode code with productCode
            					me.set('itemCode', Hypr.getLabel('item')+'# '+me.get('productCode'));
            				}
            				me.unset('addedtocart');
	                        if (me._hasVolumePricing) {
	                            me.handleMixedVolumePricingTransitions(apiModel.data);
	                        }	                        
	                     });
	            } else {
	                this.isLoading(false);
	            }
	        },
	        parse: function(prodJSON) {
	            if (prodJSON && prodJSON.productCode && !prodJSON.variationProductCode) {
	                this.unset('variationProductCode');
	            }
	            return prodJSON;
	        },
	        toJSON: function(options) {
	            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
	            if (!options || !options.helpers) {
	                j.options = this.getConfiguredOptions({ unabridged: true });
	            }
	            if (options && options.helpers) {
	                if (typeof j.mfgPartNumber == "string") j.mfgPartNumber = [j.mfgPartNumber];
	                if (typeof j.upc == "string") j.upc = [j.upc];
	                if (j.bundledProducts && j.bundledProducts.length === 0) delete j.bundledProducts;
	            }
	            return j;
	        },
	        getBundledProductProperties: function(opts) {
	            var self = this,
	                loud = !opts || !opts.silent;
	            if (loud) {
	                this.isLoading(true);
	                this.trigger('request');
	            }

	            var bundledProducts = this.get('bundledProducts'),
	                numReqs = bundledProducts.length,
	                deferred = api.defer();
	            _.each(bundledProducts, function(bp) {
	                var op = api.get('product', bp.productCode);
	                op.ensure(function() {
	                    if (--numReqs === 0) {
	                        _.defer(function() {
	                            self.set('bundledProducts', bundledProducts);
	                            if (loud) {
	                                this.trigger('sync', bundledProducts);
	                                this.isLoading(false);
	                            }
	                            deferred.resolve(bundledProducts);
	                        });
	                    }
	                });
	                op.then(function(p) {
	                    _.each(p.prop('properties'), function(prop) {
	                        if (!prop.values || prop.values.length === 0 || prop.values[0].value === '' || prop.values[0].stringValue === '') {
	                            prop.isEmpty = true;
	                        }
	                    });
	                    _.extend(bp, p.data);
	                });
	            });

	            return deferred.promise;
	        }
	    }, {
	        Constants: {
	            FulfillmentMethods: {
	                SHIP: "Ship",
	                PICKUP: "Pickup",
	                DIGITAL: "Digital"
	            },
	            // for catalog instead of commerce
	            FulfillmentTypes: {
	                IN_STORE_PICKUP: "InStorePickup"
	            },
	            ProductUsage: {
	                Configurable: 'Configurable'
	            }
	        }   
	    });
		return FamilyItem;
    });
define('modules/models-product',["modules/jquery-mozu", "underscore", "modules/backbone-mozu", "hyprlive", "modules/models-price", "modules/api", "hyprlivecontext", 'modules/models-family', 'modules/models-product-options', "modules/models-messages"], function($, _, Backbone, Hypr, PriceModels, api, HyprLiveContext, FamilyItem, ProductOption, MessageModels) {


    var ProductContent = Backbone.MozuModel.extend({}),

    Product = Backbone.MozuModel.extend({
        mozuType: 'product',
        idAttribute: 'productCode',
        handlesMessages: true,
        helpers: ['mainImage', 'notDoneConfiguring', 'hasPriceRange', 'supportsInStorePickup', 'isPurchasable','hasVolumePricing'],
        defaults: {
            purchasableState: {},
            quantity: 1
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },
        validation: {
            quantity: {
                min: 0,
                msg: Hypr.getLabel('enterProductQuantity')
            }
        },
        relations: {
            content: ProductContent,
            price: PriceModels.ProductPrice,
            priceRange: PriceModels.ProductPriceRange,
            options: Backbone.Collection.extend({
                model: ProductOption
            }),
            family:Backbone.Collection.extend({
                model: FamilyItem
            })
        },
        initMessages: function() {
            var me = this;
            me.messages = new MessageModels.MessagesCollection();
            me.hasMessages = function() {
                return me.messages.length > 0;
            };
            me.helpers.push('hasMessages');
            me.on('error', function(err) {
                if (err.items && err.items.length) {
                    me.messages.reset(err.items);
                } else {
                    me.messages.reset([err]);
                }
            });
            me.on('sync', function(raw) {
                if (!raw || !raw.messages || raw.messages.length === 0) me.messages.reset();
            });
            _.each(this.relations, function(v, key) {
                var relInstance = me.get(key);
                if (relInstance && key!=='family') me.listenTo(relInstance, 'error', function(err) {
                    me.trigger('error', err);
                });
            });
        },
        hasPriceRange: function() {
            return this._hasPriceRange;
        },
        hasVolumePricing: function() {
            return this._hasVolumePricing;
        },
        calculateHasPriceRange: function(json) {
            this._hasPriceRange = json && !!json.priceRange;
        },
        initialize: function(conf) {
            window.familyArray = [];
            window.checkInventory = false;
            var slug = this.get('content').get('seoFriendlyUrl');
            _.bindAll(this, 'calculateHasPriceRange', 'onOptionChange', 'getFamilyMembers');
            this.listenTo(this.get("options"), "optionchange", this.onOptionChange);
            this.get("family").bind( 'familyReady', this.getFamilyMembers);
            this._hasVolumePricing = false;
            this._minQty = 0;
            if (this.get('volumePriceBands') && this.get('volumePriceBands').length > 0) {
                this._hasVolumePricing = true;
                this._minQty = _.first(this.get('volumePriceBands')).minQty;
                if (this._minQty > 1) {
                    if (this.get('quantity') <= 1) {
                        this.set('quantity', this._minQty);
                    }
                    this.validation.quantity.msg = Hypr.getLabel('enterProductQuantity', this._minQty);
                }
            }
            this.updateConfiguration = _.debounce(this.updateConfiguration, 300);
            this.set({ url: (HyprLiveContext.locals.siteContext.siteSubdirectory || '') + (slug ? "/" + slug : "") +  "/p/" + this.get("productCode")});
            this.lastConfiguration = [];
            this.calculateHasPriceRange(conf);
            this.on('sync', this.calculateHasPriceRange);
        },
        getFamilyMembers: function(e){
            //console.log(e);
            var checkInArray = false;
            if(window.familyArray.length){
                if($.inArray(e.get('productCode'), window.familyArray) === -1){
                    window.familyArray.push(e.get('productCode'));
                    //check if out of stock
                    if(typeof e.get('inventoryInfo').onlineStockAvailable !== 'undefined' && e.get('inventoryInfo').onlineStockAvailable !== 0)
                        window.checkInventory = true;
                    else if(typeof e.get('inventoryInfo').onlineStockAvailable === 'undefined'){
                        if(this.checkVariationInventory(e))
                            window.checkInventory = true;
                    }
                }
            }else{
                window.familyArray.push(e.get('productCode'));
                //check if out of stock
                if(typeof e.get('inventoryInfo').onlineStockAvailable !== 'undefined' && e.get('inventoryInfo').onlineStockAvailable !== 0)
                    window.checkInventory = true;
                else if(typeof e.get('inventoryInfo').onlineStockAvailable === 'undefined'){
                    if(this.checkVariationInventory(e))
                        window.checkInventory = true;
                }
            }
            //if all elements added in familyArray, check for inventory status
            if(window.familyLength === window.familyArray.length){
                if(!window.checkInventory){
                    window.outOfStockFamily = true;
                }
            }
            return;
        },
        mainImage: function() {
            var productImages = this.get('content.productImages');
            return productImages && productImages[0];
        },
        notDoneConfiguring: function() {
            return this.get('productUsage') === Product.Constants.ProductUsage.Configurable && !this.get('variationProductCode');
        },
        isPurchasable: function() {
            var purchaseState = this.get('purchasableState');
            if (purchaseState.isPurchasable){
                return true;
            }
            if (this._hasVolumePricing && purchaseState.messages && purchaseState.messages.length === 1 && purchaseState.messages[0].validationType === 'MinQtyNotMet') {
                return true;
            }
            return false;
        },
        supportsInStorePickup: function() {
            return _.contains(this.get('fulfillmentTypesSupported'), Product.Constants.FulfillmentTypes.IN_STORE_PICKUP);
        },
        getConfiguredOptions: function(options) {
            return this.get('options').reduce(function(biscuit, opt) {
                opt.addConfiguration(biscuit, options);
                return biscuit;
            }, []);
        },
        addToCart: function (stopRedirect) {
            var me = this;
            if(this.get('family').length){
                FamilyItem.addToCart();
            }
            this.whenReady(function () {
              if (!me.validate()) {
                    var fulfillMethod = me.get('fulfillmentMethod');
                    if (!fulfillMethod) {
                        fulfillMethod = (me.get('goodsType') === 'Physical') ? Product.Constants.FulfillmentMethods.SHIP : Product.Constants.FulfillmentMethods.DIGITAL;
                    }
                    return me.apiAddToCart({
                        options: me.getConfiguredOptions(),
                        fulfillmentMethod: fulfillMethod,
                        quantity: me.get("quantity")
                    }).then(function (item) {
                        me.trigger('addedtocart', item, stopRedirect);
                    }, function(err) {
                        if(err.message.indexOf("Validation Error: The following items have limited quantity or are out of stock:") !== -1){
                            me.messages.reset({ message: Hypr.getLabel('productOutOfStockError') });
                        }
                    });
                }
            });
        },
        addToWishlist: function() {
            var me = this;
            this.whenReady(function() {
                if (!me.validate()) {
                    me.apiAddToWishlist({
                        customerAccountId: require.mozuData('user').accountId,
                        quantity: me.get("quantity"),
                        options: me.getConfiguredOptions()
                    }).then(function(item) {
                        me.trigger('addedtowishlist', item);
                    });
                }
            });
        },
        addToCartForPickup: function(locationCode, locationName, quantity) {
            var me = this;
            this.whenReady(function() {
                return me.apiAddToCartForPickup({
                    fulfillmentLocationCode: locationCode,
                    fulfillmentMethod: Product.Constants.FulfillmentMethods.PICKUP,
                    fulfillmentLocationName: locationName,
                    quantity: quantity || 1
                }).then(function(item) {
                    me.trigger('addedtocart', item);
                });
            });
        },
        onOptionChange: function() {
            this.isLoading(true);
            this.updateConfiguration();
        },
        updateQuantity: function (newQty) {
            if (this.get('quantity') === newQty) return;
            this.set('quantity', newQty);
            if (!this._hasVolumePricing) return;
            if (newQty < this._minQty) {
                return this.showBelowQuantityWarning();
            }
            this.isLoading(true);
            this.apiConfigure({ options: this.getConfiguredOptions() }, { useExistingInstances: true });
        },
        showBelowQuantityWarning: function () {
            this.validation.quantity.min = this._minQty;
            this.validate();
            this.validation.quantity.min = 1;
        },
        handleMixedVolumePricingTransitions: function (data) {
            if (!data || !data.volumePriceBands || data.volumePriceBands.length === 0) return;
            if (this._minQty === data.volumePriceBands[0].minQty) return;
            this._minQty = data.volumePriceBands[0].minQty;
            this.validation.quantity.msg = Hypr.getLabel('enterProductQuantity', this._minQty);
            if (this.get('quantity') < this._minQty) {
                this.updateQuantity(this._minQty);
            }
        },
        updateConfiguration: function() {
            var me = this,
              newConfiguration = this.getConfiguredOptions();
            if (JSON.stringify(this.lastConfiguration) !== JSON.stringify(newConfiguration)) {
                this.lastConfiguration = newConfiguration;
                this.apiConfigure({ options: newConfiguration }, { useExistingInstances: true })
                    .then(function (apiModel) {
                        me.unset('stockInfo');
                        if(typeof me.get('inventoryInfo').onlineStockAvailable !== 'undefined' && me.get('inventoryInfo').onlineStockAvailable !== 0){
                            //To show In Stock price
                            // If price is not a range
                            var price = "";
                            if(typeof me.get('price').get('priceType') != 'undefined'){
                                var sp_price = "";
                                if(typeof me.get('price').get('salePrice') != 'undefined')
                                    sp_price = me.get('price').get('salePrice');
                                else
                                    sp_price = me.get('price').get('price');
                                price = Hypr.engine.render("{{price|currency}}",{ locals: { price: sp_price }});
                            }else{
                                //If price is in a range
                                var lower_sp_price = "";
                                var upper_sp_price = "";
                                //get lower salePrice/price
                                if(typeof me.get('priceRange').get('lower').get('salePrice') != 'undefined')
                                    lower_sp_price = me.get('priceRange').get('lower').get('salePrice');
                                else
                                    lower_sp_price = me.get('priceRange').get('lower').get('price');
                                //get upper salePrice/price
                                if(typeof me.get('priceRange').get('upper').get('salePrice') != 'undefined')
                                    upper_sp_price = me.get('priceRange').get('upper').get('salePrice');
                                else
                                    upper_sp_price = me.get('priceRange').get('upper').get('price');
                                lower_sp_price = Hypr.engine.render("{{price|currency}}",{ locals: { price: lower_sp_price }});
                                upper_sp_price = Hypr.engine.render("{{price|currency}}",{ locals: { price: upper_sp_price }});
                                price = lower_sp_price + ' - '+ upper_sp_price;
                            }
                            me.set('stockInfo', price);
                        }
                        if (me._hasVolumePricing) {
                            me.handleMixedVolumePricingTransitions(apiModel.data);
                        }
                        me.trigger('optionsUpdated');
                     });
            } else {
                this.isLoading(false);
            }
        },
        getBundledProductProperties: function(opts) {
            var self = this,
                loud = !opts || !opts.silent;
            if (loud) {
                this.isLoading(true);
                this.trigger('request');
            }

            var bundledProducts = this.get('bundledProducts'),
                numReqs = bundledProducts.length,
                deferred = api.defer();
            _.each(bundledProducts, function(bp) {
                var op = api.get('product', bp.productCode);
                op.ensure(function() {
                    if (--numReqs === 0) {
                        _.defer(function() {
                            self.set('bundledProducts', bundledProducts);
                            if (loud) {
                                this.trigger('sync', bundledProducts);
                                this.isLoading(false);
                            }
                            deferred.resolve(bundledProducts);
                        });
                    }
                });
                op.then(function(p) {
                    _.each(p.prop('properties'), function(prop) {
                        if (!prop.values || prop.values.length === 0 || prop.values[0].value === '' || prop.values[0].stringValue === '') {
                            prop.isEmpty = true;
                        }
                    });
                    _.extend(bp, p.data);
                });
            });

            return deferred.promise;
        },
        parse: function(prodJSON) {
            if (prodJSON && prodJSON.productCode && !prodJSON.variationProductCode) {
                this.unset('variationProductCode');
            }
            return prodJSON;
        },
        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers) {
                j.options = this.getConfiguredOptions({ unabridged: true });
            }
            if (options && options.helpers) {
                if (typeof j.mfgPartNumber == "string") j.mfgPartNumber = [j.mfgPartNumber];
                if (typeof j.upc == "string") j.upc = [j.upc];
                if (j.bundledProducts && j.bundledProducts.length === 0) delete j.bundledProducts;
            }
            return j;
        }
    }, {
        Constants: {
            FulfillmentMethods: {
                SHIP: "Ship",
                PICKUP: "Pickup",
                DIGITAL: "Digital"
            },
            // for catalog instead of commerce
            FulfillmentTypes: {
                IN_STORE_PICKUP: "InStorePickup"
            },
            ProductUsage: {
                Configurable: 'Configurable'
            }
        },
        fromCurrent: function () {
            var data = require.mozuData(this.prototype.mozuType);
            var families = _.find(data.properties, function(e) {
                return e.attributeFQN === Hypr.getThemeSetting('familyProductAttribute') && e.values;
            });
            if(families)
                data.family = JSON.parse(families.values[0].stringValue);
            return new this(data, { silent: true, parse: true });
        }
    }),

    ProductCollection = Backbone.MozuModel.extend({
        relations: {
            items: Backbone.Collection.extend({
                model: Product
            })
        }
    });

    return {
        Product: Product,
        Option: ProductOption,
        ProductCollection: ProductCollection
    };

});

define('modules/metrics',['hyprlive', 'underscore', 'modules/jquery-mozu', "hyprlivecontext", "modules/models-product", 'modules/api'], function(Hypr, _, $, HyprLiveContext, ProductModels, api) {
    if (window.metricsEngine === undefined) {
               
        var metricsEngine = {
            
            init: function() {
                
                metricsEngine.googleTagManagerEnabled = Hypr.getThemeSetting('googleTagManagerEnabled');
                metricsEngine.impressions = [];
                metricsEngine.currentProduct = false;
                metricsEngine.push = false;
                metricsEngine.debug = true;
            },
            
            getGAProduct: function(cartitemObject, product, qty) {
                               
                var gaProduct = {'name': product.get('content').get('productName'),
                                'id': product.get('productCode'),
                                'sku': cartitemObject.product.mfgPartNumber,
                                'price': cartitemObject.taxableTotal,
                                'originalPrice': cartitemObject.unitPrice.listAmount,
                                'brand': metricsEngine.getProductBrand(product),
                                'category': metricsEngine.getProductCategory(product),
                                'subscription': metricsEngine.getProductSubscription(product),
                                'quantity': qty,
                                'variant': metricsEngine.getProductVariant(cartitemObject)};
                return gaProduct;
            },
            getList: function(){
                
                var pageContext = require.mozuData('pagecontext');
                if(pageContext.pageType === "web_page"){
                    if(pageContext.cmsContext.template.path === "home") return 'Home Page: Best Sellers';
                    if(pageContext.cmsContext.page.path === "routine-builder") return 'Regimen Page: Recommended';
                    return 'Quiz Page: Recommended'; //quiz page
                }
                if(pageContext.pageType === "cart") return 'Basket: Free Samples';
                return 'directory';    
            },
            getProductCategory: function(product){
                
                var category = '';
                var bdc = require.mozuData('navigation').breadcrumbs;
                if(bdc && bdc.length){ //is plp
                    var i;
                    for (i = 0; i < bdc.length; i++) {
                        var crumb = bdc[i];
                        if(!crumb.isHidden) category += crumb.name;
                        if(i+1 < bdc.length) category += "/";
                    }
                }else if(product.get('categories')){
                    var lowerCategory = '';
                    $(product.get('categories')).each(function(index, cat){
                        // TO-DO: validate and give priority to Primary Category, else procced with current logic.
                        if(!lowerCategory || (cat.categoryId < lowerCategory.categoryId && cat.isDisplayed)){
                            lowerCategory = cat;
                        }
                    });
                    category = lowerCategory.content.name+"/"+product.get('content').get('productName');
                }else{ //product has not categories set
                    category = product.get('content').get('productName');    
                }
                
                return category;
            },
            getProductBrand: function(product){
                
                var brand = '';
                var properties = product.get('properties');
                $(properties).each(function(index, property){
                    if(property.attributeFQN === 'tenant~brand-name'){
                        var values = property.values[0];
                        brand = values.stringValue;
                    }
                });                
                return brand;
            },
            getProductVariant: function(cartitemObject){
                
                var variant = '';
                var options = cartitemObject.product.options;
                $(options).each(function(index, option){ variant = option.stringValue; });
                return variant;
            },
            getProductSubscription: function(product){
            
                var autoship = $('[name="'+product.get('productCode')+'_autoShipRadio"]:checked');
                if(autoship && $(autoship).attr('value') === "1"){
                    var title = $('[data-id="mz_pdp_autoship_code"]').attr('title');
                    return $.trim(title.replace('(most common)',''));
                }else{
                    return 'One Time Purchase';    
                }
            },
            dataLayerPush: function(){
                
                var push = metricsEngine.push;
                if (!metricsEngine.googleTagManagerEnabled || !push) return false;
                
                if(metricsEngine.debug) console.log('metrics dataLayer.push', push);                                            
                window.dataLayer.push(push);
                return true;                
            },
            
            initAddToCartObserver: function(){
                
                $('.mz-productdetail-addtocart').on("click", function () {
                    metricsEngine.currentProduct = $(this).data('mzProductCode')?$(this).data('mzProductCode'):$(this).data('mz-product-code');
                    if(!metricsEngine.currentProduct){ //is quickview or pdp product
                        var prod = (window.quickviewProduct)?window.quickviewProduct:ProductModels.Product.fromCurrent();
                        metricsEngine.currentProduct = prod.id;
                    }
                });
                $('[data-mz-role="cartcount"]').bind('DOMSubtreeModified', function(e) { //top cart is updated on addtocart response
                    if(metricsEngine.currentProduct){
                        metricsEngine.triggerTrackAddToCart();
                        metricsEngine.currentProduct = false;
                    }
                });     
            },
            triggerTrackAddToCart: function(){
                
                var productCode = metricsEngine.currentProduct;
                api.get("cart").then(function(resp) {
                    if(resp.data.items.length){
                        var lastMessage = resp.data.changeMessages && resp.data.changeMessages.slice(-1)[0];
                        var lastProductAddedCode = lastMessage.metadata[0].productCode;
                        if(lastProductAddedCode === productCode){
                            _.each(resp.data.items, function(cartitem){
                                if(cartitem.product.productCode === productCode){
                                    api.get('product', productCode).then(function(productResponse){
                                        var product = new ProductModels.Product(productResponse.data);           
                                        window.metricsEngine.trackAddToCart(cartitem, product);    
                                    });
                                }
                            });
                        }
                    }
                });    
            },
            trackAddToCart: function(cartitemObject, product) {
                
                if (metricsEngine.googleTagManagerEnabled) {      
                    try {
                        var gaProduct = metricsEngine.getGAProduct(cartitemObject, product, product.get('quantity'));  
                        metricsEngine.push = {'event': 'addToCart',
                                              'depData': {'currencyCode': 'USD',
                                                          'add': {'actionField': {'list': metricsEngine.getList()},
                                                                  'products': [gaProduct]}}};
                        return metricsEngine.dataLayerPush();
                    } catch (ex) {
                        if(metricsEngine.debug) console.log('ex', ex);
                        return true;
                    }                        
                } 
            },
            
            initSubscriberProductObserver: function(){
              
                $('#product-detail').bind('DOMSubtreeModified', function(e) { // subscription actions refresh section, losing add-to-cart button action.
                    $('.mz-productdetail-addtocart').on("click", function () {
                        var prod = ProductModels.Product.fromCurrent();    
                        metricsEngine.currentProduct = prod.id;
                    });
                });
            },

            initSampleProductsObserver: function(){
                
                $('.mz-productdetail-addtocart').each(function(index, item){
                    var productCode = $(item).data('mzProductCode');
                    if(productCode){
                        api.get('product', productCode).then(function(productResponse){
                            metricsEngine.setImpressions(productResponse.data, "free Samples");
                        });
                    }
                });

                $('.mz-productdetail-addtocart').on("click", function () {
                    metricsEngine.currentProduct = $(this).data('mzProductCode')?$(this).data('mzProductCode'):$(this).data('mz-product-code');
                    $('#free-samples').bind('DOMSubtreeModified', function(e) { //sample product area is updated on addtocart response
                        if(metricsEngine.currentProduct && e.target.innerHTML.length > 0){
                            metricsEngine.triggerTrackAddToCart();
                            metricsEngine.currentProduct = false;//avoids several inclusions
                            metricsEngine.initSampleProductsObserver(); //when area refresh, needs new button clicks observers
                        }
                    });                    
               });
            },
            setImpressions: function(productResponseData, list){
                
                if (metricsEngine.googleTagManagerEnabled) {
                    var product = new ProductModels.Product(productResponseData);

                    var originalPrice = '';
                    var price = '';
                    if(product.get('priceRange') && product.get('priceRange').lower && product.get('priceRange').upper){
                        price = product.get('priceRange').lower.salePrice - product.get('priceRange').upper.salePrice;
                        originalPrice = price;
                    }else{
                        price = (product.get('price').onSale())?product.get('price').get('salePrice'):product.get('price').get('price');
                        originalPrice = product.get('price').get('price');
                    }
                    var gaProduct = {"name": product.get('content').get('productName'),      
                                      "id": product.get('productCode'),
                                      "price": price,
                                      "originalPrice" : originalPrice,
                                      "brand": metricsEngine.getProductBrand(product),
                                      "category": metricsEngine.getProductCategory(product),
                                      "variant": "",
                                      "list": list,
                                      "position": metricsEngine.impressions.length+1};
                    metricsEngine.impressions.push(gaProduct);
                    if(metricsEngine.impressions.length === $('.mz-productdetail-addtocart').length){
                        metricsEngine.push = {'event': 'DEPLabs',
                                              'depData': {'currencyCode': 'USD',
                                                          'impressions': metricsEngine.impressions}};
                        return metricsEngine.dataLayerPush();                                   
                    }
                }
            },

            initRemoveFromCartObserver: function(){

                $('#cart').on("click", '[data-mz-action="removeItem"]', function () {
                    var cartItem = $(this).data('mzCartItem');
                    api.get("cart").then(function(resp) {
                        if(resp.data.items.length){
                            _.each(resp.data.items, function(cartitemObject){
                                if(cartitemObject.id === cartItem){
                                    metricsEngine.currentProduct = cartitemObject;  
                                    metricsEngine.trackRemovedFromCart();
                                    metricsEngine.currentProduct = false;
                                }
                            });
                        }
                    });
                });
            },
            trackRemovedFromCart: function() {
                
                if (!metricsEngine.googleTagManagerEnabled  || !metricsEngine.currentProduct) return false;               
                                
                try {                        
                    var cartitemObject = metricsEngine.currentProduct;
                    api.get('product', cartitemObject.product.productCode).then(function(productResponse){
                        var product = new ProductModels.Product(productResponse.data);           
                        var gaProduct = metricsEngine.getGAProduct(cartitemObject, product, cartitemObject.quantity);
                        metricsEngine.push = {'event': 'removeFromCart',
                                              'depData': {'remove': {'actionField': {'list': metricsEngine.getList()},
                                                                     'products': [gaProduct]}}};
                        return metricsEngine.dataLayerPush();
                    });
                } catch (ex) {
                    if(metricsEngine.debug) console.log(ex);
                    return true;
                }
            }          
        };
        try {
            metricsEngine.init();
        } catch (ex) {
            if(metricsEngine.debug) console.log('Metrics Init Error.');
        }
        window.metricsEngine = metricsEngine;
    }

    $(document).ready(function() {
        var pageContext = require.mozuData('pagecontext');
        if(pageContext.pageType === "cart"){
            window.metricsEngine.initRemoveFromCartObserver();
            // free samples section not always load on first load, not always takes same time to load
            $('#free-samples').bind('DOMSubtreeModified', function(e) { 
                window.metricsEngine.initSampleProductsObserver();
            });
        }else{ //for home, quiz, directory and pdp pages
            setTimeout(function(){ //needs to wait for all add-to-cart buttons to load
                window.metricsEngine.initAddToCartObserver();
            },500);    
            if(pageContext.pageType === "product") window.metricsEngine.initSubscriberProductObserver();           
        }   
    });
    return window.metricsEngine;
});

define('modules/page-header/global-cart',[
    'modules/backbone-mozu',
    'modules/jquery-mozu',
    "modules/api",
    "hyprlive",
    'underscore',
    "modules/models-product",
    "modules/metrics"
], function(Backbone, $, Api, Hypr, _, ProductModels, MetricsEngine) {

    var globalCartRelatedProducts = Hypr.getThemeSetting('globalCartRelatedProducts'),
        globalCartRelatedProductsSize = Hypr.getThemeSetting('globalCartRelatedProductsSize'),
        globalCartMaxItemCount = Hypr.getThemeSetting('globalCartMaxItemCount'),
        globalCartHidePopover = Hypr.getThemeSetting('globalCartHidePopover'),
        coerceBoolean = function(x) {
            return !!x;
        };
    var GlobalCartView = Backbone.MozuView.extend({
        templateName: "modules/page-header/global-cart-flyout",
        initialize: function() {
            var me = this;
        },
        render: function() {
            var me = this;
            Backbone.MozuView.prototype.render.apply(this);
        },
        showRelatedProducts: function(productCollection) {
            var me = this;
            var productCodes = [];
            for (var i = 0; i < productCollection.length; i++) {
                var currentProduct = productCollection[i].product;
                if (currentProduct && currentProduct.properties) {
                    for (var x = 0; x < currentProduct.properties.length; x++) {
                        if (currentProduct.properties[x].attributeFQN == 'tenant~product-upsell') {
                            var temp = _.pluck(currentProduct.properties[x].values, "value");
                            productCodes = productCodes.concat($.grep(temp || [], coerceBoolean));

                        }
                    }
                }
            }
            var filter = _.map(productCodes, function(c) {
                return "ProductCode eq " + c;
            }).join(' or ');
            Api.get("search", { filter: filter, pageSize : globalCartRelatedProductsSize}).then(function(collection) {
                var template = 'Widgets/misc/product-carousel-listing';
                var RelatedProductsView = Backbone.MozuView.extend({
                    templateName: template
                });
                var relatedProductsCollection = new ProductModels.ProductCollection(collection.data);
                var relatedProductsView = new RelatedProductsView({
                    model: relatedProductsCollection,
                    el: me.$el.find('.related-products')
                });
                relatedProductsView.render();
                relatedProductsView.$el.find('img').height(150);
            }, function() {
                console.log("Got some error at cross sell in Global Cart");
            });

        },
        openLiteRegistration:function() {
            $(".second-tab").show();
            $(".third-tab").hide();
            $('#liteRegistrationModal').modal('show');
        },
        checkoutGuest: function() {
            $(".second-tab").hide();
            $(".third-tab").show();
            $('#liteRegistrationModal').modal('show');
        },
        update: function(showGlobalCart) {
            var me = this;
            Api.get("cart").then(function(resp) {
                resp.data.cartItems = resp.data.items.slice(0,globalCartMaxItemCount);
                if(globalCartHidePopover === true && resp.data.cartItems.length === 0){
                    $(me.el).hide();
                }
                me.model.attributes = resp.data;
                me.render();
                if (showGlobalCart) {
                    me.$el.show();
                    setTimeout(function() {
                        me.$el.attr('style', '');
                    }, 5000);
                }
                if (globalCartRelatedProducts) {
                    me.showRelatedProducts(resp.data.items);
                }
            });
        }
    });

    var Model = Backbone.MozuModel.extend();
    var globalCartView = new GlobalCartView({
        el: $('#global-cart'),
        model: new Model({})
    });
    globalCartView.render();
    var GlobalCart = {
        update: function(showGlobalCart) {
            globalCartView.update(showGlobalCart);
        }
    };
    return GlobalCart;

});

/**
 * Watches for changes to the quantity of items in the shopping cart, to update
 * cart count indicators on the storefront.
 */
define('modules/cart-monitor',['modules/jquery-mozu', 'modules/api', 'bootstrap', 'modules/page-header/global-cart', 'hyprlive'], function ($, api, Bootstrap, GlobalCart, Hypr) {

    var $cartCount,
        user = require.mozuData('user'),
        userId = user.userId,
        $document = $(document),
        CartMonitor = {
            setAmount: function(amount) {
                var localAmount = Hypr.engine.render("{{price|currency}}",{ locals: { price: amount }});
                this.$amountEl.text(localAmount);
            },           
            setCount: function(count) {
                this.$el.text(count);
            },
            addToCount: function(count) {
                this.update(true);
            },
            getCount: function() {
                return parseInt(this.$el.text(), 10) || 0;
            },
            update: function(showGlobalCart) {
                api.get('cartsummary').then(function(summary) {
                    $.cookie('mozucart', JSON.stringify(summary.data), { path: '/' });
                    savedCarts[userId] = summary.data;
                    $document.ready(function() {
                        $('.ml-header-global-cart-wrapper').css('display', 'block');
                        CartMonitor.setCount(summary.data.totalQuantity);
                        CartMonitor.setAmount(summary.data.total); 
                        GlobalCart.update(showGlobalCart);                         
                    });
                });
                
            }
        },
        savedCarts,
        savedCart;

    try {
        savedCarts = JSON.parse($.cookie('mozucart'));
    } catch(e) {}

    if (!savedCarts) savedCarts = {};
    savedCart = savedCarts || savedCarts[userId];

    //if (isNaN(savedCart.itemCount)) {
        CartMonitor.update();
    //}

    $document.ready(function () {
        CartMonitor.$el = $('[data-mz-role="cartcount"]').text(savedCart.totalQuantity || 0);
        CartMonitor.$amountEl = $('[data-mz-role="cartamount"]').text(savedCart.total || 0);
    });

    return CartMonitor;

});
define('modules/contextify',['modules/jquery-mozu'], function ($) {
    $(document).ready(function () {
        $('[data-mz-contextify]').each(function () {
            var $this = $(this),
                config = $this.data();

            $this.find(config.mzContextify).each(function () {
                var $item = $(this);
                if (config.mzContextifyAttr === "class") {
                    $item.addClass(config.mzContextifyVal);
                } else {
                    $item.prop(config.mzContextifyAttr, config.mzContextifyVal);
                }
            });
        });
    });
});
define('shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery',['modules/jquery-mozu'], function(jQuery) { 

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.7'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      }
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
      that.$element = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);
 ; 

return jQuery; 

});


//@ sourceURL=/vendor/bootstrap/js/tooltip.js

;
define('shim!vendor/bootstrap/js/popover[shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery=jQuery]>jQuery',['shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery'], function(jQuery) { 

/* ========================================================================
 * Bootstrap: popover.js v3.3.7
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.7'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);
 ; 

return jQuery; 

});


//@ sourceURL=/vendor/bootstrap/js/popover.js

;
/*! http://mths.be/placeholder v2.1.0 by @mathias */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define('vendor/jquery-placeholder/jquery.placeholder',['jquery'], factory);
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function($) {

	// Opera Mini v7 doesn’t support placeholder although its DOM seems to indicate so
	var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
	var valHooks = $.valHooks;
	var propHooks = $.propHooks;
	var hooks;
	var placeholder;

	if (isInputSupported && isTextareaSupported) {

		placeholder = $.fn.placeholder = function() {
			return this;
		};

		placeholder.input = placeholder.textarea = true;

	} else {

		var settings = {};

		placeholder = $.fn.placeholder = function(options) {

			var defaults = {customClass: 'placeholder'};
			settings = $.extend({}, defaults, options);

			var $this = this;
			$this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.'+settings.customClass)
				.bind({
					'focus.placeholder': clearPlaceholder,
					'blur.placeholder': setPlaceholder
				})
				.data('placeholder-enabled', true)
				.trigger('blur.placeholder');
			return $this;
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		hooks = {
			'get': function(element) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value;
				}

				return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
			},
			'set': function(element, value) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value = value;
				}

				if (!$element.data('placeholder-enabled')) {
					return element.value = value;
				}
				if (value === '') {
					element.value = value;
					// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
					if (element != safeActiveElement()) {
						// We can't use `triggerHandler` here because of dummy text/password inputs :(
						setPlaceholder.call(element);
					}
				} else if ($element.hasClass(settings.customClass)) {
					clearPlaceholder.call(element, true, value) || (element.value = value);
				} else {
					element.value = value;
				}
				// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
				return $element;
			}
		};

		if (!isInputSupported) {
			valHooks.input = hooks;
			propHooks.value = hooks;
		}
		if (!isTextareaSupported) {
			valHooks.textarea = hooks;
			propHooks.value = hooks;
		}

		$(function() {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function() {
				// Clear the placeholder values so they don't get submitted
				var $inputs = $('.'+settings.customClass, this).each(clearPlaceholder);
				setTimeout(function() {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('beforeunload.placeholder', function() {
			$('.'+settings.customClass).each(function() {
				this.value = '';
			});
		});

	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {};
		var rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder(event, value) {
		var input = this;
		var $input = $(input);
		if (input.value == $input.attr('placeholder') && $input.hasClass(settings.customClass)) {
			if ($input.data('placeholder-password')) {
				$input = $input.hide().nextAll('input[type="password"]:first').show().attr('id', $input.removeAttr('id').data('placeholder-id'));
				// If `clearPlaceholder` was called from `$.valHooks.input.set`
				if (event === true) {
					return $input[0].value = value;
				}
				$input.focus();
			} else {
				input.value = '';
				$input.removeClass(settings.customClass);
				input == safeActiveElement() && input.select();
			}
		}
	}

	function setPlaceholder() {
		var $replacement;
		var input = this;
		var $input = $(input);
		var id = this.id;
		if (input.value === '') {
			if (input.type === 'password') {
			    if (!$input.data('placeholder-textinput')) {
                    // JBZ 2014, replaced his more optimistic .clone() method with this one because IE8 will silently fail to change the display characters of a password field
				    $replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					$replacement
						.removeAttr('name')
						.data({
							'placeholder-password': $input,
							'placeholder-id': id
						})
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data({
							'placeholder-textinput': $replacement,
							'placeholder-id': id
						})
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prevAll('input[type="text"]:first').attr('id', id).show();
				// Note: `$input[0] != input` now!
			}
			$input.addClass(settings.customClass);
			$input[0].value = $input.attr('placeholder');
		} else {
			$input.removeClass(settings.customClass);
		}
	}

	function safeActiveElement() {
		// Avoid IE9 `document.activeElement` of death
		// https://github.com/mathiasbynens/jquery-placeholder/pull/99
		try {
			return document.activeElement;
		} catch (exception) {}
	}

}));

/* globals grecaptcha */

/**
 * Adds a login popover to all login links on a page.
 */

define('modules/login-links',['shim!vendor/bootstrap/js/popover[shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery=jQuery]>jQuery', 'modules/api', 'hyprlive', 'underscore', 'hyprlivecontext', 'vendor/jquery-placeholder/jquery.placeholder','modules/backbone-mozu'], function ($, api, Hypr, _, HyprLiveContext,backbone) {
    var current = "";
    var usePopovers = function() {
        return !Modernizr.mq('(max-width: 480px)');
    },
    isTemplate = function(path) {
        return require.mozuData('pagecontext').cmsContext.template.path === path;
    },
    returnFalse = function () {
        return false;
    },
    returnUrl = function() {
        var returnURL = $('input[name=returnUrl]').val();
        if(!returnURL) {
            returnURL = '/';
        }
        return returnURL;
    },
    $docBody,

    polyfillPlaceholders = !('placeholder' in $('<input>')[0]);

    var DismissablePopover = function () { };

    $.extend(DismissablePopover.prototype, {
        boundMethods: [],
        setMethodContext: function () {
            for (var i = this.boundMethods.length - 1; i >= 0; i--) {
                this[this.boundMethods[i]] = $.proxy(this[this.boundMethods[i]], this);
            }
        },
        dismisser: function (e) {
            if (!$.contains(this.popoverInstance.$tip[0], e.target) && !this.loading) {
                // clicking away from a popped popover should dismiss it
                this.$el.popover('destroy');
                this.$el.on('click', this.createPopover);
                this.$el.off('click', returnFalse);
                this.bindListeners(false);
                $docBody.off('click', this.dismisser);
            }
        },
        setLoading: function (yes) {
            this.loading = yes;
            this.$parent[yes ? 'addClass' : 'removeClass']('is-loading');
        },
        newsetLoading: function (yes) {
            this.loading = yes;
            $(current)[yes ? 'addClass' : 'removeClass']('is-loading');
        },
        newdisplayMessage: function (el, msg) {
            this.newsetLoading(false);
            $(el).parents('.tab-pane').find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
        },
        newdisplayApiMessage: function (xhr) {
            //console.log(current);
            var msg = xhr.message || (xhr && xhr.responseJSON && xhr.responseJSON.message) || Hypr.getLabel('unexpectedError');
            $(current).parents('.tab-pane').find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
            //this.newdisplayMessage(current, (xhr.message || (xhr && xhr.responseJSON && xhr.responseJSON.message) || Hypr.getLabel('unexpectedError')));
        },
        onPopoverShow: function () {
            var self = this;
            _.defer(function () {
                $docBody.on('click', self.dismisser);
                self.$el.on('click', returnFalse);
            });
            this.popoverInstance = this.$el.data('bs.popover');
            this.$parent = this.popoverInstance.tip();
            this.bindListeners(true);
            this.$el.off('click', this.createPopover);
            if (polyfillPlaceholders) {
                this.$parent.find('[placeholder]').placeholder({ customClass: 'mz-placeholder' });
            }
        },
        createPopover: function (e) {
            // in the absence of JS or in a small viewport, these links go to the login page.
            // Prevent them from going there!
            var self = this;
            if (usePopovers()) {
                e.preventDefault();
                // If the parent element's not positioned at least relative,
                // the popover won't move with a window resize
                //var pos = $parent.css('position');
                //if (!pos || pos === "static") $parent.css('position', 'relative');
                this.$el.popover({
                    //placement: "auto right",
                    animation: true,
                    html: true,
                    trigger: 'manual',
                    content: this.template,
                    container: 'body'
                }).on('shown.bs.popover', this.onPopoverShow)
                .popover('show');

            }
        },
        retrieveErrorLabel: function (xhr) {
            var message = "";
            if (xhr.message) {
                message = Hypr.getLabel(xhr.message);
            } else if ((xhr && xhr.responseJSON && xhr.responseJSON.message)) {
                message = Hypr.getLabel(xhr.responseJSON.message);
            }

            if (!message || message.length === 0) {
                this.displayApiMessage(xhr);
            } else {
                var msgCont = {};
                msgCont.message = message;
                this.displayApiMessage(msgCont);
            }
        },
        displayApiMessage: function (xhr) {
            this.displayMessage(xhr.message ||
                (xhr && xhr.responseJSON && xhr.responseJSON.message) ||
                Hypr.getLabel('unexpectedError'));
        },
        displayMessage: function (msg) {
            this.setLoading(false);
            this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
        },
        init: function (el) {
            this.$el = $(el);
            this.loading = false;
            this.setMethodContext();
            if (!this.pageType) {
                this.$el.on('click', this.createPopover);
            }
            else {
               this.$el.on('click', _.bind(this.doFormSubmit, this));
            }
        },
        doFormSubmit: function(e) {
            e.preventDefault();
            this.$parent = this.$el.closest(this.formSelector);
            this[this.pageType]();
        }
    });

    var LoginPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.login = _.debounce(this.login, 150);
        this.retrievePassword = _.debounce(this.retrievePassword, 150);
    };
    LoginPopover.prototype = new DismissablePopover();
    $.extend(LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'handleLoginComplete', 'displayResetPasswordMessage', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'slideRight', 'slideLeft', 'login', 'retrievePassword', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/login-popover').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="forgotpasswordform"]', this.slideRight);
            this.$parent[onOrOff]('click', '[data-mz-action="loginform"]', this.slideLeft);
            this.$parent[onOrOff]('click', '[data-mz-action="submitlogin"]', this.login);
            this.$parent[onOrOff]('click', '[data-mz-action="recaptchasubmitlogin"]', this.loginRecaptcha.bind(this));
            this.$parent[onOrOff]('click', '[data-mz-action="submitforgotpassword"]', this.retrievePassword);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        onPopoverShow: function () {
            var me = this;
            DismissablePopover.prototype.onPopoverShow.apply(this, arguments);
            this.panelWidth = this.$parent.find('.mz-l-slidebox-panel').first().outerWidth();
            this.$slideboxOuter = this.$parent.find('.mz-l-slidebox-outer');

            if (this.$el.hasClass('mz-forgot')){
                this.slideRight();
            }

            var recaptchaType = HyprLiveContext.locals.themeSettings.recaptchaType;

            var recaptchaContainer = recaptchaType === 'Invisible' ? 'recaptcha-container-global' : 'recaptcha-container-popup';

            if (HyprLiveContext.locals.themeSettings.enableRecaptcha) {
                if (recaptchaType !== 'Invisible' || !window.renderedRecaptcha) {
                    grecaptcha.render(
                        recaptchaContainer,
                        {
                            size: recaptchaType === 'Invisible' ? 'invisible' : 'compact',
                            badge: HyprLiveContext.locals.themeSettings.recaptchaBadgePosition,
                            theme: HyprLiveContext.locals.themeSettings.recaptchaTheme,
                            sitekey: HyprLiveContext.locals.themeSettings.recaptchaSiteKey,
                            callback: function(result) {
                                window.captchaToken = result;

                                if (recaptchaType === 'Invisible') {
                                    me.login(result);
                                }
                            }
                        }
                    );
                }
            }

            if (recaptchaType === 'Invisible') {
                window.renderedRecaptcha = true;
            }
        },
        handleEnterKey: function (e) {
            if (e.which === 13) {
                var $parentForm = $(e.currentTarget).parents('[data-mz-role]');
                switch ($parentForm.data('mz-role')) {
                    case "login-form":
                        this.login();
                        break;
                    case "forgotpassword-form":
                        this.retrievePassword();
                        break;
                }
                return false;
            }
        },
        slideRight: function (e) {
            if (e) e.preventDefault();
            this.$slideboxOuter.css('left', -this.panelWidth);
        },
        slideLeft: function (e) {
            if (e) e.preventDefault();
            this.$slideboxOuter.css('left', 0);
        },
        loginRecaptcha: function() {
            var me = this;

            if (HyprLiveContext.locals.themeSettings.recaptchaType !== 'Invisible') {
                return me.login();
            }

            if (window.captchaToken) {
                return me.login(window.captchaToken);
            }

            if (!window.renderedRecaptcha) {
                grecaptcha.render(
                    'recaptcha-container-global',
                    {
                        size: HyprLiveContext.locals.themeSettings.recaptchaType === 'Invisible' ? 'invisible' : HyprLiveContext.locals.themeSettings.recaptchaSize,
                        badge: HyprLiveContext.locals.themeSettings.recaptchaBadgePosition,
                        theme: HyprLiveContext.locals.themeSettings.recaptchaTheme,
                        sitekey: HyprLiveContext.locals.themeSettings.recaptchaSiteKey,
                        callback: function(result) {
                            window.captchaToken = result;
                            me.login(result);
                        }
                    }
                );

                window.renderedRecaptcha = true;
            }

            grecaptcha.execute();
        },
        login: function (token) {
            this.setLoading(true);

            //NGCOM-623
            //If a returnUrl has been specified in the url query and there
            //is no returnUrl value provided by the server,
            //we'll use the one specified in the url query. If a returnURl has been
            //provided by the server, it will live in an invisible input in the
            //login links box.

            var returnUrl = "";
            var returnUrlParam = new URLSearchParams(window.location.search).get('returnUrl'); // jshint ignore:line
            if (returnUrlParam && !this.$parent.find('input[name=returnUrl]').val()){
              returnUrl = returnUrlParam;
            } else {
              returnUrl = this.$parent.find('input[name=returnUrl]').val();
            }

            var data = {
                email: this.$parent.find('[data-mz-login-email]').val(),
                password: this.$parent.find('[data-mz-login-password]').val()
            };

            if (token && typeof token === 'string') {
                data.token = token;
            } else if (window.captchaToken) {
                data.token = window.captchaToken;
            }

            api.action('customer', 'loginStorefront', data).then(this.handleLoginComplete.bind(this, returnUrl), this.displayApiMessage);

        },
        anonymousorder: function() {
            var email = "";
            var billingZipCode = "";
            var billingPhoneNumber = "";

            switch (this.$parent.find('[data-mz-verify-with]').val()) {
                case "zipCode":
                    {
                        billingZipCode = this.$parent.find('[data-mz-verification]').val();
                        email = null;
                        billingPhoneNumber = null;
                        break;
                    }
                case "phoneNumber":
                    {
                        billingZipCode = null;
                        email = null;
                        billingPhoneNumber = this.$parent.find('[data-mz-verification]').val();
                        break;
                    }
                case "email":
                    {
                        billingZipCode = null;
                        email = this.$parent.find('[data-mz-verification]').val();
                        billingPhoneNumber = null;
                        break;
                    }
                default:
                    {
                        billingZipCode = null;
                        email = null;
                        billingPhoneNumber = null;
                        break;
                    }

            }

            this.setLoading(true);
            // the new handle message needs to take the redirect.
            api.action('customer', 'orderStatusLogin', {
                ordernumber: this.$parent.find('[data-mz-order-number]').val(),
                email: email,
                billingZipCode: billingZipCode,
                billingPhoneNumber: billingPhoneNumber
            }).then(function () { window.location.href = (HyprLiveContext.locals.siteContext.siteSubdirectory||'') +  "/my-anonymous-account?returnUrl="+(HyprLiveContext.locals.siteContext.siteSubdirectory||'')+"/myaccount"; }, _.bind(this.retrieveErrorLabel, this));
        },
        retrievePassword: function () {
            this.setLoading(true);
            api.action('customer', 'resetPasswordStorefront', {
                EmailAddress: this.$parent.find('[data-mz-forgotpassword-email]').val()
            }).then(_.bind(this.displayResetPasswordMessage,this), this.displayApiMessage);
        },
        handleLoginComplete: function (returnUrl) {
            if ( returnUrl ){
                window.location.href= returnUrl;
            }else{
                window.location.reload();
            }
        },
        displayResetPasswordMessage: function () {
            this.displayMessage(Hypr.getLabel('resetEmailSent'));
        }
    });

    var SignupPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.signup = _.debounce(this.signup, 150);
    };
    SignupPopover.prototype = new DismissablePopover();
    $.extend(SignupPopover.prototype, LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'signup', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/signup-popover').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="signup"]', this.signup);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        handleEnterKey: function (e) {
            if (e.which === 13) { this.signup(); }
        },
        validate: function (payload) {
            if (!payload.account.emailAddress) return this.displayMessage(Hypr.getLabel('emailMissing')), false;
            if (!payload.password) return this.displayMessage(Hypr.getLabel('passwordMissing')), false;
            if (payload.password !== this.$parent.find('[data-mz-signup-confirmpassword]').val()) return this.displayMessage(Hypr.getLabel('passwordsDoNotMatch')), false;
            if (!payload.agreeToGDPR) return this.displayMessage(Hypr.getLabel('didNotAgreeToGDPR')), false;
            return true;
        },
        signup: function () {
            var self = this,
                email = this.$parent.find('[data-mz-signup-emailaddress]').val(),
                firstName = this.$parent.find('[data-mz-signup-firstname]').val(),
                lastName = this.$parent.find('[data-mz-signup-lastname]').val(),
                agreeToGDPR = this.$parent.find('[data-mz-signup-agreeToGDPR]').prop('checked'),
                payload = {
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: firstName,
                        lastName: lastName,
                        contacts: [{
                            email: email,
                            firstName: firstName,
                            lastNameOrSurname: lastName
                        }]
                    },
                    password: this.$parent.find('[data-mz-signup-password]').val(),
                    agreeToGDPR: agreeToGDPR
                };
            if (this.validate(payload)) {
                delete payload.agreeToGDPR;
                //var user = api.createSync('user', payload);
                this.setLoading(true);
                return api.action('customer', 'createStorefront', payload).then(function () {
                    if (self.redirectTemplate) {
                        window.location.pathname = self.redirectTemplate;
                    }
                    else {
                        window.location.reload();
                    }
                }, self.displayApiMessage);
            }
        }
    });
    var EmailSignupPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.signup = _.debounce(this.signup, 150);
    };
    EmailSignupPopover.prototype = new DismissablePopover();
    $.extend(EmailSignupPopover.prototype, LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'signup', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/signup-popover').render(),
        bindListeners: function(on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="signup"]', this.signup);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        handleEnterKey: function(e) {
            if (e.which === 13) { this.signup(); }
        },
        validate: function(email, firstname, lastname) {
            if (!email) return this.displayMessage(Hypr.getLabel('emailMissing')), false;
            if (!(backbone.Validation.patterns.email.test(email))) return this.displayMessage(Hypr.getLabel('emailwrongpattern')), false;
            return true;
        },
        signup: function() {
            var self = this,
                email = this.$parent.find('[data-mz-signup-emailaddress]').val(),
                firstName = this.$parent.find('[data-mz-signup-firstname]').val(),
                lastName = this.$parent.find('[data-mz-signup-lastname]').val();
            var pageType = HyprLiveContext.locals.themeSettings.pageType;
            if (this.validate(email, firstName, lastName)) {
                var serviceurl = '/events/emailsignup?emailAddress=' +email+ '&firstName='+firstName + '&lastName='+lastName+'&isMarketingEnabled=true';
                var apiData = require.mozuData('apicontext');
                $.ajax({
                    url: serviceurl,
                    headers: apiData.headers,
                    method: 'GET',
                    success: function(res) {
                        if(res){
                            $('.mz-signupform').hide();
                            $('.register-success-panel').show();
                        }
                    }
                });
            }
        }
    });
    var MyAccountPopover = function(e){
        var self = this;
        this.init = function(el){
            self.popoverEl = $('#my-account-content');
            self.bindListeners.call(el, true);
            $('#my-account').attr('href','#');
        };
        this.bindListeners =  function (on) {
            var onOrOff = on ? "on" : "off";
            //$(this).parent()[onOrOff]('mouseover', '[data-mz-action="my-account"]', self.openPopover);
            $(this).parent()[onOrOff]('click', '[data-mz-action="my-account"]', self.openPopover);
            // bind other events
        };
        this.openPopover = function(e){
            //self.popoverEl.popover('show');
            e.preventDefault();
            $("#my-account").popover({
                html : true,
                placement : 'bottom',
                content: function() {
                  return self.popoverEl.html();
                }
            }); //.popover('show');
        };
    };

    var LoginRegistrationModal = function(){
        var self = this;
        this.init = function(el){
            self.modalEl = $('#liteRegistrationModal');
            self.bindListeners.call(el, true);
            self.doLogin = _.debounce(self.doLogin, 150);
            self.doSignup = _.debounce(self.doSignup, 150);
            api.get('attributedefinition').then(function(attribute) {
                // console.log(attribute.data.items);
                for(var i=0; i< attribute.data.items.length; i++){
                    if(attribute.data.items[i].attributeCode === "recovery-question"){
                        var recVals = attribute.data.items[i].vocabularyValues;
                        for(var j=0; j<recVals.length; j++){
                            $('<option/>').text(recVals[j].content.value).attr('value',recVals[j].value).appendTo('#recoveryQuestionList');
                        }
                    }
                }
            });
        };

        this.bindListeners =  function (on) {
            var onOrOff = on ? "on" : "off";
            $(this).parent()[onOrOff]('click', '[data-mz-action="lite-registration"]', self.openLiteModal);
            $(this).parents('.mz-utilitynav')[onOrOff]('click', '[data-mz-action="doLogin"]', self.doLogin);
            $(this).parents('.mz-utilitynav')[onOrOff]('click', '[data-mz-action="doSignup"]', self.doSignup);

            // bind other events
        };

        this.openLiteModal = function(){
            if (self.modalEl[0] == $("#liteRegistrationModal")[0]) {
                $(".second-tab").show();
                $(".third-tab").hide();
            }
            self.modalEl.modal('show');
        };

        this.doLogin = function(){
            //console.log("Write business logic for Login form submition");
            var returnUrl = $('#returnUrl').val();
            var payload = {
                email: $(this).parents('#login').find('[data-mz-login-email]').val(),
                password: $(this).parents('#login').find('[data-mz-login-password]').val()
            };
            current = this;
            if (self.validateLogin(this, payload) && self.validatePassword(this, payload)) {
                //var user = api.createSync('user', payload);
                (LoginPopover.prototype).newsetLoading(true);
                return api.action('customer', 'loginStorefront', {
                    email: $(this).parents('#login').find('[data-mz-login-email]').val(),
                    password: $(this).parents('#login').find('[data-mz-login-password]').val()
                }).then(function () {
                    if ( returnUrl ){
                        window.location.href= returnUrl;
                    }else{
                        window.location.reload();
                    }
                }, (LoginPopover.prototype).newdisplayApiMessage);
            }
        };
        this.validateLogin = function (el, payload) {
            if (!payload.email) return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('emailMissing')), false;
            if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(payload.email))) return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('emailwrongpattern')), false;
            return true;
        };
        this.doSignup = function(){
            var redirectTemplate = 'myaccount';
            var returnUrl = $('#returnUrl').val();
            var emailupdates = $(this).parents('#newshopper').find('[data-mz-signup-emailupdates]').val();
            var accMarketing = false;
            if(emailupdates === "on")
                accMarketing = true;
            var email = $(this).parents('#newshopper').find('[data-mz-signup-emailaddress]').val().trim();
            var recoveryquestion = $(this).parents('#newshopper').find('[data-mz-signup-recoveryquestion]').val();
            var recoveryanswer = $(this).parents('#newshopper').find('[data-mz-signup-recoveryanswer]').val().trim();
            var payload = {
                account: {
                    emailAddress: email,
                    userName: email,
                    acceptsMarketing: accMarketing,
                    contacts: [{
                        email: email
                    }],
                    attributes: [
                      {
                         //"attributeDefinitionId": "14",
                         "fullyQualifiedName": "tenant~recovery-question",
                         "values": [recoveryquestion]
                      },
                      {
                         //"attributeDefinitionId": "16",
                         "fullyQualifiedName": "tenant~recovery-answer",
                         "values": [recoveryanswer]
                      }
                   ]
                },
                password: $(this).parents('#newshopper').find('[data-mz-signup-password]').val()
            };
            current = this;
            if (self.validateSignup(this, payload) && self.validatePassword(this, payload)) {
                //var user = api.createSync('user', payload);
                (LoginPopover.prototype).newsetLoading(true);
                return api.action('customer', 'createStorefront', payload).then(function () {
                    if(returnUrl){
                        window.location.href = returnUrl;
                    }else if (redirectTemplate) {
                        window.location.pathname = redirectTemplate;
                    } else {
                        window.location.reload();
                    }
                }, (LoginPopover.prototype).newdisplayApiMessage);
            }
        };
        this.validatePassword = function(el, payload){
            if (!payload.password)
                return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('passwordMissing')), false;
            if (payload.password.length < 6) {
                return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('passwordlength')), false;
            } else if (payload.password.length > 50) {
                return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('passwordlength')), false;
            } else if (payload.password.search(/\d/) == -1) {
                return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('passwordlength')), false;
            } else if (payload.password.search(/[a-zA-Z]/) == -1) {
                return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('passwordlength')), false;
            } else if (payload.password.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) != -1) {
                return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('passwordlength')), false;
            }
            return true;
        };
        this.validateSignup = function (el, payload) {
            if (!payload.account.emailAddress) return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('emailMissing')), false;
            if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(payload.account.emailAddress))) return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('emailwrongpattern')), false;
            if (payload.password !== $(el).parents('#newshopper').find('[data-mz-signup-confirmpassword]').val()) return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('passwordsDoNotMatch')), false;
            if (payload.account.attributes.recoveryquestion === "0") return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('chooseRecoveryQuestion')), false;
            if($('#recoveryQuestionList').val() === "0") return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('chooseRecoveryQuestion')), false;
            if(!$('#recoveryAnswer').val()) return (LoginPopover.prototype).newdisplayMessage(el, Hypr.getLabel('recoveryAnswerMissing')), false;
            return true;
        };
    };
    $(document).ready(function() {
        $docBody = $(document.body);

        $('[data-mz-action="lite-registration"]').each(function() {
            var modal = new LoginRegistrationModal();
            modal.init(this);
        });
        $('#my-account').attr('href','#');
        $('[data-mz-action="my-account"]').click(function() {
            var popover = new MyAccountPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $("#my-account").popover({
                html : true,
                placement : 'bottom',
                content: function() {
                  return $('#my-account-content').html();
                }
            });
        /*$('[data-mz-action="my-account"]').hover(function() {
            var popover = new MyAccountPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $(document).on('mouseleave','#mz-logged-in-notice',function(){
            $('#my-account').popover('hide');
        });
        */
        $('body').on('touchend click', function (e) {
            //only buttons
            if ($(e.target).data('toggle') !== 'popover' && !$(e.target).parents().is('.popover.in')) {
                $('[data-toggle="popover"]').popover('hide');
            }
        });

        $('[data-mz-action="login"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="signup"]').each(function() {
            var popover = new SignupPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action=emailSignuppage-submit]').each(function(e) {
            var loginPage = new EmailSignupPopover();
            loginPage.formSelector = 'form[name="mz-emailSignupform"]';
            loginPage.pageType = 'signup';
            loginPage.init(this);
        });
        $('[data-mz-action="continueAsGuest"]').on('click', function(e) {
            e.preventDefault();
            var returnURL = returnUrl();
            if(returnURL .indexOf('checkout') === -1) {
                returnURL = '';
            }

            //saveUserId=true Will logut the current user while persisting the state of the current shopping cart
            $.ajax({
                    method: 'GET',
                    url: '../../logout?saveUserId=true&returnUrl=' + returnURL,
                    complete: function(data) {
                        location.href = require.mozuData('pagecontext').secureHost + '/' + returnURL;
                    }
            });

        });
        $('[data-mz-action="launchforgotpassword"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="signuppage-submit"]').each(function(){
            var signupPage = new SignupPopover();
            signupPage.formSelector = 'form[name="mz-signupform"]';
            signupPage.pageType = 'signup';
            signupPage.redirectTemplate = 'myaccount';
            signupPage.init(this);
        });
        $('[data-mz-action="loginpage-submit"]').each(function(){
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-loginform"]';
            loginPage.pageType = 'login';
            loginPage.init(this);
        });
        $('[data-mz-action="anonymousorder-submit"]').each(function () {
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-anonymousorder"]';
            loginPage.pageType = 'anonymousorder';
            loginPage.init(this);
        });
        $('[data-mz-action="forgotpasswordpage-submit"]').each(function(){
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-forgotpasswordform"]';
            loginPage.pageType = 'retrievePassword';
            loginPage.init(this);
        });

        $(".ml-navbar-secondary .panel-body").each(function() {
            var headingElemnt = $(this).parent().parent().find("a[aria-controls]");
            if ($(this).text().trim() === "" && headingElemnt.data("target")) {
                headingElemnt.find("span").hide();
                headingElemnt.attr("href", "/c/" + headingElemnt.data("target").replace("#sub-nav-", "").replace("#main-nav-", ""));
                headingElemnt.removeAttr("aria-expanded aria-controls data-toggle role");
            }
          });
        $('[data-mz-action="quickOrder"]').on('click', function(e){
              // The Quick Order link takes us to the my account page and opens
              // the appropriate pane.
              // If we're already on the my account page we ensure the page reloads.
              var isMyAccount = window.location.href.indexOf("myaccount") > 0;
              if (isMyAccount){
                  //window.location.reload(false);
                  window.location.assign((HyprLiveContext.locals.siteContext.siteSubdirectory || '') + "/myaccount#QuickOrder");
                  window.location.reload(false);
              }
        });

        $('[data-mz-action="logout"]').each(function(){
            var el = $(this);

            //if were in edit mode, we override the /logout GET, to preserve the correct referrer/page location | #64822
            if (require.mozuData('pagecontext').isEditMode) {

                 el.on('click', function(e) {
                    e.preventDefault();
                    $.ajax({
                        method: 'GET',
                        url: '../../logout',
                        complete: function() { location.reload();}
                    });
                });
            }

        });

        $('[data-mz-action="recaptcha-submit"]').each(function() {
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-loginform"]';
            loginPage.pageType = 'loginRecaptcha';
            loginPage.init(this);

            var recaptchaContainer = HyprLiveContext.locals.themeSettings.recaptchaType === 'Invisible' ? 'recaptcha-container-global' : 'recaptcha-container';

            if (!window.renderedRecaptcha) {
                grecaptcha.render(
                    recaptchaContainer,
                    {
                        size: HyprLiveContext.locals.themeSettings.recaptchaType === 'Invisible' ? 'invisible' : HyprLiveContext.locals.themeSettings.recaptchaSize,
                        badge: HyprLiveContext.locals.themeSettings.recaptchaBadgePosition,
                        theme: HyprLiveContext.locals.themeSettings.recaptchaTheme,
                        sitekey: HyprLiveContext.locals.themeSettings.recaptchaSiteKey,
                        callback: function(result) {
                            window.captchaToken = result;
                            loginPage.login(result);
                        }
                    }
                );
            }

            window.renderedRecaptcha = true;
        });
    });
});

define(
    'modules/models-address',["modules/backbone-mozu", 'hyprlive'],
    function(Backbone, Hypr) {


        var countriesRequiringStateAndZip = {
            US: true,
            CA: true,
            JP: true,
            TW: true
        },
            defaultStateProv = "n/a";

        var PhoneNumbers = Backbone.MozuModel.extend({
            validation: {
                home: [
                {
                    required: true,
                    msg: Hypr.getLabel("phoneMissing")
                },{
                    pattern: "digits",
                    msg: Hypr.getLabel("invalidPhone")
                },{
                    minLength: 10,
                    maxLength: 20,
                    msg: Hypr.getLabel("invalidPhone")
                },{
                    pattern: /^((\+)?[1-9]{1,2})?([-\s\.])?((\(\d{1,4}\))|\d{1,4})(([-\s\.])?[0-9]{1,12}){1,2}$/,
                    msg: Hypr.getLabel("invalidPhone")
                }]
            }
        }),

        StreetAddress = Backbone.MozuModel.extend({
            mozuType: 'address',
            initialize: function() {
                this.on('change:countryCode', this.clearStateAndZipWhenCountryChanges, this);
            },
            clearStateAndZipWhenCountryChanges: function() {
                this.unset('postalOrZipCode');
                this.unset('stateOrProvince');
            },
            validation: {
                address1: {
                    required: true,
                    msg: Hypr.getLabel("streetMissing")
                },
                address2: {
                    fn: "address2Validation"
                },
                cityOrTown: {
                    required: true,
                    msg: Hypr.getLabel("cityMissing")
                },
                countryCode: {
                    required: true,
                    msg: Hypr.getLabel("countryMissing")
                },
                addressType: {
                    required: true,
                    msg: Hypr.getLabel("addressTypeMissing")
                },
                stateOrProvince: {
                    fn: "requiresStateAndZip",
                    msg: Hypr.getLabel("stateProvMissing")
                },
                postalOrZipCode: [{
                    required: true,
                    msg: Hypr.getLabel("postalCodeMissing")
                },{
                    pattern: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
                    msg: Hypr.getLabel("invalidZipcode")
                }]                
            },
            address2Validation: function(){
                    if(this.get('address1')===this.get('address2')){
                        this.set('address2',null);
                    }
                    return false;
            },
            requiresStateAndZip: function(value, attr) {
                if ((this.get('countryCode') in countriesRequiringStateAndZip) && !value) return this.validation[attr.split('.').pop()].msg;
            },
            defaults: {
                candidateValidatedAddresses: null,
                countryCode: Hypr.getThemeSetting('preselectCountryCode') || '',
                addressType: 'Residential'
            },
            toJSON: function(options) {
                // workaround for SA
                var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
                if ((!options || !options.helpers) && !j.stateOrProvince) {
                    j.stateOrProvince = defaultStateProv;
                }
                if (options && options.helpers && j.stateOrProvince === defaultStateProv) {
                    delete j.stateOrProvince;
                }
                return j;
            },
            is: function(another) {
                var s1 = '', s2 = '';
                for (var k in another) {
                    if (k === 'isValidated')
                        continue;
                    s1 = (another[k] || '').toLowerCase();
                    s2 = (this.get(k) || '').toLowerCase();
                    if (s1 != s2) {
                        return false;
                    }
                }
                return true;
            }
        });

        return {
            PhoneNumbers: PhoneNumbers,
            StreetAddress: StreetAddress
        };
    });

define('modules/models-returns',["modules/api", 'underscore', "modules/backbone-mozu", "hyprlive", "modules/models-product"], function (api, _, Backbone, Hypr, ProductModels) {
 var ReturnableItems = Backbone.MozuModel.extend({
        relations: { 
        },
        _returnableItems: [],
        getReturnableItems: function(){
            return _.filter(this._returnableItems, function(item) { 
                var method = (item.fulfillmentMethod) ? item.fulfillmentMethod : item.parent.fulfillmentMethod;
                return method !== "Digital"; 
            });
        },
        fetchReturnableItems: function(){
            var self = this,
            op = self.apiGetReturnableItems();
            self.isLoading(true);
            return op.then(function (data) {
                self.isLoading(false);
                return data;
            }, function () {
                self.isLoading(false);
            });
        }
    }),
    RMAItem = Backbone.MozuModel.extend({
        relations: {
            //item: OrderItem
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },

        _validation: {
            rmaReason: {
                required: true,
                msg: Hypr.getLabel('enterReturnReason')
            },
            rmaQuantity: {
                min: 1,
                msg: Hypr.getLabel('enterReturnQuantity')
            },
            rmaComments: {
                fn: function (value) {
                    if (this.attributes.reason === "Other" && !value) return Hypr.getLabel('enterOtherComments');
                }
            }
        },
        initialize: function() {
            var set = this;
        },
        toJSON: function () {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if(j.rmaReturnType) {
              j.returnType = j.rmaReturnType;
            }
            if (j && j.rmaReason && j.rmaQuantity) {
                    j.reasons = [
                    {
                        reason: j.rmaReason,
                        quantity: j.rmaQuantity
                    }
                ];
                if (j.rmaComments) j.notes = [
                    {
                        text: j.rmaComments
                    }
                ];
            }
            delete j.rmaReason;
            delete j.rmaQuantity;
            delete j.rmaComments;
            delete j.rmaReturnType;
            return j;
        }
    }),
    RMA = Backbone.MozuModel.extend({
        mozuType: 'rma',
        relations: {
            items: Backbone.Collection.extend({
               model: RMAItem 
            })
        },
        defaults: {
            returnType: 'Refund'
        },
        validateActiveReturns: function(){
            var self = this,
            errors = [];
            this.get('items').each(function(item, key) {
                item.validation = item._validation;
                if (item.get('isSelectedForReturn')){
                    if(!item.validate()) errors.push(item.validate());
                }
            });
            if(errors.length > 0) {
              return errors;  
            }
            return false;
        },
        toJSON: function () {
            var self = this,
            jsonItems = [];
            this.get('items').each(function(item){
                jsonItems.push(item.toJSON());
            });
            this.set('items', jsonItems);
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            return j;
        }
    }),
    RMACollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'rmas',
        defaults: {
            pageSize: 5
        },
        relations: {
            items: Backbone.Collection.extend({
                model: RMA
            })
        },
        getReturnItemsByOrderId : function(orderId){
            var self = this;
            var rmaReturns = self.get('items').where(function(rma){
                return rma.get('originalOrderId') === orderId;
            });
            return rmaReturns;
        }
    });
    return {
        ReturnableItems: ReturnableItems,
        RMA: RMA,
        RMACollection: RMACollection
    };
});
define('modules/models-orders',["modules/api", 'underscore', "modules/backbone-mozu", "hyprlive", "modules/models-product", "modules/models-returns"], function(api, _, Backbone, Hypr, ProductModels, ReturnModels) {

    var OrderItem = Backbone.MozuModel.extend({
            relations: {
                product: ProductModels.Product
            },
            helpers: ['uniqueProductCode'],
            uniqueProductCode: function() {
                //Takes into account product variation code
                var self = this,
                    productCode = self.get('productCode');

                if (!productCode) {
                    productCode = (self.get('product').get('variationProductCode')) ? self.get('product').get('variationProductCode') : self.get('product').get('productCode');
                }
                return productCode;
            },
            toJSON: function() {
                var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
                if (j.parent) {
                    j.parent = j.parent.toJSON();
                }
                return j;
            }
        }),

        OrderItemsList = Backbone.Collection.extend({
            model: OrderItem
        }),
        OrderPackageItem = Backbone.MozuModel.extend({
            helpers: ['getProductDetails'],
            productDetails: null,
            getProductDetails: function() {
                /**
                 * Little Odd, this is used to set the value for the helper function getProductDetails
                 * Figuring out a package's product info is somewhat heavy. So in order to ensure it is only run once we do this here.
                 */
                if (!this.productDetails) {
                    this.setProductDetails();
                }
                return this.productDetails;
            },
            addOrderItemToModel: function() {
                var self = this;
                self.set('orderItem', this.getOrderItem());
            },
            getOrderItem: function() {
                var self = this;
                if (this.collection.parent) {
                    return this.collection.parent.getOrder().get('explodedItems').find(function(model) {
                        if (model.get('productCode')) {
                            return self.get('productCode') === model.get('productCode');
                        }

                        var product = model.get('product');
                        var productMatch = self.get('productCode') === (product.get('variationProductCode') ? product.get('variationProductCode') : product.get('productCode')) ;
                        if (self.get('lineId')) {
                            return  productMatch && (self.get('lineId') == model.get('lineId'));
                        } else
                            return productMatch;
                    });
                }
                return null;
            },
            setProductDetails: function() {
                if (this.getOrderItem()) {
                    this.productDetails = this.getOrderItem().toJSON();
                } else {
                    this.productDetails = {};
                }
            }
        }),
        OrderPackage = Backbone.MozuModel.extend({
            relations: {
                items: Backbone.Collection.extend({
                    model: OrderPackageItem
                })
            },
            dataTypes: {
                orderId: Backbone.MozuModel.DataTypes.Int,
                selectedForReturn: Backbone.MozuModel.DataTypes.Boolean
            },
            helpers: ['formatedFulfillmentDate'],
            //TODO: Double Check for useage
            getOrder: function() {
                return this.collection.parent;
            },
            formatedFulfillmentDate: function() {
                var shippedDate = this.get('fulfillmentDate'),
                    options = {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    };

                if (shippedDate) {
                    var date = new Date(shippedDate);
                    return date.toLocaleDateString("en-us", options);
                }

                return "";
            }
        }),

        OrderPackageList = Backbone.Collection.extend({
            model: OrderPackage
        }),
        OrderItemBit = Backbone.MozuModel.extend({
            relations: {
                product: ProductModels.Product
            },
            uniqueProductCode: function() {
                //Takes into account product variation code
                var self = this,
                    productCode = self.get('productCode');

                if (!productCode) {
                    productCode = (self.get('product').get('variationProductCode')) ? self.get('product').get('variationProductCode') : self.get('product').get('productCode');
                }
                return productCode;
            },
            getOrderItem: function() {
                var self = this;
                if (self.get('Type') === "BundleItem" && self.get('parentLineId')) {
                    var orderItem = self.collection.getOrderItems().find(function(item) {
                        return item.get('lineId') === self.get('parentLineId');
                    });
                    return orderItem;
                }
                return this.collection.getOrderItems().find(function(item) {
                    return item.get('lineId') === self.get('lineId');
                });
            }
        }),
        ExplodedOrderItems = Backbone.Collection.extend({
            relations: {
                model: OrderItemBit
            },
            initSet: function() {
                this.mapOrderItems();
            },
            /** 
             * Groups our Exoloded Items by productCode
             *
             * [getGroupedCollection]
             * @return[array of OrderItemBit]
             */
            getGroupedCollection: function() {
                var self = this,
                    groupedBits = {
                        "productExtra": [],
                        "standardProduct": []
                    };

                var productExtras = self.filter(function(item) {
                        return item.has('optionAttributeFQN');
                    }),
                    standardProducts = self.filter(function(item) {
                        return !item.has('optionAttributeFQN');
                    }),
                    standardProductsGroup = _.groupBy(standardProducts, function(item) {
                        return item.uniqueProductCode();
                    }),
                    productExtraGroup = {};
                _.each(productExtras, function(extra, extraKey) {
                    var key = extra.uniqueProductCode() + '_' + extra.get('optionAttributeFQN');
                    var duplicateItem = _.find(productExtraGroup, function(groupedItem) {
                        return (extra.uniqueProductCode() === groupedItem[0].uniqueProductCode() && extra.get('optionAttributeFQN') === groupedItem[0].get('optionAttributeFQN'));
                    });
                    if (duplicateItem) {
                        productExtraGroup[key].push(extra);
                        return false;
                    }
                    productExtraGroup[key] = [extra];
                });

                function combineAndAddToGroupBits(type, grouping) {
                    _.each(grouping, function(group, key) {
                        var groupQuantity = 0;
                        _.each(group, function(item) {
                            groupQuantity += item.get('quantity');
                        });

                        group[0].set('quantity', groupQuantity);
                        groupedBits[type].push(group[0]);
                    });
                }

                combineAndAddToGroupBits("productExtra", productExtraGroup);
                combineAndAddToGroupBits("standardProduct", standardProductsGroup);

                return groupedBits;
            },
            getOrderItems: function() {
                return this.parent.get('items');
            },
            mapOrderItems: function() {
                var self = this;
                self.getOrderItems().each(function(item, key) {
                    var productOrderItem = JSON.parse(JSON.stringify(item));
                    self.explodeOrderItems(productOrderItem);
                });
            },
            explodeOrderItems: function(item) {
                var self = this;
                if (item && item.product.bundledProducts) {
                    if (item.product.bundledProducts.length > 0) {
                        //We do not want to include the orignal bundle in our expoled Items
                        if (item.product.productUsage !== "Bundle") {
                            self.add(new OrderItemBit(item));
                        }
                        self.explodeProductBundle(item);
                        return;
                    }
                }
                self.add(new OrderItemBit(item));
            },
            explodeProductBundle: function(item) {
                var self = this;
                var bundleItems = JSON.parse(JSON.stringify(item.product.bundledProducts));
                _.each(bundleItems, function(bundle, key) {
                    bundle.Type = "BundleItem";
                    bundle.parentProductCode = (item.product.variationProductCode) ? item.product.variationProductCode : item.product.productCode;
                    bundle.parentLineId = item.lineId;
                    bundle.parentProduct = JSON.parse(JSON.stringify(item.product));
                    bundle.quantity = bundle.quantity * item.quantity;
                    self.add(new OrderItemBit(bundle));
                });
            }
        }),
        ReturnableItem = Backbone.MozuModel.extend({
            relations: {
                product: ProductModels.Product
            },
            helpers: ['uniqueProductCode'],
            initialize: function() {
                var duplicate = this.checkForDuplicate();
                if (duplicate)
                    this.handleDuplicate(duplicate);
            },
            checkForDuplicate: function() {
                var self = this;
                var duplicate = self.collection.find(function(item) {
                    if (self.uniqueProductCode() === item.uniqueProductCode()) {
                        if (self.get('orderItemOptionAttributeFQN') === item.get('orderItemOptionAttributeFQN')) {
                            return true;
                        }
                    }
                    return false;
                });
                return duplicate;
            },
            handleDuplicate: function(duplicate) {
                var self = this;
                if (duplicate) {
                    self.set('quantityReturnable', self.get('quantityReturnable') + duplicate.get('quantityReturnable'));
                    self.collection.remove(duplicate);
                }
            },
            uniqueProductCode: function() {
                var self = this,
                    productCode = self.get('productCode');

                if (!productCode) {
                    productCode = (self.get('product').get('variationProductCode')) ? self.get('product').get('variationProductCode') : self.get('product').get('productCode');
                }
                return productCode;
            },
            getOrderItem: function() {
                var self = this;
                var productCode = self.uniqueProductCode();

                var orderItem = self.collection.parent.get('items').find(function(item) {
                    return item.get('lineId') === self.get('orderLineId');
                });
                return orderItem;
            },
            startReturn: function() {
                var rmas = this.collection.parent.get('rma');
                rmas.get('items').add(this);
                rmas.set({
                    originalOrderId: this.collection.parent.get('id'),
                    returnType: 'Refund'
                });

            },
            cancelReturn: function() {
                var rmas = this.collection.parent.get('rma');
                    rmas.get('items').remove(this);
            }
        }),

        ReturnableItems = Backbone.Collection.extend({
            model: ReturnableItem
        }),

        Order = Backbone.MozuModel.extend({
            mozuType: 'order',
            relations: {
                items: OrderItemsList,
                explodedItems: ExplodedOrderItems,
                packages: OrderPackageList,
                pickups: OrderPackageList,
                digitalPackages: OrderPackageList,
                returnableItems: ReturnableItems,
                rma: ReturnModels.RMA
            },
            handlesMessages: true,
            helpers: ['getNonShippedItems', 'hasFulfilledPackages', 'hasFulfilledPickups', 'hasFulfilledDigital', 'getInStorePickups', 'getReturnableItems'],
            _nonShippedItems: {},
            initialize: function() {
                var self = this;
                var pageContext = require.mozuData('pagecontext'),
                    orderAttributeDefinitions = pageContext.storefrontOrderAttributes;
                self.set('orderAttributeDefinitions', orderAttributeDefinitions);
                self.get('explodedItems').initSet();

                //This is used to set the value for the helper function getNonShippedItems
                //Figuring out what items have yet to ship is somwhat heavy. So in order to ensure it is only run once we do this here.
                self.setNonShippedItems();
            },
            hasFulfilledPackages: function() {
                var self = this,
                    hasfulfilledPackage = false;

                self.get('packages').each(function(myPackage) {
                    if (myPackage.get('status') === "Fulfilled") {
                        hasfulfilledPackage = true;
                    }
                });
                return hasfulfilledPackage;
            },
            hasFulfilledPickups: function() {
                var self = this,
                    hasfulfilledPackage = false;

                self.get('pickups').each(function(myPickup) {
                    if (myPickup.get('status') === "Fulfilled") {
                        hasfulfilledPackage = true;
                    }
                });
                return hasfulfilledPackage;
            },
            hasFulfilledDigital: function() {
                var self = this,
                    hasfulfilledPackage = false;

                self.get('digitalPackages').each(function(myDigital) {
                    if (myDigital.get('status') === "Fulfilled") {
                        hasfulfilledPackage = true;
                    }
                });
                return hasfulfilledPackage;
            },
            getReturnableItems: function() {
                var filteredReturnItems = this.get('returnableItems').filter(function(item) {
                    var method = item.getOrderItem().get('fulfillmentMethod');
                    return method !== "Digital";
                });
                return _.invoke(filteredReturnItems, 'toJSON');
            },
            getInStorePickups: function() {
                var filteredItems = _.filter(this._nonShippedItems, function(item) {
                    var method = item.getOrderItem().get('fulfillmentMethod');
                    return method === "Pickup";
                });
                return _.invoke(filteredItems, 'toJSON');
            },
            getNonShippedItems: function() {
                return _.invoke(this._nonShippedItems, 'toJSON');
            },
            /**
             * Creates a list of package codes from all package types that will be used to determine shipped and nonShipped items.
             * 
             * [getCollectionOfPackageCodes]
             * @return {[Array]}
             */
            getCollectionOfPackages: function() {
                var self = this,
                    packageCodes = [],
                    groupedCodes = {
                        "productExtra": [],
                        "standardProduct": []
                    };

                var addPackageItems = function(packageItems) {
                    if (packageItems.length > 0) {
                        packageItems.each(function(thisPackage, key, list) {
                            if (thisPackage.get("status") === "Fulfilled") {
                                _.each(thisPackage.get('items').models, function(packageItem, key, list) {
                                    var quan = packageItem.get('quantity');
                                    var type = (packageItem.get('optionAttributeFQN') && packageItem.get('optionAttributeFQN') !== "") ? "productExtra" : "standardProduct";
                                    for (var i = 0; i < quan; i++) {
                                        groupedCodes[type].push(packageItem);
                                    }
                                });
                            }
                        });
                    }
                };

                addPackageItems(self.get('packages'));
                addPackageItems(self.get('pickups'));
                addPackageItems(self.get('digitalPackages'));

                return groupedCodes;
            },
            /**
             * Creates a list of nonShipped items by comparing fulfilled package items with Order Items
             * 
             * [setNonShippedItems]
             * @return {[Array]}
             */
            setNonShippedItems: function() {
                var self = this,
                    groupedItems = [];

                if (self.get('items')) {
                    //Get collections of both packaged Codes and exploded order items
                    var packages = this.getCollectionOfPackages();
                    groupedItems = this.get('explodedItems').getGroupedCollection();

                    //Update quanity of items by comparing with packaged items
                    _.each(packages, function(type, typeKey, typeList) {
                        _.each(type, function(myPackage, key, list) {
                            for (var i = 0; i < groupedItems[typeKey].length; i++) {
                                if (groupedItems[typeKey][i].uniqueProductCode() === myPackage.get('productCode')) {
                                    if (groupedItems[typeKey][i].get('optionAttributeFQN') && groupedItems[typeKey][i].get('optionAttributeFQN') != myPackage.get('optionAttributeFQN')) {
                                        return false;
                                    }
                                    if (groupedItems[typeKey][i].get('quantity') === 1) {
                                        groupedItems[typeKey].splice(i, 1);
                                        return false;
                                    }
                                    groupedItems[typeKey][i].set('quantity', groupedItems[typeKey][i].get('quantity') - 1);
                                    return false;
                                }
                            }
                        });
                    });

                }
                self._nonShippedItems = groupedItems.standardProduct.concat(groupedItems.productExtra);
                return;
            },
            /**
             * Fetches a list of order items and thier returnable states
             * 
             * [setNonShippedItems]
             * @return {[Array]}
             */
            fetchReturnableItems: function() {
                var self = this,
                    op = self.apiGetReturnableItems();
                self.isLoading(true);
                return op.then(function(data) {
                    self.isLoading(false);
                    return data;
                }, function() {
                    self.isLoading(false);
                });
            },
            /**
             * Used to create a list of returnable items from the return of apiGetReturnableItems and Order Items
             * This is primarily used to get product detial information and ensure Product bundles are returned as a whole
             * while product extras, bundle or otherwise, are returned separately. 
             * 
             * [returnableItems]
             * @return {[Array]}
             */
            returnableItems: function(returnableItems) {
                var self = this,
                    returnItems = [],
                    parentBundles = [];

                var lineItemGroups = _.groupBy(returnableItems, function(item) {
                    return item.orderLineId;
                });

                self.get('returnableItems').reset(null);
                // First, group the returnable items by OrderItem.LineId
                _.each(lineItemGroups, function(grouping) {
                    // If an OrderItem has extras, there will be 2 entries for the parent, one with extras, one without.
                    // Find the one without extras (standalone parent) if available.
                    var returnableParents = _.filter(grouping, function(item) {
                        return !item.parentProductCode;
                    });

                    var returnableParent = returnableParents.length > 1 ?
                        _.find(returnableParents, function(item) {
                            return item.excludeProductExtras === true;
                        }) :
                        returnableParents[0];

                    var originalOrderItem = self.get('items').find(function(item) {
                        return item.get('lineId') === returnableParent.orderLineId;
                    });

                    if (returnableParent.quantityReturnable > 0) {
                        // Clone does not deep copy, each individual node must be cloned to avoid overriding of the orignal orderitem
                        var parentItem = JSON.parse(JSON.stringify(originalOrderItem));
                        returnableParent.product = parentItem.product;

                        // If we need to exclude extras, strip off bundle items with an OptionAttributeFQN and the corresponding Product.Options.
                        if (returnableParent.excludeProductExtras) {
                            var children = parentItem.product.bundledProducts;
                            var extraOptions = _.chain(children)
                                .filter(function(child) {
                                    return child.optionAttributeFQN;
                                })
                                .map(function(extra) {
                                    return extra.optionAttributeFQN;
                                })
                                .value();
                            var bundleItems = _.filter(children, function(child) {
                                return !child.optionAttributeFQN;
                            });

                            var allOptions = parentItem.product.options;
                            var nonExtraOptions = allOptions.filter(function(option) {
                                return !_.contains(extraOptions, option.attributeFQN);
                            });

                            //Add any extra properites we wish the returnableItem to have
                            returnableParent.product.bundledProducts = bundleItems;
                            returnableParent.product.options = nonExtraOptions;
                        }

                        self.get('returnableItems').add(returnableParent);

                    }

                    var childProducts = originalOrderItem.get('product').get('bundledProducts');
                    // Now process extras.
                    var returnableChildren = _.filter(grouping, function(item) {
                        return item.parentProductCode && item.orderItemOptionAttributeFQN && item.quantityReturnable > 0;
                    });
                    _.each(returnableChildren, function(returnableChild, key) {
                        var childProductMatch = _.find(childProducts, function(childProduct) {
                            var productCodeMatch = childProduct.productCode === returnableChild.productCode;
                            var optionMatch = childProduct.optionAttributeFQN === returnableChild.orderItemOptionAttributeFQN;
                            return productCodeMatch && optionMatch;
                        });

                        if (childProductMatch) {
                            var childProduct = _.clone(childProductMatch);
                            returnableChild.product = childProduct;
                            self.get('returnableItems').add(returnableChild);
                        }
                    });
                });
                return self.get('returnableItems');
            },
            clearReturn: function() {
                var rmas = this.get('rma');
                rmas.clear();
            },
            finishReturn: function() {
                var self = this,
                    op, rma, validationObj;
                rma = this.get('rma');
                validationObj = false;
                if (validationObj) {
                    Object.keys(validationObj).forEach(function(key) {
                        this.trigger('error', {
                            message: validationObj[key]
                        });
                    }, this);

                    return false;
                }
                this.isLoading(true);
                rma.toJSON();
                rma.syncApiModel();
                op = rma.apiCreate();
                if (op) return op;
            }
        }),
        OrderCollection = Backbone.MozuPagedCollection.extend({
            mozuType: 'orders',
            defaults: {
                pageSize: 5
            },
            relations: {
                items: Backbone.Collection.extend({
                    model: Order
                })
            }
        });

    return {
        OrderItem: OrderItem,
        Order: Order,
        OrderCollection: OrderCollection,
        OrderPackage: OrderPackage
    };

});
define('modules/models-paymentmethods',['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu', 'hyprlive', 'hyprlivecontext', 'modules/models-address'], function ($, _, Backbone, Hypr, HyprLiveContext, Address) {
    // payment methods only validate if they are selected!
    var PaymentMethod = Backbone.MozuModel.extend({
        present: function (value, attr) {
            if (!this.selected) return undefined;
            if (this.get('isSavedCard')) return false;
            if (!value) return this.validation[attr.split('.').pop()].msg || Hypr.getLabel('genericRequired');
        }
    });

    var twoWayCardShapeMapping = {
        "cardNumber": "cardNumberPartOrMask",
        "cardNumberPart": "cardNumberPartOrMask",
        "cardType": "paymentOrCardType",
        "id": "paymentServiceCardId"
    };

    var firstDigitMap = {
        "3": "AMEX",
        "4": "VISA",
        "5": "MC",
        "6": "DISCOVER"
    };

    var CreditCard = PaymentMethod.extend({
        mozuType: 'creditcard',
        defaults: {
            isCvvOptional: false,
            isDefaultPayMethod: false,
            isSavedCard: false,
            isVisaCheckout: false
        },
        validation: {
            paymentOrCardType: {
                fn: "present",
                msg: Hypr.getLabel('cardTypeMissing')
            },
            cardNumberPartOrMask: {
                fn: "present",
                msg: Hypr.getLabel('cardNumberMissing')
            },
            expireMonth: {
                fn: 'expirationDateInPast'
            },
            expireYear: {
                fn: 'expirationDateInPast'
            },
            nameOnCard: {
                fn: "present",
                msg: Hypr.getLabel('cardNameMissing')
            }
        },
        initialize: function () {
            var self = this;
            _.each(twoWayCardShapeMapping, function (k, v) {
                self.on('change:' + k, function (m, val) {
                    self.set(v, val, { silent: true });
                });
                self.on('change:' + v, function (m, val) {
                    self.set(v, val, { silent: true });
                });
            });

            if (this.detectCardType) {
                this.on('change:cardNumberPartOrMask', _.debounce(function(self, newValue) {
                    var firstDigit;
                    if (newValue && newValue.toString) {
                        firstDigit = newValue.toString().charAt(0);
                    }
                    if (firstDigit && firstDigit in firstDigitMap) {
                        self.set({ paymentOrCardType: firstDigitMap[firstDigit] });
                    }
                }, 500));
            }
        },
        dataTypes: {
            expireMonth: Backbone.MozuModel.DataTypes.Int,
            expireYear: Backbone.MozuModel.DataTypes.Int,
            isCardInfoSaved: Backbone.MozuModel.DataTypes.Boolean,
            isDefaultPayMethod: Backbone.MozuModel.DataTypes.Boolean
        },
        expirationDateInPast: function (value, attr, computedState) {
            if (!this.selected) return undefined;
            var expMonth = this.get('expireMonth'),
                expYear = this.get('expireYear'),
                exp,
                thisMonth,
                isValid;

            if (isNaN(expMonth) || isNaN(expYear)) return false;

            exp = new Date(expYear, expMonth - 1, 1, 0, 0, 0, 0);
            thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            isValid = exp >= thisMonth;
            if (!isValid) return Hypr.getLabel('cardExpInvalid');
        },
        // the toJSON method should omit the CVV so it is not sent to the wrong API
        toJSON: function (options) {
            var j = PaymentMethod.prototype.toJSON.apply(this);
            _.each(twoWayCardShapeMapping, function (k, v) {
                if (!(k in j) && (v in j)) j[k] = j[v];
                if (!(v in j) && (k in j)) j[v] = j[k];
            });
            if (j && (!options || !options.helpers) && j.cvv && j.cvv.toString().indexOf('*') !== -1) delete j.cvv;
            return j;
        }
    });

    var CreditCardWithCVV = CreditCard.extend({
        validation: _.extend({}, CreditCard.prototype.validation, {
            cvv: {
                fn: function(value, attr, computed) {
                    var cardType = attr.split('.')[0],
                        card = this.get(cardType),
                        isSavedCard = card.get('isSavedCard'),
                        isVisaCheckout = card.get('isVisaCheckout');

                    var skipValidationSaved = Hypr.getThemeSetting('isCvvSuppressed') && isSavedCard;
                    var skipValidationVisaCheckout = Hypr.getThemeSetting('isCvvSuppressed') && isVisaCheckout;

                    // If card is not selected or cvv is not required, no need to validate
                    if (!card.selected || skipValidationVisaCheckout || skipValidationSaved) {
                        return;
                    }

                    if (!value) {
                        return Hypr.getLabel('securityCodeMissing') || Hypr.getLabel('genericRequired');
                    }
                    //check for length
                    //AMEX 4 chars and others are 3
                    var type = computed.card.get("paymentOrCardType");
                    if(type==="AMEX"){
                        if(value.length !== 4){
                           return Hypr.getLabel('genericLength','CVV2', 4);
                        }
                    }
                    else{
                        if(value.length !== 3){
                           return Hypr.getLabel('genericLength','CVV2', 3);
                        }
                    }

                }
            },
            savedPaymentMethodId: {
                fn: function(value, attr, computed) {
                    var cardType = attr.split('.')[0],
                        card = this.get(cardType),
                        isSavedCard = card.get('isSavedCard');

                    if(!computed.savedPaymentMethodId && isSavedCard){
                         return Hypr.getLabel('selectASavedCard') || Hypr.getLabel('genericRequired');
                    }
                }
            }
        })
    });

    var GiftCard = CreditCardWithCVV.extend({
      isEnabled: false,
      amountApplied: null,
      remainingBalance: null,
        // TODO: validation. needs only to check for cvv and number, and if it exceeds remaining balance
        defaults: {
          "isGiftCard": true
        },
        initialize: function(){
          var self = this;
            _.each(twoWayCardShapeMapping, function(k, v){
                if (self.get(k) && !self.get(v)){
                    self.set(v, self.get(k));
                }
            });
            Backbone.MozuModel.prototype.initialize.apply(this);
        },
        calculateRemainingBalance: function(){
            return (! this.get('amountApplied')) ? this.get('currentBalance') : this.get('currentBalance') - this.get('amountApplied');
        }
        // validation: {
        //     cvv: {
        //         fn: "present"
        //     }
        // }
    });

    var Check = PaymentMethod.extend({
        validation: {
            nameOnCheck: {
                fn: "present"
            },
            routingNumber: {
                fn: "present"
            },
            checkNumber: {
                fn: "present"
            }
        }
    });

    var DigitalCredit = PaymentMethod.extend({
        isEnabled: false,
        creditAmountApplied: null,
        remainingBalance: null,
        isTiedToCustomer: true,
        addRemainderToCustomer: false,

        initialize: function() {
            this.set({ isEnabled: this.isEnabled });
            this.set({ creditAmountApplied: this.creditAmountApplied });
            this.set({ remainingBalance: this.remainingBalance });
            this.set({ isTiedToCustomer: this.isTiedToCustomer });
            this.set({ addRemainderToCustomer: this.addRemainderToCustomer });
        },

        helpers: ['calculateRemainingBalance'],

        calculateRemainingBalance: function () {
            return (! this.get('creditAmountApplied')) ? this.get('currentBalance') : this.get('currentBalance') - this.get('creditAmountApplied');
        },

        validate: function(attrs, options) {
            if ( (attrs.creditAmountApplied) && (attrs.creditAmountApplied > attrs.currentBalance)) {
                return "Exceeds card balance.";
            }
        }
    });

    var PurchaseOrderCustomField = Backbone.MozuModel.extend({
        /*validation: {
            code: {
                // set from code, before validation call
                fn: 'present'
            },
            label: {
                // set from code, before validation call
                fn: 'present'
            },
            value: {
                // set from user, but should be set before validation call:
                fn: 'present'
            }
        }*/
    });

    var PurchaseOrderPaymentTerm = Backbone.MozuModel.extend({
        // validation should pass! This is set from code and not sent to server.
        /*validation: {
            code: {
                fn: 'present'
            },
            description: {
                fn: 'present'
            }
        }*/
    });

    var PurchaseOrder = PaymentMethod.extend({
        mozuType: 'purchaseorder',
        defaults: {
            isEnabled: false,
            splitPayment: false,
            amount: 0,
            availableBalance: 0,
            creditLimit: 0
        },

        relations: {
            paymentTerm: PurchaseOrderPaymentTerm,
            customFields: Backbone.Collection.extend({
                model: PurchaseOrderCustomField
            }),
            paymentTermOptions: Backbone.Collection.extend({
                model: PurchaseOrderPaymentTerm
            })
        },

        initialize: function() {
            var self = this;
        },

        // take the custom fields array and add them to the model as individual .
        deflateCustomFields: function() {
            //"pOCustomField-"+field.code
            var customFields = this.get('customFields').models;
            var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
            /*if(customFields.length > 0) {
                customFields.forEach(function(field) {
                    var ssCustomField = siteSettingsCustomFields.find(function(searchField) {
                        return field.get('code') === searchField.code;
                    }, this);

                }, this);
            }*/
            siteSettingsCustomFields.forEach(function(field) {
                if(field.isEnabled) {
                    var data = customFields.find(function(val) {
                        return val.get('code') === field.code;
                    });

                    if(data && data.get('value').length > 0) {
                        this.set('pOCustomField-'+field.code, data.get('value'));
                    }

                    if(field.isRequired) {
                        this.validation['pOCustomField-'+field.code] =
                            {
                                fn: 'present',
                                msg: field.label+ " " + Hypr.getLabel('missing')
                            };
                    }
                }
            }, this);
        },

        inflateCustomFields: function() {
            var customFields = [];
            var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;

            siteSettingsCustomFields.forEach(function(field) {
                if(field.isEnabled) {
                    var value = this.get("pOCustomField-"+field.code);
                    var customField = {"code":field.code, "label": field.label, "value":value};
                    // we only want this if it had data!
                    if(value && value.length > 0) {
                        customFields.push(customField);
                    }
                }
            }, this);

            if(customFields.length > 0) {
                this.set('customFields', customFields, {silent: true});
            }
        },

        validation: {
            purchaseOrderNumber: {
                fn: 'present',
                msg: Hypr.getLabel('purchaseOrderNumberMissing')
            },/*
            customFields: {
                fn: function(value, attr) {
                    var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
                    var purchaseOrderCustomFields = this.get('purchaseOrder').get('customFields').models;
                    var result = null;
                    siteSettingsCustomFields.forEach(function(field) {
                        if(field.isEnabled && field.isRequired) {
                            var fieldInput = $('#mz-payment-pOCustomField-' + field.code);

                            var foundField = purchaseOrderCustomFields.find(function(poField){
                                return poField.code === field.code;
                            });

                            if(foundField && foundField.get('code') && foundField.get('value').length > 0) {
                                fieldInput.removeClass('is-invalid');
                                $('#mz-payment-pOCustomField-' + field.code + '-validation').empty();
                            } else {
                                var errorMessage = field.label + " " + Hypr.getLabel('missing');
                                fieldInput.addClass('is-invalid');
                                $('#mz-payment-pOCustomField-' + field.code + '-validation').text(errorMessage);
                                result = Hypr.getLabel('purchaseOrderCustomFieldMissing');
                            }
                        }
                    });
                    return result;
                }
            },*/
            paymentTerm: {
                fn: function(value, attr) {

                    var selectedPaymentTerm = null;
                    var purchaseOrder = null;
                    if(attr.indexOf('billingInfo') > -1) {
                        purchaseOrder = this.get('billingInfo').get('purchaseOrder');
                        selectedPaymentTerm = this.get('billingInfo').get('purchaseOrder').get('paymentTerm');
                    } else {
                        purchaseOrder = this.get('purchaseOrder');
                        selectedPaymentTerm = this.get('purchaseOrder').get('paymentTerm');
                    }

                    if(!purchaseOrder.selected) {
                        return;
                    }

                    if(!selectedPaymentTerm.get('description')) {
                        return Hypr.getLabel('purchaseOrderPaymentTermMissing');
                    }

                    return;
                }
            }
        },
        // the toJSON method should omit the CVV so it is not sent to the wrong API
        toJSON: function (options) {
            var j = PaymentMethod.prototype.toJSON.apply(this);

            return j;
        },

        dataTypes: {
            isEnabled: Backbone.MozuModel.DataTypes.Boolean,
            splitPayment: Backbone.MozuModel.DataTypes.Boolean,
            amount: Backbone.MozuModel.DataTypes.Float,
            availableBalance: Backbone.MozuModel.DataTypes.Float,
            creditLimit: Backbone.MozuModel.DataTypes.Float
        }

    });

    return {
        PurchaseOrder: PurchaseOrder,
        CreditCard: CreditCard,
        CreditCardWithCVV: CreditCardWithCVV,
        Check: Check,
        DigitalCredit: DigitalCredit,
        GiftCard: GiftCard
    };
});

!function(){function e(e){function t(t,n){var s,h,k=t==window,y=n&&void 0!==n.message?n.message:void 0;if(n=e.extend({},e.blockUI.defaults,n||{}),!n.ignoreIfBlocked||!e(t).data("blockUI.isBlocked")){if(n.overlayCSS=e.extend({},e.blockUI.defaults.overlayCSS,n.overlayCSS||{}),s=e.extend({},e.blockUI.defaults.css,n.css||{}),n.onOverlayClick&&(n.overlayCSS.cursor="pointer"),h=e.extend({},e.blockUI.defaults.themedCSS,n.themedCSS||{}),y=void 0===y?n.message:y,k&&p&&o(window,{fadeOut:0}),y&&"string"!=typeof y&&(y.parentNode||y.jquery)){var m=y.jquery?y[0]:y,v={};e(t).data("blockUI.history",v),v.el=m,v.parent=m.parentNode,v.display=m.style.display,v.position=m.style.position,v.parent&&v.parent.removeChild(m)}e(t).data("blockUI.onUnblock",n.onUnblock);var g,I,w,U,x=n.baseZ;g=e(r||n.forceIframe?'<iframe class="blockUI" style="z-index:'+x++ +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+n.iframeSrc+'"></iframe>':'<div class="blockUI" style="display:none"></div>'),I=e(n.theme?'<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:'+x++ +';display:none"></div>':'<div class="blockUI blockOverlay" style="z-index:'+x++ +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>'),n.theme&&k?(U='<div class="blockUI '+n.blockMsgClass+' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(x+10)+';display:none;position:fixed">',n.title&&(U+='<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(n.title||"&nbsp;")+"</div>"),U+='<div class="ui-widget-content ui-dialog-content"></div>',U+="</div>"):n.theme?(U='<div class="blockUI '+n.blockMsgClass+' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(x+10)+';display:none;position:absolute">',n.title&&(U+='<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(n.title||"&nbsp;")+"</div>"),U+='<div class="ui-widget-content ui-dialog-content"></div>',U+="</div>"):U=k?'<div class="blockUI '+n.blockMsgClass+' blockPage" style="z-index:'+(x+10)+';display:none;position:fixed"></div>':'<div class="blockUI '+n.blockMsgClass+' blockElement" style="z-index:'+(x+10)+';display:none;position:absolute"></div>',w=e(U),y&&(n.theme?(w.css(h),w.addClass("ui-widget-content")):w.css(s)),n.theme||I.css(n.overlayCSS),I.css("position",k?"fixed":"absolute"),(r||n.forceIframe)&&g.css("opacity",0);var C=[g,I,w],S=e(k?"body":t);e.each(C,function(){this.appendTo(S)}),n.theme&&n.draggable&&e.fn.draggable&&w.draggable({handle:".ui-dialog-titlebar",cancel:"li"});var O=f&&(!e.support.boxModel||e("object,embed",k?null:t).length>0);if(u||O){if(k&&n.allowBodyStretch&&e.support.boxModel&&e("html,body").css("height","100%"),(u||!e.support.boxModel)&&!k)var E=d(t,"borderTopWidth"),T=d(t,"borderLeftWidth"),M=E?"(0 - "+E+")":0,B=T?"(0 - "+T+")":0;e.each(C,function(e,t){var o=t[0].style;if(o.position="absolute",2>e)k?o.setExpression("height","Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:"+n.quirksmodeOffsetHack+') + "px"'):o.setExpression("height",'this.parentNode.offsetHeight + "px"'),k?o.setExpression("width",'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"'):o.setExpression("width",'this.parentNode.offsetWidth + "px"'),B&&o.setExpression("left",B),M&&o.setExpression("top",M);else if(n.centerY)k&&o.setExpression("top",'(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"'),o.marginTop=0;else if(!n.centerY&&k){var i=n.css&&n.css.top?parseInt(n.css.top,10):0,s="((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "+i+') + "px"';o.setExpression("top",s)}})}if(y&&(n.theme?w.find(".ui-widget-content").append(y):w.append(y),(y.jquery||y.nodeType)&&e(y).show()),(r||n.forceIframe)&&n.showOverlay&&g.show(),n.fadeIn){var j=n.onBlock?n.onBlock:c,H=n.showOverlay&&!y?j:c,z=y?j:c;n.showOverlay&&I._fadeIn(n.fadeIn,H),y&&w._fadeIn(n.fadeIn,z)}else n.showOverlay&&I.show(),y&&w.show(),n.onBlock&&n.onBlock.bind(w)();if(i(1,t,n),k?(p=w[0],b=e(n.focusableElements,p),n.focusInput&&setTimeout(l,20)):a(w[0],n.centerX,n.centerY),n.timeout){var W=setTimeout(function(){k?e.unblockUI(n):e(t).unblock(n)},n.timeout);e(t).data("blockUI.timeout",W)}}}function o(t,o){var s,l=t==window,a=e(t),d=a.data("blockUI.history"),c=a.data("blockUI.timeout");c&&(clearTimeout(c),a.removeData("blockUI.timeout")),o=e.extend({},e.blockUI.defaults,o||{}),i(0,t,o),null===o.onUnblock&&(o.onUnblock=a.data("blockUI.onUnblock"),a.removeData("blockUI.onUnblock"));var r;r=l?e("body").children().filter(".blockUI").add("body > .blockUI"):a.find(">.blockUI"),o.cursorReset&&(r.length>1&&(r[1].style.cursor=o.cursorReset),r.length>2&&(r[2].style.cursor=o.cursorReset)),l&&(p=b=null),o.fadeOut?(s=r.length,r.stop().fadeOut(o.fadeOut,function(){0===--s&&n(r,d,o,t)})):n(r,d,o,t)}function n(t,o,n,i){var s=e(i);if(!s.data("blockUI.isBlocked")){t.each(function(e,t){this.parentNode&&this.parentNode.removeChild(this)}),o&&o.el&&(o.el.style.display=o.display,o.el.style.position=o.position,o.el.style.cursor="default",o.parent&&o.parent.appendChild(o.el),s.removeData("blockUI.history")),s.data("blockUI.static")&&s.css("position","static"),"function"==typeof n.onUnblock&&n.onUnblock(i,n);var l=e(document.body),a=l.width(),d=l[0].style.width;l.width(a-1).width(a),l[0].style.width=d}}function i(t,o,n){var i=o==window,l=e(o);if((t||(!i||p)&&(i||l.data("blockUI.isBlocked")))&&(l.data("blockUI.isBlocked",t),i&&n.bindEvents&&(!t||n.showOverlay))){var a="mousedown mouseup keydown keypress keyup touchstart touchend touchmove";t?e(document).bind(a,n,s):e(document).unbind(a,s)}}function s(t){if("keydown"===t.type&&t.keyCode&&9==t.keyCode&&p&&t.data.constrainTabKey){var o=b,n=!t.shiftKey&&t.target===o[o.length-1],i=t.shiftKey&&t.target===o[0];if(n||i)return setTimeout(function(){l(i)},10),!1}var s=t.data,a=e(t.target);return a.hasClass("blockOverlay")&&s.onOverlayClick&&s.onOverlayClick(t),a.parents("div."+s.blockMsgClass).length>0?!0:0===a.parents().children().filter("div.blockUI").length}function l(e){if(b){var t=b[e===!0?b.length-1:0];t&&t.focus()}}function a(e,t,o){var n=e.parentNode,i=e.style,s=(n.offsetWidth-e.offsetWidth)/2-d(n,"borderLeftWidth"),l=(n.offsetHeight-e.offsetHeight)/2-d(n,"borderTopWidth");t&&(i.left=s>0?s+"px":"0"),o&&(i.top=l>0?l+"px":"0")}function d(t,o){return parseInt(e.css(t,o),10)||0}e.fn._fadeIn=e.fn.fadeIn;var c=e.noop||function(){},r=/MSIE/.test(navigator.userAgent),u=/MSIE 6.0/.test(navigator.userAgent)&&!/MSIE 8.0/.test(navigator.userAgent),f=(document.documentMode||0,e.isFunction(document.createElement("div").style.setExpression));e.blockUI=function(e){t(window,e)},e.unblockUI=function(e){o(window,e)},e.growlUI=function(t,o,n,i){var s=e('<div class="growlUI"></div>');t&&s.append("<h1>"+t+"</h1>"),o&&s.append("<h2>"+o+"</h2>"),void 0===n&&(n=3e3);var l=function(t){t=t||{},e.blockUI({message:s,fadeIn:"undefined"!=typeof t.fadeIn?t.fadeIn:700,fadeOut:"undefined"!=typeof t.fadeOut?t.fadeOut:1e3,timeout:"undefined"!=typeof t.timeout?t.timeout:n,centerY:!1,showOverlay:!1,onUnblock:i,css:e.blockUI.defaults.growlCSS})};l();s.css("opacity");s.mouseover(function(){l({fadeIn:0,timeout:3e4});var t=e(".blockMsg");t.stop(),t.fadeTo(300,1)}).mouseout(function(){e(".blockMsg").fadeOut(1e3)})},e.fn.block=function(o){if(this[0]===window)return e.blockUI(o),this;var n=e.extend({},e.blockUI.defaults,o||{});return this.each(function(){var t=e(this);n.ignoreIfBlocked&&t.data("blockUI.isBlocked")||t.unblock({fadeOut:0})}),this.each(function(){"static"==e.css(this,"position")&&(this.style.position="relative",e(this).data("blockUI.static",!0)),this.style.zoom=1,t(this,o)})},e.fn.unblock=function(t){return this[0]===window?(e.unblockUI(t),this):this.each(function(){o(this,t)})},e.blockUI.version=2.7,e.blockUI.defaults={message:"<h1>Please wait...</h1>",title:null,draggable:!0,theme:!1,css:{padding:0,margin:0,width:"30%",top:"40%",left:"35%",textAlign:"center",color:"#000",border:"3px solid #aaa",backgroundColor:"#fff",cursor:"wait"},themedCSS:{width:"30%",top:"40%",left:"35%"},overlayCSS:{backgroundColor:"#000",opacity:.6,cursor:"wait"},cursorReset:"default",growlCSS:{width:"350px",top:"10px",left:"",right:"10px",border:"none",padding:"5px",opacity:.6,cursor:"default",color:"#fff",backgroundColor:"#000","-webkit-border-radius":"10px","-moz-border-radius":"10px","border-radius":"10px"},iframeSrc:/^https/i.test(window.location.href||"")?"javascript:false":"about:blank",forceIframe:!1,baseZ:1e3,centerX:!0,centerY:!0,allowBodyStretch:!0,bindEvents:!0,constrainTabKey:!0,fadeIn:200,fadeOut:400,timeout:0,showOverlay:!0,focusInput:!0,focusableElements:":input:enabled:visible",onBlock:null,onUnblock:null,onOverlayClick:null,quirksmodeOffsetHack:4,blockMsgClass:"blockMsg",ignoreIfBlocked:!1};var p=null,b=[]}"function"==typeof define&&define.amd&&define.amd.jQuery?define('blockui',["jquery"],e):e(jQuery)}();
define('modules/block-ui',[
    'modules/jquery-mozu',
    'blockui'
], function($, blockui) {
    var blockUiLoader = {
        globalLoader: function() {
            $.blockUI({
                baseZ: 1100,
                message: '<i class="fa fa-spinner fa-spin"></i>',
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: 'transparent',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: 1,
                    color: '#fff',
                    fontSize: '60px'
                }
            });
        },
        productValidationMessage: function() {
            $.blockUI({
                baseZ: 1050,
                message: $('#SelectValidOption'),
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#fff',
                    opacity: 1,
                    color: '#000',
                    width: 'auto',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '14px'
                }
            });
            $('.zoomContainer').remove();
            $('#zoom').removeData('elevateZoom');
        },
        unblockUi: function() {
            $.unblockUI();
        }
    };
    return blockUiLoader;
});
define('modules/models-attributes',["underscore", "modules/backbone-mozu"], function (_, Backbone) {

    var customerAttritube = Backbone.MozuModel.extend({
        mozuType: 'customerattribute'
    });

    var customerAttributes = Backbone.MozuModel.extend({
        mozuType: 'customerattributes',
        relations: {
            items: Backbone.Collection.extend({
                model: customerAttritube
            })
        }
    });

    var b2bAccountAttritube = Backbone.MozuModel.extend({
        mozuType: 'accountattribute'
    });

    var b2bAccountAttributes = Backbone.MozuModel.extend({
        mozuType: 'accountattributes',
        relations: {
            items: Backbone.Collection.extend({
                model: b2bAccountAttritube
            })
        }
    });

    var customerAttributeDefinition = Backbone.MozuModel.extend({
        mozuType: 'attributedefinition'
    }); 

    var customerAttributeDefinitions = Backbone.MozuModel.extend({
        mozuType: 'customerAttributeDefinitions',
        relations: {
            items: Backbone.Collection.extend({
                model: customerAttributeDefinition
            })
        }
    });

    var b2bAccountAttributeDefinition = Backbone.MozuModel.extend({
        mozuType: 'accountattributedefinition'
    }); 

    var b2bAccountAttributeDefinitions = Backbone.MozuModel.extend({
        mozuType: 'b2bAccountAttributeDefinitions',
        relations: {
            items: Backbone.Collection.extend({
                model: b2bAccountAttributeDefinition
            })
        }
    });

    return {
        'customerAttritube': customerAttritube,
        'customerAttributes': customerAttributes,
        'b2bAccountAttritube': b2bAccountAttritube,
        'b2bAccountAttributes': b2bAccountAttributes,
        'customerAttributeDefinition': customerAttributeDefinition,
        'customerAttributeDefinitions': customerAttributeDefinitions,
        'b2bAccountAttributeDefinition': b2bAccountAttributeDefinition,
        'b2bAccountAttributeDefinitions': b2bAccountAttributeDefinitions
    };
});

define('modules/models-b2b-account',["underscore", "modules/backbone-mozu", "modules/models-product", "modules/models-attributes"], function (_, Backbone, ProductModels, Attributes) {

    var b2bUser = Backbone.MozuModel.extend({
        mozuType: 'b2buser',
        toJSON: function(){
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);

            j.id = j.userId;
            j.accountId = require.mozuData('user').accountId;
            return j;
        }
    });

    var b2bAccount = Backbone.MozuModel.extend({
        mozuType: 'b2baccount',
        relations: {
            users: Backbone.Collection.extend({
                model: b2bUser
            })
        }
    });

    var b2bAccounts = Backbone.MozuModel.extend({
        mozuType: 'b2baccounts',
        relations: {
            items: Backbone.Collection.extend({
                model: b2bAccount
            })
        }
    });

    return {
        'b2bUser': b2bUser,
        'b2bAccount': b2bAccount,
        'b2bAccounts': b2bAccounts
    };
});

define('modules/models-customer',['modules/backbone-mozu',
        'underscore',
        'modules/models-address',
        'modules/models-orders',
        'modules/models-paymentmethods',
        'modules/models-product',
        'modules/models-returns',
        'hyprlive',
        'hyprlivecontext',
        'modules/block-ui',
        'modules/backbone-mozu',
        'modules/models-b2b-account'],
function (Backbone, _, AddressModels, OrderModels, PaymentMethods, ProductModels, ReturnModels, Hypr,HyprLiveContext,blockUiLoader,$, B2BAccountModels) {

  var pageContext = require.mozuData('pagecontext'),
        validShippingCountryCodes,
        validBillingCountryCodes,
        validShippingAndBillingCountryCodes;
    if (pageContext && pageContext.shippingCountries && pageContext.billingCountries) {
        validShippingCountryCodes = _.pluck(pageContext.shippingCountries, 'value');
        validBillingCountryCodes = _.pluck(pageContext.billingCountries, 'value');
        validShippingAndBillingCountryCodes = _.intersection(validShippingCountryCodes, validBillingCountryCodes);
    }


    var contactTypes = ["Billing", "Shipping"],
        contactTypeListeners = {};
    _.each(contactTypes, function(contactType) {
        contactTypeListeners['change:is'+contactType+'Contact'] = function(model, yes) {
            // cheap copy to avoid accidental persistence
            var types = this.get('types');
            types = types ? JSON.parse(JSON.stringify(types)) : [];
            var newType = { name: contactType },
                isAlready = _.findWhere(types, newType);
            if (yes && !isAlready) {
                types.push(newType);
                this.set('types', types, { silent: true });
            }
            if (!yes && isAlready) {
                this.set('types', _.without(types, isAlready), { silent: true});
            }
        };
        contactTypeListeners['change:isPrimary' + contactType + 'Contact'] = function(model, yes) {
            var types = this.get('types'),
                typeConf = { name: contactType },
                type = _.findWhere(types, typeConf);
            if (type) {
                type.isPrimary = yes;
                this.set('types', types, { silent: true });
            }
        };
    });

    var CustomerAttribute = Backbone.MozuModel.extend({
        mozuType: 'customerattribute',
        validation: {
            values: {
                fn: function (values, fieldName, fields) {
                    var inputType = fields.inputType;
                    var messages = Backbone.Validation.messages;
                    var rules = fields.validation;
                    var value = values[0];

                    if (inputType === 'TextBox') {
                        if (rules.maxStringLength && value.length > rules.maxStringLength) return format(messages.maxLength, fields.adminName, rules.maxStringLength);
                        if (rules.minStringLength && value.length < rules.minStringLength) return format(messages.minLength, fields.adminName, rules.minStringLength);
                        if (rules.maxNumericValue && value > rules.maxNumericValue) return format(messages.max, fields.adminName, rules.maxNumericValue);
                        if (rules.minNumericValue && value < rules.minNumericValue) return format(messages.min, fields.adminName, rules.minNumericValue);
                    } else if (inputType === 'TextArea') {
                        if (rules.maxStringLength && value.length > rules.maxStringLength) return format(messages.maxLength, fields.adminName, rules.maxStringLength);
                        if (rules.minStringLength && value.length < rules.minStringLength) return format(messages.minLength, fields.adminName, rules.minStringLength);
                    } else if (inputType === 'Date') {
                        if (rules.maxDateTime && Date.parse(value) > Date.parse(rules.maxDateTime)) return format(messages.max, fields.adminName, Date.parse(rules.maxDateTime));
                        if (rules.minDateTime && Date.parse(value) < Date.parse(rules.minDateTime)) return format(messages.min, fields.adminName, Date.parse(rules.minDateTime));
                    }

                    function format () {
                        var args = Array.prototype.slice.call(arguments),
                            text = args.shift();
                        return text.replace(/\{(\d+)\}/g, function (match, number) {
                            return typeof args[number] !== 'undefined' ? args[number] : match;
                        });
                    }
                }
            }
        }
    });

    var CustomerContact = Backbone.MozuModel.extend({
        mozuType: 'contact',
        requiredBehaviors: [1002],
        defaults: {
            userId: require.mozuData('user').userId
        },
        relations: {
            address: AddressModels.StreetAddress,
            phoneNumbers: AddressModels.PhoneNumbers
        },
        validation: {
            firstName: {
                required: true,
                msg: Hypr.getLabel('firstNameMissing')
            },
            lastNameOrSurname: {
                required: true,
                msg: Hypr.getLabel('lastNameMissing')
            },
            "address.countryCode": {
                fn: function (value) {
                    if (!validShippingCountryCodes) return undefined;
                    var isBillingContact = this.attributes.isBillingContact || this.attributes.editingContact.attributes.isBillingContact,
                        isShippingContact = this.attributes.isShippingContact || this.attributes.editingContact.attributes.isShippingContact,
                        validCodes = ((isBillingContact && isShippingContact && validShippingAndBillingCountryCodes) ||
                                      (isBillingContact && validBillingCountryCodes) ||
                                      (isShippingContact && validShippingCountryCodes));
                    if (validCodes && !_.contains(validCodes, value)) return Hypr.getLabel("wrongCountryForType");
                }
            }
        },

        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers) {
                _.each(contactTypes, function(contactType) {
                    delete j['is'+contactType+'Contact'];
                    delete j['isPrimary'+contactType+'Contact'];
                });
            }
            if (j.id === "new") delete j.id;
            return j;
        },
        save: function () {
            if (!this.parent.validate("editingContact")) {
                var id = this.get('id');

                if (!this.get('email')) this.set({ email: this.parent.get('emailAddress') }, { silent: true });
                if (!id) return this.apiCreate();
                return this.apiUpdate();
            }
        },
        setTypeHelpers: function(model, types) {
            var self = this;
            _.each(contactTypes, function (contactType) {
                self.unset('is' + contactType + 'Contact');
                self.unset('isPrimary' + contactType + 'Contact');
                _.each(types, function (type) {
                    var toSet = {};
                    if (type.name === contactType) {
                        toSet['is' + contactType + 'Contact'] = true;
                        if (type.isPrimary) toSet['isPrimary' + contactType + 'Contact'] = true;
                        self.set(toSet, { silent: true });
                    }
                });
            });
        },
        contactTypeHelpers : function(){
            var self = this;
            var isShipping = function(){
                if(self.get('types')){
                    var found = _.findWhere(self.get('types'), {name: "Shipping"});
                    return (found) ? true : false;
                }
                return false;
            };
            var isPrimaryShipping = function(){
                if(self.get('types')){
                    var found = _.findWhere(self.get('types'), {name: "Shipping", isPrimary: true});
                    return (found) ? true : false;
                }
                return false;
            };
            var isBilling = function(){
                if(self.get('types')){
                    var found = _.findWhere(self.get('types'), {name: "Billing"});
                    return (found) ? true : false;
                }
                return false;
            };
            var isPrimaryBilling = function(){
                if(self.get('types')){
                    var found = _.findWhere(self.get('types'), {name: "Billing", isPrimary: true});
                    return (found) ? true : false;
                }
                return false;
            };
            return {
                isShipping: isShipping,
                isBilling: isBilling,
                isPrimaryShipping: isPrimaryShipping,
                isPrimaryBilling: isPrimaryBilling
            };
        },
        initialize: function () {
            var self = this,
                types = this.get('types');
            if (types) this.setTypeHelpers(null, types);
            this.on(contactTypeListeners);
            this.on('change:types', this.setTypeHelpers, this);
        },
        requestCatalog: function (options) {
            var self = this,
                editingContact = this,
                apiContact;

            if (options && options.forceIsValid) {
                editingContact.set('address.isValidated', true);
            }
            var result = this.validate();

            if (!this.validate()) {
                var apiData = require.mozuData('apicontext');
                var payload = {
                    phone1: this.get('phoneNumbers.office') || '',
                    phone2: this.get('phoneNumbers.home') || '',
                    email: this.get('email') || '',
                    dateCreated: (new Date()),
                    firstName: this.get('firstName') || '',
                    middleName: this.get('middleNameInitials') || '',
                    lastName: this.get('lastNameOrSurname') || '',
                    address1: this.get('address.address1') || '',
                    address2: this.get('address.address2') || '',
                    city: this.get('address.cityOrTown') || '',
                    zipCode: this.get('address.postalOrZipCode') || '',
                    state: this.get('address.stateOrProvince') || '',
                    country: this.get('address.countryCode') || '',
                    exportedDate: ''
                };
                var isMarketingEnabled = this.get('marketingEnabled') ? true : false;
                var user = require.mozuData('user');
                if (!user.isAnonymous) {
                    payload.customerId = user.accountId;
                    if(isMarketingEnabled){
                        $.ajax({
                            url: '/api/commerce/customer/accounts/'+user.accountId,
                            headers: apiData.headers,
                            method: 'GET',
                            success: function(data) {
                                if(!data.acceptsMarketing){
                                    data.acceptsMarketing=true;
                                    $.ajax({
                                        url: '/api/commerce/customer/accounts/'+user.accountId,
                                        headers: apiData.headers,
                                        method: 'PUT',
                                        data:data
                                    });

                                }
                            }
                        });
                    }
                    return $.ajax({
                        url: '/api/platform/entitylists/requestCatalog%40ng/entities/?responseFields=',
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(payload),
                        method: 'POST',
                        headers: apiData.headers
                    });
                } else {
                    //create a new guest user and assign its guest ID
                    var dfd = $.$.Deferred();
                    $.ajax({
                        url: '/api/commerce/customer/accounts',
                        data: {
                            firstName: payload.firstName,
                            lastName: payload.lastName,
                            acceptsMarketing: isMarketingEnabled,
                            emailAddress: payload.email,
                            isAnonymous: true
                        },
                        headers: apiData.headers,
                        method: 'POST'
                    }).then(function(response) {
                        payload.customerId = response.id;
                        $.ajax({
                            url: '/api/platform/entitylists/requestCatalog%40ng/entities/?responseFields=',
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(payload),
                            method: 'POST',
                            headers: apiData.headers,
                            success:function(data){
                                dfd.resolve(data);
                            }
                        });
                    }, function(error) {
                        //console.log("Show API error", error);
                    });
                    // Return the Promise so caller can't change the Deferred
                    return dfd.promise();

                }
            }
        }
    }),

    WishlistItem = Backbone.MozuModel.extend({
        relations: {
            product: ProductModels.Product
        }
    }),

    Wishlist = Backbone.MozuModel.extend({
        mozuType: 'wishlist',
        helpers: ['hasItems'],
        hasItems: function() {
            return this.get('items').length > 0;
        },
        relations: {
            items: Backbone.Collection.extend({
                model: WishlistItem
            })
        },
        addItemToCart: function (id) {
            var self = this;
            return this.apiAddItemToCartById(id).then(function (item) {
                self.trigger('addedtocart', item, id);
                return item;
            });
        }
    }),

    Customer = Backbone.MozuModel.extend({
        mozuType: 'customer',
        helpers: ['hasSavedCards', 'hasSavedContacts'],
        hasSavedCards: function() {
            var cards = this.get('cards');
            return cards && cards.length > 0;
        },
        hasSavedContacts: function() {
            var contacts = this.get('contacts');
            return contacts && contacts.length > 0;
        },
        relations: {
            attributes: Backbone.Collection.extend({
                model: CustomerAttribute
            }),
            // We set this relationship so that b2battributes, when assigned, can
            // function like a backbone collection. But it's only out of convenience that the model
            // is named CustomerAttribute. This is NOT a collection of customer attributes. They are
            // ACCOUNT attributes.
            b2bAttributes: Backbone.Collection.extend({
                model: CustomerAttribute
            }),
            contacts: Backbone.Collection.extend({
                model: CustomerContact,
                getPrimaryShippingContact: function(){
                    var primaryContacts = this.find(function(contact){
                        return contact.contactTypeHelpers().isPrimaryShipping();
                    });
                    return (primaryContacts.length) ? primaryContacts[0] : null;
                },
                getPrimaryBillingContact: function(){
                     var primaryContacts = this.find(function(contact){
                        return contact.contactTypeHelpers().isPrimaryBilling();
                    });
                    return (primaryContacts.length) ? primaryContacts[0] : null;
                }
            }),
            cards: Backbone.Collection.extend({
                model: PaymentMethods.CreditCard
            }),
            credits: Backbone.Collection.extend({
                model: PaymentMethods.DigitalCredit
            })
        },
        getAttributes: function () {
            var self = this;
            var attributesCollection = this.get('attributes');

            return this.apiGetAttributes({pageSize:100}).then(function (cc) {
                // transform attributes into key-value pairs, to avoid multiple lookups
                var values = _.reduce(cc.data.items, function (a, b) {
                    a[b.fullyQualifiedName] = {
                        values: b.values,
                        attributeDefinitionId: b.attributeDefinitionId
                    };
                    return a;
                }, {});

                // get all attribute definitions
                return self.apiGetAttributeDefinitions().then(function (defs) {
                    // merge attribute values into definitions
                    _.each(defs.data.items, function (def) {
                        var fqn = def.attributeFQN;

                        if (values[fqn]) {
                            def.values = values[fqn].values;
                            def.attributeDefinitionId = values[fqn].attributeDefinitionId;
                        }
                    });
                    // sort attributes, putting checkboxes first
                    defs.data.items.sort(function (a, b) {
                        if (a.inputType === 'YesNo') return -1;
                        else if (b.inputType === 'YesNo') return 1;
                        else return 0;
                    });
                    // write fully-hydrated attributes to the model
                    attributesCollection.reset(defs.data.items);
                    self.trigger('sync', cc.data);
                    return self;
                });
            });
        },
        getPrimaryContactOfType: function (typeName) {
            return this.get('contacts').find(function (contact) {
                return !!_.findWhere(contact.get('types'), { name: typeName, isPrimary: true });
            });
        },
        getPrimaryBillingContact: function () {
            return this.getPrimaryContactOfType("Billing");
        },
        getPrimaryShippingContact: function () {
            return this.getPrimaryContactOfType("Shipping");
        },
        getContacts: function () {
            var self = this;
            var contactsCollection = this.get('contacts');
            return this.apiGetContacts().then(function (cc) {
                contactsCollection.reset(cc.data.items);
                self.trigger('sync', cc.data);
                return self;
            });
        },
        getStoreCredits: function() {
            var self = this;
            return this.apiGetCredits().then(function (credits) {
                self.set('credits', credits.data.items);
                self.trigger('sync', credits);
                return self;
            });
        },
        addStoreCredit: function (id) {
            return this.apiAddStoreCredit(id);
        }
    }),

    CustomerCardWithContact = PaymentMethods.CreditCard.extend({

        validation: _.extend({
            contactId: {
                fn: function(value, property, model) {
                    if (!value && model.contacts && model.contacts.length > 0) return Hypr.getLabel('cardBillingMissing');
                }
            }
        }, PaymentMethods.CreditCard.prototype.validation),
        selected: true, // so that validation rules always run,
        isCvvOptional: true
    }),

    EditableCustomer = Customer.extend({

        handlesMessages: true,
        relations: _.extend({
            editingCard: CustomerCardWithContact,
            editingContact: CustomerContact,
            wishlist: Wishlist,
            orderHistory: OrderModels.OrderCollection,
            returnHistory: ReturnModels.RMACollection
        }, Customer.prototype.relations),
        validation: {
            password: {
                fn: function(value) {
                    if (this.validatePassword && !value) return Hypr.getLabel('passwordMissing');
                }
            },
            confirmPassword: {
                fn: function(value) {
                    if (this.validatePassword && value !== this.get('password')) return Hypr.getLabel('passwordsDoNotMatch');
                }
            }
        },
        defaults: function () {
            return {
                editingCard: {},
                editingContact: {}
            };
        },
        helpers: ['isNonPurchaser'],
        initialize: function() {
            var self = this,
                orderHistory = this.get('orderHistory'),
                returnHistory = this.get('returnHistory');
            this.get('editingContact').set('accountId', this.get('id'));
            orderHistory.lastRequest = {
                pageSize: 5
            };
            returnHistory.lastRequest = {
                pageSize: 5
            };
            orderHistory.on('returncreated', function(id) {
                returnHistory.apiGet(returnHistory.lastRequest).then(function () {
                    returnHistory.trigger('returndisplayed', id);
                });
            });

            _.defer(function (cust) {
                cust.getCards();
            }, self);
        },
        isNonPurchaser: function() {
            return (require.mozuData('user').behaviors.length) ? false : true;
        },
        changePassword: function () {
            var self = this;
            self.validatePassword = true;
            if (this.validate('password') || this.validate('confirmPassword')) return false;
            var changePasswordPayload = {
                oldPassword: this.get('oldPassword'),
                newPassword: this.get('password')
            };
            if (this.get('accountType') === 'B2B'){
                changePasswordPayload.userId = this.get('userId');
            }
            return this.apiChangePassword(changePasswordPayload).ensure(function () {
                self.validatePassword = false;
            });
        },
        beginEditCard: function(id) {
            var toEdit = this.get('cards').get(id),
                contacts = this.get('contacts').toJSON(),
                editingCardModel = {
                    contacts: contacts,
                    hasSavedContacts: this.hasSavedContacts()
                };
            if (toEdit) {
                _.extend(editingCardModel, toEdit.toJSON({ helpers: true }), { isCvvOptional: true });
            }
            this.get('editingCard').set(editingCardModel);
        },
        endEditCard: function() {
            this.get('editingCard').clear({ silent: true });
        },
        saveCard: function() {
            if (!this.validate('editingCard')) {
                var self = this,
                    saveContactOp,
                    editingCard = this.get('editingCard').toJSON(),
                    doSaveCard = function() {
                        return self.apiSavePaymentCard(editingCard).then(function() {
                            return self.getCards();
                        }).then(function() {
                            return self.get('editingCard').clear({ silent: true });
                        });
                    },
                    saveContactFirst = function() {
                        self.get('editingContact').set('isBillingContact', true);
                        var op = self.get('editingContact').save();
                        if (op) return op.then(function(contact) {
                            editingCard.contactId = contact.prop('id');
                            self.endEditContact();
                            self.getContacts();
                            return true;
                        });
                    };
                if (!editingCard.contactId || editingCard.contactId === "new") {
                    saveContactOp = saveContactFirst();
                    if (saveContactOp) return saveContactOp.then(doSaveCard);
                } else {
                    return doSaveCard();
                }
            }
        },
        deleteCard: function (id) {
            var self = this;
            return this.apiModel.deletePaymentCard(id).then(function () {
                return self.getCards();
            });
        },
        deleteMultipleCards: function(ids) {
            return this.apiModel.api.all.apply(this.apiModel.api, ids.map(_.bind(this.apiModel.deletePaymentCard, this.apiModel))).then(_.bind(this.getCards, this));
        },
        getCards: function () {
            var self = this;
            var cardsCollection = this.get('cards');
            this.syncApiModel();
            return this.apiModel.getCards().then(function (cc) {
                cardsCollection.set(cc.data.items);
                return self;
            });
        },
        beginEditContact: function (id) {
            var toEdit = this.get('contacts').get(id);
            if (toEdit)
                this.get('editingContact').set(toEdit.toJSON({ helpers: true, ensureCopy: true }), { silent: true });
        },
        endEditContact: function() {
            var editingContact = this.get('editingContact'),
            addressType = editingContact.get("address").get('addressType'),
            countryCode = editingContact.get("address").get('countryCode');
            editingContact.clear();
            editingContact.set('accountId', this.get('id'));
            editingContact.get("address").set('addressType',addressType);
            editingContact.get("address").set('countryCode', countryCode);
            editingContact.get("address").set('candidateValidatedAddresses', null);
        },
        saveContact: function (options) {
            var self = this,
                editingContact = this.get('editingContact'),
                apiContact,
                isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled,
                allowInvalidAddresses = HyprLiveContext.locals.siteContext.generalSettings.allowInvalidAddresses,
                addr = editingContact.get("address");
            if (!this.validate("editingContact")) {
                if(isAddressValidationEnabled && !addr.get('isValidated')){
                    if(typeof(addr.apiModel.data.address1) === "undefined"){
                        addr.apiModel.data = addr.attributes;
                    }
                    if (!addr.get('candidateValidatedAddresses')) {
                        var methodToUse = allowInvalidAddresses ? 'validateAddressLenient' : 'validateAddress';
                        addr.apiModel[methodToUse]().then(function (resp) {
                            if (resp.data && resp.data.addressCandidates && resp.data.addressCandidates.length) {
                                if (_.find(resp.data.addressCandidates, addr.is, addr)) {
                                    if(options.editingView)
                                        options.editingView.editing.contact = false;
                                    addr.set('isValidated', true);
                                    var op = editingContact.save();
                                    if (op) return op.then(function (contact) {
                                        apiContact = contact;
                                        self.endEditContact();
                                        return self.getContacts();
                                    }).then(function () {
                                        blockUiLoader.unblockUi();
                                        return apiContact;
                                    });
                                }
                                else{
                                    addr.set('candidateValidatedAddresses', resp.data.addressCandidates);
                                    blockUiLoader.unblockUi();
                                }
                            }
                        }, function (e) {
                            if(allowInvalidAddresses){
                                if(options.editingView)
                                    options.editingView.editing.contact = false;
                                editingContact.set('address.isValidated', true);
                                var op = editingContact.save();
                                if (op) return op.then(function(contact) {
                                    apiContact = contact;
                                    self.endEditContact();
                                    return self.getContacts();
                                }).then(function() {
                                    blockUiLoader.unblockUi();
                                    return apiContact;
                                });
                            }else{
                                self.trigger('error', {message: Hypr.getLabel('addressValidationError')});
                            }
                            blockUiLoader.unblockUi();
                        });
                    }else{
                        /*self.trigger('error', {message: Hypr.getLabel('addressValidationError')});
                        blockUiLoader.unblockUi();
                        return false;*/
                        if(options.editingView)
                            options.editingView.editing.contact = false;
                        editingContact.set('address.isValidated', true);
                        var opsData = editingContact.save();
                        if (opsData) return opsData.then(function(contact) {
                            apiContact = contact;
                            self.endEditContact();
                            return self.getContacts();
                        }).then(function() {
                            blockUiLoader.unblockUi();
                            return apiContact;
                        });
                    }
                } else {
                    editingContact.set('address.isValidated', true);
                    var op = editingContact.save();
                    if (op) return op.then(function(contact) {
                        apiContact = contact;
                        self.endEditContact();
                        return self.getContacts();
                    }).then(function() {
                        blockUiLoader.unblockUi();
                        return apiContact;
                    });
                }
            } else blockUiLoader.unblockUi();
        },
        deleteContact: function (id) {
            var self = this;
            return this.apiModel.deleteContact(id).then(function () {
                return self.getContacts();
            });
        },
        updateName: function () {
            return this.apiUpdate({
                firstName: this.get('firstName'),
                lastName: this.get('lastName')
            });
        },
        updateAcceptsMarketing: function(yes) {
            return this.apiUpdate({
                acceptsMarketing: yes
            });
        },
        updateAttribute: function (attributeFQN, attributeDefinitionId, values) {
            this.apiUpdateAttribute({
                attributeFQN: attributeFQN,
                attributeDefinitionId: attributeDefinitionId,
                values: values
            });
        },
        toJSON: function (options) {
            var j = Customer.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers)
                delete j.customer;
            delete j.password;
            delete j.confirmPassword;
            delete j.oldPassword;
            return j;
        }
    }),
    B2BCustomerAccount = B2BAccountModels.b2bUser.extend({
        toJSON: function (options) {
            var j = Customer.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers)
                delete j.customer;
            delete j.password;
            delete j.confirmPassword;
            delete j.oldPassword;

            j.accountId = j.id;
            j.id = j.userId;
            return j;
        }
    });

    return {
        B2BCustomer: B2BCustomerAccount,
        Contact: CustomerContact,
        Customer: Customer,
        EditableCustomer: EditableCustomer
    };
});

define(
    'modules/models-documents',["modules/backbone-mozu", "underscore", "hyprlivecontext"],
    function (Backbone, _, PagingMixin, context) {
        
        var locals = context.locals;

        var Document = Backbone.MozuModel.extend({
            helpers: ['url'],
            url: function() {
                // attributes available through this.get, theme settings and sitecontext available through "locals.themeSettings" and "locals.siteContext"
                return "/cms/" + this.get('id');
            }
        }),

        DocumentCollection = Backbone.MozuPagedCollection.extend({
            relations: {
                items: Backbone.Collection.extend({
                    model: Document
                })
            },
            buildPagingRequest: function() {
                var conf = this.baseRequestParams ? _.clone(this.baseRequestParams) : {},
                pageSize = this.get("pageSize"),
                startIndex = this.get("startIndex"),
                filter = this.filter,
                query = this.query;
                conf.pageSize = pageSize;
                if (startIndex) conf.startIndex = startIndex;
                if (filter) conf.filter = filter;
                if (query) conf.query = this.query;
                return conf;
            },
            initialize: function() {
                this.lastRequest = this.buildPagingRequest();
            }
        });

        return {
            Document: Document,
            DocumentCollection: DocumentCollection
        };

});

define('modules/models-faceting',['modules/jquery-mozu', 'underscore', "hyprlive", "modules/backbone-mozu", "modules/models-product"], function($, _, Hypr, Backbone, ProductModels) {

    var FacetValue = Backbone.MozuModel.extend({
        idAttribute: 'value'
    }),

    Facet = Backbone.MozuModel.extend({
        idAttribute: 'field',
        helpers: ['isFaceted'],
        defaults: {
            facetType: '',
            field: '',
            label: ''
        },
        relations: {
            values: Backbone.Collection.extend({
                model: FacetValue
            })
        },
        isFaceted: function() {
            return !!this.get("values").findWhere({ "isApplied": true });
        },
        empty: function() {
            this.set("values", { isApplied: false });
            this.collection.parent.updateFacets({ resetIndex: true });
        },
        getAppliedValues: function() {
            return _.invoke(this.get("values").where({ isApplied: true }), 'get', 'filterValue').join(',');
        }

    }),

    FacetedProductCollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'search',
        relations: {
            facets: Backbone.Collection.extend({
                model: Facet
            }),
            items: Backbone.Collection.extend({
                model: ProductModels.Product
            })
        },
        helpers: ['hasValueFacets'],
        hierarchyDepth: 2,
        hierarchyField: 'categoryId',
        getQueryParams: function() {
            var params = Backbone.MozuPagedCollection.prototype.getQueryParams.apply(this, arguments);
            if (this.hierarchyValue) {
                params[window.encodeURIComponent(this.hierarchyField)] = window.encodeURIComponent(this.hierarchyValue);
            }
            return params;
        },
        buildRequest: function(filterValue) {
            var conf = Backbone.MozuPagedCollection.prototype.buildRequest.apply(this, arguments);
            filterValue = filterValue || this.getFacetValueFilter();
            if (filterValue) conf.facetValueFilter = filterValue;
            return conf;
        },
        setQuery: function(query) {
            this.query = query;
            if (!this.hierarchyValue && !this.baseRequestParams) {
                this.baseRequestParams = {
                    facet: this.hierarchyField,
                    facetHierDepth: this.hierarchyField + ":" + this.hierarchyDepth,
                    query: query
                };
            }
            this.lastRequest = this.buildRequest();
        },
        setHierarchy: function(hierarchyField, hierarchyValue) {
            this.hierarchyField = hierarchyField;
            this.hierarchyValue = hierarchyValue;
            this.baseRequestParams = this.baseRequestParams || {};
            if (hierarchyValue || hierarchyValue === 0) {
                this.baseRequestParams = _.extend(this.baseRequestParams, {
                    filter: hierarchyField + ' req ' + hierarchyValue,
                    facetTemplate: hierarchyField + ':' + hierarchyValue,
                    facetHierValue: hierarchyField + ':' + hierarchyValue,
                    facetHierDepth: hierarchyField + ':' + this.hierarchyDepth
                });
            } else {
                this.baseRequestParams = _.omit(this.baseRequestParams, 'filter', 'facetTemplate', 'facetHierValue', 'facetHierDepth');
            }
            if (this.query) this.baseRequestParams.query = this.query;
            this.lastRequest = this.buildRequest();
        },
        hasValueFacets: function() {
            return !!this.get('facets').findWhere({ facetType: 'Value' });
        },
        clearAllFacets: function() {
            this.get("facets").invoke("empty");
        },
        getFacetValueFilter: function() {
            return _.compact(this.get("facets").invoke("getAppliedValues")).join(',');
        },
        setFacetValue: function(field, value, yes) {
            var thisFacetValues = this.get('facets').findWhere({ field: field }).get('values'),
                // jQuery.data attempts to detect type, but the facet value might be a string anyway
                newValue = thisFacetValues.findWhere({ value: value }) || thisFacetValues.findWhere({
                    value: value.toString()
                });
            newValue.set("isApplied", yes);
            this.updateFacets({ resetIndex: true });
        },
        updateFacets: function(options) {
            var me = this,
                conf;
            options = options || {};
            if (options.resetIndex) this.set("startIndex", 0);
            conf = this.buildRequest(options.facetValueFilter);
            if (options.force || !_.isEqual(conf, this.lastRequest)) {
                this.lastRequest = conf;
                this.isLoading(true);
                // wipe current data set, since the server will give us our entire state
                this.get('facets').reset(null, { silent: true });
                this.get('items').reset(null, { silent: true });
                this.apiModel.get(conf).ensure(function() {
                    me.isLoading(false);
                });
            }
        },
        initialize: function() {
            var me = this;
            Backbone.MozuPagedCollection.prototype.initialize.apply(this, arguments);
            this.updateFacets = _.debounce(this.updateFacets, 300);
            this.on('sync', function() {
                me.trigger('facetchange', me.getQueryString());
            });
        }
    }),

    Category = FacetedProductCollection.extend({}),

    SearchResult = FacetedProductCollection.extend({
        defaultSort: '', // relevance rather than createdate
        buildRequest: function() {
            var conf = FacetedProductCollection.prototype.buildRequest.apply(this, arguments);
            if (this.query) conf.query = this.query;
            return conf;
        },
        getQueryParams: function() {
            var params = FacetedProductCollection.prototype.getQueryParams.apply(this, arguments);
            if (this.query) params.query = this.query;
            return params;
        }
    });

    return {
        Facet: Facet,
        FacetValue: FacetValue,
        FacetedProductCollection: FacetedProductCollection,
        Category: Category,
        SearchResult: SearchResult
    };

});

define('shim!vendor/bootstrap/js/affix[jquery=jQuery]',['jquery'], function(jQuery) { 

/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.7'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);
 ; 

return null; 

});


//@ sourceURL=/vendor/bootstrap/js/affix.js

;
define('shim!vendor/bootstrap/js/scrollspy[jquery=jQuery]',['jquery'], function(jQuery) { 

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.7'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);
 ; 

return null; 

});


//@ sourceURL=/vendor/bootstrap/js/scrollspy.js

;
define('modules/scroll-nav',['modules/jquery-mozu', 'hyprlive', 'underscore', 'modules/api', 'shim!vendor/bootstrap/js/affix[jquery=jQuery]', 'shim!vendor/bootstrap/js/scrollspy[jquery=jQuery]'], function ($, Hypr, _, api) {
    if (!Modernizr.mq('(max-width: 800px)')) {
        var gutterWidth = parseInt(Hypr.getThemeSetting('gutterWidth'), 10);
        $(document).ready(function () {
            $('[data-mz-scrollnav]').each(function () {
                var $this = $(this),
                    $nav = $($this.data('mzScrollnav')),
                    refreshFn = _.debounce(function () {
                        $nav.scrollspy('refresh');
                    }, 500);
                $this.on('click', 'a', function (e) {
                    e.preventDefault();
                    $(this.getAttribute('href')).ScrollTo({ axis: 'y', offsetTop: gutterWidth });
                }).affix({
                    offset: {
                        top: $this.offset().top - gutterWidth,
                        bottom: $('.ml-global-footer').outerHeight(true)+ $('footer').outerHeight(true)+$('.mz-pagefooter-copyright').outerHeight(true)
                    }
                });
                $(window).on('resize', refreshFn);
                api.on('sync', refreshFn);
                api.on('spawn', refreshFn);
                var id = $this.attr('id');
                if (!id) {
                    id = "scrollnav-" + new Date().getTime();
                    $this.attr('id', id);
                }
                $nav.scrollspy({ target: '#' + id, offset: gutterWidth*1.2 });
            });
        });
    }
});

define('shim!vendor/typeahead.js/typeahead.bundle[modules/jquery-mozu=jQuery]>jQuery',['modules/jquery-mozu'], function(jQuery) { 

/*!
 * typeahead.js 0.10.5
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

(function($) {
    var _ = function() {
        
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            getUniqueId: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            }(),
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            noop: function() {}
        };
    }();
    var VERSION = "0.10.5";
    var tokenizers = function() {
        
        return {
            nonword: nonword,
            whitespace: whitespace,
            obj: {
                nonword: getObjTokenizer(nonword),
                whitespace: getObjTokenizer(whitespace)
            }
        };
        function whitespace(str) {
            str = _.toStr(str);
            return str ? str.split(/\s+/) : [];
        }
        function nonword(str) {
            str = _.toStr(str);
            return str ? str.split(/\W+/) : [];
        }
        function getObjTokenizer(tokenizer) {
            return function setKey() {
                var args = [].slice.call(arguments, 0);
                return function tokenize(o) {
                    var tokens = [];
                    _.each(args, function(k) {
                        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
                    });
                    return tokens;
                };
            };
        }
    }();
    var LruCache = function() {
        
        function LruCache(maxSize) {
            this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
            this.reset();
            if (this.maxSize <= 0) {
                this.set = this.get = $.noop;
            }
        }
        _.mixin(LruCache.prototype, {
            set: function set(key, val) {
                var tailItem = this.list.tail, node;
                if (this.size >= this.maxSize) {
                    this.list.remove(tailItem);
                    delete this.hash[tailItem.key];
                }
                if (node = this.hash[key]) {
                    node.val = val;
                    this.list.moveToFront(node);
                } else {
                    node = new Node(key, val);
                    this.list.add(node);
                    this.hash[key] = node;
                    this.size++;
                }
            },
            get: function get(key) {
                var node = this.hash[key];
                if (node) {
                    this.list.moveToFront(node);
                    return node.val;
                }
            },
            reset: function reset() {
                this.size = 0;
                this.hash = {};
                this.list = new List();
            }
        });
        function List() {
            this.head = this.tail = null;
        }
        _.mixin(List.prototype, {
            add: function add(node) {
                if (this.head) {
                    node.next = this.head;
                    this.head.prev = node;
                }
                this.head = node;
                this.tail = this.tail || node;
            },
            remove: function remove(node) {
                node.prev ? node.prev.next = node.next : this.head = node.next;
                node.next ? node.next.prev = node.prev : this.tail = node.prev;
            },
            moveToFront: function(node) {
                this.remove(node);
                this.add(node);
            }
        });
        function Node(key, val) {
            this.key = key;
            this.val = val;
            this.prev = this.next = null;
        }
        return LruCache;
    }();
    var PersistentStorage = function() {
        
        var ls, methods;
        try {
            ls = window.localStorage;
            ls.setItem("~~~", "!");
            ls.removeItem("~~~");
        } catch (err) {
            ls = null;
        }
        function PersistentStorage(namespace) {
            this.prefix = [ "__", namespace, "__" ].join("");
            this.ttlKey = "__ttl__";
            this.keyMatcher = new RegExp("^" + _.escapeRegExChars(this.prefix));
        }
        if (ls && window.JSON) {
            methods = {
                _prefix: function(key) {
                    return this.prefix + key;
                },
                _ttlKey: function(key) {
                    return this._prefix(key) + this.ttlKey;
                },
                get: function(key) {
                    if (this.isExpired(key)) {
                        this.remove(key);
                    }
                    return decode(ls.getItem(this._prefix(key)));
                },
                set: function(key, val, ttl) {
                    if (_.isNumber(ttl)) {
                        ls.setItem(this._ttlKey(key), encode(now() + ttl));
                    } else {
                        ls.removeItem(this._ttlKey(key));
                    }
                    return ls.setItem(this._prefix(key), encode(val));
                },
                remove: function(key) {
                    ls.removeItem(this._ttlKey(key));
                    ls.removeItem(this._prefix(key));
                    return this;
                },
                clear: function() {
                    var i, key, keys = [], len = ls.length;
                    for (i = 0; i < len; i++) {
                        if ((key = ls.key(i)).match(this.keyMatcher)) {
                            keys.push(key.replace(this.keyMatcher, ""));
                        }
                    }
                    for (i = keys.length; i--; ) {
                        this.remove(keys[i]);
                    }
                    return this;
                },
                isExpired: function(key) {
                    var ttl = decode(ls.getItem(this._ttlKey(key)));
                    return _.isNumber(ttl) && now() > ttl ? true : false;
                }
            };
        } else {
            methods = {
                get: _.noop,
                set: _.noop,
                remove: _.noop,
                clear: _.noop,
                isExpired: _.noop
            };
        }
        _.mixin(PersistentStorage.prototype, methods);
        return PersistentStorage;
        function now() {
            return new Date().getTime();
        }
        function encode(val) {
            return JSON.stringify(_.isUndefined(val) ? null : val);
        }
        function decode(val) {
            return JSON.parse(val);
        }
    }();
    var Transport = function() {
        
        var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests = 6, sharedCache = new LruCache(10);
        function Transport(o) {
            o = o || {};
            this.cancelled = false;
            this.lastUrl = null;
            this._send = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            this._get = o.rateLimiter ? o.rateLimiter(this._get) : this._get;
            this._cache = o.cache === false ? new LruCache(0) : sharedCache;
        }
        Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
            maxPendingRequests = num;
        };
        Transport.resetCache = function resetCache() {
            sharedCache.reset();
        };
        _.mixin(Transport.prototype, {
            _get: function(url, o, cb) {
                var that = this, jqXhr;
                if (this.cancelled || url !== this.lastUrl) {
                    return;
                }
                if (jqXhr = pendingRequests[url]) {
                    jqXhr.done(done).fail(fail);
                } else if (pendingRequestsCount < maxPendingRequests) {
                    pendingRequestsCount++;
                    pendingRequests[url] = this._send(url, o).done(done).fail(fail).always(always);
                } else {
                    this.onDeckRequestArgs = [].slice.call(arguments, 0);
                }
                function done(resp) {
                    cb && cb(null, resp);
                    that._cache.set(url, resp);
                }
                function fail() {
                    cb && cb(true);
                }
                function always() {
                    pendingRequestsCount--;
                    delete pendingRequests[url];
                    if (that.onDeckRequestArgs) {
                        that._get.apply(that, that.onDeckRequestArgs);
                        that.onDeckRequestArgs = null;
                    }
                }
            },
            get: function(url, o, cb) {
                var resp;
                if (_.isFunction(o)) {
                    cb = o;
                    o = {};
                }
                this.cancelled = false;
                this.lastUrl = url;
                if (resp = this._cache.get(url)) {
                    _.defer(function() {
                        cb && cb(null, resp);
                    });
                } else {
                    this._get(url, o, cb);
                }
                return !!resp;
            },
            cancel: function() {
                this.cancelled = true;
            }
        });
        return Transport;
        function callbackToDeferred(fn) {
            return function customSendWrapper(url, o) {
                var deferred = $.Deferred();
                fn(url, o, onSuccess, onError);
                return deferred;
                function onSuccess(resp) {
                    _.defer(function() {
                        deferred.resolve(resp);
                    });
                }
                function onError(err) {
                    _.defer(function() {
                        deferred.reject(err);
                    });
                }
            };
        }
    }();
    var SearchIndex = function() {
        
        function SearchIndex(o) {
            o = o || {};
            if (!o.datumTokenizer || !o.queryTokenizer) {
                $.error("datumTokenizer and queryTokenizer are both required");
            }
            this.datumTokenizer = o.datumTokenizer;
            this.queryTokenizer = o.queryTokenizer;
            this.reset();
        }
        _.mixin(SearchIndex.prototype, {
            bootstrap: function bootstrap(o) {
                this.datums = o.datums;
                this.trie = o.trie;
            },
            add: function(data) {
                var that = this;
                data = _.isArray(data) ? data : [ data ];
                _.each(data, function(datum) {
                    var id, tokens;
                    id = that.datums.push(datum) - 1;
                    tokens = normalizeTokens(that.datumTokenizer(datum));
                    _.each(tokens, function(token) {
                        var node, chars, ch;
                        node = that.trie;
                        chars = token.split("");
                        while (ch = chars.shift()) {
                            node = node.children[ch] || (node.children[ch] = newNode());
                            node.ids.push(id);
                        }
                    });
                });
            },
            get: function get(query) {
                var that = this, tokens, matches;
                tokens = normalizeTokens(this.queryTokenizer(query));
                _.each(tokens, function(token) {
                    var node, chars, ch, ids;
                    if (matches && matches.length === 0) {
                        return false;
                    }
                    node = that.trie;
                    chars = token.split("");
                    while (node && (ch = chars.shift())) {
                        node = node.children[ch];
                    }
                    if (node && chars.length === 0) {
                        ids = node.ids.slice(0);
                        matches = matches ? getIntersection(matches, ids) : ids;
                    } else {
                        matches = [];
                        return false;
                    }
                });
                return matches ? _.map(unique(matches), function(id) {
                    return that.datums[id];
                }) : [];
            },
            reset: function reset() {
                this.datums = [];
                this.trie = newNode();
            },
            serialize: function serialize() {
                return {
                    datums: this.datums,
                    trie: this.trie
                };
            }
        });
        return SearchIndex;
        function normalizeTokens(tokens) {
            tokens = _.filter(tokens, function(token) {
                return !!token;
            });
            tokens = _.map(tokens, function(token) {
                return token.toLowerCase();
            });
            return tokens;
        }
        function newNode() {
            return {
                ids: [],
                children: {}
            };
        }
        function unique(array) {
            var seen = {}, uniques = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!seen[array[i]]) {
                    seen[array[i]] = true;
                    uniques.push(array[i]);
                }
            }
            return uniques;
        }
        function getIntersection(arrayA, arrayB) {
            var ai = 0, bi = 0, intersection = [];
            arrayA = arrayA.sort(compare);
            arrayB = arrayB.sort(compare);
            var lenArrayA = arrayA.length, lenArrayB = arrayB.length;
            while (ai < lenArrayA && bi < lenArrayB) {
                if (arrayA[ai] < arrayB[bi]) {
                    ai++;
                } else if (arrayA[ai] > arrayB[bi]) {
                    bi++;
                } else {
                    intersection.push(arrayA[ai]);
                    ai++;
                    bi++;
                }
            }
            return intersection;
            function compare(a, b) {
                return a - b;
            }
        }
    }();
    var oParser = function() {
        
        return {
            local: getLocal,
            prefetch: getPrefetch,
            remote: getRemote
        };
        function getLocal(o) {
            return o.local || null;
        }
        function getPrefetch(o) {
            var prefetch, defaults;
            defaults = {
                url: null,
                thumbprint: "",
                ttl: 24 * 60 * 60 * 1e3,
                filter: null,
                ajax: {}
            };
            if (prefetch = o.prefetch || null) {
                prefetch = _.isString(prefetch) ? {
                    url: prefetch
                } : prefetch;
                prefetch = _.mixin(defaults, prefetch);
                prefetch.thumbprint = VERSION + prefetch.thumbprint;
                prefetch.ajax.type = prefetch.ajax.type || "GET";
                prefetch.ajax.dataType = prefetch.ajax.dataType || "json";
                !prefetch.url && $.error("prefetch requires url to be set");
            }
            return prefetch;
        }
        function getRemote(o) {
            var remote, defaults;
            defaults = {
                url: null,
                cache: true,
                wildcard: "%QUERY",
                replace: null,
                rateLimitBy: "debounce",
                rateLimitWait: 300,
                send: null,
                filter: null,
                ajax: {}
            };
            if (remote = o.remote || null) {
                remote = _.isString(remote) ? {
                    url: remote
                } : remote;
                remote = _.mixin(defaults, remote);
                remote.rateLimiter = /^throttle$/i.test(remote.rateLimitBy) ? byThrottle(remote.rateLimitWait) : byDebounce(remote.rateLimitWait);
                remote.ajax.type = remote.ajax.type || "GET";
                remote.ajax.dataType = remote.ajax.dataType || "json";
                delete remote.rateLimitBy;
                delete remote.rateLimitWait;
                !remote.url && $.error("remote requires url to be set");
            }
            return remote;
            function byDebounce(wait) {
                return function(fn) {
                    return _.debounce(fn, wait);
                };
            }
            function byThrottle(wait) {
                return function(fn) {
                    return _.throttle(fn, wait);
                };
            }
        }
    }();
    (function(root) {
        
        var old, keys;
        old = root.Bloodhound;
        keys = {
            data: "data",
            protocol: "protocol",
            thumbprint: "thumbprint"
        };
        root.Bloodhound = Bloodhound;
        function Bloodhound(o) {
            if (!o || !o.local && !o.prefetch && !o.remote) {
                $.error("one of local, prefetch, or remote is required");
            }
            this.limit = o.limit || 5;
            this.sorter = getSorter(o.sorter);
            this.dupDetector = o.dupDetector || ignoreDuplicates;
            this.local = oParser.local(o);
            this.prefetch = oParser.prefetch(o);
            this.remote = oParser.remote(o);
            this.cacheKey = this.prefetch ? this.prefetch.cacheKey || this.prefetch.url : null;
            this.index = new SearchIndex({
                datumTokenizer: o.datumTokenizer,
                queryTokenizer: o.queryTokenizer
            });
            this.storage = this.cacheKey ? new PersistentStorage(this.cacheKey) : null;
        }
        Bloodhound.noConflict = function noConflict() {
            root.Bloodhound = old;
            return Bloodhound;
        };
        Bloodhound.tokenizers = tokenizers;
        _.mixin(Bloodhound.prototype, {
            _loadPrefetch: function loadPrefetch(o) {
                var that = this, serialized, deferred;
                if (serialized = this._readFromStorage(o.thumbprint)) {
                    this.index.bootstrap(serialized);
                    deferred = $.Deferred().resolve();
                } else {
                    deferred = $.ajax(o.url, o.ajax).done(handlePrefetchResponse);
                }
                return deferred;
                function handlePrefetchResponse(resp) {
                    that.clear();
                    that.add(o.filter ? o.filter(resp) : resp);
                    that._saveToStorage(that.index.serialize(), o.thumbprint, o.ttl);
                }
            },
            _getFromRemote: function getFromRemote(query, cb) {
                var that = this, url, uriEncodedQuery;
                if (!this.transport) {
                    return;
                }
                query = query || "";
                uriEncodedQuery = encodeURIComponent(query);
                url = this.remote.replace ? this.remote.replace(this.remote.url, query) : this.remote.url.replace(this.remote.wildcard, uriEncodedQuery);
                return this.transport.get(url, this.remote.ajax, handleRemoteResponse);
                function handleRemoteResponse(err, resp) {
                    err ? cb([]) : cb(that.remote.filter ? that.remote.filter(resp) : resp);
                }
            },
            _cancelLastRemoteRequest: function cancelLastRemoteRequest() {
                this.transport && this.transport.cancel();
            },
            _saveToStorage: function saveToStorage(data, thumbprint, ttl) {
                if (this.storage) {
                    this.storage.set(keys.data, data, ttl);
                    this.storage.set(keys.protocol, location.protocol, ttl);
                    this.storage.set(keys.thumbprint, thumbprint, ttl);
                }
            },
            _readFromStorage: function readFromStorage(thumbprint) {
                var stored = {}, isExpired;
                if (this.storage) {
                    stored.data = this.storage.get(keys.data);
                    stored.protocol = this.storage.get(keys.protocol);
                    stored.thumbprint = this.storage.get(keys.thumbprint);
                }
                isExpired = stored.thumbprint !== thumbprint || stored.protocol !== location.protocol;
                return stored.data && !isExpired ? stored.data : null;
            },
            _initialize: function initialize() {
                var that = this, local = this.local, deferred;
                deferred = this.prefetch ? this._loadPrefetch(this.prefetch) : $.Deferred().resolve();
                local && deferred.done(addLocalToIndex);
                this.transport = this.remote ? new Transport(this.remote) : null;
                return this.initPromise = deferred.promise();
                function addLocalToIndex() {
                    that.add(_.isFunction(local) ? local() : local);
                }
            },
            initialize: function initialize(force) {
                return !this.initPromise || force ? this._initialize() : this.initPromise;
            },
            add: function add(data) {
                this.index.add(data);
            },
            get: function get(query, cb) {
                var that = this, matches = [], cacheHit = false;
                matches = this.index.get(query);
                matches = this.sorter(matches).slice(0, this.limit);
                matches.length < this.limit ? cacheHit = this._getFromRemote(query, returnRemoteMatches) : this._cancelLastRemoteRequest();
                if (!cacheHit) {
                    (matches.length > 0 || !this.transport) && cb && cb(matches);
                }
                function returnRemoteMatches(remoteMatches) {
                    var matchesWithBackfill = matches.slice(0);
                    _.each(remoteMatches, function(remoteMatch) {
                        var isDuplicate;
                        isDuplicate = _.some(matchesWithBackfill, function(match) {
                            return that.dupDetector(remoteMatch, match);
                        });
                        !isDuplicate && matchesWithBackfill.push(remoteMatch);
                        return matchesWithBackfill.length < that.limit;
                    });
                    cb && cb(that.sorter(matchesWithBackfill));
                }
            },
            clear: function clear() {
                this.index.reset();
            },
            clearPrefetchCache: function clearPrefetchCache() {
                this.storage && this.storage.clear();
            },
            clearRemoteCache: function clearRemoteCache() {
                this.transport && Transport.resetCache();
            },
            ttAdapter: function ttAdapter() {
                return _.bind(this.get, this);
            }
        });
        return Bloodhound;
        function getSorter(sortFn) {
            return _.isFunction(sortFn) ? sort : noSort;
            function sort(array) {
                return array.sort(sortFn);
            }
            function noSort(array) {
                return array;
            }
        }
        function ignoreDuplicates() {
            return false;
        }
    })(this);
    var html = function() {
        return {
            wrapper: '<span class="twitter-typeahead"></span>',
            dropdown: '<span class="tt-dropdown-menu"></span>',
            dataset: '<div class="tt-dataset-%CLASS%"></div>',
            suggestions: '<span class="tt-suggestions"></span>',
            suggestion: '<div class="tt-suggestion"></div>'
        };
    }();
    var css = function() {
        
        var css = {
            wrapper: {
                position: "relative",
                display: "inline-block"
            },
            hint: {
                position: "absolute",
                top: "0",
                left: "0",
                borderColor: "transparent",
                boxShadow: "none",
                opacity: "1"
            },
            input: {
                position: "relative",
                verticalAlign: "top",
                backgroundColor: "transparent"
            },
            inputWithNoHint: {
                position: "relative",
                verticalAlign: "top"
            },
            dropdown: {
                position: "absolute",
                top: "100%",
                left: "0",
                zIndex: "100",
                display: "none"
            },
            suggestions: {
                display: "block"
            },
            suggestion: {
                whiteSpace: "nowrap",
                cursor: "pointer"
            },
            suggestionChild: {
                whiteSpace: "normal"
            },
            ltr: {
                left: "0",
                right: "auto"
            },
            rtl: {
                left: "auto",
                right: " 0"
            }
        };
        if (_.isMsie()) {
            _.mixin(css.input, {
                backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
            });
        }
        if (_.isMsie() && _.isMsie() <= 7) {
            _.mixin(css.input, {
                marginTop: "-1px"
            });
        }
        return css;
    }();
    var EventBus = function() {
        
        var namespace = "typeahead:";
        function EventBus(o) {
            if (!o || !o.el) {
                $.error("EventBus initialized without el");
            }
            this.$el = $(o.el);
        }
        _.mixin(EventBus.prototype, {
            trigger: function(type) {
                var args = [].slice.call(arguments, 1);
                this.$el.trigger(namespace + type, args);
            }
        });
        return EventBus;
    }();
    var EventEmitter = function() {
        
        var splitter = /\s+/, nextTick = getNextTick();
        return {
            onSync: onSync,
            onAsync: onAsync,
            off: off,
            trigger: trigger
        };
        function on(method, types, cb, context) {
            var type;
            if (!cb) {
                return this;
            }
            types = types.split(splitter);
            cb = context ? bindContext(cb, context) : cb;
            this._callbacks = this._callbacks || {};
            while (type = types.shift()) {
                this._callbacks[type] = this._callbacks[type] || {
                    sync: [],
                    async: []
                };
                this._callbacks[type][method].push(cb);
            }
            return this;
        }
        function onAsync(types, cb, context) {
            return on.call(this, "async", types, cb, context);
        }
        function onSync(types, cb, context) {
            return on.call(this, "sync", types, cb, context);
        }
        function off(types) {
            var type;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            while (type = types.shift()) {
                delete this._callbacks[type];
            }
            return this;
        }
        function trigger(types) {
            var type, callbacks, args, syncFlush, asyncFlush;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            args = [].slice.call(arguments, 1);
            while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
                syncFlush = getFlush(callbacks.sync, this, [ type ].concat(args));
                asyncFlush = getFlush(callbacks.async, this, [ type ].concat(args));
                syncFlush() && nextTick(asyncFlush);
            }
            return this;
        }
        function getFlush(callbacks, context, args) {
            return flush;
            function flush() {
                var cancelled;
                for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
                    cancelled = callbacks[i].apply(context, args) === false;
                }
                return !cancelled;
            }
        }
        function getNextTick() {
            var nextTickFn;
            if (window.setImmediate) {
                nextTickFn = function nextTickSetImmediate(fn) {
                    setImmediate(function() {
                        fn();
                    });
                };
            } else {
                nextTickFn = function nextTickSetTimeout(fn) {
                    setTimeout(function() {
                        fn();
                    }, 0);
                };
            }
            return nextTickFn;
        }
        function bindContext(fn, context) {
            return fn.bind ? fn.bind(context) : function() {
                fn.apply(context, [].slice.call(arguments, 0));
            };
        }
    }();
    var highlight = function(doc) {
        
        var defaults = {
            node: null,
            pattern: null,
            tagName: "strong",
            className: null,
            wordsOnly: false,
            caseSensitive: false
        };
        return function hightlight(o) {
            var regex;
            o = _.mixin({}, defaults, o);
            if (!o.node || !o.pattern) {
                return;
            }
            o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
            regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
            traverse(o.node, hightlightTextNode);
            function hightlightTextNode(textNode) {
                var match, patternNode, wrapperNode;
                if (match = regex.exec(textNode.data)) {
                    wrapperNode = doc.createElement(o.tagName);
                    o.className && (wrapperNode.className = o.className);
                    patternNode = textNode.splitText(match.index);
                    patternNode.splitText(match[0].length);
                    wrapperNode.appendChild(patternNode.cloneNode(true));
                    textNode.parentNode.replaceChild(wrapperNode, patternNode);
                }
                return !!match;
            }
            function traverse(el, hightlightTextNode) {
                var childNode, TEXT_NODE_TYPE = 3;
                for (var i = 0; i < el.childNodes.length; i++) {
                    childNode = el.childNodes[i];
                    if (childNode.nodeType === TEXT_NODE_TYPE) {
                        i += hightlightTextNode(childNode) ? 1 : 0;
                    } else {
                        traverse(childNode, hightlightTextNode);
                    }
                }
            }
        };
        function getRegex(patterns, caseSensitive, wordsOnly) {
            var escapedPatterns = [], regexStr;
            for (var i = 0, len = patterns.length; i < len; i++) {
                escapedPatterns.push(_.escapeRegExChars(patterns[i]));
            }
            regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
            return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
        }
    }(window.document);
    var Input = function() {
        
        var specialKeyCodeMap;
        specialKeyCodeMap = {
            9: "tab",
            27: "esc",
            37: "left",
            39: "right",
            13: "enter",
            38: "up",
            40: "down"
        };
        function Input(o) {
            var that = this, onBlur, onFocus, onKeydown, onInput;
            o = o || {};
            if (!o.input) {
                $.error("input is missing");
            }
            onBlur = _.bind(this._onBlur, this);
            onFocus = _.bind(this._onFocus, this);
            onKeydown = _.bind(this._onKeydown, this);
            onInput = _.bind(this._onInput, this);
            this.$hint = $(o.hint);
            this.$input = $(o.input).on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
            if (this.$hint.length === 0) {
                this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
            }
            if (!_.isMsie()) {
                this.$input.on("input.tt", onInput);
            } else {
                this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
                    if (specialKeyCodeMap[$e.which || $e.keyCode]) {
                        return;
                    }
                    _.defer(_.bind(that._onInput, that, $e));
                });
            }
            this.query = this.$input.val();
            this.$overflowHelper = buildOverflowHelper(this.$input);
        }
        Input.normalizeQuery = function(str) {
            return (str || "").replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
        };
        _.mixin(Input.prototype, EventEmitter, {
            _onBlur: function onBlur() {
                this.resetInputValue();
                this.trigger("blurred");
            },
            _onFocus: function onFocus() {
                this.trigger("focused");
            },
            _onKeydown: function onKeydown($e) {
                var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
                this._managePreventDefault(keyName, $e);
                if (keyName && this._shouldTrigger(keyName, $e)) {
                    this.trigger(keyName + "Keyed", $e);
                }
            },
            _onInput: function onInput() {
                this._checkInputValue();
            },
            _managePreventDefault: function managePreventDefault(keyName, $e) {
                var preventDefault, hintValue, inputValue;
                switch (keyName) {
                  case "tab":
                    hintValue = this.getHint();
                    inputValue = this.getInputValue();
                    preventDefault = hintValue && hintValue !== inputValue && !withModifier($e);
                    break;

                  case "up":
                  case "down":
                    preventDefault = !withModifier($e);
                    break;

                  default:
                    preventDefault = false;
                }
                preventDefault && $e.preventDefault();
            },
            _shouldTrigger: function shouldTrigger(keyName, $e) {
                var trigger;
                switch (keyName) {
                  case "tab":
                    trigger = !withModifier($e);
                    break;

                  default:
                    trigger = true;
                }
                return trigger;
            },
            _checkInputValue: function checkInputValue() {
                var inputValue, areEquivalent, hasDifferentWhitespace;
                inputValue = this.getInputValue();
                areEquivalent = areQueriesEquivalent(inputValue, this.query);
                hasDifferentWhitespace = areEquivalent ? this.query.length !== inputValue.length : false;
                this.query = inputValue;
                if (!areEquivalent) {
                    this.trigger("queryChanged", this.query);
                } else if (hasDifferentWhitespace) {
                    this.trigger("whitespaceChanged", this.query);
                }
            },
            focus: function focus() {
                this.$input.focus();
            },
            blur: function blur() {
                this.$input.blur();
            },
            getQuery: function getQuery() {
                return this.query;
            },
            setQuery: function setQuery(query) {
                this.query = query;
            },
            getInputValue: function getInputValue() {
                return this.$input.val();
            },
            setInputValue: function setInputValue(value, silent) {
                this.$input.val(value);
                silent ? this.clearHint() : this._checkInputValue();
            },
            resetInputValue: function resetInputValue() {
                this.setInputValue(this.query, true);
            },
            getHint: function getHint() {
                return this.$hint.val();
            },
            setHint: function setHint(value) {
                this.$hint.val(value);
            },
            clearHint: function clearHint() {
                this.setHint("");
            },
            clearHintIfInvalid: function clearHintIfInvalid() {
                var val, hint, valIsPrefixOfHint, isValid;
                val = this.getInputValue();
                hint = this.getHint();
                valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
                isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
                !isValid && this.clearHint();
            },
            getLanguageDirection: function getLanguageDirection() {
                return (this.$input.css("direction") || "ltr").toLowerCase();
            },
            hasOverflow: function hasOverflow() {
                var constraint = this.$input.width() - 2;
                this.$overflowHelper.text(this.getInputValue());
                return this.$overflowHelper.width() >= constraint;
            },
            isCursorAtEnd: function() {
                var valueLength, selectionStart, range;
                valueLength = this.$input.val().length;
                selectionStart = this.$input[0].selectionStart;
                if (_.isNumber(selectionStart)) {
                    return selectionStart === valueLength;
                } else if (document.selection) {
                    range = document.selection.createRange();
                    range.moveStart("character", -valueLength);
                    return valueLength === range.text.length;
                }
                return true;
            },
            destroy: function destroy() {
                this.$hint.off(".tt");
                this.$input.off(".tt");
                this.$hint = this.$input = this.$overflowHelper = null;
            }
        });
        return Input;
        function buildOverflowHelper($input) {
            return $('<pre aria-hidden="true"></pre>').css({
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "pre",
                fontFamily: $input.css("font-family"),
                fontSize: $input.css("font-size"),
                fontStyle: $input.css("font-style"),
                fontVariant: $input.css("font-variant"),
                fontWeight: $input.css("font-weight"),
                wordSpacing: $input.css("word-spacing"),
                letterSpacing: $input.css("letter-spacing"),
                textIndent: $input.css("text-indent"),
                textRendering: $input.css("text-rendering"),
                textTransform: $input.css("text-transform")
            }).insertAfter($input);
        }
        function areQueriesEquivalent(a, b) {
            return Input.normalizeQuery(a) === Input.normalizeQuery(b);
        }
        function withModifier($e) {
            return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
        }
    }();
    var Dataset = function() {
        
        var datasetKey = "ttDataset", valueKey = "ttValue", datumKey = "ttDatum";
        function Dataset(o) {
            o = o || {};
            o.templates = o.templates || {};
            if (!o.source) {
                $.error("missing source");
            }
            if (o.name && !isValidName(o.name)) {
                $.error("invalid dataset name: " + o.name);
            }
            this.query = null;
            this.highlight = !!o.highlight;
            this.name = o.name || _.getUniqueId();
            this.source = o.source;
            this.displayFn = getDisplayFn(o.display || o.displayKey);
            this.templates = getTemplates(o.templates, this.displayFn);
            this.$el = $(html.dataset.replace("%CLASS%", this.name));
        }
        Dataset.extractDatasetName = function extractDatasetName(el) {
            return $(el).data(datasetKey);
        };
        Dataset.extractValue = function extractDatum(el) {
            return $(el).data(valueKey);
        };
        Dataset.extractDatum = function extractDatum(el) {
            return $(el).data(datumKey);
        };
        _.mixin(Dataset.prototype, EventEmitter, {
            _render: function render(query, suggestions) {
                if (!this.$el) {
                    return;
                }
                var that = this, hasSuggestions;
                this.$el.empty();
                hasSuggestions = suggestions && suggestions.length;
                if (!hasSuggestions && this.templates.empty) {
                    this.$el.html(getEmptyHtml()).prepend(that.templates.header ? getHeaderHtml() : null).append(that.templates.footer ? getFooterHtml() : null);
                } else if (hasSuggestions) {
                    this.$el.html(getSuggestionsHtml()).prepend(that.templates.header ? getHeaderHtml() : null).append(that.templates.footer ? getFooterHtml() : null);
                }
                this.trigger("rendered");
                function getEmptyHtml() {
                    return that.templates.empty({
                        query: query,
                        isEmpty: true
                    });
                }
                function getSuggestionsHtml() {
                    var $suggestions, nodes;
                    $suggestions = $(html.suggestions).css(css.suggestions);
                    nodes = _.map(suggestions, getSuggestionNode);
                    $suggestions.append.apply($suggestions, nodes);
                    that.highlight && highlight({
                        className: "tt-highlight",
                        node: $suggestions[0],
                        pattern: query
                    });
                    return $suggestions;
                    function getSuggestionNode(suggestion) {
                        var $el;
                        $el = $(html.suggestion).append(that.templates.suggestion(suggestion)).data(datasetKey, that.name).data(valueKey, that.displayFn(suggestion)).data(datumKey, suggestion);
                        $el.children().each(function() {
                            $(this).css(css.suggestionChild);
                        });
                        return $el;
                    }
                }
                function getHeaderHtml() {
                    return that.templates.header({
                        query: query,
                        isEmpty: !hasSuggestions
                    });
                }
                function getFooterHtml() {
                    return that.templates.footer({
                        query: query,
                        isEmpty: !hasSuggestions
                    });
                }
            },
            getRoot: function getRoot() {
                return this.$el;
            },
            update: function update(query) {
                var that = this;
                this.query = query;
                this.canceled = false;
                this.source(query, render);
                function render(suggestions) {
                    if (!that.canceled && query === that.query) {
                        that._render(query, suggestions);
                    }
                }
            },
            cancel: function cancel() {
                this.canceled = true;
            },
            clear: function clear() {
                this.cancel();
                this.$el.empty();
                this.trigger("rendered");
            },
            isEmpty: function isEmpty() {
                return this.$el.is(":empty");
            },
            destroy: function destroy() {
                this.$el = null;
            }
        });
        return Dataset;
        function getDisplayFn(display) {
            display = display || "value";
            return _.isFunction(display) ? display : displayFn;
            function displayFn(obj) {
                return obj[display];
            }
        }
        function getTemplates(templates, displayFn) {
            return {
                empty: templates.empty && _.templatify(templates.empty),
                header: templates.header && _.templatify(templates.header),
                footer: templates.footer && _.templatify(templates.footer),
                suggestion: templates.suggestion || suggestionTemplate
            };
            function suggestionTemplate(context) {
                return "<p>" + displayFn(context) + "</p>";
            }
        }
        function isValidName(str) {
            return /^[_a-zA-Z0-9-]+$/.test(str);
        }
    }();
    var Dropdown = function() {
        
        function Dropdown(o) {
            var that = this, onSuggestionClick, onSuggestionMouseEnter, onSuggestionMouseLeave;
            o = o || {};
            if (!o.menu) {
                $.error("menu is required");
            }
            this.isOpen = false;
            this.isEmpty = true;
            this.datasets = _.map(o.datasets, initializeDataset);
            onSuggestionClick = _.bind(this._onSuggestionClick, this);
            onSuggestionMouseEnter = _.bind(this._onSuggestionMouseEnter, this);
            onSuggestionMouseLeave = _.bind(this._onSuggestionMouseLeave, this);
            this.$menu = $(o.menu).on("click.tt", ".tt-suggestion", onSuggestionClick).on("mouseenter.tt", ".tt-suggestion", onSuggestionMouseEnter).on("mouseleave.tt", ".tt-suggestion", onSuggestionMouseLeave);
            _.each(this.datasets, function(dataset) {
                that.$menu.append(dataset.getRoot());
                dataset.onSync("rendered", that._onRendered, that);
            });
        }
        _.mixin(Dropdown.prototype, EventEmitter, {
            _onSuggestionClick: function onSuggestionClick($e) {
                this.trigger("suggestionClicked", $($e.currentTarget));
            },
            _onSuggestionMouseEnter: function onSuggestionMouseEnter($e) {
                this._removeCursor();
                this._setCursor($($e.currentTarget), true);
            },
            _onSuggestionMouseLeave: function onSuggestionMouseLeave() {
                this._removeCursor();
            },
            _onRendered: function onRendered() {
                this.isEmpty = _.every(this.datasets, isDatasetEmpty);
                this.isEmpty ? this._hide() : this.isOpen && this._show();
                this.trigger("datasetRendered");
                function isDatasetEmpty(dataset) {
                    return dataset.isEmpty();
                }
            },
            _hide: function() {
                this.$menu.hide();
            },
            _show: function() {
                this.$menu.css("display", "block");
            },
            _getSuggestions: function getSuggestions() {
                return this.$menu.find(".tt-suggestion");
            },
            _getCursor: function getCursor() {
                return this.$menu.find(".tt-cursor").first();
            },
            _setCursor: function setCursor($el, silent) {
                $el.first().addClass("tt-cursor");
                !silent && this.trigger("cursorMoved");
            },
            _removeCursor: function removeCursor() {
                this._getCursor().removeClass("tt-cursor");
            },
            _moveCursor: function moveCursor(increment) {
                var $suggestions, $oldCursor, newCursorIndex, $newCursor;
                if (!this.isOpen) {
                    return;
                }
                $oldCursor = this._getCursor();
                $suggestions = this._getSuggestions();
                this._removeCursor();
                newCursorIndex = $suggestions.index($oldCursor) + increment;
                newCursorIndex = (newCursorIndex + 1) % ($suggestions.length + 1) - 1;
                if (newCursorIndex === -1) {
                    this.trigger("cursorRemoved");
                    return;
                } else if (newCursorIndex < -1) {
                    newCursorIndex = $suggestions.length - 1;
                }
                this._setCursor($newCursor = $suggestions.eq(newCursorIndex));
                this._ensureVisible($newCursor);
            },
            _ensureVisible: function ensureVisible($el) {
                var elTop, elBottom, menuScrollTop, menuHeight;
                elTop = $el.position().top;
                elBottom = elTop + $el.outerHeight(true);
                menuScrollTop = this.$menu.scrollTop();
                menuHeight = this.$menu.height() + parseInt(this.$menu.css("paddingTop"), 10) + parseInt(this.$menu.css("paddingBottom"), 10);
                if (elTop < 0) {
                    this.$menu.scrollTop(menuScrollTop + elTop);
                } else if (menuHeight < elBottom) {
                    this.$menu.scrollTop(menuScrollTop + (elBottom - menuHeight));
                }
            },
            close: function close() {
                if (this.isOpen) {
                    this.isOpen = false;
                    this._removeCursor();
                    this._hide();
                    this.trigger("closed");
                }
            },
            open: function open() {
                if (!this.isOpen) {
                    this.isOpen = true;
                    !this.isEmpty && this._show();
                    this.trigger("opened");
                }
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$menu.css(dir === "ltr" ? css.ltr : css.rtl);
            },
            moveCursorUp: function moveCursorUp() {
                this._moveCursor(-1);
            },
            moveCursorDown: function moveCursorDown() {
                this._moveCursor(+1);
            },
            getDatumForSuggestion: function getDatumForSuggestion($el) {
                var datum = null;
                if ($el.length) {
                    datum = {
                        raw: Dataset.extractDatum($el),
                        value: Dataset.extractValue($el),
                        datasetName: Dataset.extractDatasetName($el)
                    };
                }
                return datum;
            },
            getDatumForCursor: function getDatumForCursor() {
                return this.getDatumForSuggestion(this._getCursor().first());
            },
            getDatumForTopSuggestion: function getDatumForTopSuggestion() {
                return this.getDatumForSuggestion(this._getSuggestions().first());
            },
            update: function update(query) {
                _.each(this.datasets, updateDataset);
                function updateDataset(dataset) {
                    dataset.update(query);
                }
            },
            empty: function empty() {
                _.each(this.datasets, clearDataset);
                this.isEmpty = true;
                function clearDataset(dataset) {
                    dataset.clear();
                }
            },
            isVisible: function isVisible() {
                return this.isOpen && !this.isEmpty;
            },
            destroy: function destroy() {
                this.$menu.off(".tt");
                this.$menu = null;
                _.each(this.datasets, destroyDataset);
                function destroyDataset(dataset) {
                    dataset.destroy();
                }
            }
        });
        return Dropdown;
        function initializeDataset(oDataset) {
            return new Dataset(oDataset);
        }
    }();
    var Typeahead = function() {
        
        var attrsKey = "ttAttrs";
        function Typeahead(o) {
            var $menu, $input, $hint;
            o = o || {};
            if (!o.input) {
                $.error("missing input");
            }
            this.isActivated = false;
            this.autoselect = !!o.autoselect;
            this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
            this.$node = buildDom(o.input, o.withHint);
            $menu = this.$node.find(".tt-dropdown-menu");
            $input = this.$node.find(".tt-input");
            $hint = this.$node.find(".tt-hint");
            $input.on("blur.tt", function($e) {
                var active, isActive, hasActive;
                active = document.activeElement;
                isActive = $menu.is(active);
                hasActive = $menu.has(active).length > 0;
                if (_.isMsie() && (isActive || hasActive)) {
                    $e.preventDefault();
                    $e.stopImmediatePropagation();
                    _.defer(function() {
                        $input.focus();
                    });
                }
            });
            $menu.on("mousedown.tt", function($e) {
                $e.preventDefault();
            });
            this.eventBus = o.eventBus || new EventBus({
                el: $input
            });
            this.dropdown = new Dropdown({
                menu: $menu,
                datasets: o.datasets
            }).onSync("suggestionClicked", this._onSuggestionClicked, this).onSync("cursorMoved", this._onCursorMoved, this).onSync("cursorRemoved", this._onCursorRemoved, this).onSync("opened", this._onOpened, this).onSync("closed", this._onClosed, this).onAsync("datasetRendered", this._onDatasetRendered, this);
            this.input = new Input({
                input: $input,
                hint: $hint
            }).onSync("focused", this._onFocused, this).onSync("blurred", this._onBlurred, this).onSync("enterKeyed", this._onEnterKeyed, this).onSync("tabKeyed", this._onTabKeyed, this).onSync("escKeyed", this._onEscKeyed, this).onSync("upKeyed", this._onUpKeyed, this).onSync("downKeyed", this._onDownKeyed, this).onSync("leftKeyed", this._onLeftKeyed, this).onSync("rightKeyed", this._onRightKeyed, this).onSync("queryChanged", this._onQueryChanged, this).onSync("whitespaceChanged", this._onWhitespaceChanged, this);
            this._setLanguageDirection();
        }
        _.mixin(Typeahead.prototype, {
            _onSuggestionClicked: function onSuggestionClicked(type, $el) {
                var datum;
                if (datum = this.dropdown.getDatumForSuggestion($el)) {
                    this._select(datum);
                }
            },
            _onCursorMoved: function onCursorMoved() {
                var datum = this.dropdown.getDatumForCursor();
                this.input.setInputValue(datum.value, true);
                this.eventBus.trigger("cursorchanged", datum.raw, datum.datasetName);
            },
            _onCursorRemoved: function onCursorRemoved() {
                this.input.resetInputValue();
                this._updateHint();
            },
            _onDatasetRendered: function onDatasetRendered() {
                this._updateHint();
            },
            _onOpened: function onOpened() {
                this._updateHint();
                this.eventBus.trigger("opened");
            },
            _onClosed: function onClosed() {
                this.input.clearHint();
                this.eventBus.trigger("closed");
            },
            _onFocused: function onFocused() {
                this.isActivated = true;
                this.dropdown.open();
            },
            _onBlurred: function onBlurred() {
                this.isActivated = false;
                this.dropdown.empty();
                this.dropdown.close();
            },
            _onEnterKeyed: function onEnterKeyed(type, $e) {
                var cursorDatum, topSuggestionDatum;
                cursorDatum = this.dropdown.getDatumForCursor();
                topSuggestionDatum = this.dropdown.getDatumForTopSuggestion();
                if (cursorDatum) {
                    this._select(cursorDatum);
                    $e.preventDefault();
                } else if (this.autoselect && topSuggestionDatum) {
                    this._select(topSuggestionDatum);
                    $e.preventDefault();
                }
            },
            _onTabKeyed: function onTabKeyed(type, $e) {
                var datum;
                if (datum = this.dropdown.getDatumForCursor()) {
                    this._select(datum);
                    $e.preventDefault();
                } else {
                    this._autocomplete(true);
                }
            },
            _onEscKeyed: function onEscKeyed() {
                this.dropdown.close();
                this.input.resetInputValue();
            },
            _onUpKeyed: function onUpKeyed() {
                var query = this.input.getQuery();
                this.dropdown.isEmpty && query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.moveCursorUp();
                this.dropdown.open();
            },
            _onDownKeyed: function onDownKeyed() {
                var query = this.input.getQuery();
                this.dropdown.isEmpty && query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.moveCursorDown();
                this.dropdown.open();
            },
            _onLeftKeyed: function onLeftKeyed() {
                this.dir === "rtl" && this._autocomplete();
            },
            _onRightKeyed: function onRightKeyed() {
                this.dir === "ltr" && this._autocomplete();
            },
            _onQueryChanged: function onQueryChanged(e, query) {
                this.input.clearHintIfInvalid();
                query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.empty();
                this.dropdown.open();
                this._setLanguageDirection();
            },
            _onWhitespaceChanged: function onWhitespaceChanged() {
                this._updateHint();
                this.dropdown.open();
            },
            _setLanguageDirection: function setLanguageDirection() {
                var dir;
                if (this.dir !== (dir = this.input.getLanguageDirection())) {
                    this.dir = dir;
                    this.$node.css("direction", dir);
                    this.dropdown.setLanguageDirection(dir);
                }
            },
            _updateHint: function updateHint() {
                var datum, val, query, escapedQuery, frontMatchRegEx, match;
                datum = this.dropdown.getDatumForTopSuggestion();
                if (datum && this.dropdown.isVisible() && !this.input.hasOverflow()) {
                    val = this.input.getInputValue();
                    query = Input.normalizeQuery(val);
                    escapedQuery = _.escapeRegExChars(query);
                    frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
                    match = frontMatchRegEx.exec(datum.value);
                    match ? this.input.setHint(val + match[1]) : this.input.clearHint();
                } else {
                    this.input.clearHint();
                }
            },
            _autocomplete: function autocomplete(laxCursor) {
                var hint, query, isCursorAtEnd, datum;
                hint = this.input.getHint();
                query = this.input.getQuery();
                isCursorAtEnd = laxCursor || this.input.isCursorAtEnd();
                if (hint && query !== hint && isCursorAtEnd) {
                    datum = this.dropdown.getDatumForTopSuggestion();
                    datum && this.input.setInputValue(datum.value);
                    this.eventBus.trigger("autocompleted", datum.raw, datum.datasetName);
                }
            },
            _select: function select(datum) {
                this.input.setQuery(datum.value);
                this.input.setInputValue(datum.value, true);
                this._setLanguageDirection();
                this.eventBus.trigger("selected", datum.raw, datum.datasetName);
                this.dropdown.close();
                _.defer(_.bind(this.dropdown.empty, this.dropdown));
            },
            open: function open() {
                this.dropdown.open();
            },
            close: function close() {
                this.dropdown.close();
            },
            setVal: function setVal(val) {
                val = _.toStr(val);
                if (this.isActivated) {
                    this.input.setInputValue(val);
                } else {
                    this.input.setQuery(val);
                    this.input.setInputValue(val, true);
                }
                this._setLanguageDirection();
            },
            getVal: function getVal() {
                return this.input.getQuery();
            },
            destroy: function destroy() {
                this.input.destroy();
                this.dropdown.destroy();
                destroyDomStructure(this.$node);
                this.$node = null;
            }
        });
        return Typeahead;
        function buildDom(input, withHint) {
            var $input, $wrapper, $dropdown, $hint;
            $input = $(input);
            $wrapper = $(html.wrapper).css(css.wrapper);
            $dropdown = $(html.dropdown).css(css.dropdown);
            $hint = $input.clone().css(css.hint).css(getBackgroundStyles($input));
            $hint.val("").removeData().addClass("tt-hint").removeAttr("id name placeholder required").prop("readonly", true).attr({
                autocomplete: "off",
                spellcheck: "false",
                tabindex: -1
            });
            $input.data(attrsKey, {
                dir: $input.attr("dir"),
                autocomplete: $input.attr("autocomplete"),
                spellcheck: $input.attr("spellcheck"),
                style: $input.attr("style")
            });
            $input.addClass("tt-input").attr({
                autocomplete: "off",
                spellcheck: false
            }).css(withHint ? css.input : css.inputWithNoHint);
            try {
                !$input.attr("dir") && $input.attr("dir", "auto");
            } catch (e) {}
            return $input.wrap($wrapper).parent().prepend(withHint ? $hint : null).append($dropdown);
        }
        function getBackgroundStyles($el) {
            return {
                backgroundAttachment: $el.css("background-attachment"),
                backgroundClip: $el.css("background-clip"),
                backgroundColor: $el.css("background-color"),
                backgroundImage: $el.css("background-image"),
                backgroundOrigin: $el.css("background-origin"),
                backgroundPosition: $el.css("background-position"),
                backgroundRepeat: $el.css("background-repeat"),
                backgroundSize: $el.css("background-size")
            };
        }
        function destroyDomStructure($node) {
            var $input = $node.find(".tt-input");
            _.each($input.data(attrsKey), function(val, key) {
                _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
            });
            $input.detach().removeData(attrsKey).removeClass("tt-input").insertAfter($node);
            $node.remove();
        }
    }();
    (function() {
        
        var old, typeaheadKey, methods;
        old = $.fn.typeahead;
        typeaheadKey = "ttTypeahead";
        methods = {
            initialize: function initialize(o, datasets) {
                datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
                o = o || {};
                return this.each(attach);
                function attach() {
                    var $input = $(this), eventBus, typeahead;
                    _.each(datasets, function(d) {
                        d.highlight = !!o.highlight;
                    });
                    typeahead = new Typeahead({
                        input: $input,
                        eventBus: eventBus = new EventBus({
                            el: $input
                        }),
                        withHint: _.isUndefined(o.hint) ? true : !!o.hint,
                        minLength: o.minLength,
                        autoselect: o.autoselect,
                        datasets: datasets
                    });
                    $input.data(typeaheadKey, typeahead);
                }
            },
            open: function open() {
                return this.each(openTypeahead);
                function openTypeahead() {
                    var $input = $(this), typeahead;
                    if (typeahead = $input.data(typeaheadKey)) {
                        typeahead.open();
                    }
                }
            },
            close: function close() {
                return this.each(closeTypeahead);
                function closeTypeahead() {
                    var $input = $(this), typeahead;
                    if (typeahead = $input.data(typeaheadKey)) {
                        typeahead.close();
                    }
                }
            },
            val: function val(newVal) {
                return !arguments.length ? getVal(this.first()) : this.each(setVal);
                function setVal() {
                    var $input = $(this), typeahead;
                    if (typeahead = $input.data(typeaheadKey)) {
                        typeahead.setVal(newVal);
                    }
                }
                function getVal($input) {
                    var typeahead, query;
                    if (typeahead = $input.data(typeaheadKey)) {
                        query = typeahead.getVal();
                    }
                    return query;
                }
            },
            destroy: function destroy() {
                return this.each(unattach);
                function unattach() {
                    var $input = $(this), typeahead;
                    if (typeahead = $input.data(typeaheadKey)) {
                        typeahead.destroy();
                        $input.removeData(typeaheadKey);
                    }
                }
            }
        };
        $.fn.typeahead = function(method) {
            var tts;
            if (methods[method] && method !== "initialize") {
                tts = this.filter(function() {
                    return !!$(this).data(typeaheadKey);
                });
                return methods[method].apply(tts, [].slice.call(arguments, 1));
            } else {
                return methods.initialize.apply(this, arguments);
            }
        };
        $.fn.typeahead.noConflict = function noConflict() {
            $.fn.typeahead = old;
            return this;
        };
    })();
})(window.jQuery); ; 

return jQuery; 

});


//@ sourceURL=/vendor/typeahead.js/typeahead.bundle.js

;
define('modules/search-autocomplete',['shim!vendor/typeahead.js/typeahead.bundle[modules/jquery-mozu=jQuery]>jQuery', 'hyprlive', 'modules/api','hyprlivecontext'],
    function($, Hypr, api, HyprLiveContext) {

    // bundled typeahead saves a lot of space but exports bloodhound to the root object, let's lose it
    var Bloodhound = window.Bloodhound.noConflict();

    // bloodhound wants to make its own AJAX requests, and since it's got such good caching and tokenizing algorithms, i'm happy to help it
    // so instead of using the SDK to place the request, we just use it to get the URL configs and the required API headers

    // create bloodhound instances for each type of suggestion

    var Search = function() {
        return {
            qs : '%QUERY',
            eqs : function() {
                var self = this;
                return window.encodeURIComponent(self.qs);
            },
            suggestPriorSearchTerms: Hypr.getThemeSetting('suggestPriorSearchTerms'),
            getApiUrl : function (groups) {
                var self = this;
                return api.getActionConfig('suggest', 'get', { query: self.qs, groups: groups }).url;
            },
            ajaxConfig : {
                headers: api.getRequestHeaders()
            },
            nonWordRe : /\W+/,
            makeSuggestionGroupFilter : function (name) {
                return function (res) {
                    var suggestionGroups = res.suggestionGroups,
                        thisGroup;
                    for (var i = suggestionGroups.length - 1; i >= 0; i--) {
                        if (suggestionGroups[i].name === name) {
                            thisGroup = suggestionGroups[i];
                            break;
                        }
                    }
                    return thisGroup.suggestions;
                };
            },

            makeTemplateFn : function (name) {
                var tpt = Hypr.getTemplate(name);
                return function (obj) {
                    return tpt.render(obj);
                };
            },

            setDataSetConfigs : function() {
                var self = this;
                self.dataSetConfigs = [
                    {
                        name: 'pages',
                        displayKey: function (datum) {
                            return datum.suggestion.productCode;
                        },
                        templates: {
                            suggestion: self.makeTemplateFn('modules/search/autocomplete-page-result')
                        },
                        source: self.AutocompleteManager.datasets.pages.ttAdapter()
                    }
                ];
            },

            datasets: function() {
                var self = this;
                return {
                    pages: new Bloodhound({
                        datumTokenizer: function (datum) {
                            return datum.suggestion.term.split(self.nonWordRe);
                        },
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        remote: {
                            url: self.getApiUrl('pages'),
                            wildcard: self.eqs(),
                            filter: self.makeSuggestionGroupFilter("Pages"),
                            rateLimitWait: 400,
                            ajax: self.ajaxConfig
                        }
                    }),
					categories: new Bloodhound({
		                datumTokenizer: function(datum) {
		                    return datum.suggestion.categories.split(self.nonWordRe);
		                },
		                queryTokenizer: Bloodhound.tokenizers.whitespace,
		                remote: {
		                    url: self.getApiUrl('categories'),
		                    wildcard: self.eqs(),
		                    filter: self.makeSuggestionGroupFilter("Categories"),
		                    rateLimitWait: 100,
		                    ajax: self.ajaxConfig
		                }
		            })
                };
            },

            datasetsTerms: function() {
                var self = this;
                return new Bloodhound({
                    datumTokenizer: function (datum) {
                        return datum.suggestion.term.split(self.nonWordRe);
                    },
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    remote: {
                        url: self.getApiUrl('terms'),
                        wildcard: self.eqs(),
                        filter: self.makeSuggestionGroupFilter("Terms"),
                        rateLimitWait: 100,
                        ajax: self.ajaxConfig
                    }
                });
            },

            initialize: function() {
                var self = this;
                self.AutocompleteManager = {
                    datasets: self.datasets()
                };

                $.each(self.AutocompleteManager.datasets, function (name, set) {
                    set.initialize();
                });

                self.setDataSetConfigs();

                if (self.suggestPriorSearchTerms) {
                    self.AutocompleteManager.datasets.terms = self.datasetsTerms();
                    self.AutocompleteManager.datasets.terms.initialize();
                    self.dataSetConfigs.push({
                        name: 'terms',
                        displayKey: function (datum) {
                            return datum.suggestion.term;
                        },
                        source: self.AutocompleteManager.datasets.terms.ttAdapter()
                    });
                }
            }
        };
    };

    $(document).ready(function () {
        var $fields = $('[data-mz-role="searchquery"]').each(function(field){
            var search = new Search();
            search.initialize();

            var $field = search.AutocompleteManager.$typeaheadField = $(this);

            search.AutocompleteManager.typeaheadInstance = $field.typeahead({
                minLength: 3
            }, search.dataSetConfigs).data('ttTypeahead');
            // user hits enter key while menu item is selected;
            $field.on('typeahead:selected', function (e, data, set) {
                if (data.suggestion.productCode) window.location = (HyprLiveContext.locals.siteContext.siteSubdirectory || '') + "/p/" + data.suggestion.productCode;
            });
        });
    });
    return Search;
});

/**
 * Abstract dispatcher for routed applications in storefront.
 * Register a callback that will be called with a parsed URL.
 * @method onUrlChange(handler:function(e, uri)) -> undefined
 *         Add a handler to be called when the URL changes.
 */

define('modules/url-dispatcher',['backbone'], function(Backbone) {

    var Dispatcher;
    var proto;

    if (Modernizr.history) {
        Backbone.history.start({ pushState: true });

        proto = Backbone.Router.prototype;

        // using a backbone router ONLY for its event emitter capability
        Dispatcher = new Backbone.Router();

        // register catchall route so it fires event
        Dispatcher.route('*all', 'all', function() { });

        // hiding the implementation of the particular event emitter
        Dispatcher.onChange = function(cb) {
            Dispatcher.on('route:all', function() {
                cb(window.location.pathname + window.location.search + window.location.hash);
            });
        };

        Dispatcher.send = function(url) {
            return proto.navigate.call(this, url, { trigger: true });
        };

        Dispatcher.replace = function(url) {
            return proto.navigate.call(this, url, { replace: true });
        };

    } else {
        // if the browser does not support the HTML5 History API,
        // the dispatcher should simply default to full page navigation.
        Dispatcher = {
            send: function(url) {
                window.location = url;
            },
            replace: function(url) {
                window.location.replace(url);
            },
            onChange: function() { } // let the browser do its thing instead
        };
    }

    

    return Dispatcher;

});
/**
 * A bit like an RxJS observable stream, but using Backbone
 * (a preexisting dependency), aggregates user input into
 * a stream of intents, based on the mapping function
 * that you supply to turn an event into an intent.
 */

define('modules/intent-emitter',['underscore', 'backbone'], function(_, Backbone) {

	return function(element, subscriptions, processor, eventName) {
		var emitter = _.extend({}, Backbone.Events);
		var handler = function(e) {
			emitter.trigger(eventName || 'data', processor.apply(this, arguments), e);
		};
		var View = Backbone.View.extend({
			events: _.reduce(subscriptions, function(memo, subscription) {
				memo[subscription] = handler;
				return memo;
			}, {})
		});
		var view = new View({
			el: element
		});
		emitter.view = view;
		return emitter;
	};

});
/**
 * What if I told you that server-side Hypr can be client-side Hypr.
 * Only depends on jquery for AJAX, so that can be subbed in later
 * with something smaller.
 * Only depends on modules/api to turn jQuery deferred promises into
 * actually composable promises.
 * Only depends on modules/api to get access to compliant promises.
 * Later when we shim ES6/promise that can also go away.
 */

define('modules/get-partial-view',['modules/jquery-mozu', 'modules/api'], function($, api) {
    var PARTIAL_PARAM_NAME = "_mz_partial";

    function setPartialTrue(url) {
        var prefixChar = !~url.indexOf('?') ? '?' : '&';
        return url + prefixChar + PARTIAL_PARAM_NAME + "=true";
    }

    function removePartialParam(url) {
        return url.replace(
            RegExp('[&\\?]' + PARTIAL_PARAM_NAME + '=true', 'g'),
            '');
    }

    return function getPartialView(url, partialTemplate) {

        var deferred = api.defer();

        function handleSuccess(body, __, res) {
            var canonical = res.getResponseHeader('x-vol-canonical-url');
            if (canonical) {
                canonical = removePartialParam(canonical);
            }
            deferred.resolve({
                canonicalUrl: canonical,
                body: body
            });
        }

        function handleError(error) {
            deferred.reject(error);
        }

        $.ajax({
            method: 'GET',
            url: setPartialTrue(removePartialParam(url)),
            dataType: 'html',
            headers: {
                'x-vol-alternative-view': partialTemplate
            }
        }).then(handleSuccess, handleError);

        return deferred.promise;

    };

});
define('modules/color-swatches',[
    'modules/jquery-mozu',
    'hyprlivecontext',
    'modules/block-ui'
], function ($, HyprLiveContext, blockUiLoader) {

    //Select color Swatch
    var sitecontext = HyprLiveContext.locals.siteContext;
    var cdn = sitecontext.cdnPrefix;
    var siteID = cdn.substring(cdn.lastIndexOf('-') + 1);
    var imagefilepath = cdn + '/cms/' + siteID + '/files';
    var imageMaxWidth = HyprLiveContext.locals.themeSettings.productImageDirectoryMaxWidth;
    var _mainImage = '';
    
    //using GET request CheckImage function checks whether an image exist or not
    var checkImage = function(imagepath, callback) {
        $.get(imagepath).done(function() {
            callback(true); //return true if image exist
        }).error(function() {
            callback(false);
        });
    };

    //Change color swatch
    var Swatches = {
        changeColorSwatch: function(_e) {
            //show loading
            blockUiLoader.globalLoader();
            var _self = $(_e.currentTarget);
            if (_self.hasClass("active") || _self.parents("#overview-tab").length > 0) {
                blockUiLoader.unblockUi();
                return;
            } else {
                this.setMainImage( _self );
                _self.siblings().removeClass("active");
                _self.addClass("active");
                blockUiLoader.unblockUi();
            }
        },
        onMouseEnter: function(_e) {
            var _self = $(_e.currentTarget),
                _productCode = _self.attr("data-product-code");
                _mainImage = $(".mz-productlist-list li[data-mz-product='" + _productCode + "'] .mz-productlisting-image img").attr('src');

            this.setMainImage( _self );
        },
        onMouseLeave: function(_e) {
            var _selectedColorDom = $(_e.currentTarget).parent().find('li.active'),
                colorCode = _selectedColorDom.data('mz-swatch-color'),
                productCode = $(_e.currentTarget).attr("data-product-code");
            if (typeof colorCode != 'undefined') {
                this.setMainImage( _selectedColorDom );
            } else if(typeof _mainImage != 'undefined'){
                var _img = $(".mz-productlist-list li[data-mz-product='" + productCode + "'] .mz-productlisting-image img");
                _img.attr("src", _mainImage);
            }else{
                $(".mz-productlist-list li[data-mz-product='" + productCode + "'] .mz-productlisting-image a").html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
            }
        },
        setMainImage: function( _dom ){
            var colorCode = _dom.data('mz-swatch-color'),
                productCode = _dom.attr("data-product-code"),
                img = $(".mz-productlist-list li[data-mz-product='" + productCode + "'] .mz-productlisting-image img");
             
               var imagepath = imagefilepath + '/' + productCode + '_' + colorCode + '_v1.jpg';
                checkImage(imagepath, function(response) {
                    if (response) {
                        if (!img.length) {
                            var parentDiv = $(".mz-productlist-list li[data-mz-product='" + productCode + "'] .mz-productlisting-image");
                            parentDiv.find(".mz-productlisting-imageplaceholder").parent("a").addClass("image-holder");
                            parentDiv.find(".mz-productlisting-imageplaceholder").remove();
                            parentDiv.find(".image-holder").html("<img>");
                            img = $(".mz-productlist-list li[data-mz-product='" + productCode + "'] .image-holder img");
                            img.addClass("img-responsive");
                        }
                        img.attr("src", imagefilepath + '/' + productCode + '_' + colorCode + '_v1.jpg?maxWidth=' + imageMaxWidth);        
                    }else if(typeof _mainImage === 'undefined'){
                        $(".mz-productlist-list li[data-mz-product='" + productCode + "'] .mz-productlisting-image a").html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
                    }else if(response === false){
                        $(".mz-productlist-list li[data-mz-product='" + productCode + "'] .mz-productlisting-image a").html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
                    }
                });            
        }
    };
    return Swatches;
});
define('modules/category/infinite-scroller',[
    'modules/backbone-mozu',
    'modules/jquery-mozu',
    "hyprlive",
    'underscore',
    "hyprlivecontext",
    "modules/api",
    "modules/get-partial-view",
    "modules/block-ui"
], function(Backbone, $, Hypr, _, HyprLiveContext, api, getPartialView, blockUiLoader) {
    var items = require.mozuData('facetedproducts').items;
    var sitecontext = HyprLiveContext.locals.siteContext;
    var cdn = sitecontext.cdnPrefix;
    var isLoadMore = true;
    var siteID = cdn.substring(cdn.lastIndexOf('-') + 1);
    var imagefilepath = cdn + '/cms/' + siteID + '/files';
    var startIndex = require.mozuData('facetedproducts').startIndex;
    var pageSize = HyprLiveContext.locals.themeSettings.productInfinitySize;

    var ProductListItemView = Backbone.MozuView.extend({
        tagName: 'li',
        className: 'mz-productlist-item col-xs-6 col-sm-4',
        templateName: 'modules/product/product-listing',
        initialize: function() {
            var self = this;
            self.listenTo(self.model, 'change', self.render);
        },
        render: function() {
            Backbone.MozuView.prototype.render.apply(this);
            this.$el.attr("data-mz-product", this.$el.find(".mz-productlisting").data("mz-product"));
            return this;
        }
    });

    var Model = Backbone.MozuModel.extend();

    var ProductsListView = Backbone.MozuView.extend({
        templateName: 'modules/category/infinity-scroll',
        initialize: function() {
            var self = this;
            $(window).scroll(function() {
                if ($(window).scrollTop() >= $(document).height() - $(window).height() - $('.ml-global-footer').height() - $('footer').height() - 200) {
                    if ($(".view-all.selected").length) {
                        $("#more-item-container").show();
                        self.loadMoreProducts();
                    } else {
                        $("#more-item-container").hide();
                    }
                }
            });
        },
        render: function() {
            var me = this;
            items = require.mozuData('facetedproducts').items;
            me.model.attributes.products = items;
            Backbone.MozuView.prototype.render.apply(this);
            $('#more-product-list').empty();
        },
        addProduct: function(prod) {
            var view = new ProductListItemView({ model: new Model(prod) });
            var renderedView = view.render().el;
            $('#more-product-list').append(renderedView);
        },
        loadMoreProducts: function() {
            var me = this;
            var totalProducts = require.mozuData('facetedproducts').totalCount;

            if (totalProducts > startIndex && isLoadMore) {
                isLoadMore = false;
                $("#loaderIcon").show();
                var url = window.location.pathname;
                var search = window.location.search;
                search += (search.indexOf('?') == -1) ? '?' : '&';
                if (startIndex !== 0) {
                    blockUiLoader.globalLoader();
                    getPartialView(url + search + 'startIndex=' + startIndex, 'category-interior-json').then(function(response) {
                        var products = JSON.parse(response.body);
                        _.each(products.items, me.addProduct.bind(me));
                        blockUiLoader.unblockUi();
                        $("#loaderIcon").hide();
                        isLoadMore = true;
                        startIndex += pageSize;
                    }, function(error) {
                        $("#loaderIcon").hide();
                        blockUiLoader.unblockUi();
                        isLoadMore = true;
                        console.log(error);
                    });
                } else {
                    startIndex += pageSize;
                }
            }
        }
    });

    return {
        update: function() {
            var productsListView = new ProductsListView({
                model: new Model({ products: items }),
                el: '#more-item-container'
            });
            startIndex = pageSize;
            productsListView.render();
        }
    };
});
/**
 * Unidirectional dispatch-driven collection views, for your pleasure.
 */
define('modules/views-collections',[
    'backbone',
    'modules/jquery-mozu',
    'underscore',
    'modules/url-dispatcher',
    'modules/intent-emitter',
    'modules/get-partial-view',
    'modules/color-swatches',
     'modules/block-ui',
    'modules/category/infinite-scroller',
    'modules/metrics'
], function(Backbone, $ , _, UrlDispatcher, IntentEmitter, getPartialView,colorSwatch,blockUiLoader,InfiniteScroller, MetricsEngine) {

    function factory(conf) {

        var _$body = conf.$body;
        var _dispatcher = UrlDispatcher;
        var _isColorClicked = false;
        var ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND';
        var _mainImage = '';
        var footerPagingClicked=false;
        // on page load get facet href and append facets
        var path = getFacet();
        if (path !== "") {
            updateFacetFilter(path);
        }

        function showError(error) {
            // if (error.message === ROUTE_NOT_FOUND) {
            //     window.location.href = url;
            // }
            _$body.find('[data-mz-messages]').text(error.message);
        }

         function intentToUrl(e) {
            if ($(".blockOverlay").length > 0) {
                return;
            }
            //show loading
            blockUiLoader.globalLoader();
            var path = getFacet();
            var elm = e.target;
            var url;
            var del_url;
            if (elm.tagName.toLowerCase() === "select") {
                elm = elm.options[elm.selectedIndex];
            }
            url = elm.getAttribute('data-mz-url') || elm.getAttribute('href') || '';
            if (url && url[0] != "/") {
                url = (url.substr(url.length - 3) === '%3a') ? url.substring(0, url.length - 3) : url;
                var parser = document.createElement('a');
                parser.href = url;
                url = window.location.pathname + parser.search;
            }
            return url;
        }
        //remove facets when clicked on cross
        $('#page-content').on('click', '.remove-facet', (function(e) {
            blockUiLoader.globalLoader();
            var mzFacet = $(this).attr('data-mz-facet');
            var mzFacetValue = $(this).attr('data-mz-facet-value');
            var delFacet = mzFacet + ':' + mzFacetValue.replace(/\s/g, '+');
            var delFacet1 = mzFacet + '%3a' + mzFacetValue.replace(/\s/g, '+');
            //remove facet from url
            var path = getFacet();
            path = decodeURIComponent(path);
            var url = path.replace(delFacet + ',', '');
            url = url.replace(delFacet1 + ',', '');
            url = url.indexOf(delFacet) >= 0 ? path.replace(delFacet, '') : url;
            url = url.indexOf(delFacet1) >= 0 ? path.replace(delFacet1, '') : url;
            url = (url === '?facetValueFilter=') ? window.location.pathname : url;
            url = (url.substr(url.length - 1) === ':') ? url.substring(0, url.length - 1) : url;

            var parser = document.createElement('a');
            parser.href = url;
            url = window.location.pathname + parser.search;
            if (url && _dispatcher.send(url)) {
                _$body.addClass('mz-loading');
                e.preventDefault();
            }
        }));

        var navigationIntents = IntentEmitter(
            _$body,
            [
                'click [data-mz-pagingcontrols] a',
                'click [data-mz-pagenumbers] a',
                'click a[data-mz-facet-value]',
                'click [data-mz-action="clearFacets"]',
                'click [data-mz-action="filterMyStore"]',
                'change input[data-mz-facet-value]',
                'change [data-mz-value="pageSize"]',
                'change [data-mz-value="sortBy"]'
            ],
            intentToUrl
        );

        var toggleView = IntentEmitter(
            _$body, [
                'click [data-btn-view-toggle]'
            ],
            toggleProductView
        );

        navigationIntents.on('data', function(url, e) {
            if (url && _dispatcher.send(url)) {
                _$body.addClass('mz-loading');
                e.preventDefault();
            }
        });


        //create facets and append them in list
        function updateFacetFilter(path) {

            if (path.indexOf("facetValueFilter") > -1) {
                var pathArray = path.substring(1).split("&");
                var facetValue = "";
                for (var i = 0; i < pathArray.length; i++) {
                    var currentElmnt = pathArray[i].split("=");
                    if (currentElmnt[0] === "facetValueFilter") {
                        facetValue = currentElmnt[1];
                        break;
                    }
                }
                if (facetValue !== "") {
                    facetValue = decodeURIComponent(facetValue).split(",");
                    var available_facets = "";
                    for (var j = 0; j < facetValue.length; j++) {
                        var facetKey = facetValue[j].split(":")[0];
                        var facetVal = facetValue[j] !== "" ? facetValue[j].split(":")[1].replace(/\+/g, ' ') : "";
                        if (facetVal === "") {
                            continue;
                        }
                        if (facetVal.indexOf("&#38") != facetVal.indexOf("&#38;")) {
                            facetVal = facetVal.replace(/\&#38/g, '&amp;');
                        }
                        var displayValue = facetVal;

                        if (facetKey === 'price') {
                            if (displayValue.indexOf("* TO")) {
                                displayValue = displayValue.replace("* TO ", "");
                                displayValue += " and under";
                            } else if (displayValue.indexOf("TO *")) {
                                displayValue = displayValue.replace(" TO *", "+");
                            }
                            displayValue = displayValue.replace("[", "$").replace("]", "").replace(/to/gi, "-");
                        }
                        var filterKeyFormat=facetKey.replace('~','-');

                        if(filterKeyFormat==='' && facetVal===''){
                            $('#filter-'+filterKeyFormat).find('.mz-clear-facet-section').addClass('hide');
                        }else{
                             $('#filter-'+filterKeyFormat).find('.mz-clear-facet-section').removeClass('hide');
                        }
                        if(facetKey === 'tenant~size'){
                             displayValue=$('#'+facetVal).attr('data-mz-text-value');
                        }
                        available_facets += '<li><i class="fa fa-times-circle remove-facet" data-mz-facet="' + facetKey + '" data-mz-facet-value="' + facetValue[j].split(":")[1] + '" data-mz-purpose="remove" data-mz-action="clearFacet"></i> <u>' + displayValue + '</u></li>';
                    }
                    if (available_facets !== '') {
                        var filterOptionList = $("#filterOptionList");
                        filterOptionList.append(available_facets);
                    }
                    return true;
                }
            }
        }
        //get facets from the href
        function getFacet() {
            var path = window.location.search;
            return path;
        }
         function updateUi(response) {
            var url = response.canonicalUrl;
            if (url && url.substr(url.length - 2) === '&&')
                url = url.substring(0, url.length - 1);
            _$body.html(response.body);
              if (window.myStoreView) {
                window.myStoreView.init();
            }
            if (url) _dispatcher.replace(url);
            _$body.removeClass('mz-loading');
            InfiniteScroller.update();
            if(footerPagingClicked){
                 $("html, body").animate({ scrollTop: 0 }, "1000");
                 footerPagingClicked=false;
            }
            //add facet filter to list if any
            var path = getFacet();
            updateFacetFilter(path);
            //check default view
            if ($.cookie("currentView") === "listView") {
                $("#listView").trigger("click");
            } else {
                $("#gridView").trigger("click");
            }
            blockUiLoader.unblockUi();
        }
         //Toggle View GRID/LIST
        function toggleProductView(_e) {
            var _self = $(_e.currentTarget);
            var toggleButtons = $("button[data-btn-view-toggle]");
            var toggleListView = $(".ml-list-view-toggle");
            //check if already active
            if (_self.hasClass("active")) {
                return;
            } else {
                //check which view is enable
                if (_self.attr("id") == "gridView" && !toggleListView.hasClass("grid-view")) {
                    toggleListView.addClass("grid-view").removeClass("list-view");
                    $.cookie("currentView", "gridView");
                } else {
                    toggleListView.addClass("list-view").removeClass("grid-view");
                    $.cookie("currentView", "listView");
                }
            }
            //make selected view icon active
            toggleButtons.removeClass("active");
            _self.addClass("active");
        }
         //Select color Swatch
        var selectSwatch = IntentEmitter(
            _$body, [
                'click #product-list-ul [data-mz-swatch-color]',
                'click #more-product-list [data-mz-swatch-color]',
                'mouseenter #product-list-ul [data-mz-swatch-color]',
                'mouseleave #product-list-ul [data-mz-swatch-color]'
            ],
            changeColorSwatch
        );
        //Change color swatch
        function changeColorSwatch(_e) {
            if(_e.type == 'mouseenter'){
                colorSwatch.onMouseEnter(_e);
            }
            else if(_e.type == 'mouseleave'){
                colorSwatch.onMouseLeave(_e);
            }
            else{
                _isColorClicked = true;
                colorSwatch.changeColorSwatch(_e);
                _isColorClicked = false;
            }
        }
        _dispatcher.onChange(function(url) {
            getPartialView(url, conf.template).then(updateUi, showError);
        });
        //Show more swatches
        var showMoreSwatch = IntentEmitter(
            _$body, [
                'click .showMoreSwatches'
            ],
            showMoreColors
        );
        //show all colors
        function showMoreColors(_e) {
            var _self = $(_e.currentTarget);
            var currentProduct = _self.parents(".ml-product-swatch");
            _self.parent("li").hide();
            currentProduct.find("li.mz-hide-color").removeClass("mz-hide-color");
        }
        //toggle filters
        var toggleFilters = IntentEmitter(
            _$body, [
                'click [data-mz-filters-collapse]'
            ],
            toggleFiltersView
        );
        var footerPaging=IntentEmitter(
            _$body, [
                'click .mz-l-paginatedlist-footer a'
            ],
            footerPagingRender
        );
        function footerPagingRender(){
           footerPagingClicked=true;
        }

        var clearFacet=IntentEmitter(
            _$body, [
                'click .mz-clear-facet-section'
            ],
            clearFacetSection
        );

        function clearFacetSection(_e){
            blockUiLoader.globalLoader();
            var _self = $(_e.currentTarget);
            var facetVal = _self.attr("data-clear-text");
            var path = getFacet();
            path = decodeURIComponent(path);
            var url= path.replace(new RegExp(facetVal+'\:(.*?)(,|&)', 'g'), '');
            if(url[url.length -1]==','){
                url = url.replace(new RegExp(',$', 'g'), '\&');

            }
            var parser = document.createElement('a');
            parser.href = url;
            url = window.location.pathname + parser.search;
            if (url && _dispatcher.send(url)) {
                _$body.addClass('mz-loading');
                _e.preventDefault();
            }
        }
        //Toggle filters
        function toggleFiltersView(_e) {
            var icon = $('#collapseIcon>i');
            var elmtn = $('#filterOptions');
            $(elmtn).toggle();

            if ($(icon).hasClass("fa-plus")) {
                $(icon).removeClass("fa-plus").addClass("fa-minus");
            } else {
                $(icon).addClass("fa-plus").removeClass("fa-minus");
            }
        }
        //toggle filter
        var toggleFilter = IntentEmitter(
            _$body, [
                'click [data-mz-filter-collapse]'
            ],
            toggleFilterView
        );
        //Toggle filter
        function toggleFilterView(_e) {
            var _self = $(_e.currentTarget);
            var count = _self.attr("data-mz-filter-collapse");
            var icon = $('#filterIcon' + count);
            var elmtn = $('#filterList' + count);

            $(".mz-facetingform-facet").removeClass("active");
            $(elmtn).addClass("active");
            $(".filter-icon").find("i.fa")
                .removeClass("fa-minus")
                .addClass("fa-plus");

            $(icon).find("i.fa")
                .removeClass("fa-plus")
                .addClass("fa-minus");
        }
        //toggle filter
        var backToTop = IntentEmitter(
            _$body, [
                "click .back-to-top"
            ],
            backToTopFn
        );
        function backToTopFn() {
            $("html, body").animate({ scrollTop: 0 }, 500);
        }
        //Switch More
        var switchMore = IntentEmitter(
            _$body, [
                "click .show-more"
            ],
            switchMoreFn
        );
        function switchMoreFn(e) {
            var parentLi = $(e.currentTarget).parent("li.show-more-li");
            if (parentLi.hasClass("show-less")) {
                parentLi.find("a").text("More...");
                parentLi.removeClass("show-less").parent("ul").find("li.mz-hide-text").addClass("hide");
            } else {
                parentLi.find("a").text("Less...");
                parentLi.addClass("show-less").parent("ul").find("li.mz-hide-text").removeClass("hide");
            }
        }
        if ($(".view-all.selected").length) {
            InfiniteScroller.update();
        }
    }

    return {
        createFacetedCollectionViews: factory
    };

});

/**
 * Can be used on any Backbone.MozuModel that has had the paging mixin in mixins-paging added to it.
 */
define('modules/views-paging',['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu'], function($, _, Backbone) {

    var PagingBaseView = Backbone.MozuView.extend({
        initialize: function() {
            var me = this;
            if (!this.model._isPaged) {
                throw "Cannot bind a Paging view to a model that does not have the Paging mixin!";
            }

            //handle browser's back button to make sure startIndex is updated.
            Backbone.history.on('route', function () {
                me.model.syncIndex(Backbone.history.fragment);
            });
        },
        render: function() {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            this.$('select').each(function() {
                var $this = $(this);
                $this.val($this.find('option[selected]').val());
            });
        }
    });

    var PagingControlsView = PagingBaseView.extend({
        templateName: 'modules/common/paging-controls',
        autoUpdate: ['pageSize'],
        updatePageSize: function(e) {
            var newSize = parseInt($(e.currentTarget).val(), 10),
            currentSize = this.model.get('pageSize');
            if (isNaN(newSize)) throw new SyntaxError("Cannot set page size to a non-number!");
            if (newSize !== currentSize) {
                this.model.set('pageSize', newSize);
                this.model.set("startIndex", 0);
            }
        }
    });

    var PageNumbersView = PagingBaseView.extend({
        templateName: 'modules/common/page-numbers',
        previous: function(e) {
            e.preventDefault();
            return this.model.previousPage();
        },
        next: function(e) {
            e.preventDefault();
            return this.model.nextPage();
        },
        page: function(e) {
            e.preventDefault();
            return this.model.setPage(parseInt($(e.currentTarget).data('mz-page-num'), 10) || 1);
        }
    });

    var scrollToTop = function() {
        $('body').ScrollTo({ duration: 200 });
    };

    var TopScrollingPageNumbersView = PageNumbersView.extend({
        previous: function() {
            return PageNumbersView.prototype.previous.apply(this, arguments).then(scrollToTop);
        },
        next: function() {
            return PageNumbersView.prototype.next.apply(this, arguments).then(scrollToTop);
        },
        page: function() {
            return PageNumbersView.prototype.page.apply(this, arguments).then(scrollToTop);
        }
    });

    var PageSortView = PagingBaseView.extend({
        templateName: 'modules/common/page-sort',
        updateSortBy: function(e) {
            return this.model.sortBy($(e.currentTarget).val());
        }
    });

    return {
        PagingControls: PagingControlsView,
        PageNumbers: PageNumbersView,
        TopScrollingPageNumbers: TopScrollingPageNumbersView,
        PageSortView: PageSortView
    };

});
define('modules/views-productlists',['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu', 'hyprlive'], function ($, _, Backbone, Hypr) {

    var ProductListView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-list-tiled'
    }),

    FacetingPanel = Backbone.MozuView.extend({
        additionalEvents: {
            "change [data-mz-facet-value]": "setFacetValue",
            "click [data-mz-facet-link]": "handleFacetLink"
        },
        templateName: "modules/product/faceting-form",
        initialize: function () {
            this.listenTo(this.model, 'loadingchange', function (isLoading) {
                this.$el.find('input').prop('disabled', isLoading);
            });
        },
        clearFacets: function () {
            this.model.clearAllFacets();
        },
        clearFacet: function (e) {
            this.model.get("facets").findWhere({ field: $(e.currentTarget).data('mz-facet') }).empty();
        },
        drillDown: function(e) {
            var $target = $(e.currentTarget),
                id = $target.data('mz-hierarchy-id'),
                field = $target.data('mz-facet');
            this.model.setHierarchy(field, id);
            this.model.updateFacets({ force: true, resetIndex: true });
            e.preventDefault();
        },
        setFacetValue: function (e) {
            var $box = $(e.currentTarget);
            this.model.setFacetValue($box.data('mz-facet'), $box.data('mz-facet-value'), $box.is(':checked'));
        },
        handleFacetLink: function (e) {
            e.stopImmediatePropagation();
        }
    });



    return {
        List: ProductListView,
        FacetingPanel: FacetingPanel
    };
});

/*! lazysizes - v1.1.4-rc1 */
!function(a,b){var c=b(a,a.document);a.lazySizes=c,"object"==typeof module&&module.exports?module.exports=c:"function"==typeof define&&define.amd&&define(c)}(window,function(a,b){if(b.getElementsByClassName){var c,d=b.documentElement,e=a.addEventListener,f=a.setTimeout,g=a.requestAnimationFrame||f,h=a.setImmediate||f,i=/^picture$/i,j=["load","error","lazyincluded","_lazyloaded"],k=function(a,b){var c=new RegExp("(\\s|^)"+b+"(\\s|$)");return a.className.match(c)&&c},l=function(a,b){k(a,b)||(a.className+=" "+b)},m=function(a,b){var c;(c=k(a,b))&&(a.className=a.className.replace(c," "))},n=function(a,b,c){var d=c?"addEventListener":"removeEventListener";c&&n(a,b),j.forEach(function(c){a[d](c,b)})},o=function(a,c,d,e,f){var g=b.createEvent("CustomEvent");return g.initCustomEvent(c,!e,!f,d||{}),a.dispatchEvent(g),g},p=function(b,d){var e;a.HTMLPictureElement||((e=a.picturefill||a.respimage||c.pf)?e({reevaluate:!0,elements:[b]}):d&&d.src&&(b.src=d.src))},q=function(a,b){return(getComputedStyle(a,null)||{})[b]},r=function(a,b,d){for(d=d||a.offsetWidth;d<c.minSize&&b&&!a._lazysizesWidth;)d=b.offsetWidth,b=b.parentNode;return d},s=function(b){var d,e=0,i=a.Date,j=function(){d=!1,e=i.now(),b()},k=function(){h(j)},l=function(){g(k)};return function(){if(!d){var a=c.throttle-(i.now()-e);d=!0,6>a&&(a=6),f(l,a)}}},t=function(){var h,j,r,t,v,w,x,y,z,A,B,C,D,E=/^img$/i,F=/^iframe$/i,G="onscroll"in a&&!/glebot/.test(navigator.userAgent),H=0,I=0,J=0,K=0,L=function(a){J--,a&&a.target&&n(a.target,L),(!a||0>J||!a.target)&&(J=0)},M=function(a,b){var c,d=a,e="hidden"!=q(a,"visibility");for(y-=b,B+=b,z-=b,A+=b;e&&(d=d.offsetParent);)e=(q(d,"opacity")||1)>0,e&&"visible"!=q(d,"overflow")&&(c=d.getBoundingClientRect(),e=A>c.left&&z<c.right&&B>c.top-1&&y<c.bottom+1);return e},N=function(){var a,b,d,e,f,g,i,k,l;if((v=c.loadMode)&&8>J&&(a=h.length)){for(b=0,K++,D>I&&1>J&&K>3&&v>2?(I=D,K=0):I=I!=C&&v>1&&K>2&&6>J?C:H;a>b;b++)if(h[b]&&!h[b]._lazyRace)if(G)if((k=h[b].getAttribute("data-expand"))&&(g=1*k)||(g=I),l!==g&&(w=innerWidth+g,x=innerHeight+g,i=-1*g,l=g),d=h[b].getBoundingClientRect(),(B=d.bottom)>=i&&(y=d.top)<=x&&(A=d.right)>=i&&(z=d.left)<=w&&(B||A||z||y)&&(r&&3>J&&!k&&(3>v||4>K)||M(h[b],g))){if(S(h[b],d.width),f=!0,J>9)break}else!f&&r&&!e&&3>J&&4>K&&v>2&&(j[0]||c.preloadAfterLoad)&&(j[0]||!k&&(B||A||z||y||"auto"!=h[b].getAttribute(c.sizesAttr)))&&(e=j[0]||h[b]);else S(h[b]);e&&!f&&S(e)}},O=s(N),P=function(a){l(a.target,c.loadedClass),m(a.target,c.loadingClass),n(a.target,P)},Q=function(a,b){try{a.contentWindow.location.replace(b)}catch(c){a.setAttribute("src",b)}},R=function(){var a,b=[],c=function(){for(;b.length;)b.shift()();a=!1};return function(d){b.push(d),a||(a=!0,g(c))}}(),S=function(a,b){var d,e,g,h,j,q,s,v,w,x,y,z=E.test(a.nodeName),A=z&&(a.getAttribute(c.sizesAttr)||a.getAttribute("sizes")),B="auto"==A;(!B&&r||!z||!a.src&&!a.srcset||a.complete||k(a,c.errorClass))&&(a._lazyRace=!0,J++,R(function(){if(a._lazyRace&&delete a._lazyRace,m(a,c.lazyClass),!(w=o(a,"lazybeforeunveil")).defaultPrevented){if(A&&(B?(u.updateElem(a,!0,b),l(a,c.autosizesClass)):a.setAttribute("sizes",A)),q=a.getAttribute(c.srcsetAttr),j=a.getAttribute(c.srcAttr),z&&(s=a.parentNode,v=s&&i.test(s.nodeName||"")),x=w.detail.firesLoad||"src"in a&&(q||j||v),w={target:a},x&&(n(a,L,!0),clearTimeout(t),t=f(L,2500),l(a,c.loadingClass),n(a,P,!0)),v)for(d=s.getElementsByTagName("source"),e=0,g=d.length;g>e;e++)(y=c.customMedia[d[e].getAttribute("data-media")||d[e].getAttribute("media")])&&d[e].setAttribute("media",y),h=d[e].getAttribute(c.srcsetAttr),h&&d[e].setAttribute("srcset",h);q?a.setAttribute("srcset",q):j&&(F.test(a.nodeName)?Q(a,j):a.setAttribute("src",j)),(q||v)&&p(a,{src:j})}(!x||a.complete)&&(x?L(w):J--,P(w))}))},T=function(){var a,b=function(){c.loadMode=3,O()};r=!0,K+=8,c.loadMode=3,e("scroll",function(){3==c.loadMode&&(c.loadMode=2),clearTimeout(a),a=f(b,99)},!0)};return{_:function(){h=b.getElementsByClassName(c.lazyClass),j=b.getElementsByClassName(c.lazyClass+" "+c.preloadClass),C=c.expand,D=Math.round(C*c.expFactor),e("scroll",O,!0),e("resize",O,!0),a.MutationObserver?new MutationObserver(O).observe(d,{childList:!0,subtree:!0,attributes:!0}):(d.addEventListener("DOMNodeInserted",O,!0),d.addEventListener("DOMAttrModified",O,!0),setInterval(O,999)),e("hashchange",O,!0),["focus","mouseover","click","load","transitionend","animationend","webkitAnimationEnd"].forEach(function(a){b.addEventListener(a,O,!0)}),/d$|^c/.test(b.readyState)?T():(e("load",T),b.addEventListener("DOMContentLoaded",O)),O()},checkElems:O,unveil:S}}(),u=function(){var a,d=function(a,b,c){var d,e,f,g,h=a.parentNode;if(h&&(c=r(a,h,c),g=o(a,"lazybeforesizes",{width:c,dataAttr:!!b}),!g.defaultPrevented&&(c=g.detail.width,c&&c!==a._lazysizesWidth))){if(a._lazysizesWidth=c,c+="px",a.setAttribute("sizes",c),i.test(h.nodeName||""))for(d=h.getElementsByTagName("source"),e=0,f=d.length;f>e;e++)d[e].setAttribute("sizes",c);g.detail.dataAttr||p(a,g.detail)}},f=function(){var b,c=a.length;if(c)for(b=0;c>b;b++)d(a[b])},g=s(f);return{_:function(){a=b.getElementsByClassName(c.autosizesClass),e("resize",g)},checkElems:g,updateElem:d}}(),v=function(){v.i||(v.i=!0,u._(),t._())};return function(){var b,d={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",preloadClass:"lazypreload",errorClass:"lazyerror",autosizesClass:"lazyautosizes",srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",minSize:40,customMedia:{},init:!0,expFactor:2,expand:359,loadMode:2,throttle:125};c=a.lazySizesConfig||a.lazysizesConfig||{};for(b in d)b in c||(c[b]=d[b]);a.lazySizesConfig=c,f(function(){c.init&&v()})}(),{cfg:c,autoSizer:u,loader:t,init:v,uP:p,aC:l,rC:m,hC:k,fire:o,gW:r}}});

/*! lazysizes - v1.1.4-rc1 */
!function(a,b,c){function d(a,b){var c,d,e,f;d=a.parentNode,f={isPicture:!(!d||!m.test(d.nodeName||""))},e=function(b,c){var d=a.getAttribute("data-"+b);if(null!=d){if("true"==d)d=!0;else if("false"==d)d=!1;else if(l.test(d))d=parseFloat(d);else if("function"==typeof j[b])d=j[b](a,d);else if(p.test(d))try{d=JSON.parse(d)}catch(e){}f[b]=d}else b in j&&"function"!=typeof j[b]?f[b]=j[b]:c&&"function"==typeof j[b]&&(f[b]=j[b](a,d))};for(c in j)e(c);return b.replace(o,function(a,b){b in f||e(b,!0)}),f}function e(a,b){var c=[],d=function(a,c){return k[typeof b[c]]?b[c]:a};return c.srcset=[],b.absUrl&&(r.setAttribute("href",a),a=r.href),a=((b.prefix||"")+a+(b.postfix||"")).replace(o,d),b.widths.forEach(function(d){var e={u:a.replace(n,b.widthmap[d]||d),w:d};c.push(e),c.srcset.push(e.c=e.u+" "+d+"w")}),c}function f(a,b,c){a&&(a=e(a,b),a.isPicture=b.isPicture,t&&"IMG"==c.nodeName.toUpperCase()?c.removeAttribute(i.srcsetAttr):c.setAttribute(i.srcsetAttr,a.srcset.join(", ")),Object.defineProperty(c,"_lazyrias",{value:a,writable:!0}))}function g(a,b){var c=d(a,b);return j.modifyOptions.call(a,{target:a,details:c,detail:c}),lazySizes.fire(a,"lazyriasmodifyoptions",c),c}function h(a){return a.getAttribute(a.getAttribute("data-srcattr")||j.srcAttr)||a.getAttribute(i.srcsetAttr)||a.getAttribute(i.srcAttr)||a.getAttribute("data-pfsrcset")||""}if(b.addEventListener){var i,j,k={string:1,number:1},l=/^\-*\+*\d+\.*\d*$/,m=/^picture$/i,n=/\s*\{\s*width\s*\}\s*/i,o=/\s*\{\s*([a-z0-9]+)\s*\}\s*/gi,p=/^\[.*\]|\{.*\}$/,q=/^(?:auto|\d+(px)?)$/,r=b.createElement("a"),s=b.createElement("img"),t="srcset"in s&&!("sizes"in s);!function(){var b,c=function(){},d={prefix:"",postfix:"",srcAttr:"data-src",absUrl:!1,modifyOptions:c,widthmap:{}};i=a.lazySizes&&lazySizes.cfg||a.lazySizesConfig,i||(i={},a.lazySizesConfig=i),i.supportsType||(i.supportsType=function(a){return!a}),i.rias||(i.rias={}),j=i.rias,"widths"in j||(j.widths=[],function(a){for(var b,c=0;!b||3e3>b;)c+=5,c>30&&(c+=1),b=36*c,a.push(b)}(j.widths));for(b in d)b in j||(j[b]=d[b])}(),addEventListener("lazybeforeunveil",function(a){var b,c,d,e,k,l,m,o,p,r,s,t,v;if(b=a.target,!a.defaultPrevented&&!j.disabled&&(p=b.getAttribute(i.sizesAttr)||b.getAttribute("sizes"))&&q.test(p)){if(c=h(b),d=g(b,c),s=n.test(d.prefix)||n.test(d.postfix),d.isPicture&&(e=b.parentNode))for(k=e.getElementsByTagName("source"),l=0,m=k.length;m>l;l++)(s||n.test(o=h(k[l])))&&(f(o,d,k[l]),t=!0);s||n.test(c)?(f(c,d,b),t=!0):t&&(v=[],v.srcset=[],v.isPicture=!0,Object.defineProperty(b,"_lazyrias",{value:v,writable:!0})),t&&"auto"!=p&&(r={width:parseInt(p,10)},u({target:b,detail:r,details:r}))}});var u=function(){var c=function(a,b){return a.w-b.w},d=function(a){var b,c,d=a.length,e=a[d-1],f=0;for(f;d>f;f++)if(e=a[f],e.d=e.w/a.w,e.d>=a.d){!e.cached&&(b=a[f-1])&&b.d>a.d-.13*Math.pow(a.d,2.2)&&(c=Math.pow(b.d-.6,1.6),b.cached&&(b.d+=.15*c),b.d+(e.d-a.d)*c>a.d&&(e=b));break}return e},e=function(a,b){var c;return!a._lazyrias&&lazySizes.pWS&&(c=lazySizes.pWS(a.getAttribute(i.srcsetAttr||""))).length&&(Object.defineProperty(a,"_lazyrias",{value:c,writable:!0}),b&&a.parentNode&&(c.isPicture="PICTURE"==a.parentNode.nodeName.toUpperCase())),a._lazyrias},f=function(b){var c=a.devicePixelRatio||1,d=lazySizes.getX&&lazySizes.getX(b);return Math.min(d||c,2.5,c)},g=function(b,g){var h,i,j,k,l,m;if(l=b._lazyrias,l.isPicture&&a.matchMedia)for(i=0,h=b.parentNode.getElementsByTagName("source"),j=h.length;j>i;i++)if(e(h[i])&&!h[i].getAttribute("type")&&(!(k=h[i].getAttribute("media"))||(matchMedia(k)||{}).matches)){l=h[i]._lazyrias;break}return(!l.w||l.w<g)&&(l.w=g,l.d=f(b),m=d(l.sort(c))),m},h=function(c){var d,f=c.target;return a.HTMLPictureElement||a.respimage||a.picturefill||lazySizesConfig.pf?void b.removeEventListener("lazybeforesizes",h):void(("_lazyrias"in f||c.detail.dataAttr&&e(f,!0))&&(d=g(f,c.detail.width),d&&d.u&&f._lazyrias.cur!=d.u&&(f._lazyrias.cur=d.u,d.cached=!0,f.setAttribute(i.srcAttr,d.u),f.setAttribute("src",d.u))))};return b.addEventListener("lazybeforesizes",h),h}()}}(window,document);

/*! lazysizes - v1.1.4-rc1 */
!function(a,b,c){if(a.addEventListener){var d,e=/^picture$/i,f=b.documentElement,g=function(){var a,b=/(([^,\s].[^\s]+)\s+(\d+)(w|h)(\s+(\d+)(w|h))?)/g,c=function(b,c,d,e,f,g,h,i){a.push({c:c,u:d,w:1*("w"==i?h:e)})};return function(d){return a=[],d.replace(b,c),a}}(),h=function(){var a=function(a,b){return a.w-b.w},b=function(b,c){var d={srcset:b.getAttribute(lazySizes.cfg.srcsetAttr)||""},e=g(d.srcset);return Object.defineProperty(b,c,{value:d,writable:!0}),d.cands=e,d.index=0,d.dirty=!1,e[0]&&e[0].w?(e.sort(a),d.cSrcset=[e[d.index].c]):(d.cSrcset=d.srcset?[d.srcset]:[],d.cands=[]),d};return function(a,c){var d,f,g,h;if(!a[c]&&(h=a.parentNode||{},a[c]=b(a,c),a[c].isImg=!0,e.test(h.nodeName||"")))for(a[c].picture=!0,d=h.getElementsByTagName("source"),f=0,g=d.length;g>f;f++)b(d[f],c).isImg=!1;return a[c]}}(),i={_lazyOptimumx:function(){var a=function(a,b,c){var d,e;return a&&a.w?a.w>c?!1:(d=1-a.w/c,e=b/c-1,0>e-d):!0};return function(b,c){var d,e;for(d=b.index+1;d<b.cands.length&&(e=b.cands[d],e.w<=c||a(b.cands[d-1],e.w,c));d++)b.cSrcset.push(e.c),b.index=d}}()},j=function(){var a=function(a,b,c,d){var e,f=a[d];f&&(e=f.index,i[d](f,b),f.dirty&&e==f.index||(f.cSrcset.join(", "),a.setAttribute(c,f.cSrcset.join(", ")),f.dirty=!0))};return function(b,c,d,e){var f,g,h,i,j=b[e];if(j.width=c,j.picture&&(g=b.parentNode))for(f=g.getElementsByTagName("source"),i=0,h=f.length;h>i;i++)a(f[i],c,d,e);a(b,c,d,e)}}(),k=function(a){var b=a.getAttribute("data-optimumx")||a.getAttribute("data-maxdpr");return b&&(b="auto"==b?d.getOptimumX(a):parseFloat(b,10)),b},l=function(){a.lazySizes&&!a.lazySizes.getOptimumX&&(lazySizes.getX=k,lazySizes.pWS=g,f.removeEventListener("lazybeforeunveil",l))};f.addEventListener("lazybeforeunveil",l),setTimeout(l),d=a.lazySizes&&lazySizes.cfg||a.lazySizesConfig,d||(d={},a.lazySizesConfig=d),"function"!=typeof d.getOptimumX&&(d.getOptimumX=function(){var b=a.devicePixelRatio||1;return b>2.4?b*=.7:b>1.9&&(b*=.85),Math.min(Math.round(100*b)/100,2.2)}),a.devicePixelRatio&&(addEventListener("lazybeforesizes",function(a){var b,c,d,e;a.defaultPrevented||!(b=k(a.target))||b>=devicePixelRatio||(c=h(a.target,"_lazyOptimumx"),d=a.detail.width*b,d&&(c.width||0)<d&&(e=a.detail.dataAttr?lazySizes.cfg.srcsetAttr:"srcset",j(a.target,d,e,"_lazyOptimumx")))}),addEventListener("lazybeforeunveil",function(a){a.target._lazyOptimumx&&(a.target._lazyOptimumx=null)}))}}(window,document);


/*! lazysizes - v1.1.5 */
!function(a,b){function c(a,c){if(!e[a]){var d=b.createElement(c?"link":"script"),f=b.getElementsByTagName("script")[0];c?(d.rel="stylesheet",d.href=a):d.src=a,e[a]=!0,e[d.src||d.href]=!0,f.parentNode.insertBefore(d,f)}}var d,e={};b.addEventListener&&(d=function(a,c){var d=b.createElement("img");d.onload=function(){d.onload=null,d.onerror=null,d=null,c()},d.onerror=d.onload,d.src=a,d&&d.complete&&d.onload&&d.onload()},addEventListener("lazybeforeunveil",function(b){var e,f,g,h;b.defaultPrevented||("none"==b.target.preload&&(b.target.preload="auto"),e=b.target.getAttribute("data-link"),e&&c(e,!0),e=b.target.getAttribute("data-script"),e&&c(e),e=b.target.getAttribute("data-require"),e&&a.require&&require([e]),g=b.target.getAttribute("data-bg"),g&&(b.detail.firesLoad=!0,f=function(){b.target.style.backgroundImage="url("+g+")",b.detail.firesLoad=!1,lazySizes.fire(b.target,"_lazyloaded",{},!0,!0)},d(g,f)),h=b.target.getAttribute("data-poster"),h&&(b.detail.firesLoad=!0,f=function(){b.target.poster=h,b.detail.firesLoad=!1,lazySizes.fire(b.target,"_lazyloaded",{},!0,!0)},d(h,f)))},!1))}(window,document);


/*! lazysizes - v1.1.5 */
!function(a,b,c){var d,e=a.lazySizes&&lazySizes.cfg||a.lazySizesConfig;e||(e={},a.lazySizesConfig=e),e.supportsType||(e.supportsType=function(a){return!a}),a.picturefill||a.respimage||e.pf||(e.pf=function(b){var c,e;if(!a.picturefill&&!a.respimage)for(c=0,e=b.elements.length;e>c;c++)d(b.elements[c])},d=function(){var c=function(a,b){return a.w-b.w},f=/^\s*\d+px\s*$/,g=function(a){var b,c,d=a.length,e=a[d-1],f=0;for(f;d>f;f++)if(e=a[f],e.d=e.w/a.w,e.d>=a.d){!e.cached&&(b=a[f-1])&&b.d>a.d-.13*Math.pow(a.d,2.2)&&(c=Math.pow(b.d-.6,1.6),b.cached&&(b.d+=.15*c),b.d+(e.d-a.d)*c>a.d&&(e=b));break}return e},h=function(){var a,b=/(([^,\s].[^\s]+)\s+(\d+)w)/g,c=/\s+\d+h/g,d=/\s/,e=function(b,c,d,e){a.push({c:c,u:d,w:1*e})};return function(f){return a=[],f=f.trim(),f.replace(c,"").replace(b,e),a.length||!f||d.test(f)||a.push({c:f,u:f,w:99}),a}}(),i=function(){i.init||(i.init=!0,addEventListener("resize",function(){var a,c=b.getElementsByClassName("lazymatchmedia"),e=function(){var a,b;for(a=0,b=c.length;b>a;a++)d(c[a])};return function(){clearTimeout(a),a=setTimeout(e,66)}}()))},j=function(b,c){var d,f=b.getAttribute("srcset")||b.getAttribute(e.srcsetAttr);!f&&c&&(f=b._lazypolyfill?b._lazypolyfill._set:b.getAttribute("src")||b.getAttribute(e.srcAttr)),b._lazypolyfill&&b._lazypolyfill._set==f||(d=h(f||""),c&&b.parentNode&&(d.isPicture="PICTURE"==b.parentNode.nodeName.toUpperCase(),d.isPicture&&"auto"!=b.getAttribute(e.sizesAttr)&&(a.matchMedia||a.Modernizr&&Modernizr.mq)&&(lazySizes.aC(b,"lazymatchmedia"),i())),d._set=f,Object.defineProperty(b,"_lazypolyfill",{value:d,writable:!0}))},k=function(b){var c=a.devicePixelRatio||1,d=lazySizes.getX&&lazySizes.getX(b);return Math.min(d||c,2.5,c)},l=function(b){return a.matchMedia?(l=function(a){return!a||(matchMedia(a)||{}).matches})(b):a.Modernizr&&Modernizr.mq?!b||Modernizr.mq(b):!b},m=function(a){var b,d,h,i,m,n,o;if(i=a,j(i,!0),m=i._lazypolyfill,m.isPicture)for(d=0,b=a.parentNode.getElementsByTagName("source"),h=b.length;h>d;d++)if(e.supportsType(b[d].getAttribute("type"),a)&&l(b[d].getAttribute("media"))){i=b[d],j(i),m=i._lazypolyfill;break}return m.length>1?(o=i.getAttribute("sizes")||"",o=f.test(o)&&parseInt(o,10)||lazySizes.gW(a,a.parentNode),m.d=k(a),(!m.w||m.w<o)&&(m.w=o,n=g(m.sort(c)))):n=m[0],n},n=function(a){var b=m(a);b&&b.u&&a._lazypolyfill.cur!=b.u&&(a._lazypolyfill.cur=b.u,b.cached=!0,a.setAttribute(e.srcAttr,b.u),a.setAttribute("src",b.u))};return n.parse=h,n}(),a.HTMLPictureElement||e.loadedClass&&e.loadingClass&&!function(){var a=[];['img[sizes$="px"][srcset].',"picture > img:not([srcset])."].forEach(function(b){a.push(b+e.loadedClass),a.push(b+e.loadingClass)}),e.pf({elements:b.querySelectorAll(a.join(", "))})}())}(window,document),function(a){var b,c=a.createElement("img");"srcset"in c&&!("sizes"in c)&&(b=/^picture$/i,a.addEventListener("lazybeforeunveil",function(c){var d,e,f,g,h,i,j;!c.defaultPrevented&&!lazySizesConfig.noIOSFix&&(d=c.target)&&(f=d.getAttribute(lazySizesConfig.srcsetAttr))&&(e=d.parentNode)&&((h=b.test(e.nodeName||""))||(g=d.getAttribute("sizes")||d.getAttribute(lazySizesConfig.sizesAttr)))&&(i=h?e:a.createElement("picture"),d._lazyImgSrc||Object.defineProperty(d,"_lazyImgSrc",{value:a.createElement("source"),writable:!0}),j=d._lazyImgSrc,g&&j.setAttribute("sizes",g),j.setAttribute(lazySizesConfig.srcsetAttr,f),d.setAttribute("data-pfsrcset",f),d.removeAttribute(lazySizesConfig.srcsetAttr),h||(e.insertBefore(i,d),i.appendChild(d)),i.insertBefore(j,d))}))}(document);


/*! lazysizes - v1.1.5 */
!function(a,b){if(a.addEventListener){var c=/\s+(\d+)(w|h)\s+(\d+)(w|h)/,d=/^picture$/i,e={getFit:function(a){var b={fit:a.getAttribute("data-parent-fit")};return b.fit?(b.parent=a.parentNode,b.parent&&d.test(b.parent.nodeName||"")&&(b.parent=b.parent.parentNode)):b.fit=(getComputedStyle(a)||{getPropertyValue:function(){}}).getPropertyValue("object-fit"),b},getImageRatio:function(b){var e,f,g,h={},i=b.parentNode,j=i&&d.test(i.nodeName||"")?i.querySelectorAll("source, img"):[b];for(e=0;e<j.length;e++)if(b=j[e],f=b.getAttribute(lazySizesConfig.srcsetAttr)||b.getAttribute("srcset")||b.getAttribute("data-pfsrcset")||b.getAttribute("data-risrcset")||"",g=b.getAttribute("media"),g=lazySizesConfig.customMedia[b.getAttribute("data-media")||g]||g,f&&(!g||(a.matchMedia&&matchMedia(g)||{}).matches)){f.match(c)&&("w"==RegExp.$2?(h.w=RegExp.$1,h.h=RegExp.$3):(h.w=RegExp.$3,h.h=RegExp.$1));break}return h.w/h.h},calculateSize:function(a,b){var c,d,e,f,g=this.getFit(a),h=g.fit,i=g.parent;return"width"==h||("contain"==h||"cover"==h)&&(e=this.getImageRatio(a))?(i?b=i.offsetWidth:i=a,f=b,"width"==h?f=b:(d=i.offsetHeight,d>40&&(c=b/d)&&("cover"==h&&e>c||"contain"==h&&c>e)&&(f=b*(e/c))),f):b}},f=function(){a.lazySizes&&(lazySizes.parentFit||(lazySizes.parentFit=e),a.removeEventListener("lazybeforeunveil",f,!0))};a.addEventListener("lazybeforeunveil",f,!0),b.addEventListener("lazybeforesizes",function(a){a.defaultPrevented||(a.detail.width=e.calculateSize(a.target,a.detail.width))}),setTimeout(f)}}(window,document);


/*! lazysizes - v1.1.5 */
!function(){if(window.addEventListener){var a=/\s*\|\s+|\s+\|\s*/g,b=/^(.+?)(?:\s+\[\s*(.+?)\s*\])?$/,c={contain:1,cover:1},d=function(a){var b=lazySizes.gW(a,a.parentNode);return(!a._lazysizesWidth||b>a._lazysizesWidth)&&(a._lazysizesWidth=b),a._lazysizesWidth},e=function(d,e,f){var g=document.createElement("picture"),h=e.getAttribute(lazySizesConfig.sizesAttr),i=e.getAttribute("data-optimumx"),j=(getComputedStyle(e)||{getPropertyValue:function(){}}).getPropertyValue("background-size");!c[j]||"auto"!=h&&h||(f.setAttribute("data-parent-fit",j),h="auto"),e._lazybgset&&e._lazybgset.parentNode==e&&e.removeChild(e._lazybgset),Object.defineProperty(f,"_lazybgset",{value:e,writable:!0}),Object.defineProperty(e,"_lazybgset",{value:g,writable:!0}),d=d.split(a),g.style.display="none",f.className=lazySizesConfig.lazyClass,1!=d.length||h||(h="auto"),d.forEach(function(a){var c=document.createElement("source");h&&"auto"!=h&&c.setAttribute("sizes",h),a.match(b)&&(c.setAttribute(lazySizesConfig.srcsetAttr,RegExp.$1),RegExp.$2&&c.setAttribute("media",lazySizesConfig.customMedia[RegExp.$2]||RegExp.$2)),g.appendChild(c)}),h&&(f.setAttribute(lazySizesConfig.sizesAttr,h),e.removeAttribute(lazySizesConfig.sizesAttr),e.removeAttribute("sizes")),i&&f.setAttribute("data-optimumx",i),g.appendChild(f),e.appendChild(g)},f=function(a){if(a.target._lazybgset){var b=a.target,c=b._lazybgset,d=b.currentSrc||b.src;d&&(c.style.backgroundImage="url("+d+")"),b._lazybgsetLoading&&(lazySizes.fire(c,"_lazyloaded",{},!1,!0),delete b._lazybgsetLoading)}};addEventListener("lazybeforeunveil",function(a){var b,c,d;!a.defaultPrevented&&(b=a.target.getAttribute("data-bgset"))&&(d=a.target,c=document.createElement("img"),c._lazybgsetLoading=!0,a.detail.firesLoad=!0,e(b,d,c),lazySizes.loader.unveil(c),lazySizes.fire(c,"_lazyloaded",{},!0,!0),setTimeout(function(){c.complete&&f({target:c})}))}),document.addEventListener("load",f,!0),document.documentElement.addEventListener("lazybeforesizes",function(a){!a.defaultPrevented&&a.target._lazybgset&&(a.detail.width=d(a.target._lazybgset))})}}();


/*! lazysizes - v1.1.5 */
!function(a,b){function c(){this.ratioElems=b.getElementsByClassName("lazyaspectratio"),this._setupEvents(),this.processImages()}if(a.addEventListener){var d,e,f,g=Array.prototype.forEach,h=/^picture$/i,i="data-aspectratio",j="img["+i+"]",k=function(b){return a.matchMedia?(k=function(a){return!a||(matchMedia(a)||{}).matches})(b):a.Modernizr&&Modernizr.mq?!b||Modernizr.mq(b):!b},l=function(b,c){f?f(b).addClass(c):a.lazySizes?lazySizes.aC(b,c):b.classList.add(c)},m=function(b,c){f?f(b).removeClass(c):a.lazySizes?lazySizes.rC(b,c):b.classList.remove(c)};c.prototype={_setupEvents:function(){var a=this,c=function(b){b.naturalWidth<36?a.addAspectRatio(b,!0):a.removeAspectRatio(b,!0)},d=function(){a.processImages()};b.addEventListener("load",function(a){a.target.getAttribute&&a.target.getAttribute(i)&&c(a.target)},!0),addEventListener("resize",function(){var b,d=function(){g.call(a.ratioElems,c)};return function(){clearTimeout(b),b=setTimeout(d,99)}}()),b.addEventListener("DOMContentLoaded",d),addEventListener("load",d)},processImages:function(a){var c,d;a||(a=b),c="length"in a&&!a.nodeName?a:a.querySelectorAll(j);for(d=0;d<c.length;d++)c[d].naturalWidth>36?this.removeAspectRatio(c[d]):this.addAspectRatio(c[d])},getSelectedRatio:function(b){var c,d,e,f,g,j=b.parentNode;if(j&&h.test(j.nodeName||""))for(e=j.getElementsByTagName("source"),c=0,d=e.length;d>c;c++)if(f=e[c].getAttribute("data-media")||e[c].getAttribute("media"),a.lazySizesConfig&&lazySizesConfig.customMedia[f]&&(f=lazySizesConfig.customMedia[f]),k(f)){g=e[c].getAttribute(i);break}return g||b.getAttribute(i)||""},parseRatio:function(){var a=/^\s*([+\d\.]+)(\s*[\/x]\s*([+\d\.]+))?\s*$/,b={};return function(c){return!b[c]&&c.match(a)&&(RegExp.$3?b[c]=RegExp.$1/RegExp.$3:b[c]=1*RegExp.$1),b[c]}}(),addAspectRatio:function(b,c){var d,e=b.offsetWidth,f=b.offsetHeight;return c||l(b,"lazyaspectratio"),36>e&&0>=f?void((e||f&&a.console)&&console.log("Define width or height of image, so we can calculate the other dimension")):(d=this.getSelectedRatio(b),d=this.parseRatio(d),void(d&&(e?b.style.height=e/d+"px":b.style.width=f*d+"px")))},removeAspectRatio:function(a){m(a,"lazyaspectratio"),a.style.height="",a.style.width="",a.removeAttribute(i)}},e=function(){f=a.jQuery||a.Zepto||a.shoestring||a.$,f&&f.fn&&!f.fn.imageRatio&&f.fn.filter&&f.fn.add&&f.fn.find?f.fn.imageRatio=function(){return d.processImages(this.find(j).add(this.filter(j))),this}:f=!1},e(),setTimeout(e),d=new c,a.imageRatio=d,"object"==typeof module&&module.exports?module.exports=d:"function"==typeof define&&define.amd&&define(d)}}(window,document);

/*! lazysizes - v1.2.3-rc1 */
!function(a,b){if(a.addEventListener){var c=/\s+(\d+)(w|h)\s+(\d+)(w|h)/,d=/^picture$/i,e={getFit:function(a){var b={fit:a.getAttribute("data-parent-fit")};return b.fit?(b.parent=a.parentNode,b.parent&&d.test(b.parent.nodeName||"")&&(b.parent=b.parent.parentNode)):b.fit=(getComputedStyle(a)||{getPropertyValue:function(){}}).getPropertyValue("object-fit"),b},getImageRatio:function(b){var e,f,g,h={},i=b.parentNode,j=i&&d.test(i.nodeName||"")?i.querySelectorAll("source, img"):[b];for(e=0;e<j.length;e++)if(b=j[e],f=b.getAttribute(lazySizesConfig.srcsetAttr)||b.getAttribute("srcset")||b.getAttribute("data-pfsrcset")||b.getAttribute("data-risrcset")||"",g=b.getAttribute("media"),g=lazySizesConfig.customMedia[b.getAttribute("data-media")||g]||g,f&&(!g||(a.matchMedia&&matchMedia(g)||{}).matches)){f.match(c)&&("w"==RegExp.$2?(h.w=RegExp.$1,h.h=RegExp.$3):(h.w=RegExp.$3,h.h=RegExp.$1));break}return h.w/h.h},calculateSize:function(a,b){var c,d,e,f,g=this.getFit(a),h=g.fit,i=g.parent;return"width"==h||("contain"==h||"cover"==h)&&(e=this.getImageRatio(a))?(i?b=i.offsetWidth:i=a,f=b,"width"==h?f=b:(d=i.offsetHeight,d>40&&(c=b/d)&&("cover"==h&&e>c||"contain"==h&&c>e)&&(f=b*(e/c))),f):b}},f=function(){a.lazySizes&&(lazySizes.parentFit||(lazySizes.parentFit=e),a.removeEventListener("lazybeforeunveil",f,!0))};a.addEventListener("lazybeforeunveil",f,!0),b.addEventListener("lazybeforesizes",function(a){a.defaultPrevented||(a.detail.width=e.calculateSize(a.target,a.detail.width))}),setTimeout(f)}}(window,document);
define("vendor/jquery/lazysizes-custom.min", function(){});
