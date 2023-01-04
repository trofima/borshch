import {FunctionSpy, AnimationSpy} from '.'

export default class ElementSpy {
  constructor({animation = new AnimationSpy()} = {}) {
    this.stubAnimation(animation)
  }

  appendChild = new FunctionSpy()
  attachChild = new FunctionSpy()
  replaceChildren = new FunctionSpy()
  removeChild = new FunctionSpy()
  removeChildren = new FunctionSpy()
  setStyle = new FunctionSpy()
  select = new FunctionSpy()
  animate = new FunctionSpy()

  stubAnimation(animation) {
    this.animate.returns(animation)
  }
}