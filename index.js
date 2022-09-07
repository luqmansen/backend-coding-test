'use strict'

require('dotenv').config()
const port = process.env.PORT

const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

const logger = require('./src/logger')
const { migrateUp } = require('./src/schemas')

const main = async () => {
  sqlite3.verbose()
  const db = await open({ filename: ':memory:', driver: sqlite3.Database })
  await migrateUp(db)

  const app = require('./src/app')(db)
  app.listen(port, () => logger.info(`App started and listening on port ${port}`))
}

main()
