class Store {
  constructor({state = {}, getters = {}, actions = {}}) {
    this.elementListenerMap = new Map()
    //TODO: check getters, actions name uniqueness.
    Object.keys(getters).forEach(getter => this[getter] = getters[getter])
    Object.keys(actions).forEach(action =>
      this[action] = async(...args) => {
        const prevState = {...state}
        const update = await actions[action](...args)

        if (update !== false)
          this.triggerUpdate(action, {...state}, prevState, ...args)
      })
  }

  triggerUpdate(action, ...args) {
    this.elementListenerMap.forEach(listener => listener(action, ...args))
  }

  onUpdate(el, listener) {
    this.elementListenerMap.set(el, listener)
  }

  offUpdate(el) {
    this.elementListenerMap.delete(el)
  }
}

const connect = store => Base => class Connected extends Base {
  connectedCallback() { //TODO: store and listeners validation
    this.#connectToStore()
    super.connectedCallback()
  }

  disconnectedCallback() {
    this.#disconectFromStore()
    super.disconnectedCallback()
  }

  onStore() {
    return {}
  }

  #forEachStore = action => () => {
    const listeners = this.onStore()

    if (store instanceof Store) action(store, listeners)
    else Object.entries(store).forEach(([storeName, store]) => 
      action(store, listeners[storeName]))
  }

  #connectToStore = this.#forEachStore((store, listeners) => {
    const propsToListen = Object.keys(listeners)

    propsToListen.length && store.onUpdate(this, (prop, ...args) => 
      propsToListen.includes(prop) && listeners[prop](...args))
  })

  #disconectFromStore = this.#forEachStore(store => store.offUpdate(this))
}

export {
  connect,
  Store,
}
