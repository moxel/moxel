import React from 'react';
import {Route} from "react-router-dom";
import Main from './main';

const SearchViews = [
    <Route exact path="/list" key="/list" component={Main}/>,
];
export default SearchViews;
