// @flow
import React from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import ProfileImage from "../profile-image/profile-image";
import SimpleTag from "../simple-tag";
import styled from "styled-components";

const StyledModelSnippet = styled(FlexItem)`
    box-sizing: border-box;
    border-radius: 8px;
    border: solid 1px #dddddd;
    margin-bottom: 15px;
    cursor: pointer;

    :hover {
        /*use header link as url in the future instead of the entire card.*/
        box-shadow: rgb(136, 182, 255) 0 0 1px;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    .snippet-title {
        padding: 14px
    }

    h1.snippet-title {
        margin: 0 0 0 0;
        font-size: 1.7em;
        font-weight: 400;
        color: #black;
    }

    .snippet-body {
        padding: 14px;
        padding-top: 0;
    }

    .snippet-body p:first-child {
        margin-top: 0;
    }

    .snippet-body p:last-child {
        margin-bottom: 0;
    }

    .snippet-footer {
        background-color: rgba(240, 243, 248, 0.6);
        padding: 14px;
        border-bottom-right-radius: 7px;
        border-bottom-left-radius: 7px;
    }

    .profile-snippet:not(:last-child) {
        margin-right: 14px;
    }
`;
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
        <StyledModelSnippet component={Flex} column className="model-snippet">
            <a href={`/models/${id}`}
               onClick={onClick}>
                <FlexItem className="snippet-title" component="h1">{title}</FlexItem>
                <FlexItem className="snippet-body">
                    <p>{details}</p>
                    <p>{
                        tags.map((tag, i) => <SimpleTag key={i} href={`/list?tag=${tag}`}>{tag}</SimpleTag>)
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
        </StyledModelSnippet>
    )
}