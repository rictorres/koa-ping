'use strict'

const Koa = require('koa')
const health = require('../index')

const app = new Koa()

// using the default (/ping)
// app.use(health())

// OR using custom URL
const customUrl = '/nonpublic/ping'
app.use(health({ path: customUrl }))

app.listen(3000)

const message = customUrl.length > 0 ? customUrl : '/ping'
console.log(`Ready. http://localhost:3000${message} to check health`)
