export enum CDPDataStore {
  Basic = "basic",
  Compact = "compact",
  Split = "split",
}

export interface CDPInterface {
  parse: () => void;
  range: () => any;
  map: () => Map<string, SignalData>
}

export type CompactTables = {
  values: string;
  info: string;
  map: string;
};

export type SignalData = {
  id?: number;
  name: string;
  path?: string;
  type?: string;
};


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
  STRING,
}

export const columns: Record<string, CompactTables> = {
    compact: {
      info: "KeyValue",
      values: "SignalValues",
      map: "SignalMap",
    },
    split: {
      info: "KeyValue",
      values: "NodeValues",
      map: "Node",
    },
  };
  

export const getTypeFromString = (type: string) => {
  const match = (Object.freeze(CDPDataTypes) as any)[type.toUpperCase()];

  if (match == null) {
    throw new Error(`Data type ${type} not supported!`);
  }

  return match;
};
