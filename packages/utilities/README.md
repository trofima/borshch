# Borshch Utilities
Several utilities used in borshch components

>[!CAUTION]
>package does not support common js imports.

## Installation
```
npm i @borshch/utilities
```

### Deferred
Creates deferred promise that you can manually control resolution and rejection<br>
Usage [examples](https://github.com/trofima/borshch/blob/e2810d29b010b822a8e7dea01bf59890272c8c6e/packages/utilities/deferred.test.js) 

### Spy
Spy wrapper for the function allowing to analyze function calls and stub return values.<br>
It is extendable, meaning you can customize your spies and reuse them across tests.<br>
Usage [examples](https://github.com/trofima/borshch/blob/main/packages/utilities/spy.js)