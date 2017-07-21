import React, {Component} from 'react';
import {FlexItem, FlexSpacer} from "layout-components";
import HeaderButton from "./header-button";
import ProfileImage from '../../components/profile-image/profile-image';
import FixedWidthRow from "../../components/fixed-width-row";
import styled from 'styled-components';
import {Route} from "react-router-dom";
import {store} from "../../mock-data";  
import { Button, Card, Row, Col } from 'react-materialize';
import SignupModal from "../home-view/signup-modal";

const StyledPageHeader = styled(FlexItem)`
    position: relative;
    top: 0;
    bottom: 0;
    background-color: rgb(51, 72, 101);
    > .page-header-inner {
        height: 100%;
    }
`;


class PageHeader extends Component {    
    constructor(props) {
        super(props);

        this.state = { isOpen: false };
      }

    toggleModal = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        return (
            <div>
                <SignupModal show={this.state.isOpen}
                  onClose={this.toggleModal}>
                </SignupModal>

                <nav className="nav-extended">
                    <div className="nav-background">
                        <div className="pattern active" style={{backgroundImage: "url('http://cdn.shopify.com/s/files/1/1775/8583/t/1/assets/icon-seamless.png')"}}></div>
                    </div>

                    <div className="nav-wrapper container">
                        <a href="index.html" className="brand-logo"><i className="material-icons" style={{fontSize: "32px"}}>face</i>Dummy.ai</a>
                        <a href="#" data-activates="nav-mobile" className="button-collapse"><i className="material-icons">menu</i></a>
                        <ul className="right hide-on-med-and-down">
                          <li className="active"><a href="index.html">Models</a></li>
                          <li><a href="Warpdrive.html">Warpdrive</a></li>
                          <li><a href="blog.html">Blog</a></li>
                          <li><a href="http://docs.dummy.ai/">Docs</a></li>
                          <li><a className='dropdown-button' href='#' data-activates='feature-dropdown' data-belowOrigin="true" data-constrainWidth="false">About<i className="material-icons right">arrow_drop_down</i></a></li>
                        </ul>

                        <div className="nav-header center">
                            <h1>World's Best Models <br/> Built by the Community</h1>
                            <div className="tagline" style={{lineHeight: 6}}>
                                Dummy.ai is a platform to build and share machine intelligence.
                            <div>
                                <Button waves="light" className="blue" onClick={this.toggleModal}>Upload Model</Button> 
                                &nbsp;&nbsp;&nbsp;&nbsp; 
                                <Button waves="light" className="green">Discover Model</Button>
                                &nbsp; 
                            </div>
                            </div>
                        </div>
                    </div>

                </nav>
            </div>

           
        )
    }
}

export default PageHeader;
