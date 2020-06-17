import express = require('express');
import mainRoutes = require('../routes');


const routesConfig = (app: express.Application) => {

    // Setting routes
    mainRoutes(app);

    return app;
};

export { routesConfig };
