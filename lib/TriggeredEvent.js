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