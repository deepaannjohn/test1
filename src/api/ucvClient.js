/*********************************************************************
* Licensed Materials - Property of HCL
* (c) Copyright HCL Technologies Ltd. 2018, 2020. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
***********************************************************************/
import { VelocityApi } from '@velocity/api-client'
import log4js from '@velocity/logger'

const LOGGER = log4js.getLogger('UCVClient')

export default class UCVClient {
  static async initialize (serverUrl, userAccessKey) {
    if (!this.binding) {
      LOGGER.info('Initializing Velocity API Client.')
      this.binding = new VelocityApi(serverUrl, userAccessKey, { insecure: true, useBearerToken: false })
    }
  }

  static async uploadBuilds (buildDataIn) {
    LOGGER.debug(`syncing builds: ${JSON.stringify(buildDataIn)}`)
    try {
      const result = await this.binding.mutation.uploadBuildDataBulk({ data: buildDataIn })
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async getIntegrationById (integrationId) {
    try {
      const result = await this.binding.query.integrationById({ id: integrationId })
      LOGGER.debug(`Integration data is ${JSON.stringify(result)}`)
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async uploadApplications (applications) {
    LOGGER.debug(`syncing applications: ${JSON.stringify(applications)}`)
    try {
      const result = await this.binding.mutation.uploadApplications({ applications })
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async uploadProcesses (processes) {
    LOGGER.debug(`syncing processes: ${JSON.stringify([processes])}`)
    try {
      const result = await this.binding.mutation.uploadProcesses({ processes })
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async uploadExecutions (executions) {
    LOGGER.debug(`syncing executions: ${JSON.stringify([executions])}`)

    let returnFragment = `{
    ... on DeployMetrics {
      deployName: name
    }
    ... on ExecutionData {
      executionName: name
    }
    ... on BuildData{
      buildName: name    }
}`
    try {
      const result = await this.binding.mutation.uploadExecutions({ executions }, returnFragment)
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }
}
