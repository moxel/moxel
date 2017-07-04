import React, {Component} from 'react';

import {store} from '../../mock-data';
import SearchLayout from "./SearchLayout";
import ModelSnippet from "../../components/model-snippet";

class Main extends Component {
    render() {
        return (
            <SearchLayout>
                {/*Newest*/}{
                store.models.searchResult.map((item) => (<ModelSnippet {...item}/>))
            }</SearchLayout>
        );
    }
}

export default Main;

