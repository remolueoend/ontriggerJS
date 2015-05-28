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