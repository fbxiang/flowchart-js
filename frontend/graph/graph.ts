import { Node, TextInput } from './node';
import { Link } from './link';
import { Port, PortOut, PortIn } from './port';
import { DataType } from '../models';
import { Menu } from './menu';
import { GraphController } from './controller';

export class Graph {
  nodes: Node[] = [];
  links: Link[] = [];
  controller: GraphController

  addNode(newNode: Node) {
    if (!newNode) return;
    newNode['graph'] = this;
    this.nodes.push(newNode);
    this.controller.drawNode(newNode);
    console.log(this.toJson());
    this.saveGraph();
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

    this.saveGraph();
  }

  updateQueue: Set<Node> = new Set();
  markNodeForUpdate(node: Node) {
    this.updateQueue.add(node);
    if (this.updateQueue.size == 1) {
      setTimeout(() => {
        this.updateQueue.forEach(node => this.updateNode(node));
        this.updateQueue = new Set();
      }, 0);
      console.log(this.toJson());
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

    this.saveGraph();
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

    this.saveGraph();
  }

  updateNode(node: Node) {
    node.update();
    this.controller.updateNode(node);
    node.inputs.forEach(input => this.controller.updateLink(input.inLink));
    node.outputs.forEach(output => output.outLinks.forEach(link => this.controller.updateLink(link)));
  }

  updateNodePosition(node: Node, newX, newY) {
    node.display.x = newX;
    node.display.y = newY;
    this.controller.updateNodePosition(node);
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

  nodeFromJson(nodeJson) {
    // construct the node of the right type
    let newNode = new Node[nodeJson.id]() as Node;
    newNode.name = nodeJson.name;
    newNode.display = nodeJson.display;

    // make the text inputs right
    for (let i = 0; i < Math.min(newNode.textInputs.length, nodeJson.textInputs.length); i++) {
      const textInput = newNode.textInputs[i];
      textInput.name = nodeJson.textInputs[i].name;
      textInput.text = nodeJson.textInputs[i].text;
      if (!textInput.checker(textInput.text))
        textInput.text = textInput.defaultText;
    }

    // make the ports right
    newNode.inputs = nodeJson.inputs.map(input => new PortIn(<any>DataType[input.dataType], newNode, input.name));
    newNode.outputs = nodeJson.outputs.map(output =>
                                           new PortOut(<any>DataType[output.dataType], newNode, output.name));

    return newNode;
  }

  combineJson(json) {
    let newNodes: Node[] = json.nodes.map(this.nodeFromJson);
    let newLinks: Link[] = [];
    json.links.forEach(link => {
      let newLink = new Link(newNodes[link.from.node].outputs[link.from.port],
                             newNodes[link.to.node].inputs[link.to.port]);
      newLinks.push(newLink);
    })

    this.nodes = this.nodes.concat(newNodes);
    this.links = this.links.concat(newLinks);
    // draw these stuff
    newNodes.forEach(node => this.controller.drawNode(node));
    newLinks.forEach(link => this.controller.drawLink(link));
  }

  saveGraph() {
    localStorage.setItem('graph', JSON.stringify(this.toJson()));
  }

  loadGraph() {
    try {
      this.combineJson(JSON.parse(localStorage.getItem('graph')));
    } catch (e) { }
  }
}
