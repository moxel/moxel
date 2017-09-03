import React from 'react';
import {Redirect} from "react-router-dom";
import {Route} from "react-router-dom";
import ModelView from "./model-view";

export const ModelViews = [
    <Route path="/models/:userId/:modelName/:tag" key="/models" component={ModelView}/>,
    <Route exact path="/models/:userId/:modelName" component={({match, ..._props}) => {
    	const {userId, modelName} = match.params;
		return (
	    	<Redirect to={`/models/${userId}/${modelName}/latest`}/>
		)
	}}/>
];

export default ModelViews;


