
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