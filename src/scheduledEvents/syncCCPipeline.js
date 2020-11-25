/*********************************************************************
* Licensed Materials - Property of HCL
* (c) Copyright HCL Technologies Ltd. 2018, 2020. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
***********************************************************************/
import log4js from '@velocity/logger'
import CCClient from '../api/ccClient'
import CCUtil from '../util/ccUtil'
import UCVClient from '../api/ucvClient'
import moment from 'moment'

const LOGGER = log4js.getLogger('syncCCPipeline')

async function execute (state, properties) {
  try {
    let client = new CCClient(properties)
    LOGGER.debug(`Integration State: ${JSON.stringify(state)}`)
    LOGGER.info(`Syncing CirclCI data since lastRun of the plugin at ${moment(state.lastRun).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')}`)
    UCVClient.initialize(state.apiServerUrl, properties.accelerateAccessKey)
    await CCUtil.syncPipeline(client, state, properties.repositories, properties.apiUrl)

    return {
      type: 'PR', // this doesn't matter
      source: 'CircleCI',
      data: []
    }
  } catch (error) {
    LOGGER.error(error)
    throw error
  }
}

export default {
  execute: execute,
  name: 'SyncCCPipeline',
  description: 'Sync CircleCI Pipeline data.',
  interval: 5
}
