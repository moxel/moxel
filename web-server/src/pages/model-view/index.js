import React from 'react';
import {Route} from "react-router-dom";
import ModelView from "./ModelView";
export const ModelViews = [
    <Route path="/models/:user/:modelId" key="/models" component={ModelView}/>
];

export default ModelViews;


