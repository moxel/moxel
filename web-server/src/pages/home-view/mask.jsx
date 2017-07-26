import React, {Component} from 'react';
import {Flex} from "layout-components";

class Mask extends Component {
  render() {
      if(!this.props.show) return null;

      const maskStyle = {
        opacity: 0.8,
        background: 'black',
        position: 'fixed',
        width: "100000px",
        height: "100000px",
        zIndex: 999
      };

      return (
          <div style={maskStyle}></div>
      )  
  }
}

Mask.propTypes = {
  show: React.PropTypes.bool,
  children: React.PropTypes.node
};

export default Mask;