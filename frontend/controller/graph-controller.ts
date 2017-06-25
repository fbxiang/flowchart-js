import * as d3 from 'd3';
import { Node, PortIn, PortOut, Port, Link, Graph } from '../graph';
import { NodeAdd } from '../graph/node';

export class GraphView {
  graph = new Graph();
  menuOpen = false;

  svg: d3.Selection<d3.BaseType, {}, HTMLElement, any>;
  canvas: d3.Selection<d3.BaseType, {}, HTMLElement, any>;

  svgWidth = 0;
  svgHeight = 0;
  gridWidth = 20;

  baseMenuOptions = ['Add Test Node'];

  linkDrag: d3.Selection<d3.BaseType, {}, HTMLElement, any>;

  hoveredPort: Port;

  constructor(svg) {
    this.graph.controller = this;
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
      console.log('click');
      this.clearSelection();
      this.closeMenu();
    })
  }

  clearSelection() {
    this.svg.selectAll('.graph-node').classed('selected', false);
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
        let newNode = new NodeAdd();
        newNode.display = {x: event.pageX, y: event.pageY};
        this.graph.addNode(newNode);
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

  drawNode(node: Node) {
    const newNode = this.svg.append('g').classed('graph-node', true)
      .attr('transform', `translate(${node.display.x}, ${node.display.y})`)
    node['_elem'] = newNode.node();

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


    const inPortsX = 0;
    const inPortsY = titleRect.height + offset;
    const outPortsX = inPortsRect.width + contentWidth;
    const outPortsY = titleRect.height + offset;

    //update
    inPorts.attr('transform', `translate(${inPortsX}, ${inPortsY})`)
    outPorts.attr('transform', `translate(${outPortsX}, ${outPortsY})`)

    rect.attr('width', contentWidth + inPortsRect.width)
      .attr('height', Math.max(inPortsRect.height, outPortsRect.height) + titleRect.height + offset);

    // final size
    const nodeRect: SVGRect = (<any>newNode.node()).getBBox();

    // events
    newNode.on('mousedown', () => {
      if (newNode.classed('selected')) {
        return;
      }
      this.clearSelection();
      newNode.classed('selected', true);
      newNode.raise();
    })

    newNode.call(d3.drag().on('start', () => {})
                 .on('drag', () => {
                   // update position
                   let newX = node.display.x + d3.event.dx;
                   let newY = node.display.y + d3.event.dy;
                   newX = Math.max(newX, 0);
                   newY = Math.max(newY, 0);
                   newX = Math.min(newX, this.svgWidth - nodeRect.width);
                   newY = Math.min(newY, this.svgHeight - nodeRect.height);

                   newNode.attr('transform', `translate(${newX}, ${newY})`)

                   // update storage
                   node.display.x = newX;
                   node.display.y = newY;
                 }))

    const that = this; // hack
    let targetX = 0;
    let targetY = 0;
    let sourceX = 0;
    let sourceY = 0;
    inPorts.selectAll('circle').call(d3.drag().on('start', function() {
      sourceX = targetX = Number(d3.select(this).attr('cx')) + inPortsX + node.display.x;
      sourceY = targetY = Number(d3.select(this).attr('cy')) + inPortsY + node.display.y;
      if (that.linkDrag) {
        that.linkDrag.remove();
        that.linkDrag = null;
      }
      that.linkDrag = that.svg.append('path')
        .classed('graph-link', true)
        .attr('d', d3.linkHorizontal()
              .source(() => [sourceX, sourceY])
              .target(() => [targetX, targetY]));
    }).on('drag', () => {
      if (that.linkDrag) {
        sourceX += d3.event.dx;
        sourceY += d3.event.dy;
        that.linkDrag.attr('d', d3.linkHorizontal()
                           .source(() => [sourceX, sourceY])
                           .target(() => [targetX, targetY]));
      }
    }).on('end', () => {
      that.linkDrag.remove();
      that.linkDrag = null;
      console.log(this.hoveredPort);
    }));

    // TODO: handle out pors
    outPorts.selectAll('circle').call(d3.drag().on('start', () => {
      console.log(d3.event, 'out');
    }));

    outPorts.selectAll('circle').on('mouseover', function(d, i) {
      that.hoveredPort = <any>d;
    }).on('mouseout', () => {
      that.hoveredPort = null;
    });
  }

  updateNode(node: Node) {
  }

  removeNode(node: Node) {
    if (node._elem) {
      d3.select(node._elem).remove();
    }
  }

  drawLink(link: Link) {
    // get ports
  }

  updateLink(link: Link) {
  }

  removeLink(link: Link) {
    if (link._elem) {
      d3.select(link._elem).remove();
    }
  }
}
