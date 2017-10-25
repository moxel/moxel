import React, {Component} from 'react';
import {Flex} from "layout-components";
import PageHeader from "./page-header";
import PageFooter from "./page-footer";
import styled from "styled-components";
import AuthStore from "../../stores/AuthStore";
import LayoutUtils from "../../libs/LayoutUtils";

if(LayoutUtils.isMobile()) {
    var Page = styled(Flex)`{
        min-height: 600px;
        width: 100%;
        max-width: 500px;
        min-width: 300px;
        padding-top: 0;
        padding-bottom: 0;
        ${PageBody} {
            flex: 1 0 auto;
        }
    }`;
}else{
    var Page = styled(Flex)`{
        min-height: 600px;
        min-width: 860px;
        padding-top: 0;
        padding-bottom: 0;
        ${PageBody} {
            flex: 1 0 auto;
        }
    }`;
}


const PageBody = styled(Flex)`{
    padding-top: 75px;
    background-color: rgb(246, 249, 255);
    ${PageBody} {
        flex: 1 0 auto;
    }
}`;


class PageLayout extends Component {
    constructor() {
        super();

        this.handleSearch = this.handleSearch.bind(this);

        this.state = {
            searchText: ''
        };
    }

    handleSearch(text) {
        console.log('handle search', text);
        this.setState({
            searchText: text
        });
    }

    render() {
        var self = this;

        var isLoggedIn = AuthStore.isAuthenticated();
        console.log('is logged in? ', isLoggedIn);

        let showBanner = false;
        var bodyOffset;
        if(window.location.pathname == '/') {
            showBanner = true;
            bodyOffset = "240px"
        }else{
            bodyOffset = "75px";
        }

        const childrenWithProps = React.Children.map(this.props.children, 
            (child) => {
                let searchEnabled = child.props.searchEnabled;

                if(searchEnabled) {
                    let render = (props) => {
                        props.searchText = self.state.searchText;
                        return child.props.render(props);
                    };
                    return React.cloneElement(child, {render: render});
                }else{
                    return child;
                }
        });

        return (
            <Page column>
                <PageHeader showBanner={showBanner} handleSearch={this.handleSearch}/>
                <PageBody className="page-body" 
                    style={{
                        paddingTop: bodyOffset
                    }}>{childrenWithProps}</PageBody>
                <PageFooter/>
            </Page>
        );
    }
}

export default PageLayout;
