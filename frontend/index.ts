import * as $ from 'jquery';
import * as d3 from 'd3';


require('./style.css');


import { GraphController } from './controller/graph-controller';

const svg = d3.select('svg');

const controller = new GraphController(svg)
