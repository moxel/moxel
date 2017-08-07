import React, {Component} from "react";
import PropTypes from "prop-types";
import FixedWidthRow from "../../components/fixed-width-row";
import ModelSnippet from "../../components/model-snippet/model-snippet";
import NotificationBanner from "../../components/notification-banner/notification-banner";
import {store} from "../../mock-data";
import {Flex, FlexItem} from "layout-components";
import TabButtonBar from "../../components/tab-button-bar";
import 'markdown-it';
import Markdown from 'react-markdownit';
import styled from "styled-components";
import AuthStore from "../../stores/AuthStore";
import ModelStore from "../../stores/ModelStore";

class CreateView extends Component {
    gotoUpload() {
        var userId = AuthStore.username();
        var modelId = document.querySelector('#modelId').value;
        var modelDescription = document.querySelector('#modelDescription').value;
        var modelTitle = document.querySelector('#modelTitle').value;
        var tag = "latest";
        // caching the description.
        localStorage.setItem(userId + "/" + modelId, modelDescription);

        ModelStore.updateModel(userId, modelId, tag, {
            'title': modelTitle,
            'description': modelDescription,
            'status': 'METADATA'
        }).then(function(resp) {
            window.location.href = "/models/" + userId + "/" + modelId  + "/" + tag;
        })
        return false;
    }

    render() {
        var username = AuthStore.username();

        return (
            <div className="row">
                <div className="col s12  m8 offset-m2">
                    <form className="card" onSubmit={(event) => {event.preventDefault(); this.gotoUpload();}}>
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
                                {/*<div className="col s1 m1" style={{fontSize: "40px", width: "40px", paddingRight: "40px"}}>
                                    <i className="material-icons">star</i>
                                </div>*/}
                                <div className="input-field col s2 m2">
                                <label htmlFor="username">User</label>
                                    <input id="username" type="text" className="validate" value={username} style={{pointerEvents: "none"}}/>
                                </div>
                                <div className="col s1 m1" style={{fontSize: "40px", width: "40px"}}>
                                    /
                                </div>
                                <div className="input-field col s7 m7">
                                    <label htmlFor="modelId" data-error="wrong" data-success="right">Model Name</label>
                                    <input id="modelId" required="" aria-required="true" type="text" className="validate" required="true" aria-required="true"/>
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
            </div>
        );
    }
}

CreateView.propTypes = {
    
};

export default CreateView;
