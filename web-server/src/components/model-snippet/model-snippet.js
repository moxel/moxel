// @flow
import React from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import ProfileImage from "../profile-image/profile-image";
import SimpleTag from "../simple-tag";

import "./model-snippet.css";

type Props = {
    id: string,
    title: string,
    details: string,
    tags: Array<string>,
    contributors: Array<any>,
    stats: Object,
    onClick: () => void,
    [key: string]: any,
};
export default function ModelSnippet({
                                         id,
                                         title,
                                         details,
                                         tags,
                                         contributors,
                                         stats,
                                         onClick,
                                         ..._props
                                     }: Props) {
    return (
        <FlexItem component={Flex} column className="model-snippet">
            <a href={`/models/${id}`}
               onClick={onClick}>
                <FlexItem className="snippet-title" component="h1">{title}</FlexItem>
                <FlexItem className="snippet-body">
                    <p>{details}</p>
                    <p>{
                        tags.map((tag) => <SimpleTag href={`/list?tag=${tag}`}>{tag}</SimpleTag>)
                    }</p>
                </FlexItem>
                <Flex row
                      className="snippet-footer"
                      component={FlexItem}
                      fixed>
                    {contributors.map(({username}) => <ProfileImage className="profile-snippet"
                                                                    key={username}
                                                                    username={username}
                                                                    size={30}/>)}
                    <FlexSpacer/>
                    <FlexItem>{stats.download}</FlexItem>
                    <FlexItem>{stats.stars}</FlexItem>
                </Flex>
            </a>
        </FlexItem>
    )
}