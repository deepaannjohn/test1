/*********************************************************************
* Licensed Materials - Property of HCL
* (c) Copyright HCL Technologies Ltd. 2018, 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
***********************************************************************/
import log4js from '@velocity/logger'
import _ from 'lodash'
import request from 'request-promise'
import util from 'util'
import UrlParse from 'url-parse'
import { PROJECT_PATH, PIPELINES_PATH, WORKFLOWS_PATH, JOBS_PATH, PIPELINES_PATH_NO_TOKEN, WORKFLOWS_PATH_NO_TOKEN } from '../constants'

const LOGGER = log4js.getLogger('CCClient')

export default class CCClient {
  constructor (props) {
    this.url = props.apiUrl
    this.organization = props.orgName
    this.repositories = props.repositories
    this.projectType = props.projectType
    this.accessToken = props.accessToken
    this.proxyServer = props.proxyServer
    this.proxyUsername = props.proxyUsername
    this.proxyPassword = props.proxyPassword
  }

  async getProject (repo) {
    let uri = util.format(PROJECT_PATH, this.url, this.projectType, this.organization, repo)
    const result = await this.doRequest('GET', uri)
    if (result.success) {
      return result.payload
    } else {
      LOGGER.error(result.error)
      throw result.error
    }
  }

  async getPipelines (repo, token) {
    let uri
    if (token) {
      uri = util.format(PIPELINES_PATH, this.url, this.projectType, this.organization, repo, token)
    } else {
      uri = util.format(PIPELINES_PATH_NO_TOKEN, this.url, this.projectType, this.organization, repo)
    }
    const result = await this.doRequest('GET', uri)
    if (result.success) {
      return result.payload
    } else {
      LOGGER.error(result.error)
      throw result.error
    }
  }

  async getWorkflows (pipelineId, token) {
    let uri
    if (token) {
      uri = util.format(WORKFLOWS_PATH, this.url, pipelineId, token)
    } else {
      uri = util.format(WORKFLOWS_PATH_NO_TOKEN, this.url, pipelineId)
    }
    const result = await this.doRequest('GET', uri)
    if (result.success) {
      return result.payload
    } else {
      LOGGER.error(result.error)
      throw result.error
    }
  }

  async getJobs (workflowId) {
    let uri = util.format(JOBS_PATH, this.url, workflowId)
    const result = await this.doRequest('GET', uri)
    if (result.success) {
      return result.payload
    } else {
      LOGGER.error(result.error)
      throw result.error
    }
  }

  async doRequest (reqMethod, reqUri, reqBody = null, reqHeaders = {}, fullResponse = false, authReqd = true) {
    /* Common headers for all endpoints */
    reqHeaders['Accept'] = 'application/json'
    reqHeaders['Content-Type'] = 'application/json'

    var options = {
      method: reqMethod,
      uri: reqUri,
      headers: reqHeaders,
      auth: { user: this.accessToken, pass: '' },
      json: true,
      resolveWithFullResponse: fullResponse
    }

    if (reqBody != null) {
      options.body = reqBody
    }
    let proxiedRequest = request.defaults({ proxy: null })
    if (this.proxyServer !== undefined) {
      const proxyServerParsed = new UrlParse(this.proxyServer)
      const proxy = `${proxyServerParsed.protocol}//${this.proxyUsername}:${this.proxyPassword}@${proxyServerParsed.host}`
      LOGGER.debug(`Running with Proxy: ${proxy}`)
      proxiedRequest = request.defaults({ proxy: proxy })
    }
    LOGGER.debug(`Running HTTP request with options:\r\n${JSON.stringify(options)}`)

    return proxiedRequest(options)
      .then(function (response) {
        LOGGER.debug(`HTTP Response body: ${JSON.stringify(response)}`)
        return {
          success: true,
          payload: response
        }
      })
      .catch(function (err) {
        return {
          success: false,
          error: err
        }
      })
  }
}
