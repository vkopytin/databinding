import * as cookieParser from 'cookie-parser';
import express = require('express');
import * as helmet from 'helmet'; // Security


const expressConfig = (app: express.Application) => {
    app.all('*', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    app.use(helmet());
    app.use(cookieParser());

    app.use((req, res, next) => {
        next();
    });

    return app;
};

export { expressConfig };
