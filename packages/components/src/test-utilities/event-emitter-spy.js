import {FunctionSpy} from '.'

export default class EventEmitterSpy {
  on = new FunctionSpy()
  off = new FunctionSpy()
  emit = new FunctionSpy()
}