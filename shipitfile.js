/* eslint-disable import/no-extraneous-dependencies */

const deploy = require('shipit-deploy')
const shared = require('shipit-shared')
const { apps } = require('./process.json')

/**
 * @param {Shipit} shipit
 */
module.exports = shipit => {
  deploy(shipit)
  shared(shipit)

  shipit.initConfig({
    default: {
      deployTo: '/home/deploy/markets-server',
      keepReleases: 5,
      repositoryUrl: 'https://github.com/horizontalsystems/markets-server.git',
      shared: {
        overwrite: true,
        files: ['.env', '.bq-key.json'],
        dirs: ['node_modules', 'docs']
      }
    },
    prod_api: {
      branch: 'master',
      servers: ['deploy@159.89.94.233'],
    },
    prod_syncer: {
      branch: 'master',
      servers: ['deploy@147.182.167.89'],
    },
    prod_syncer2: {
      branch: 'master',
      servers: ['deploy@134.122.121.230'],
    },
    dev_api: {
      branch: 'develop',
      servers: ['ubuntu@64.227.4.125'],
      deployTo: '/home/ubuntu/markets-server',
    }
  })

  const remote = cmd => {
    shipit.remote(`cd ${shipit.config.deployTo}/current && ${cmd}`)
  }

  apps.forEach(({ name: app }) => {
    shipit.blTask(`${app}:start`, () => {
      shipit.start(`${app}:restart`)
    })

    shipit.blTask(`${app}:stop`, () => {
      remote(`pm2 stop process.json --only ${app}`)
    })

    shipit.blTask(`${app}:delete`, () => {
      remote(`pm2 delete process.json --only ${app}`)
    })

    shipit.blTask(`${app}:restart`, () => {
      remote(`pm2 startOrRestart process.json --env production --only ${app}`)
    })

    shipit.blTask(`${app}:logs`, () => {
      remote(`pm2 logs ${app}`)
    })
  })

  shipit.on('deployed', () => shipit.start('npm:install'))
  shipit.on('rollback', () => shipit.start('npm:install'))

  shipit.blTask('npm:install', async () => {
    remote('npm install --production')
  })

  shipit.blTask('copy-env', () => {
    shipit.copyToRemote('.env.prod', `${shipit.config.deployTo}/shared/.env`)
  })

  shipit.blTask('setup:node', async () => {
    // enable interactive mode in .bashrc
    // # case $- in
    // #     *i*) ;;
    // #       *) return;;
    // # esac

    await shipit.remote('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash')
    await shipit.remote('nvm install --lts')
    await shipit.remote('nvm install-latest-npm')
    await shipit.remote('npm install pm2 -g')
  })
}
