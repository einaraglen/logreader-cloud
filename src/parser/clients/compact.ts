import { CDPDataStore, CDPInterface } from "../types";
import CSVStream from "./csv";
import CDPUnpacker from "./unpacker";

class CDPCompact implements CDPInterface {
    private unpacker: CDPUnpacker
    private stream: CSVStream
    
    constructor(file: string, stream: CSVStream) {
        this.stream = stream;
        this.unpacker = new CDPUnpacker(file, CDPDataStore.Compact)
    }

    public parse() {
        this.unpacker.parse(this.stream)
    }

    public range() {
        return this.unpacker.range()
    }

    public map() {
        return this.unpacker.map()
    }
}

export default CDPCompact;