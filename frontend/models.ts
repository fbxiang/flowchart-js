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
  export function fillColor(dataType: DataType) {
    switch (dataType) {
    case DataType.Json: return 'yellow';
    case DataType.CSV: return 'green';
    case DataType.Text: return 'lightgray';
    case DataType.Number: return 'blueviolet';
    case DataType.String: return '#669900';
    case DataType.Execution: return 'white';
    case DataType.Boolean: return 'cyan';
    case DataType.Any: return 'white';
    default: return 'black';
    }
  }
  export function strokeColor(dataType: DataType) {
    switch (dataType) {
    case DataType.Json: return 'orange';
    case DataType.CSV: return 'darkgreen';
    case DataType.Text: return 'gray';
    case DataType.Number: return 'purple';
    case DataType.String: return '#558800';
    case DataType.Execution: return 'white';
    case DataType.Boolean: return 'forestgreen';
    case DataType.Any: return 'black';
    default: return 'black';
    }
  }

  export function canCast(a: DataType, b:DataType) {
    if (b == DataType.Any && a != DataType.Execution)
      return true;
    else {
      return a == b
    }
  }
}
