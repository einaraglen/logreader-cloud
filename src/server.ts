/* eslint no-unmodified-loop-condition: "off" */

import { CDPDataStore } from "./parser/types";
import CDPUnpacker from "./parser/clients/unpacker";


const run = () => {
   const unpacker = new CDPUnpacker("./assets/split/SignalLog0.db", CDPDataStore.Split)
   const values = unpacker.parse()
   console.log(values.get(3))
}

export default run;