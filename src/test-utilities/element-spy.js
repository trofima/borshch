import {FunctionSpy, TransitionSpy} from '.'

export default class ElementSpy {
  constructor({transition = new TransitionSpy()} = {}) {
    this.stubTransition(transition)
  }

  appendChild = new FunctionSpy()
  attachChild = new FunctionSpy()
  replaceChildren = new FunctionSpy()
  removeChild = new FunctionSpy()
  removeChildren = new FunctionSpy()
  setStyle = new FunctionSpy()
  select = new FunctionSpy()
  transit = new FunctionSpy()

  stubTransition(transition) {
    this.transit.returns(transition)
  }
}