import * as $ from 'jquery';
import * as d3 from 'd3';
import { Node, PortIn, PortOut } from './graph';
import { DataType } from './models';

require('./style.css');


import { GraphView } from './controller/graph-controller';

const svg = d3.select('svg');

const view = new GraphView(svg);
