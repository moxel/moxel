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
import { Charts, ChartContainer, ChartRow, YAxis, LineChart} from "react-timeseries-charts";
import { TimeSeries, TimeRange } from "pondjs";
import {Tabs, Tab} from 'react-materialize'
import ImageUploader from "../../widgets/image-uploader";
import ModelStore from "../../stores/ModelStore";
import DataStore from "../../stores/DataStore";
import AuthStore from "../../stores/AuthStore";
import RatingStore from "../../stores/RatingStore";
import Error404View from "../../pages/error-view/404";
import Slider from "react-slick";
import SimpleTag from "../../components/simple-tag";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ReactDisqusThread from 'react-disqus-thread';
import {Button, Dropdown, NavItem} from 'react-materialize'
import { FacebookButton, FacebookCount, TwitterCount } from "react-social";
import NotificationSystem from 'react-notification-system';


const StyledModelLayout = styled(Flex)`
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
        width: 75px;
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
        border: none;
        padding-left: 5px;
    }

    .editable-input:hover {
        background-color: rgba(255, 255, 255, 0.14);
        border: none;
    }
`;

class ModelView extends Component {
    constructor() {
        super()

        this.state = {
            model: null,
            readme: "*No description available for the model*",
            rating: 0, // user rating for this model.
        }

        this.handleUpvote = this.handleUpvote.bind(this);
        this.handleUpdateTitle = this.handleUpdateTitle.bind(this);
        this.handleUpdateDescription = this.handleUpdateDescription.bind(this);
        this.doingHandleUpvote = false;
        this.syncModel = this.syncModel.bind(this);
        this.syncRating = this.syncRating.bind(this);        
    }

    syncModel() {
        return new Promise(function(resolve, reject) {
            const {userId, modelId, tag} = this.props.match.params;

            ModelStore.fetchModel(userId, modelId, tag).then(function(model) {
                console.log('the model', model);

                this.setState({
                    model: model
                })

                console.log(model.readme);

                if(model.readme) {
                    fetch(model.readme).then(function(resp) {
                        return resp.text();
                    }).then(function(body) {
                        this.setState({
                            readme: body
                        })
                    }.bind(this));
                }

                resolve(model);
            }.bind(this)).catch(function() {
                console.log('Cannot fetch model');
                var model = {
                    status: "404"
                }

                this.setState({
                    model: model
                })
            }.bind(this));
        }.bind(this))
    }

    syncRating() {
        const {userId, modelId, tag} = this.props.match.params;

        var modelUid = ModelStore.modelId(userId, modelId, tag);  // TODO: resolve the confusion of modelId.
        var myId = AuthStore.username()

        RatingStore.fetchRating(myId, modelUid).then(function(rating) {
            console.log("Rating value = ", rating);
            this.setState({
                rating: rating
            });
        }.bind(this));
    }

    componentDidMount() {
        const {userId, modelId, tag} = this.props.match.params;
        
        this.syncModel();
        this.syncRating();

        // Add event handler for image upload.
        this.uploadEventHandlers = { 
            addedfile: (file) => {
                const {userId, modelId, tag} = this.props.match.params;
                console.log('file', file);
                var parts = file.name.split('.')
                var ext = parts[parts.length-1];
                var uid = DataStore.uuid() + '.' + ext;
                DataStore.uploadData(userId, modelId, `data/${uid}`, file);
            }
        }

        // Set up edit mode.
        console.log(userId, AuthStore.username());
        this.editMode = (userId == AuthStore.username());

    }

    handleUpvote() {
        if(this.doingHandleUpvote) {
            window.setTimeout(this.handleUpvote, 100);
            return
        }
        this.doingHandleUpvote = true;

        const {userId, modelId, tag} = this.props.match.params;

        var modelUid = ModelStore.modelId(userId, modelId, tag);  // TODO: resolve the confusion of modelId.
        var myId = AuthStore.username()

        var newRating = 0.;
        if(this.state.rating > 0) {
            newRating = 0.;
        }else{
            newRating = 1.;
        }

        // First, create the illusion that update is done.
        this.setState({
            rating: newRating
        })

        var model = this.state.model;

        if(newRating == 1.) {
            model['stars'] = model['stars'] + 1;
        }else{
            model['stars'] = model['stars'] - 1;
        }

        this.setState({
            model: model
        })

        // Then, do the real update.
        RatingStore.updateRating(myId, modelUid, newRating).then(function() {
            this.syncRating();
            this.syncModel().then(function(model) {
                if(newRating == 1.) {
                    model['stars'] = model.stars + 1;
                }else{
                    model['stars'] = model.stars - 1;
                }

                this.setState({
                    model: model
                })

                ModelStore.updateModel(userId, modelId, tag, {'stars': model['stars']}).then(function() {
                    this.syncModel().then(function() {
                        this.doingHandleUpvote = false;
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this))
    }

    handleUpdateTitle() {
        const {userId, modelId, tag} = this.props.match.params;

        var modelTitle = document.querySelector('#model-title').value;

        ModelStore.updateModel(userId, modelId, tag, {'title': modelTitle}).then(function() {
            this.syncModel().then(function() {
                this.notificationSystem.addNotification({
                  message: 'Successfully updated model title.',
                  level: 'success'
                });
            }.bind(this));
        }.bind(this));
    }

    handleUpdateDescription() {
        const {userId, modelId, tag} = this.props.match.params;

        var modelDescription = document.querySelector('#model-description').value;

        ModelStore.updateModel(userId, modelId, tag, {'description': modelDescription}).then(function() {
            this.syncModel().then(function() {
                this.notificationSystem.addNotification({
                    message: 'Successfully updated model description.',
                    level: 'success'
                });
            }.bind(this));
        }.bind(this));
    }

    render() {
        if(!this.state.model) {
            return null
        }

        if(this.state.model.status == "404") {
            return <Error404View/>
        }

        const {userId, modelId, tag} = this.props.match.params;
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
                        <i className="material-icons">book</i> &nbsp; 
                        <b>{model.user}</b> &nbsp; / &nbsp;  <b>{model.id}</b>
                    </FixedWidthRow>
                    <FixedWidthRow>
                        <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                            <div className="col s12 m12">
                              <div className="card blue darken-3">
                                <div className="card-content white-text">
                                <span style={{float: "right"}}>
                                    
                                    &nbsp;
                                    <a className={"waves-effect btn-flat black-text model-action-btn " + (this.state.rating > 0 ? "orange lighten-1" : "white")} onClick={this.handleUpvote}><i className="material-icons left">arrow_drop_up</i>{model.stars}</a>
                                    &nbsp;
                                    
                                    <ul id='dropdown-share' className='dropdown-content'>
                                      <li><a href="#!">one</a></li>
                                      <li><a href="#!">two</a></li>
                                    </ul>
                                    

                                    <Dropdown trigger={
                                        <a className="dropdown-button btn-flat white black-text model-action-btn" data-activates='dropdown-share'>
                                            <i className="material-icons left">share</i>Share
                                        </a>
                                    }>
                                        <NavItem><div className="addthis_inline_share_toolbox" style={{width: "150px"}}></div></NavItem>
                                    </Dropdown>

                                </span>

                                <span className="card-title">
                                    {
                                        this.editMode
                                        ?
                                        (
                                            <input id="model-title" defaultValue={model.title} className="editable-input" style={{width: "60%"}} onBlur={this.handleUpdateTitle}/>
                                        )
                                        :
                                        (
                                            model.title
                                        )
                                    }
                                </span>

                                <div style={{height: "50px"}}>
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

                                <div>
                                    {
                                        this.editMode
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
                    <FixedWidthRow>
                        <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                            <div className="col s12 m12">
                                <div className="card">
                                    <div className="card-tabs white">
                                      <Tabs className='tab-demo white'>
                                        <Tab title="Demo" active >
                                            <span className="white-text">
                                                <div className="row"></div> 
                                                <div className="row">
                                                    <div className="col m6">
                                                        <ImageUploader uploadEventHandlers={this.uploadEventHandlers}></ImageUploader>
                                                    </div>
                                                    <div className="col m6" style={{textAlign: "center"}}>
                                                        <img style={{width: "auto", height: "300px", borderRadius: "5px", border: "2px dashed #C7C7C7"}} src="/images/question-256.png"></img>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col m5">
                                                        
                                                    </div>
                                                    <div className="col m2">
                                                        <a className="waves-effect btn-flat green white-text" style={{padding: 0, width: "100%", textAlign: "center"}}>{/*<i className="material-icons center">play_arrow</i>*/}Run</a>
                                                    </div>
                                                    <div className="col m5">
                                                    </div>
                                                    
                                                </div>
                                            </span>
                                        </Tab>
                                        <Tab title="API">
                                            <Markdown className="markdown-body white-text" style={{height: "200px", overflow: "scroll", marginBottom: "20px"}}>
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
                                        </Tab>
                                        <Tab title="Input Type">
                                            <table className="white-text" style={{width: "300px", marginLeft: "150px"}}>
                                                {/*<thead>
                                                  <tr>
                                                      <th>Name</th>
                                                      <th>Type</th>
                                                  </tr>
                                                </thead>*/}
                                                <tbody>
                                                    {inputType}
                                                </tbody>
                                            </table>
                                        </Tab>
                                        <Tab title="Output Type">
                                            <table className="white-text" style={{width: "300px", marginLeft: "150px"}}>
                                                {/*<thead>
                                                  <tr>
                                                      <th>Name</th>
                                                      <th>Type</th>
                                                  </tr>
                                                </thead>*/}
                                                <tbody>
                                                    {outputType}
                                                </tbody>
                                            </table>
                                        </Tab>
                                    </Tabs>

                                    
                                    <hr/>

                                      
                                    </div>

                                    <div className="card-content">
                                        <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%"}}>
                                            <div className="col s12 m12">
                                                <Markdown tagName="article" source={this.state.readme} className="markdown-body"/>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        
                    </FixedWidthRow>
                

                    <FixedWidthRow>
                        <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                            <div className="col s12 m12">
                                <div className="card">
                                    <div className="card-content">
                                        <ReactDisqusThread
                                            shortname="moxel"
                                            identifier="something-unique-12345"
                                            title="Example Thread"
                                            url={`http://dummy.ai${window.location.pathname}`}
                                            category_id="123456"
                                            onNewComment={this.handleNewComment}>
                                            {`http://dummy.ai${window.location.pathname}`}
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
