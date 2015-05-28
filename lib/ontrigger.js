
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
        return this.listeners(eventName).push(handler);
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
    this.__cid = 0;
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
     * @returns {Listener}
     */
    push: function (listener) {
        return this.insert(this.__listeners.length, listener);
    },

    /**
     * Adds a new listener to the collection at the given index. If an existing listener is provided,
     * a new listener will be created based on the provided one.
     * @param {Listener|function} listener An existing listener or a handler function.
     * @returns {Listener}
     */
    insert: function(index, listener){
        var nl = new Listener(++this.__cid, listener instanceof Listener ? listener.handler() : listener, this);
        this.__listeners.splice(index, 0, nl);
        return nl;
    },

    /**
     * Removes a listener from the collection.
     * @param id The id of the listener
     * @returns {boolean}
     */
    remove: function (id) {
        var is = this.__listeners.filter(function(l){ return l.id() === id; });
        switch(is.length){
            case 1:
                this.__listeners.splice(is[0], 1);
                return true;
            case 0:
                return false;
            default:
                throw new Error('Multiple listeners with identical ID found.');
        }
    },

    /**
     * Calls all listeners in this collection.
     * @param data Additional array of data to send to the handlers
     */
    trigger: function (data) {
        // use every() instead of forEach() which allows stopping the loop by returning false:
        this.__listeners.every(function(listener){
            var event = new TriggeredEvent(listener);
            listener.handler().apply(listener.target(), [event].concat(data || []));

            if (event.__prevented) {
                return false;
            }
            return true;
        });
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
        return this.__collection.remove(this.__id);
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