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

class UploadView extends Component {
    constructor() {
        super()
        this.state = {
            step: 0
        }

        this.nextStep = this.nextStep.bind(this);
    }

    nextStep() {
        console.log('changing state', this.state.step)
        this.setState({
            step: this.state.step + 1
        })
    }

    render() {
        return (
            <div>
                <Stepper steps={ [{title: 'Install Warpdrive'}, {title: 'Deploy Models'}, {title: 'Finish'}] } activeStep={ this.state.step } />
                <br/>
                <FixedWidthRow>
                    <Markdown tagName="instruction">
                    {`    
                        ##### Warpdrive

                        Install this CLI tool to deploy models.

                        \`\`\`
                        pip install warp-cli
                        \`\`\`


                    `}
                    </Markdown>

                
                </FixedWidthRow>

                <FixedWidthRow>
                    <button style={{float: "right"}} className="waves-effect waves-light btn blue" onClick={this.nextStep}>Next</button> 
                </FixedWidthRow>
            </div>
        );
    }
}
UploadView.propTypes = {
    
};

export default UploadView;
