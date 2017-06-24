import { DataType } from '../models';
import { PortIn, PortOut } from './port';

export class Node {
  input: DataType[] = [];
  output: DataType[] = [];
  name: string = "node";
  display: {x: number, y: number} = {x: 0, y: 0};
}

class NodeAdd extends Node {
  inputs: PortIn[] = [];
  outputs: PortOut[] = [];
  constructor() {
    super();
  }

  addInput() {
    this.inputs.push(new PortIn(DataType.Number, this));
  }
}
