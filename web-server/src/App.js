import React, { Component } from 'react';
import './App.css';
import {Flex, FlexItem} from "layout-components";
import PageHeader from "./components/page-layout/page-header";

class App extends Component {
  render() {
    return (
        <Flex fluid column>
            <PageHeader/>
            <FlexItem fluid>
                test
            </FlexItem>
        </Flex>
    );
  }
}

export default App;
