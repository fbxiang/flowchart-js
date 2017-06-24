import { DataType } from '../models';
import { Node } from './node';
import { Link } from './link';

class Port {
  constructor(public dataType: DataType, public parentNode: Node, public parentLink?: Link) {}
}

export class PortIn extends Port{
}

export class PortOut extends Port {
}
