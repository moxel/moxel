import React, {Component} from "react";
import AuthStore from "../../stores/AuthStore";
import {Redirect} from "react-router-dom";

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
            localStorage.setItem('accessToken', result['access-token']);
            localStorage.setItem('profile', JSON.stringify(result['profile']));
            console.log('User profile', result['profile']);
            var redirectUrl = localStorage.getItem('auth0RedirectUrl');
            if(redirectUrl) {
                localStorage.removeItem('auth0RedirectUrl');
                self.setState({
                    redirectUrl: redirectUrl
                });
            }
        });
    }

    render() {
        if(!this.state.redirectUrl) {
            return <div></div>;
        }
        return <Redirect to={this.state.redirectUrl}/>;
    }
}

export default LoggedInView;
