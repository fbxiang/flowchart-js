import { DataType } from '../models';
import { PortIn, PortOut } from './port';

export class TextInput {
  text = "";
  constructor(public name = 'text',
              public defaultText = "",
              public checker: (text: string) => boolean = (_) => true,
              public display = {width: 60, height: 20}) {}
}

export class Node {
  textInputs: TextInput[] = [];
  inputs: PortIn[] = [];
  outputs: PortOut[] = [];
  name: string = "node";
  display = {x: 0, y: 0};

  _elem; // dom element reference

  clone() {
    let newNode = new Node();
    newNode.inputs = this.inputs.map(port => new PortIn(port.dataType, newNode));
    newNode.outputs = this.outputs.map(port => new PortOut(port.dataType, newNode));
    newNode.name = this.name;
    newNode.display = {x: this.display.x, y: this.display.y};
    return newNode;
  }

  toJson() {
    return {
      name: this.name,
      inputs: this.inputs.map(port => ({dataType: DataType[port.dataType]})),
      outputs: this.outputs.map(port => ({dataType: DataType[port.dataType]})),
      display: this.display
    }
  }
}

class NodeExecution extends Node {
  constructor() {
    super();
    this.name = 'Continue';
    this.inputs.push(new PortIn(DataType.Execution, this));
    this.outputs.push(new PortOut(DataType.Execution, this));
  }
}

export class NodeAdd extends Node {
  constructor() {
    super();
    this.name = "Add";
    this.addInput();
    this.addInput();
    this.addOutput();
  }

  addInput() {
    this.inputs.push(new PortIn(DataType.Number, this, 'number'));
  }

  addOutput() {
    this.outputs.push(new PortOut(DataType.Number, this, 'sum'));
  }
}

export class NodeMultiply extends Node {
  constructor() {
    super();
    this.name = "Multiply";
    this.addInput();
    this.addInput();
    this.addOutput();
  }

  addInput() {
    this.inputs.push(new PortIn(DataType.Number, this));
  }

  addOutput() {
    this.outputs.push(new PortOut(DataType.Number, this));
  }
}

export class NodeSigmoid extends Node {
  constructor() {
    super();
    this.name = "sigmoid";
    this.addInput();
    this.addOutput();
  }

  addInput() {
    this.inputs.push(new PortIn(DataType.Number, this));
  }

  addOutput() {
    this.outputs.push(new PortOut(DataType.Number, this));
  }
}

export class NodeTanh extends Node {
  constructor() {
    super();
    this.name = "tanh";
    this.addInput();
    this.addOutput();
  }

  addInput() {
    this.inputs.push(new PortIn(DataType.Number, this));
  }

  addOutput() {
    this.outputs.push(new PortOut(DataType.Number, this));
  }
}



export class NodeNumberToString extends Node {
  constructor() {
    super();
    this.name = "Number To String";
    this.addInput();
    this.addOutput();
  }

  addInput() {
    this.inputs.push(new PortIn(DataType.Number, this));
  }

  addOutput() {
    this.outputs.push(new PortOut(DataType.String, this));
  }
}

export class NodePrint extends Node {
  constructor() {
    super();
    this.name = "print";
    this.addInput();
  }

  addInput() {
    this.inputs.push(new PortIn(DataType.String, this));
  }
}

export class NodeNumber extends Node {
  constructor() {
    super();
    this.name = "Number";
    this.addOutput();
    this.textInputs.push(new TextInput('number', '0.0', text => !Number.isNaN(Number(text))));
}

  addOutput() {
    this.outputs.push(new PortOut(DataType.Number, this, ''));
  }
}

export class NodeCommand extends NodeExecution {
  constructor() {
    super();
    this.name = "Command";
    this.textInputs.push(new TextInput('command', '', _=>true, {width: 200, height: 20}));

    this.outputs.push(new PortOut(DataType.String, this, 'stdout'));
    this.outputs.push(new PortOut(DataType.String, this, 'stderr'));
    this.outputs.push(new PortOut(DataType.Number, this, 'return'));
    this.inputs.push(new PortIn(DataType.String, this, 'stdin'));
  }
}

export class NodeStringCompare extends Node {
  constructor() {
    super();
    this.name = "Equal"
    this.inputs.push(new PortIn(DataType.String, this, 'a'));
    this.inputs.push(new PortIn(DataType.String, this, 'b'));
    this.outputs.push(new PortOut(DataType.Number, this, 'a-b'));
  }
}

export class NodeParallel extends NodeExecution {
  constructor() {
    super();
    this.name = "Parallel";
    this.outputs.push(new PortOut(DataType.Execution, this));
  }
}

export class NodeJoin extends NodeExecution {
  constructor() {
    super();
    this.name = "Join";
    this.inputs.push(new PortIn(DataType.Execution, this));
  }
}

export class NodeIf extends Node {
  constructor() {
    super();
    this.name = "If";
    this.inputs.push(new PortIn(DataType.Execution, this));
    this.inputs.push(new PortIn(DataType.Number, this));
    this.outputs.push(new PortOut(DataType.Execution, this, 'then'));
    this.outputs.push(new PortOut(DataType.Execution, this, 'else'));
  }
}


export const NodeClassList = {NodeAdd, NodeMultiply, NodeSigmoid, NodeTanh, NodeNumber, NodePrint, NodeNumberToString, NodeCommand, NodeStringCompare, NodeParallel, NodeJoin, NodeIf}
