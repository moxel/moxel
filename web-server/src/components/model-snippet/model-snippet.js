// @flow
import React from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import ProfileImage from "../profile-image/profile-image";
import SimpleTag from "../simple-tag";
import styled from "styled-components";
import {Link} from "react-router-dom";

const StyledModelSnippet = styled(FlexItem)`
    height: 150px;

    .vertical-align-middle { 
        display: inline-block;
        vertical-align: middle; 
    }

    .card.horizontal {
        margin-top: 0px;
        margin-bottom: 5px;
        height: 150px;
    }

    a {
        text-decoration: none;
        color: inherit;
    }
    
    .snippet-id {
        font-size: 15px;
        font-weight: bold;
        color: #2196E1;
    }

    .snippet-title {
        padding: 14px
    }

    h1.snippet-title {
        margin: 0 0 0 0;
        font-size: 1.5em;
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

    .model-id a:hover {
        text-decoration: underline;
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
    let renderStars = function() {
        if(stars > 0) {
            return (
                <span>
                    <i className="material-icons vertical-align-middle">star</i>
                    &nbsp; 
                    <span className="vertical-align-middle">{stars}</span>
                </span>
            );
        }else{
            return null;
        }
    }

    return (
        <StyledModelSnippet component={Flex} column className="model-snippet">
             
            <div className="card horizontal">
                {/*<div className="card-image">
                  <img src="https://lorempixel.com/100/190/nature/6"/>
                </div>*/}
                <div className="card-stacked">
                    <div className="card-content">
                        <Link to={`/models/${user}/${id}/${tag}`}>
                              <FlexItem className="snippet-id model-id">
                                  <Link to={`/users/${user}`}>{user}</Link>
                                  <span style={{marginLeft: "5px", marginRight: "5px"}}>/</span>
                                  <Link to={`/models/${user}/${id}/`}>{id}</Link>
                                  <span style={{float: "right", color: "#666"}}>
                                      {/*<span>
                                          <i className="material-icons" style={{fontSize: "15px"}}>loyalty</i>&nbsp;  <span>{tag}</span> &nbsp;
                                      </span>*/}
                                      {renderStars()}
                                  </span>
                              </FlexItem>
                              <FlexItem className="snippet-title" component="h1">{title}</FlexItem>
                              {/*<FlexItem className="snippet-body">
                                  <p>{description}</p>
                              </FlexItem>*/}

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
                        </Link>
                        <div style={{color: "#666"}}>
                            <span>{
                                labels.map((label, i) => <SimpleTag key={i} href={`/list?label=${label}`}>{label}</SimpleTag>)
                            }</span>
                        </div>
                    </div>
                </div>
            </div>
          
            
        </StyledModelSnippet>
    )
}
