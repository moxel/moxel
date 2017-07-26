import React from 'react';
import {Flex, FlexItem} from "layout-components";
import FixedWidthRow from "../../components/fixed-width-row";
import SearchBar from "../../components/search-bar";
import styled from "styled-components";

const StyledSearchLayout = styled(Flex)`
    height: 100%;

    .catalogue-hero {
      margin-bottom: 40px;
      margin-top: 80px;
    }

    .catalogue-search-bar {
      margin-bottom: 20px;
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
            <FixedWidthRow component="h4" className="catalogue-hero"
            >Discover Models</FixedWidthRow>
            {/*<FixedWidthRow component={SearchBar}
                           className="catalogue-search-bar"
                           placeholder="Search 15,291 models"/>*/}
            <Flex component={FlexItem}
                  fluid
                  width="100%"
                  className="catalogue-body-container">{
                props.children.map((child) => <FixedWidthRow
                    justify="stretch"
                    height="100%">{child}</FixedWidthRow>)
            }</Flex>
        </StyledSearchLayout>
    )
}