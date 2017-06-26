export enum DataType {
  Json,
  CSV,
  Text,
  Number,
  String,
  Execution
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
    default: return 'black';
    }
  }
}
