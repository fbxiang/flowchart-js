import * as d3 from 'd3';
import { Node, PortIn, PortOut } from '../graph';

export class GraphView {
  menuOpen = false;

  svg: d3.Selection<d3.BaseType, {}, HTMLElement, any>;
  canvas: d3.Selection<d3.BaseType, {}, HTMLElement, any>;

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
    this.canvas = this.svg.append('rect')
      .classed('canvas', true)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('fill', 'transparent');
  }

  initMenu() {
    this.canvas.on('contextmenu', () => {
      d3.event.preventDefault();
      this.popupBaseMenu(d3.event);
    });
    this.canvas.on('click', () => {
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

  createNode(node: Node) {
    const newNode = this.svg.append('g')
      .attr('transform', `translate(${node.display.x}, ${node.display.y})`)

    // draw background
    const rect = newNode.append('rect')
      .classed('graph-node-rect', true)
      .attr('rx', 10).attr('ry', 10);

    // draw title
    const title = newNode.append('text').text(node.name);
    const titleRect: SVGRect = (<any>title.node()).getBBox();
    title.classed('graph-node-title', true)
      .attr('x', 10).attr('y', titleRect.height);

    // draw ports
    const radius = 5;
    const separation = 15;
    const offset = 20;
    const inPorts = newNode.append('g');
    inPorts.selectAll('circle')
      .data(node.inputs)
      .enter()
      .append('circle')
      .classed('graph-port', true)
      .attr('r', radius)
      .attr('cx', 0)
      .attr('cy', (d, i) => separation * i);

    const inPortsRect: SVGRect = (<any>inPorts.node()).getBBox();

    const outPorts = newNode.append('g');
    outPorts.selectAll('circle')
      .data(node.outputs)
      .enter()
      .append('circle')
      .classed('graph-port', true)
      .attr('r', radius)
      .attr('cx', 0)
      .attr('cy', (d, i) => separation * i);

    const outPortsRect: SVGRect = (<any>outPorts.node()).getBBox();

    //draw content
    const contentWidth = 100;

    //update
    inPorts.attr('transform', `translate(0, ${titleRect.height + offset})`)
    outPorts.attr('transform', `translate(${inPortsRect.width + contentWidth}, ${titleRect.height + offset})`)

    rect
      .attr('width', contentWidth + inPortsRect.width)
      .attr('height', Math.max(inPortsRect.height, outPortsRect.height) + titleRect.height + offset);
  }
}
