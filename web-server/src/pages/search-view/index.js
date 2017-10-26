import React, {Component} from 'react';
import {Flex, FlexItem} from "layout-components";
import styled from "styled-components";
import PropTypes from 'prop-types';

// import {store} from '../../mock-data';
import SearchLayout from "./SearchLayout";
import ModelSnippet from "../../components/model-snippet/model-snippet";
import AuthStore from "../../stores/AuthStore";
import ModelStore from "../../stores/ModelStore";
import SearchBar from 'material-ui-search-bar'
import FixedWidthRow from "../../components/fixed-width-row";
import {makeSelectable, List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import queryString from 'query-string';

import {Sticky, StickyContainer} from "react-sticky"
import {Link} from "react-router-dom";

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
  return class SelectableList extends Component {
    static propTypes = {
      children: PropTypes.node.isRequired,
      defaultValue: PropTypes.number.isRequired,
    };

    componentWillMount() {
      this.setState({
        selectedIndex: this.props.defaultValue,
      });
    }

    handleRequestChange = (event, index) => {
      this.setState({
        selectedIndex: index,
      });
    };

    render() {
      return (
        <ComposedComponent
          value={this.state.selectedIndex}
          onChange={this.handleRequestChange}
          style={this.props.style}
        >
          {this.props.children}
        </ComposedComponent>
      );
    }
  };
}

SelectableList = wrapState(SelectableList);

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

        this.handleSearch = this.handleSearch.bind(this);
	}

	componentDidMount() {
        var self = this;

        let username = null;
        if(AuthStore.isAuthenticated()) {
           username = AuthStore.username();
        }

		ModelStore.fetchModelAll().then(function(models) {
            var modelHash = {};
            var modelAgg = [];
            for(var model of models) {
                // TODO: aggregate based on whichever tag comes later :)
                var uid = model.user + "/" + model.id;
                if(model.access == "public" || model.user == username || username == 'moxel') {
                    modelAgg.push(model); 
                }
            }
            console.log(modelAgg)

            self.models = modelAgg;

            let query = queryString.parse(self.props.location.search)
            self.handleSearch({
                'text': '',
                'label': query.label
            });
        });
	}

    componentWillReceiveProps(nextProps) {
        let query = queryString.parse(nextProps.location.search)
        let searchText = nextProps.searchText;
        if(!searchText) searchText = "";

        this.handleSearch({
            'label': query.label,
            'text': searchText
        });
    }

    handleSearch(constraint) {
        var self = this;

        let {label, text} = constraint;

        text = text.toLowerCase();
        
        var modelsFiltered = [];
        for(var model of self.models) {
            console.log(model.labels, label);
            if(text.length > 0 && model.title.toLowerCase().search(text) == -1 && model.id.toLowerCase().search(text) == -1
                && model.user.toLowerCase().search(text) == -1) {
                continue;
            }

            if(label && model.labels.indexOf(label) == -1) {
                continue;
            }
            modelsFiltered.push(model);
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
            let renderCategoryItem = function(name, icon, value, link) {
                return (
                    <ListItem 
                        linkButton={true} containerElement={<Link to={link}/>}
                        value={value} primaryText={
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
                        style={{fontSize: "14px", width: "180px"}} 
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
                                if(distanceFromTop <= 0)  {
                                    style = {
                                        position: "fixed",
                                        top: 0
                                    };
                                }else{
                                    style = {
                                        transform: "translateZ(0)"
                                    };
                                }

                                let items = [];

                                items.push(renderCategoryItem('Home', 'home', 1, "/"));

                                let labels = ModelStore.listLabels();
                                for(var i = 0; i < labels.length; i++) {
                                    items.push(renderCategoryItem(labels[i], 'local_offer', i + 2, `/?label=${labels[i]}`));
                                }

                                // console.log('distanceFromTop', distanceFromTop, style);
                                return (
                                    <SelectableList defaultValue={1} style={style} className='model-category'>
                                        <Subheader>Feed</Subheader>
                                        {items}
                                    </SelectableList>
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
                            <div className="col s3 m3">
                                {renderCategories()}	
                            </div>
                            <div className="col s9 m9">
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

