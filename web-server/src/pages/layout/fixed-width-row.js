import React, {Component} from 'react';
import {Flex, FlexItem} from "layout-components";

import "./page-header.css";
class FixedWidthRow extends Component {
    render() {
        return (
            <FlexItem fixed width="100%" height="50px" style={{backgroundColor: "grey"}}>
                <Flex row align="center" className="page-header-inner"
                      style={{margin: '0 auto', width: '900px'}}>{
                    this.props.children || null
                }</Flex>
            </FlexItem>
        )
    }
}

export default FixedWidthRow;