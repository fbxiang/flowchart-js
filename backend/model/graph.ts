import { Node, PortOut, PortIn } from './node';
import { Link } from './link';
import { DataType } from './data-type';

function _isControlNode(node: Node) {
  return node.inputs[0].dataType == DataType.Execution;
}

async function executeNode(node: Node, theConsole: any) {
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
      await executeNode(inNode, theConsole);
    }
    let outputIndex = inNode.outputs.indexOf(input.inLink.start);
    inputData.push(inNode._executionMeta.outputs[outputIndex]);
  }

  node._executionMeta.outputs = await node.execute(inputData, theConsole);
  node._executionMeta.executed = true;
}

export class Graph {
  nodes: Node[] = [];
  links: Link[] = [];

  _execution_meta = {finished: false, error: false, message: '', log: ''};
  async execute() {
    try {
      // find the start node in the graph
      const startNodes = this.nodes.filter(node => node.getClass() == 'NodeStart');
      if (startNodes.length != 1)
        throw Error('Invalid number of start nodes');

      let currentNode = startNodes[0];

      const that = this;

      let theConsole = {
        text: '',
        log: function(...params) {
          theConsole.text += params.map(param => param.toString()).join(' ');
          theConsole.text += '\n';
        }
      }

      while (currentNode) {
        console.log(currentNode.getClass());
        await executeNode(currentNode, theConsole);

        let nextNode = null;
        for (let i = 0; i < currentNode.outputs.length; i++) {
          if (currentNode.outputs[i].dataType == DataType.Execution
              && currentNode._executionMeta.outputs[i]
              && currentNode.outputs[i].outLinks[0]) {
            nextNode = currentNode.outputs[i].outLinks[0].endNode;
            break;
          }
        }
        currentNode = nextNode;
      }
      this._execution_meta.message = 'finished';
      this._execution_meta.log = theConsole.text;
    } catch (e) {
      console.log(e);
      this._execution_meta.error = true;
      this._execution_meta.message = e.toString();
    }
    this._execution_meta.finished = true;
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
