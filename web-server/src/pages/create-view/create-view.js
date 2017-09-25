import React, {Component} from "react";
import PropTypes from "prop-types";
import FixedWidthRow from "../../components/fixed-width-row";
import ModelSnippet from "../../components/model-snippet/model-snippet";
import {store} from "../../mock-data";
import {Flex, FlexItem} from "layout-components";
import TabButtonBar from "../../components/tab-button-bar";
import 'markdown-it';
import Markdown from 'react-markdownit';
import styled from "styled-components";
import AuthStore from "../../stores/AuthStore";
import ModelStore from "../../stores/ModelStore";
import NotificationBanner from '../../components/notification-banner/notification-banner';


class CreateView extends Component {
    constructor() {
        super();

        this.state = {
            'accessCode': null
        };

        this.handleAccessCode = this.handleAccessCode.bind(this);
    }

    gotoUpload() {
        var userId = AuthStore.username();
        var modelId = document.querySelector('#modelId').value;
        var modelDescription = document.querySelector('#modelDescription').value;
        var modelTitle = document.querySelector('#modelTitle').value;
        var tag = "latest";
        var self = this;
        // Check to see if the model already exists.
        ModelStore.listModelTags(userId, modelId).then((models) => {
            if(models.length != 0) {
                // Model already exists.
                self.notificationSystem.addNotification({
                  message: `Model ${modelId} already exists. Continuing to page...`,
                  level: 'error'
                });

                window.setTimeout(function() {
                    window.location.href = "/models/" + userId + "/" + modelId  + "/" + models[0].tag;
                }, 3000);
            }else{
                ModelStore.updateModel(userId, modelId, tag, {
                    'title': modelTitle,
                    'description': modelDescription,
                    'status': 'METADATA'
                }).then(function(resp) {
                    window.location.href = "/models/" + userId + "/" + modelId  + "/" + tag;
                })    
            }
        });

        return false;
    }

    handleAccessCode(e) {
        this.setState({
            'accessCode': e.target.value
        });
    }

    componentDidUpdate() {
        if(this.userInput) this.userInput.focus();
        if(this.modelInput) this.modelInput.focus();
    }

    render() {
        var username = AuthStore.username();
        var self = this;

        if(self.state.accessCode == null) {
            return renderAccessCodeBox();
        }else if(self.state.accessCode == 'backprop') {
            return renderCreateView();
        }else{
            return renderAccessCodeBox();
        }

        function renderAccessCodeBox() {
            return (
                <FixedWidthRow>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                        <div className="col s12 m12">
                            <div className="card blue darken-3">
                                <div className="card-content white-text">
                                    <div className="card-title">
                                    Beta Program
                                    </div>

                                </div>

                                <div className="card-content blue white-text" style={{fontSize: "18px"}}>
                                We are actively beta testing Moxel to make it easy and robust :)

                                <br/>
                                <br/>

                                Currently, uploading models is invite-only. If you'd like to join the beta program, reach out at support@moxel.ai or by clicking the chat button. Tell us what you think of Moxel!

                                <br/><br/>

                                <input id="access-code" placeholder="Put in access code to continue..." className="white-text" onChange={self.handleAccessCode}/>

                                </div>
                            </div>

                                
                            
                        </div>
                    </div>
                </FixedWidthRow>
            );
        }

        function renderCreateView() {
            return (
                <FixedWidthRow>
                    <div className="row" style={{marginTop: "40px", marginLeft: "0px", marginRight: "0px", width: "100%"}}>
                        <div className="col s12  m12">
                            <form className="card" onSubmit={(event) => {event.preventDefault(); self.gotoUpload();}}>
                                <div className="row">
                                </div>
                                <div className="row">
                                    <div className="col s12 m10 offset-m1">
                                        <h4>Contribute a new model</h4>
                                        <p style={{color: "grey"}}>A model repository contains all versions of the model, and describes how it's used.</p>
                                        {/*<p>
                                        Need names for AI? Checkout <a href="https://en.wikipedia.org/wiki/List_of_fictional_computers">this</a> for inspiration.
                                        </p>*/}
                                    </div>
                                </div>

                                <div className="row" style={{marginBottom: "0px"}}>
                                    <div className="col s12 m10 offset-m1">
                                        <div className="input-field col s2 m2">
                                            <label htmlFor="username">User</label>
                                            <input id="username" type="text" className="validate" value={username} style={{pointerEvents: "none"}} ref={(input) => { self.userInput = input; }}/>
                                        </div>
                                        <div className="col s1 m1" style={{fontSize: "40px", width: "40px"}}>
                                            /
                                        </div>
                                        <div className="input-field col s7 m7">
                                            <label htmlFor="modelId" data-error="wrong" data-success="right">Model Name</label>
                                            <input id="modelId" pattern="[a-z0-9\.\-]+" title="Model name should only contain lowercase letters, numbers, dash and dot, e.g. inception-v3.2015" required="" aria-required="true" type="text" className="validate" required="true" aria-required="true" ref={(input) => {self.modelInput = input;}}/>
                                        </div>

                                        
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12 m10 offset-m1">
                                        {/*<div className="col s1 m1" style={{fontSize: "40px", width: "40px", paddingRight: "40px"}}>
                                            <i className="material-icons">edit</i>
                                        </div>*/}
                                        <div className="input-field col s10 m10">
                                            <label htmlFor="modelTitle">Model Title</label>
                                            <input id="modelTitle" type="text" className="validate" required aria-required="true"/>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12 m10 offset-m1">
                                        {/*<div className="col s1 m1" style={{fontSize: "40px", width: "40px", paddingRight: "40px"}}>
                                            <i className="material-icons">edit</i>
                                        </div>*/}
                                        <div className="input-field col s10 m10">
                                            <label htmlFor="modelDescription">Model Description (Optional)</label>
                                            <input id="modelDescription" type="text" className="validate" aria-required="true"/>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s4 m4 offset-s9 offset-m9">
                                        <button className="waves-effect waves-light btn blue">
                                            Create Model
                                        </button> 
                                    </div>
                                </div>

                                <div className="row">
                                </div>
                            </form>
                        </div>
                        <NotificationBanner ref={(notificationSystem) => {self.notificationSystem = notificationSystem;}} />
                    </div>
                </FixedWidthRow>
            );
        }
    
    }
}

CreateView.propTypes = {
    
};

export default CreateView;
