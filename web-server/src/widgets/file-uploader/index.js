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
    }

    height: 300px;
    width: auto;
`

var defaultComponentConfig = {
    iconFiletypes: ['*'],
    showFiletypeIcon: true,
    postUrl: 'no-url'
};

var djsConfig = {
    method: 'put',
    headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': null,
        'X-Requested-With': null
    },
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