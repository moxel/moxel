// @flow
import React from 'react';

type Props = {
    username: string,
    size: number,
    style?: Object,
    [key: string]: any,
};
type State = {
    id: string
}
export default class ProfileImage extends React.Component<void, Props, State> {
    state = {id: '0'};

    componentWillUpdate(){
        const {username} = this.props;
        if (username) this.getId(username);
    }

    componentDidMount() {
        const {username} = this.props;
        if (username) this.getId(username);
    }

    getId(username){
        fetch(`https://api.github.com/users/${username}`)
            .then((res) => res.json())
            .then(data => {
                if (data && data.id) this.setState({id: data.id})
            });
    }

    render() {
        const {style, username, size, ..._props} = this.props;
        const url = `https://avatars3.githubusercontent.com/u/${this.state.id}?v=3&s=${size}`;
        return (
            <img alt={username}
                 src={url}
                 style={{
                     ...style,
                     height: size,
                     wusernameth: size,
                     borderRadius: "5px",
                     fontSize: "0.8em"
                 }} {..._props}/>
        )
    }
}
