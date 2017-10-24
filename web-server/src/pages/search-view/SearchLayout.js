import React from 'react';
import {Flex, FlexItem} from "layout-components";
import FixedWidthRow from "../../components/fixed-width-row";
import styled from "styled-components";

const StyledSearchLayout = styled(Flex)`
    height: 100%;
    padding-top: 8px;

    .catalogue-hero {
      margin-bottom: 40px;
      margin-top: 80px;
    }

    .catalogue-body-container {
    }

    .catalogue-body-container .model-snippet {
      width: 100%;
    }

`;

export default function SearchLayout(props) {
    return (
        <StyledSearchLayout column className="catalogue-layout-container">
            <Flex component={FlexItem}
                  fluid
                  width="100%"
                  className="catalogue-body-container">{
                props.children.map((child) => <div
                    justify="stretch"
                    height="100%">{child}</div>)
            }</Flex>
        </StyledSearchLayout>
    )
}
