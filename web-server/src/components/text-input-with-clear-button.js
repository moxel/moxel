import React from "react";
import "./text-input-with-clear-button.css";
import {Flex, FlexItem} from "layout-components";

export default function TextInputWithClearButton({type = "text", height, /*radius,*/ style = {}, onClear, ..._props}) {
    height = height || style.height;
    // radius = radius || style.borderRadius;
    return (
        <Flex row
              className="text-input-with-clear-button"
              justify="stretch"
              style={{...style, height}}>
            <FlexItem component="input"
                      type={type}
                      style={{paddingRight: height}}
                      {..._props}/>
            <button onClick={onClear} style={{height, width: height}}>ⓧ</button>
        </Flex>
    );
}