import * as $ from 'jquery';
import * as d3 from 'd3';
import { Node, PortIn, PortOut } from './graph';
import { DataType } from './models';
import { PanelController, PanelState } from './panel'
import './style.css';
import { GraphController } from './graph/controller';
import { Observable } from 'rxjs/Rx';

const svg = d3.select('svg');

const graphController = new GraphController(svg);
const panelController = new PanelController();
panelController.panel.onStart(async () => {
  graphController.lock();
  try {
    const data = new FormData();
    data.append('graph', JSON.stringify(graphController.graph.toJson()));

    const res = await fetch('api/graph', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(graphController.graph.toJson())
    });
    const text = await res.text();
    if (res.ok) {
      panelController.panel.text = `${text}`;
      panelController.panel.state = PanelState.Started;

      function fetchInfo() {
        fetch('api/graph/state', {method: 'POST'}).then(res => res.json()).then(res => {
          if (!res.finished) {
            panelController.panel.text = 'running';
            setTimeout(fetchInfo, 500);
          } else {
            panelController.panel.text = 'finished';
            panelController.panel.state = PanelState.Stopped;
            graphController.unlock();
            console.log('----------------------------')
            console.log(res.log);
            console.log('----------------------------')
          }
        })
      }
      fetchInfo();

    } else {
      panelController.panel.text = `Error: ${text}`;
      panelController.panel.state = PanelState.Stopped;
      graphController.unlock();
    }
  } catch(e) {
    panelController.panel.text = 'Unknown Error occurred...';
    panelController.panel.state = PanelState.Stopped;
    graphController.unlock();
  }
});

graphController.graph.loadGraph();
