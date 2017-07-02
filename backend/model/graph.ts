import { Node, PortOut, PortIn } from './node';
import { Link } from './link';
import { DataType } from './data-type';

function _isControlNode(node: Node) {
  return node.inputs[0].dataType == DataType.Execution;
}

async function executeNode(node: Node) {
  node._executionMeta.visited = true;
  let inputData = [];
  for (let i = 0; i < node.inputs.length; i++) {
    let input = node.inputs[i];

    if (input.dataType == DataType.Execution) {
      inputData.push(null);
      continue;
    }

    if (input.inLink == null) {
      inputData.push(DataType.defaultValue(input.dataType));
      continue;
    }

    const inNode = input.inLink.startNode;

    if (_isControlNode(inNode) && !inNode._executionMeta.executed) {
      throw Error('Fetching data from unreachable node!');
    }

    if (inNode._executionMeta.visited && !inNode._executionMeta.executed) {
      throw Error('Circular dependency!')
    }

    if (!inNode._executionMeta.executed) {
      await executeNode(inNode);
    }
    let outputIndex = inNode.outputs.indexOf(input.inLink.start);
    inputData.push(inNode._executionMeta.outputs[outputIndex]);
  }

  let p = new Promise<any[]>((r, e) => {
    node.execute(inputData, r);
  })
  console.log('node', node.getClass());
  console.log('input', inputData);
  node._executionMeta.outputs = await p;
  console.log('output', node._executionMeta.outputs);
  node._executionMeta.executed = true;
}

export class Graph {
  nodes: Node[] = [];
  links: Link[] = [];

  async execute() {
    // find the start node in the graph
    const startNodes = this.nodes.filter(node => node.getClass() == 'NodeStart');
    if (startNodes.length != 1)
      throw Error('Invalid number of start nodes');

    let currentNode = startNodes[0];

    const that = this;


    while (currentNode) {
      await executeNode(currentNode);
      let nextOut = currentNode.outputs.filter(output => output.dataType == DataType.Execution)[0];

      // add 1 check
      if (nextOut && nextOut.outLinks[0]) {
        currentNode = nextOut.outLinks[0].endNode;
      } else {
        break;
      }
    }
  }
}

export namespace Graph {

  export function fromJson(json) {
    const nodes: Node[] = json.nodes.map(Node.fromJson);
    nodes.forEach((node, i) => node['id'] = i);
    const links: Link[] = json.links.map(link => createLink(nodes[link.from.node].outputs[link.from.port],
      nodes[link.to.node].inputs[link.to.port]));
    const graph = new Graph();
    graph.nodes = nodes;
    graph.links = links;
    return graph;
  }

  export function createLink(portStart: PortOut, portEnd: PortIn) {
    if (DataType.canCast(portStart.dataType, portEnd.dataType)) {
      return (new Link(portStart, portEnd));
    }
    throw Error(`Cannot cast ${portStart.dataType} to ${portEnd.dataType}`);
  }
}

export const graph = Graph.fromJson(
  { "nodes": [{ "id": "NodeStart", "name": "Start", "textInputs": [], "inputs": [], "outputs": [{ "name": "", "dataType": "Execution" }], "display": { "x": 55.506126403808594, "y": 100.95315551757812 } }, { "id": "NodeCommand", "name": "Command", "textInputs": [{ "name": "command", "text": "python --version" }], "inputs": [{ "name": "", "dataType": "Execution" }, { "name": "stdin", "dataType": "String" }], "outputs": [{ "name": "", "dataType": "Execution" }, { "name": "stdout", "dataType": "String" }, { "name": "stderr", "dataType": "String" }, { "name": "return", "dataType": "Number" }], "display": { "x": 228.06497192382812, "y": 51.32646560668945 } }, { "id": "NodePrint", "name": "print", "textInputs": [], "inputs": [{ "name": "", "dataType": "Execution" }, { "name": "", "dataType": "String" }, { "name": "", "dataType": "String" }], "outputs": [{ "name": "", "dataType": "Execution" }], "display": { "x": 1674.36328125, "y": 77.46625518798828 } }, { "id": "NodeStringConcat", "name": "String Concat", "textInputs": [], "inputs": [{ "name": "", "dataType": "String" }, { "name": "", "dataType": "String" }, { "name": "", "dataType": "String" }], "outputs": [{ "name": "", "dataType": "String" }], "display": { "x": 750.0693969726562, "y": 268.7295227050781 } }, { "id": "NodeStringConcat", "name": "String Concat", "textInputs": [], "inputs": [{ "name": "", "dataType": "String" }, { "name": "", "dataType": "String" }, { "name": "", "dataType": "String" }, { "name": "", "dataType": "String" }], "outputs": [{ "name": "", "dataType": "String" }], "display": { "x": 1495.7490844726562, "y": 253.30410766601562 } }, { "id": "NodeCommand", "name": "Command", "textInputs": [{ "name": "command", "text": "python3 --version" }], "inputs": [{ "name": "", "dataType": "Execution" }, { "name": "stdin", "dataType": "String" }], "outputs": [{ "name": "", "dataType": "Execution" }, { "name": "stdout", "dataType": "String" }, { "name": "stderr", "dataType": "String" }, { "name": "return", "dataType": "Number" }], "display": { "x": 731.2111053466797, "y": 60.828521728515625 } }, { "id": "NodeStringConcat", "name": "String Concat", "textInputs": [], "inputs": [{ "name": "", "dataType": "String" }, { "name": "", "dataType": "String" }, { "name": "", "dataType": "String" }], "outputs": [{ "name": "", "dataType": "String" }], "display": { "x": 1206.202880859375, "y": 170.90194702148438 } }], "links": [{ "from": { "node": 0, "port": 0 }, "to": { "node": 1, "port": 0 } }, { "from": { "node": 1, "port": 1 }, "to": { "node": 3, "port": 0 } }, { "from": { "node": 1, "port": 1 }, "to": { "node": 3, "port": 1 } }, { "from": { "node": 3, "port": 0 }, "to": { "node": 4, "port": 0 } }, { "from": { "node": 3, "port": 0 }, "to": { "node": 4, "port": 1 } }, { "from": { "node": 4, "port": 0 }, "to": { "node": 2, "port": 1 } }, { "from": { "node": 1, "port": 0 }, "to": { "node": 5, "port": 0 } }, { "from": { "node": 5, "port": 0 }, "to": { "node": 2, "port": 0 } }, { "from": { "node": 5, "port": 1 }, "to": { "node": 6, "port": 0 } }, { "from": { "node": 3, "port": 0 }, "to": { "node": 6, "port": 1 } }, { "from": { "node": 6, "port": 0 }, "to": { "node": 4, "port": 2 } }] }
);
