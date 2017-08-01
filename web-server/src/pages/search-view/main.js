import React, {Component} from 'react';

// import {store} from '../../mock-data';
import SearchLayout from "./SearchLayout";
import ModelSnippet from "../../components/model-snippet/model-snippet";
import AuthStore from "../../stores/AuthStore";

class Main extends Component {
	constructor() {
		super()

		this.state = {
			models: []
		}
	}

	componentDidMount() {
		var user = AuthStore.username();

		fetch(`/api/users/${user}/models`, {
			"method": "GET"
		}).then((response)=>{
            return response.json();
        }).then(function(data) {
            console.log("models", data);
            var models = [];
            for(var row of data) {
            	models.push({
            		id: row.uid,
            		title: row.name,
            		details: "(Description)",
            		readme: "(ReadME)",
            		tags: ["deep learning"],
            		contributors: [{ username: user, name: user }],
		            stats: {
		                download: 271,
		                stars: 805
		            },
		            lastUpdated: '1 days ago'
            	})
            }
            this.setState({
            	models: models
            })
        }.bind(this))

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

