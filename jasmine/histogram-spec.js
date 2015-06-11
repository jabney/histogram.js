/*
    containers-spec.js

    Unit tests for containers.js

    Author: James Abney
*/

(function(containers) {
'use strict';

// Return a random number or an array of random numbers.
function rand(min, max, count) {
  var r , i;
  if (count !== undefined) {
    r = [];
    for (i = 0; i < count; i++)
      r.push(Math.floor(Math.random() * (max-min)) + min);
    return r;
  }
  return Math.floor(Math.random() * (max-min)) + min;
}

describe('Histogram', function() {
    var
    o1 = {id: 'id1', toString: toStr},
    o2 = {id: 'id2', toString: toStr},
    o3 = {id: 'id3', toString: toStr},
    o4 = {id: 'id4', toString: toStr},
    objects = [o1, o2, o3, o4];

    // The toString method for objects.
    function toStr() {
        return this.id;
    }

    beforeEach(function() {
        this.hist = containers.histogram();
    });

    it('stores unique items and their frequencies', function() {
        this.hist.add(1, 2, 2, 3, 3, 3);
        expect(this.hist.size()).toEqual(3);
        expect(this.hist.has(1)).toBe(true);
        expect(this.hist.has(2)).toBe(true);
        expect(this.hist.has(3)).toBe(true);
        expect(this.hist.has(4)).toBe(false);
        expect(this.hist.has('1')).toBe(false);
        expect(this.hist.frequency(1)).toEqual(1);
        expect(this.hist.frequency(2)).toEqual(2);
        expect(this.hist.frequency(3)).toEqual(3);
        expect(this.hist.frequency(4)).toEqual(0);

        this.hist.items(['a', 'b', 'b', 'c', 'c', 'c']);
        expect(this.hist.size()).toEqual(3);
        expect(this.hist.has('a')).toBe(true);
        expect(this.hist.has('b')).toBe(true);
        expect(this.hist.has('c')).toBe(true);
        expect(this.hist.has('z')).toBe(false);
        expect(this.hist.frequency('a')).toEqual(1);
        expect(this.hist.frequency('b')).toEqual(2);
        expect(this.hist.frequency('c')).toEqual(3);
        expect(this.hist.frequency('z')).toEqual(0);

        this.hist.items([o1, o2, o2, o3, o3, o3]);
        expect(this.hist.size()).toEqual(3);
        expect(this.hist.has(o1)).toBe(true);
        expect(this.hist.has(o2)).toBe(true);
        expect(this.hist.has(o3)).toBe(true);
        expect(this.hist.has([])).toBe(false);
        expect(this.hist.has({})).toBe(false);
        expect(this.hist.frequency(o1)).toEqual(1);
        expect(this.hist.frequency(o2)).toEqual(2);
        expect(this.hist.frequency(o3)).toEqual(3);
        expect(this.hist.frequency([])).toEqual(0);
        expect(this.hist.frequency({})).toEqual(0);
    });

    it('adds, decrements, and removes items', function() {
        this.hist.add(1, 2, 2, 3, 3, 3);
        expect(this.hist.has(1)).toBe(true);
        expect(this.hist.has(2)).toBe(true);
        expect(this.hist.has(3)).toBe(true);
        this.hist.remove(1, 2, 3);
        expect(this.hist.frequency(1)).toEqual(0);
        expect(this.hist.frequency(2)).toEqual(1);
        expect(this.hist.frequency(3)).toEqual(2);
    });

    it('optionally adds strings as a series of characters', function() {
        this.hist.addStringChars('abc', 'abc', 'def');
        expect(this.hist.size()).toEqual(6);
        expect(this.hist.frequency('a')).toEqual(2);
        expect(this.hist.frequency('b')).toEqual(2);
        expect(this.hist.frequency('c')).toEqual(2);
        expect(this.hist.frequency('d')).toEqual(1);
        expect(this.hist.frequency('e')).toEqual(1);
        expect(this.hist.frequency('f')).toEqual(1);
    });

    it('reports histogram size', function() {
        expect(this.hist.size()).toEqual(0);
        this.hist.add(1);
        expect(this.hist.size()).toEqual(1);
        this.hist.add(2, 3, 3, 4);
        expect(this.hist.size()).toEqual(4);
        this.hist.remove(3);
        expect(this.hist.size()).toEqual(4);
        this.hist.remove(1, 2, 3, 4);
        expect(this.hist.size()).toEqual(0);
    });

    it('clears individual entries or the entire histogram', function() {
        this.hist.add('a', 'b', 'b', 'c', 'c', 'c');
        this.hist.clear('c');
        expect(this.hist.size()).toEqual(2);
        expect(this.hist.has('a')).toBe(true);
        expect(this.hist.has('b')).toBe(true);
        expect(this.hist.has('c')).toBe(false);
        this.hist.clear();
        expect(this.hist.size()).toEqual(0);
        expect(this.hist.has('a')).toBe(false);
        expect(this.hist.has('b')).toBe(false);
    });

    it('reports if the histogram contains an item', function() {
        this.hist.add('aye', 'bee', 'see');
        expect(this.hist.has('aye')).toBe(true);
        expect(this.hist.has('bee')).toBe(true);
        expect(this.hist.has('see')).toBe(true);
        expect(this.hist.has('a')).toBe(false);
        expect(this.hist.has('b')).toBe(false);
        expect(this.hist.has('c')).toBe(false);

        this.hist.items([0, null, undefined]);
        expect(this.hist.size()).toBe(2);
        expect(this.hist.has(0)).toBe(true);
        expect(this.hist.has(null)).toBe(true);
        expect(this.hist.has(undefined)).toBe(false);
    });

    it('iterates the histogram', function() {
        var items = [1, 2, 3],
        keys = ['(1:3)', '(2:3)', '(3:3)'];
        this.hist.items(items);
        this.hist.each(function(value, freq, key) {
            expect(items.indexOf(value)).toBeGreaterThan(-1);
            expect(freq).toEqual(1);
            expect(keys.indexOf(key)).toBeGreaterThan(-1);
        });
    });

    it('copies the histogram', function() {
        this.hist.add(6, 4, 2);
        var b = this.hist.copy();
        expect(this.hist).not.toBe(b);
        expect(this.hist.items().sort()).toEqual([2, 4, 6]);
        expect(this.hist.keys()).toEqual(b.keys());
    });

    it('supports objects, strings, and numbers mixed together', function() {
        this.hist.add(1, '1', o1, 2, '2', o2, 3, '3', o3);
        expect(this.hist.size()).toEqual(9);
        expect(this.hist.has(1)).toBe(true);
        expect(this.hist.has(2)).toBe(true);
        expect(this.hist.has(3)).toBe(true);
        expect(this.hist.has('1')).toBe(true);
        expect(this.hist.has('2')).toBe(true);
        expect(this.hist.has('3')).toBe(true);
        expect(this.hist.has(o1)).toBe(true);
        expect(this.hist.has(o2)).toBe(true);
        expect(this.hist.has(o3)).toBe(true);
    });

    it('can have its key method overriddeen', function() {
        function key() { return this.id; };
        this.hist.key(key).items(objects);
        expect(this.hist.key()).toBe(key);
        expect(this.hist.size()).toEqual(4);
        expect(this.hist.has(o1)).toBe(true);
        expect(this.hist.has(o2)).toBe(true);
        expect(this.hist.has(o3)).toBe(true);
        expect(this.hist.has(o4)).toBe(true);
        expect(this.hist.has({})).toBe(false);
    });

    it('returns histogram keys in sorted order', function() {
        this.hist.add(1, 4, 3, 2);
        expect(this.hist.keys()).toEqual(['(1:3)', '(2:3)', '(3:3)', '(4:3)']);
    });

    it('returns a list of the histogram\'s frequencies', function() {
        this.hist.add(1, 2, 2, 3, 3, 3, 4, 4, 4, 4);
        expect(this.hist.frequencies().sort()).toEqual([1, 2, 3, 4]);
    });

    it('returns a list of item/frequency pairs', function() {
        this.hist.add('a', 'a', 'a', 'b', 'b', 'c');
        expect(this.hist.pairs().sort()).toEqual([['a', 3], ['b', 2], ['c', 1]]);
    });

    it('returns a sorted list of item/frequency pairs', function() {
        this.hist.add('a', 'a', 'a', 'b', 'b', 'c');
        expect(this.hist.sortedPairs()).toEqual([['c', 1], ['b', 2], ['a', 3]]);
    });

    it('converts a frequency to an items list', function() {
        this.hist.add(1, 2, 2, 3, 3, 3, 4);
        expect(this.hist.freqToItems(this.hist.min()).sort()).toEqual([1, 4]);
        expect(this.hist.freqToItems(this.hist.max())).toEqual([3]);
        expect(this.hist.freqToItems(2)).toEqual([2]);
    });

    it('gets and sets an array of items', function() {
        this.hist.items([1, 2, 2, 3, 3, 3]);
        expect(this.hist.size()).toEqual(3);
        expect(this.hist.items().sort()).toEqual([1, 2, 3])
    });

    xit('adds large arrays via items method', function() {
        var size = 2E5
        this.hist.items(rand(0, 1, size));
        expect(this.hist.size()).toEqual(1);
    });

    it('determines histogram equality', function() {
        var b = this.hist.copy();
        expect(this.hist.equals(this.hist)).toBe(true);
        expect(b.equals(b)).toBe(true);
        expect(this.hist.equals(b)).toBe(true);

        this.hist.add(o1, o2, o3);
        expect(this.hist.equals(this.hist)).toBe(true);
        expect(this.hist.equals(b)).toBe(false);

        b = this.hist.copy();
        expect(b.equals(b)).toBe(true);
        expect(this.hist.equals(b)).toBe(true);
        
        b.items([o1, o2, o4]);
        expect(this.hist.equals(b)).toBe(false);
        expect(b.equals(this.hist)).toBe(false);
        
        this.hist.items([1, 2, 3]);
        b.items([2, 3, 4]);
        expect(this.hist.equals(b)).toBe(false);
        expect(b.equals(this.hist)).toBe(false);
    });

    it('normalizes the histogram', function() {
        this.hist.add(1, 2, 2, 3, 3, 3);
        expect(this.hist.frequencies().sort()).toEqual([1, 2, 3]);
        this.hist.normalize();
        expect(this.hist.frequencies().sort()).toEqual([1, 1, 1]);
        this.hist.normalize(7);
        expect(this.hist.frequencies().sort()).toEqual([7, 7, 7]);
    });

    it('merges multiple histograms together', function() {
        var b = containers.histogram().add(1, 2, 2, 3, 3, 3);
        this.hist.merge(b);
        expect(this.hist.size()).toEqual(3);
        expect(this.hist.frequency(1)).toEqual(1);
        expect(this.hist.frequency(2)).toEqual(2);
        expect(this.hist.frequency(3)).toEqual(3);

        this.hist.clear();
        this.hist.merge(b, b, b);
        expect(this.hist.size()).toEqual(3);
        expect(this.hist.frequency(1)).toEqual(3);
        expect(this.hist.frequency(2)).toEqual(6);
        expect(this.hist.frequency(3)).toEqual(9);
    });

    it('reports min and max frequencies', function() {
        this.hist.add(1, 2, 2, 3, 3, 3);
        expect(this.hist.min()).toEqual(1);
        expect(this.hist.max()).toEqual(3);
    });

    it('reports frequency total', function() {
        this.hist.add(1, 2, 2, 3, 3, 3);
        expect(this.hist.total()).toEqual(6);
    });

    it('reports the average frequency value', function() {
        this.hist.add(1, 2, 2, 3, 3, 3);
        expect(this.hist.average()).toEqual(6/3) // total/size
    });

    it('reports the histogram\'s Shannon entropy in bits per symbol', function() {
        this.hist.add(1);
        expect(this.hist.entropy()).toEqual(0);

        this.hist.clear();
        this.hist.add(0, 1);
        expect(this.hist.entropy()).toEqual(1);
        
        this.hist.clear();
        this.hist.add(0, 1, 2, 3);
        expect(this.hist.entropy()).toEqual(2);
        
        this.hist.clear();
        this.hist.add(0, 1, 2, 3, 4, 5, 6, 7);
        expect(this.hist.entropy()).toEqual(3);
        
        this.hist.clear();
        this.hist.addStringChars('0123456789abcdef');
        expect(this.hist.entropy()).toEqual(4);
        
        this.hist.clear();
        this.hist.addStringChars('1223334444');
        expect(this.hist.entropy()).toEqual(1.8464393446710154);
    })
});

})(window.containers);

