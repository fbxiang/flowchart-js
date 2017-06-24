import { PortOut, PortIn } from './port';

export class Link {
  constructor(public start: PortOut, public end: PortIn) {}

  getStartNode() {
    return this.start.parentNode;
  }

  getEndNode() {
    return this.end.parentNode;
  }
}
