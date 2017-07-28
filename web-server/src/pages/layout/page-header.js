import React, {Component} from 'react';
import {FlexItem, FlexSpacer} from "layout-components";
import PropTypes from "prop-types";
import HeaderButton from "./header-button";
import ProfileImage from '../../components/profile-image/profile-image';
import FixedWidthRow from "../../components/fixed-width-row";
import styled from 'styled-components';
import {Route} from "react-router-dom";
import {store} from "../../mock-data";  
import { Button, Card, Row, Col } from 'react-materialize';
import SignupModal from "../home-view/signup-modal";
import Mask from "../home-view/mask";
import AuthStore from "../../stores/AuthStore";

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
        let banner = null;
        if(!AuthStore.isAuthenticated() && this.props.showBanner) {
            banner = (
                <div className="nav-header center">
                    <br/>
                    <h1 style={{fontSize: "65px", fontWeight: 400}}>World's Best Models <br/> Built by the Community</h1>
                    <div className="tagline" style={{lineHeight: 6, fontSize: 20}}>
                        Dummy.ai is a platform to build and share machine intelligence.
                    </div>
                     <div className="row">
                        <form className="col s10 offset-s1" action="//xyz.us1.list-manage.com/subscribe/post?u=dfe1971430cfa22545ae7ba85&amp;id=5fc1f57ce4" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate>
                            <div id="mc_embed_signup">
                                <div id="mc_embed_signup_scroll">
                                    <div className="row">
                                        <div className="col s6 offset-s2">
                                            <input id="email" style={{border: "none", borderRadius: "5px", width: "100%", height: "40px", backgroundColor: "white", color: "black"}} type="email" name="EMAIL" className="email validate" placeholder="Email Adress"/>
                                        </div>
                                        <div className="col s2" style={{lineHeight: "0px", marginLeft: "20px"}}>
                                            <input type="submit" value="Sign Up" name="subscribe" id="mc-embedded-subscribe" className="btn btn-wavs green" style={{paddingLeft: "0px", paddingRight: "0px", lineHeight: "0px", margin: "0px", height: "40px"}}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <br/>
                </div>
            )
        }
        var menu = (
            <ul className="right hide-on-med-and-down">
              <li className="active"><a href="/">Models</a></li>
              {/*<li><a href="warpdrive.html">Warpdrive</a></li>
               <li><a href="http://docs.dummy.ai/">Docs</a></li>*/}
            </ul>
        )
        return (
            <div>
                <Mask show={this.state.isOpen}></Mask>
                <SignupModal show={this.state.isOpen}
                  onClose={this.toggleModal} useAuth0="true">
                </SignupModal>

                <nav className="nav-extended" style={{boxShadow: "none"}}>
                    <div className="nav-background">
                        <div className="pattern active" style={{backgroundImage: "url('http://cdn.shopify.com/s/files/1/1775/8583/t/1/assets/icon-seamless.png')"}}></div>
                    </div>
                    <div className="nav-wrapper container">
                        <a href="/" className="brand-logo"><i className="material-icons" style={{fontSize: "32px"}}>face</i>Dummy.ai</a>
                        <a href="#" data-activates="nav-mobile" className="button-collapse"><i className="material-icons">menu</i></a>
                        {menu}
                        {banner}
                    </div>
                </nav>

               
            </div>

           
        )
    }
}

PageHeader.propTypes = {
    showBanner: PropTypes.bool
};

export default PageHeader;
