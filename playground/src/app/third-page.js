import {BorshchComponent} from '../../../src/components/common'

class ThirdPage extends BorshchComponent {
  render() {
    return this.#render()
  }

  #render() {
    return `
      <div style="overflow: hidden;">
        <div style="margin-top: 40px">
          <h1>Third Page</h1>
          <div>Content</div>
        </div>
      </div>
    `
  }
}

export default ThirdPage.define()
