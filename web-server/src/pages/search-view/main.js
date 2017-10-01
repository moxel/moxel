import React, {Component} from 'react';

// import {store} from '../../mock-data';
import SearchLayout from "./SearchLayout";
import ModelSnippet from "../../components/model-snippet/model-snippet";
import AuthStore from "../../stores/AuthStore";
import ModelStore from "../../stores/ModelStore";

class Main extends Component {
	constructor() {
		super()

		this.state = {
			models: []
		}
	}

	componentDidMount() {
		var user = AuthStore.username();
		ModelStore.fetchModelAll().then(function(models) {
            var modelHash = {};
            var modelAgg = [];
            for(var model of models) {
                // TODO: aggregate based on whichever tag comes later :)
                var uid = model.user + "/" + model.id;
                if(model.access == "public" || model.user == AuthStore.username()) {
                    modelAgg.push(model); 
                }
            }
            console.log(modelAgg)
            this.setState({
                models: modelAgg
            })
        }.bind(this));
	}

    render() {
        return (
            <SearchLayout>
                {/*Newest*/}{
                this.state.models.map((item) => (<ModelSnippet {...item}/>))
            }</SearchLayout>
        );
    }
}

export default Main;

