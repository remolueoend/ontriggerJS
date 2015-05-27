
var ontrigger = require('../lib/ontrigger'),
    eventsProperty = 'events';

describe('initObject', function(){

    it('should add a method \'on\' to the instance', function(){
        var obj = ontrigger({});
        if(typeof obj.on !== 'function'){
            throw new Error('Method not attached.');
        }
    });

    it('should add a method \'trigger\' to the instance', function(){
        var obj = ontrigger({});
        if(typeof obj.trigger !== 'function'){
            throw new Error('Method not attached.');
        }
    });

    it('should not affect class instances', function(){
        function TestClass(){ ontrigger(this); }
        var inst = new TestClass();
        if(!(inst instanceof TestClass)){
            throw new Error('Instance was muted.');
        }
    });

    it('should add the interface to a sub-property', function(){
        var obj = ontrigger({}, eventsProperty);
        if(typeof obj[eventsProperty] === 'undefined' || typeof obj[eventsProperty].on !== 'function' || typeof obj[eventsProperty].trigger !== 'function'){
            throw new Error('Instances not added properly.');
        }
    });

    it('should inherit from OnTrigger', function(done){
        function TestClass(){ ontrigger.OnTrigger.call(this); }
        ontrigger(TestClass);
        TestClass.prototype.test = function(){
            this.trigger('test');
        };
        var obj = new TestClass();

        if(typeof obj.trigger !== 'function'){
            throw Error('Method \'trigger\' missing on instance');
        }
        if(typeof obj.on !== 'function'){
            throw Error('Method \'on\' missing on instance');
        }
        if(typeof obj.test !== 'function'){
            throw Error('Method \'test\' missing on instance');
        }
        obj.on('test', function(){
            done();
        });

        obj.test();

    });

});