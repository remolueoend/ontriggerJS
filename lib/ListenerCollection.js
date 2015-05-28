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