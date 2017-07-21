import React, {Component} from 'react';
import {Flex} from "layout-components";
import PageHeader from "./page-header";
import PageFooter from "./page-footer";
import styled from "styled-components";

const PageBody = styled(Flex)`{
    min-height: 600px;
    ${PageBody} {
        flex: 1 0 auto
    }
}`;
class PageLayout extends Component {
    

    render() {
        return (
            <PageBody column>
                <PageHeader/>
                <PageBody className="page-body">{this.props.children}</PageBody>
                <PageFooter/>
            </PageBody>
        );
    }
}

export default PageLayout;
