import express = require('express');
import routesHome = require('./home');


function mainRoutes(app: express.Application) {
    app.use('/', routesHome);
}

export = mainRoutes;
