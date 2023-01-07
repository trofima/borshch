import BorshchRouterManager from './borshch-router-manager'
import {BrowserHistory, WebPage} from '../../dependencies'

export default new BorshchRouterManager({
  history: new BrowserHistory(),
  page: new WebPage(),
})
