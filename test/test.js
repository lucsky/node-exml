var fs = require('fs');
var exml = require('../lib/exml');

var SIMPLE_XML = fs.readFileSync(__dirname + '/fixtures/simple.xml'),
    TEXT_XML = fs.readFileSync(__dirname + '/fixtures/text.xml');

module.exports.exml = {
    setUp: function(callback) {
        this.parser = new exml.Parser();
        callback();
    },

    'locale node events': function(test) {
        var parser = this.parser;
        parser.on('root', function(name, attributes) {
            test.equal(name, 'root');
            test.equal(attributes.attr1, 'root.attr1');
            test.equal(attributes.attr2, 'root.attr2');
            var nodeIndex = 1;
            parser.on('node', function(name, attributes) {
                test.equal(name, 'node');
                test.equal(attributes.attr1, 'node' + nodeIndex + '.attr1');
                test.equal(attributes.attr2, 'node' + nodeIndex + '.attr2');
                nodeIndex++;
            });
        });

        parser.end(SIMPLE_XML);
        test.done();
    },

    'stacked node events': function(test) {
        this.parser.on('root', function(name, attributes) {
            test.equal(name, 'root');
            test.equal(attributes.attr1, 'root.attr1');
            test.equal(attributes.attr2, 'root.attr2');
        });

        var nodeIndex = 1;
        this.parser.on('root', 'node', function(name, attributes) {
            test.equal(name, 'node');
            test.equal(attributes.attr1, 'node' + nodeIndex + '.attr1');
            test.equal(attributes.attr2, 'node' + nodeIndex + '.attr2');
            nodeIndex++;
        });

        this.parser.end(SIMPLE_XML);
        test.done();
    },

    'local text events': function(test) {
        var parser = this.parser,
            index = 1;

        parser.on('root', function() {
            var index = 1;
            parser.on('node', function() {
                parser.on('$text', function(text) {
                    test.equal(text, 'text content ' + index);
                    index++
                });
            });
        });

        parser.end(TEXT_XML);
        test.done();
    },

    'stacked text events': function(test) {
        var index = 1;
        this.parser.on('root', 'node', '$text', function(text) {
            test.equal(text, 'text content ' + index);
            index++
        });

        this.parser.end(TEXT_XML);
        test.done();
    }
};
