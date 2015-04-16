(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

window.ontrigger = require('./ontrigger');
},{"./ontrigger":2}],2:[function(require,module,exports){

var extend = require('extend');

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
     * @param once Set to true to remove the listener after the first triggering.
     * @returns {Listener}
     */
    on: function (eventName, handler, once) {
        this.__ontrigger_events__[eventName] =
            this.__ontrigger_events__[eventName] || new ListenerCollection(eventName, this);

        return this.__ontrigger_events__[eventName].push(handler);
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
        if (this.__ontrigger_events__[eventName]) {
            this.__ontrigger_events__[eventName].trigger(Array.prototype.slice.call(arguments, 1));
        }
    },

    /**
     * Returns a collection of listeners for the specified event.
     * @param eventName The name of the event
     * @returns {ListenerCollection}
     */
    listenerCollection: function (eventName) {
        return this.hasListeners(eventName) ? this.__ontrigger_events__[eventName] : new ListenerCollection(eventName, this);
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

/**
 * Represents a collection of listeners attached to an event
 * @param eventName The name of the event of this collection
 * @param target The target object
 * @constructor
 */
function ListenerCollection(eventName, target) {
    this.event = eventName,
        this.__target = target,
        this.__listeners = {},
        this.__cid = 0;
}

ListenerCollection.prototype = {

    /**
     * Returns the target of this collection.
     * @returns {*}
     */
    target: function () {
        return this.__target;
    },

    /**
     * Returns an object containing all listeners of this collection.
     * @returns {*}
     */
    listeners: function () {
        return this.__listeners;
    },

    /**
     * Adds a new listener to the collection. If an existing listener is provided,
     * a new listener will be created based on the provided one.
     * @param {Listener|function} param An existing listener or a handler function.
     * @returns {Listener}
     */
    push: function (param) {
        var nl = new Listener(++this.__cid, arguments[0] instanceof Listener ? arguments[0].handler() : arguments[0], this);
        this.listeners()[nl.id()] = nl;
        return nl;
    },

    /**
     * Removes a listener from the collection.
     * @param id The id of the listener
     * @returns {boolean}
     */
    remove: function (id) {
        return delete this.listeners()[id];
    },

    /**
     * Calls all listeners in this collection.
     * @param data Additional array of data to send to the handlers
     */
    trigger: function (data) {
        for (var l in this.listeners()) {
            if (this.listeners().hasOwnProperty(l) && this.listeners()[l] instanceof Listener) {
                var listener = this.listeners()[l],
                    event = new TriggeredEvent(listener);
                listener.handler().apply(listener.target(), [event].concat(data || []));
                if (event.__prevented) {
                    break;
                }
            }
        }
    }

};

/**
 * Wrapper representing a single event listener.
 * @param id The id of the listener.
 * @param handler The handler function of this listener
 * @param listenerCollection The collection this listener is attached to
 * @constructor
 */
function Listener(id, handler, listenerCollection) {
    this.__id = id, this.__handler = handler, this.__collection = listenerCollection;
}

Listener.prototype = {

    /**
     * Returns the id of the listener.
     * @returns {number}
     */
    id: function () {
        return this.__id;
    },

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
        return this.__collection.remove(this.id);
    }
};

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


/**
 * Public module interface.
 * @param obj The object to attach the event handling
 * @param [propertyName] Optional property name under which the event handling should be attached.
 * @returns {*}
 */
function ontrigger(obj, propertyName) {
    if (typeof obj !== 'function') {
        if (propertyName && propertyName.length) {
            obj[propertyName] = new OnTrigger();
        } else {
            extend(obj, new OnTrigger());
        }
        return obj;
    } else {
        function _() {
            this.constructor = obj;
        }

        _.prototype = obj.prototype;

        function subClass() {
            this.constructor = obj;
            OnTrigger.call(this);
            obj.apply(this, Array.prototype.slice.call(arguments));
        }

        subClass.prototype = new _();
        extend(subClass.prototype, OnTrigger.prototype);

        return subClass;
    }
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


module.exports = ontrigger;
},{"extend":3}],3:[function(require,module,exports){
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


},{}]},{},[1]);