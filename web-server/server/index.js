#!/usr/bin/env babel-node
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import HTMLLoader from "./HTMLLoader";

const app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.use('/$', HTMLLoader);
app.use(express.static('build'))
app.use('/', HTMLLoader);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
app.on('error', function onError(error) {
        if (error.syscall !== 'listen') throw error;
        const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
        if (error.code === 'EACCES') {
            console.error(`${bind} requires elevated privileges`);
        } else if (error.code === 'EADDRINUSE') {
            console.error(`${bind} is already in use`);
        }
        throw error;
    }
);
