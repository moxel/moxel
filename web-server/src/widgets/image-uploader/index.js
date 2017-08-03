// @flow
import React from 'react';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import styled from "styled-components";
import DropzoneComponent from 'react-dropzone-component';

const StyledImageUploader = styled(FlexItem)`
    .filepicker-file-icon::before {
        border: solid 2px #ccc;
    }

    .filepicker.dropzone.dz-clickable {
        background: none;
        height: 100%;
        width: auto;
    }

    height: 300px;
    width: auto;
`

var componentConfig = {
    iconFiletypes: ['.jpg', '.png'],
    showFiletypeIcon: true,
    postUrl: 'no-url'
};

var djsConfig = {
    method: 'put',
    headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': null,
        'X-Requested-With': null
    }
};

// type Props {
//     uploadEventHandlers: 
// }

export default function ImageUploader({uploadEventHandlers}: props) {
    return (
        <StyledImageUploader>
            <DropzoneComponent config={componentConfig}
               eventHandlers={uploadEventHandlers}
               djsConfig={djsConfig} />           
        </StyledImageUploader>
    )
}