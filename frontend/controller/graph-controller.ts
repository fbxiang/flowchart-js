import * as d3 from 'd3';

export class GraphController {
  menuOpen = false;

  svg: d3.Selection<d3.BaseType, {}, HTMLElement, any>;
  svgWidth = 0;
  svgHeight = 0;
  gridWidth = 20;

  baseMenuOptions = ['option1', 'option2', 'option3'];
  constructor(svg) {
    if (!svg)
      this.svg = d3.select('svg');
    else
      this.svg = svg;
    const clientRect = (<any>this.svg.node()).getBoundingClientRect();
    this.svgWidth = clientRect.width;
    this.svgHeight = clientRect.height;

    const zoomGroup = this.svg.call(d3.zoom().translateExtent([[0, 0], [this.svgWidth, this.svgHeight]])
                             .scaleExtent([1, 20])
                             .on("zoom", () => {
                               zoomGroup.attr('transform', d3.event.transform);
                               this.closeMenu();
                             })).append('g');
    this.svg = zoomGroup;
    this.drawGridLines();
    this.initMenu();
  }

  drawGridLines() {
    this.svg.selectAll('.graph-grid').remove();
    const yScale = d3.scaleLinear().range([0, this.svgHeight]);
    const xScale = d3.scaleLinear().range([0, this.svgWidth]);
    this.svg.append('g')
      .classed('graph-grid', true).call(d3.axisLeft(yScale)
                                        .ticks(Math.round(this.svgHeight / this.gridWidth))
                                        .tickSize(-this.svgWidth))
    this.svg.append('g')
      .classed('graph-grid', true).call(d3.axisTop(xScale)
                                        .ticks(Math.round(this.svgWidth / this.gridWidth))
                                        .tickSize(-this.svgHeight));
    this.svg = this.svg.append('rect')
      .classed('canvas', true)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('fill', 'transparent');
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
    this.menuOpen = true;
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
        console.log(d, event.pageX, event.pageY);
        this.closeMenu();
      }).on('contextmenu', () => d3.event.preventDefault());
  }

  closeMenu() {
    this.menuOpen = false;
    d3.select('body').selectAll('.graph-menu').remove();
  }

  contextMenu(event) {
    if (this.menuOpen) return;
  }
}
