var ontrigger = require('../lib/index'),
    assert = require('assert'),
    testEvent = 'testEvent',
    obj = null,
    listeners = function(){ return obj.listeners.call(obj, testEvent); };


describe('ListenerCollection', function(){

    beforeEach(function(){
        obj = ontrigger();
    });

    describe('eventType', function(){
        it('should return the current event type', function(){
            assert.equal(listeners().eventType(), testEvent, 'Invalid event type returned.');
        });
    });

    describe('target', function(){
        it('should return the target object of the collection', function(){
            assert.equal(listeners().target(), obj, 'Invalid target returned.');
        });
    });

    describe('push', function(){
        it('should add a new Listener when a function is given', function(){
            var h = function h(){};
            var l = listeners().push(h);
            assert.equal(listeners().__listeners[0], l, 'Invalid listener added.');
            assert.equal(listeners().__listeners[0].handler(), h, 'Invalid handler added.');
        });

        it('should set the handler to once if second parameter is true', function(){
            var l = listeners().push(function(){}, true);
            assert.equal(l.__once, true);
        });

        it('should ignore parameter once when a listener is given', function(){
            var l1 = listeners().push(function(){}, false);
            var l2 = listeners().push(l1, true);
            assert.equal(l2.__once, l1.__once, 'Invalid once value.')
        });

        it('should add a new listener with the same handler and same once value when a listener is given', function(){
            var l1 = listeners().push(function(){}, true);
            var l2 = listeners().push(l1);
            assert.notEqual(l1, l2, 'Same listener added twice.');
            assert.equal(l1.handler(), l2.handler(), 'Invalid handler added.');
            assert.equal(l2.__once, l1.__once, 'Invalid once value.');
        });

        it('should add the listener or handler at last position', function(){
            for(var i = 0; i < 3; i++){
                var l = listeners().push(function(){});
                assert.equal(listeners().__listeners.indexOf(l), listeners().__listeners.length - 1, 'Listener at invalid position.');
            }
        });
    });


    describe('insert', function(){
        it('should add a new Listener when a function is given', function(){
            var h = function h(){};
            var l = listeners().insert(0, h);
            assert.equal(listeners().__listeners[0], l, 'Invalid listener added.');
            assert.equal(listeners().__listeners[0].handler(), h, 'Invalid handler added.');
        });

        it('should set the handler to once if third parameter is true', function(){
            var l = listeners().insert(0, function(){}, true);
            assert.equal(l.__once, true);
        });

        it('should ignore parameter once when a listener is given', function(){
            var l1 = listeners().insert(0, function(){}, false);
            var l2 = listeners().insert(0, l1, true);
            assert.equal(l2.__once, l1.__once, 'Invalid once value.')
        });

        it('should add a new listener with the same handler and same once value when a listener is given', function(){
            var l1 = listeners().insert(0, function(){}, true);
            var l2 = listeners().insert(0, l1);
            assert.notEqual(l1, l2, 'Same listener added twice.');
            assert.equal(l1.handler(), l2.handler(), 'Invalid handler added.');
            assert.equal(l2.__once, l1.__once, 'Invalid once value.');
        });

        it('should add the listener or handler at the given index', function(){
            var l1 = listeners().insert(0, function(){});
            assert.equal(listeners().__listeners.indexOf(l1), 0, 'Invalid index l1.');
            var l2 = listeners().insert(0, function(){});
            assert.equal(listeners().__listeners.indexOf(l2), 0, 'Invalid index l2.');
            var l3 = listeners().insert(1, function(){});
            assert.equal(listeners().__listeners.indexOf(l3), 1, 'Invalid index l3.');
        });
    });

    describe('remove', function(){
        it('should remove a given listener', function(){
            var l = listeners().push(function(){});
            listeners().remove(l);
            assert.equal(listeners().__listeners.indexOf(l), -1, 'Listener not removed.');
        });
    });

    describe('trigger', function(){
        it('should trigger all attached handlers', function(){
            var t1 = false, t2 = false;
            obj.on(testEvent, function(){ t1 = true; });
            obj.on(testEvent, function(){ t2 = true; });
            obj.trigger(testEvent);
            assert(t1, 'Handler 1 not executed.');
            assert(t2, 'Handler 2 not executed.');
        });

        it('should remove a listener when __once is set', function(){
            var c = false;
            obj.on(testEvent, function(){ c = !c; }, true);
            obj.trigger(testEvent);
            obj.trigger(testEvent);
            assert(c, 'Handler not removed.');
        });

        it('should stop when preventDefault is called', function(){
            var c = false;
            obj.on(testEvent, function(e){ c = true; e.preventDefault(); });
            obj.on(testEvent, function(){ c = false; });
            obj.trigger(testEvent);
            assert(c, 'Triggering not stopped.');
        });
    });
});