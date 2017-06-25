import { DataType } from '../models';
import { PortIn, PortOut } from './port';

export class Node {
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
    this.inputs.push(new PortIn(DataType.Number, this));
  }

  addOutput() {
    this.outputs.push(new PortOut(DataType.Number, this));
  }
}
