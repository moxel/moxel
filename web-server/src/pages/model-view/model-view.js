import React from "react";
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

    padding-top: 20px;`;

function ModelView({match, ..._props}) {
    const {user, modelId} = match.params;
    const model = {
        user: "strin",
        name: "tf-object-detection",
        status: "LIVE",
        title: "Tensorflow Object Detection",
        description: "This is an object detection model written in Tensorflow",
        readme: "(ReadME)",
        tag: "0.0.1",
        keywords: ["deep learning", "computer vision"],
        links: {
            "github": "https://github.com/tensorflow/models",
            "arxiv": "https://arxiv.org/abs/1603.04467"
        },
        stars: 999,
        lastUpdated: '1 days ago'
    };

    var statusButton = null;
    if(model.status == "LIVE") {
        statusButton = (
            <a className="waves-effect btn-flat green black-text"><i className="material-icons left">check_box_outline_blank</i>{model.status}</a>
        )
    }else{
        statusButton = (
            <a className="waves-effect btn-flat white black-text"><i className="material-icons left">check_box_outline_blank</i>{model.status}</a>
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
                <FixedWidthRow>
                    <i className="material-icons">book</i> &nbsp; 
                    <b>{model.user}</b> &nbsp; / &nbsp;  <b>{model.name}</b>
                </FixedWidthRow>
                <FixedWidthRow>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%", marginBottom: 0}}>
                        <div className="col s12 m12">
                          <div className="card blue-grey">
                            <div className="card-content white-text">
                            <span style={{float: "right"}}>
                                {statusButton}
                                &nbsp;
                                <a className='dropdown-button btn-flat white black-text' href='#' data-activates='dropdown1'>
                                    <i className="material-icons left">loyalty</i>
                                    {model.tag}
                                </a>
                                &nbsp;
                                <ul id='dropdown1' className='dropdown-content white black-text'>
                                  <li><a href="#!">one</a></li>
                                  <li><a href="#!">two</a></li>
                                  <li className="divider"></li>
                                  <li><a href="#!">three</a></li>
                                  <li><a href="#!"><i className="material-icons">view_module</i>four</a></li>
                                  <li><a href="#!"><i className="material-icons">cloud</i>five</a></li>
                                </ul>
                                &nbsp;
                                <a className="waves-effect btn-flat white black-text"><i className="material-icons left">star</i>{model.stars}</a>
                            </span>
                              <span className="card-title">
                                    {model.title}
                              </span>
                              <p>{model.description}</p>
                            </div>
                            <div className="card-action blue-grey darken-1">
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
                                <div className="card-tabs blue-grey lighten-1">
                                  <Tabs className='tab-demo blue-grey lighten-1'>
                                    <Tab title="Demo" active >
                                        <span className="white-text">Demo</span>
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
                                              <tr>
                                                <td>Image</td>
                                                <td>raw.base64</td>
                                              </tr>
                                              <tr>
                                                <td>Text</td>
                                                <td>string.ascii</td>
                                              </tr>
                                            </tbody>
                                          </table>
                                    </Tab>
                                    <Tab title="Output Type">
                                    </Tab>
                                </Tabs>

                                  

                                  
                                </div>
                            </div>
                        </div>
                    </div>
                </FixedWidthRow>

                <FixedWidthRow>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, width: "100%"}}>
                        <div className="col s12 m12">
                            <div className="card">
                                <div className="card-content black-text">
                                    <Markdown tagName="article" source={model.readme} className="markdown-body"/>
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
        </StyledModelLayout>
    );
}
ModelView.propTypes = {
    match: PropTypes.obj
};

export default  ModelView;
