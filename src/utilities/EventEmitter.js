export default class EventEmitter {
  on(event, listener) {
    this.#listenersByEvent[event] = [...this.#listenersByEvent[event] ?? [], listener]

    return () => {
      this.#listenersByEvent[event] = this.#listenersByEvent[event]
        .filter(fn => fn !== listener)
    }
  }

  off(event, listener) {
    this.#listenersByEvent[event] = this.#listenersByEvent[event]
      ?.filter(eventListener => eventListener !== listener)
  }

  emit(event, params) {
    this.#listenersByEvent[event]?.forEach(listener => listener(params))
  }

  #listenersByEvent = {}
}