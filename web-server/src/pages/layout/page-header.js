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

        this.state = {
            width: window.innerWidth,
        };
        this.state = { isOpen: false };
      }

    toggleModal = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    componentWillMount() {
        this.setState({ width: window.innerWidth });
        window.addEventListener('resize', this.handleWindowSizeChange);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowSizeChange);
    }

    handleWindowSizeChange = () => {
        this.setState({ width: window.innerWidth });
    };

    landing(e) {
        console.log('landing', e);
        var email = document.querySelector('#email').value;
        console.log(email)
        fetch(`/api/landing`, {
            method: "POST",
            body: JSON.stringify({
                email: email
            })
        })
        document.querySelector('#mc-embedded-subscribe').value = "Thanks!"
    }


    render() {
        const screenWidth = this.state.width;
        const isMobile = screenWidth <= 900;    

        let banner = null;

        if(this.props.showBanner) {
            banner = (
                <div className="nav-header center">
                    <br/>
                    <h1 style={{fontSize: (isMobile ? "35px" : "65px"), fontWeight: 400}}>World's Best Models <br/> Built by the Community</h1>
                    <div className="tagline" style={{lineHeight: (isMobile ? 10 : 6), fontSize: (isMobile ? "10px" : "20px")}}>
                        Moxel is a platform to build and share machine intelligence.
                    </div>
                    <div>
                        <Button waves="light" className="blue" onClick={() => {AuthStore.login('/new');}}>Upload Model</Button>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Button waves="light" className="green" onClick={() => window.location.href = "/models"}>Discover Model</Button>
                        &nbsp;
                    </div> 
                    
                    <br/>
                </div>
            )
        }

        var menu = null;
        if(!AuthStore.isAuthenticated()) {
            menu = (
                <ul className="right hide-on-med-and-down">

                    <li><a onClick={()=>{AuthStore.login('/');}}>Login</a></li>

                </ul>
            )
        }else{
            /*<ul className="right  hide-on-med-and-down">*/
            menu = (
                <ul className="right">
                    <li><a href="/models">Models</a></li>

                    <li><a href="/new">Create</a></li>

                    <ul id="dropdown1" className="dropdown-content">
                        <li><a href="/logout" className="black-text">Logout</a></li>
                    </ul>
                    <li><a className="dropdown-button" href="#!" data-activates="dropdown1">{AuthStore.username()}<i className="material-icons right">arrow_drop_down</i></a></li>


                </ul>
            )
        }
        return (
            <div>
                <nav className="nav-extended" style={{boxShadow: "none"}}>
                    <div className="nav-background">
                        <div className="pattern active" style={{backgroundImage: "url('http://cdn.shopify.com/s/files/1/1775/8583/t/1/assets/icon-seamless.png')"}}></div>
                    </div>
                    <div className="nav-wrapper container">
                        <a href="/" className="brand-logo"><img style={{height: "30px", paddingTop: "5px"}} src="/images/moxel.png"></img></a>
                        {/*<ul id="nav-mobile" className="side-nav">
                            <li><a href="/models">Models</a></li>
                            <li><a href="/new">Create</a></li>
                            <li><a href="/logout" className="black-text">Logout</a></li>
                        </ul>
                        <a href="#" dataActivates="nav-mobile" className="button-collapse"><i className="material-icons">menu</i>
                        </a>*/}
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
