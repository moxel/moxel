// @flow
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import styled from "styled-components";
import FileUploader from '../file-uploader';

var componentConfig = {
    iconFiletypes: ['.jpg', '.png'],
    showFiletypeIcon: true,
    postUrl: 'no-url'
};

export default function ImageUploader({uploadEventHandlers, addThumbnailHandler}: props) {
    return <FileUploader uploadEventHandlers={uploadEventHandlers} addThumbnailHandler={addThumbnailHandler} componentConfig={componentConfig}></FileUploader>
}