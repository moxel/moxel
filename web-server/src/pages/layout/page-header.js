import React, {Component} from 'react';
import {FlexItem, FlexSpacer} from "layout-components";
import HeaderButton from "./header-button";
import ProfileImage from '../../components/profile-image/profile-image';
import FixedWidthRow from "../../components/fixed-width-row";
import styled from 'styled-components';

// import "./page-header.css";

const StyledPageHeader = styled(FlexItem)`
    position: relative;
    top: 0;
    bottom: 0;
    background-color: rgb(51, 72, 101);
    > .page-header-inner {
        height: 100%;
    }
`;
import {store} from "../../mock-data";
import {Route} from "react-router-dom";
class PageHeader extends Component {
    render() {
        return (
            <StyledPageHeader fixed width="100%" height="50px" className="page-header">
                <FixedWidthRow row align="center" className="page-header-inner">
                    <Route exact path="/(.+)" component={() => (<HeaderButton exact fixed to="/">Home</HeaderButton>)}/>
                    <HeaderButton fixed to="/list?category=models">Models</HeaderButton>
                    <HeaderButton fixed to="/list?category=datasets">Datasets</HeaderButton>
                    <HeaderButton fixed to="/blog">Blog</HeaderButton>
                    <HeaderButton fixed to="/help">Help</HeaderButton>
                    <FlexSpacer/>
                    <HeaderButton fixed to="/account"><FlexItem fixed component={ProfileImage} size={32}
                                                                username="strin"
                                                                style={{marginRight: "5px"}}/>{store.account.name}
                    </HeaderButton>
                </FixedWidthRow>
            </StyledPageHeader>
        )
    }
}

export default PageHeader;