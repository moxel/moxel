// @flow
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {Flex, FlexItem, FlexSpacer} from "layout-components";
import styled from "styled-components";
import DropzoneComponent from 'react-dropzone-component';

const StyledFileUploader = styled(FlexItem)`
    .filepicker-file-icon::before {
        border: solid 2px #ccc;
    }

    .filepicker.dropzone.dz-clickable {
        background: none;
        height: 100%;
        width: 300px;
        margin-left: auto;
        margin-right: auto;
    }

    {
        text-align: center;
    }

    .dropzone-col {
        width: 100%;
        height: 100%;
        text-align: center;
        overflow: hidden;
    }

    .dropzone.dz-clickable {
        cursor: pointer;
        position: relative;
    }

    .dropzone .dz-message {
        display: block !important;
        text-align: center;
        margin: 0;
        position: absolute !important;
        z-index: 999;
        color: rgba(255, 255, 255, 0);
        height: 100%;
        width: 100%;
        vertical-align: middle;
        background: rgba(255, 255, 255, 0);
        -webkit-transition: background-color .5s;
        transition: background-color .5s;
        left: 0;
        top: 0;
    }

    .dropzone .dz-message:hover {
        background: rgba(255, 255, 255, 0.39);
    }
    

    .dz-details {
        display: none;
    }

    .dropzone .dz-preview .dz-image {
        border-radius: 20px;
        width: 120px;
        height: 120px;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }

    .dz-image img {
        width: auto !important;
        height: auto !important;
        min-width: 100% !important;
        min-height: 100% !important;
        max-width: 130% !important;
        max-height: 130% !important;
        flex-shrink: 0 !important;
    }

    .dropzone .dz-preview.dz-image-preview {
        background: white;
        margin: 0;
        left: 0;
        top: 0;
        position: absolute !important;
        height: 100% !important;
        width: 100% !important;
    }


    height: 300px;
    width: auto;
`

var defaultComponentConfig = {
    iconFiletypes: ['*'],
    showFiletypeIcon: true,
    postUrl: 'no-url',
};

var djsConfig = {
    method: 'put',
    headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': null,
        'X-Requested-With': null
    },
    thumbnailWidth: 300,
    thumbnailHeight: 300,
};

// type Props {
//     uploadEventHandlers: 
// }

export default function FileUploader({uploadEventHandlers, addThumbnailHandler, componentConfig}: props) {
    var theDropzone = null;
    var theFile = null;

    if(!componentConfig) {
        componentConfig = defaultComponentConfig;
    }

    return (
        <StyledFileUploader>
            <div className="dropzone-col">
                <DropzoneComponent config={componentConfig}
                    eventHandlers={{
                        addedfile: function(file) {
                            if(theFile) {
                                theDropzone.removeFile(theFile);
                            }
                            theFile = file;
                            if(file.mock) return;
                            uploadEventHandlers.addedfile(file);
                        },
                        init: function(dropzone) {
                            theDropzone = dropzone;
                            if(addThumbnailHandler) {
                                addThumbnailHandler((src) => {
                                    var mockFile = {
                                        name: "image-name-example",
                                        size: null,
                                        mock: true
                                    };
                                    theDropzone.emit("addedfile", mockFile);
                                    theDropzone.emit("thumbnail", mockFile, src);
                                    theDropzone.emit("complete", mockFile);
                                });
                            }
                        }
                    }}
                   djsConfig={djsConfig} />           
            </div>
        </StyledFileUploader>
    )
}