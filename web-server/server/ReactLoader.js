// @flow
import React from "react";
import {renderToString} from 'react-dom/server'
import {StaticRouter} from "react-router-dom";
import {ServerStyleSheet, StyleSheetManager} from 'styled-components'
import Root from "../src/Root";
import fs from 'fs';
import {StyleSheet} from 'react-primitives';

const HTML = fs.readFileSync(__dirname + '/../public/index.html').toString();

// todo: add index.html loading
export default function ReactLoader(req, res, next) {
    const location = req.url.toString();

    // const sheet = new ServerStyleSheet();
    // const html = renderToString(sheet.collectStyles(
    //     <StaticRouter location={location} context={{}}>
    //         <Root/>
    //     </StaticRouter>
    // ));
    // const css = sheet.getStyleTags();
    const html = renderToString(
        <StaticRouter location={location} context={{}}>
            <Root/>
        </StaticRouter>
    );
    const css = StyleSheet
        .getStyleSheets()
        .map(({id, textContent}) => `<style id=${id}>${textContent}</style>`)
        .join('');
    res.status(200).send(
        HTML
            .replace(/<!-- SSR:CSS -->/, css)
            .replace(/<!-- SSR:HTML -->/, html)
    );
}
