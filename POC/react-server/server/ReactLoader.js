import React from "react";
import {renderToString} from 'react-dom/server'

const Page = (
    <html>
    <header>
        <script></script>
    </header>
    <body><h1>this is great!</h1></body>
    </html>
);

export default function ReactLoader(req, res, next) {
    console.log(req, res, next);
    res.send(200, renderToString(Page))
}
