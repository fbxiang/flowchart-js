import { Node } from './node';
import { Link } from './link';

export class Graph {
  nodes: Node[];
  link: Link[];

  addNode(newNode: Node) {
    this.nodes.push(newNode);
  }
}
