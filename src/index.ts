import Config from './config'
import run from './server'
import Logger from './services/output/logger'
import { Sequelize } from './services/sequelize/client'

(async () => {
  Logger.pending("Starting server...")
  await Config()
  await Sequelize()
  Logger.info("Server Ready!")
  run()
})()