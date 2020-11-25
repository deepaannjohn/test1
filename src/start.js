import a from './scheduledEvents/syncCCPipeline'

async function test () {
  await a.execute({
    lastRun: 0,
    trackerId: '5f635ad7f6cfffae1b851141',
    tenantId: '5ade13625558f2c6688d15ce',
    apiServerUrl: 'https://localhost/release-events-api',
    securityToken: 'SOtdm2bA94e9DbPoOWe3SlYrpqGXOzttu2PP8P0m6AN3DjigU0n3UkrLvXhsFp7w8ykK8yydIJg0f9dOW5pTOw'
  },
  {
    accelerateAccessKey: '0e713f25-5af8-4382-a84d-a06a0b1b51ca',
    apiUrl: 'https://circleci.com/api/v2',
    username: 'deepa.ann.john1@gmail.com',
    accessToken: '46100d9ff9b7cdcc4502cbde7844aa17e83d83f9',
    orgName: 'deepaannjohn',
    projectType: 'gh',
    repositories: ['circleci-workflow-oriented'],
    loggingLevel: 'ALL'
  })
  // {
  //   ucvAccessKey: '0e713f25-5af8-4382-a84d-a06a0b1b51ca',
  //   baseUrl: 'https://dev.azure.com',
  //   username: 'deepa.ann.john1@gmail.com',
  //   password: 'ADMIN',
  //   accessToken: 'lbtpwiq3pff7ln2ixxhzcrpimxyrnfwxv3lkjfbrf6zja4fkxtiq',
  //   organization: 'deepaannjohn1',
  //   project: 'Space Game - web - Multistages',
  //   repositories: 'PartsUnlimited',
  //   loggingLevel: 'ALL'
  // })
}

module.exports = test()
