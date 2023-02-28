/* eslint no-unmodified-loop-condition: "off" */
import CDPParser from "./parser/parser";


const run = () => {
    const parser = new CDPParser("./assets/compact/SignalLog.db")
    const data = parser.parse()
    console.log(Array.from(data).at(3))
}

export default run;