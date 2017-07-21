import React from "react";
import {Route, Redirect} from "react-router-dom";
import PageLayout from "./pages/layout/page-layout";
import UploadViews from './pages/upload-view';
import SearchViews from './pages/search-view';
import ModelViews from './pages/model-view';
import AuthStore from "./stores/AuthStore";

export default function Root() {
    return (
        <PageLayout>
        	<Route exact path="/logout" render={() => {
        		AuthStore.logout();
        		return (
			    	<Redirect to="/"/>
				)
			}}/>
            <Route exact path="/" component={() => {
            	if(!AuthStore.isAuthenticated()) {
            		return (<div>root page</div>)
            	}else{
            		return <Redirect to="/upload"/>
            	}
            }}/>
            {UploadViews}
            {SearchViews}
            {ModelViews}
        </PageLayout>
    );
}
