import React, {Component} from 'react';
import {FlexItem, FlexSpacer} from "layout-components";
import HeaderButton from "./header-button";
import ProfileImage from '../../components/profile-image/profile-image';
import FixedWidthRow from "./fixed-width-row";

import "./page-header.css";
import {store} from "../../mock-data";
import {Route} from "react-router-dom";
class PageHeader extends Component {
    render() {
        return (
            <FlexItem fixed width="100%" height="50px" className="page-header">
                <FixedWidthRow row align="center" className="page-header-inner">
                    <Route exact path="/(.+)" component={()=>(<HeaderButton exact fixed to="/">Home</HeaderButton>)}/>
                    <HeaderButton fixed to="/list">Browse Models</HeaderButton>
                    <HeaderButton fixed to="/blog">Blog</HeaderButton>
                    <HeaderButton fixed to="/help">Help</HeaderButton>
                    <FlexSpacer/>
                    <HeaderButton fixed to="/account"><FlexItem fixed component={ProfileImage} size={38} username="strin" style={{marginRight: "5px"}}/>{store.account.name}</HeaderButton>
                </FixedWidthRow>
            </FlexItem>
        )
    }
}

export default PageHeader;