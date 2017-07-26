import React from 'react';
import {Route} from "react-router-dom";
import Main from './main';

const SearchViews = [
    <Route exact path="/models" key="/models" component={Main}/>,
];
export default SearchViews;
