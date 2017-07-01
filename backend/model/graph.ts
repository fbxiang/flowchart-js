import { Node, PortOut, PortIn } from './node';
import { Link } from './link';
import { DataType } from './data-type';

export class Graph {
  nodes: Node[] = [];
  links: Link[] = [];
}

export namespace Graph {

  export function fromJson (json) {
    const nodes: Node[] = json.nodes.map(Node.fromJson);
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
{"nodes":[{"id":"NodeStart","name":"Start","textInputs":[],"inputs":[],"outputs":[{"name":"","dataType":"Execution"}],"display":{"x":323,"y":174}},{"id":"NodePrint","name":"print","textInputs":[],"inputs":[{"name":"","dataType":"Execution"},{"name":"","dataType":"String"}],"outputs":[{"name":"","dataType":"Execution"}],"display":{"x":712,"y":177}},{"id":"NodeCommand","name":"Command","textInputs":[{"name":"command","text":"asdfasdf"}],"inputs":[{"name":"","dataType":"Execution"},{"name":"stdin","dataType":"String"}],"outputs":[{"name":"","dataType":"Execution"},{"name":"stdout","dataType":"String"},{"name":"stderr","dataType":"String"},{"name":"return","dataType":"Number"}],"display":{"x":941,"y":242}}],"links":[{"from":{"node":0,"port":0},"to":{"node":1,"port":0}},{"from":{"node":1,"port":0},"to":{"node":2,"port":0}}]}
);


