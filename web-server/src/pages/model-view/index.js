import React from 'react';
import {Redirect} from "react-router-dom";
import {Route} from "react-router-dom";
import ModelView from "./model-view";

export const ModelViews = [
    <Route path="/models/:userId/:modelId/:tag" key="/models" component={ModelView}/>,
    <Route exact path="/models/:userId/:modelId" component={({match, ..._props}) => {
    	const {userId, modelId} = match.params;
		return (
	    	<Redirect to={`/models/${userId}/${modelId}/latest`}/>
		)
	}}/>
];

export default ModelViews;


