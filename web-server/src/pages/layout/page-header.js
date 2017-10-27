import React, {Component} from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import PropTypes from "prop-types";
import HeaderButton from "./header-button";
import ProfileImage from '../../components/profile-image/profile-image';
import FixedWidthRow from "../../components/fixed-width-row";
import styled from 'styled-components';
import {Route} from "react-router-dom";
import {store} from "../../mock-data";  
import { SideNav, SideNavItem, Button, Card, Row, Col } from 'react-materialize';
import SignupModal from "../home-view/signup-modal";
import Mask from "../home-view/mask";
import AuthStore from "../../stores/AuthStore";
import LayoutUtils from "../../libs/LayoutUtils";
import {Link} from "react-router-dom";
import SearchBar from 'material-ui-search-bar'


const StyledLayout = styled(Flex)`
.page-banner input {
    color: black !important;
    box-shadow: none !important;
}

.page-banner input:focus {
    box-shadow: none !important;
}

.page-header-nav a {
    font-size: 15px;
}
`


class PageHeader extends Component {    
    constructor(props) {
        super(props);

        this.state = {
            width: window.innerWidth,
            scrollTop: window.scrollY
        };

        this.state = { isOpen: false };

        this.handleWindowSizeChange = this.handleWindowSizeChange.bind(this);
        this.handleSearchBarChange = this.handleSearchBarChange.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
      }

    toggleModal = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    componentWillMount() {
        this.setState({ width: window.innerWidth });
        window.addEventListener('resize', this.handleWindowSizeChange);
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowSizeChange);
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleWindowSizeChange = () => {
        this.setState({ width: window.innerWidth });
    }

    handleScroll() {
        this.setState({ scrollTop: window.scrollY });
    }

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

    handleSearchBarChange(text) {
        this.props.handleSearch(text);
    }

    render() {
        var self = this;

        const screenWidth = self.state.width;
        const isMobile = screenWidth <= 900;    

        function getBanner() {
            if(self.props.showBanner) {
                if(LayoutUtils.isMobile()) {
                    // TODO: implement mobile layout.
                    return (
                        <div className="nav-header center page-banner"
                            style={{
                                paddingTop: "10px",
                                paddingBottom: "50px"
                            }}>
                            <h1 style={{
                                fontSize: "30px", 
                                lineHeight: "1.2",
                                marginTop: "10px",
                                marginBottom: "10px",
                                fontWeight: 300}}>
                                World's Best Models, <br/> Built by the Community.
                            </h1>
                            <FixedWidthRow>
                                <div style={{lineHeight: 1, textAlign: "center", 
                                    position: "relative", width: "100%"}}>
                                    <SearchBar
                                      onChange={self.handleSearchBarChange}
                                      onRequestSearch={() => console.log('onRequestSearch')}
                                      hintText="Discover Models"
                                      style={{
                                          margin: '0 auto',
                                          width: "300px",
                                          borderRadius: "15px",
                                          position: "absolute",
                                          color: "black",
                                          left: "50px"
                                      }}
                                    />

                                    &nbsp;
                                    <br/>

                                </div>
                                
                                <br/>
                            </FixedWidthRow>
                        </div>
                    )
                }else{ // Desktop layout.
                    return (
                        <div className="nav-header center page-banner"
                            style={{
                                paddingTop: "10px",
                                paddingBottom: "50px"
                            }}>
                            <h1 style={{
                                fontSize: "25px", 
                                marginTop: "10px",
                                marginBottom: "10px",
                                fontWeight: 300}}>
                                World's Best Models, Built by the Community.
                            </h1>
                            <FixedWidthRow>
                                <div style={{lineHeight: 1, position: "relative", width: "100%"}}>
                                    <SearchBar
                                      onChange={self.handleSearchBarChange}
                                      onRequestSearch={() => console.log('onRequestSearch')}
                                      hintText="Discover Models"
                                      style={{
                                          margin: '0 auto',
                                          width: "500px",
                                          borderRadius: "15px",
                                          position: "absolute",
                                          color: "black",
                                          left: "50px"
                                      }}
                                    />

                                    &nbsp;

                                    <span
                                        style={{
                                            lineHeight: "48px",
                                            fontSize: "16px",
                                            position: "absolute",
                                            left: "600px"
                                        }}>
                                        Or
                                    </span>

                                    <Button waves="light" className="blue" 
                                        style={{
                                            width: "150px", 
                                            height: "48px",
                                            padding: 0,
                                            marginLeft: "20px", 
                                            marginRight: "20px",
                                            position: "absolute",
                                            borderRadius: "15px",
                                            textTransform: "none",
                                            fontSize: "16px",
                                            left: "630px"
                                        }} onClick={() => {AuthStore.login('/new');}}>Upload Models</Button>
                                </div>
                                
                                <br/>
                            </FixedWidthRow>
                        </div>
                    )
                }
            }else{
                return null;
            }
        }

        function getMenu() {
            if(!AuthStore.isAuthenticated()) {
                return (
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
                if(LayoutUtils.isMobile()) {
                    return  <SideNav trigger={<i className="material-icons">menu</i>} options={{ closeOnClick: true }}>
                                <SideNavItem waves icon="home"><Link to="/">Home</Link></SideNavItem>
                                <SideNavItem waves icon="star"><Link to="/models">Models</Link></SideNavItem>
                                <SideNavItem waves icon="create"><Link to="/new">Create</Link></SideNavItem>
                                <SideNavItem waves icon="bookmark border"><a href="http://docs.moxel.ai">Documentation</a></SideNavItem>
                                <SideNavItem divider />
                                <SideNavItem waves style={{position: "relative"}}>
                                    <ProfileImage size={32} url={AuthStore.picture()} style={{marginTop: "8px"}}/>
                                    <a style={{fontSize: "12px", color: "#666", display: "inline-block", position: "absolute"}}>Signed in as <b>{AuthStore.username()}</b></a> 
                                </SideNavItem>
                                <SideNavItem waves icon="account_box">
                                    <Link className="black-text" to={`/users/${AuthStore.username()}`}>Your Profile</Link>
                                </SideNavItem>    
                                <SideNavItem divider />
                                <SideNavItem waves icon="exit_to_app">
                                    <Link className="black-text" to="/logout">Logout</Link>
                                </SideNavItem>

                            </SideNav>
                }else{
                    /*<ul className="right  hide-on-med-and-down">*/
                    return (
                    <ul className="right page-header-nav">
                            <li><Link to="/models">Models</Link></li>
                            <li><Link to="/new">Create</Link></li>
                            <li><a href="http://docs.moxel.ai">Documentation</a></li>

                            <ul id="dropdown1" className="dropdown-content">
                                <li>
                                    <a style={{fontSize: "12px", color: "#666"}}>Signed in as <b>{AuthStore.username()}</b></a>
                                </li>
                                <li className="divider"></li>
                                <li>
                                    <Link className="black-text" to={`/users/${AuthStore.username()}`}>Your Profile</Link>
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
            }
        }

        function getNavbarStyle() {
            if(self.props.showBanner) {
                return {
                    position: "absolute",
                    width: "100%",
                    top: "0px",
                    zIndex: 99999,
                    height: "240px"
                }
            }else{
                var style = {
                    position: "fixed",
                    top: "0px",
                    width: "100%",
                    zIndex: 99999,
                };

                if(self.state.scrollTop > 0) {
                    style['boxShadow'] = '0 0 10px #333';
                };

                return style;
            }
        }

        return (
            <StyledLayout>
                <div style={getNavbarStyle()}>
                    <nav className="nav-extended" style={{boxShadow: "none"}}>
                        <div className="nav-background">
                            <div className="pattern active" style={{backgroundImage: "url('http://cdn.shopify.com/s/files/1/1775/8583/t/1/assets/icon-seamless.png')"}}></div>
                        </div>
                        <FixedWidthRow>
                            <div className="nav-wrapper" style={{width: "100%"}}>
                                <Link to="/" className="brand-logo"><img style={{height: "30px", paddingTop: "5px"}} src="/images/moxel.png"></img></Link>
                                {getMenu()}
                                {getBanner()}
                            </div>
                        </FixedWidthRow>
                    </nav>
                </div>
            </StyledLayout>
        )
    }
}

PageHeader.propTypes = {
    showBanner: PropTypes.bool
};

export default PageHeader;
