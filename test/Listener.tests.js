var ontrigger = require('../lib/index'),
    testEvent = 'testEvent',
    assert = require('assert');
    obj = null;

describe('Listener', function () {

    beforeEach(function(){
        obj = ontrigger();
    });

    describe('remove', function(){

        it('should remove the listener when calling remove', function () {
            var listener = obj.on(testEvent, function () { });
            listener.remove();
            assert.equal(obj.listeners(testEvent).__listeners.indexOf(listener), -1, 'Listener was not removed from event');
        });

        it('should return true if remove was successful', function(){
            var listener = obj.on(testEvent, function () { });
            assert.equal(true, listener.remove());
        });

        it('should return false if remove failed', function(){
            var listener = obj.on(testEvent, function () { });
            listener.remove();
            assert.equal(false, listener.remove());
        });
    });

    describe('handler', function(){
        it('should return the handler function', function(){
            var h = function(){};
            var listener = obj.on(testEvent, h);
            assert.equal(listener.handler(), h, 'Invalid handler returned.');
        });
    });
    describe('event', function(){
        it('should return the event Type', function(){
            var listener = obj.on(testEvent, function(){});
            assert.equal(listener.event(), testEvent, 'Invalid event type returned.');
        });
    });
    describe('target', function(){
        it('should return the target object', function(){
            var listener = obj.on(testEvent, function(){});
            assert.equal(listener.target(), obj, 'Invalid target returned.');
        });
    });
});