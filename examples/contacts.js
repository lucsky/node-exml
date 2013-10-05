var fs = require('fs');
var exml = require('../lib/exml');

var parser = new exml.Parser();

var name = null;
var contacts = [];

parser.on('address-book', function(_, attributes) {
    name = attributes.name;

    parser.on('contact', function(_, attributes) {
        var contact = {};
        contacts.push(contact);

        parser.on('first-name', '$content', function(content) {
            contact.firstName = content;
        });
        parser.on('last-name', '$content', function(content) {
            contact.lastName = content;
        });
        parser.on('address', '$content', function(content) {
            contact.address = content;
        });
    });
});

fs.readFile('contacts.xml', function(err, data) {
    parser.end(data);
    console.log('Address book: ' + name);
    contacts.forEach(function(c) {
        console.log('- ' + c.firstName + ' ' + c.lastName );
        console.log('  ' + c.address);
    })
});