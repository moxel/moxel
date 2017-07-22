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
import Stepper from 'react-stepper-horizontal';
import { withRouter } from 'react-router';
import DropzoneComponent from 'react-dropzone-component';
import "react-dropzone-component/styles/filepicker.css";
import "dropzone/dist/min/dropzone.min.css";

var componentConfig = {
    iconFiletypes: ['.zip', 'Folder'],
    showFiletypeIcon: true,
    postUrl: '/uploadHandler'
};

var djsConfig = {};


const StyledDropzone = styled(Flex)`
    div.filepicker {
        background-color: white;
    }
    `;

class UploadView extends Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    constructor() {
        super()

        this.state = {
            step: 0,
            uploaded: false,
            stepEnabled: true
        }

        this.nextStep = this.nextStep.bind(this);
        this.uploadEventHandlers = { 
            addedfile: (file) => {
                console.log(file) 
            }
        }
    }


    nextStep() {
        console.log('changing state', this.state.step)
        this.setState({
            step: this.state.step + 1
        })
    }

    render() {
        var params = this.props.match.params;

        let content = null;
        switch(this.state.step) {
            case 0: // Wrap Your Model.
                content = (
                    <div>
                        <ul id="tabs-swipe-demo" className="tabs">
                            <li className="tab col s3"><a className="active" href="#test-swipe-1">Python Flask</a></li>
                            <li className="tab col s3"><a href="#test-swipe-2">Python Tornado</a></li>
                        </ul>
                        <div id="test-swipe-1" className="col s12">
                            <FixedWidthRow>
                                <Markdown tagName="instruction" className="markdown-body">
                                <br/>
                                {`   
                                    The first step is to wrap your model in a python Flask server. Let's use \`server.py\`.

                                    The server has two endpoints: 

                                    \`\`\`python
                                    from flask import Flask, jsonify
                                    app = Flask(__name__)

                                    @app.route('/', methods=['GET'])
                                    def healthcheck():
                                        return 'OK'

                                    @app.route('/', methods=['POST'])
                                    def predict():
                                        data = request.json
                                        ...
                                        return jsonify(result)

                                    app.run(port=5900, host='0.0.0.0')
                                    \`\`\`

                                    The \`GET\` endpoint is a probe for the health status of the model. 

                                    The \`POST\` endpoint is where model prediction happens. You need to wrap input and ouput as JSON.

                                `}
                                </Markdown>                            
                            </FixedWidthRow>
                            <br/>
                        </div>
                    </div>
                )
                break; 
            case 1: // Upload Your Model.
                if(!this.state.uploaded) {
                    this.setState({
                        stepEnabled: false
                    })
                }
                content = (
                    <StyledDropzone>
                        <div className="row">
                            <div id="test-swipe-1" className="col s12 offset-m2 m8">
                                <br/>
                                <h5>Upload Your Model Here</h5>
                                <br/>
                                <DropzoneComponent config={componentConfig}
                                   eventHandlers={this.uploadEventHandlers}
                                   djsConfig={djsConfig} />
                                <br/>
                            </div>
                        </div>
                    </StyledDropzone>
                )
                break;
        }

        return (
            <div>
                <div className="row">
                    <div className="col s12 offset-m2 m8">
                        <Stepper steps={ [{title: 'Wrap Your Model'}, {title: 'Upload Your Model'}, {title: 'Setup Your Model'}, {title: 'Finish'}] } activeStep={ this.state.step } />
                    </div>
                </div>
                <div className="row">
                    <div className="col s12 offset-m2 m8">
                        <div className="card">
                            {content}

                            <div className="row">
                                <div className="col s2 m2 offset-s10 offset-m10">
                                    <button className="waves-effect waves-light btn blue" disabled={!this.state.stepEnabled} 
                                        onClick={this.nextStep}>
                                        Next
                                    </button> 
                                </div>
                            </div>

                            <div className="row">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(UploadView);
