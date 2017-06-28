import React  from 'react';
import {Flex} from "layout-components";

export default function FixedWidthRow({className="", style = {}, children, ..._props}) {
    return (
        <Flex row
              align="center"
              className={`fixed-width-row ${className}`}
              style={{
                  position: "relative",
                  ...style,
                  marginLeft: 'auto',
                  marginRight: "auto",
                  width: '860px',
                  minWidth: '860px',
                  maxWidth: '860px'
              }} {..._props}
        >{children || null}</Flex>
    )
}

