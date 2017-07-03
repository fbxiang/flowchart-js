import * as d3 from 'd3';

export enum PanelState {
  Stopped,
  Loading,
  Started
}

export class Panel {
  _state: PanelState = PanelState.Stopped;
  _text: string;
  _elem;

  constructor(public controller: PanelController) { }

  set state(value: PanelState) { this._state = value; this.controller.updatePanel(); }
  get state() { return this._state; }

  set text(value: string) { this._text = value; this.controller.updatePanel(); }
  get text() { return this._text; }

  onStart(callback) {
    this._elem.addEventListener('start', callback, false);
  }

  onStop(callback) {
    this._elem.addEventListener('stop', callback, false);
  }

  start() {
    this.state = PanelState.Loading;
    this._elem.dispatchEvent(new Event('start'));
  }
  stop() {
    this._elem.dispatchEvent(new Event('stop'));
  }
}

export class PanelController {
  panel = new Panel(this);

  constructor() {
    this.drawPanel();
  }

  drawPanel() {
    const panel = d3.select('body')
        .append('div').classed('graph-panel-container', true)
      .append('div').classed('graph-panel', true);

    this.panel._elem = panel.node();

    const startButton = panel.append('button')
      .classed('start', true)
      .text('Start')
      .on('click', () => {
        this.panel.start();
      });

    if (this.panel.state != PanelState.Stopped) {
      startButton.attr('disabled', true);
    }

    const stopButton = panel.append('button')
      .classed('stop', true)
      .text('Stop')
      .on('click', () => {
        this.panel.stop();
      })
    if (this.panel.state != PanelState.Started) {
      stopButton.attr('disabled', true);
    }

    const text = panel.append('div')
      .classed('text', true)
      .text(this.panel.state == PanelState.Loading ? 'Waiting...' : this.panel.text)
      .style('width', '30vw')
  }

  updatePanel() {
    const panel = d3.select('.graph-panel');
    panel.select('button.start').node()['disabled'] = this.panel.state != PanelState.Stopped;
    panel.select('button.stop').node()['disabled'] = this.panel.state != PanelState.Started;
    panel.select('.text')
      .text(this.panel.state == PanelState.Loading ? 'Waiting...' : this.panel.text)

  }
}
