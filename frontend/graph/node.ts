import { DataType } from '../models';
import { PortIn, PortOut } from './port';

export class Node {
  inputs: PortIn[] = [];
  outputs: PortOut[] = [];
  name: string = "node";
  display = {x: 0, y: 0};
}

class NodeAdd extends Node {
  constructor() {
    super();
  }

  addInput() {
    this.inputs.push(new PortIn(DataType.Number, this));
  }
}
