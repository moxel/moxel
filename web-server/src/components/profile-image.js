import React, {Component} from 'react';
import {store} from "../mock-data";

const size = "24px";
class ProfileImage extends Component {
    render() {
        const {style, ..._props} = this.props;
        return (
            <img alt={store.account.name}
                 src={store.account.profileImage}
                 style={{...style, height: size, width: size, borderRadius: "5px", fontSize: "0.8em"}} {..._props}/>
        )
    }
}

export default ProfileImage;