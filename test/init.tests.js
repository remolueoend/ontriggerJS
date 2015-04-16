
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

});

describe('initClass', function(){

    it('should expand the prototype', function(){
        function TestClass(){  }
        TestClass.prototype = {
            testMethod: function(){}
        };
        TestClass = ontrigger(TestClass);
        if(typeof TestClass.prototype.testMethod !== 'function' ||
            typeof TestClass.prototype.on !== 'function' ||
            typeof TestClass.prototype.trigger !== 'function'){
            throw new Error('Prototype not expanded properly.');
        }
    });

    it('should append the interface to the instances', function(){
        function TestClass(param){ this.testProp = param; }
        TestClass.prototype = {
            testMethod: function(){}
        };
        TestClass = ontrigger(TestClass), inst = new TestClass('test');

        if(inst.testProp !== 'test' ||
            typeof inst.testMethod !== 'function' ||
            typeof inst.on !== 'function' ||
            typeof inst.trigger !== 'function'){
            throw new Error('Instance not expanded properly.');
        }
    });
});