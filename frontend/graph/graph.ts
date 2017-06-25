import { Node } from './node';
import { Link } from './link';
import { Port, PortOut, PortIn } from './port';
import { GraphView } from '../controller/graph-controller';

export class Graph {
  nodes: Node[] = [];
  links: Link[] = [];
  controller: GraphView

  refreshNodeDisplay(node: Node) {
    if (node._elem) {
      this.controller.updateNode(node);
    }
  }

  addNode(newNode: Node) {
    newNode['graph'] = this;
    this.nodes.push(newNode);
    this.controller.drawNode(newNode);
  }

  removeNode(node: Node) {
    node.outputs.forEach(port => port.outLinks.forEach(link => this.removeLink(link)));
    node.inputs.forEach(port => this.removeLink(port.inLink));
  }

  addLink(portBegin: PortOut, portEnd: PortIn) {
    if (portBegin.parentNode === portEnd.parentNode)
      return;
    if (portEnd.inLink) {
      this.removeLink(portEnd.inLink);
    }
    this.links.push(new Link(portBegin, portEnd));

  }

  removeLink(link: Link) {
    link.start.outLinks.splice(link.start.outLinks.indexOf(link), 1);
    link.end.inLink = null;
    this.controller.removeLink(link);
  }
}
