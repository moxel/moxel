import React from "react";
import PropTypes from "prop-types";
import FixedWidthRow from "../layout/fixed-width-row";
import ModelSnippet from "../../components/model-snippet";
import {store} from "../../mock-data";
import {Flex, FlexItem} from "layout-components";
import TabButtonBar from "../../components/tab-button-bar";
import 'markdown-it';
import Markdown from 'react-markdownit';

import "github-markdown-css";
import "./model-view.css";
function ModelView({match, ..._props}) {
    const {user, modelId} = match.params;
    const model = store.models.searchResult[0];
    return (
        <Flex column className="catalogue-layout-container">
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
                <FixedWidthRow>
                    <Markdown tagName="article" source={model.readme} className="markdown-body"/>
                </FixedWidthRow>
            </Flex>
        </Flex>
    );
}
ModelView.propTypes = {
    match: PropTypes.obj
};

export default  ModelView;
