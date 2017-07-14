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


const StyledModelLayout = styled(Flex)`
    .model-snippet {
        width: 100%;
    }
    
    article.markdown-body {
        margin-top: 20px;
        padding-top: 20px;
        width: 100%;
        padding-bottom: 100px;
    }`;

function ModelView({match, ..._props}) {
    const {user, modelId} = match.params;
    const model = store.models.searchResult[0];
    return (
        <StyledModelLayout column className="catalogue-layout-container">
            {/*<FixedWidthRow component="h1" className="catalogue-hero"*/}
            {/*>Search For Your Favorite Model</FixedWidthRow>*/}
            {/*<FixedWidthRow component={SearchBar}*/}
            {/*className="catalogue-search-bar"*/}
            {/*placeholder="Search 15,291 models"/>*/}
            <Flex component={FlexItem}
                  fluid
                  width="100%"
                  className="model-view">
                <FixedWidthRow style={{marginTop: '30px'}}><ModelSnippet {...model}/></FixedWidthRow>
                <TabButtonBar repoUrl={`https://github.com/${user}/${modelId}`}/>
                <NotificationBanner>A new version of the model is being launched, click here to see the launch
                    logs...</NotificationBanner>
                <FixedWidthRow>
                    <Markdown tagName="article" source={model.readme} className="markdown-body"/>
                </FixedWidthRow>
            </Flex>
        </StyledModelLayout>
    );
}
ModelView.propTypes = {
    match: PropTypes.obj
};

export default  ModelView;
