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
  // d1 == 'a', d2 == 'b', d3 == 'c', e == TriggeredEvent instance
});
obj.trigger('myEvent', 'a', 'b', 'c');
```

#### on(eventName, handler, [once=false])
Attaches an event listener for the specified event. The provided handler function gets executed as soon as the event gets triggered.
The first provided parameter of the handler function is always a reference to the current event instance. See Class ```TriggeredEvent``` for more info. All further parameters are sent by the trigger call.
If the third parameter is set to true, the listener get automatically removed again after the next trigger (See ```once```).
```javascript
var listener = obj.on('myEvent', function(e, d1, d2, d3){
  // e == TriggeredEvent instance, d1 == 'a', d2 == 'b', d3 == 'c'
});
obj.trigger('myEvent', 'a', 'b', 'c');
```
This method returns the attached listener of type ```Listener```.

#### once(eventHandler, handler)
Similar to method ```on```, but removes the attached listener again after the next triggering of the event:
```javascript
obj.once('myEvent', function(){
  // Will be only called once.
});
obj.trigger('myEvent');
obj.trigger('myEvent');
```

#### listenerCollection(eventName)
Returns the collection of listeners which are attached to the specified event of the current object. The collection is of type ```ListenerCollection```:
```javascript
var listeners = obj.listenerCollection('myEvent');
```

#### hasListeners(eventName)
Returns a boolean, if the current object has any listeners for the specified event attached:
var hasListeners = obj.hasListeners('myEvent');

### Class ListenerCollection
Represents a collection of event listeners. Use ```obj.listenerCollection(eventName)``` to get a collection of listeners of an object for a specified event. Every collection belongs to one single event type.

#### eventType()
Returns the name of the event this collection belongs to.

#### target()
Returns the target object this collection is attached to.

#### push(item)
Adds a new listener to the collection. parameter ```item``` can be an object of type ```Listener``` or a function.
If a Listener instance is provided, a new Listener instance will be created based on the provided one, because a listener can only be a member of one collection at the time. This method returns always the new instance of ```Listener``` which was added to the collection.

#### remove(id)
Removes the listener with the specified id from the collection. Returns true if successful, otherwise false.

#### trigger([data])
Triggers all event listeners of the collection. The parameter ```data``` is an optional array of data to provide to the listeners' handler functions.

### Class Listener
Represents a single event listener. A listenr is always a member of a single ```ListenerCollection``` instance. Every listener has a unique ID in its collection, and an attached handler function.

#### id()
Returns the listener's ID. This ID is only unique in the listener's collection, NOT globally.

#### handler()
Returns the listener's handler function.

#### event()
Returns the name of the event this listener is attached to.

#### target()
Returns the target object this listener is attached to.

#### remove()
Removes the listener from its collection. The listener's handler function won't be called anymore when the event is triggered.
To re-attach the listener's handler fucntion, use the ```ListenerCollection::push()``` method. But a new instance of ```Listener``` will be generated anyway.

```TriggeredEvent```
