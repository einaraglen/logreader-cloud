import Config from './config'
import run from './server'
import { Minio } from './services/minio/client'
import Logger from './services/output/logger'
import { Sequelize } from './services/sequelize/client'

(async () => {
  Logger.pending("Starting server...")
  await Config()
  await Sequelize()
  Minio()
  Logger.info("Server Ready!")
  run()
})()