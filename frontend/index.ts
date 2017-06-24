import * as $ from 'jquery';
import * as d3 from 'd3';
import { Node, PortIn, PortOut } from './graph';
import { DataType } from './models';

require('./style.css');


import { GraphView } from './controller/graph-controller';

const svg = d3.select('svg');

const view = new GraphView(svg);

const testNode = new Node();
testNode.name = 'test';
testNode.display = {x: 100, y: 100};

testNode.inputs.push(new PortIn(DataType.Number, testNode));
testNode.inputs.push(new PortIn(DataType.Number, testNode));

testNode.outputs.push(new PortOut(DataType.Number, testNode));

view.createNode(testNode);
