import { CDPDataStore, CDPInterface } from "../types";
import CDPUnpacker from "./unpacker";

class CDPCompact implements CDPInterface {

    private unpacker: CDPUnpacker

    constructor(file: string) {
        this.unpacker = new CDPUnpacker(file, CDPDataStore.Compact)
    }

    public parse() {
        return this.unpacker.parse()
    }

    public range() {
        return this.unpacker.range()
    }
}

export default CDPCompact;