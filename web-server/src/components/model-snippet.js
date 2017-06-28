import React from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import ProfileImage from "./profile-image";

import "./model-snippet.css";
export default function ModelSnippet({
                                         title,
                                         details,
                                         contributors,
                                         stats,
                                         ..._props
                                     }) {
    return (
        <FlexItem component={Flex}
                  column
                  className="model-snippet">
            <FlexItem className="snippet-title" component="h1">{title}</FlexItem>
            <FlexItem className="snippet-body">{details}</FlexItem>
            <Flex row
                  className="snippet-footer"
                  component={FlexItem}
                  fixed>
                {contributors.map(({username, profileImageUrl}) => <ProfileImage key={username}/>)}
                <FlexSpacer/>
                <FlexItem>{stats.download}</FlexItem>
                <FlexItem>{stats.stars}</FlexItem>
            </Flex>
        </FlexItem>
    )
}