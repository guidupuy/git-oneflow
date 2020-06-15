import BitbucketServer from '@atlassian/bitbucket-server'
import * as config from './config'

const baseUrl = process.env.BITBUCKET_BASE_URL?.trim()
const username = process.env.BITBUCKET_USERNAME?.trim()
const password = process.env.BITBUCKET_PASSWORD?.trim()

console.log(encodeURI(`${baseUrl}/test`))

export const isOK = (): boolean => !!baseUrl && !!username && !!password

const clientOptions = {
  baseUrl,
  headers: {},
  options: {
    timeout: 60000,
  },
}

const client = new BitbucketServer(clientOptions)

if (isOK()) {
  client.authenticate({
    type: 'basic',
    username: username ?? '',
    password: password ?? '',
  })
}

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
  const projectKey = config.getConfigValue('projectKey') ?? ''
  const repositorySlug = config.getConfigValue('repositorySlug') ?? ''
  client.repos.createPullRequest({
    projectKey,
    repositorySlug,
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
