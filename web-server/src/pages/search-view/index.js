import React, {Component} from 'react';
import {Flex, FlexItem} from "layout-components";
import styled from "styled-components";

// import {store} from '../../mock-data';
import SearchLayout from "./SearchLayout";
import ModelSnippet from "../../components/model-snippet/model-snippet";
import AuthStore from "../../stores/AuthStore";
import ModelStore from "../../stores/ModelStore";
import SearchBar from 'material-ui-search-bar'
import FixedWidthRow from "../../components/fixed-width-row";

const StyledModelLayout = styled(Flex)`
    marginTop: "150px"
`

class SearchViews extends Component {
	constructor() {
		super()

		this.state = {
			models: []
		}

        this.handleSearchText = this.handleSearchText.bind(this);
	}

	componentDidMount() {
        var self = this;

		var user = AuthStore.username();
		ModelStore.fetchModelAll().then(function(models) {
            var modelHash = {};
            var modelAgg = [];
            for(var model of models) {
                // TODO: aggregate based on whichever tag comes later :)
                var uid = model.user + "/" + model.id;
                if(model.access == "public" || model.user == AuthStore.username() || AuthStore.username() == 'moxel') {
                    modelAgg.push(model); 
                }
            }
            console.log(modelAgg)

            self.models = modelAgg;
            self.setState({
                models: self.models
            })
        });
	}

    componentWillReceiveProps(nextProps) {
        let searchText = nextProps.searchText;
        if(!searchText) {
            return;
        }
        this.handleSearchText(searchText);
    }

    handleSearchText(text) {
        var self = this;

        text = text.toLowerCase();
        
        if(text.length == 0) {
            return self.models;
        }

        var modelsFiltered = [];
        for(var model of self.models) {
            if(model.title.toLowerCase().search(text) != -1 || model.id.toLowerCase().search(text) != -1
                || model.user.toLowerCase().search(text) != -1) {
                modelsFiltered.push(model);
            }
        }

        self.setState({
            'models': modelsFiltered
        })
    }

    render() {
        var self = this;

        return (
            <StyledModelLayout>
                <SearchLayout>
                    {self.state.models.map((item) => (<ModelSnippet {...item}/>))
                }</SearchLayout>
            </StyledModelLayout>
        );
    }
}

export default SearchViews;

