export class EventEmitter {
  on(event, listener) {
    if (!this.#listenersByEvent.has(event)) this.#listenersByEvent.set(event, new Set())
    const listeners = this.#listenersByEvent.get(event)
    listeners.add(listener)
    return () => this.off(event, listener)
  }

  once(event, listener) {
    const off = this.on(event, (...args) => {
      off()
      listener(...args)
    })
  }

  off(event, listener) {
    const listeners = this.#listenersByEvent.get(event)
    listeners?.delete(listener)
    if (listeners?.size === 0) this.#listenersByEvent.delete(event)
  }

  emit(event, params) {
    this.#listenersByEvent.get(event)?.forEach(listener => listener(params))
  }

  #listenersByEvent = new Map()
}
