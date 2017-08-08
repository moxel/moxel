import React, {Component} from 'react';
import {Flex} from "layout-components";
import PageHeader from "./page-header";
import PageFooter from "./page-footer";
import styled from "styled-components";
import AuthStore from "../../stores/AuthStore";

const PageBody = styled(Flex)`{
    min-height: 600px;
    ${PageBody} {
        flex: 1 0 auto
    }
}`;
class PageLayout extends Component {
    render() {
        var isLoggedIn = AuthStore.isAuthenticated();
        console.log('is logged in? ', isLoggedIn);

        let showBanner = false;
        if(window.location.pathname == '/') {
            showBanner = true;
        }

        return (
            <PageBody column>
                <PageHeader showBanner={showBanner}/>
                <PageBody className="page-body">{this.props.children}</PageBody>
                <PageFooter/>
            </PageBody>
        );
    }
}

export default PageLayout;
