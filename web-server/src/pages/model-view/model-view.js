import React, {Component} from "react";
import PropTypes from "prop-types";
import FixedWidthRow from "../../components/fixed-width-row";
import ModelSnippet from "../../components/model-snippet/model-snippet";
import NotificationBanner from "../../components/notification-banner/notification-banner";
import {store} from "../../mock-data";
import {Flex, FlexItem} from "layout-components";
import TabButtonBar from "../../components/tab-button-bar";
import styled from "styled-components";
import { Charts, ChartContainer, ChartRow, YAxis, LineChart} from "react-timeseries-charts";
import { TimeSeries, TimeRange } from "pondjs";
import {Tabs, Tab} from 'react-materialize'
import ImageUploader from "../../widgets/image-uploader";
import ModelStore from "../../stores/ModelStore";
import DataStore from "../../stores/DataStore";
import AuthStore from "../../stores/AuthStore";
import TypeUtils from "../../libs/TypeUtils"
import LayoutUtils from "../../libs/LayoutUtils"
import RatingStore from "../../stores/RatingStore";
import Error404View from "../../pages/error-view/404";
import ErrorNoneView from "../../pages/error-view/none";
import Slider from "react-slick";
import SimpleTag from "../../components/simple-tag";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ReactDisqusThread from '../../components/disqus-thread';
import {Button, Dropdown, NavItem} from 'react-materialize'
import NotificationSystem from 'react-notification-system';
import 'markdown-it';
import Markdown from 'react-markdownit';
import Moxel from 'moxel'

// Most browsers don't support Object.values
Object.values = function(obj) {
    return Object.keys(obj).map(function(key) { return obj[key];});
}

var moxel = null;

if(window.location.host == "localhost:3000") {
    moxel = Moxel({
        endpoint: 'http://dev.moxel.ai'
    });   
}else{
    moxel = Moxel({
        endpoint: 'http://' + window.location.host
    });
}

// import '../../libs/moxel/browser/lib/moxel.js'


const StyledModelLayout = styled(Flex)`
    .blur {
        filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius='3');
        -webkit-filter: url(#blur-filter);
        filter: url(#blur-filter);
        -webkit-filter: blur(3px);
        filter: blur(3px);
    }

    .model-snippet {
        width: 100%;
    }
    
    article.markdown-body {
        margin-top: 20px;
        padding-top: 20px;
        width: 100%;
        padding-bottom: 100px;
    }

    .slick-dots li {
        width: 50px;
        height: 50px;
        margin-left: 10px;
        margin-right: 10px;
    }

    .slick-custom {
        background-color: rgba(195, 195, 195, 0.18);
        bottom: 0px !important;
        height: 35px;
    }

    .slick-prev {
        display: block;
        height: 100%;
    }

    .slick-prev:hover {
        background-color: #EFF1F4;
    }

    .slick-next:hover {
        background-color: #EFF1F4;
    }

    .slick-next {
        display: block;
        height: 100%;
    }

    .slick-prev:before, .slick-next:before {
        color: #dddde2;
    }

    padding-top: 20px;

    .card:hover {
        box-shadow: 0px 0px 15px #888;
    }

    .model-status-btn {
        height: 20px;
        width: 90px;
        font-size: 10px;
        padding-left: 0px;
        padding-right: 0px;
        vertical-align: middle;
        line-height: 2;
    }

    .model-status-btn:hover {
        box-shadow: 0px 0px 5px #333;
    }

    .model-status-btn i {
        font-size: .8rem;
        line-height: 1.8;
        height: 20px;
        margin-right: 5px;
        margin-left: 10px;
    }

    .model-action-btn {

    }

    .model-action-btn:hover {
        box-shadow: 0px 0px 15px #333;
    }

    .card-gallery {
        padding: 0;
    }

    // Gallery style.
    .slick-list {
        height: 300px;
    }

    .slick-track {
        height: 300px;
    }

    // Model Readme.

    hr {
        box-sizing: content-box;
        height: 1px;
        outline-color: rgba(162, 160, 160, 0.25);
        color: rgba(218, 218, 218, 0.52);
        background-color: rgba(218, 218, 218, 0.52);
        border: none;
        margin-left: 20px;
        margin-right: 20px;
    }

    .tabs .tab a {
        color: rgb(0, 0, 0);
    }

    .tabs .indicator {
        background-color: black;
    }

    .editable-input {
        padding-left: 5px;
        border-bottom: dashed;
        border-color: #fff;
        border-width: 1px;
    }

    .editable-input:hover {
        background-color: rgba(255, 255, 255, 0.14);
        border-bottom: solid;
        border-color: #fff;
        border-width: 1px;
    }

    .dz-preview.dz-processing.dz-error.dz-complete.dz-image-preview {
        width: 80%;
        height: 80%;
    }

    .dz-image {
        width: 100% !important;
        height: 100% !important;
    }

    .dz-image img {
        width: 100%;
        height: 100%;
    }

    textarea:focus {
        outline: none;
    }

    .notifications-wrapper {
        z-index: 99999999;
    }

    .notification.notification-success.notification-visible {
        position: absolute;
        top: 30px;   
    }
`;

class ModelView extends Component {
    constructor() {
        super()

        var username = null;
        if(AuthStore.isAuthenticated()) {
            username = AuthStore.username();
        }

        this.state = {
            model: null,
            isRunning: false,
            rating: 0,
            editMode: false,
            username: username
        }

        this.handleUpvote = this.handleUpvote.bind(this);
        this.handleUpdateTitle = this.handleUpdateTitle.bind(this);
        this.handleUpdateReadMe = this.handleUpdateReadMe.bind(this);
        this.handleUpdateDescription = this.handleUpdateDescription.bind(this);
        this.handleToggleEdit = this.handleToggleEdit.bind(this);
        this.doingHandleUpvote = false;
        this.syncModel = this.syncModel.bind(this);
        this.syncRating = this.syncRating.bind(this);        
    }

    syncModel() {
        var self = this;

        return new Promise(function(resolve, reject) {
            const {userId, modelName, tag} = self.props.match.params;

            ModelStore.fetchModel(userId, modelName, tag).then(function(model) {
                console.log('[Fetch Model]', model);
                if(model.status == 'NONE') {
                    // This model does not exist.

                }

                self.setState({
                    model: model
                })

                resolve(model);
            }).catch(function(e) {
                console.error('Cannot fetch model', e);
                var model = {
                    status: "UNKNOWN"
                }

                self.setState({
                    model: model
                })
            });
        });
    }

    syncRating() {
        var self = this;
        if(!self.state.username) {
            return;
        }

        const {userId, modelName, tag} = this.props.match.params;

        var modelId = ModelStore.modelId(userId, modelName, tag); 
        var myId = self.state.username;

        RatingStore.fetchRating(myId, modelId).then(function(rating) {
            console.log('rating', rating, myId, modelId)
            self.setState({
                rating: rating
            });
        });
    }

    componentDidMount() {
        var self = this;
        const {userId, modelName, tag} = this.props.match.params;

        this.setState({
            editMode: (userId == this.state.username)
        })
        
        this.syncModel().then((model) => {
            // Update document title.
            document.title = `${model.title} | Moxel`;
            // Meta tags are handled at server-side rendering.
        });
        this.syncRating();

        // Add event handler for image upload.
        this.handleDemoRun = null;

        // Import model from Moxel.
        var modelId = ModelStore.modelId(userId, modelName, tag);
        self.moxelModel = null;   // moxel model.
        moxel.createModel(modelId).then((model) => {
            self.moxelModel = model;
            console.log('Moxel model created', self.moxelModel);
        });

        // Handle output visualization.
        self.handleOutputs = function(outputs) {
            return new Promise((resolve, reject) => {
                var outputSpaces = self.moxelModel.outputSpace;
                for(var outputName in outputs) {
                    setTimeout(function(outputName) {
                        var outputSpace = outputSpaces[outputName];
                        var output = outputs[outputName];
                        var demoWidget = document.querySelector(`#demo-output-${outputName}`);
                        if(outputSpace == moxel.space.Image) {
                            output.toDataURL().then((url) => {
                                demoWidget.src = url;
                                demoWidget.style.marginTop = "0%";
                                demoWidget.style.marginBottom = "0%";
                                demoWidget.style.width = "100%";
                                resolve();
                            });
                        }else if(outputSpace == moxel.space.JSON) {
                            output.toObject().then((object) => {
                                demoWidget.value = JSON.stringify(object, undefined, 4);    
                                resolve();
                            })
                        }else if(outputSpace == moxel.space.String) {
                            output.toText().then((text) => {
                                demoWidget.value = text;
                                resolve();
                            });
                        }
                    }.bind(this, outputName), 0);
                }    
            });
        }

        // Handle run button.
        self.handleDemoRun = function() {
            self.setState({
                isRunning: true
            })

            // Make sure the model and all inputs are loaded.
            if(!self.moxelModel) {
                return;
            }

            var inputSpaces = self.state.model['input_space'];
            for(var inputName in inputSpaces) {
                if(!self.inputs[inputName]) {
                    console.error('Moxel model input ${inputName} not found.');
                    return;
                }
            }

            console.log('Moxel predicting...');
            self.moxelModel.predict(self.inputs).then((outputs) => {
                console.log('Moxel output', outputs);
                self.handleOutputs(outputs).then(() => {;
                    self.setState({
                        isRunning: false
                    })
                });
            });

        };

        // Handle inputs.
        self.inputs = {};
        
        // Image Upload Component.
        self.createImageUploadHandler = function(inputName) {
            return { 
                addedfile: function(file) {
                    for(var selector of ['.dz-error-mark', '.dz-error-message']) {
                        var ignoreView = document.querySelector(selector);    
                        ignoreView.outerHTML = '';
                    }
                    
                    // Read data.
                    var reader = new FileReader();
                    // reader.readAsDataURL(file);
                    reader.readAsArrayBuffer(file);
                    reader.addEventListener("load", function () {
                        var bytes = reader.result;

                        moxel.space.Image.fromBytes(bytes).then((image) => {
                          self.inputs[inputName] = image;
                          console.log('Model input updated', self.inputs);
                        })
                    }, false);
                },
                // error: function(e) {
                //     console.error("error", e);
                // }
            }
        }

        self.createTextareaEditor = function(inputName) {
            // onchange event handler.
            return function(e) {
                var text = document.querySelector('#demo-input-' + inputName).value;
                moxel.space.String.fromText(text).then((str) => {
                    self.inputs[inputName] = str;
                    console.log('Model input updated', self.inputs);
                })
            }
        }
        
    }

    

    handleUpvote() {
        var self = this;

        if(self.doingHandleUpvote) {
            window.setTimeout(self.handleUpvote, 100);
            return
        }
        self.doingHandleUpvote = true;

        const {userId, modelName, tag} = self.props.match.params;

        var modelId = ModelStore.modelId(userId, modelName, tag);  // TODO: resolve the confusion of modelId.
        var myId = self.state.username;

        var newRating = 0.;
        if(self.state.rating > 0) {
            newRating = 0.;
        }else{
            newRating = 1.;
        }

        // First, create the illusion that update is done.
        self.setState({
            rating: newRating
        })

        var model = self.state.model;

        if(newRating == 1.) {
            model['stars'] = model['stars'] + 1;
        }else{
            model['stars'] = model['stars'] - 1;
        }

        self.setState({
            model: model
        })

        // Then, do the real update.
        RatingStore.updateRating(myId, modelId, newRating)
        .then(() => {
            self.syncRating();
            return self.syncModel();
        })
        .then((model) => {
            if(newRating == 1.) {
                model['stars'] = model.stars + 1;
            }else{
                model['stars'] = model.stars - 1;
            }

            self.setState({
                model: model
            })

            ModelStore.updateModel(userId, modelName, tag, {'stars': model['stars']}).then(function() {
                self.syncModel().then(function() {
                    self.doingHandleUpvote = false;
                });
            });
        });
    }

    handleUpdateTitle() {
        const {userId, modelName, tag} = this.props.match.params;

        var modelTitle = document.querySelector('#model-title').value;

        ModelStore.updateModel(userId, modelName, tag, {'title': modelTitle}).then(function() {
            this.syncModel().then(function() {
                this.notificationSystem.addNotification({
                  message: 'Successfully updated model title.',
                  level: 'success'
                });
            }.bind(this));
        }.bind(this));
    }

    handleUpdateReadMe() {
        const {userId, modelName, tag} = this.props.match.params;

        var modelReadMe = document.querySelector('#model-readme').value;

        ModelStore.updateModel(userId, modelName, tag, {'readme': modelReadMe}).then(function() {
            this.syncModel().then(function() {
                this.notificationSystem.addNotification({
                  message: 'Successfully updated model README.',
                  level: 'success'
                });
            }.bind(this));
        }.bind(this));
    }

    handleUpdateDescription() {
        const {userId, modelName, tag} = this.props.match.params;

        var modelDescription = document.querySelector('#model-description').value;

        ModelStore.updateModel(userId, modelName, tag, {'description': modelDescription}).then(function() {
            this.syncModel().then(function() {
                this.notificationSystem.addNotification({
                    message: 'Successfully updated model description.',
                    level: 'success'
                });
            }.bind(this));
        }.bind(this));
    }

    handleToggleEdit() {
        this.setState({editMode: !this.state.editMode});
    }

    componentDidUpdate() {
        function updateAddThisUntilSuccessful() {
            if(window.addthis && window.addthis.layers && window.addthis.layers.refresh) {
                window.addthis.layers.refresh();
            }else{
                setTimeout(updateAddThisUntilSuccessful, 500);
            }
        }

        setTimeout(updateAddThisUntilSuccessful, 0);
    }

    render() {
        var self = this;

        if(!this.state.model) {
            return null
        }

        if(this.state.model.status == "UNKNOWN") {
            return <Error404View/>
        }

        if(this.state.model.status == "NONE") {
            return <ErrorNoneView/>
        }

        const {userId, modelName, tag} = this.props.match.params;
        const model = this.state.model;

        var statusButton = null;
        if(model.status == "LIVE") {
            statusButton = (
                <a className="waves-effect btn-flat green black-text model-status-btn white-text"><i className="material-icons left">check_box_outline_blank</i>{model.status}</a>
            )
        }else{
            statusButton = (
                <a className="waves-effect btn-flat white black-text model-status-btn"><i className="material-icons left">check_box_outline_blank</i>{model.status}</a>
            )
        }
        
        const seriesData = {
            name: "traffic",
            columns: ["time", "in", "out"],
            points: [
                [1400425947000, 52, 41],
                [1400425948000, 18, 45],
                [1400425949000, 26, 49],
                [1400425950000, 93, 81],
            ]
        };

        const series1 = new TimeSeries(seriesData);

        var inputType = [];

        for(var t in model.inputType) {
            inputType.push(
                (<tr>
                    <td>{t}</td>
                    <td>{model.inputType[t]}</td>
                </tr>)
            )
        }

        var outputType = [];

        for(var t in model.outputType) {
            outputType.push(
                (<tr>
                    <td>{t}</td>
                    <td>{model.outputType[t]}</td>
                </tr>)
            )
        }

        // Set up image gallery.
        var galleryThumb = [];
        var galleryImages = [];

        for(var imgSrc of model.gallery) {
            galleryImages.push(
                <div style={{backgroundImage: `url(${imgSrc})`, backgroundSize: "cover"}}></div>
            );
            galleryThumb.push(
                <a><img style={{height: "auto", width: "50px"}} src={imgSrc}/></a>
            )
        }

        var gallerySettings = {
            customPaging: function(i) {
                return galleryThumb[i];
            },
            dots: true,
            dotsClass: 'slick-dots slick-thumb slick-custom',
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1
        };


        // Demo UI.
        // Display of variable name and space.
        var displayVariable = function(name, space) {
            return (
                <div style={{color: "black"}}>
                    <p style={{display: "inline", borderRadius: "5px 0px 0px 5px", border: "1px solid #777777",
                               backgroundColor: "none", padding: "3px", marginBottom: "3px", borderWidth: "1px 0px 1px 1px",
                             }}>{name}</p>
                    <p style={{display: "inline", borderRadius: "0px 5px 5px 0px", border: "1px solid #777777",
                               backgroundColor: "#deeaf9", padding: "3px", marginBottom: "3px",
                             }}><b>{space}</b></p>
                    <p></p>
                </div>
            )
        }
        // Input widgets.
        console.log('model', model);
        var inputSpaces = model['input_space'];
        var inputWidgets = {}; 
        for(var inputName in inputSpaces) {
            var inputSpace = inputSpaces[inputName];
            var inputWidget = null;
            if(inputSpace == "Image") {
                inputWidget = (
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(inputName, inputSpace)}
                        <ImageUploader uploadEventHandlers={this.createImageUploadHandler(inputName)}></ImageUploader>
                    </div>
                );
            }else if(inputSpace == "String") {
                inputWidget = 
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(inputName, inputSpace)}
                        <textarea onChange={this.createTextareaEditor(inputName)} id={`demo-input-${inputName}`} style={{height: "150px", width: "100%", 
                                                                           padding: "10px", color: "#333", width: "100%",
                                                                           borderRadius: "5px", border: "2px dashed #C7C7C7",
                                                                    width: "300px", marginLeft: "auto", marginRight: "auto"}}/>
                    </div>
            }
            inputWidgets[inputName] = inputWidget;
        }
        this.inputWidgets = inputWidgets;
        
        // Output widgets.
        var outputSpaces = model['output_space'];
        var outputWidgets = {};
        for(var outputName in outputSpaces) {
            var outputSpace = outputSpaces[outputName];
            var outputWidget = null;
            if(outputSpace == "JSON") {
                outputWidget = 
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(outputName, outputSpace)}
                        <textarea id={`demo-output-${outputName}`} style={{height: "150px", width: "100%", 
                                                                           padding: "10px", color: "#333", width: "100%",
                                                                           borderRadius: "5px", border: "2px dashed #C7C7C7",
                                                                    width: "300px", marginLeft: "auto", marginRight: "auto"}}/>
                        <br/>
                    </div>
                    
            }else if(outputSpace == "Image") {
                outputWidget = 
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(outputName, outputSpace)}
                        <div style={{borderRadius: "5px", border: "2px dashed #C7C7C7", width: "100%",
                                            width: "300px", marginLeft: "auto", marginRight: "auto"}}>
                            <img src="/images/pic-template.png" id={`demo-output-${outputName}`} 
                                style={{width: "50%", height: "auto", marginTop: "25%", marginBottom: "25%"}}/>
                        </div>
                        <br/>
                    </div>
            }else if(outputSpace == "String") {
                outputWidget = 
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(outputName, outputSpace)}
                        <textarea id={`demo-output-${outputName}`} style={{height: "150px", width: "100%", 
                                                                           padding: "10px", color: "#333", width: "100%",
                                                                           borderRadius: "5px", border: "2px dashed #C7C7C7",
                                                                    width: "300px", marginLeft: "auto", marginRight: "auto"}}/>
                    </div>
            }
            outputWidgets[outputName] = outputWidget;
        }
        this.outputWidgets = outputWidgets;

        function DemoComponent(props) {
            return (
                <FixedWidthRow>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                        <div className="col s12 m12">
                            <div className="card">
                                <div className="card-tabs white">
                                  <Tabs className='tab-demo white'>
                                    <Tab title="Demo" active >
                                        <span className="black-text">
                                            <div className="row">
                                                <br/>
                                                <div className="col m6" style={{textAlign: "center", marginBottom: "10px"}}>
                                                    Model Input
                                                    
                                                    <br/><br/>

                                                    {Object.values(inputWidgets)}

                                                    <br/>

                                                    {
                                                        self.state.isRunning 
                                                        ?
                                                        <img src="/images/spinner.gif" style={{width: "100px", height: "auto"}}></img>
                                                        :    
                                                        <a className="waves-effect btn-flat green white-text" 
                                                            style={{padding: 0, width: "100px", textAlign: "center"}} 
                                                            onClick={()=>self.handleDemoRun()}>{/*<i className="material-icons center">play_arrow</i>*/}
                                                            Run 
                                                        </a>
                                                    }
                                                </div>
                                                <div className="col m6" style={{textAlign: "center"}} >
                                                    Model Output

                                                    <br/><br/>

                                                    {Object.values(outputWidgets)}
                                                </div>
                                            </div>
                                        </span>
                                    </Tab>
                                    {/*<Tab title="API">
                                        <Markdown className="markdown-body" style={{height: "200px", overflow: "scroll", marginBottom: "20px"}}>
                                        {`   
                                            \`\`\`python
                                            import requests
                                            import base64
                                            import os

                                            # URL = 'http://kube-dev.dummy.ai:31900/model/dummy/tf-object-detection/latest'
                                            URL = 'http://kube-dev.dummy.ai:31900/model/strin/tf-object-detection/latest'


                                            with open('test_images/image1.jpg', 'rb') as f:
                                                result = requests.post(URL, json={
                                                    'image': base64.b64encode(f.read()).decode('utf-8'),
                                                    'ext': 'jpg'
                                                })
                                                try:
                                                    result = result.json()
                                                except:
                                                    print(result.text)
                                                    exit(1)


                                                image_binary = base64.b64decode(result['vis'])
                                                with open('output.png', 'wb') as f:
                                                    f.write(image_binary)
                                                os.system('open output.png')
                                            \`\`\`


                                        `}
                                        </Markdown>   

                                    </Tab>*/}
                                </Tabs>

                                
                                <hr/>

                                  
                                </div>

                                <div className="card-content">
                                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%"}}>
                                        <div className="col s12 m12">
                                            {
                                                self.state.editMode
                                                ?
                                                <div>
                                                    <h5>Edit ReadMe</h5>
                                                    <textarea style={{height: "300px"}} id="model-readme" onBlur={self.handleUpdateReadMe} defaultValue={model.readme}>
                                                    </textarea>
                                                </div>
                                                :
                                                <Markdown tagName="article" className="markdown-body">
                                                    {model.readme}
                                                </Markdown>
                                            }
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </FixedWidthRow>
            );
        }

        function ModelTitle(props) {
            if(LayoutUtils.isMobile()) {
                var titleStyle = {
                    width: "100%", 
                    fontSize: "20px"
                }
            }else{
                var titleStyle = {
                    width: "60%", 
                    fontSize: "20px",   
                    display: "inline-block"
                }
            }
            if(self.state.editMode) {
                return (
                    <span>
                        <input id="model-title" defaultValue={model.title} className="editable-input" 
                            style={titleStyle} onBlur={self.handleUpdateTitle}/>
                    </span>
                );
            }else{
                return <div style={titleStyle}>{model.title}</div>;
            }
        }

        function ModelShare(props) {
            if(LayoutUtils.isMobile()) {
                var shareStyle = {
                    float: "left", 
                    fontSize: "15px",
                    marginTop: "10px",
                    marginBottom: "10px"
                }
            }else{
                var shareStyle = {
                    float: "right", 
                    fontSize: "18px"
                }
            }
            return (
                <span style={shareStyle}>
                    <a className={"waves-effect btn-flat black-text model-action-btn " + (self.state.rating > 0 ? "orange lighten-1" : "white")} 
                        onClick={self.handleUpvote}><i className="material-icons left">
                        arrow_drop_up
                        </i>{model.stars}
                    </a>
                    
                    &nbsp;

                    <Dropdown trigger={
                        <a className="dropdown-button btn-flat white black-text model-action-btn">
                            <i className="material-icons left">share</i>Share
                        </a>
                    }>

                        <NavItem><div className="addthis_inline_share_toolbox_5dtc"></div></NavItem>
                    </Dropdown>
                </span>
            )
        }

        return (
            <StyledModelLayout column className="catalogue-layout-container">
                {/*<FixedWidthRow component="h1" className="catalogue-hero"*/}
                {/*>Search For Your Favorite Model</FixedWidthRow>*/}
                {/*<FixedWidthRow component={SearchBar}*/}
                {/*className="catalogue-search-bar"*/}
                {/*placeholder="Search 15,291 models"/>*/}
                

                <Flex component={FlexItem}
                      fluid
                      width="%"
                      className="model-view">
                    <FixedWidthRow style={{justifyContent: "left"}}>
                        <span>
                            <i className="material-icons" style={{fontSize: "15px"}}>book</i> &nbsp; 
                            <b>{model.user}</b> &nbsp; / &nbsp;  <b>{model.id}</b>
                        </span>
                        {
                            userId == this.state.username
                            ?
                            <span style={{marginLeft: "auto", marginRight: "0px"}}>
                                <div className="switch">
                                    Edit Page:  &nbsp;
                                    <label>
                                      Off
                                      <input type="checkbox" defaultChecked={this.state.editMode} onChange={this.handleToggleEdit}/>
                                      <span className="lever"></span>
                                      On
                                    </label>
                                </div>
                            </span>
                            :
                            null
                        }
                    </FixedWidthRow>
                    <FixedWidthRow>
                        <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                            <div className="col s12 m12">
                              <div className="card blue darken-3">
                                <div className="card-content white-text">

                                    <div className="card-title">
                                        <ModelTitle/>

                                        <ModelShare/>

                                    </div>

                                    
                                    <div style={{height: "80px"}}>
                                        <span style={{float: "left"}}>
                                            {statusButton}
                                            &nbsp;
                                            <Dropdown trigger={
                                                <a className='dropdown-button btn-flat white black-text model-status-btn'>
                                                    <i className="material-icons left">loyalty</i>
                                                    {model.tag}
                                                </a>
                                            }>
                                                {/*<NavItem><a href="#!">one</a></NavItem>
                                                <NavItem><a href="#!">two</a></NavItem>*/}
                                            </Dropdown>
                                        </span>
                                    </div>

                                    <div style={{marginTop: "20px"}}>
                                        {
                                            this.state.editMode
                                            ?
                                            (
                                                <textarea id="model-description" defaultValue={model.description} className="editable-input" style={{resize: "none"}} onBlur={this.handleUpdateDescription}/>
                                            )
                                            :
                                            (
                                                <p>{model.description}</p>
                                            )
                                        }
                                    </div>

                                      <br/>

                                        <div>
                                            <p>{
                                                model.labels.map((label, i) => <SimpleTag key={i} href={`/list?tag=${label}`}>{label}</SimpleTag>)
                                            }</p>
                                        </div>
                                    </div>
                                    
                                    <div className="card-action blue darken-4">
                                      {
                                        model.links.github ? <a target="_blank" href={`${model.links.github}`}>Github</a> : <span></span>
                                      }
                                      {
                                        model.links.arxiv ? <a target="_blank" href={`${model.links.arxiv}` }>Arxiv</a> : <span></span>
                                      }
                                    </div>
                              </div>
                            </div>
                        </div>
                    </FixedWidthRow>


                    {model.gallery.length > 0 ? 
                     <FixedWidthRow>
                        <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                            <div className="col s12 m12">
                                <div className="card white">
                                    <div className="card-content card-gallery white-text">
                                        <div>
                                            <Slider {...gallerySettings}>
                                                {galleryImages}
                                            </Slider>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FixedWidthRow>
                     : null 
                    }

                    {/*<FixedWidthRow>
                        <ChartContainer timeRange={series1.timerange()} width={800}>
                            <ChartRow height="30">
                                <Charts>
                                    <LineChart axis="axis1" series={series1}/>
                                </Charts>
                            </ChartRow>
                        </ChartContainer>
                    </FixedWidthRow>*/}

                    {
                        model.status == 'LIVE' 
                        ?
                        <DemoComponent/>
                        :
                        (<FixedWidthRow>
                            <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                                <div className="col s12 m12">
                                    <div className="card">
                                        <div className="card-content" style={{textAlign: "center"}}>
                                            Currently, only metadata is available for this model. Next, deploy the model as API. 
                                            <div className="row"></div>
                                            <a className="waves-effect btn-flat green white-text" href={`/upload/${userId}/${modelName}/${tag}`} style={{padding: 0, width: "80%", textAlign: "center"}}>{/*<i className="material-icons center">play_arrow</i>*/}Deploy Model</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FixedWidthRow>
                        )
                    }
                

                    <FixedWidthRow>
                        <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                            <div className="col s12 m12">
                                <div className="card">
                                    <div className="card-content">
                                        {/* force to sign in to discuss.
                                        <div>
                                        <a onClick={()=>{AuthStore.signup(window.location.pathname);}}>Sign up</a> or <a onClick={()=>{AuthStore.login(window.location.pathname);}}>Log in</a> to join the discussion.
                                        </div>
                                        <div className="blur">
                                            
                                        </div>*/}
                                        <ReactDisqusThread
                                            id={`$[userId}/${modelName}:${tag}`}
                                            title="Example Thread"
                                            url={`http://dummy.ai${window.location.pathname}`}>
                                        </ReactDisqusThread>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FixedWidthRow>
                    {/*<FixedWidthRow style={{marginTop: '30px'}}><ModelSnippet {...model}/></FixedWidthRow>
                    <TabButtonBar repoUrl={model.links['github']}/>
                    <NotificationBanner>A new version of the model is being launched, click here to see the launch
                        logs...</NotificationBanner>
                    <FixedWidthRow>
                        <Markdown tagName="article" source={model.readme} className="markdown-body"/>
                    </FixedWidthRow>*/}
                </Flex>

                <NotificationSystem ref={(notificationSystem) => {this.notificationSystem = notificationSystem;}} />
            </StyledModelLayout>
        )
    }
}

ModelView.propTypes = {
    match: PropTypes.obj
};

export default ModelView;
