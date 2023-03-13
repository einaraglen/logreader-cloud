import express from "express";
import CDPParser from "../../parser/parser";
import Downloader from "../../services/minio/downloader";
import Writer from "../../services/sequelize/writer";
import { v4 as uuidv4 } from "uuid";

const route = express.Router({ mergeParams: true });

route.post("/", async (req, res) => {
    try {
        const downloader = new Downloader(
    "plugin/fbfb4cbf-74ed-4007-8322-20b9475cfbc8.zip"
  );
        const directory = await downloader.download();

        const parser = new CDPParser(`${directory}/SignalLog.db`);
      
        await Writer.insert({ system_id: uuidv4(), result_id: 123, parser });
      
        downloader.cleanup();
    } catch (e) {

    }
})


route.get("/", async (req, res) => {
    try {

    } catch (e) {
        
    }
})