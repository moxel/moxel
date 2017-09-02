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
    height: 100px;

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
                    <HeaderButton fixed to="/">(c) 2017, Moxel.</HeaderButton>
                    <FlexSpacer/>
                    <HeaderButton fixed to="/">
                        <iframe src="/version.html" scrolling="no" style={{display: "inline-block", border: "none", height: "30px"}}/></HeaderButton>
                    {/*<HeaderButton fixed to="/terms">Terms of Service</HeaderButton>
                    <HeaderButton fixed to="/privacy">Privacy Policy</HeaderButton>
                    <HeaderButton fixed to="/about">About</HeaderButton>*/}
                </FixedWidthRow>
            </StyledFooter>
        )
    }
}

export default PageFooter;