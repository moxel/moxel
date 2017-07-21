import React, {Component} from 'react';
import {Flex} from "layout-components";
import styles from './signup-modal.css';

class SignupModal extends Component {
  render() {
    // Render nothing if the "show" prop is false
    if(!this.props.show) {
      return null;
    }

    const duration = 300;

    // The modal "window"
    const modalStyle = {
      backgroundColor: '#fff',
      borderRadius: 5,
      top: '100px',
      maxWidth: 500,
      minHeight: 400,
      margin: '0 auto',
      padding: 30,
      position: 'fixed',
      display: 'block',
      zIndex: 9999,
      overflow: "hidden",
    };

    return (
      <div className="modal" style={modalStyle}>
        {this.props.children}

        <div className="footer">
          <span style={{float: "left", fontSize: "30px", marginLeft: "20px", marginTop: "5px"}}>
            Sign Up
          </span>
          <span style={{float: "right"}}>
            <a className="waves-effect waves-teal btn-flat" onClick={this.props.onClose}><i className="material-icons">close</i></a>
          </span>
        </div>
        <br/><br/><br/><br/>
        <div className="row">
          <form className="col s12">
            {/*<div className="row">
              <div className="input-field inline col s6">
                <input id="full_name" type="text" className="validate"/>
                <label for="full_name">Full Name</label>
              </div>
            </div>*/}
            <div className="row">
              <div className="input-field col s12">
                <input id="email" type="email" className="validate"/>
                <label htmlFor="email">Email</label>
              </div>
            </div>
            <div className="row">
              <div className="input-field col s12">
                <input id="password" type="password" className="validate"/>
                <label htmlFor="password">Password</label>
              </div>
            </div>

            <button style={{float: "right"}} className="waves-effect waves-light btn blue">Join</button> 
          </form>
        </div>
        
      </div> 

    );
  }
}

SignupModal.propTypes = {
  onClose: React.PropTypes.func.isRequired,
  show: React.PropTypes.bool,
  children: React.PropTypes.node
};

export default SignupModal;