
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
        return _inheritFromOnTrigger(obj, propertyName);
    }
}

function _inheritFromOnTrigger(childFunc){

    function _(){
        this.constructor = OnTrigger();
    }
    _.prototype = OnTrigger.prototype;
    childFunc.prototype = new _();

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

/**
 * Property allowing access to the OnTrigger class function.
 * @type {OnTrigger}
 */
ontrigger.OnTrigger = OnTrigger;

/**
 * Used to call the OnTrigger base constructor
 * @param ctx The current initialized object.
 */
ontrigger.super = function(ctx){
    OnTrigger.call(ctx);
};


module.exports = ontrigger;