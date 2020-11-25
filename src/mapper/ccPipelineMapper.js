import _ from 'lodash'
import { BASE_URL } from '../constants'

export default class CCPipelineMapper {
  static init (tenantId, integrationId, integrationName) {
    this.tenantId = tenantId
    this.integrationId = integrationId
    this.integrationName = integrationName
    this.typePrefix = 'ucv-ext-circleci'
  }

  static commonTransform (object, result) {
    result.tenant_id = this.tenantId
    result.external_id = object.id
    result.name = object.name
  }

  static transformApp (app) {
    let result = {
      active: true,
      type: this.typePrefix
    }
    this.commonTransform(app, result)
    result.external_id = app.slug
    result.json_data = {}
    result.json_data.integration_id = this.integrationId
    return result
  }

  static transformProcess (job, workflow) {
    let result = {
      external_app_id: job.project_slug,
      active: true,
      type: this.typePrefix
    }
    this.commonTransform(job, result)
    result.external_id = `${workflow.name}/${job.name}`
    result.name = `${workflow.name}/${job.name}`
    result.json_data = {}
    result.json_data.instanceName = this.integrationName
    result.parameters = {
      name: 'Pipeline Number',
      type: 'TextParameterDefinition',
      description: 'Pipeline Execution Number'
    }
    return result
  }

  static transformJobExecutionsOld (job, application, pipeline) {
    let status
    switch (job.status) {
      case 'failed':
        status = 'failure'
        break
      case 'on_hold':
      case 'blocked':
        status = 'in_progress'
        break
      case 'success':
        status = 'success'
        break
      default:
        status = 'failure'
        break
    }
    let result = {
      tenantId: this.tenantId,
      id: pipeline.number.toString(),
      name: pipeline.number.toString(),
      versionName: pipeline.number.toString(),
      status: status,
      application: {
        name: application.name,
        external_id: application.slug
      },
      url: `${BASE_URL}/${application.slug}/${job.job_number}`,
      startTime: job.started_at,
      endTime: job.stopped_at || undefined,
      requestor: pipeline.trigger.actor.login,
      revision: pipeline.vcs.revision,
      labels: job.name,
      history: []
    }
    return result
  }

  static getBuildStatus (jobStatus) {
    let status
    switch (jobStatus) {
      case 'failed':
        status = 'failure'
        break
      case 'on_hold':
      case 'blocked':
        status = 'in_progress'
        break
      case 'success':
        status = 'success'
        break
      default:
        status = 'failure'
        break
    }
    return status
  }

  static getDeploymentResult (jobStatus) {
    let status
    switch (jobStatus) {
      case 'failed':
      case 'blocked':
        status = 'FAULTED'
        break
      case 'on_hold':
        status = 'AWAITING_APPROVAL'
        break
      case 'success':
        status = 'SUCCEEDED'
        break
      default:
        status = 'FAULTED'
        break
    }
    return status
  }

  static transformJobExecutions (job, application, pipeline, workflow) {
    let result = {
      externalId: pipeline.number.toString(),
      externalProcessId: `${workflow.name}/${job.name}`,
      name: pipeline.number.toString(),
      tenantId: this.tenantId,
      startTime: job.started_at,
      endTime: job.stopped_at || undefined,
      type: 'uvc-ext-circleci',
      url: `${BASE_URL}/${application.slug}/${job.job_number}`,
      labels: [job.name],
      steps: [],
      status: this.getBuildStatus(job.status),
      parameters: [{
        name: 'Pipeline Number',
        value: pipeline.number.toString()
      }],
      buildData: {
        requestor: pipeline.trigger.actor.login,
        revision: pipeline.vcs.revision,
        branch: pipeline.vcs.branch,
        history: [],
        teams: [],
        number: job.job_number,
        versionName: pipeline.number.toString()
      },
      deployData: {
        result: this.getDeploymentResult(job.status),
        byUser: pipeline.trigger.actor.login
      },
      jsonData: {}
    }
    return result
  }
  static transformDeployments (deployment, application) {
    let envName = _.get(deployment, 'releaseEnvironment.name', 'default')
    let result = {
      name: deployment.number,
      tenant_id: this.tenantId,
      id_external: deployment.id,
      version_id_external: deployment.number,
      version_name: deployment.number,
      application: {
        name: application.name,
        external_id: application.slug
      },
      type: this.typePrefix,
      start_time: deployment.created_at,
      end_time: deployment.completedOn, //
      environment_id: deployment.definitionEnvironmentId.toString(), 
      environment_name: envName,
      by_user: _.get(deployment, 'requestedBy.displayName', 'default'),
      url: deployment.release.webAccessUri,
      result: this.getTaskStatus(deployment.deploymentStatus)
    }
    return result
  }

  static getTaskStatus (deploymentStatus) {
    let status
    let state = deploymentStatus

    switch (state) {
      case 'failed':
      case 'partiallySucceeded':
        status = 'failure'
        break
      case 'inProgress':
      case 'notDeployed':
      case 'undefined':
        status = 'in_progress'
        break
      case 'succeeded':
        status = 'success'
        break
      default:
        status = 'failure'
        break
    }
    return status
  }
  static getPipelineRunStatus (task) {
    let result = task.result
    let state = task.state
    let status

    switch (state) {
      case 'canceling':
      case 'inProgress':
      case 'unknown':
        status = 'in_progress'
        break
      case 'completed':
        switch (result) {
          case 'canceled':
          case 'failed':
          case 'unknown':
            status = 'failure'
            break
          case 'succeeded':
            status = 'success'
            break
        }
        break
      default:
        status = 'failure'
        break
    }
    return status
  }
  static transformPipelineExecutions (pipelineExecution, application) {
    let result = {
      name: `CI job deployment`,
      tenant_id: this.tenantId,
      id_external: (pipelineExecution.id).toString(),
      version_id_external: (pipelineExecution.id).toString(),
      version_name: pipelineExecution.name,
      application: {
        name: application.name,
        external_id: application.id
      },
      type: this.typePrefix,
      start_time: pipelineExecution.createdDate,
      end_time: pipelineExecution.finishedDate,
      environment_id: `Pipeline Env-${pipelineExecution.pipeline.id}`,
      environment_name: `Pipeline Env-${pipelineExecution.pipeline.name}`,
      by_user: 'Azure Pipeline',
      url: pipelineExecution.logUrl,
      result: this.getPipelineRunStatus(pipelineExecution),
      json: pipelineExecution
    }
    return result
  }
}
