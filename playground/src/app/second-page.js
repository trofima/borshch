import {BorshchComponent} from '../../../src/components/common'

class SecondPage extends BorshchComponent {
  render() {
    return this.#render()
  }

  #render() {
    return `
      <div style="overflow: hidden;">
        <div style="margin-top: 40px">
          <h1>Second Page</h1>
          <div>Content</div>
        </div>
      </div>
    `
  }
}

export default SecondPage.define()