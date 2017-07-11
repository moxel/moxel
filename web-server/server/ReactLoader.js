// @flow
import React from "react";
import {renderToString} from 'react-dom/server'
import {StaticRouter} from "react-router-dom";
import Root from "../src/Root";

export default function ReactLoader(req, res, next) {
    const location = req.url.toString();
    res.status(200).send(renderToString(
        <StaticRouter location={location} context={{}}>
            <Root/>
        </StaticRouter>
    ))
}
