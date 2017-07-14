// @flow
import React from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import FixedWidthRow from "../fixed-width-row";
import styled from "styled-components";
// import "./notification-banner.css";

const StyledBanner = styled(FixedWidthRow)`
    box-sizing: border-box;
    border-radius: 8px;
    border: solid 1px rgba(44, 32, 0, 0.09);
    background-color: rgba(24, 84, 191, 0.05);
    height: 48px;
    margin-bottom: 15px;
    padding: 14px;
    
    > {
        font: Lato;
        vertical-align: bottom;
    }
`;
type Props = {
    children?: any,
    onClose?: (key: any | null, data: any | null) => void,
    [key: string]: any,
};
export default function NotificationBanner({children, ..._props}: Props) {
    return (
        <StyledBanner className="notification-banner" align="stretch" justify="left" {..._props}>
            <FlexItem fluid>{children}</FlexItem>
            <FlexItem fixed className="controls">x</FlexItem>
        </StyledBanner>
    )
}