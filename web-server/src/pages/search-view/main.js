import React, {Component} from 'react';
import './App.css';
import {Flex, FlexItem} from "layout-components";

import {store} from '../../mock-data';
import ModelListSection from "./model-snippet";
class Main extends Component {
    render() {
        return (
            <Flex fill column className="catalogue-list-view">
                <h1 className="catalogue-hero">Search For Your Favorite Model</h1>
                <Flex row className="catalogue-search-bar">
                    <FlexItem fluid component='input' placeholder="Search 1,280 models"/>
                    <FlexItem fixed>test</FlexItem>
                </Flex>
                <FlexItem className="model-list-container">
                    <ModelListSection name="Newest">{
                        store.models.newest.map(() => <div/>)
                    }</ModelListSection>
                </FlexItem>
            </Flex>
        );
    }
}

export default Main;

