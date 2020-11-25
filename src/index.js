/*********************************************************************
* Licensed Materials - Property of HCL
* (c) Copyright HCL Technologies Ltd. 2018, 2020. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
***********************************************************************/
import SyncCCPipeline from './scheduledEvents/syncCCPipeline'

export default {
  properties: [
    {
      label: 'HCL Accelerate User Access Key',
      name: 'accelerateAccessKey',
      type: 'Secure',
      description: 'The user access key to authenticate with the HCL Accelerate server.',
      required: true,
      defaultValue: '0e713f25-5af8-4382-a84d-a06a0b1b51ca'
    },
    {
      label: 'API URL',
      name: 'apiUrl',
      description: 'API URL of CircleCI.',
      required: true,
      type: 'String',
      defaultValue: 'https://circleci.com/api/v2'
    },
    {
      label: 'Project type (VCS provider)',
      name: 'projectType',
      type: 'String',
      description: 'The Version Control System that is used, eg: github, bitbucket.',
      defaultValue: 'gh',
      required: true
    },
    {
      label: 'Organization Name',
      name: 'orgName',
      type: 'String',
      description: 'The username or organization name in version control system.',
      required: true,
      defaultValue: 'deepaannjohn'
    },
    {
      label: 'Repositories',
      name: 'repositories',
      type: 'Array',
      description: 'A list of repositories from which to import pull requests, commits, and build data.',
      required: true,
      defaultValue: ['circleci-workflow-oriented']
    },
    {
      label: 'Access Token',
      name: 'accessToken',
      type: 'Secure',
      description: 'The access token to authenticate with the CircleCI server.',
      required: true,
      defaultValue: '46100d9ff9b7cdcc4502cbde7844aa17e83d83f9'
    },
    {
      name: 'proxyServer',
      label: 'Proxy Server',
      type: 'String',
      description: 'The URL of the proxy server including the port number. The URL protocol can be http or https.',
      required: false,
      hidden: true
    },
    {
      name: 'proxyUsername',
      label: 'Proxy User Name',
      type: 'String',
      description: 'The user name used to authenticate with the proxy server.',
      required: false,
      hidden: true
    },
    {
      name: 'proxyPassword',
      label: 'Proxy Password',
      type: 'Secure',
      description: 'The password used to authenticate with the proxy server.',
      required: false,
      hidden: true
    }
  ],
  endpoints: [],
  scheduledEvents: [SyncCCPipeline],
  taskDefinitions: [],
  eventTriggers: [],
  qualityHandlers: [],
  pipelineDefinition: {
    importsApplications: true,
    importsVersions: false,
    importsEnvironments: false
  },
  displayName: 'CircleCI',
  pluginId: 'ucv-ext-circleci',
  description: 'The CircleCI plug-in imports and synchronizes CI/CD data from CircleCI.'
}
