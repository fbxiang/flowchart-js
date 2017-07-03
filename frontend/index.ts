import * as $ from 'jquery';
import * as d3 from 'd3';
import { Node, PortIn, PortOut } from './graph';
import { DataType } from './models';
import { PanelController } from './panel'
require('./style.css');
import { GraphController } from './graph/controller';
const svg = d3.select('svg');

const graphController = new GraphController(svg);
const panelController = new PanelController();
panelController.panel.onStart(() => {
  console.log('start!!!');
})

graphController.graph.loadGraph();
