import BorshchRouterManager from './borshch-router-manager'
import {BrowserHistory} from '../../dependencies'

export default new BorshchRouterManager({history: new BrowserHistory()})
