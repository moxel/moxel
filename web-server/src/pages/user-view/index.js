import React from 'react';
import {Route} from "react-router-dom";
import UserView from './user-view';

export const UserViews = [
    <Route exact path="/users/:userId/" component={UserView}/>
];

export default UserViews;
