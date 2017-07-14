import React, {Component} from 'react';
import {FlexItem, FlexSpacer} from "layout-components";
import HeaderButton from "./header-button";
import FixedWidthRow from "../../components/fixed-width-row";
import styled from "styled-components";

const StyledFooter = styled(FlexItem)`
    position: relative;
    top: 0;
    bottom: 0;
    background-color: rgba(198, 202, 208, 0.18);
    height: 200px;
    > .page-footer-inner {
        height: 100%;
    }
    .header-button {
        color: grey;
    }
    .header-button:hover {
        color: #484848;
    }
`;

class PageFooter extends Component {
    render() {
        return (
            <StyledFooter fixed width="100%" className="page-footer">
                <FixedWidthRow row align="center" className="page-footer-inner">
                    <HeaderButton fixed to="/">Dummy.ai</HeaderButton>
                    <FlexSpacer/>
                    <HeaderButton fixed to="/blog">Blog</HeaderButton>
                    <HeaderButton fixed to="/about">About</HeaderButton>
                </FixedWidthRow>
            </StyledFooter>
        )
    }
}

export default PageFooter;