import React from 'react';
import FixedWidthRow from './fixed-width-row';
import styled from "styled-components";

// import './tab-button-bar.css';
const StyledTabBar = styled(FixedWidthRow)`
    border-radius: 8px;
    border: solid 1px #dddddd;
    height: 40px;
    margin-bottom: 14px;

    > .tab-button:not(:last-child) {
        border-right: solid 1px #dddddd;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    > .tab-button:first-child {
        border-top-left-radius: 8.5px;
        border-bottom-left-radius: 8.5px;
    }

    > .tab-button:last-child {
        border-top-right-radius: 9px;
        border-bottom-right-radius: 9px;
    }

    .tab-button {
        cursor: pointer;
        padding: 4px 14px;
        user-select: none;
    }

    .tab-button:hover {
        background-color: #f6f8fb;
    }

    .tab-button:active {
        background-color: #c0c2c5;
    }

    .tab-button a {
        text-decoration: none;
        color: inherit;
    }
`;
import {Flex, FlexItem, FlexSpacer} from "layout-components";
export default function TabButtonBar({children, repoUrl, ..._props}) {
    return (
        <StyledTabBar className="tab-button-group" align="stretch" justify="left" {..._props}>
            <FlexItem className="tab-button" component={Flex} column justify="center"><a href={repoUrl}>ReadMe</a></FlexItem>
            <FlexItem className="tab-button" component={Flex} column justify="center"><a href={repoUrl + '/issues'}>Issues</a></FlexItem>
            <FlexItem className="tab-button" component={Flex} column justify="center"><a href={repoUrl + '/tags'}>Versions</a></FlexItem>
            <FlexItem className="tab-button" component={Flex} column justify="center"><a href={repoUrl + '/blob/master/LICENSE'}>License</a></FlexItem>
            <FlexSpacer/>
        </StyledTabBar>
    );
}