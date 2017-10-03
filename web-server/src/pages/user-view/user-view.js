import React, {Component} from "react";
import {Flex, FlexItem} from "layout-components";
import styled from "styled-components";
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import MapsPlace from 'material-ui/svg-icons/maps/place';
import CommunicationEmail from 'material-ui/svg-icons/communication/email';
import SocialShare from 'material-ui/svg-icons/social/share';
import ContentDrafts from 'material-ui/svg-icons/content/drafts';
import PropTypes from "prop-types";
import FixedWidthRow from "../../components/fixed-width-row";
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
// Store
import AuthStore from "../../stores/AuthStore";
import ModelStore from "../../stores/ModelStore";
// Our react components
import ModelSnippet from "../../components/model-snippet/model-snippet";
import LayoutUtils from "../../libs/LayoutUtils"
import SearchBar from 'material-ui-search-bar'

const StyledModelLayout = styled(Flex)`
.user-models-view input {
	color: black !important;
}
`

class UserView extends Component {
	constructor() {
		super()
		var self = this;

		self.state = {
			'models': []
		}

		this.handleSearchBarChange = this.handleSearchBarChange.bind(this);
	}

	componentDidMount() {
		var self = this;
		const {userId} = self.props.match.params;

		ModelStore.listModels(userId).then(function(models) {
            var modelHash = {};
            var modelAgg = [];
            for(var model of models) {
                // TODO: aggregate based on whichever tag comes later :)
                var uid = model.user + "/" + model.id;
                if(uid in modelHash) continue;
                modelHash[uid] = model;
                if(model.access == "public" || model.user == AuthStore.username()) {
                    modelAgg.push(model); 
                }
            }
            console.log(modelAgg)
            self.models = modelAgg
            self.setState({
                models: modelAgg
            })
        });
	}

	handleSearchBarChange(text) {
		var self = this;

		text = text.toLowerCase();

		var modelsFiltered = [];
		for(var model of self.models) {
			if(model.title.toLowerCase().search(text) != -1 || model.id.toLowerCase().search(text) != -1) {
				modelsFiltered.push(model);
			}
		}

		self.setState({
			'models': modelsFiltered
		})
	}

	render() {
		var self = this;
		const {userId} = self.props.match.params;

		

		function renderUserProfile() {
			return (
				<Card style={{marginBottom: "20px"}}>
				    {/*<CardHeader
				      title={AuthStore.username()}
				      subtitle={userId}
				      avatar={AuthStore.picture()}
				    />*/}
				    <CardMedia
				      overlay={<CardTitle title={AuthStore.username()} subtitle={userId} />}
				    >
				      <img src={AuthStore.picture()} alt="" />
				    </CardMedia>
				    {/*<CardTitle title="Card title" subtitle={userId} />*/}
				    <CardText>
				      I tame wild neural networks.
				    </CardText>
				    <Divider/>
				    <List>
				      <ListItem primaryText="Stanford University" leftIcon={<MapsPlace />} />
				      <ListItem primaryText="tianlins@cs.stanford.edu" leftIcon={<CommunicationEmail />} />
				      <ListItem primaryText="http://timshi.xyz" leftIcon={<SocialShare />} />
				    </List>
				</Card>
			);
		}

		function renderUserModels() {
			return (
				<div className="user-models-view">
					 <SearchBar
				      onChange={self.handleSearchBarChange}
				      onRequestSearch={() => console.log('onRequestSearch')}
				      style={{
				        margin: '0 auto',
				        maxWidth: 800,
				        color: "black"
				      }}
				    />
					{self.state.models.map((item) => (<ModelSnippet {...item}/>))}
				</div>
			);
		}

		function renderUserView() {
			if(LayoutUtils.isMobile()) {
				return (
					<div>
						{renderUserProfile()}	
						{renderUserModels()}
					</div>
				);
			}else{
				return (
					<div>
						<div className="col s4 m4">
							{renderUserProfile()}	
		                </div>
		                <div className="col s8 m8">
		                	{renderUserModels()}
		                </div>
		            </div>
	            );
			}
		}

		return (
			<StyledModelLayout>
				<FixedWidthRow>
					<div className="row" style={{width: "100%"}}>
                        {renderUserView()}
                    </div>
				</FixedWidthRow>
			</StyledModelLayout>
		)
	}
}

UserView.propTypes = {
    match: PropTypes.obj
};

export default UserView;