import { DataType } from '../models';
import { Node } from './node';
import { Link } from './link';

export class Port {
  constructor(public dataType: DataType, public parentNode: Node, public name='') {}
}

export class PortIn extends Port{
  inLink: Link = null;
  constructor(public dataType: DataType, public parentNode: Node, public name='') {
    super(dataType, parentNode, name);
  }
}

export class PortOut extends Port {
  outLinks: Link[] = [];
  constructor(public dataType: DataType, public parentNode: Node, public name='') {
    super(dataType, parentNode, name);
  }
}
