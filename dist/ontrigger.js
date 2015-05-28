(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Wrapper representing a single event listener.
 * @param handler The handler function of this listener
 * @param listenerCollection The collection this listener is attached to
 * @param {boolean} [once=false] Set to true to remove it after a trigger.
 * @constructor
 */
function Listener(handler, listenerCollection, once) {
    this.__handler = handler;
    this.__collection = listenerCollection;
    this.__once = once || false;
}

Listener.prototype = {

    /**
     *
     * Returns the handler function.
     * @returns {function}
     */
    handler: function () {
        return this.__handler;
    },

    /**
     * Returns the name of the event.
     * @returns {string}
     */
    event: function () {
        return this.__collection.event;
    },

    /**
     * returns the target object this listener is attached to.
     * @returns {*}
     */
    target: function () {
        return this.__collection.target();
    },

    /**
     * Removes this listener from the event handling.
     * @returns {boolean}
     */
    remove: function () {
        return this.__collection.remove(this);
    }
};

module.exports = Listener;
},{}],2:[function(require,module,exports){
var Listener = require('./Listener'),
    TriggeredEvent = require('./TriggeredEvent');

/**
 * Represents a collection of listeners attached to an event
 * @param eventName The name of the event of this collection
 * @param target The target object
 * @constructor
 */
function ListenerCollection(eventName, target) {
    this.event = eventName;
    this.__target = target;
    this.__listeners = [];
}

ListenerCollection.prototype = {

    /**
     * Returns the event type of this collection.
     * @returns {string}
     */
    eventType: function(){
        return this.event;
    },

    /**
     * Returns the target of this collection.
     * @returns {*}
     */
    target: function () {
        return this.__target;
    },

    /**
     * Adds a new listener to the collection. If an existing listener is provided,
     * a new listener will be created based on the provided one.
     * @param {Listener|function} listener An existing listener or a handler function.
     * @param {boolean} [once=false] Set to true to insert the given handler only once.
     * @returns {Listener}
     */
    push: function (listener, once) {
        return this.insert(this.__listeners.length, listener, once);
    },

    /**
     * Adds a new listener to the collection at the given index. If an existing listener is provided,
     * a new listener will be created based on the provided one.
     * @param {number} index Index at where the listener should be inserted.
     * @param {Listener|function} listener An existing listener or a handler function.
     * @param {boolean} [once=false] Set to true to insert the given handler only once.
     * @returns {Listener}
     */
    insert: function(index, listener, once){
        var isListener = listener instanceof Listener;
        var nl = new Listener(isListener ? listener.handler() : listener, this, isListener ? listener.__once : once);
        this.__listeners.splice(index, 0, nl);
        return nl;
    },

    /**
     * Removes a listener from the collection.
     * @param {Listener} listener The listener to remove.
     * @returns {boolean}
     */
    remove: function (listener) {
        var i;
        if((i = this.__listeners.indexOf(listener)) !== -1){
            this.__listeners.splice(i, 1);
            return true;
        }
        return false;
    },

    /**
     * Calls all listeners in this collection.
     * @param data Additional array of data to send to the handlers
     */
    trigger: function (data) {
        var listener, event;
        for(var i = 0; i < this.__listeners.length; i++){
            listener = this.__listeners[i], event = new TriggeredEvent(listener);
            listener.handler().apply(listener.target(), [event].concat(data || []));
            if(listener.__once === true){
                this.remove(listener);
            }
            if(event.__prevented){
                break;
            }
        }
    }
};

module.exports = ListenerCollection;
},{"./Listener":1,"./TriggeredEvent":4}],3:[function(require,module,exports){
var ListenerCollection = require('./ListenerCollection');

/**
 * Encapsulates methods and properties to attach to an ontrigger object.
 * @constructor
 */
function OnTrigger() {
    this.__ontrigger_events__ = {};
    this.__ontrigger_cid___ = 0;
}

OnTrigger.prototype = {

    /**
     * Adds a listener to the specified event.
     * @param eventName The name of the event to attach to
     * @param handler The handler function to execute
     * @param {boolean} [once=false] Set to true to remove the listener after the first triggering.
     * @returns {Listener}
     */
    on: function (eventName, handler, once) {
        return this.listeners(eventName).push(handler, once);
    },

    /**
     * Adds a listener which gets removed automatically after the first call.
     * @param eventName The name of the event to attach to
     * @param handler The handler function to execute
     * @returns {Listener}
     */
    once: function (eventName, handler) {
        return this.on(eventName, handler, true);
    },

    /**
     * Triggers the specified event
     * @param eventName The name of event to trigger.
     * @param [..] Additional data to send to the handlers.
     */
    trigger: function (eventName) {
        this.listeners(eventName).trigger(Array.prototype.slice.call(arguments, 1));
    },

    /**
     * Returns a collection of listeners for the specified event.
     * @param eventName The name of the event
     * @returns {ListenerCollection}
     */
    listeners: function (eventName) {
        if(!eventName) throw new Error('Invalid argument "eventName".');
        if (!(this.__ontrigger_events__[eventName] instanceof ListenerCollection)) {
            this.__ontrigger_events__[eventName] = new ListenerCollection(eventName, this);
        }
        return this.__ontrigger_events__[eventName];
    },

    /**
     * Returns if there are any listeners attached to the specified event.
     * @param eventName The name of the event
     * @returns {boolean}
     */
    hasListeners: function (eventName) {
        return this.__ontrigger_events__[eventName] instanceof ListenerCollection;
    }
};

module.exports = OnTrigger;
},{"./ListenerCollection":2}],4:[function(require,module,exports){
/**
 * Wrapper providing information about a triggered event.
 * An instance of this class is provided to each handler call.
 * @param listener The listener which was triggered.
 * @constructor
 */
function TriggeredEvent(listener) {
    this.__listener = listener;
    this.__timestamp = Date.now();
    this.__prevented = false;
}

TriggeredEvent.prototype = {

    /**
     * Returns the target object on which the event was triggered.
     * @returns {*}
     */
    target: function () {
        return this.__listener.target();
    },

    /**
     * Returns a UNIX timestamp of the time the event was triggered.
     * @returns {number}
     */
    timestamp: function () {
        return this.__timestamp;
    },

    /**
     * If called once, it stops triggering further listeners.
     */
    preventDefault: function () {
        this.__prevented = true;
    },

    /**
     * The name of the event triggered.
     * @returns {string}
     */
    type: function () {
        return this.__listener.event();
    },

    /**
     * Returns the listener which was triggered.
     * @returns {Listener}
     */
    listener: function () {
        return this.__listener;
    }
};

module.exports = TriggeredEvent;
},{}],5:[function(require,module,exports){

window.ontrigger = require('./index');
},{"./index":6}],6:[function(require,module,exports){

var extend = require('extend'),
    OnTrigger = require('./OnTrigger'),
    Listener = require('./Listener'),
    ListenerCollection = require('./ListenerCollection'),
    TriggeredEvent = require('./TriggeredEvent');

/**
 * Public module interface.
 * @param obj The object to attach the event handling
 * @param [propertyName] Optional property name under which the event handling should be attached.
 * @returns {*}
 */
function ontrigger(obj, propertyName) {
    if (typeof obj !== 'function') {
        obj = obj || {};
        if (propertyName && propertyName.length) {
            obj[propertyName] = new OnTrigger();
        } else {
            extend(obj, new OnTrigger());
        }
        return obj;
    } else {
        return _inheritFromOnTrigger(obj, propertyName);
    }
}

/**
 * Internal function inheriting the prototype of OnTrigger to the provided function
 * @param childFunc Child function/class
 * @returns {*}
 * @private
 */
function _inheritFromOnTrigger(childFunc){
    childFunc.prototype = Object.create(OnTrigger.prototype, {
        constructor: {
            value: childFunc,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    return childFunc;
}

/**
 * returns if the specified object is a Listener instance.
 * @param obj Instance to test
 * @returns {boolean}
 */
ontrigger.isListener = function (obj) {
    return obj instanceof Listener;
};

/**
 * returns if the specified object is a Event instance.
 * @param obj Instance to test
 * @returns {boolean}
 */
ontrigger.isEvent = function (obj) {
    return obj instanceof TriggeredEvent;
};

ontrigger.isListenerCollection = function(obj){
    return obj instanceof ListenerCollection;
};

ontrigger.isEnabled = function(obj){
    return obj instanceof OnTrigger;
};

/**
 * Used to call the OnTrigger base constructor
 * @param ctx The current initialized object.
 */
ontrigger.super = function(ctx){
    OnTrigger.call(ctx);
};


module.exports = ontrigger;
},{"./Listener":1,"./ListenerCollection":2,"./OnTrigger":3,"./TriggeredEvent":4,"extend":7}],7:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toString.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}]},{},[5]);
