import React, {Component} from 'react';
import {Flex, FlexItem} from "layout-components";
import PageHeader from "./page-header";
import PageFooter from "./page-footer";

class PageLayout extends Component {
    render() {
        return (
            <Flex column>
                <PageHeader/>
                <FlexItem fluid>{this.props.children}</FlexItem>
                <PageFooter/>
            </Flex>
        );
    }
}

export default PageLayout;
