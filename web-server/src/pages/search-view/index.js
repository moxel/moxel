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
import {List, ListItem} from 'material-ui/List';

import {Sticky, StickyContainer} from "react-sticky"


const StyledModelLayout = styled(Flex)`
    marginTop: "150px"

    .vertical-align-middle { 
        display: inline-block;
        vertical-align: middle; 
    }
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
        let self = this;

        let renderModelListViews = function() {
            return (
                <SearchLayout>
                    {self.state.models.map((item) => (<ModelSnippet {...item}/>))}
                </SearchLayout>
            );
        }

        let renderCategories = function() {
            let renderCategoryItem = function(name, icon) {
                return (
                    <ListItem primaryText={
                            <div>
                                <i className="material-icons"
                                    style={{
                                        fontSize: "16px",
                                        marginRight: "5px",
                                        verticalAlign: "middle",
                                        display: "inline-block"
                                    }}>{icon}</i>
                                <div style={{
                                        verticalAlign: "middle",
                                        display: "inline-block"
                                    }}>
                                    {name}
                                </div>
                            </div>
                        } 
                        style={{fontSize: "14px"}} 
                        innerDivStyle={{padding: "8px"}}/>
                );
            }

            return (
                <StickyContainer style={{ height: document.body.scrollHeight}}>
                    <Sticky>
                        {
                            ({
                              style,
                              isSticky,
                              wasSticky,
                              distanceFromTop,
                              distanceFromBottom,
                              calculatedHeight
                            }) => {
                                if(distanceFromTop < 0)  {
                                    style = {
                                        position: "fixed",
                                        top: 0
                                    };
                                }else{
                                    style = {
                                        transform: "translateZ(0)"
                                    };
                                }
                                return (
                                    <List style={style}>
                                        {renderCategoryItem('Home', 'home')}
                                    </List>
                                );
                            }
                        }
                    </Sticky>
                </StickyContainer>
            );
        }

        return (
            <StyledModelLayout>
                <FixedWidthRow>
                    <div className="row" style={{width: "100%"}}>
                        <div>
                            <div className="col s2 m2">
                                {renderCategories()}	
                            </div>
                            <div className="col s10 m10">
                                {renderModelListViews()}
                            </div>
                        </div>
                    </div>
                </FixedWidthRow>
            </StyledModelLayout>
        );
    }
}

export default SearchViews;

