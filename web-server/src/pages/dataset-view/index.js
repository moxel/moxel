import React from 'react';
import {Route} from "react-router-dom";
import DatasetView from "./dataset-view";
export const DatasetViews = [
    <Route path="/datasets/:user/:datasetId" key="/dataset" component={DatasetView}/>
];

export default DatasetViews;


