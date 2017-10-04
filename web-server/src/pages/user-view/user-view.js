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
import FlatButton from 'material-ui/FlatButton';
import NotificationBanner from '../../components/notification-banner/notification-banner';
// Store
import AuthStore from "../../stores/AuthStore";
import ModelStore from "../../stores/ModelStore";
// Our react components
import ModelSnippet from "../../components/model-snippet/model-snippet";
import LayoutUtils from "../../libs/LayoutUtils"
import SearchBar from 'material-ui-search-bar'
import ImageUploader from "../../widgets/image-uploader";


const StyledModelLayout = styled(Flex)`
.user-models-view input {
	color: black !important;
}

.editable-input {
    border-color: #fff;
    border-width: 1px;
    border-top-style: none;
    border-right-style: none;
    border-bottom-style: dashed;
    border-left-style: none;
    overflow: hidden;
    margin-bottom: 0;
    margin-top: 0;
}

.editable-input:hover {
    background-color: rgba(255, 255, 255, 0.14);
    border-bottom: solid;
    border-color: #fff;
    border-width: 1px;
}

.editable-input-dark {
    border-color: #333;
    border-width: 1px;
    border-top-style: none;
    border-right-style: none;
    border-bottom-style: dashed;
    border-left-style: none;
    overflow-x: hidden;
    overflow-y: auto;
    resize: "none";
    margin-bottom: 0;
    margin-top: 0;
}

.editable-input-dark:hover {
    background-color: rgba(50, 50, 50, 0.14);
    border-bottom: solid;
    border-color: #333;
    border-width: 1px;
}

textarea {
	resize: none;
}

textarea:focus {
    outline: none;
}

.dropzone-col {
	width: 100%;
}

.dz-preview.dz-processing.dz-error.dz-complete.dz-image-preview {
    width: 80%;
    height: 80%;
}

.dz-image {
    width: 100% !important;
    height: 100% !important;
}

.dz-image img {
    width: 100%;
    height: 100%;
}



.filepicker.dropzone.dz-clickable {
	border: none;
}

.profile-card img {
	width: auto !important;
    height: auto !important;
    min-width: 100% !important;
    min-height: 100% !important;
    max-width: 130% !important;
    max-height: 130% !important;
    flex-shrink: 0 !important;
}
`

class UserView extends Component {
	constructor() {
		super()
		var self = this;

		self.state = {
			'models': [],
			'editMode': false,
			'profile': null,
		}

		this.handleSearchBarChange = this.handleSearchBarChange.bind(this);
		this.handleUpdateUserFullName = this.handleUpdateUserFullName.bind(this);
		this.handleUpdateUserLocation = this.handleUpdateUserLocation.bind(this);
		this.handleUpdateUserHomepage = this.handleUpdateUserHomepage.bind(this);
		this.handleUpdateUserBio = this.handleUpdateUserBio.bind(this);
		this.handleToggleEdit = this.handleToggleEdit.bind(this);
		this.handleUploadUserPicture = this.handleUploadUserPicture.bind(this);
		this.updateProfile = this.updateProfile.bind(this);
		this.updateUserView = this.updateUserView.bind(this);

	}

	updateProfile(profile) {
		var self = this

		console.log('profile', profile);
		if(!profile.user_metadata) profile.user_metadata = {}
		self.setState({
			profile: profile
		});
	}

	updateUserView(userId) {
		var self = this;

		self.isAuthor = (userId == AuthStore.username());
		if(!self.isAuthor) {
			AuthStore.getProfileByUser(userId).then(self.updateProfile);
		}else{
			self.updateProfile(AuthStore.profile());
		}

		ModelStore.listModels(userId).then(function(models) {
            var modelHash = {};
            var modelAgg = [];
            for(var model of models) {
                // TODO: aggregate based on whichever tag comes later :)
                var uid = model.user + "/" + model.id;
                if(uid in modelHash) continue;
                modelHash[uid] = model;
                if(model.access == "public" || model.user == AuthStore.username() || AuthStore.username() == 'moxel') {
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

	componentDidMount() {
		var self = this;
		const {userId} = self.props.match.params;

		self.updateUserView(userId);
	}

	componentWillReceiveProps(nextProps) {
		var self = this;
		const {userId} = nextProps.match.params;
		console.log('will receive props', userId)
		self.updateUserView(userId);
	}

	handleUpdateUserFullName(e) {
		var self = this;

		AuthStore.updateProfile({
			user_metadata: {
				'full_name': e.target.value
			}
		}).then((profile) => {
			self.setState({
				profile: profile
			});
			self.notificationSystem.addNotification({
	          message: 'Successfully updated your name!',
	          level: 'success'
	        });
		})
	}

	handleUpdateUserLocation(e) {
		var self = this;

		AuthStore.updateProfile({
			user_metadata: {
				'location': e.target.value
			}
		}).then((profile) => {
			self.setState({
				profile: profile
			});
			self.notificationSystem.addNotification({
	          message: 'Successfully updated your location!',
	          level: 'success'
	        });
		})
	}

	handleUpdateUserHomepage(e) {
		var self = this;

		AuthStore.updateProfile({
			user_metadata: {
				'homepage': e.target.value
			}
		}).then((profile) => {
			self.setState({
				profile: profile
			});
			self.notificationSystem.addNotification({
	          message: 'Successfully updated your homepage!',
	          level: 'success'
	        });
		})
	}

	handleUpdateUserBio(e) {
		var self = this;

		AuthStore.updateProfile({
			user_metadata: {
				'bio': e.target.value
			}
		}).then((profile) => {
			self.setState({
				profile: profile
			});
			self.notificationSystem.addNotification({
	          message: 'Successfully updated your bio!',
	          level: 'success'
	        });
		})	
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

	handleToggleEdit() {
		var self = this;

		self.setState({
			editMode: !self.state.editMode
		})
	}

	handleUploadUserPicture(file) {
		var self = this;
        // for(var selector of ['.dz-error-mark', '.dz-error-message']) {
        //     var ignoreView = document.querySelector(selector);    
        //     ignoreView.outerHTML = '';
        // }
            
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener("load", function () {
            var url = reader.result;
            console.log('image loaded', url);
            AuthStore.updateProfile({
				user_metadata: {
					picture: url
				}
			}).then((profile) => {
				self.setState({
					profile: profile
				});
				self.notificationSystem.addNotification({
		          message: 'Successfully updated your profile picture!',
		          level: 'success'
		        });
			})	
        }, false);
	}

	render() {
		var self = this;
		const {userId} = self.props.match.params;

		function renderEditOrSaveButton() {
			if(!self.isAuthor) return null;
			if(self.state.editMode) {
				return (
					<div>
						<Divider/>
				    	<CardActions>
					      <FlatButton label="Save" onClick={self.handleToggleEdit}/>
					    </CardActions>	
					</div>
				);
		    }else{
		    	return (
		    		<div>
		    			<Divider/>
		    			<CardActions>
					      <FlatButton label="Edit" onClick={self.handleToggleEdit}/>
					    </CardActions>	
		    		</div>
		    	);
		    	
		    }
		}

		function renderUserFullName() {
			if(!self.state.profile) {
				return <div></div>;	
			}

			var fullName = self.state.profile.username;
			if(self.state.profile.user_metadata['full_name']) {
				fullName = self.state.profile.user_metadata['full_name'];
			}

			if(self.state.editMode) {
				return (
					<input id="author-fullname" defaultValue={fullName} className="editable-input" 
                            onBlur={self.handleUpdateUserFullName}/>
				);	
			}else{
				return fullName;
			}
		}

		function renderUserBio() {
			if(!self.state.profile) {
				return '';	
			}

			var bio = self.state.profile.user_metadata['bio']
			if(self.state.editMode) {
				return (
					<textarea id="author-bio" defaultValue={bio} className="editable-input-dark" 
                            onBlur={self.handleUpdateUserBio}/>
				);
			}else{
				return bio;
			}
		}

		function renderUserLocation() {
			if(!self.state.profile) {
				return '';	
			}

			var location = self.state.profile.user_metadata['location'];

			if(self.state.editMode) {
				return <ListItem primaryText={
					<input id="author-location" defaultValue={location} className="editable-input-dark" 
                            onBlur={self.handleUpdateUserLocation} />
				} leftIcon={<MapsPlace />} innerDivStyle={{paddingTop: 0, paddingBottom: 0}} />
			}else if(location) {
				return <ListItem primaryText={location} leftIcon={<MapsPlace />} onClick={()=>{window.open('https://www.google.com/maps/search/' + location)}}/>
			} else {
				return null;
			}
		}

		function renderUserEmail() {
			if(!self.state.profile) {
				return '';	
			}

			return self.state.profile.email;
		}

		function renderUserHomepage() {
			if(!self.state.profile) {
				return '';	
			}

			var homepage = self.state.profile.user_metadata['homepage'];

			if(self.state.editMode) {
				return <ListItem primaryText={
					<input id="author-homepage" defaultValue={homepage} className="editable-input-dark" 
                            onBlur={self.handleUpdateUserHomepage}/>
				} leftIcon={<SocialShare />}  innerDivStyle={{paddingTop: 0, paddingBottom: 0}} />
			}else if(homepage) {
				return <ListItem primaryText={homepage} leftIcon={<SocialShare />} onClick={()=>{window.open(homepage)}}/>
			} else {
				return null;
			}
		}

		function renderUserPicture() {
			if(!self.state.profile) return <img alt=""></img>;

			var profilePicture = self.state.profile ? self.state.profile.picture : '';
			if(self.state.profile.user_metadata.picture) {
				profilePicture = self.state.profile.user_metadata.picture;
			}

			function addThumbnailHandler(func) {
				func(profilePicture);
			}

			if(self.state.editMode) {
				return <ImageUploader uploadEventHandlers={{addedfile: self.handleUploadUserPicture}} addThumbnailHandler={addThumbnailHandler}></ImageUploader>
			}else{
				return <img src={profilePicture} alt="" style={{flexShrink: "0 !important"}}/>
			}
		}

		function renderUserProfile() {
			return (
				<Card style={{marginBottom: "20px"}}>
				    {/*<CardHeader
				      title={AuthStore.username()}
				      subtitle={userId}
				      avatar={AuthStore.picture()}
				    />*/}
				    <CardMedia className="profile-card" overlayContentStyle={{zIndex: 9999}} mediaStyle={{width: "264px", height: "264px", position: "relative", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden"}}
				      overlay={<CardTitle title={renderUserFullName()} subtitle={userId} />}
				    >
				      {renderUserPicture()}
				    </CardMedia>
				    {/*<CardTitle title="Card title" subtitle={userId} />*/}
				    <CardText>
				      {renderUserBio()}
				    </CardText>
				    <Divider/>
				    <List>
				      {renderUserLocation()}
				      <ListItem primaryText={renderUserEmail()} leftIcon={<CommunicationEmail />} />
				      {renderUserHomepage()}
				    </List>
				    {renderEditOrSaveButton()}
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
				<NotificationBanner ref={(notificationSystem) => {self.notificationSystem = notificationSystem;}} />
			</StyledModelLayout>
		)
	}
}

UserView.propTypes = {
    match: PropTypes.obj
};

export default UserView;