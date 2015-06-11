/*
    histogram.js
    MIT License © 2015 James Abney
    http://github.com/jabney

    A descrete histogram for recording object frequencies.

    See documentation at http://github.com/jabney/histogram.js
*/
(function(ex, undefined) {
'use strict';

// Export containers namespace.
var containers = ex.containers || (ex.containers = Object.create(null));

// containers.js version.
containers.histogram_version = '0.0.1';

// Shortcuts.

var
toString = Object.prototype.toString,
slice = Array.prototype.slice,

// Helpers.

// Return an object's built-in type via toString.
typeOf = function typeOf(obj) {
    return toString.call(obj).slice(8, -1);
},

// Encode an object's type as a number.
encodeType = (function() {
    var types = {
        'Undefined': 1,
        'Null':      2,
        'Number':    3,
        'Array':     4,
        'String':    5,
        'Object':    6,
        'Boolean':   7,
        'Function':  8,
        'Symbol':    9,
        'Date':      10,
        'Error':     11,
        'RegExp':    12,
        'Arguments': 13,
        'Math':      14,
        'JSON':      15
    };

    // Return a type code.
    function get(type) {
        // Return 0 for undefined types.
        return types[type] || 0;
    }

    // Return a numeric code corresponding to an object's type.
    return function encodeType(obj) {
        return get(typeOf(obj));
    }
})();

// ---------------------------------------------------------------
// Set - a container for unique items.
// ---------------------------------------------------------------
containers.histogram = function histogram() {
    var st = Object.create(null), _size = 0,

    // The default key function for items added to the histogram.
    _key = function() {
        return ''.concat('(', this, ':', encodeType(this), ')');
    };

    return {

    factory: histogram,

    // Get or set the key method for item key generation.
    key: function key(method) {
        if(method === undefined)
            return _key;
        _key = method;
        return this;
    },

    // Set or get an array of items for this histogram.
    items: function items(items_) {
        // Return a list of this histogram's items.
        if (items_ === undefined) {
            var list = [];
            this.each(function(item) {
                list.push(item);
            });
            return list;
        }
        // Replace the histogram with the supplied items.
        else {
            this.clear();
            items_.forEach(function(item) {
                this.add(item);
            }, this);
            return this;
        }
    },

    // Return an array of this histogram's frequencies.
    frequencies: function frequencies() {
        var freqs = [];
        this.each(function(item, freq) {
            freqs.push(freq);
        });
        return freqs;
    },

    // Return pairs of item/frequency.
    pairs: function pairs() {
        var list = [];
        this.each(function(item, freq) {
            list.push([item, freq]);
        });
        return list;
    },

    // Return an array of this histogram's keys.
    keys: function keys() {
        var list = [];
        this.each(function(item, freq, key) {
            list.push(key);
        });
        return list.sort();
    },

    // Add one or more items to the histogram.
    // If the item exists, increment its frequency.
    add: function add() {
        slice.call(arguments, 0).forEach(function(item) {
            if (item === undefined) return;
            var k = _key.call(item),
            obj = st[k];
            if (obj === undefined) {
                st[k] = {item: item, freq: 1};
                ++_size;
            } else {
                ++obj.freq;
            }
        });
        return this;
    },

    // Add one or more strings as a series of characters.
    addStringChars: function addStringChars() {
        slice.call(arguments, 0).forEach(function(string) {
            string.split('').forEach(function(c) {
                this.add(c);
            }, this)
        }, this);
        return this;
    },

    // Decrement the frequency of an item in the histogram.
    // If the frequency reaches zero, remove the item.
    remove: function remove() {
        slice.call(arguments, 0).forEach(function(item) {
            var k = _key.call(item),
            item = st[k];
            if (item !== undefined) {
                --item.freq;
                if (item.freq === 0) {
                    delete st[k];
                    --_size;
                }
            }
        });
        return this;
    },

    // Clear one or more items from the histogram, 
    // or clear all items from the histogram.
    clear: function clear() {
        if (!arguments.length) {
            // Clear the entire histogram.
            st = Object.create(null);
            _size = 0;
        } else {
            // Clear specified items from the histogram.
            slice.call(arguments, 0).forEach(function(item) {
                var k = _key.call(item);
                if (st[k] !== undefined) {
                    delete st[k];
                    --_size;
                }
            }, this);
        }
        return this;
    },

    // Set all frequencies to the same value (default: 1).
    normalize: function normalize(frequency) {
        var k, freq = frequency === undefined ? 1 : frequency;
        for (k in st)
            st[k].freq = freq;
    },

    // Merge one or more histograms into this one.
    merge: function merge() {
        slice.call(arguments, 0).forEach(function(hist) {
            hist.each(function(item, freq) {
                for (var i = 0; i < freq; i++)
                    this.add(item);
            }, this);
        }, this);
        return this;
    },

    // Return a copy of this histogram.
    copy: function copy() {
        return this.factory()
            .key(this.key())
            .items(this.items());
    },

    // Iterate over items in the histogram.
    each: function each(action, context) {
        var obj, k;
        for (k in st) {
            obj = st[k];
            action.call(context, obj.item, obj.freq, k);
        }
        return this;
    },

    // Return item/frequency pairs sorted low-to-high or custom.
    sortedPairs: function(sort) {
        var pairs = this.pairs();
        if (sort !== undefined)
            // Custom sort.
            pairs.sort(sort);
        else
            // Default: sort by frequency, low-to-high.
            pairs.sort(function(a, b) { return a[1] - b[1]; });
        return pairs;
    },

    // Return true if the histogram contains the item.
    has: function has(item) {
        return st[_key.call(item)] === undefined ? false : true;
    },

    // Return the item's frequency in the histogram.
    frequency: function frequency(item) {
        var obj = st[_key.call(item)];
        if (obj === undefined)
            return 0;
        return obj.freq;
    },

    // Return items that have the given frequency.
    freqToItems: function freqToItems(frequency) {
        var list = [];
        this.each(function(item, freq) {
            if (freq === frequency)
                list.push(item);
        });
        return list;
    },

    // Return the number of items in this histogram.
    size: function size() {
        return _size;
    },

    // Return the minimum frequency in the histogram.
    min: function min() {
        return Math.min.apply(null, this.frequencies());
    },

    // Return the maximum frequency in the histogram.
    max: function max() {
        return Math.max.apply(null, this.frequencies());
    },

    // Return the total sum of frequencies in the histogram.
    total: function total() {
        return this.frequencies().reduce(function(prev, curr) {
            return prev + curr;
        }, 0);
    },

    // Return the average value of frequencies in the histogram.
    average: function average() {
        return this.total() / this.size();
    },

    // Return true if b is equal to this histogram.
    equals: function equals(b) {
        var items, item, i;
        if (this !== b) {
            // Sets should be the same size.
            if (this.size() !== b.size())
                return false;
            // Sets should have the same items.
            items = this.items();
            for (i = 0; i < items.length; i++) {
                item = items[i];
                if (this.frequency(item) !== b.frequency(item))
                    return false;
            }
        }
        return true;
    },

    // Calculate the Shannon entropy of the histogram.
    entropy: function entropy() {
        var len = this.total(), sum = 0;
        this.each(function(item, freq) {
            var ratio = freq/len;
            sum -= ratio * Math.log(ratio) / Math.log(2);
        });
        return sum;
    },

    // Convert this histogram to a representative string implicitly.
    toString: function toString() {
        var entries = [];
        this.each(function(item, freq, key) {
            entries.push(''.concat(key, ':', freq));
        });
        return '{' + entries.sort().join(',') + '}';
    }};
};

})(typeof exports !== 'undefined' && exports || this);

