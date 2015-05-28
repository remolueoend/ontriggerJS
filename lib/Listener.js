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