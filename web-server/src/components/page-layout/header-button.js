import React, {Component} from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import "./header-button.css";
class HeaderButton extends Component {
    render() {
        return (
            <Flex column align="center" justify='center'
                  className="header-button">{this.props.children}</Flex>
        )
    }
}

export default (props)=>(<FlexItem component={HeaderButton} {...props}/>);