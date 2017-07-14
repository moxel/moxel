import React from "react";
import styled from "styled-components";
import {Route} from "react-router-dom";
import {View, Text, StyleSheet} from 'react-primitives';
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

const TestStyle = StyleSheet.create({
    foo: {
        color: "red",
        backgroundColor: 'green'
    }
});
export default function Root() {
    return (
        <View>
            <Route exact path="/" component={() => <Text style={TestStyle.foo}>root page</Text>}/>
            <Route exact path="/test-1" component={() => <Text>test-1 page</Text>}/>
        </View>
        // <StyledDiv style={{color: "green"}}>test this 3</StyledDiv>
    );
}
{/*<PageLayout>*/
}
{/*<Route exact path="/" component={() => <div>root page</div>}/>*/
}
{/*{SearchViews}*/
}
{/*{ModelViews}*/
}
{/*{DatasetViews}*/
}
{/*</PageLayout>*/
}
