import React from "react";
import {Route, Redirect} from "react-router-dom";
import PageLayout from "./pages/layout/page-layout";
import UploadViews from './pages/upload-view';
import SearchViews from './pages/search-view';
import ModelViews from './pages/model-view';
import CreateView from './pages/create-view';
import LoggedInView from './pages/logged-in-view';
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
        		return (<LandingPage/>)
            }}/>

            <Route exact path="/new" component={() => 
                <CreateView/>
            }/>

            <Route exact path="/logged-in" component={() => 
                <LoggedInView/>
            }/>
            
            {UploadViews}
            {SearchViews}
            {ModelViews}
        </PageLayout>
    );
}
