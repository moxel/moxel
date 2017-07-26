import React from "react";
import {Route, Redirect} from "react-router-dom";
import PageLayout from "./pages/layout/page-layout";
import UploadViews from './pages/upload-view';
import SearchViews from './pages/search-view';
import ModelViews from './pages/model-view';
import CreateView from './pages/create-view';
import LandingPage from './pages/home-view/landing-page';
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
            		return (<LandingPage/>)
            	}else{
            		return <Redirect to="/new"/>
            	}
            }}/>

            <Route exact path="/new" component={() => 
                <CreateView/>
            }/>
            
            {UploadViews}
            {SearchViews}
            {ModelViews}
        </PageLayout>
    );
}
