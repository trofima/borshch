export default class Emitter {
  on(event, listener) {
    this.#listenersByEvent[event] = [...this.#listenersByEvent[event] ?? [], listener];

    return () => {
      this.#listenersByEvent[event] = this.#listenersByEvent[event]
        .filter(fn => fn !== listener);
    };
  }

  emit(event, params) {
    this.#listenersByEvent[event]?.forEach(listener => listener(params));
  }

  #listenersByEvent = {};
}