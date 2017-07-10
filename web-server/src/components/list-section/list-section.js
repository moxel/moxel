// @flow
import React, {Component} from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import "./list-section.css";

type Props = {
    header: any,
    children?: any,
}
class ListSection extends Component<void, Props, void> {
    render() {
        const {header, children} = this.props;
        return (
            <FlexItem className="list-section" component={Flex} row align="flex-end">
                <FlexItem className="header">{header}</FlexItem>
                <FlexSpacer/>
                <FlexItem className="controls">{children}</FlexItem>
            </FlexItem>
        );
    }
}

export default ListSection;
