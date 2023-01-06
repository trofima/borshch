import ExtendedMap from '../utils/ExtendedMap.js';

// const validators = {
//   event: {
//     valid: (name, comparator) => comparator.includes(name),
//     error: console.error(`Event ${name} is not supported by the ${this.constructor.name} service.`),
//   },
// };


//TODO: babel still doesn't support new decorators stage 2 proposal
// back to this later

// decorator @validate(entity, getter = arg1 => arg1) {
//   @wrap(f => {
//     const comparator = this.validators?.[entity];
//
//     if (comparator) {
//       function wrapped(...args) {
//         const testValue = getter(...args);
//         const validator = validators[entity];
//
//         if (validator.valid(testValue))
//           f.call(this, ...args);
//         else
//           validator.error();
//       }
//
//       Object.defineProperty(wrapped, 'name', {value: f.name, configurable: true});
//
//       return wrapped;
//     }
//
//     return f;
//   })
// }

class EventListeners {
  #name = undefined;
  #target = undefined;
  #throttler = undefined;
  #compListeners = new ExtendedMap();
  #throttledCompListeners = new ExtendedMap();
  get #throttledName () {return `throttled_${this.#name}`;}

  constructor(name, target) {
    this.#name = name;
    this.#target = target;
  }

  #createThrottler() {
    let throttle = false;

    return e => {
      if (!throttle) {
        throttle = true;

        window.requestAnimationFrame(() => {
          this.#target.dispatchEvent(new CustomEvent(this.#throttledName, {detail: {originalEvent: e}}));
          throttle = false;
        });
      }
    };
  }

  #addThrottler(throttle) {
    if (throttle && !this.#throttler) {
      const throttler = this.#createThrottler(this.#target, this.#name);

      this.#throttler = throttler;
      this.#target.addEventListener(this.#name, throttler);
    }
  }

  #updateCompListeners(comp, listener = undefined, {throttled = false} = {throttled: false}) {
    const compListeners = (throttled ? this.#throttledCompListeners : this.#compListeners);
    const name = throttled ? this.#throttledName : this.#name;
    const listeners = compListeners.get(comp);

    if (listeners) {
      if (listener && listeners.has(listener)){
        this.#target.removeEventListener(name, listener);
        listeners.delete(listener);

        if (!listeners.size) compListeners.delete(comp);
      } else {
        listeners.forEach(listener => this.#target.removeEventListener(name, listener));
        compListeners.delete(comp);
      }
    }
  }

  add(comp, listener, throttle = false) {
    const eName = throttle ? this.#throttledName : this.#name;

    this.#addThrottler(throttle);
    (throttle ? this.#throttledCompListeners : this.#compListeners).getOrSet(comp, new Set()).add(listener);
    this.#target.addEventListener(eName, listener);
  }

  remove(comp, listener = undefined) {
    this.#updateCompListeners(comp, listener, {throttled: true});
    this.#updateCompListeners(comp, listener);

    if (!this.#throttledCompListeners.size && this.#throttler) {
      this.#target.removeEventListener(this.#name, this.#throttler);
      this.#throttler = undefined;
    }

    return {empty: !this.#throttledCompListeners.size && !this.#compListeners.size};
  }
}

class Service {
  #target = undefined;
  #name = undefined;
  #targetEvents = new ExtendedMap();

  constructor({target = undefined, name = undefined} = {}) {
    this.#target = target;
    this.#name = name;
  }

  // get validators() {
  //   return undefined;
  // }

  // @validate('event', (comp, {name}) => name)
  bind(comp, ...rest) {
    const [
      name, listener,
      {target = this.#target, throttle = false} = {target: this.#target, throttle: false}
    ] = typeof rest[0] === 'function'
      ? [this.#name, ...rest]
      : rest;

    this.#targetEvents
      .getOrSet(target, new ExtendedMap())
      .getOrSet(name, new EventListeners(name, target))
      .add(comp, listener, throttle);
  }

  // @validate('event', (comp, {name}) => name)
  unbind(comp, ...rest) {
    const [name, listener] = typeof rest[0] === 'function' ? [undefined, ...rest] : rest;

    this.#targetEvents.forEach((targetEventListeners, target) => {
      const updateEventListeners = (eventListeners, name) => {
        const {empty} = eventListeners.remove(comp, listener);

        if (empty) targetEventListeners.delete(name);
      };

      if (name) updateEventListeners(targetEventListeners.get(name), name);
      else targetEventListeners.forEach(updateEventListeners);

      if (!targetEventListeners.size) this.#targetEvents.delete(target);
    });
  }
}

export {
  Service as default,
}
