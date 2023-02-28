import { CDPDataTypes } from "../types";

class Reader {

    public static compact(buffer: Buffer) {
        return buffer.readIntLE(2, 2);
    }

    public static split(buffer: Buffer) {
        const id = buffer.readIntLE(2, 2);
        const type = buffer.readIntLE(4, 1);
        const value = this.read(buffer, type, 5);
        
        return { id, value }
    }

    public static read = (
        buffer: Buffer,
        type: number,
        offset: number = 5,
        length: number = 1
      ) => {
        switch (type) {
          case CDPDataTypes.DOUBLE:
            return buffer.readDoubleLE(offset);
          case CDPDataTypes.UINT64:
            return buffer.readBigUInt64LE(offset);
          case CDPDataTypes.INT64:
            return buffer.readBigInt64LE(offset);
          case CDPDataTypes.FLOAT:
            return buffer.readFloatLE(offset);
          case CDPDataTypes.UINT:
            return buffer.readUIntLE(offset, length);
          case CDPDataTypes.INT:
            return buffer.readIntLE(offset, length);
          case CDPDataTypes.USHORT:
            return buffer.readIntLE(offset, length);
          case CDPDataTypes.SHORT:
            return buffer.readIntLE(offset, length);
          case CDPDataTypes.UCHAR:
            return buffer.readIntLE(offset, length);
          case CDPDataTypes.CHAR:
            return buffer.readIntLE(offset, length);
          case CDPDataTypes.BOOL:
            return buffer.readIntLE(offset, length);
          case CDPDataTypes.STRING:
            return buffer.readIntLE(offset, length);
        }
      };

     
}

export default Reader;