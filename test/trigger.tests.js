
var ontrigger = require('../lib/ontrigger'),
    testEvent = 'testEvent';

describe('trigger', function(){

    it('should trigger all attached listeners', function(done){
        var obj = ontrigger({}), to, n = 10, c = 0;
        function handler(e) {
            c++;
            if(c == n){
                clearTimeout(to);
                done();
            }
        }
        for(var i = 0; i < n; i++){
            obj.on(testEvent, handler);
        }

        obj.trigger(testEvent);
        to = setTimeout(function(){ done(new Error('Listeners were not called in a proper range of time.')); }, 1000);
    });

    it('should provide an event instance to the handler', function(){
        var obj = ontrigger({});
        obj.on(testEvent, function(e){
            if(!ontrigger.isEvent(e)){
                throw new Error('No valid event instance provided.');
            }
        });
        obj.trigger(testEvent);
    });

    it('should provide the event data to the handler', function(){
        var obj = ontrigger({});
        obj.on(testEvent, function(e, data, dataArray){
            if(data !== 'data' || !(dataArray instanceof Array)){
                throw new Error('Data were not provided.');
            }
        });
        obj.trigger(testEvent, 'data', []);
    });

});