import React from 'react';
import FixedWidthRow from '../pages/layout/fixed-width-row';

import './tab-button-bar.css';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
export default function TabButtonBar({children, repoUrl, ..._props}) {
    return (
        <FixedWidthRow className="tab-button-group" align="stretch" justify="left" {..._props}>
            <FlexItem className="tab-button" component={Flex} column justify="center"><a href={repoUrl}>ReadMe</a></FlexItem>
            <FlexItem className="tab-button" component={Flex} column justify="center"><a href={repoUrl + '/issues'}>Issues</a></FlexItem>
            <FlexItem className="tab-button" component={Flex} column justify="center"><a href={repoUrl + '/tags'}>Versions</a></FlexItem>
            <FlexItem className="tab-button" component={Flex} column justify="center"><a href={repoUrl + '/blob/master/LICENSE'}>License</a></FlexItem>
            <FlexSpacer/>
        </FixedWidthRow>
    );
}