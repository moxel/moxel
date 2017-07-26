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
import ClipboardButton from 'react-clipboard.js';
import request from "superagent"

var componentConfig = {
    iconFiletypes: ['.zip'],
    showFiletypeIcon: true,
    postUrl: 'no-url'
};

var djsConfig = {
    method: 'put',
    headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': null,
        'X-Requested-With': null
    }
};


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
        this.backStep = this.backStep.bind(this);
        this.upload = this.upload.bind(this);

        
        this.uploadEventHandlers = { 
            addedfile: (file) => {
                console.log(componentConfig.postUrl);
                this.upload(file);
            }
        }
    }

    upload(file) {
        console.log('file', file)


        
        //     console.log('changing', url);
        //     componentConfig.postUrl = url;
        //     return;
        //     console.log('url', url)

        //     request
        //       .put(url)
        //       .set('Content-Type','application/octet-stream')
        //       .send(file)
        //       .on('progress', e => {
        //         console.log('Percentage done: ', e.percent);
        //       })
        //       .end((error, res) => {
        //         if(error) return console.error('error',error)
        //         if(res.statusCode !== 200) return console.error('Wrong status code')

        //         //...success
        //       });
            
        // })
    }

    componentDidMount() {
        // var params = this.props.match.params;
        // var commit = "test";
        // fetch(`/api/url/data?user=${params.user}&name=${params.modelId}&cloud=gcloud&path=${commit}&verb=PUT`).then((response)=>{
        //     return response.json();
        // }).then(function(data) {
        //     console.log(data);

        //     componentConfig.postUrl = data.url;
        // });

    }


    nextStep() {
        var stepEnabled = true;
        // if(this.state.step == 0) {
        //     stepEnabled = this.state.uploaded;
        // }
        if(this.state.step == 4) return
        this.setState({
            step: this.state.step + 1,
            stepEnabled: stepEnabled
        })
    }

    backStep() {
        var stepEnabled = true;
        // if(this.state.step == 0) {
        //     stepEnabled = this.state.uploaded;
        // }
        if(this.state.step == 0) return
        this.setState({
            step: this.state.step - 1,
            stepEnabled: stepEnabled
        })
    }

    render() {
        let content = null;
        let params = this.props.match.params
        let user = params.user
        let modelId = params.modelId

        switch(this.state.step) {
            case 0: // Install Warpdrive.
                content = (
                    <div>
                        <ul id="tabs-swipe-install" className="tabs">
                            <li className="tab col s3"><a className="active" href="#install-swipe-1">Mac&nbsp;OS</a></li>
                            <li className="tab col s3"><a href="#install-swipe-2">Linux</a></li>
                        </ul>
                        <div id="install-swipe-1" className="col s12">
                            <div className="row">
                                <br/>
                            </div>
                                
                            <div className="row">
                                <div className="col s12 offset-m1 m10">
                                     Warpdrive is a Command Line Tool (CLI) to help you upload models. 
                                     <br/>
                                     To install, run this command in your terminal:
                                </div>
                            </div>
                           
                           <br/>
                            
                            <div className="row">
                                <div className="col s12 offset-m1 m8">
                                    <input id="warp-install" value="curl -Lo /usr/local/bin/warp http://beta.dummy.ai/release/cli/0.0.0-alpha/warp && chmod 777 /usr/local/bin/warp" readonly style={{backgroundColor: "#1F2A41", color: "white", paddingLeft: "10px", border: "none"}}/>
                                </div>
                                <div className="col s12 m2">
                                    <ClipboardButton className="btn-flat" data-clipboard-target="#warp-install">
                                        <i className="material-icons">content_copy</i>
                                    </ClipboardButton>    
                                </div>
                                
                            </div>

                            <div className="row">
                                <div className="col s12 offset-m1 m8">
                                    After installation, try login 
                                </div>
                            </div>

                            <div className="row">

                                <div className="col s12 offset-m1 m8">
                                        <input id="warp-login" value="warp login" readonly style={{backgroundColor: "#1F2A41", color: "white", paddingLeft: "10px", border: "none"}}/>
                                </div>
                                <div className="col s12 m2">
                                    <ClipboardButton className="btn-flat" data-clipboard-target="#warp-login">
                                        <i className="material-icons">content_copy</i>
                                    </ClipboardButton>    
                                </div>
                                
                            </div>

                        </div>
                        <div id="install-swipe-2" className="col s12">
                            TODO: Not Implemented.
                        </div>
                    </div>
                )
                break; 
            case 1: // Wrap Your Model.
                content = (
                    <div>
                        <ul id="tabs-swipe-wrap" className="tabs">
                            <li className="tab col s3"><a className="active" href="#wrap-swipe-1">Python Flask</a></li>
                            <li className="tab col s3"><a href="#wrap-swipe-2">Python Tornado</a></li>
                        </ul>
                        <div id="wrap-swipe-1" className="col s12">
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
                        <div id="wrap-swipe-2" className="col s12">
                        </div>
                    </div>
                )
                break; 
            case 2: // Deploy Your Model.
                let yaml = ("user: " + user + "\n" +
                            "name: " + modelId + "\n" +
                            "tag: latest\n" +
                            "image: dummyai/py3-tf-gpu\n" +
                            "description: " + localStorage.getItem(user + "/" + modelId) + "\n" +
                            "assets:\n" +
                            "- (path to weight file)\n" +
                            "cmd:\n" +
                            "- (command 1)\n" +
                            "- (command 2)\n" +
                            "- ...\n"
                            )

                content = (
                    <StyledDropzone>
                        <div className="row">
                            {/*<ul id="tabs-swipe-deploy" className="tabs">
                                <li className="tab col s3"><a className="active" href="#deploy-swipe-1">Command Line Tools</a></li>
                                <li className="tab col s3"><a href="#deploy-swipe-2">Drag and Drop</a></li>
                            </ul>*/}
                            {/*<div id="deploy-swipe-1" className="col s12">*/}
                                <div className="row">
                                </div>
                                <div className="row">
                                </div>

                                <div className="row">
                                    <div className="col s12 offset-m1 m8">     
                                        Now, let's upload your model with Warpdrive CLI.
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12 offset-m1 m8">     
                                        <Markdown tagName="instruction" className="markdown-body">
                                            Warpdrive is tightly integrated with Git. So first make sure your model code is in a git repository. Now, create a `dummy.yaml` inside the repo directory:
                                        </Markdown>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12 offset-m1 m8">
                                            <textarea id="warp-yaml"  style={{backgroundColor: "#1F2A41", color: "white", paddingLeft: "10px", border: "none", height: "300px"}}
                                            value={yaml}>
                                            </textarea>
                                    </div>
                                    <div className="col s12 m2">
                                        <ClipboardButton className="btn-flat" data-clipboard-target="#warp-yaml">
                                            <i className="material-icons">content_copy</i>
                                        </ClipboardButton>    
                                    </div>                            
                                </div>

                                <div className="row">
                                    <div className="col s12 offset-m1 m8">
                                    To create a model with this configuration, run
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12 offset-m1 m8">
                                        <input id="warp-create" value="warp create -f dummy.yml" readonly style={{backgroundColor: "#1F2A41", color: "white", paddingLeft: "10px", border: "none"}}/>
                                    </div>
                                    <div className="col s12 m2">
                                        <ClipboardButton className="btn-flat" data-clipboard-target="#warp-create">
                                            <i className="material-icons">content_copy</i>
                                        </ClipboardButton>    
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12 offset-m1 m8">
                                    To create a model with this configuration, run
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12 offset-m1 m8">
                                        <input id="warp-deploy" value={"warp deploy " + modelId + ":latest"} readonly style={{backgroundColor: "#1F2A41", color: "white", paddingLeft: "10px", border: "none"}}/>
                                    </div>
                                    <div className="col s12 m2">
                                        <ClipboardButton className="btn-flat" data-clipboard-target="#warp-deploy">
                                            <i className="material-icons">content_copy</i>
                                        </ClipboardButton>    
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12 offset-m1 m8">
                                    Read our <a href="http://docs.dummy.ai/deploy/" target="_blank">documentation</a> to learn more about deployment.
                                    </div>
                                </div>
                            {/*</div>*/}
                            {/*<div id="deploy-swipe-2" className="col s12">
                                <div className="col s12 offset-m2 m8">
                                    <br/>
                                    <h5>Upload Your Model Here</h5>
                                    <br/>
                                    This functionality is not implemented yet.
                                    <br/>
                                    <DropzoneComponent config={componentConfig}
                                       eventHandlers={this.uploadEventHandlers}
                                       djsConfig={djsConfig} />
                                    <br/>
                                </div>
                            </div>*/}
                        </div>
                    </StyledDropzone>
                )
                break;
        }

        return (
            <div>
                <div className="row">
                    <div className="col s12 offset-m2 m8">
                        <Stepper steps={ [{title: 'Install Warpdrive'}, {title: 'Wrap Your Model'}, {title: 'Deploy Your Model'}, {title: 'Finish'}] } activeStep={ this.state.step } />
                    </div>
                </div>
                <div className="row">
                    <div className="col s12 offset-m2 m8">
                        <div className="card">
                            {content}

                            <div className="row">
                                <div className="col s2 m2 offset-s8 offset-m8">
                                    <button className="waves-effect waves-light btn grey" disabled={!this.state.stepEnabled}  style={{float: "right"}}
                                        onClick={this.backStep}>
                                        Back
                                    </button> 
                                </div>
                                <div className="col s2 m2">

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
