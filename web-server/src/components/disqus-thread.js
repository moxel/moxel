import React from 'react';
import PropTypes from 'prop-types';
import AuthStore from "../stores/AuthStore";
import CryptoJS from "crypto-js"

const SHORTNAME = 'moxel';

function renderDisqus() {
  if (window.DISQUS === undefined) {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://' + SHORTNAME + '.disqus.com/embed.js';
    document.getElementsByTagName('head')[0].appendChild(script);
  } else {
    window.DISQUS.reset({reload: true});
  }
}

var DISQUS_SECRET = "QkO4HIOnea1QufMI8VeLlggeuVIG2ynnKp6gmZ4WjTN6V59F045Jsz9aPCluq01t";
var DISQUS_PUBLIC = "w9QGLsNA2FbfVMFvQ9LYlnuU3KFLpFz7pPr452jWPWlxgGHaujTjXmg3Sw20ySIC";

function disqusSignonMessage(user) {
    var disqusData = {
      id: AuthStore.username(),
      username: AuthStore.username(),
      email: AuthStore.email()
    };

    var disqusStr = JSON.stringify(disqusData);
    var timestamp = Math.round(+new Date() / 1000);

    /*
     * Note that `Buffer` is part of node.js
     * For pure Javascript or client-side methods of
     * converting to base64, refer to this link:
     * http://stackoverflow.com/questions/246801/how-can-you-encode-a-string-to-base64-in-javascript
     */
    var message = new Buffer(disqusStr).toString('base64');

    /* 
     * CryptoJS is required for hashing (included in dir)
     * https://code.google.com/p/crypto-js/
     */
    var result = CryptoJS.HmacSHA1(message + " " + timestamp, DISQUS_SECRET);
    var hexsig = CryptoJS.enc.Hex.stringify(result);

    return message + " " + hexsig + " " + timestamp
}

class DisqusThread extends React.Component{

  static propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  };

  shouldComponentUpdate(nextProps) {
    return this.props.id !== nextProps.id ||
      this.props.title !== nextProps.title ||
      this.props.url !== nextProps.url;
  }

  componentDidMount() {
    renderDisqus();
  }

  componentDidUpdate() {
    renderDisqus();
  }

  render() {
    let { id, title, url, ...other} = this.props;

    window.disqus_shortname = SHORTNAME;
    window.disqus_identifier = id;
    window.disqus_title = title;
    window.disqus_url = url;
    window.disqus_config = function () {
        this.page.remote_auth_s3 = disqusSignonMessage();
        this.page.api_key = DISQUS_PUBLIC;
    } 

    if(window.location.hostname == 'localhost') {
        window.disqus_developer = 1;
    }


    return <div {...other} id="disqus_thread" />;
  }

}

export default DisqusThread;