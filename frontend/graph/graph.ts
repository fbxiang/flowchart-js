import { Node } from './node';
import { Link } from './link';
import { Port, PortOut, PortIn } from './port';
import { DataType } from '../models';
import { GraphView } from '../controller/graph-controller';

export class Graph {
  nodes: Node[] = [];
  links: Link[] = [];
  controller: GraphView

  addNode(newNode: Node) {
    if (!newNode) return;
    newNode['graph'] = this;
    this.nodes.push(newNode);
    this.controller.drawNode(newNode);
    console.log(this.toJson());
  }

  removeNode(node: Node) {
    if (!node) return;

    let markedLinks = new Set();
    node.outputs.forEach(output => output.outLinks.forEach(link => markedLinks.add(link)));
    node.inputs.forEach(input => markedLinks.add(input.inLink));

    // remove all marked edges
    markedLinks.forEach(link => {
      this.removeLink(link);
    })

    // remove node
    this.nodes.splice(this.nodes.indexOf(node), 1);
    this.controller.removeNode(node);

    // update all nodes
    this.nodes.forEach(node => {node.update(), this.markNodeForUpdate(node)});
  }

  updateQueue: Set<Node> = new Set();
  markNodeForUpdate(node: Node) {
    this.updateQueue.add(node);
    if (this.updateQueue.size == 1) {
      setTimeout(() => {
        this.updateQueue.forEach(node => this.updateNode(node));
        this.updateQueue = new Set();
      }, 0);
    }
  }

  addLink(portBegin: PortOut, portEnd: PortIn) {
    if (!portBegin || !portEnd) return;
    if (!DataType.canCast(portBegin.dataType, portEnd.dataType)) return;
    if (portBegin.parentNode === portEnd.parentNode)
      return;

    if (portBegin.dataType == DataType.Execution && portBegin.outLinks.length) {
      this.removeLink(portBegin.outLinks[0]);
    }

    if (portEnd.inLink) {
      this.removeLink(portEnd.inLink);
    }

    const newLink = new Link(portBegin, portEnd);
    this.links.push(newLink);
    this.controller.drawLink(newLink);

    this.markNodeForUpdate(newLink.start.parentNode);
    this.markNodeForUpdate(newLink.end.parentNode);
  }

  // remove link and update node
  removeLink(link: Link) {
    if (!link) return;

    let index = link.start.outLinks.indexOf(link);
    if (index >= 0)
      link.start.outLinks.splice(index, 1);
    link.end.inLink = null;
    this.links.splice(this.links.indexOf(link), 1);
    this.controller.removeLink(link);

    this.markNodeForUpdate(link.start.parentNode);
    this.markNodeForUpdate(link.end.parentNode);
  }

  updateNode(node: Node) {
    node.update();
    this.controller.updateNode(node);
    node.inputs.forEach(input => this.controller.updateLink(input.inLink));
    node.outputs.forEach(output => output.outLinks.forEach(link => this.controller.updateLink(link)));
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
