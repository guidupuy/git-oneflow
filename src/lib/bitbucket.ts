import BitbucketServer from '@atlassian/bitbucket-server'
import * as config from './config'

const projectKey = config.getConfigValue('projectKey')
const repositorySlug = config.getConfigValue('repositorySlug')
const baseUrl = process.env.BITBUCKET_BASE_URL
const username = process.env.BITBUCKET_USERNAME
const password = process.env.BITBUCKET_PASSWORD

export const isOK = (): boolean =>
  !!projectKey && !!repositorySlug && !!baseUrl && !!username && !!password

const clientOptions = {
  baseUrl: process.env.BITBUCKET_BASE_URL,
  headers: {},
  options: {
    timeout: 10,
  },
}

const client = new BitbucketServer(clientOptions)
client.authenticate({
  type: 'basic',
  username: process.env.BITBUCKET_USERNAME ?? '',
  password: process.env.BITBUCKET_PASSWORD ?? '',
})

export enum PRType {
  Feature = 'feature',
  Release = 'release',
  Hotfix = 'hotfix',
}

export const createPR = (
  type: PRType,
  name: string,
  targetBranch: string | undefined
): void => {
  client.repos.createPullRequest({
    projectKey: projectKey ?? '',
    repositorySlug: repositorySlug ?? '',
    body: {
      title: `Merge ${type} branch ${name}`,
      fromRef: {
        id: `refs/heads/${type}/${name}`,
        repository: {
          slug: repositorySlug,
          name: null,
          project: {
            key: projectKey,
          },
        },
      },
      toRef: {
        id: `refs/heads/${targetBranch ?? 'master'}`,
        repository: {
          slug: repositorySlug,
          name: null,
          project: {
            key: projectKey,
          },
        },
      },
      // eslint-disable-next-line
      close_source_branch: false,
    },
  })
}
