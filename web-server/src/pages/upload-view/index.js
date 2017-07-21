import React from 'react';
import {Route} from "react-router-dom";
import UploadView from './upload-view';

const UploadViews = [
    <Route exact path="/upload" key="/upload" component={UploadView}/>,
];
export default UploadViews;