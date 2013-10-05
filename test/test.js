var fs = require('fs');
var exml = require('../lib/exml');

var SIMPLE_XML = fs.readFileSync(__dirname + '/fixtures/simple.xml'),
    TEXT_XML = fs.readFileSync(__dirname + '/fixtures/text.xml'),
    CDATA_XML = fs.readFileSync(__dirname + '/fixtures/cdata.xml'),
    MIXED_XML = fs.readFileSync(__dirname + '/fixtures/mixed.xml');

module.exports['node events'] = {
    setUp: function(callback) {
        this.parser = new exml.Parser();
        callback();
    },

    'local': function(test) {
        var parser = this.parser;
        parser.on('root', function(attributes) {
            test.equal(attributes.attr1, 'root.attr1');
            test.equal(attributes.attr2, 'root.attr2');
            var nodeIndex = 1;
            parser.on('node', function(attributes) {
                test.equal(attributes.attr1, 'node' + nodeIndex + '.attr1');
                test.equal(attributes.attr2, 'node' + nodeIndex + '.attr2');
                nodeIndex++;
                parser.on('subnode', function(attributes) {
                    test.equal(attributes.attr1, 'subnode.attr1');
                    test.equal(attributes.attr2, 'subnode.attr2');
                });
            });
        });

        parser.end(SIMPLE_XML);
        test.done();
    },

    'stacked': function(test) {
        this.parser.on('root', function(attributes) {
            test.equal(attributes.attr1, 'root.attr1');
            test.equal(attributes.attr2, 'root.attr2');
        });

        var nodeIndex = 1;
        this.parser.on('root', 'node', function(attributes) {
            test.equal(attributes.attr1, 'node' + nodeIndex + '.attr1');
            test.equal(attributes.attr2, 'node' + nodeIndex + '.attr2');
            nodeIndex++;
        });

        this.parser.on('root', 'node', 'subnode', function(attributes) {
            test.equal(attributes.attr1, 'subnode.attr1');
            test.equal(attributes.attr2, 'subnode.attr2');
        });

        this.parser.end(SIMPLE_XML);
        test.done();
    },

    'partially stacked 1': function(test) {
        var parser = this.parser;
        var nodeIndex = 1;
        parser.on('root', 'node', function(attributes) {
            test.equal(attributes.attr1, 'node' + nodeIndex + '.attr1');
            test.equal(attributes.attr2, 'node' + nodeIndex + '.attr2');
            nodeIndex++;
            parser.on('subnode', function(attributes) {
                test.equal(attributes.attr1, 'subnode.attr1');
                test.equal(attributes.attr2, 'subnode.attr2');
            });
        });

        this.parser.end(SIMPLE_XML);
        test.done();
    },

    'partially stacked 2': function(test) {
        var parser = this.parser;
        parser.on('root', function(attributes) {
            test.equal(attributes.attr1, 'root.attr1');
            test.equal(attributes.attr2, 'root.attr2');
            var nodeIndex = 1;
            parser.on('node', 'subnode', function(attributes) {
                test.equal(attributes.attr1, 'subnode.attr1');
                test.equal(attributes.attr2, 'subnode.attr2');
            });
        });

        this.parser.end(SIMPLE_XML);
        test.done();
    }
};

module.exports['text events'] = {
    setUp: function(callback) {
        this.parser = new exml.Parser();
        callback();
    },

    'local': function(test) {
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

    'stacked': function(test) {
        var index = 1;
        this.parser.on('root', 'node', '$text', function(text) {
            test.equal(text, 'text content ' + index);
            index++
        });

        this.parser.end(TEXT_XML);
        test.done();
    }
};

module.exports['cdata events'] = {
    setUp: function(callback) {
        this.parser = new exml.Parser();
        callback();
    },

    'local': function(test) {
        var parser = this.parser,
            index = 1;

        parser.on('root', function() {
            var index = 1;
            parser.on('node', function() {
                parser.on('$cdata', function(cdata) {
                    test.equal(cdata, 'CDATA content ' + index);
                    index++
                });
            });
        });

        parser.end(CDATA_XML);
        test.done();
    },

    'stacked': function(test) {
        var index = 1;
        this.parser.on('root', 'node', '$cdata', function(text) {
            test.equal(text, 'CDATA content ' + index);
            index++
        });

        this.parser.end(CDATA_XML);
        test.done();
    }
};

module.exports['mixed content events'] = {
    setUp: function(callback) {
        this.parser = new exml.Parser();
        callback();
    },

    'local': function(test) {
        var parser = this.parser,
            index = 1;

        parser.on('root', function() {
            var index = 1;
            parser.on('node', function() {
                parser.on('$content', function(content) {
                    test.equal(content, 'Text content followed by some CDATA content ' + index);
                    index++
                });
            });
        });

        parser.end(MIXED_XML);
        test.done();
    },

    'stacked': function(test) {
        var index = 1;
        this.parser.on('root', 'node', '$content', function(content) {
            test.equal(content, 'Text content followed by some CDATA content ' + index);
            index++
        });

        this.parser.end(MIXED_XML);
        test.done();
    }
};
