import * as d3 from 'd3';


export class GraphController {
  menuOpen = false;
  svg: d3.Selection<d3.BaseType, {}, HTMLElement, any>;
  baseMenuOptions = ['option1', 'option2', 'option3'];
  constructor(svg) {
    if (!svg)
      this.svg = d3.select('svg');
    else
      this.svg = svg;

    this.initMenu();

    this.svg.call(d3.zoom().on("zoom", () => {
      console.log('zoom');
      // TODO: Finish Zoom
    }));

  }

  initMenu() {
    this.svg.on('contextmenu', () => {
      d3.event.preventDefault();
      this.popupBaseMenu(d3.event);
    });
    this.svg.on('click', () => {
      this.closeMenu();
    })
  }

  popupBaseMenu(event) {
    this.closeMenu();

    const menu = d3.select('body').append('div').classed('graph-menu', true)
      .style('left', event.pageX + 'px')
      .style('top', event.pageY + 'px');
    menu.selectAll('div')
      .data(this.baseMenuOptions)
      .enter()
      .append('div')
      .classed('graph-menu-option', true)
      .text(d => d)
      .on('click', d => {
        console.log(d);
        this.closeMenu();
      }).on('contextmenu', () => d3.event.preventDefault());
  }

  closeMenu() {
    d3.select('body').selectAll('.graph-menu').remove();
  }

  contextMenu(event) {
    if (this.menuOpen) return;
  }

}
