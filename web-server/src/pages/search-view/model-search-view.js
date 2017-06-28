import React, {Component} from 'react';

import {store} from '../../mock-data';
import ModelSnippet from "../../components/model-snippet";
import SearchLayout from "./SearchLayout";

class ModelSearchView extends Component {
    render() {
        return (
            <SearchLayout>{
                store.models.searchResult.map((item) => (<ModelSnippet {...item}/>))
            }</SearchLayout>
        );
    }
}

export default ModelSearchView;

