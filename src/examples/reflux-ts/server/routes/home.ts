import * as express from 'express';
import * as _ from 'underscore';


const home = express.Router();

// general requests
home.get('/sync/*', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.json({ custom: 'response' });
});

export = home;
