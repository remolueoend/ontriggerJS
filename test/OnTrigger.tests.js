
var ontrigger = require('../lib/index'),
    testEvent = 'testEvent',
    obj = null,
    assert = require('assert');

describe('OnTrigger', function() {

    beforeEach(function(){
        obj = ontrigger();
    });

    describe('on', function () {

        it('should add a listener to the object\'s event collection', function () {
            var listener = obj.on(testEvent, function () {
            });
            if (!obj.listeners(testEvent).__listeners.some(function (l) {
                    return l === listener;
                })) {
                throw new Error('Listener was not attached properly.');
            }
        });

        it('should remove it after a trigger when once is set to true', function(){
            var listener = obj.on(testEvent, function () {
            }, true);
            obj.trigger('testEvent');
            if (obj.listeners(testEvent).__listeners.some(function (l) { return l === listener; })) {
                throw new Error('Listener was not removed properly after trigger.');
            }
        });
    });


    describe('once', function(){

        it('should remove the event after trigger', function(){
            var listener = obj.once(testEvent, function () {
            });
            obj.trigger('testEvent');
            if (obj.listeners(testEvent).__listeners.some(function (l) { return l === listener; })) {
                throw new Error('Listener was not removed properly after trigger.');
            }
        });

    });


    describe('trigger', function () {

        it('should trigger all attached listeners', function (done) {
            var to, n = 10, c = 0;

            function handler(e) {
                c++;
                if (c == n) {
                    clearTimeout(to);
                    done();
                }
            }

            for (var i = 0; i < n; i++) {
                obj.on(testEvent, handler);
            }

            obj.trigger(testEvent);
            to = setTimeout(function () {
                done(new Error('Listeners were not called in a proper range of time.'));
            }, 1000);
        });

        it('should provide an event instance to the handler', function () {
            obj.on(testEvent, function (e) {
                if (!ontrigger.isEvent(e)) {
                    throw new Error('No valid event instance provided.');
                }
            });
            obj.trigger(testEvent);
        });

        it('should provide the event data to the handler', function () {
            obj.on(testEvent, function (e, data, dataArray) {
                if (data !== 'data' || !(dataArray instanceof Array)) {
                    throw new Error('Data were not provided.');
                }
            });
            obj.trigger(testEvent, 'data', []);
        });
    });


    describe('listeners', function(){

        it('should return an empty list when no listener is attached', function(){
            if(!ontrigger.isListenerCollection(obj.listeners(testEvent))){
                throw new Error('Invalid return.');
            }
        });

        it('should return the current list of listeners', function(){
            var l = obj.on(testEvent, function(){});
            if(obj.listeners(testEvent).__listeners.indexOf(l) === -1){
                throw new Error('Invalid list returned.');
            }
        });

        it('should throw if no event name was specified', function(){
            assert.throws(function(){ obj.listeners(); }, 'Did not throw.');
        });
    });
});