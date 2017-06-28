import React, {Component} from 'react';
import {Flex, FlexItem} from "layout-components";
import PageHeader from "./page-header";
import PageFooter from "./page-footer";

import "./page-layout.css";
class PageLayout extends Component {
    render() {
        return (
            <Flex column>
                <PageHeader/>
                <div style={{flex: "1 0 auto"}} className="page-body">{this.props.children}</div>
                <PageFooter/>
            </Flex>
        );
    }
}

export default PageLayout;
