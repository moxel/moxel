import React from "react";
import {renderToString} from 'react-dom/server'

const Page = (
    <html>
    <head>
        <script></script>
    </head>
    <body><h1>this is great!</h1></body>
    </html>
);

export default function ReactLoader(req, res, next) {
    res.status(200).send(renderToString(Page))
}
