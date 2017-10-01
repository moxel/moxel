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
import AuthStore from "../../stores/AuthStore";
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';


const StyledModelLayout = styled(Flex)`

`

class UserView extends Component {
	constructor() {
		super()
	}

	render() {
		var self = this;
		const {userId} = self.props.match.params;

		return (
			<StyledModelLayout>
				<FixedWidthRow>
					<div className="row" style={{width: "100%"}}>
                        <div className="col s4 m4">
                        	<Card>
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
                        </div>
                        <div className="col s8 m8">
                        </div>
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