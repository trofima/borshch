const removeEndingSlash = str =>
  str.length > 1 && str.substr(-1) === '/' ? str.slice(0, -1) : str

const lockable = Obj => {
  let locked = false

  Object.defineProperty(Obj, 'locked', {
    enumerable: false,
    configurable: false,
    get() {return locked}
  })

  Obj.lock = () => (locked = true)
  Obj.unlock = () => (locked = false)

  return Obj
}

export {
  removeEndingSlash,
  lockable,
}

export {default as Deferred} from './Deferred'
export {default as ExtendedMap} from './ExtendedMap'
export {default as Emitter} from '../../utilities/EventEmitter'
