import React from "react";
import {Flex, FlexItem} from "layout-components";
import styled from "styled-components";

const StyledInput = styled(Flex)`
    position: relative;
    margin-right: 10px;

    > button {
        cursor: pointer;
        transition: color 0.5s;
        position: absolute;
        text-align: center;
        right: 0;
        top: 0;
        bottom: 0;
        border-radius: 8px;
        background-color: rgba(253, 253, 253, 0);
        font-size: 1.2em;
        color: grey;
        border: 1px solid transparent;
        box-sizing: border-box;
    }

    > button:hover {
        color: black;
    }

    > button:active{
        /*box-shadow: inset #808080 0 0 18px;*/
        background-color: #eee;
    }

    > input {
        width: 100%;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        position: absolute;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid #dddddd;
        padding: 4px 18px;
    }

    > input {
        font-size: 1em;
    }

    > input:focus {
        outline: none;
    }
`;

export default function TextInputWithClearButton({type = "text", height, /*radius,*/ style = {}, onClear, ..._props}) {
    height = height || style.height;
    // radius = radius || style.borderRadius;
    return (
        <StyledInput row
              className="text-input-with-clear-button"
              justify="stretch"
              style={{...style, height}}>
            <FlexItem component="input"
                      type={type}
                      style={{paddingRight: height}}
                      {..._props}/>
            <button onClick={onClear} style={{height, width: height}}>ⓧ</button>
        </StyledInput>
    );
}