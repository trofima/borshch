# Borshch Utilities
Several utilities used in borshch components

>[!CAUTION]
>package have no typings, so may have troubles with integration to TS projects. Didn't check yet.

>[!CAUTION]
>cjs version is bundled, but has not been tested yet. you are welcome to give feedback or even create PR with a fix. But better stop using cjs. Forever.

## Installation
```
npm i @borshch/utilities
```

### Atom
State holder. Applies supplied function to current value and uses its result as new value (idea borrowed from Clojure Atom)<br>
Usage [examples](https://github.com/trofima/borshch/blob/main/packages/utilities/src/atom.test.js)

### Deferred
Creates deferred promise that you can manually control resolution and rejection<br>
Usage [examples](https://github.com/trofima/borshch/blob/main/packages/utilities/src/deferred.test.js) 

### Spy
Spy wrapper for the function allowing to analyze function calls and stub return values.<br>
It is extendable, meaning you can customize your spies and reuse them across tests.<br>
Usage [examples](https://github.com/trofima/borshch/blob/main/packages/utilities/src/spy.test.js)

### mixin
Mixes Base class with mixins returning new extendable class. Allows kind of multiple inheritance.<br>
Usage [examples](https://github.com/trofima/borshch/blob/main/packages/utilities/src/mixin.test.js)
