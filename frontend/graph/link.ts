import { PortOut, PortIn } from './port';

export class Link {
  _elem;
  constructor(public start: PortOut, public end: PortIn) {
    if (end.inLink)
      throw Error('already connected');
    this.start.outLinks.push(this);
    this.end.inLink = this;
  }

  get startNode() {
    return this.start.parentNode;
  }

  get getEndNode() {
    return this.end.parentNode;
  }
}
