var fs = require('fs');
var exml = require('../lib/exml');

var parser = new exml.Parser();

var name = null;
var contacts = [];

parser.on('address-book', function(attributes) {
    name = attributes.name;

    parser.on('contact', function(attributes) {
        var contact = {};
        parser.on('first-name', '$content', exml.assign(contact, 'firstName'));
        parser.on('last-name', '$content', exml.assign(contact, 'lastName'));
        parser.on('address', '$content', exml.assign(contact, 'address'));

        contacts.push(contact);
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