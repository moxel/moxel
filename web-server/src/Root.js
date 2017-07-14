import React from "react";
import {Route} from "react-router-dom";
import PageLayout from "./pages/layout/page-layout";
import SearchViews from './pages/search-view';
import ModelViews from './pages/model-view';

export default function Root() {
    return (
        <PageLayout>
            <Route exact path="/" component={() => <div>root page</div>}/>
            {SearchViews}
            {ModelViews}
        </PageLayout>
    );
}
