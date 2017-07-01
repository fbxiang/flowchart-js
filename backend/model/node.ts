import { DataType } from './data-type';
import { Link } from './link';
import { spawn } from 'child_process';

export class Port {
  constructor(public dataType: DataType, public parentNode: Node) { }
}

export class PortIn extends Port {
  inLink: Link = null;
}

export class PortOut extends Port {
  outLinks: Link[] = [];
}

export class NodeSpec {
  _minInputs: number = 0;
  _maxInputs: number = Infinity;
  _minOutputs: number = 0;
  _maxOutputs: number = Infinity;

  inputs(min: number, max: number) { this._minInputs = min; this._maxInputs = max; return this; }
  outputs(min: number, max: number) { this._maxOutputs = min; this._maxOutputs = max; return this; }

  _inputType(i: number, total: number): DataType { return DataType.Any; }
  _outputType(i: number, total: number): DataType { return DataType.Any; }

  inputType(func: (i: number, total: number) => DataType) { this._inputType = func; return this; }
  outputType(func: (i: number, total: number) => DataType) { this._outputType = func; return this; }

  _textInputs: number;
  _textChecker(i: number, text: string): boolean { return true };

  textInputs(n: number) { this._textInputs = n; return this; }
  textChecker(func: (i: number, text: string) => boolean) { this._textChecker = func; return this };

  checkInOut(node: Node) {
    if (!(node.inputs.length >= this._minInputs && node.inputs.length <= this._maxInputs))
      throw Error(`Invalid Input: ${node.inputs.length}; Expected: ${this._minInputs, this._maxInputs}`);

    if (!(node.outputs.length >= this._minOutputs && node.outputs.length <= this._maxOutputs))
      throw Error(`Invalid Output: ${node.outputs.length}; Expected: ${this._minOutputs, this._maxOutputs}`);
  }

  checkInOutType(node: Node) {
    node.inputs.forEach((input, i) => {
      if (!(input.dataType == this._inputType(i, node.inputs.length)))
        throw Error(`Invalid Input type: ${input.dataType} at ${i}; Expected: ${this._inputType(i, node.inputs.length)}`);
      node.outputs.forEach((output, i) => {
        if (!(node.outputs.every((output, i) => output.dataType == this._outputType(i, node.outputs.length))))
          throw Error(`Invalid Output type: ${output.dataType} at ${i}; Expected: ${this._outputType(i, node.outputs.length)}`);
      })
    })
  }

  checkTextInput(node: Node) {
    if (!(node.textInputs.length == this._textInputs))
      throw Error(`Invalid text input length: ${node.textInputs.length}; Expected: ${this._textInputs}`);
    node.textInputs.forEach((value, i) => {
      if (!(this._textChecker(i, value))) {
        throw Error(`Text input check failed at ${i}; Text: ${value};`);
      }
    })
  }

  check(node: Node) {
    this.checkInOut(node);
    this.checkInOutType(node);
    this.checkTextInput(node);
  }
}

export class Node {
  spec: NodeSpec = new NodeSpec();
  textInputs: string[] = [];
  inputs: PortIn[] = [];
  outputs: PortOut[] = [];

  getClass() {
    return this.constructor.name;
  }

  execute(inputs: any[], done: (outputs: any[]) => any) {
    done([]);
  }
}

export namespace Node {

  export function fromJson(json) {
    console.log(json.id);
    const newNode = new Node[json.id]() as Node; // create node of the right class
    newNode.inputs = json.inputs.map(input => new PortIn(DataType.fromString(input.dataType), newNode));
    newNode.outputs = json.outputs.map(output => new PortOut(DataType.fromString(output.dataType), newNode));
    newNode.textInputs = json.textInputs.map(input => input.text);
    newNode.spec.check(newNode);
    return newNode;
  }

  export class NodeAdd extends Node {
    constructor() {
      super();
      this.spec = new NodeSpec()
        .inputs(2, Infinity)
        .outputs(1, 1)
        .textInputs(0)
        .inputType(() => DataType.Number)
        .outputType(() => DataType.Number);
    }

    execute(inputs: any[], done) {
      if (!inputs.every(n => typeof n === 'number'))
        throw new Error('Some input is not a number')
      done([inputs.reduce((a, b) => a+b, 0)]);
    }
  }

  export class NodeMultiply extends Node {
    constructor() {
      super();
      this.spec = new NodeSpec()
        .inputs(2, Infinity)
        .outputs(1, 1)
        .textInputs(0)
        .inputType(() => DataType.Number)
        .outputType(() => DataType.Number);
    }

    execute(inputs: any[], done) {
      if (!inputs.every(n => typeof n === 'number'))
        throw new Error('Some input is not a number');
      done([inputs.reduce((a, b) => a + b, 0)]);
    }
  }

  class NodeNumber extends Node {
    constructor() {
      super();
      this.spec = new NodeSpec()
        .inputs(0, 0)
        .outputs(1, 1)
        .textInputs(1)
        .outputType(() => DataType.Number)
        .textChecker((i, text) => !Number.isNaN(Number(text)))
    }

    execute(inputs, done) {
      const n = Number(this.textInputs[0]);
      if (Number.isNaN(n))
        throw Error('Input is not a number');
      done([n]);
    }
  }

  export class NodeCommand extends Node {
    constructor() {
      super();
      this.spec = new NodeSpec()
        .inputs(2, 2)
        .outputs(4, 4)
        .textInputs(1)
        .inputType(i => i == 0 ? DataType.Execution : DataType.String)
        .outputType(i => i == 0 ? DataType.Execution : (i == 3 ? DataType.Number : DataType.String))
    }

    execute(inputs: any[], done) {
      const line = this.textInputs[0];
      const words = line.trim().split(' ').filter(x => x !== '');
      const command = words[0];
      const args = words.slice(1);

      let stdout = '';
      let stderr = '';

      const process = spawn(command, args);
      if (inputs[1]) {
        process.stdin.write(inputs[0]);
      }

      process.stdout.on('data', data => stdout += data);
      process.stderr.on('data', data => stderr += data);
      process.on('close', code => {
        done([1, stdout, stderr, code]);
      })
    }
  }

  export class NodeStart extends Node {
    constructor() {
      super();
      this.spec = new NodeSpec()
        .inputs(0, 0)
        .outputs(1, 1)
        .textInputs(0)
        .outputType(() => DataType.Execution);
    }

    execute(inputs: any[], done) {
      done([1]);
    }
  }

  export class NodePrint extends Node {
    constructor() {
      super();
      this.spec = new NodeSpec()
        .inputs(2, Infinity)
        .outputs(1, 1)
        .textInputs(0)
        .inputType((i) => i == 0 ? DataType.Execution : DataType.String)
        .outputType(() => DataType.Execution);
    }

    execute(inputs: any[], done) {
      inputs.slice(1).forEach(s => console.log(s));
    }
  }
}
