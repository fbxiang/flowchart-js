import { PortOut, PortIn } from './node';

export class Link {
  constructor(public start: PortOut, public end: PortIn) {
    start.outLinks.push(this);
    end.inLink = this;
  }

  get startNode() {
    return this.start.parentNode;
  }

  get endNode() {
    return this.end.parentNode;
  }
}
