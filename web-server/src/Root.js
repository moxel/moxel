import React, {Component} from 'react';
import {BrowserRouter, Route} from "react-router-dom";
import SearchViews from './pages/search-view';
import ModelViews from './pages/model-view';
import PageLayout from "./pages/layout/page-layout";
class Root extends Component {
    render() {
        return (
            <BrowserRouter>
                <PageLayout>
                    <Route exact path="/" component={()=><div>root page</div>}/>
                    {SearchViews}
                    {ModelViews}
                </PageLayout>
            </BrowserRouter>
        );
    }
}

export default Root;