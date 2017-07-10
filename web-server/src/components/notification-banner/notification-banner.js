// @flow
import React from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import FixedWidthRow from "../fixed-width-row";
import "./notification-banner.css";

type Props = {
    children?: any,
    onClose?: (key: any | null, data: any | null) => void,
    [key: string]: any,
};
export default function NotificationBanner({children, ..._props}: Props) {
    return (
        <FixedWidthRow className="notification-banner" align="stretch" justify="left" {..._props}>
            <FlexItem fluid>{children}</FlexItem>
            <FlexItem fixed className="controls">x</FlexItem>
        </FixedWidthRow>
    )
}