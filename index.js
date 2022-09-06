'use strict'

require('dotenv').config()
const port = process.env.PORT

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')
const logger = require('./src/logger')

const { migrateUp } = require('./src/schemas')

db.serialize(() => {
  migrateUp(db)

  const app = require('./src/app')(db)

  app.listen(port, () => logger.info(`App started and listening on port ${port}`))
})
