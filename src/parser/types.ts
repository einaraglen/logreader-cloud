export enum CDPDataStore {
    Basic = "basic",
    Compact = "compact",
    Split = "split"
}

export enum CDPDataTypes {
    UNDEFINED,
    DOUBLE,
    UINT64,
    INT64,
    FLOAT,
    UINT,
    INT,
    USHORT,
    SHORT,
    UCHAR,
    CHAR,
    BOOL,
    STRING
}

export const getTypeFromString = (type: string) => {
    const match = (Object.freeze(CDPDataTypes) as any)[type.toUpperCase()]

    if (match == null) {
        throw new Error(`Data type ${type} not supported!`)
    }

    return match
}