var sax = require('sax');

function _newFrame() {
    return { handlers: {}, textContent: '' };
}

function Parser() {
    this._eventStack = ['$root'];
    this._frameStack = [_newFrame()];

    this._stream = sax.createStream({ lowercase: true });
    this._stream.on('opentag', this._handleOpenTag.bind(this));
    this._stream.on('text', this._handleText.bind(this));
    this._stream.on('closetag', this._handleCloseTag.bind(this));
}

Parser.prototype.on = function() {
    var events = Array.prototype.slice.call(arguments, 0, -1);
    var callback = arguments[arguments.length-1];
    var fullEvent = this._fullEvent(events);
    this._currentFrame().handlers[fullEvent] = callback;
};

Parser.prototype.write = function(data) {
    this._stream.write(data);
};

Parser.prototype.end = function(data) {
    this._stream.end(data);
};

Parser.prototype._handleOpenTag = function(node) {
    this._eventStack.push(node.name);

    var handler = this._getHandler();
    this._frameStack.push(_newFrame());

    if (handler) {
        handler(node.attributes);
    }
};

Parser.prototype._handleCloseTag = function() {
    this._frameStack.pop();
    this._eventStack.pop();
};

Parser.prototype._handleText = function(text) {
    this._eventStack.push('$text');

    var handler = this._getHandler();
    if (handler) {
        handler(text);
    }

    this._currentFrame().textContent += text;
    this._eventStack.pop();
};

Parser.prototype._currentFrame = function() {
    return this._frameStack[this._frameStack.length-1];
};

Parser.prototype._fullEvent = function(events) {
    return this._eventStack.concat(events || []).join('/');
};

Parser.prototype._getHandler = function() {
    var fullEvent = this._fullEvent(),
        handler;

    for (var i=this._frameStack.length-1; i>=0; i--) {
        handler = this._frameStack[i].handlers[fullEvent];
        if (handler) {
            return handler;
        }
    }

    return null;
};

module.exports.Parser = Parser;
