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
import {Link} from "react-router-dom";


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
                        <Button waves="light" className="green"><Link to="/models">Discover Model</Link></Button>
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
                    <li>
                        <Button waves="light" className="green" onClick={()=>{AuthStore.signup(window.location.pathname)}}>
                            Sign Up
                        </Button>
                    </li>
                    <li><a onClick={()=>{AuthStore.login(window.location.pathname);}}>Log in</a></li>
                </ul>
            )
        }else{
            /*<ul className="right  hide-on-med-and-down">*/
            menu = (
                <ul className="right">
                    <li><Link to="/models">Models</Link></li>

                    <li><Link to="/new">Create</Link></li>

                    <ul id="dropdown1" className="dropdown-content">
                        <li>
                            <a style={{fontSize: "12px", color: "#666"}}>Signed in as <b>{AuthStore.username()}</b></a>
                        </li>
                        <li className="divider"></li>
                        <li>
                            <Link className="black-text" to="/logout">Logout</Link>
                        </li>
                    </ul>
                    <li>
                        <a className="dropdown-button" href="#!" data-activates="dropdown1" style={{height: "64px", width: "120px", textAlign: "center"}}>
                            <div>
                                <ProfileImage username={AuthStore.username()} size={32} url={AuthStore.picture()} style={{marginTop: "16px"}}/>
                                <i className="material-icons right">arrow_drop_down</i>
                            </div>
                        </a>
                    </li>


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
                        <Link to="/" className="brand-logo"><img style={{height: "30px", paddingTop: "5px"}} src="/images/moxel.png"></img></Link>
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
