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
    if (!newNode) return;
    newNode['graph'] = this;
    this.nodes.push(newNode);
    this.controller.drawNode(newNode);
    console.log(this.toJson());
  }

  removeNode(node: Node) {
    if (!node) return;
    node.outputs.forEach(port => {
      port.outLinks.forEach(link => {
        link.end.inLink = null;
        this.links.splice(this.links.indexOf(link), 1);
        this.controller.removeLink(link);
      })
      port.outLinks = [];
    });
    node.inputs.forEach(port => this.removeLink(port.inLink));
    this.nodes.splice(this.nodes.indexOf(node), 1);
    this.controller.removeNode(node);
    console.log(this);
  }

  addLink(portBegin: PortOut, portEnd: PortIn) {
    if (!portBegin || !portEnd) return;
    if (portBegin.parentNode === portEnd.parentNode)
      return;
    if (portEnd.inLink) {
      this.removeLink(portEnd.inLink);
    }
    const newLink = new Link(portBegin, portEnd);
    this.links.push(newLink);
    this.controller.drawLink(newLink);
  }

  removeLink(link: Link) {
    if (!link) return;
    link.start.outLinks.splice(link.start.outLinks.indexOf(link), 1);
    link.end.inLink = null;
    this.links.splice(this.links.indexOf(link), 1);
    this.controller.removeLink(link);
  }

  toJson() {
    this.nodes.forEach((node, i) => node['_id'] = i);
    const nodes = this.nodes.map(node => node.toJson());
    const links = this.links.map(link => {
      const startPortId = link.start.parentNode.outputs.indexOf(link.start)
      const endPortId = link.end.parentNode.inputs.indexOf(link.end);
      return {from: {node: link.start.parentNode['_id'], port: startPortId},
              to: {node: link.end.parentNode['_id'], port: endPortId}}
    })
    this.nodes.forEach((node, i) => node['_id'] = undefined);
    return { nodes, links };
  }
}
