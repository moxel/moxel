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
import {Tabs, Tab} from 'react-materialize'

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
            uploaded: false
        }

        this.nextStep = this.nextStep.bind(this);
        this.backStep = this.backStep.bind(this);
        this.finalizeStep = this.finalizeStep.bind(this);
        this.upload = this.upload.bind(this);

        
        this.uploadEventHandlers = { 
            addedfile: (file) => {
                console.log(componentConfig.postUrl);
                this.upload(file);
            }
        }

        this.steps = [{title: 'Install Moxel'}, {title: 'Wrap Your Model'}, {title: 'Deploy Your Model'}, {title: 'Finish'}] 
        
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
        let params = this.props.match.params
        
        var userId = params.userId
        var modelId = params.modelId
        var tag = params.tag;

        // Thread to check if the model is uploaded.
        var modelProbe = function() {
            fetch(`/api/users/${userId}/models/${modelId}/${tag}`, {
                "method": "GET"
            }).then((response)=>{
                return response.json();
            }).then(function(data) {
                console.log(data);
                if(data.status == "LIVE") { // model has been successfully uploaded.
                    this.setState({
                        step: this.steps.length - 1
                    })
                }else{
                    setTimeout(modelProbe, 1000);
                }
            }.bind(this))
        }.bind(this);

        setTimeout(modelProbe, 1000);
    }

    // Finished flow. Redirect user to model page.
    finalizeStep() {
        let params = this.props.match.params
        
        var userId = params.userId
        var modelId = params.modelId
        var tag = params.tag;

        window.location.href = `/models/${userId}/${modelId}/${tag}`;
    }

    nextStep() {
        console.log('step', this.state.step)
        if(this.state.step == 3) {
            this.finalizeStep()
            return
        }
        this.setState({
            step: this.state.step + 1
        })
    }

    backStep() {
        if(this.state.step == 0) return
        this.setState({
            step: this.state.step - 1
        })
    }

    render() {
        var self = this;

        let params = this.props.match.params
        
        var userId = params.userId
        var modelId = params.modelId
        var tag = params.tag;

        let content = null;

        this.nextStepEnabled = true;
        this.backStepEnabled = true;
        if(this.state.step == 0 || this.state.step == 3) {
            this.backStepEnabled = false;
        }
        if(this.state.step == 2) {
            this.nextStepEnabled = false;
        }

        switch(this.state.step) {
            case 0: 
                function renderCommandWithCopy(id, command) {
                    return (
                        <div className="row" style={{marginTop: "15px"}}>
                            <div className="col s12 m10" style={{paddingLeft: "0"}}>
                                    <input id={id} value={command} readOnly 
                                        style={{backgroundColor: "#1F2A41", color: "white", paddingLeft: "10px", border: "none"}}
                                    />
                            </div>
                            <div className="col s12 m2">
                                <ClipboardButton className="btn-flat" data-clipboard-target={'#' + id} style={{height: "45px"}}>
                                    <i className="material-icons">content_copy</i>
                                </ClipboardButton>    
                            </div>
                        </div>
                    );
                }
                function setupInstructions() {
                    return (
                        <div>
                            <div className="row">
                                <br/>
                            </div>
                                    
                            <div className="row">
                                <div className="col s12 offset-m1 m10">
                                     Moxel provides a Command Line Tool (CLI) to easily upload models. 
                                     <br/>
                                     To install, run this in your terminal:
                                     {renderCommandWithCopy('moxel-install', 'pip install moxel')}

                                    After installation, try login 

                                    {renderCommandWithCopy('moxel-login', 'moxel login')}

                                    This will open your browser and guide you through the login portal.

                                    <br/>

                                    After login, you should be able to run the following to list your model repositories.

                                    {renderCommandWithCopy('moxel-ls', 'moxel ls')}

                                </div>
                            </div>

                           
                        </div>
                    )
                }

                content = setupInstructions();
                break; 
            case 1: // Wrap Your Model.
                content = (
                    <div>
                        <Tabs className='tab-demo'>
                            <Tab title="Python Flask" active>
                                <FixedWidthRow>
                                    <Markdown tagName="instruction" className="markdown-body">
                                    <br/>
                                    {`   
                                        Moxel works with git repositories. Make sure your project is tracked by git.

                                        The first step is to wrap your model in a python Flask server. Let's use \`server.py\`.

                                        Here is an example to show a "random number generator" model. The server has two endpoints: \`healthcheck\` and \`predict\`. 

                                        The healthcheck endpoint is just for detecting if the model is available. The predict endpoint takes a JSON input and produces JSON output.



                                        \`\`\`python
                                        from flask import Flask, jsonify, request
                                        import random

                                        app = Flask(__name__)

                                        @app.route('/', methods=['GET'])
                                        def healthcheck():
                                            return 'OK'

                                        @app.route('/', methods=['POST'])
                                        def predict():
                                            data = request.json
                                            seed = data['seed']
                                            random.seed(int(seed))
                                            return jsonify({
                                                'number': string(random.random())
                                            })

                                        app.run(port=5900, host='0.0.0.0')
                                        \`\`\`

                                        Save this script to some file, say \`serve-model.py\`. Then 

                                        \`\`\`
                                        git add serve-model.py
                                        \`\`\`


                                    `}
                                    </Markdown>                            
                                </FixedWidthRow>
                                <br/>
                            </Tab>
                            <Tab title="Python Tornado">

                            </Tab>
                        </Tabs>
                        
                        
                    </div>
                )
                break; 
            case 2: // Deploy Your Model.
                let yaml = ("image: moxel/python3\n" +
                            "resources:\n" +
                            "  memory: 256Mi\n" +
                            "  cpu: 1\n" +
                            "input_space:\n" +
                            "  seed: String\n" +
                            "output_space:\n" +
                            "  number: String\n" +
                            "cmd:\n" +
                            "- echo 'Hello, world'\n" +
                            "- python serve-model.py\n"
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
                                        Now, let's upload your model with Moxel CLI.
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12 offset-m1 m8">     
                                        <Markdown tagName="instruction" className="markdown-body">
                                            Moxel CLI is tightly integrated with Git. So first make sure your model code is in a git repository. Now, create a `moxel.yml` inside the repo directory:
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
                                        <input id="warp-create" value={`moxel push -f moxel.yml ${self.modelId}:${self.tag}`} readOnly style={{backgroundColor: "#1F2A41", color: "white", paddingLeft: "10px", border: "none"}}/>
                                    </div>
                                    <div className="col s12 m2">
                                        <ClipboardButton className="btn-flat" data-clipboard-target="#warp-create">
                                            <i className="material-icons">content_copy</i>
                                        </ClipboardButton>    
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12 offset-m1 m8">
                                    Read our <a href="http://docs.moxel.ai/deploy/" target="_blank">documentation</a> to learn more about deployment.
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
            case 3:
                content = (
                    <div>
                        <div className="row">
                        </div>

                        <div className="row">
                            <div className="col s12 m12" style={{textAlign: "center"}}>
                                <img style={{height: "300px", width: "auto"}} src="/images/check.png"></img>
                            </div>
                        </div>

                        <div className="row" style={{display: "block"}}>
                            <div className="col s12 m12" style={{textAlign: "center"}}>
                                <h4>Model <b>{`${userId}/${modelId}`}</b> is now live!</h4>
                            </div>
                        </div>

                    </div>
                )
                break;
        }

        return (
            <div>
                <div className="row">
                    <div className="col s12 offset-m2 m8">
                        <Stepper steps={this.steps} activeStep={ this.state.step } />
                    </div>
                </div>
                <div className="row">
                    <div className="col s12 offset-m2 m8">
                        <div className="card">
                            {content}

                            <div className="row">
                                <div className="col s2 m2 offset-s8 offset-m8">
                                    <button className="waves-effect waves-light btn grey" disabled={!this.backStepEnabled}  style={{float: "right"}}
                                        onClick={this.backStep}>
                                        Back
                                    </button> 
                                </div>
                                <div className="col s2 m2">

                                    <button className="waves-effect waves-light btn blue" disabled={!this.nextStepEnabled} 
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
