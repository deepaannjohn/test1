import log4js from '@velocity/logger'
import Wrapper from '@velocity/ucv-ext-npm-wrapper'

import plugin from './index'

let instance = new Wrapper(plugin, log4js)

instance.run()
