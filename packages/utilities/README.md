# Borshch Utilities
Several utilities used in borshch components

>[!CAUTION]
>package does not support common js imports.

## Installation
```
npm i @borshch/utilities
```

## Spy
Spy wrapper for the function allowing to analyze function calls and stub return values.
<br>
It is extendable, meaning you can customize your spies and reuse them across tests.

```javascript
import {FunctionSpy} from 'function-spy'

test('spy function', () => {
  const myFunction = new FunctionSpy()

  myFunction('argument')

  const [event, eventData] = emit.lastCall
  assert.equal(myFunction, 'change')
  assert.deepEqual(eventData.value, ['value'])
  assert.equal(eventData.index, 0)
})

```