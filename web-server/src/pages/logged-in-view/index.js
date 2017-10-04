import React, {Component} from "react";
import AuthStore from "../../stores/AuthStore";
import {Redirect} from "react-router-dom";
import ErrorNoConnectionView from "../../pages/error-view/no-connection";

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

class LoggedInView extends Component {
    constructor() {
        super();

        var self = this;

        self.state = {
            redirectUrl: null
        }

        var code = getParameterByName('code');
        var redirect_uri = window.location.origin;

        fetch(`/api/auth?code=${code}&redirect_uri=${redirect_uri}`).then((response) => {
            return response.json();
        }).then((result) => {
            AuthStore.setAccessToken(result['id_token']);
            AuthStore.setProfile(result['profile'])
            console.log('User profile', result['profile']);
            var redirectUrl = localStorage.getItem('auth0RedirectUrl');
            if(redirectUrl) {
                localStorage.removeItem('auth0RedirectUrl');
                window.location.href = redirectUrl;
                // self.setState({
                //     redirectUrl: redirectUrl
                // });
            }
        }).catch((err) => {
            self.setState({
                redirectUrl: '404'
            })
        });
    }

    render() {
        if(!this.state.redirectUrl) {
            return <div></div>;
        }
        if(this.state.redirectUrl == '404') {
            return <ErrorNoConnectionView/>
        }
        return <Redirect to={this.state.redirectUrl}/>;
    }
}

export default LoggedInView;
