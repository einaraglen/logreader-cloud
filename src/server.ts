/* eslint no-unmodified-loop-condition: "off" */
import CDPParser from "./parser/parser";
import Writer from "./services/sequelize/writer";
import Downloader from "./services/minio/downloader";

const run = async () => {

  const downloader = new Downloader('plugin/2c42796c-29b4-4496-9dd7-a490f9853a0d.zip')

  const directory = await downloader.download()

  const parser = new CDPParser(`${directory}/SignalLog.db`)

  parser.parse()

  Writer.insert(123, parser)


};

export default run;
