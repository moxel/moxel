// @flow
import React, {Component} from 'react';
import "isomorphic-fetch";

type Props = {
    /* GitHub username */
    username?: string,
    /* size of image in pixels */
    size: number,
    /* url of the profile image */
    url: string,
    /* style object to pass on. */
    style?: Object,
    [key: string]: any,
};

export default class ProfileImage extends Component<void, Props, State> {
    render() {
        const {style, username, size, url, ..._props} = this.props;
        return (
            <img alt={username}
                 src={url}
                 style={{
                     ...style,
                     height: size + "px",
                     wusernameth: size + "px",
                     borderRadius: (size / 2) + "px",
                     fontSize: "1em"
                 }} {..._props}/>
        )
    }
}
