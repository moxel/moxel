import React, {Component} from "react";
import PropTypes from "prop-types";
import FixedWidthRow from "../../components/fixed-width-row";
import ModelSnippet from "../../components/model-snippet/model-snippet";
import NotificationBanner from "../../components/notification-banner/notification-banner";
import {store} from "../../mock-data";
import {Flex, FlexItem} from "layout-components";
import TabButtonBar from "../../components/tab-button-bar";
import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
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
        let self = this;
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
                    self.setState({
                        step: self.steps.length - 1
                    })
                }else{
                    setTimeout(modelProbe, 1000);
                }
            })
        };

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
        var modelName = params.modelId
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

        function renderCode(code, language) {
            if(!language) language = 'python';

            var pre = document.createElement('pre');
            pre.className=`${language}`;
            pre.innerHTML = `
            <code class='language-${language}'>
            ${code}
            </code>
            `;
            hljs.highlightBlock(pre);

            return (
                <div dangerouslySetInnerHTML={{__html: pre.outerHTML}}></div>
            );
        }

        switch(this.state.step) {
            case 0: 
                
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
                    <div className="black-text">
                        <Tabs className='tab-demo'>
                            <Tab title="Python" active>
                                <FixedWidthRow>
                                   <Markdown tagName="instruction" className="markdown-body" style={{width: "100%", marginTop: "15px"}}>
                                    Deploying a model to Moxel is as easy as writing a prediction function. 

                                    First, create a file called `serve.py`, and write down your `predict` function. As an example, we'll show how to wrap a Perceptron model.

                                    
                                    {renderCode(`
# serve.py
import random
import json

model = json.load(open('model.json', 'r'))

def predict(x1, x2):
    if model['w1'] * x1 + model['w2'] * x2 > 0:
        return {'out': 1.}
    else:
        return {'out': 0.}
                                    `, 
                                    'python'
                                    )}

                                    This function takes inputs `x1`, `x2`, and produces the classification output `y`. The model weights are loaded from a JSON file, `model.json`,

                                    {renderCode(`
{
    "w1": 2.78,
    "w2": -3.14
}
                                    `,
                                    'json')
                                    }


                                    Now, make sure your model code sits in a git repository. If not, you can create one by `git init`. Check in your code to git. Moxel will push any files tracked by git.

                                    {renderCommandWithCopy('moxel-git-add', 'git add serve.py')}

                                    Typically, machine learning model has large weight files. You do not need to check in those files, as they would be uploaded by Moxel to cloud storage.

                                    <br/>

                                    Next, Moxel would wrap this function as a web service. 

                                    
                                    </Markdown>  
                                </FixedWidthRow>
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
                    <FixedWidthRow>
                        <Markdown tagName="instruction" className="markdown-body" style={{width: "100%", marginTop: "15px"}}>
                            Now, let's deploy your model with Moxel CLI. You'll need to create a YAML file, say `moxel.yml`:

                                    {renderCode(`
name: ${modelName}
tag: ${tag}
image: moxel/python3    # Docker environment to run the model with.
assets:                 # A list of Model files, such as weights.
- model.json
input_space:            # Input type annotations.
  x1: float
  x2: float
output_space:           # Output type annotations.
  out: float
main:                   # Main entrypoint to serve the model.
  type: python  
  entrypoint: serve.py::predict
                                    `, 
                                    'yaml'
                                    )}


                            To deploy the model, just run


                            {renderCommandWithCopy('moxel-deploy', `moxel push -f moxel.yml`)}

                            Once you've deployed the model, this page will be updated automatically.

                            <br/>

                            ## Serving Model Locally
                            
                            <br/>

                            To test if the model works locally, try 

                            {renderCommandWithCopy('moxel-serve', 'moxel serve -f moxel.yml')}

                            This will start serving the model on your local machine. It listens for HTTP requests at port 5900. The easiest way to test it out is Moxel client:

                            {renderCode(`
import moxel

model = moxel.Model('${userId}/${modelName}:${tag}', where='localhost')

output = model.predict(x1=-1., x2=1.5)
print(output['out'])`)}
                                    
                        </Markdown>  
                    </FixedWidthRow>

                        
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
                                <h4>Model <b>{`${userId}/${modelName}`}</b> is now live!</h4>
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
