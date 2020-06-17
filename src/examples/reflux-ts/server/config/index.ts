import express = require('express');
import * as _ from 'underscore';
import { devConfig } from './dev';
import { expressConfig } from './express';
import { extraConfig } from './extra';
import { routesConfig } from './routes';


export = (app: express.Application) => {
    expressConfig(app);
    
    devConfig(app);

    extraConfig(app);
    routesConfig(app);

    return app;
};
