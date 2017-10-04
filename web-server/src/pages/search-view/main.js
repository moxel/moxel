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
.search-models-view input {
    color: black !important;
}
`

class Main extends Component {
	constructor() {
		super()

		this.state = {
			models: []
		}

        this.handleSearchBarChange = this.handleSearchBarChange.bind(this);
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

    handleSearchBarChange(text) {
        var self = this;

        text = text.toLowerCase();

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
                <FixedWidthRow className="search-models-view">
                    <SearchBar
                      onChange={self.handleSearchBarChange}
                      onRequestSearch={() => console.log('onRequestSearch')}
                      style={{
                        margin: '0 auto',
                        width: "100%"
                      }}
                    />
                </FixedWidthRow>
                <SearchLayout>
                    {self.state.models.map((item) => (<ModelSnippet {...item}/>))
                }</SearchLayout>
            </StyledModelLayout>
        );
    }
}

export default Main;

