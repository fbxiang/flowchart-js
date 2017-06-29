import * as $ from 'jquery';
import * as d3 from 'd3';
import { Node, PortIn, PortOut } from './graph';
import { DataType } from './models';

require('./style.css');


import { GraphView } from './controller/graph-controller';

const svg = d3.select('svg');

const view = new GraphView(svg);

const testJson =
  {"nodes":[{"id":"NodeControlStart","name":"Start","textInputs":[],"inputs":[],"outputs":[{"name":"","dataType":"Execution"}],"display":{"x":223.00836181640625,"y":230.24368286132812}},{"id":"NodeControlJoin","name":"Branch Join","textInputs":[],"inputs":[{"name":"","dataType":"Execution"},{"name":"","dataType":"Execution"}],"outputs":[{"name":"","dataType":"Execution"}],"display":{"x":485.7835693359375,"y":199.3484649658203}},{"id":"NodeCommand","name":"Command","textInputs":[{"name":"command","text":"12345"}],"inputs":[{"name":"","dataType":"Execution"},{"name":"stdin","dataType":"String"}],"outputs":[{"name":"","dataType":"Execution"},{"name":"stdout","dataType":"String"},{"name":"stderr","dataType":"String"},{"name":"return","dataType":"Number"}],"display":{"x":773,"y":232}}, {"id":"NodeNumber","name":"Number","textInputs":[{"name":"number","text":"0.0"}],"inputs":[],"outputs":[{"name":"","dataType":"Number"}],"display":{"x":366,"y":250}}],"links":[{"from":{"node":0,"port":0},"to":{"node":1,"port":0}},{"from":{"node":1,"port":0},"to":{"node":2,"port":0}}]}

view.graph.combineJson(testJson);
