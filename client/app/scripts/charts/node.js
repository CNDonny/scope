import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import reactMixin from 'react-mixin';
import classNames from 'classnames';

import { clickNode, enterNode, leaveNode } from '../actions/app-actions';
import { getNodeColor } from '../utils/color-utils';

import NodeShapeCircle from './node-shape-circle';
import NodeShapeStack from './node-shape-stack';
import NodeShapeRoundedSquare from './node-shape-rounded-square';
import NodeShapeHex from './node-shape-hex';
import NodeShapeHeptagon from './node-shape-heptagon';
import NodeShapeCloud from './node-shape-cloud';

function stackedShape(Shape) {
  const factory = React.createFactory(NodeShapeStack);
  return props => factory(Object.assign({}, props, {shape: Shape}));
}

const nodeShapes = {
  circle: NodeShapeCircle,
  hexagon: NodeShapeHex,
  heptagon: NodeShapeHeptagon,
  square: NodeShapeRoundedSquare,
  cloud: NodeShapeCloud
};

function getNodeShape({ shape, stack }) {
  const nodeShape = nodeShapes[shape];
  if (!nodeShape) {
    throw new Error(`Unknown shape: ${shape}!`);
  }
  return stack ? stackedShape(nodeShape) : nodeShape;
}

function ellipsis(text, fontSize, maxWidth) {
  const averageCharLength = fontSize / 1.5;
  const allowedChars = maxWidth / averageCharLength;
  let truncatedText = text;
  if (text && text.length > allowedChars) {
    truncatedText = `${text.slice(0, allowedChars)}...`;
  }
  return truncatedText;
}

export default class Node extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.handleMouseClick = this.handleMouseClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.state = { hovered: false };
  }

  render() {
    const { blurred, focused, highlighted, label, pseudo, rank,
      subLabel, scaleFactor, transform, zoomScale } = this.props;
    const { hovered } = this.state;
    const nodeScale = focused ? this.props.selectedNodeScale : this.props.nodeScale;

    const color = getNodeColor(rank, label, pseudo);
    const truncate = !focused && !hovered;
    const labelText = truncate ? ellipsis(label, 14, nodeScale(4 * scaleFactor)) : label;
    const subLabelText = truncate ? ellipsis(subLabel, 12, nodeScale(4 * scaleFactor)) : subLabel;

    let labelOffsetY = 18;
    let subLabelOffsetY = 35;
    let labelFontSize = 14;
    let subLabelFontSize = 12;

    // render focused nodes in normal size
    if (focused) {
      labelFontSize /= zoomScale;
      subLabelFontSize /= zoomScale;
      labelOffsetY /= zoomScale;
      subLabelOffsetY /= zoomScale;
    }

    const className = classNames({
      node: true,
      highlighted,
      blurred,
      hovered,
      pseudo
    });

    const NodeShapeType = getNodeShape(this.props);

    return (
      <g className={className} transform={transform} onClick={this.handleMouseClick}
        onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        <rect className="hover-box"
          x={-nodeScale(scaleFactor * 0.5)}
          y={-nodeScale(scaleFactor * 0.5)}
          width={nodeScale(scaleFactor)}
          height={nodeScale(scaleFactor)}
          />
        <text className="node-label" textAnchor="middle" style={{fontSize: labelFontSize}}
          x="0" y={labelOffsetY + nodeScale(0.5 * scaleFactor)}>
          {labelText}
        </text>
        <text className="node-sublabel" textAnchor="middle" style={{fontSize: subLabelFontSize}}
          x="0" y={subLabelOffsetY + nodeScale(0.5 * scaleFactor)}>
          {subLabelText}
        </text>
        <NodeShapeType
          size={nodeScale(scaleFactor)}
          color={color}
          {...this.props} />
      </g>
    );
  }

  handleMouseClick(ev) {
    ev.stopPropagation();
    clickNode(this.props.id, this.props.label, ReactDOM.findDOMNode(this).getBoundingClientRect());
  }

  handleMouseEnter() {
    enterNode(this.props.id);
    this.setState({ hovered: true });
  }

  handleMouseLeave() {
    leaveNode(this.props.id);
    this.setState({ hovered: false });
  }
}

reactMixin.onClass(Node, PureRenderMixin);
