import React from "react";
import TextInputWithClearButton from "./text-input-with-clear-button";
import {Flex, FlexItem} from "layout-components";

import "./search-bar.css";
export default function SearchBar({className, onSubmit, height = "40px", style, ..._props}) {
    return (<Flex row className={`search-bar ${className}`} style={{height, ...style}} justify="stretch">
        <FlexItem fluid
                  height={height}
                  component={TextInputWithClearButton} {..._props}/>
        <FlexItem fixed
                  height={height}
                  component="button" onClick={onSubmit}>Search</FlexItem>
    </Flex>)
}