export enum DataType {
  Json,
  CSV,
  Text,
  Number,
  String,
  Execution,
  Boolean,
  Any
}

export namespace DataType {
  export function fromString(str: string) {
    if (DataType[str] === undefined) {
      throw Error('unrecognized type');
    }
    return DataType[str];
  }

  export function canCast(a: DataType, b:DataType) {
    if (b == DataType.Any && a != DataType.Execution)
      return true;
    else {
      return a == b
    }
  }

  export function defaultValue(d: DataType) {
    switch (d) {
    case DataType.Json: return "{}";
    case DataType.CSV: return "";
    case DataType.Text: return "";
    case DataType.Number: return 0;
    case DataType.String: return "";
    case DataType.Boolean: return false;
    case DataType.Any: return undefined;
    default: undefined;
    }
  }
}
