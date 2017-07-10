import React from 'react';
import {Flex, FlexItem} from "layout-components";
import FixedWidthRow from "../../components/fixed-width-row";
import SearchBar from "../../components/SearchBar";

import "./catalogue.css";
export default function SearchLayout(props) {
    return (
        <Flex column className="catalogue-layout-container">
            <FixedWidthRow component="h1" className="catalogue-hero"
            >Search For Your Favorite Model</FixedWidthRow>
            <FixedWidthRow component={SearchBar}
                           className="catalogue-search-bar"
                           placeholder="Search 15,291 models"/>
            <Flex component={FlexItem}
                  fluid
                  width="100%"
                  className="catalogue-body-container">{
                props.children.map((child) => <FixedWidthRow
                    justify="stretch"
                    height="100%">{child}</FixedWidthRow>)
            }</Flex>
        </Flex>
    )
}