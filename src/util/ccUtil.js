/*********************************************************************
* Licensed Materials - Property of HCL
* (c) Copyright HCL Technologies Ltd. 2018, 2020. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
***********************************************************************/
import CCPipelineMapper from '../mapper/ccPipelineMapper'
import log4js from '@velocity/logger'
import UCVClient from '../api/ucvClient'
import moment from 'moment'

const LOGGER = log4js.getLogger('CCUtil')

export default class CCUtil {
  static async syncPipeline (client, state, repositories, apiUrl) {
    let PromiseArray = []
    let processCounter = 0
    let executionCounter = 0
    const lastRun = state.lastRun
    const lastRunUTC = moment(lastRun).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    const integration = await UCVClient.getIntegrationById(state.trackerId)
    CCPipelineMapper.init(state.tenantId, state.trackerId, integration.name)
    repositories.forEach(repo => {
      PromiseArray.push(this.getDeploymentData(client, lastRunUTC, repo, apiUrl))
    })
    const mappedData = await Promise.all(PromiseArray)
    mappedData.forEach(value => {
      processCounter += value.processCounter
      executionCounter += value.executionCounter
    })
    LOGGER.info(`Synced ${repositories.length} projects ${processCounter} processes and ${executionCounter} executions`)
    LOGGER.info('CircleCI Pipeline and Release data synced successfully.')
  }

  static async getDeploymentData (client, lastRunUTC, repo, apiUrl) {
    let application = await this.getApplication(client, repo)
    let response = await this.getJobExecutions(client, lastRunUTC, repo, application, apiUrl)
    return response
  }

  static async getApplication (client, repo) {
    let application = []
    const project = await client.getProject(repo)
    const transformedApp = CCPipelineMapper.transformApp(project)
    application.push(transformedApp)
    if (application.length > 0) {
      await UCVClient.uploadApplications(application)
      return project
    }
  }

  static async getJobs (workflow, client) {
    const transformedProcesses = []
    const jobs = await client.getJobs(workflow.id)
    if (jobs.items[0] !== null) {
      jobs.items.forEach(job => {
        transformedProcesses.push(CCPipelineMapper.transformProcess(job, workflow))
      })
      return transformedProcesses
    } else {
      LOGGER.error(`No jobs in CircleCI workflow ${workflow.id}`)
      throw new Error(`No jobs in CircleCI workflow ${workflow.id}`)
    }
  }

  static async getJobExecutionsOld (client, lastRunUTC, repo, application) {
    const transformedExecutions = []
    const pipelines = await client.getPipelines(repo)
    for (let pipeline of pipelines.items) {
      if (pipeline.updated_at > lastRunUTC) {
        const workflows = await client.getWorkflows(pipeline.id)
        for (let workflow of workflows.items) {
          const jobs = await client.getJobs(workflow.id)
          jobs.items.forEach(job => {
            if (job.started_at && job.started_at > lastRunUTC) {
              transformedExecutions.push(CCPipelineMapper.transformJobExecutions(job, application, pipeline, workflow))
            }
          })
        }
      }
    }
    if (transformedExecutions.length > 0) {
      await UCVClient.uploadExecutions(transformedExecutions)
      return transformedExecutions.length
    }
  }

  static async getJobExecutions (client, lastRunUTC, repo, application) {
    let processCounter = 0
    let executionCounter = 0
    let transformedExecutions = []
    let transformedProcesses = []
    let uniqueProcesses = []
    let morePipelines = true
    let moreWorkflows = true
    let workflowToken = null
    let moreJobs = true
    let jobToken = null
    let pipelines = await client.getPipelines(repo)
    if (pipelines.items[0] != null) {
      while (morePipelines) {
        for (let pipeline of pipelines.items) {
          if (pipeline.updated_at > lastRunUTC) {
            moreWorkflows = true
            while (moreWorkflows) {
              let workflows = await client.getWorkflows(pipeline.id, workflowToken)
              workflowToken = workflows.next_page_token
              for (let workflow of workflows.items) {
                moreJobs = true
                while (moreJobs) {
                  let jobs = await client.getJobs(workflow.id)
                  jobToken = jobs.next_page_token
                  jobs.items.forEach(job => {
                    if (job.started_at && job.started_at > lastRunUTC) {
                      transformedProcesses.push(CCPipelineMapper.transformProcess(job, workflow))
                      transformedExecutions.push(CCPipelineMapper.transformJobExecutions(job, application, pipeline, workflow))
                    }
                  })
                  if (!jobToken) {
                    moreJobs = false
                  }
                }
              }
              if (!workflowToken) {
                moreWorkflows = false
              }
            }
          } else {
            morePipelines = false
          }
        }
        let processesArr = transformedProcesses.map(item => {
          return [item.name, item]
        }) // creates array of array
        var maparr = new Map(processesArr) // create key value pair from array of array
        uniqueProcesses = [...maparr.values()] // converting back to array from mapobject
        if (uniqueProcesses.length > 0) {
          processCounter += uniqueProcesses.length
          await UCVClient.uploadProcesses(uniqueProcesses)
          transformedProcesses = []
          uniqueProcesses = []
        }
        if (transformedExecutions.length > 0) {
          executionCounter += transformedExecutions.length
          await UCVClient.uploadExecutions(transformedExecutions)
          transformedExecutions = []
        }
        if (pipelines.next_page_token) {
          pipelines = await client.getPipelines(repo, pipelines.next_page_token)
        } else {
          morePipelines = false
        }
      }
      return { processCounter, executionCounter }
    } else {
      LOGGER.error('CircleCI Pipeline should run atleast once before the plugin can sync the data')
      throw new Error('CircleCI Pipeline should run atleast once before the plugin can sync the data')
    }
  }
}
