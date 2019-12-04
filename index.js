'use strict'

const os = require('os')
const path = require('path')
const util = require('util')
const appRootDir = require('app-root-path')
const pkg = require(appRootDir + path.sep + 'package.json')
const df = util.promisify(require('node-df'))

const healthCheck = (options = {}) => {
  options.path = options.path || '/ping'

  if (options.customCheck && typeof options.customCheck !== 'function') {
    throw new TypeError('`options.customCheck` must be a function')
  }

  return async function healthCheck(ctx, next) {
    if (ctx.request.path === options.path && ctx.request.method === 'GET') {
      const diskInfo = await df()
      const health = {
        timestamp: Date.now(),
        uptime: process.uptime(),
        application: {
          name: pkg.name,
          version: pkg.version,
          pid: process.pid,
          title: process.title,
          argv: process.argv,
          versions: process.versions,
          node_env: process.env.NODE_ENV,
        },

        resources: {
          memory: process.memoryUsage(),
          loadavg: os.loadavg(),
          cpu: os.cpus(),
          disk: diskInfo,
          nics: os.networkInterfaces(),
        },

        system: {
          arch: process.arch,
          platform: process.platform,
          type: os.type(),
          release: os.release(),
          hostname: os.hostname(),
          uptime: os.uptime(),
          cores: os.cpus().length,
          memory: os.totalmem(),
        },
      }
      const custom = options.customCheck ? await options.customCheck(ctx) : {}

      ctx.response.body = options.customCheckOnly ? custom : {
        custom,
        ...health,
      }

      return
    }

    return next()
  }
}

module.exports = healthCheck
