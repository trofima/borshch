import {BorshchComponent} from '../../../src'

class HomePage extends BorshchComponent {
  render() {
    return `
    <div style="overflow: hidden;">
      <div style="margin-top: 40px;">
        <h1>Home Page</h1>
        <div>Content</div>
      </div>
    </div>
  `
  }
}

export default HomePage.define()
