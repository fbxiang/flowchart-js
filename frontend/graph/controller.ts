import * as d3 from 'd3';
import { Node, PortIn, PortOut, Port, Link, Graph } from '../graph';
import { TextInput } from '../graph/node';
import { DataType } from '../models';
import { Menu, NodeClass, OptionList } from '../graph/menu';

function linkHorizontal(source: [number, number], target: [number, number]) {
  const offsetX = Math.abs((target[0] - source[0]) / 2);
  const sourceHandleX = source[0] + offsetX;
  const targetHandleX = target[0] - offsetX;
  return `M${source[0]},${source[1]}C${sourceHandleX},${source[1]},${targetHandleX},${target[1]},${target[0]},${target[1]}`
}

type d3Selection = d3.Selection<d3.BaseType, {}, HTMLElement, any>;

export class GraphController {
  graph = new Graph();
  menuOpen = false;
  svg: d3Selection;
  canvas: d3Selection;
  svgWidth = 0;
  svgHeight = 0;
  gridWidth = 20;
  linkDrag: d3Selection;
  hoveredPortIn: PortIn;
  hoveredPortOut: PortOut;

  get canvasWidth() { return 3 * this.svgWidth }
  get canvasHeight() { return 3 * this.svgHeight }

  getMousePosition() {
    return d3.mouse((<any>this.svg.node()));
  }

  constructor(svg) {
    this.graph.controller = this;
    if (!svg)
      this.svg = d3.select('svg');
    else
      this.svg = svg;
    const clientRect = (<any>this.svg.node()).getBoundingClientRect();
    this.svgWidth = clientRect.width;
    this.svgHeight = clientRect.height;

    const that = this;
    const zoomGroup = this.svg.call(
      d3.zoom()
        .translateExtent([[0, 0], [this.canvasWidth, this.canvasHeight]])
        .scaleExtent([0.3333, 5])
        .on("zoom", () => {
          zoomGroup.attr('transform', d3.event.transform);
          this.closeMenu();
        })).append('g');
    this.svg = zoomGroup;
    this.drawGridLines();
    this.initMenu();
    this.initKeys();
  }

  drawGridLines() {
    this.svg.selectAll('.graph-grid').remove();
    const graphGrid = this.svg.append('g').classed('.graph-grid', true);
    let i = 0;
    for (let x = 0; x <= this.canvasWidth; x += this.gridWidth) {
      graphGrid.append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', this.canvasHeight)
        .attr('stroke-width', 1)
        .attr('stroke', 'gray');
    }
    for (let y = 0; y <= this.canvasHeight; y += this.gridWidth) {
      graphGrid.append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', this.canvasWidth)
        .attr('y2', y)
        .attr('stroke-width', 1)
        .attr('stroke', 'gray');
    }

    for (let x = 0; x <= this.canvasWidth; x += this.gridWidth * 10) {
      graphGrid.append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', this.canvasHeight)
        .attr('stroke-width', 1)
        .attr('stroke', '#666666');
    }
    for (let y = 0; y <= this.canvasHeight; y += this.gridWidth * 10) {
      graphGrid.append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', this.canvasWidth)
        .attr('y2', y)
        .attr('stroke-width', 1)
        .attr('stroke', '#666666');
    }

    this.canvas = this.svg.append('rect')
      .classed('canvas', true)
      .attr('width', this.canvasWidth)
      .attr('height', this.canvasHeight)
      .style('fill', 'transparent');
  }

  initMenu() {
    this.canvas.on('contextmenu', () => {
      d3.event.preventDefault();
      this.drawMenu();
    });
    this.canvas.on('click', () => {
      console.log('click');
      this.clearSelection();
      this.closeMenu();
    })
  }

  initKeys() {
    d3.select('body').on('keydown', () => {
      switch (d3.event.key) {
      case 'x': this.deleteSelection(); return;
      case 's':
        d3.event.preventDefault();
        if (d3.event.ctrlKey) {
          let text = JSON.stringify(this.graph.toJson());
          let element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
          element.setAttribute('download', 'graph.json');
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }
      }
    })
  }

  /* Menu functions */

  menuStack: d3Selection[] = [];
  drawNextMenu(activeOption: d3Selection) {
    const that = this;

    let { top, right } = (<any>activeOption.node()).getBoundingClientRect();

    let [x, y] = [right, top];

    const layer = this.menuStack.length;
    const menuSelection = d3.select('body').append('div').classed('graph-menu', true).classed('hidden', true)
      .style('left', x + 'px')
      .style('top', y + 'px');
    menuSelection.selectAll('div')
      .data((activeOption.datum() as OptionList).options)
      .enter()
      .append('div')
      .classed('graph-menu-option', true)
      .text(d => d.name)
      .on('mouseover', function(d) {
        that.popMenuStackTo(layer + 1);
        if ((<any>d).options) {
          that.drawNextMenu(d3.select(this));
        }
      })
      .on('click', function(d) {
        if ((<any>d).nodeClass) {
          let newNode = new (<any>d).nodeClass();
          newNode.display = { x: that.menuX - 20, y: that.menuY - 20 };
          console.log(newNode.display);
          that.graph.addNode(newNode);
          that.closeMenu();
        }
      })
    menuSelection.style('transform', 'scale(0)').transition().duration(200).style('transform', 'scale(1)');
    this.menuStack.push(menuSelection);
  }

  menuX = 0; menuY = 0;
  popMenuStackTo(layer: number) {
    while (this.menuStack.length > layer) {
      this.menuStack.pop().remove();
    }
  }

  drawMenu() {
    const menu = Menu.instance;
    const that = this;
    this.closeMenu();
    [this.menuX, this.menuY] = that.getMousePosition();
    const menuSelection = d3.select('body').append('div').classed('graph-menu', true)
      .style('left', d3.event.pageX + 'px')
      .style('top', d3.event.pageY + 'px');

    let done = false;
    let drawMenuOptions = (options) => {
      menuSelection.selectAll('div.graph-menu-option').remove();
      menuSelection.selectAll('div.graph-menu-option')
        .data(options)
        .enter()
        .append('div')
        .classed('graph-menu-option', true)
        .text((d: any) => d.name)
        .on('mouseover', function(d) {
          if (!done) return;
          that.popMenuStackTo(1);
          if ((<any>d).options) {
            that.drawNextMenu(d3.select(this));
          }
        })
        .on('click', function(d) {
          if ((<any>d).nodeClass) {
            let newNode = new (<any>d).nodeClass();
            newNode.display = { x: that.menuX - 20, y: that.menuY - 20 };
            that.graph.addNode(newNode);
            that.closeMenu();
          }
        })
    }

    const searchInput = menuSelection.append('input').classed('graph-menu-search', true)
      .attr('placeholder', 'search...')
      .on('input', function() {
        that.popMenuStackTo(1);
        if ((<any>this).value) {
          drawMenuOptions(menu.search((<any>this).value));
        } else {
          drawMenuOptions(menu.options);
        }
      });
    (<any>searchInput.node()).focus();

    drawMenuOptions(menu.options);
    menuSelection.style('transform', 'scale(0)').transition().duration(200)
      .style('transform', 'scale(1)')
      .on('end', () => {
        done = true;
      });
    this.menuStack.push(menuSelection);

  }

  closeMenu() {
    this.menuOpen = false;
    d3.select('body').selectAll('.graph-menu').remove();
    this.menuStack = [];
  }

  /* Node functions */

  clearSelection() {
    this.svg.selectAll('.graph-node').classed('selected', false);
  }

  drawTextInputs(inputs: TextInput[], parentSelection: d3Selection) {
    const width = inputs.reduce((accu, input) => Math.max(accu, input.display.width), 0);
    const totalHeight = inputs.reduce((accu, input) => accu + input.display.height, 0);

    const parent = parentSelection.append('foreignObject').attr('width', 1000).attr('height', 1000)
    const inputGroup = parent.append('xhtml:div').style('width', width);
    inputGroup.selectAll('input')
      .data(inputs)
      .enter()
      .append('xhtml:input')
      .attr('placeholder', d => d.name)
      .style('width', '100%')
      .style('height', d => d.display.height * 0.9 + 'px')
      .style('padding', d => d.display.height * 0.1 + 'px')
      .each(function(d) { (<any>this).value = d.text })
      .on('input', function(d) {
        d.text = (<any>this).value;
      }).on('focusout', function(d) {
        console.log(d.checker(d.text))
        if (!d.checker(d.text)) {
          d.text = d.defaultText;
          (<any>this).value = d.text;
        }
      }).on('keyup', function(d) {
        if (d3.event.keyCode == 13) {
          if (!d.checker(d.text)) {
            d.text = d.defaultText;
            (<any>this).value = d.text;
          }
          (<any>this).blur();
        }
      }).on('keydown', function(d) {
        console.log(d3.event);
        event.stopPropagation();
      });

    parent.attr('width', width).attr('height', d => totalHeight);
    return parent;
  }

  drawNode(node: Node, selected = false) {
    const newNode = this.svg.append('g').classed('graph-node', true)
      .attr('transform', `translate(${node.display.x}, ${node.display.y})`)
    newNode.datum(node).classed('selected', selected);
    node['_elem'] = newNode.node();

    newNode.on('contextmenu', () => {
      d3.event.preventDefault();
    })

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
      .attr('cy', (d, i) => separation * i)
      .style('fill', (d: Port) => DataType.fillColor(d.dataType))
      .style('stroke', (d: Port) => DataType.strokeColor(d.dataType));

    inPorts.selectAll('text')
      .data(node.inputs)
      .enter()
      .append('text')
      .classed('graph-port-title', true)
      .attr('x', 2 * radius)
      .attr('y', (d, i) => separation * i + radius)
      .style('fill', '#dddddd')
      .text(d => d.name);

    const inPortsRect: SVGRect = (<any>inPorts.node()).getBBox();

    const outPorts = newNode.append('g');
    outPorts.selectAll('circle')
      .data(node.outputs)
      .enter()
      .append('circle')
      .classed('graph-port', true)
      .attr('r', radius)
      .attr('cx', 0)
      .attr('cy', (d, i) => separation * i)
      .style('fill', (d: Port) => DataType.fillColor(d.dataType))
      .style('stroke', (d: Port) => DataType.strokeColor(d.dataType));

    outPorts.selectAll('text')
      .data(node.outputs)
      .enter()
      .append('text')
      .classed('graph-port-title', true)
      .attr('y', (d, i) => separation * i + radius)
      .style('fill', '#dddddd')
      .text(d => d.name)

    outPorts.selectAll('text')
      .attr('x', function(d) {
        return -(<any>this).getBBox().width - 2 * radius;
      });

    const outPortsRect: SVGRect = (<any>outPorts.node()).getBBox();

    inPorts.selectAll('circle').on('contextmenu', (d: PortIn) => {
      d3.event.preventDefault();
      this.graph.removeLink(d.inLink);
    });
    outPorts.selectAll('circle').on('contextmenu', (d: PortOut) => {
      d3.event.preventDefault();
      d.outLinks.map(link => link).forEach(link => {
        this.graph.removeLink(link);
      })
    });

    //draw content
    const textInptus = this.drawTextInputs(node.textInputs, newNode);

    const contentMinWidth = Math.max(titleRect.width + 20, 100);
    const contentPadding = 10;

    const inputWidth = Number(textInptus.attr('width'));
    const inputHeight = Number(textInptus.attr('height'));

    const contentWidth = Math.max(inputWidth + contentPadding * 2, contentMinWidth);
    const contentHeight = inputHeight + contentPadding * 2;

    const offsetX = (contentWidth - inputWidth) / 2 + inPortsRect.width;
    const offsetY = (contentHeight - inputHeight) / 2 + titleRect.height;
    textInptus.attr('transform', `translate(${offsetX},${offsetY})`);

    const inPortsX = 0;
    const inPortsY = titleRect.height + offset;
    const outPortsX = inPortsRect.width + contentWidth + outPortsRect.width;
    const outPortsY = titleRect.height + offset;
    inPorts.selectAll('circle').each((d, i) => {
      d['_position'] = { x: inPortsX, y: inPortsY + i * separation }
    });
    outPorts.selectAll('circle').each((d, i) => {
      d['_position'] = { x: outPortsX, y: outPortsY + i * separation }
    })

    //update
    inPorts.attr('transform', `translate(${inPortsX}, ${inPortsY})`)
    outPorts.attr('transform', `translate(${outPortsX}, ${outPortsY})`)

    rect.attr('width', contentWidth + inPortsRect.width + outPortsRect.width)
      .attr('height', Math.max(inPortsRect.height + offset, outPortsRect.height + offset, contentHeight)
      + titleRect.height);

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

    newNode.call(d3.drag().on('start', () => { })
      .on('drag', () => {
        // update position
        let newX = node.display.x + d3.event.dx;
        let newY = node.display.y + d3.event.dy;

        newX = Math.max(newX, 0);
        newY = Math.max(newY, 0);
        newX = Math.min(newX, this.canvasWidth - nodeRect.width);
        newY = Math.min(newY, this.canvasHeight - nodeRect.height);

        this.graph.updateNodePosition(node, newX, newY);
      }))

    const that = this; // hack
    let targetX = 0;
    let targetY = 0;
    let sourceX = 0;
    let sourceY = 0;
    inPorts.selectAll('circle').call(d3.drag().on('start', function(d: PortIn) {
      targetX = d['_position'].x + node.display.x;
      targetY = d['_position'].y + node.display.y;
      if (that.linkDrag) {
        that.linkDrag.remove();
        that.linkDrag = null;
      }
      that.linkDrag = that.svg.append('path')
        .classed('graph-link', true)
        .attr('d', linkHorizontal(that.getMousePosition(), [targetX, targetY]))
        .style('stroke', DataType.fillColor(d.dataType));
    }).on('drag', (d: PortIn) => {
      if (that.linkDrag) {
        that.linkDrag
          .attr('d', linkHorizontal(that.getMousePosition(), [targetX, targetY]))
          .style('stroke', DataType.fillColor(d.dataType));
      }
    }).on('end', (d: PortIn) => {
      that.linkDrag.remove();
      that.linkDrag = null;
      if (this.hoveredPortOut) {
        this.graph.addLink(this.hoveredPortOut, d);
      }
    }));

    outPorts.selectAll('circle').call(d3.drag().on('start', (d: PortOut) => {
      sourceX = d['_position'].x + node.display.x;
      sourceY = d['_position'].y + node.display.y;
      if (that.linkDrag) {
        that.linkDrag.remove();
        that.linkDrag = null;
      }
      that.linkDrag = that.svg.append('path')
        .classed('graph-link', true)
        .attr('d', linkHorizontal([sourceX, sourceY], that.getMousePosition()))
        .style('stroke', DataType.fillColor(d.dataType));
    }).on('drag', (d: Port) => {
      if (that.linkDrag) {
        that.linkDrag.attr('d', linkHorizontal([sourceX, sourceY], that.getMousePosition()))
          .style('stroke', DataType.fillColor(d.dataType));
      }
    }).on('end', (d: PortOut) => {
      that.linkDrag.remove();
      that.linkDrag = null;
      if (this.hoveredPortIn) {
        this.graph.addLink(d, that.hoveredPortIn);
      }
    }));

    outPorts.selectAll('circle').on('mouseover', function(d, i) {
      that.hoveredPortOut = <any>d;
    }).on('mouseout', () => {
      that.hoveredPortOut = null;
    });

    inPorts.selectAll('circle').on('mouseover', function(d, i) {
      that.hoveredPortIn = <any>d;
    }).on('mouseout', () => {
      that.hoveredPortIn = null;
    });
  }

  updateNodePosition(node: Node) {
    if (!node) return;
    d3.select(node._elem).attr('transform', `translate(${node.display.x}, ${node.display.y})`)
    node.inputs.forEach(port => this.updateLink(port.inLink));
    node.outputs.forEach(port => port.outLinks.forEach(link => this.updateLink(link)));
  }

  updateNode(node: Node) {
    if (!node) return;
    if (!node._elem) return;
    const selected = d3.select(node._elem).classed('selected');
    d3.select(node._elem).remove();
    this.drawNode(node, selected);
  }

  removeNode(node: Node) {
    if (!node) return;
    if (node._elem) {
      d3.select(node._elem).remove();
      node._elem = null;
    }
  }

  drawLink(link: Link) {
    if (!link) return;
    const startPosition = link.start.parentNode.display;
    const startOffset = link.start['_position']
    const [startX, startY] = [startPosition.x + startOffset.x, startPosition.y + startOffset.y];

    const endPosition = link.end.parentNode.display;
    const endOffset = link.end['_position']
    const [endX, endY] = [endPosition.x + endOffset.x, endPosition.y + endOffset.y];
    link._elem = this.svg.append('path')
      .classed('graph-link', true)
      .style('stroke', DataType.fillColor(link.start.dataType))
      .attr('d', linkHorizontal([startX, startY], [endX, endY])).node();
  }

  updateLink(link: Link) {
    if (!link) return;
    if (!link._elem) {
      return this.drawLink(link);
    }
    const startPosition = link.start.parentNode.display;
    const startOffset = link.start['_position']
    const [startX, startY] = [startPosition.x + startOffset.x, startPosition.y + startOffset.y];

    const endPosition = link.end.parentNode.display;
    const endOffset = link.end['_position']
    const [endX, endY] = [endPosition.x + endOffset.x, endPosition.y + endOffset.y];
    d3.select(link._elem).attr('d', linkHorizontal([startX, startY], [endX, endY]));
  }

  removeLink(link: Link) {
    if (link._elem) {
      d3.select(link._elem).remove();
    }
  }

  // lock the graph to prevent any changes
  lock() {
    this.graph.lock(true);
  }

  // unlock the graph
  unlock() {
    this.graph.lock(false);
  }

  deleteSelection() {
    this.svg.selectAll('.selected').each((d: Node) => {
      this.graph.removeNode(d);
    })
  }
}
