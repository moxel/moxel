import React, {Component} from 'react';
import {Flex, FlexItem} from "layout-components";
import HeaderButton from "./header-button";

import "./page-header.css";
class PageHeader extends Component {
    render() {
        return (
            <FlexItem fixed width="100%" height="50px" style={{backgroundColor: "grey"}}>
                <Flex row align="center" className="page-header-inner" style={{margin: '0 auto', width: '900px'}}>
                    <HeaderButton fixed>header 1</HeaderButton>
                    <HeaderButton fixed>header 2</HeaderButton>
                    <HeaderButton fixed>header 3</HeaderButton>
                    <HeaderButton fixed>header 4</HeaderButton>
                </Flex>
            </FlexItem>
        )
    }
}

export default PageHeader;