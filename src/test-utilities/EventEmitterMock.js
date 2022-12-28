import {AsyncOperationMock} from '.'

export default class EventEmitterMock {
  get onOperation() {return this.#onOperation}
  get offOperation() {return this.#offOperation}
  get emitOperation() {return this.#emitOperation}

  on(event, listener) {
    return this.#onOperation.create({event, listener})
  }

  off(event, listener) {
    return this.#offOperation.create({event, listener})
  }

  emit(event, listener) {
    return this.#emitOperation.create({event, listener})
  }

  #onOperation = new AsyncOperationMock('Emitter on')
  #offOperation = new AsyncOperationMock('Emitter off')
  #emitOperation = new AsyncOperationMock('Emitter emit')
}