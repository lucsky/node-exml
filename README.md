# exml

The **exml** [node](http://nodejs.org/) module provides an intuitive event based XML parsing API which sits on top of a standard SAX parser, greatly simplifying the parsing code while retaining the raw speed and low memory overhead of the underlying SAX engine. The module takes care of the complex tasks of maintaining contexts between SAX event handlers allowing you to concentrate on dealing with the actual structure of the XML document.

# Installation

Using npm:

```npm install exml```

# Usage

The best way to illustrate how **exml** makes parsing very easy is to look at actual examples. Consider the following contrived sample document:

```xml
<?xml version="1.0"?>
<address-book name="homies">
    <contact>
        <first-name>Tim</first-name>
        <last-name>Cook</last-name>
        <address>Cupertino</address>
    </contact>
    <contact>
        <first-name>Steve</first-name>
        <last-name>Ballmer</last-name>
        <address>Redmond</address>
    </contact>
    <contact>
        <first-name>Mark</first-name>
        <last-name>Zuckerberg</last-name>
        <address>Menlo Park</address>
    </contact>
</address-book>
```

Here is a first way to parse it into an array of contact objects using **exml**:

```javascript
var exml = require('exml');

var contacts = [];
var parser = new exml.Parser();

parser.on('address-book', function() {
    parser.on('contact', function() {
        var contact = {};
        contacts.push(contact);

        parser.on('first-name', function() {
            parser.on('$text', function(text) {
                contact.firstName = text;
            });
        });

        parser.on('last-name', function() {
            parser.on('$text', function(text) {
                contact.lastName = text;
            });
        });

        parser.on('address', function() {
            parser.on('$text', function(text) {
                contact.address = text;
            });
        });
    });
});

parser.write(xmlData);
parser.end();

contacts.forEach(function(c) {
    console.log('- ' + c.firstName + ' ' + c.lastName );
    console.log('  ' + c.address);
});
```

To reduce the amount and depth of event callbacks that you have to write, **exml** provides **stacked events**. We are now going to re-write the previous example using stacked events:

```javascript
parser.on('address-book', 'contact', function() {
    var contact = {};
    contacts.push(contact);

    parser.on('first-name', '$text', function(text) {
        contact.firstName = text;
    });

    parser.on('last-name', '$text', function(text) {
        contact.lastName = text;
    });

    parser.on('address', '$text', function(text) {
        contact.address = text;
    });
});
```

Finally, since using nodes text content to initialize object properties is a pretty frequent task, **exml** provides a shortcut to make it shorter to write. Let's revisit the previous example and use this shortcut:

```javascript
parser.on('address-book', 'contact', function() {
    var contact = {};
    contacts.push(contact);

    parser.on('first-name', '$text', exml.assign(contact, 'firstName'));
    parser.on('last-name', '$text', exml.assign(contact, 'lastName'));
    parser.on('address', '$text', exml.assign(contact, 'address'));
});
```

# API

* ```Parser()```: constructor.
* ```parser.write(chunk)```: pass a chunk of xml data to the parser.
* ```parser.end([chunk])```: notify the parser that the xml data is complete, optionnaly passing a final chunk of data.
* ```parser.on(event, [event, ...], callback)```: register a handler for the specified (optioannly stacked) event.

# Events

* Any tag name: the events you are probably going to use the most take the form of the XML tag names you want to catch. Tag event callbacks receive an object containing the node attributes as a parameter.

* ```$text```: this custom event is sent when text content is encountered. The text data is passed as a parameter to the event handler callback.

* ```$cdata```: this custom event is sent when CDATA content is encountered. The CDATA content is passed as a parameter  to the event handler callback.

* ```$content```: this custom event is sent when a node full text and/or CDATA content has been accumulated. The content is passed as a parameter to the event handler callback.
