import React from 'react';
import styled from 'styled-components';

const StyledTag = styled('span')`
    cursor: pointer;
    border-radius: 4px;
    height: 11px;
    font-size: 0.8em;
    font-weight: 100;
    color: #4c0e07;
    border: 1px solid #666;
    background-color: #eee;
    padding: 2px 4px;

    :not(:last-child) {
        margin-right: 10px;
    }
`;
export default function SimpleTag({children}) {
    return <StyledTag className="simple-tag">{children}</StyledTag>
}
