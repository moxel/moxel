import React, {Component} from 'react';
import {store} from "../mock-data";

const size = "30px";
class ProfileImage extends Component {
    render() {
        const {style, ..._props} = this.props;
        return (
            <img alt={store.account.name}
                 src={store.account.profileImage}
                 style={{...style, height: size, width: size, borderRadius: "5px"}} {..._props}/>
        )
    }
}

export default ProfileImage;