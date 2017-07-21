import React, {Component} from 'react';
import {Flex} from "layout-components";
import PageHeader from "./page-header";
import PageFooter from "./page-footer";
import styled from "styled-components";
import SignupModal from "../home-view/signup-modal";

const PageBody = styled(Flex)`{
    min-height: 600px;
    ${PageBody} {
        flex: 1 0 auto
    }
}`;
class PageLayout extends Component {
    constructor(props) {
        super(props);

        this.state = { isOpen: true };
      }

    toggleModal = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        return (
            <PageBody column>
                <SignupModal show={this.state.isOpen}
                  onClose={this.toggleModal}>
                </SignupModal>
                
                <PageHeader/>
                <PageBody className="page-body">{this.props.children}</PageBody>
                <PageFooter/>
            </PageBody>
        );
    }
}

export default PageLayout;
