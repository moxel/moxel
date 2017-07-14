import React from "react";
import TextInputWithClearButton from "./text-input-with-clear-button";
import {Flex, FlexItem} from "layout-components";
import styled from "styled-components";

const StyledSearchBar = styled(Flex)`
    > button {
        cursor: pointer;
        border-radius: 8px;
        border: 0 solid transparent;
        padding: 0 18px;
        font-size: 1em;
        color: #fffff4;
        background-color: #f1346e;
    }
    > button:hover {
        background-color: #eb336c;
    }

    > button:active{
        background-color: #cb2963;
    }
`;
export default function SearchBar({className, onSubmit, height = "40px", style, ..._props}) {
    return (
        <StyledSearchBar row className={`search-bar ${className}`} style={{height, ...style}} justify="stretch">
            <FlexItem fluid
                      height={height}
                      component={TextInputWithClearButton} {..._props}/>
            <FlexItem fixed
                      height={height}
                      component="button" onClick={onSubmit}>Search</FlexItem>
        </StyledSearchBar>)
}