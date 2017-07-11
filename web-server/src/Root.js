import React from 'react';
import {Route} from "react-router-dom";
import SearchViews from './pages/search-view';
import ModelViews from './pages/model-view';
import DatasetViews from './pages/dataset-view';
import PageLayout from "./pages/layout/page-layout";
export default function Root() {
    return (<PageLayout>
        <Route exact path="/" component={() => <div>root page</div>}/>
        {SearchViews}
        {ModelViews}
        {DatasetViews}
    </PageLayout>);
}

