import React, {Component} from 'react';
import {Flex} from "layout-components";
import PageHeader from "./page-header";
import PageFooter from "./page-footer";
import styled from "styled-components";
import AuthStore from "../../stores/AuthStore";

const Page = styled(Flex)`{
    min-height: 600px;
    min-width: 860px;
    padding-top: 0;
    padding-bottom: 0;
    ${PageBody} {
        flex: 1 0 auto;
    }
}`;

const PageBody = styled(Flex)`{
    padding-top: 50px;
    background-color: rgb(246, 249, 255);
    ${PageBody} {
        flex: 1 0 auto;
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
            <Page column>
                <PageHeader showBanner={showBanner}/>
                <PageBody className="page-body">{this.props.children}</PageBody>
                <PageFooter/>
            </Page>
        );
    }
}

export default PageLayout;
