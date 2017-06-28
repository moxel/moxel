import React, {Component} from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import HeaderButton from "./header-button";
import ProfileImage from '../../components/profile-image';

import "./page-header.css";
import {store} from "../../mock-data";
import {Route} from "react-router-dom";
class PageHeader extends Component {
    render() {
        return (
            <FlexItem fixed width="100%" height="50px" className="page-header">
                <Flex row align="center" className="page-header-inner" style={{margin: '0 auto', width: '1060px'}}>
                    <Route exact path="/(.+)" component={()=>(<HeaderButton exact fixed to="/">Home</HeaderButton>)}/>
                    <HeaderButton fixed to="/list">Deep Learning Models</HeaderButton>
                    <HeaderButton fixed to="/blog">Blog</HeaderButton>
                    <HeaderButton fixed to="/help">Help</HeaderButton>
                    <FlexSpacer/>
                    <HeaderButton fixed to="/account"><FlexItem fixed component={ProfileImage} style={{marginRight: "5px"}}/>{store.account.name}</HeaderButton>
                </Flex>
            </FlexItem>
        )
    }
}

export default PageHeader;