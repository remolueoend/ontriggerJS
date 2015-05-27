
var ontrigger = require('../lib/ontrigger'),
    testEvent = 'testEvent';

describe('on', function(){

    it('should add a listener to the object\'s event collection', function(){
        var obj = ontrigger({});
        var listener = obj.on(testEvent, function(){});
        if(!obj.__ontrigger_events__[testEvent] ||
            !obj.__ontrigger_events__[testEvent].__listeners[listener.id()]){
            throw new Error('Listener was not attached properly.');
        }
    });

    describe('listener', function(){

        it('should remove the listener when calling remove', function(){
            var obj = ontrigger({});
            var listener = obj.on(testEvent, function(){});
            listener.remove();
            if(obj.__ontrigger_events__[testEvent].__listeners[listener.id()]){
                throw new Error('Listener was not removed from event collection.');
            }
        });

    });

});