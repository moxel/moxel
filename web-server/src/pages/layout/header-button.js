import React, {Component} from 'react';
import {Flex, FlexItem} from "layout-components";
import {Link} from "react-router-dom";

import "./header-button.css";
class HeaderButton extends Component {
    render() {
        const {children, ..._props} = this.props;
        return (
            <Flex row
                  align="center"
                  justify='center'
                  className="header-button"
                  component={Link} {..._props}
            >{children}</Flex>
        )
    }
}

export default (props) => (<FlexItem component={HeaderButton} {...props}/>);