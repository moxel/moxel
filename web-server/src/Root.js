import React from "react";
import styled from "styled-components";
// import {Route} from "react-router-dom";
// import SearchViews from './pages/search-view';
// import ModelViews from './pages/model-view';
// import DatasetViews from './pages/dataset-view';
// import PageLayout from "./pages/layout/page-layout";

const StyledDiv = styled.div`
    box-sizing: border-box;
    font-size: 30px;
    color: white;
    position: relative;
    background-color: red;
`;
export default function Root() {
    return (
        <StyledDiv style={{color: "green"}}>test this 3</StyledDiv>
    );
}
{/*<PageLayout>*/}
{/*<Route exact path="/" component={() => <div>root page</div>}/>*/}
{/*{SearchViews}*/}
{/*{ModelViews}*/}
{/*{DatasetViews}*/}
{/*</PageLayout>*/}
