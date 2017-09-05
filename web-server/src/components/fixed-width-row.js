import React  from 'react';
import {Flex} from "layout-components";
import LayoutUtils from "../libs/LayoutUtils"

export default function FixedWidthRow({className="", style = {}, children, ..._props}) {
  if(LayoutUtils.isMobile()) {
    var style = {
      position: "relative",
      ...style,
      marginLeft: 'auto',
      marginRight: "auto",
      width: '100%',
      minWidth: '300px',
      maxWidth: '500px'
    }
  }else{
    var style={
        position: "relative",
        ...style,
        marginLeft: 'auto',
        marginRight: "auto",
        width: '860px',
        minWidth: '860px',
        maxWidth: '860px'
    };
  }

  return (
      <Flex row
            align="center"
            className={`fixed-width-row ${className}`}
            style={style} {..._props}
      >{children || null}</Flex>
  )
}

