export enum DataType {
  Json,
  CSV,
  Text,
  Number,
  String
}

export namespace DataType {
  export function fillColor(dataType: DataType) {
    switch (dataType) {
    case DataType.Json: return 'yellow';
    case DataType.CSV: return 'green';
    case DataType.Text: return 'white';
    case DataType.Number: return 'blueviolet';
    case DataType.String: return 'gray';
    default: return 'black';
    }
  }
  export function strokeColor(dataType: DataType) {
    switch (dataType) {
    case DataType.Json: return 'orange';
    case DataType.CSV: return 'darkgreen';
    case DataType.Text: return 'gray';
    case DataType.Number: return 'purple';
    case DataType.String: return 'black';
    default: return 'black';
    }
  }
}
