// @flow
import React from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import ProfileImage from "../profile-image/profile-image";
import SimpleTag from "../simple-tag";
import styled from "styled-components";

const StyledModelSnippet = styled(FlexItem)`

    a {
        text-decoration: none;
        color: inherit;
    }
    
    .snippet-id {
        font-size: 20px;
        font-weight: bold;
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

    .simple-tag {
        color: #888 !important;
        border: 1px solid #888;
    }
`;
type Props = {
    id: string,
    user: string,
    title: string,
    description: string,
    labels: Array<string>,
    stars: Object,
    [key: string]: any,
};
export default function ModelSnippet({
                                         id,
                                         user,
                                         tag,
                                         title,
                                         description,
                                         labels,
                                         stars,
                                         ..._props
                                     }: Props) {
    return (
        <StyledModelSnippet component={Flex} column className="model-snippet">
             <div className="col s12 m7">
                <div className="card horizontal">
                  {/*<div className="card-image">
                    <img src="https://lorempixel.com/100/190/nature/6"/>
                  </div>*/}
                  <div className="card-stacked">
                    <div className="card-content">
                      <a href={`/models/${user}/${id}/${tag}`}>
                            <FlexItem className="snippet-id">{user} / {id}</FlexItem>
                            <FlexItem className="snippet-title" component="h1">{title}</FlexItem>
                            <FlexItem className="snippet-body">
                                <p>{description}</p>
                            </FlexItem>
                            {/*<Flex row
                                  className="snippet-footer"
                                  component={FlexItem}
                                  fixed>
                                {{contributors.map(({username}) => <ProfileImage className="profile-snippet"
                                                                                key={username}
                                                                                username={username}
                                                                                size={30}/>)}}
                                <FlexSpacer/>
                                <FlexItem></FlexItem>
                            </Flex>*/}
                        </a>
                    </div>
                    <div className="card-action">
                        <span>{
                            labels.map((label, i) => <SimpleTag key={i} href={`/list?label=${label}`}>{label}</SimpleTag>)
                        }</span>
                        <span style={{float: "right"}}>
                            <span>
                                <i className="material-icons" style={{fontSize: "15px"}}>loyalty</i>&nbsp;  <span>{tag}</span> &nbsp;
                            </span>
                            &nbsp;
                            <span>
                                <i className="material-icons" style={{fontSize: "15px"}}>star</i>&nbsp; <span>{stars}</span>
                            </span>
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            
        </StyledModelSnippet>
    )
}