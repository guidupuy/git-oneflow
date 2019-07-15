/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import inquirer from 'inquirer'

import { success, error } from '../utils/text'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { CommandModule, Arguments } from 'yargs'
import { isValidBranchName, writeConfigFile, ConfigValues } from '../core'

export class Init implements CommandModule {
  public command = 'init [options]'

  public describe = 'Generate a config file'

  public handler = async (argv: Arguments) => {
    try {
      const jsonValues: ConfigValues = await inquirer.prompt(
        generateQuestions(argv)
      )

      console.log(JSON.stringify(jsonValues, null, 2))

      if (await askConfirmationBeforeWrite()) {
        if (writeConfigFile({ data: jsonValues })) {
          console.log(success('Initialisation done!'))
        } else {
          console.error(error('Cannot write config file!'))
        }
      }
    } catch (err) {
      console.error(error(err))
    }
  }
}

const generateQuestions = (argv: Arguments): any => {
  return [
    {
      name: 'main',
      type: 'input',
      message: 'Main (production) branch:',
      default: argv.main || 'master',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      name: 'usedev',
      type: 'confirm',
      default: argv.usedev || false,
      message: 'Do you use a development branch?'
    },
    {
      name: 'development',
      type: 'input',
      message: 'Development branch:',
      default: argv.development || 'develop',
      when: function (answers: { [key: string]: any }) {
        return answers.usedev
      },
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      name: 'feature',
      type: 'input',
      message: 'Feature branch:',
      default: argv.feature || 'feature',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      name: 'release',
      type: 'input',
      message: 'Release branch:',
      default: argv.release || 'release',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      name: 'hotfix',
      type: 'input',
      message: 'Hotfix branch:',
      default: argv.hotfix || 'hotfix',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      type: 'list',
      name: 'integration',
      message: 'Which feature branch integration method do you want to use?',
      default: argv.integration || 1,
      choices: [
        {
          name:
            'Integrate feature branch with main/development using rebase (rebase -> merge --ff-only).',
          value: 1,
          short: 'rebase'
        },
        {
          name:
            'Feature is merged in main/development à la GitFlow (merge --no-ff).',
          value: 2,
          short: 'merge --no-ff'
        },
        {
          name:
            'Mix the previous two: rebase and merge (rebase -> merge --no-ff).',
          value: 3,
          short: 'rebase + merge --no-ff'
        }
      ]
    },
    {
      name: 'interactive',
      type: 'expand',
      message: 'Do you want to use rebase interactively (rebase -i)?',
      default: argv.interactive || 'always',
      choices: [
        {
          key: 'y',
          name: 'Always',
          value: 'always'
        },
        {
          key: 'n',
          name: 'Never',
          value: 'never'
        },
        {
          key: 'a',
          name: 'Ask me every time',
          value: 'ask'
        }
      ],
      when: function (answers: { [key: string]: any }) {
        return answers.integration !== 2
      }
    },
    {
      name: 'push',
      type: 'expand',
      message: 'Do you want to push to origin after merging?',
      default: argv.push || 'always',
      choices: [
        {
          key: 'y',
          name: 'Always',
          value: 'always'
        },
        {
          key: 'n',
          name: 'Never',
          value: 'never'
        },
        {
          key: 'a',
          name: 'Ask me every time',
          value: 'ask'
        }
      ]
    },
    {
      name: 'delete',
      type: 'expand',
      message: 'Do you want to delete working branch after merging?',
      default: argv.push || 'always',
      choices: [
        {
          key: 'y',
          name: 'Always',
          value: 'always'
        },
        {
          key: 'n',
          name: 'Never',
          value: 'never'
        },
        {
          key: 'a',
          name: 'Ask me every time',
          value: 'ask'
        }
      ]
    },
    {
      name: 'tags',
      type: 'confirm',
      default: argv.usedev || true,
      message: 'Do you want automatic tagging of releases/hotfixes?'
    }
  ]
}

async function askConfirmationBeforeWrite () {
  const ans: { write: boolean } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'write',
      message: 'Write to config file?'
    }
  ])
  return ans.write
}
