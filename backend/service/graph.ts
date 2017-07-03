
import { Graph } from '../model/graph';

export let graph: Graph;

export function setGraph(graphJson) {
  graph = Graph.fromJson(graphJson);
  graph.execute();
}
