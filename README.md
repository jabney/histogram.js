# histogram.js
A discrete histogram object for recording the frequencies of its entries. `histogram` is a bit like a set (see [containers.js](http://github.com/jabney/containers.js)), in that it stores unique items. However it records how often an item was entered.

```javascript
// Create a histogram.
var hist = containers.histogram()
  .add('a', 'b', 'b', 'c', 'c', 'c');

// Return the items in the histogram.
hist.items(); // => ['a', 'b', 'c']

// Return the frequencies in the histogram.
hist.frequencies(); // => [1, 2, 3]

// Return an individual frequency.
hist.frequency('a'); // => 1
hist.frequency('b'); // => 2
hist.frequency('c'); // => 3

```

`histogram`'s data store doesn't tend to get very large, because it only stores unique items and their frequencies. 

```javascript
// Specify a string.
var string = 'We hold these truths to be self-evident, that all men are created equal, \
that they are endowed by their Creator with certain unalienable Rights, that among \
these are Life, Liberty and the pursuit of Happiness.';

// Create a histogram.
var hist = containers.histogram()
  .addStringChars(string.toLowerCase());

// Return the number of characters stored in the histogram.
hist.size(); // => 26

// Return the number of characters in the added string.
hist.total(); // => 209
string.length; // => 209

// Ratio of stored characters to string characters:
// 0.1244 (around 12%)

```

##Contents
+ [Usage](#usage)
+ [Inteface](#interface)


##Usage

Load the script.

```html
<script type="text/javascript" src="histogram.js"></script>
```

Create a histogram.

```javascript
var hist = containers.histogram();

// Add some items.
hist.add('a', 'b', 'b', 'c', 'c', 'c');

// Iterate the histogram.
hist.each(function(item, freq) {
    console.log(item, freq); // => 'a' 1, 'b' 2, 'c' 3
});

```

##Interface

