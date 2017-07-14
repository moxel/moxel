import React, {Component} from 'react';
import {Flex, FlexItem} from "layout-components";
import {Link} from "react-router-dom";
import styled from "styled-components";

// import "./header-button.css";
const StyledButton = styled(Flex)`
    margin: 0;
    padding: 0 10px;
    height: 100%;
    cursor: pointer;

    font-weight: 100;
    transition: 0.5s;
    color: #e2e2e2;
    text-decoration: none;

    :hover {
        color: white;
        text-shadow: 0 0 1px white;
        /*box-shadow: inset #353535 0 0 20px;*/
    }
`;

class HeaderButton extends Component {
    render() {
        const {children, ..._props} = this.props;
        return (
            <StyledButton row
                          align="center"
                          justify='center'
                          className="header-button"
                          component={Link} {..._props}
            >{children}</StyledButton>
        )
    }
}

export default (props) => (<FlexItem component={HeaderButton} {...props}/>);