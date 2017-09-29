import React, {Component} from "react";
import PropTypes from "prop-types";
import FixedWidthRow from "../../components/fixed-width-row";
import ModelSnippet from "../../components/model-snippet/model-snippet";
import {store} from "../../mock-data";
import {Flex, FlexItem} from "layout-components";
import TabButtonBar from "../../components/tab-button-bar";
import styled from "styled-components";
import { Charts, ChartContainer, ChartRow, YAxis, LineChart} from "react-timeseries-charts";
import { TimeSeries, TimeRange } from "pondjs";
// import {Tabs, Tab} from 'react-materialize'
import {Tabs, Tab} from 'material-ui/Tabs';
import ImageUploader from "../../widgets/image-uploader";
import FileUploader from "../../widgets/file-uploader";
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
import NotificationBanner from '../../components/notification-banner/notification-banner';
import 'markdown-it';
import Markdown from 'react-markdownit';
import ChipInput from 'material-ui-chip-input'
import Moxel from 'moxel'
import Mousetrap from 'mousetrap'
import CalendarHeatmap from 'react-calendar-heatmap';

// Most browsers don't support Object.values
Object.values = function(obj) {
    return Object.keys(obj).map(function(key) { return obj[key];});
}

var moxel = Moxel({
    endpoint: 'http://' + window.location.host
});

// import '../../libs/moxel/browser/lib/moxel.js'


const StyledModelLayout = styled(Flex)`
    .vertical-align-middle { 
        display: inline-block;
        vertical-align: middle; 
    }

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

    .editable-input {
        border-color: #fff;
        border-width: 1px;
        border-top-style: none;
        border-right-style: none;
        border-bottom-style: dashed;
        border-left-style: none;
        overflow: hidden;
    }

    .editable-input:hover {
        background-color: rgba(255, 255, 255, 0.14);
        border-bottom: solid;
        border-color: #fff;
        border-width: 1px;
    }

    .editable-input-dark {
        border-color: #333;
        border-width: 1px;
        border-top-style: none;
        border-right-style: none;
        border-bottom-style: dashed;
        border-left-style: none;
        overflow-x: hidden;
        overflow-y: auto;
        resize: "none";
    }

    .editable-input-dark:hover {
        background-color: rgba(50, 50, 50, 0.14);
        border-bottom: solid;
        border-color: #333;
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

    .tab-demo-model {
        margin-bottom: 5px;
    }
    

    .react-calendar-heatmap .color-empty { fill: #eeeeee; }
    .react-calendar-heatmap .color-scale-1 { fill: #d6e685; }
    .react-calendar-heatmap .color-scale-2 { fill: #8cc665; }
    .react-calendar-heatmap .color-scale-3 { fill: #44a340; }
    .react-calendar-heatmap .color-scale-4 { fill: #1e6823; }
    .react-calendar-heatmap {
        font-size: 10px;
    }

    .react-calendar-heatmap rect:after {            
        position : absolute;
         content : attr(title);
         opacity : 0;
         z-index: 9999999;
    }

    .react-calendar-heatmap rect:hover {            
        stroke: black;
    }

    .react-calendar-heatmap rect:hover:after {        
        opacity : 1;
        z-index: 9999999;
        border-width:1px;
    }
`;

// Some utils.
function growHeight(element) {
    element.style.height = element.scrollHeight + 'px';
}

function autoGrowHeight(event) {
    var element = event.target;
    growHeight(element);   
}

class ModelView extends Component {
    constructor() {
        super()

        var username = null;
        if(AuthStore.isAuthenticated()) {
            username = AuthStore.username();
        }

        this.isAuthor = false;

        this.state = {
            model: null,
            rating: 0,
            pageView: {},
            editMode: false,
            username: username,
            isRunning: false,
            examples: [],
            examplePtr: 0
        }

        this.addNotification = this.addNotification.bind(this);
        this.handlePublish = this.handlePublish.bind(this);
        this.handleMakePrivate = this.handleMakePrivate.bind(this);
        this.handleUpvote = this.handleUpvote.bind(this);
        this.handleLabelsChange = this.handleLabelsChange.bind(this);
        this.handleDeleteRepository = this.handleDeleteRepository.bind(this);
        this.handleUpdateTitle = this.handleUpdateTitle.bind(this);
        this.handleUpdateReadMe = this.handleUpdateReadMe.bind(this);
        this.handleUpdateDescription = this.handleUpdateDescription.bind(this);
        this.handleToggleEdit = this.handleToggleEdit.bind(this);
        this.handlePopulateExample = this.handlePopulateExample.bind(this);
        this.doingHandleUpvote = false;
        this.syncModel = this.syncModel.bind(this);
        this.syncRating = this.syncRating.bind(this);        
    }

    syncModel() {
        var self = this;

        return new Promise(function(resolve, reject) {
            const {userId, modelName, tag} = self.props.match.params;

            moxel.createModel(`${userId}/${modelName}:${tag}`).then(function(model) {
                console.log('Moxel model', model);
                self.setState({
                    model: model
                });
                resolve(model);
            }).catch(function(e) {
                console.error('Cannot fetch model', e);
                var model = {
                    status: "UNKNOWN"
                };

                self.setState({
                    model: model
                });
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

    syncExamples() {
        var self = this;

        if(!self.moxelModel) return;

        return new Promise((resolve, reject) => {
            self.moxelModel.listDemoExamples()
            .then((examples) => {
                if(!examples) examples = [];

                self.setState({
                    examples: examples
                }, () => {
                    resolve(examples);    
                });
            })
            .catch((err) => {
                reject(err);
            });    
        })
    }

    syncModelPageView() {
        var self = this;
        const {userId, modelName, tag} = self.props.match.params;

        ModelStore.getModelPageView(userId, modelName, tag)
        .then((result) => {
            console.log('page view data', result);
            var data = [];
            for(var k in result) {
                data.push({'date': k, 'count': result[k]})
            }
            self.setState({
                pageView: data
            })
        });
    }

    componentDidMount() {
        console.log('mouting component');
        var self = this;
        const {userId, modelName, tag} = this.props.match.params;

        this.isAuthor = (userId == this.state.username);
        this.setState({
            editMode: false
        })

        if(this.isAuthor) {
            function addNotification() {
                if(!self.notificationSystem) {
                    window.setTimeout(addNotification, 500);
                    return;
                }
                self.notificationSystem.addNotification({
                  message: 'As the author, you can edit this page.',
                  level: 'success'
                });
            }
            window.setTimeout(addNotification, 500);
        }
        
        this.syncModel()
        .then((model) => {
            // Update document title.
            // Meta tags are handled at server-side rendering.
            document.title = `${model.metadata.title} | Moxel`;
        })
        .catch((err) => {
            console.error(err);
        });
        this.syncRating();

        // Sync page view.
        ModelStore.incrModelPageView(userId, modelName, tag)
        .then(()=>{
            self.syncModelPageView();
        })


        // Add event handler for image upload.
        this.handleDemoRun = null;

        // Import model from Moxel.
        var modelId = ModelStore.modelId(userId, modelName, tag);
        self.moxelModel = null;   // moxel model.
        moxel.createModel(modelId)
        .then((model) => {
            self.moxelModel = model;
            console.log('Moxel model created', self.moxelModel);
            return self.syncExamples();
        })
        .then((examples) => {
            console.log('examples', examples);
            if(examples.length > 0) {
                var example = examples[self.state.examplePtr];
                self.handlePopulateExample(example);    
            }
        })
        .catch((err) => {
            console.error(err);
        });

        // Handle input visualization.
        self.handleInputs = function(inputs) {
            self.inputs = inputs;
            console.log('Handling inputs', inputs);
            return new Promise((resolve, reject) => {
                var inputSpaces = self.state.model.inputSpace;

                for(var inputName in inputs) {
                    setTimeout(function(inputName) {
                        var inputSpace = inputSpaces[inputName];
                        var input = inputs[inputName];
                        var demoWidget = document.querySelector(`#demo-input-${inputName}`);
                        if(inputSpace == moxel.space.image) {
                            // TODO: Not implemented.
                            var addThumbnail = self.addThumbnails[inputName];
                            if(addThumbnail) {
                                input.toDataURL('image/png').then((src) => {
                                    addThumbnail(src);
                                });
                            }
                        }else if(inputSpace == moxel.space.json) {
                            // TODO: Not implemented.
                        }else if(inputSpace == moxel.space.str || inputSpace == moxel.space.float || inputSpace == moxel.space.int || inputSpace == moxel.space.bool) {
                            input.toText().then((text) => {
                                demoWidget.value = text;
                                growHeight(demoWidget);
                                resolve();
                            });
                        }
                    }.bind(this, inputName), 0);
                }
            });
        }

        // Handle output visualization.
        self.handleOutputs = function(outputs) {
            console.log('Handling outputs', outputs);
            self.outputs = outputs;
            return new Promise((resolve, reject) => {
                var outputSpaces = self.state.model.outputSpace;

                for(var outputName in outputs) {
                    setTimeout(function(outputName) {
                        var outputSpace = outputSpaces[outputName];
                        var output = outputs[outputName];
                        var demoWidget = document.querySelector(`#demo-output-${outputName}`);
                        if(outputSpace == moxel.space.image) {
                            output.toDataURL().then((url) => {
                                demoWidget.src = url;
                                resolve();
                            });
                        }else if(outputSpace == moxel.space.json) {
                            output.toObject().then((object) => {
                                demoWidget.value = JSON.stringify(object, undefined, 4);    
                                resolve();
                            })
                        }else if(outputSpace == moxel.space.str || outputSpace == moxel.space.float || outputSpace == moxel.space.int || outputSpace == moxel.space.bool) {
                            output.toText().then((text) => {
                                demoWidget.value = text;
                                resolve();
                            });
                        }else if(outputSpace == moxel.space.array) {
                            output.toJSON().then((json) => {
                                demoWidget.value = json;
                                resolve();
                            })
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
            if(!self.state.model) {
                return;
            }

            for(var inputName in self.state.model.inputSpace) {
                if(!self.inputs[inputName]) {
                    console.error('Moxel model input ${inputName} not found.');
                    return;
                }
            }

            console.log('Moxel predicting...');
            self.state.model.predict(self.inputs)
            .then((outputs) => {
                console.log('Moxel output', outputs);
                self.handleOutputs(outputs).then(() => {;
                    self.setState({
                        isRunning: false
                    })
                });
            })
            .catch((message) => {
                self.addNotification('Error: ' + message, 'error');
                self.setState({
                    isRunning: false
                })
            });
        };

        Mousetrap.prototype.stopCallback = function () {
             return false;
        }
        Mousetrap.bind(['shift+enter', 'ctrl+enter'], self.handleDemoRun);

        // Handle save demo.
        self.handleSaveDemo = function() {
            // Make sure the model and all inputs are loaded.
            if(!self.state.model) {
                return;
            }

            self.state.model.saveDemoExample(self.inputs, self.outputs)
            .then(() => {
                return self.syncExamples();
            })
            .then((examples) => {
                self.addNotification('Successfully added an example!', 'success');
            })
            .catch((err) => {
                console.error(err);
            })
        }

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

                        moxel.space.image.fromBytes(bytes).then((image) => {
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

        // TODO: best practice is to decouple parent and child logic.
        self.createAddThumbnailHandler = function(inputName) {
            if(!self.addThumbnails) {
                self.addThumbnails = {};
            }

            return function(addThumbnail) {
                self.addThumbnails[inputName] = addThumbnail;
            }
        }

        self.createTextareaEditor = function(inputName) {
            // onchange event handler.
            return function(e) {
                var text = document.querySelector('#demo-input-' + inputName).value;
                moxel.space.str.fromText(text).then((str) => {
                    self.inputs[inputName] = str;
                    console.log('Model input updated', self.inputs);
                })
            }
        }
        
        // Loading social sharing service.
        function updateAddThisUntilSuccessful() {
            console.log('Add this element', document.querySelector('.at-share-btn-elements'));
            if(window.addthis && window.addthis.layers && window.addthis.layers.refresh) {
                window.addthis.layers.refresh();
                // TODO: hack. Monitor until the share btns are created.
                if(document.querySelector('.at-share-btn-elements > .at-share-btn')) {
                    return;
                }
            }
            console.log('Updating add this until success.')
            setTimeout(updateAddThisUntilSuccessful, 500);
        }

        setTimeout(updateAddThisUntilSuccessful, 500);


        
    }

    addNotification(message, level) {
        this.notificationSystem.addNotification({
          message: message,
          level: level
        });
    }

    handlePublish() {
        var self = this;
        const {userId, modelName, tag} = self.props.match.params;

        if(self.state.model.status != 'LIVE') {
            self.addNotification('Please upload a model first :)', 'error');
            return;
        }

        ModelStore.updateModel(userId, modelName, tag, {'access': 'public'}).then(function() {
            self.syncModel().then(function() {
                self.addNotification('The model has been successfully published!', 'success');
            });
        });
        
    }

    handleMakePrivate() {
        var self = this;
        const {userId, modelName, tag} = self.props.match.params;

        ModelStore.updateModel(userId, modelName, tag, {'access': 'private'}).then(function() {
            self.syncModel().then(function() {
                self.addNotification('The model has been made private.', 'success');
            });
        });
    }



    handleLabelsChange(chips) {
        var self = this;

        const {userId, modelName, tag} = self.props.match.params;

        ModelStore.updateModel(userId, modelName, tag, {'labels': chips}).then(function() {
            self.syncModel().then(function() {
                self.addNotification('Successfully updated labels.', 'success');
            });
        });
    }

    handleDeleteRepository() {
        var self = this;
        const {userId, modelName, tag} = self.props.match.params;

        ModelStore.deleteModels(userId, modelName).then(() => {
            window.location.href = '/models';
        })
    }    

    handleUpvote() {
        var self = this;

        if(!AuthStore.isAuthenticated()) {
            AuthStore.login(window.location.pathname);
            return;
        }

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
            model.metadata.stars = model.metadata.stars + 1;
        }else{
            model.metadata.stars = model.metadata.stars - 1;
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
                model.metadata.stars = model.metadata.stars + 1;
            }else{
                model.metadata.stars = model.metadata.stars - 1;
            }

            self.setState({
                model: model
            })

            ModelStore.updateModel(userId, modelName, tag, {'stars': model.metadata.stars}).then(function() {
                self.syncModel().then(function() {
                    self.doingHandleUpvote = false;
                });
            });
        });
    }



    handleUpdateTitle() {
        var self = this;

        const {userId, modelName, tag} = this.props.match.params;

        var modelTitle = document.querySelector('#model-title').value;

        ModelStore.updateModel(userId, modelName, tag, {'title': modelTitle}).then(function() {
            self.syncModel().then(function() {
                self.addNotification('Successfully updated model title.', 'success')
            });
        });
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

    handlePopulateExample(example) {
        var self = this;
        if(!self.state.model) return;

        // TODO: factor this out.
        // if(self.addThumbnails) {
        //     for(var k in self.addThumbnails) {
        //         self.addThumbnails[k]('/images/spinner.gif')
        //     }
        // }
        self.state.model.loadDemoExample(example.exampleId)
        .then((result) => {
            self.handleInputs(result.input);
        })
    }

    componentWillUnmount() {
        Mousetrap.bind(['shift+enter', 'ctrl+enter'], this.handleDemoRun);
    }

    componentDidUpdate() {
        
    }

    render() {
        var self = this;

        const model = this.state.model;

        if(!model) {
            return null
        }

        if(model.status == "UNKNOWN"
            || 
           (model.metadata.access != "public" && !this.isAuthor)) {
            return <Error404View/>
        }

        if(model.status == "NONE") {
            return <ErrorNoneView/>
        }

        const {userId, modelName, tag} = this.props.match.params;

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

        var inputSpace = [];

        for(var t in model.inputSpace) {
            inputSpace.push(
                (<tr>
                    <td>{t}</td>
                    <td>{model.inputSpace[t]}</td>
                </tr>)
            )
        }

        var outputSpace = [];

        for(var t in model.outputSpace) {
            outputSpace.push(
                (<tr>
                    <td>{t}</td>
                    <td>{model.outputSpace[t]}</td>
                </tr>)
            )
        }

        // Set up image gallery.
        var galleryThumb = [];
        var galleryImages = [];

        for(var imgSrc of model.metadata.gallery) {
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
                <div style={{color: "black", paddingBottom: "10px"}}>
                    <p style={{display: "inline", borderRadius: "5px 0px 0px 5px", border: "1px solid #777777",
                               backgroundColor: "none", padding: "3px", marginBottom: "3px", borderWidth: "1px 0px 1px 1px",
                             }}>{name}</p>
                    <p style={{display: "inline", borderRadius: "0px 5px 5px 0px", border: "1px solid #777777",
                               backgroundColor: "rgb(207, 228, 253)", padding: "3px", marginBottom: "3px",
                             }}><b>{space.type}</b></p>
                    <p></p>
                </div>
            )
        }

        // Input widgets.
        var inputWidgets = {}; 
        for(var inputName in model.inputSpace) {
            var inputSpace = model.inputSpace[inputName];
            var inputWidget = null;
            if(inputSpace == moxel.space.bytes) {
                inputWidget = (
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(inputName, inputSpace)}
                        <FileUploader uploadEventHandlers={this.createImageUploadHandler(inputName)}></FileUploader>
                    </div>
                );
            }
            else if(inputSpace == moxel.space.image) {
                inputWidget = (
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(inputName, inputSpace)}
                        <ImageUploader uploadEventHandlers={this.createImageUploadHandler(inputName)} addThumbnailHandler={this.createAddThumbnailHandler(inputName)}></ImageUploader>
                    </div>
                );
            }else if(inputSpace == moxel.space.str || inputSpace == moxel.space.array || inputSpace == moxel.space.float || inputSpace == moxel.space.int || inputSpace == moxel.space.bool) {
                inputWidget = 
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(inputName, inputSpace)}
                        <textarea onChange={this.createTextareaEditor(inputName)} id={`demo-input-${inputName}`} 
                            style={{minHeight: "50px", maxHeight: "150px", width: "100%", 
                                    padding: "10px", color: "#333", width: "100%",
                                    borderRadius: "5px", border: "2px dashed #C7C7C7",
                                    width: "300px", marginLeft: "auto", marginRight: "auto",
                                    resize: "none"}}
                            onKeyUp={autoGrowHeight}/>
                    </div>
            }
            inputWidgets[inputName] = inputWidget;
        }
        this.inputWidgets = inputWidgets;
        
        // Output widgets.
        var outputWidgets = {};
        for(var outputName in model.outputSpace) {
            var outputSpace = model.outputSpace[outputName];
            var outputWidget = null;
            if(outputSpace == moxel.space.json) {
                outputWidget = 
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(outputName, outputSpace)}
                        <textarea id={`demo-output-${outputName}`} style={{height: "150px", width: "100%", 
                                                                           padding: "10px", color: "#333", width: "100%",
                                                                           borderRadius: "5px", border: "2px dashed #C7C7C7",
                                                                    width: "300px", marginLeft: "auto", marginRight: "auto", resize: "none"}}/>
                        <br/>
                    </div>
                    
            }else if(outputSpace == moxel.space.image) {
                outputWidget = 
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(outputName, outputSpace)}
                        <div style={{borderRadius: "5px", border: "2px dashed #C7C7C7", width: "100%",
                                            width: "300px", height: "300px", marginLeft: "auto", 
                                            marginRight: "auto", padding: "5px"}}>
                            <div style={{display: "flex",  justifyContent: "center", alignItems: "center", overflow: "hidden",
                                             borderRadius: "20px", width: "100%", height: "100%"}}>
                                <img src="/images/pic-template.png" id={`demo-output-${outputName}`} 
                                    style={{flexShrink: 0, minWidth: "100%",  minHeight: "100%", 
                                            maxWidth: "130%",  maxHeight: "130%"}}/>
                            </div>
                        </div>
                        <br/>
                    </div>
            }else if(outputSpace == moxel.space.str || outputSpace == moxel.space.array || outputSpace == moxel.space.float || outputSpace == moxel.space.int || outputSpace == moxel.space.bool) {
                outputWidget = 
                    <div style={{paddingBottom: "30px"}}>
                        {displayVariable(outputName, outputSpace)}
                        <textarea id={`demo-output-${outputName}`} 
                            style={{minHeight: "50px", maxHeight: "150px", width: "100%", 
                                   padding: "10px", color: "#333", width: "100%",
                                   borderRadius: "5px", border: "2px dashed #C7C7C7",
                                    width: "300px", marginLeft: "auto", marginRight: "auto",
                                    resize: "none"}}
                                    onKeyUp={autoGrowHeight}/>
                    </div>
            }
            outputWidgets[outputName] = outputWidget;
        }
        this.outputWidgets = outputWidgets;

        

        function renderModelTitle() {
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
                        <input id="model-title" defaultValue={model.metadata.title} className="editable-input" 
                            style={titleStyle} onBlur={self.handleUpdateTitle}/>
                    </span>
                );
            }else{
                return <div style={titleStyle}>{model.metadata.title}</div>;
            }
        }

        function renderModelShare() {
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
                        onClick={self.handleUpvote}>
                        <i className="material-icons left">
                        arrow_drop_up
                        </i>{model.metadata.stars}
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

        function renderModelStatus() {
            if(LayoutUtils.isMobile()) {
                var style = {
                    height: "80px"
                };    
            }else{
                var style = {
                    height: "50px"
                };    
            }
            

            return (
                <div style={style}>
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
            );
        }

        function renderModelDescriptionEditor() {
            return (
                <textarea id="model-description" defaultValue={model.metadata.description} 
                        placeholder="Tell the world about your model" 
                        className="editable-input" style={{resize: "none"}} onBlur={self.handleUpdateDescription}/>
            );
        }

        function renderModelDescriptionDisplay() {
            return <p>{model.metadata.description}</p>
        }

        function renderModelDescription() {
            var descriptionStyle = (
                LayoutUtils.isMobile() ? { marginTop: "20px" } :  {}
            );
            if(self.state.editMode) {
                return <div style={descriptionStyle}> {renderModelDescriptionEditor()} </div>
            }else{
                return <div style={descriptionStyle}> {renderModelDescriptionDisplay()} </div>
            }
        }

        function renderSaveDemoButton() {
            if(self.state.editMode) {
                return (
                    <a className="waves-effect black-text blue btn-flat" 
                        style={{padding: 0, width: "100px", textAlign: "center"}} 
                        onClick={()=>self.handleSaveDemo()}>
                        Save
                    </a>
                );
            }
        }

        function renderBrowserExample() {
            function handlePreviousExample() {
                var examplePtr = self.state.examplePtr;
                if(examplePtr > 0) examplePtr -= 1;
                self.setState({
                    examplePtr: examplePtr
                });
                
                var example = self.state.examples[examplePtr];
                self.handlePopulateExample(example);
            }

            function handleNextExample() {
                var examplePtr = self.state.examplePtr;
                if(examplePtr < self.state.examples.length - 1) examplePtr += 1;
                self.setState({
                    examplePtr: examplePtr
                });   

                var example = self.state.examples[examplePtr];
                self.handlePopulateExample(example);
            }

            if(self.state.examples.length == 0) {
                return <div></div>
            }else{
                return (
                    <div>
                         <a className="waves-effect black-text btn-flat" 
                            style={{padding: 0, width: "100px", textAlign: "center"}} 
                            onClick={()=> handlePreviousExample()}>{/*<i className="material-icons center">play_arrow</i>*/}
                            <i className="material-icons" style={{fontSize: "15px"}}>arrow_back</i>
                        </a>
                        &nbsp;
                        <span>Example {self.state.examplePtr + 1} / {self.state.examples.length}</span>
                        &nbsp;
                        <a className="waves-effect black-text btn-flat" 
                            style={{padding: 0, width: "100px", textAlign: "center"}} 
                            onClick={()=> handleNextExample()}>{/*<i className="material-icons center">play_arrow</i>*/}
                            <i className="material-icons" style={{fontSize: "15px"}}>arrow_forward</i>
                        </a>
                    </div>
                )
            }
        }


        function renderModelLabels() {
            if(self.state.editMode) {
                const sourceTags=[
                ];

                return (
                    <ChipInput
                      defaultValue={model.metadata.labels}
                      fullWidth="true"
                      dataSource={sourceTags}
                      hintText="(Add labels to model here)"
                      hintStyle={{color: "white"}}
                      style={{fontSize: "14px"}}
                      underlineStyle={{borderBottom: "1px dashed rgb(255, 255, 255)", background: "none"}}
                      onChange={(chips) => self.handleLabelsChange(chips)}
                    />
                );
            }else{
                return (
                    <div>
                        <p>{
                            model.metadata.labels.map((label, i) => <SimpleTag key={i} href={`/list?tag=${label}`}>{label}</SimpleTag>)
                        }</p>
                    </div>
                );
            }
        }

        function renderUploadButton() {
            return (
                <div style={{textAlign: "center", width: "100%"}}>
                    <a className="waves-effect btn-flat green white-text" 
                        href={`/upload/${userId}/${modelName}/${tag}`} 
                        style={{padding: 0, width: "80%", textAlign: "center"}}>
                        {/*<i className="material-icons center">play_arrow</i>*/}
                        Upload Model
                    </a>
                </div>
            )
        }

        function renderModelHeader() {
            return (
                <FixedWidthRow>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                        <div className="col s12 m12">
                          <div className="card blue darken-3">
                            <div className="card-content white-text">

                                <div className="card-title">
                                    {renderModelTitle()}

                                    {renderModelShare()}
                                </div>

                                {renderModelStatus()}

                                {renderModelDescription()}

                                  <br/>

                                    <div>
                                        <p>{
                                            model.metadata.labels.map((label, i) => <SimpleTag key={i} href={`/list?tag=${label}`}>{label}</SimpleTag>)
                                        }</p>
                                    </div>
                                </div>
                                
                                <div className="card-action blue darken-4">
                                  {
                                    model.metadata.links.github ? <a target="_blank" href={`${model.metadata.links.github}`}>Github</a> : <span></span>
                                  }
                                  {
                                    model.metadata.links.arxiv ? <a target="_blank" href={`${model.metadata.links.arxiv}` }>Arxiv</a> : <span></span>
                                  }
                                </div>
                          </div>
                        </div>
                    </div>
                </FixedWidthRow>
            );
        }

        function renderModelComments() {
            return (
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
            );
        }

        function renderModelREADME() {
            return (
                <FixedWidthRow>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                        <div className="col s12 m12">
                            <div className="card">
                                <div className="card-content">
                                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%"}}>
                                        <div className="col s12 m12">
                                            {
                                                self.state.editMode
                                                ?
                                                <div>
                                                    <h5>Edit ReadMe</h5>
                                                    <textarea style={{minHeight: "30px", maxHeight: "500px"}} scrollHeight="30" id="model-readme" onBlur={self.handleUpdateReadMe} 
                                                        placeholder="Tell the world about your model"
                                                        className="editable-input-dark"
                                                        onKeyUp={autoGrowHeight}
                                                        defaultValue={model.metadata.readme}>
                                                    </textarea>
                                                </div>
                                                :
                                                (
                                                    model.metadata.readme
                                                    ?
                                                    <Markdown tagName="article" className="markdown-body">
                                                        {model.metadata.readme}
                                                    </Markdown>
                                                    :
                                                    <div>
                                                    This model does not have a story yet :(
                                                    </div>
                                                )
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

        function renderAPIUsage() {
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
        }

        function renderLiveModelDemo() {
            return (
                <span className="black-text">
                    <div className="row">
                        <br/>
                        <div className="col m6" style={{textAlign: "center", marginBottom: "10px"}}>
                            Model Input
                            
                            <br/><br/>


                            {Object.values(inputWidgets)}

                            <br/>

                            {renderBrowserExample()}

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

                            <br/>

                            {renderSaveDemoButton()}
                                
                        </div>
                    </div>
                </span>
            );
        }

        function renderUploadInstructions() {
            return (
                <div className="black-text" style={{textAlign: "center"}}>
                    Currently, only metadata is available for this model. Next, deploy the model as an API. 
                    <div className="row"></div>
                    <a className="waves-effect btn-flat green white-text" href={`/upload/${userId}/${modelName}/${tag}`} style={{padding: 0, width: "80%", textAlign: "center"}}>{/*<i className="material-icons center">play_arrow</i>*/}How to Upload Model?</a>
                </div>
            );
        }


        function renderNoModelDemo() {
            return (
                <div className="black-text" style={{textAlign: "center"}}>
                    No demos to show... Looks like the author hasn't uploaded the model yet :(
                </div>
            );
        }

        function renderCardTitle(icon, title) {
            return (
                <div style={{textTransform: "uppercase", fontSize: "14px", fontWeight: "500"}}>
                    <i className="material-icons vertical-align-middle">{icon}</i> &nbsp;
                    <div className="vertical-align-middle">{title}</div>
                </div>
            );
        }

        function renderModelDemo() {
            var component = null;
            if(model.status == 'LIVE') {
                component = renderLiveModelDemo();
            }else if(!self.isAuthor) {
                component = renderNoModelDemo();
            } else{
                component = renderUploadInstructions();
            }

            return (
                <FixedWidthRow>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                        <div className="col s12 m12">
                            {/*renderCardTitle('mouse', 'Try it out')*/}
                            <div className="card">
                                <div className="card-content white-text">   
                                    {component}
                                </div>
                            </div>
                        </div>
                    </div>
                </FixedWidthRow>
            );
        }

        function renderModelStatistics() {
            return (
                <FixedWidthRow>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                        <div className="col s12 m12">
                            {renderCardTitle('insert_chart', 'Dashboard')}
                            <div className="card">
                                <div className="card-content black-text" style={{paddingTop: "5px"}}>   
                                    <Tabs inkBarStyle={{backgroundColor: "red", marginBottom: "10px"}} tabItemContainerStyle={{background: "none"}}>
                                        <Tab label="Page Views" buttonStyle={{color: "black"}} active >
                                            <CalendarHeatmap
                                              endDate={new Date(new Date().toJSON().slice(0,10))} // e.g. 2017-09-29
                                              numDays={300}
                                              values={self.state.pageView}
                                              classForValue={(value) => {
                                                if (!value) {
                                                  return 'color-empty';
                                                }
                                                var scale;
                                                if(value.count <= 10) {
                                                    scale = 1;
                                                }else if(value.count <= 20) {
                                                    scale = 2;
                                                }else if(value.count <= 50) {
                                                    scale = 3;
                                                }else {
                                                    scale = 4;
                                                }
                                                return `color-scale-${scale}`;
                                              }}
                                              titleForValue={(value) => {
                                                console.log('titleForValue', value);
                                                return 'title';
                                              }}
                                              tooltipDataAttrs={{ 'data-toggle': 'tooltip' }}
                                              style={{fontSize: "10px"}}

                                            />
                                        </Tab>

                                        <Tab label="Demo Runs" buttonStyle={{color: "black"}}>
                                            <CalendarHeatmap
                                              endDate={new Date('2016-04-01')}
                                              numDays={300}
                                              values={[
                                                { date: '2016-01-01', count: 1 },
                                                { date: '2016-01-03', count: 4 },
                                                { date: '2016-01-06', count: 2 },
                                                // ...and so on
                                              ]}
                                              classForValue={(value) => {
                                                if (!value) {
                                                  return 'color-empty';
                                                }
                                                var scale;
                                                if(value.count <= 10) {
                                                    scale = 1;
                                                }else if(value.count <= 20) {
                                                    scale = 2;
                                                }else if(value.count <= 50) {
                                                    scale = 3;
                                                }else {
                                                    scale = 4;
                                                }
                                                return `color-scale-${scale}`;
                                              }}
                                            />
                                        </Tab>
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                    </div>
                </FixedWidthRow>
            );
        }

        function renderModelGallery() {
            if(model.metadata.gallery.length > 0) {
                 return (
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
                );
            }else{
                return null;
            }
        }

        function renderModelDangerZone() {
            return (
                <FixedWidthRow>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                        <div className="col s12 m12">
                          <div className="card red">
                            <div className="card-content white-text">

                                <div className="card-title">
                                Danger Zone
                                </div>


                                <a className={"waves-effect btn-flat black-text model-action-btn red lighten-3 red-text"} 
                                    onClick={self.handleDeleteRepository}>
                                    <i className="material-icons vertical-align-middle">
                                    delete
                                    </i>
                                    <div className="vertical-align-middle">Delete this repository</div>
                                </a>

                                <br/>

                                Once you click this button to delete, there is no going back. Please be 100% certain.
                            </div>
                          </div>
                        </div>
                    </div>
                </FixedWidthRow>
            );
        }

        function renderTabTitle(icon, title) {
            return (
                <div style={{color: "#333"}}>
                    <i className="material-icons vertical-align-middle">{icon}</i> &nbsp;
                    <div className="vertical-align-middle">{title}</div>
                </div>
            );
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
                        <i className="material-icons" style={{fontSize: "20px", color: "gray"}}>
                            {
                                model.metadata.access == "public"
                                ?
                                    <span>bookmark</span>
                                :
                                    <span>lock</span>

                            }
                        </i> &nbsp; 
                        <span style={{fontSize: "20px", color: "#2196E1"}}>
                            <b>{model.user}</b> / <b>{model.name}</b> 
                            {
                                model.metadata.access == "public"
                                ?
                                    <span></span>
                                :
                                    <span style={{marginLeft: "10px",
                                                  padding: "2px",
                                                  border: "solid 1px #d6d7da",
                                                  color: "#929191",
                                                  fontSize: "15px",
                                                  borderRadius: "5px"
                                            }}>
                                        Private
                                    </span>
                            }
                        </span>
                        
                        {
                            self.isAuthor
                            ?
                            <span style={{marginLeft: "auto", marginRight: "0px"}}>
                                <div style={{textAlign: "center", width: "100%"}}>
                                    {
                                        self.state.editMode
                                        ?
                                        <a className="waves-effect btn white black-text" onClick={self.handleToggleEdit}>
                                            Preview
                                        </a>
                                        :
                                        <a className="waves-effect btn white black-text" onClick={self.handleToggleEdit}>
                                            Edit
                                        </a>
                                    }
                                    &nbsp;
                                    {
                                        self.state.model.metadata.access != "public"
                                        ?
                                        <a className="waves-effect btn green white-text" onClick={self.handlePublish}>
                                            Publish
                                        </a>
                                        :
                                        <a className="waves-effect btn white black-text" onClick={self.handleMakePrivate}>
                                            Make Private
                                        </a>
                                    }
                                    {/*
                                    <div className="switch">
                                        Edit Page:  &nbsp;
                                        <label>
                                          Off
                                          <input type="checkbox" defaultChecked={this.state.editMode} onChange={this.handleToggleEdit}/>
                                          <span className="lever"></span>
                                          On
                                        </label>
                                    </div>
                                    */}
                                    
                                </div>

                            </span>
                            :
                            null
                        }
                        
                    </FixedWidthRow>

                    <FixedWidthRow>
                        <Tabs inkBarStyle={{backgroundColor: "red"}} tabItemContainerStyle={{background: "none"}}>
                            <Tab label={renderTabTitle('widgets', 'Demo')} active >
                                {renderModelHeader()}
                                {renderModelGallery()}
                                {/*<FixedWidthRow>
                                    <ChartContainer timeRange={series1.timerange()} width={800}>
                                        <ChartRow height="30">
                                            <Charts>
                                                <LineChart axis="axis1" series={series1}/>
                                            </Charts>
                                        </ChartRow>
                                    </ChartContainer>
                                </FixedWidthRow>*/}
                                {renderModelDemo()}
                                {renderModelStatistics()}
                            </Tab>
                            <Tab label={renderTabTitle('crop_square', 'About')} >
                                {renderModelREADME()}
                            </Tab>
                            <Tab label={renderTabTitle('comment', 'Comments')}>
                                {renderModelComments()}
                            </Tab>

                            <Tab label={renderTabTitle('settings', 'Settings')} disabled={self.isAuthor ? false : true}>
                                {renderModelDangerZone()}
                            </Tab>
                            
                            
                        </Tabs>

                    </FixedWidthRow>


                    
                </Flex>

                <NotificationBanner ref={(notificationSystem) => {this.notificationSystem = notificationSystem;}} />
            </StyledModelLayout>
        )
    }
}

ModelView.propTypes = {
    match: PropTypes.obj
};

export default ModelView;
