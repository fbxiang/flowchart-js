import { DataType } from '../models';
import { PortIn, PortOut } from './port';
import { Menu } from './menu';

export class TextInput {
  text = "";
  constructor(public name = 'text',
              public defaultText = "",
              public checker: (text: string) => boolean = (_) => true,
              public display = {width: 60, height: 20}) {}
  clone() {
    let newInput = new TextInput(this.name, this.defaultText, this.checker, this.display);
    newInput.text = this.text;
    return newInput;
  }
}

export class Node {
  textInputs: TextInput[] = [];
  inputs: PortIn[] = [];
  outputs: PortOut[] = [];
  name: string = "node";
  display = {x: 0, y: 0};

  _elem; // dom element reference

  // called to update the node
  update() { }

  getClassId() {}

  clone() {
    let newNode = new Node();
    newNode.textInputs = this.textInputs.map(textInput => textInput.clone());
    newNode.inputs = this.inputs.map(port => new PortIn(port.dataType, newNode));
    newNode.outputs = this.outputs.map(port => new PortOut(port.dataType, newNode));
    newNode.name = this.name;
    newNode.display = {x: this.display.x, y: this.display.y};
    return newNode;
  }

  toJson() {
    return {
      id: this.getClassId(),
      name: this.name,
      textInputs: this.textInputs.map(textInput => ({name: textInput.name, text: textInput.text})),
      inputs: this.inputs.map(port => ({name: port.name, dataType: DataType[port.dataType]})),
      outputs: this.outputs.map(port => ({name: port.name, dataType: DataType[port.dataType]})),
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
    this.inputs.push(new PortIn(DataType.Execution, this));
    this.addInput();
  }

  update() {
    console.log(this.inputs);
    this.inputs = this.inputs.filter(input => input.inLink || input.dataType == DataType.Execution);
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

export class NodeJoin extends NodeExecution {
  constructor() {
    super();
    this.name = "Branch Join";
  }

  update() {
    this.inputs = this.inputs.filter(input => input.inLink);
    this.inputs.push(new PortIn(DataType.Execution, this));
  }
}

export class AnyToBoolean extends Node {
  constructor() {
    super();
    this.name = "ToBoolean";
    this.inputs.push(new PortIn(DataType.Any, this));
    this.outputs.push(new PortOut(DataType.Boolean, this));
  }
}

export class NodeBranch extends Node {
  constructor() {
    super();
    this.name = "Branch";
    this.inputs.push(new PortIn(DataType.Execution, this));
    this.inputs.push(new PortIn(DataType.Boolean, this, 'condition'));
    this.outputs.push(new PortOut(DataType.Execution, this, 'default'));
  }

  addInput() {
    this.inputs.push(new PortIn(DataType.Boolean, this, 'condition'));
  }

  addOutput() {
    this.outputs.push(new PortOut(DataType.Execution, this, 'case'));
  }

  update() {
    for (let i = 1; i < this.inputs.length - 1; i++) {
      if (!this.inputs[i].inLink && !this.outputs[i].outLinks.length) {
        this.inputs.splice(i, 1);
        this.outputs.splice(i, 1);
        i -= 1;
      }
    }
    if (this.inputs[this.inputs.length - 1].inLink) {
      this.addInput();
      this.addOutput();
    }
  }
}

export class NodeString extends Node {
  constructor() {
    super();
    this.name = 'String';
    this.textInputs.push(new TextInput('string', '', () => true, {width: 120, height: 20}));
    this.outputs.push(new PortOut(DataType.String, this));
  }
}

export class NodeStringConcat extends Node {
  constructor() {
    super();
    this.name = 'String Concat';
    this.addInput();
    this.outputs.push(new PortOut(DataType.String, this));
  }

  addInput() {
    this.inputs.push(new PortIn(DataType.String, this));
  }

  update() {
    this.inputs = this.inputs.filter(input => input.inLink);
    this.addInput();
  }
}

export class NodeStart extends Node {
  constructor() {
    super();
    this.name = 'Start';
    this.outputs.push(new PortOut(DataType.Execution, this));
  }
}


Menu.instance.addOption('Control');
Menu.instance.addOption('Util');
Menu.instance.addOption('Math');

Menu.instance.registerNodeClass('NodeAdd', 'Add', NodeAdd, 'Math');
Menu.instance.registerNodeClass('NodeMultiply', 'Multiply', NodeMultiply, 'Math');
Menu.instance.registerNodeClass('NodeSigmoid', 'Sigmoid', NodeSigmoid, 'Math');
Menu.instance.registerNodeClass('NodeTanh', 'Tanh', NodeTanh, 'Math');
Menu.instance.registerNodeClass('NodeNumber', 'Number', NodeNumber, 'Math');

Menu.instance.registerNodeClass('NodePrint', 'Print', NodePrint, 'Util');
Menu.instance.registerNodeClass('NodeCommand', 'Command', NodeCommand, 'Util');
Menu.instance.registerNodeClass('NodeStringCompare', 'String compare', NodeStringCompare, 'Util');
Menu.instance.registerNodeClass('NodeStringConcat', 'Concatenate', NodeStringConcat, 'Util');
Menu.instance.registerNodeClass('NodeNumberToString', 'Number to string', NodeNumberToString, 'Util');
Menu.instance.registerNodeClass('NodeToBoolean', 'To Boolean', AnyToBoolean, 'Util');
Menu.instance.registerNodeClass('NodeString', 'String', NodeString, 'Util');

Menu.instance.registerNodeClass('NodeControlStart', 'Start', NodeStart, 'Control');
Menu.instance.registerNodeClass('NodeControlJoin', 'Join', NodeJoin, 'Control');
Menu.instance.registerNodeClass('NodeControlBranch', 'Branch', NodeBranch, 'Control');
