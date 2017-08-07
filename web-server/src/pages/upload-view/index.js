import React from 'react';
import {Route} from "react-router-dom";
import UploadView from './upload-view';

export const UploadViews = [
    <Route exact path="/upload/:userId/:modelId/:tag" key="/upload" component={UploadView}/>
];

export default UploadViews;
