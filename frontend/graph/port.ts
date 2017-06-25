import { DataType } from '../models';
import { Node } from './node';
import { Link } from './link';

export class Port {
  constructor(public dataType: DataType, public parentNode: Node) {}
}

export class PortIn extends Port{
  constructor(public dataType: DataType, public parentNode: Node, public inLink = null) {
    super(dataType, parentNode);
  }
}

export class PortOut extends Port {
    constructor(public dataType: DataType, public parentNode: Node, public outLinks = []) {
      super(dataType, parentNode);
  }
}
