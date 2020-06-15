import * as childProcess from 'child_process'
import * as shelljs from 'shelljs'
import * as log from './log'

const executeOrDie = (cmd: string): void => {
  const shellString = shelljs.exec(cmd, { silent: true })
  const code = shellString.code

  if (code !== 0) {
    log.error(shellString.stderr.replace(/^error:/i, '').trim())
    process.exit(code)
  }
}

const noErrorsExec = (cmd: string): boolean =>
  0 === shelljs.exec(cmd, { silent: true }).code

export const isOK = (): boolean => noErrorsExec('git status')

export const getLocalBranches = (exclude?: string): string[] | undefined => {
  const shellString = shelljs.exec('git branch', { silent: true })

  if (shellString.code === 0)
    return shellString.stdout
      .replace(new RegExp(`\\W+|${exclude}`, 'gm'), ' ')
      .trim()
      .split(' ')
}

export const branchExists = (name: string): boolean => {
  const cmd = `git show-ref refs/heads/${name}`
  if (process.env.GOF_CHICKENOUT) {
    log.info('dry-run', cmd)
    return true
  }
  return noErrorsExec(cmd)
}

export const isValidBranchName = (name: string): boolean => {
  const cmd = `git check-ref-format --branch ${name}`
  if (process.env.GOF_CHICKENOUT) {
    log.info('dry-run', cmd)
    return true
  }
  return noErrorsExec(cmd)
}

export const getCurrentBranch = (): string => {
  return shelljs.exec('git symbolic-ref --short HEAD', { silent: true }).trim()
}

export const createBranch = (name: string, ref?: string | false): void => {
  const cmd = `git checkout -b ${name}${ref ? ` ${ref}` : ''}`
  if (process.env.GOF_CHICKENOUT) log.info('dry-run', cmd)
  else executeOrDie(cmd)
}

export const getLatestTag = (): string | undefined => {
  const sstring = shelljs.exec('git describe --abbrev=0', { silent: true })
  return 0 === sstring.code ? sstring.trim() : undefined
}

export const rebase = (onto: string, interactive?: boolean): void => {
  if (process.env.GOF_CHICKENOUT)
    log.info('dry-run', `git rebase ${interactive ? '-i ' : ''}${onto}`)
  else if (interactive)
    childProcess.spawnSync('git', ['rebase', '-i', `${onto}`], {
      stdio: 'inherit',
    })
  else executeOrDie(`git rebase ${onto}`)
}

export const checkoutBranch = (branch: string): void => {
  const cmd = `git checkout ${branch}`
  if (process.env.GOF_CHICKENOUT) log.info('dry-run', cmd)
  else executeOrDie(cmd)
}

export const tagBranch = (tag: string, message?: string): void => {
  if (process.env.GOF_CHICKENOUT)
    log.info('dry-run', `git tag ${message ? `-a -m '${message}' ` : ''}${tag}`)
  else if (message) executeOrDie(`git tag -a -m '${message}' ${tag}`)
  else executeOrDie(`git tag ${tag}`)
}

export const mergeBranch = (from: string, strategy?: string): void => {
  const cmd = `git merge ${strategy ? `${strategy} ` : ''}${from}`
  if (process.env.GOF_CHICKENOUT) log.info('dry-run', cmd)
  else executeOrDie(cmd)
}

export const pullFromOrigin = (branch: string): void => {
  if (process.env.GOF_CHICKENOUT)
    log.info('dry-run', `git pull origin ${branch}`)
  else executeOrDie(`git pull origin ${branch}`)
}

export const pushToOrigin = (branch: string, tag?: string | boolean): void => {
  if (process.env.GOF_CHICKENOUT)
    log.info(
      'dry-run',
      `git push ${tag ? '--follow-tags ' : ''}origin ${branch}`
    )
  else if (tag) executeOrDie(`git push --follow-tags origin ${branch}`)
  else executeOrDie(`git push origin ${branch}`)
}

export const deleteBranch = (branch: string, remote = false): void => {
  if (process.env.GOF_CHICKENOUT)
    log.info(
      'dry-run',
      `git ${remote ? 'push origin :' : 'branch -d '}${branch}`
    )
  else if (remote) executeOrDie(`git push origin :${branch}`)
  else executeOrDie(`git branch -d ${branch}`)
}
