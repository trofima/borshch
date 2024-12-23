# borshch
Tools for vanilla [webcomponents](https://developer.mozilla.org/en-US/docs/Web/Web_Components). Webcomponents can be used with any rendering lib like `angular` or `react` since they are just instances of [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) (should be [registered](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) though). But for old browsers you require to use [polyfills](https://www.webcomponents.org/polyfills).<br>

_Borshch - is a Ukrainian soup consisting from a lot of ingredients. This lib is a pan of components major ones of which can be used separately and in combination. So enjoy._

>**VERY IMPORTANT NOTE**<br>
The project is in ALPHA stage of development, so use it on your own risk (better not:). ANYTHING can be changed at any moment! Since I have no much time for development and supporting the project so don't expect quick feedback.<br>
Also bundle is not transpiled, so it will work only in modern browsers.

**For usage examples refer to the [PlaygroundApp](https://github.com/trofima/borshch/tree/main/playground/src/app)**

## Components

### `BorshchComponent` (extends `HTMLElement`)
Basic component providing additional api around [CustomElement](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
TODO: api, examples
### `BorshchRouter` (extends `BorshchComponent`)
Component for route management of a single page app. Should be used in combination with its subcomponents
TODO: api, examples
#### `BorshchDefaultRoute`
TODO: docs
#### `BorshchRoute`
TODO: docs
#### `BorshchRouteLink`
TODO: docs
<br><br>
## Mixins

### `ReflectAttributes`
TODO: docs
