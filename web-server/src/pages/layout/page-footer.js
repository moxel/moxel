import React, {Component} from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import HeaderButton from "./header-button";
import FixedWidthRow from "./fixed-width-row";

import "./page-footer.css";
class PageFooter extends Component {
    render() {
        return (
            <FlexItem fixed width="100%" className="page-footer">
                <FixedWidthRow row align="center" className="page-footer-inner">
                    <HeaderButton fixed to="/">Dummy.ai</HeaderButton>
                    <FlexSpacer/>
                    <HeaderButton fixed to="/blog">Blog</HeaderButton>
                    <HeaderButton fixed to="/about">About</HeaderButton>
                </FixedWidthRow>
            </FlexItem>
        )
    }
}

export default PageFooter;