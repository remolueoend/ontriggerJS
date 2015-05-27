# ontriggerJS
Plattform independent Module expanding objects to support a trigger based event handling.

## Installation
* ```npm install ontriggerJS [--save]```
* ```bower install ontriggerJS [--save]```

## Usage
### Node/CJS
```javascript
var ontrigger = require('ontrigger');
```
### Browser
```html
<html>
    <body>
        <script type="text/javascript" src="bower_components/ontriggerJS/dist/ontrigger.js"></script>
        <script type="text/javascript">
            var or = window.ontrigger;
        </script>
    </body>
</html>
```

## Expanding an object
```javascript
var ontrigger = require('ontrigger');

var obj = {foo: 'baz'};
// Expand the object:
ontrigger(obj);

obj.on('eventName', function(event, d1, d2, d3){ ... });
obj.trigger('eventName', d1, d2, d3);
```

## Expanding a prototype (inheritance)
```javascript
var ontrigger = require('ontrigger');

function CustomClass(){
  // Do not forget to call the super constructor:
  ontrigger.super(this);
  ...
}
// Your function's prototype will be inherited from the OnTrigger prototype:
ontrigger(CustomClass);

CustomClass.prototype.foo = function(){ ... }
...

var obj = new CustomClass();
obj.on('eventName', function(e, ...){ ... });
obj.trigger('eventName', ...);
```

## API
### Class OnTrigger
All members of this class can be directly accessed over an expanded object.
#### trigger(eventName, data...)
Triggers the specified event by calling all event listeners attached to this event. If no listeners are attached, nothing will happen.
The first parameter must be a string specifying the event to trigger. All additional parameters will be sent to the listeners:
```javascript
obj.on('myEvent', function(e, d1, d2, d3){
  // d1 == 'a', d2 == 'b', d3 == 'c', e == event instance
});
obj.trigger('myEvent', 'a', 'b', 'c');
```

#### on(eventName, handler, [once=false])
Attaches an event listener for the specified event. The provided handler function gets executed as soon as the event gets triggered.
The first provided parameter of the handler function is always a reference to the current event instance. Further parameters are sent by the trigger call:
If the third parameter is set to true, the listener get automatically removed again after the next trigger (See ```once```).
```javascript
var listener = obj.on('myEvent', function(e, d1, d2, d3){
  // e == event instance, d1 == 'a', d2 == 'b', d3 == 'c'
});
obj.trigger('myEvent', 'a', 'b', 'c');
```
This method returns the attached listener of type Listener.


#### once(eventHandler, handler)
Similar to method ```on```, but removes the attached listener again after the next triggering of the event:
```javascript
obj.once('myEvent', function(){
  // Will be only called once.
});
obj.trigger('myEvent');
obj.trigger('myEvent');
```


