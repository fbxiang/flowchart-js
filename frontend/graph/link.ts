import { PortOut, PortIn } from './port';

export class Link {
  _elem;
  constructor(public start: PortOut, public end: PortIn) {
    this.start.outLinks.push(this);
    this.end.inLink = this;
  }

  getStartNode() {
    return this.start.parentNode;
  }

  getEndNode() {
    return this.end.parentNode;
  }
}
