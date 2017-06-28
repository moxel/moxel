import React, {Component} from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import HeaderButton from "./header-button";

import "./page-footer.css";
class PageFooter extends Component {
    render() {
        return (
            <FlexItem fixed width="100%" className="page-footer">
                <Flex row align="center" className="page-footer-inner" style={{margin: '0 auto', width: '1060px'}}>
                    <HeaderButton fixed to="/">Dummy.ai</HeaderButton>
                    <FlexSpacer/>
                    <HeaderButton fixed to="/blog">Blog</HeaderButton>
                    <HeaderButton fixed to="/about">About</HeaderButton>
                </Flex>
            </FlexItem>
        )
    }
}

export default PageFooter;