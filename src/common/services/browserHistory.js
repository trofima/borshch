import Service from './Service.js';
import {removeEndingSlash} from '../utils';

const POPSTATE = 'popstate';
const HASHCHANGE = 'hashchange';

class BrowserHistory extends Service {
  #target = undefined;

  constructor({target}) {
    super({target});
    this.#target = target;
  }

  get href() {return removeEndingSlash(this.#target.location.href)}
  get hash() {return removeEndingSlash(this.#target.location.hash)}
  get origin() {return this.#target.location.origin}
  get fullPath() {
    const {href, origin} = this.#target.location;

    return removeEndingSlash(href.replace(origin, ''));
  }

  dispatch(event, {state, oldURL = this.href, newURL = this.href} = {}) {
    if (event === HASHCHANGE)
      this.#target.dispatchEvent(new HashChangeEvent(HASHCHANGE, {oldURL, newURL}));

    if (event === POPSTATE) this.#target.dispatchEvent(new PopStateEvent(POPSTATE, state));
  }

  getHashFrom(url) {
    const [_, hash] = url.split('#')

    return hash ? `#${hash}` : undefined
  }

  setHref(href, {state = undefined, replace = false} = {}) {
    if (replace)
      this.#target.history.replaceState(state, '', href);
    else
      this.#target.history.pushState(state, '', href);
  }

  setHash(hash) {
    this.#target.location.hash = hash;
  }

  setFullPath(fullPath) {
    this.setHref(this.origin + fullPath);
  }
}

export default new BrowserHistory({target: window});
