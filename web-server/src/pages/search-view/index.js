import React from 'react';
import {Route} from "react-router-dom";
import Main from './main';
import ModelSearchView from "./model-search-view";

const SearchViews = [
    <Route exact path="/list" key="/list" component={Main}/>,
    <Route exact path="/list?search" key="/list-search" component={ModelSearchView}/>
];
export default SearchViews;
