import BorshchRouterManager from './borshch-router-manager.js'
import {BrowserHistory, WebPage} from '../../dependencies/index.js'

export default new BorshchRouterManager({
  history: new BrowserHistory(),
  page: new WebPage(),
})
